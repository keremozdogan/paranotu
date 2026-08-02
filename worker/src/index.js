/**
 * ============================================================================
 *  ParaNotu Ingestion Worker — giriş noktası
 * ============================================================================
 *  İki giriş var:
 *    scheduled()  → cron tetikler, kaynakları çeker, queue'ya yollar
 *    queue()      → kayıtları normalize/dedup/cluster eder, D1'e yazar
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  BU WORKER HABER YAYIMLAMAZ
 *  ────────────────────────────────────────────────────────────────────────
 *  Hattın sonunda oluşan en "ileri" şey `editorial_queue` kaydıdır — yani
 *  bir editöre "buna bakmalısın" demek. Yayımlanmış, indexlenebilir bir
 *  ParaNotu haberi ancak insan onayıyla oluşur (bkz. migrations CHECK
 *  kısıtı: approved_by NULL ise is_indexable 1 olamaz).
 * ============================================================================
 */

import { activeSources, groupsForCron, SOURCES } from "./sources.js";
import { fetchSource } from "./ingest.js";
import {
  CLUSTER_THRESHOLD,
  clusterScore,
  computeImportance,
  contentHash,
  detectSection,
  extractEntities,
  extractSymbols,
  shouldQueueForEditorial,
  titleFingerprint,
} from "./pipeline.js";

const uid = () => crypto.randomUUID();
const nowIso = () => new Date().toISOString();

/* ========================================================================== */
/*  CRON                                                                      */
/* ========================================================================== */

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleScheduled(event, env));
  },

  async queue(batch, env) {
    if (batch.queue.endsWith("-dlq")) return handleDeadLetter(batch, env);
    return handleIngestQueue(batch, env);
  },
};

async function handleScheduled(event, env) {
  const cron = event.cron;

  /* Bakım görevleri — veri çekmez. */
  if (cron === "0 2 * * *") return runEvergreenFreshnessCheck(env);
  if (cron === "0 3 1 * *") return runMonthlyReviewFlags(env);

  const groups = groupsForCron(cron);
  if (groups.length === 0) return;

  const runId = uid();
  const startedAt = nowIso();

  const sources = activeSources(env).filter((s) => groups.includes(s.group));

  /* Kaynak tanımlı değilse sessizce çık — boş çalışma kaydı üretme. */
  if (sources.length === 0) {
    console.log(`[cron ${cron}] etkin kaynak yok (sources.js boş)`);
    return;
  }

  await env.DB.prepare(
    `INSERT INTO ingestion_runs (id, trigger, started_at, sources_total)
     VALUES (?, ?, ?, ?)`,
  )
    .bind(runId, cron, startedAt, sources.length)
    .run();

  const health = await loadSourceHealth(env);
  const maxFailures = Number(env.MAX_CONSECUTIVE_FAILURES ?? "5");

  let ok = 0;
  let failed = 0;
  let fetched = 0;

  /* Kaynaklar PARALEL çekilir; biri patlarsa diğerleri etkilenmez. */
  const results = await Promise.allSettled(
    sources
      .filter((s) => {
        const h = health.get(s.id);
        /* Sürekli hata veren kaynağı geçici olarak atla. */
        return !h || h.is_enabled === 1;
      })
      .map(async (source) => {
        const result = await fetchSource(source);
        return { source, result };
      }),
  );

  const messages = [];

  for (const settled of results) {
    if (settled.status === "rejected") {
      failed += 1;
      continue;
    }

    const { source, result } = settled.value;

    if (!result.ok) {
      failed += 1;
      await recordSourceFailure(env, source, result.error, maxFailures);
      continue;
    }

    ok += 1;
    fetched += result.items.length;
    await recordSourceSuccess(env, source, result.items.length);

    /* Kuyruğa gönder — işleme burada YAPILMAZ, cron hızlı bitmeli. */
    for (const item of result.items) {
      messages.push({
        body: { runId, source: { id: source.id, name: source.name, trust: source.trust, section: source.section, redistribution: source.redistribution }, item },
      });
    }
  }

  /* Queue toplu gönderim sınırı 100. */
  for (let i = 0; i < messages.length; i += 100) {
    await env.INGEST_QUEUE.sendBatch(messages.slice(i, i + 100));
  }

  await env.DB.prepare(
    `UPDATE ingestion_runs
     SET finished_at = ?, sources_ok = ?, sources_failed = ?, items_fetched = ?
     WHERE id = ?`,
  )
    .bind(nowIso(), ok, failed, fetched, runId)
    .run();

  console.log(`[cron ${cron}] ${ok} ok, ${failed} hata, ${fetched} kayıt kuyruğa alındı`);
}

/* ========================================================================== */
/*  QUEUE TÜKETİCİSİ                                                          */
/* ========================================================================== */

async function handleIngestQueue(batch, env) {
  for (const message of batch.messages) {
    try {
      await processItem(env, message.body);
      message.ack();
    } catch (error) {
      /* Geçici hata olabilir — retry et. 3 denemeden sonra DLQ'ya düşer. */
      console.error(`[queue] işlenemedi: ${error?.message ?? error}`);
      message.retry();
    }
  }
}

/**
 * Tek bir ham kaydı işler:
 *   1. Normalize + hash
 *   2. Tekrar kontrolü (aynı kayıt zaten var mı?)
 *   3. Olay kümesine yerleştir (aynı olayı anlatan başka kaynak var mı?)
 *   4. Önem puanı
 *   5. Eşiği geçerse editoryal kuyruğa öneri bırak
 */
async function processItem(env, { runId, source, item }) {
  const text = `${item.title} ${item.excerpt ?? ""}`;
  const hash = await contentHash(item.title, item.excerpt ?? "");
  const fingerprint = titleFingerprint(item.title);

  /* --- 2. TEKRAR KONTROLÜ ------------------------------------------------ */
  /* (a) aynı kaynaktan aynı external_id → zaten var
     (b) herhangi bir kaynaktan aynı content_hash → birebir tekrar */
  const existing = await env.DB.prepare(
    `SELECT id FROM external_feed_items
     WHERE (source_id = ? AND external_id = ?) OR content_hash = ?
     LIMIT 1`,
  )
    .bind(source.id, item.externalId, hash)
    .first();

  if (existing) {
    await env.DB.prepare(
      `UPDATE ingestion_runs SET items_duplicate = items_duplicate + 1 WHERE id = ?`,
    )
      .bind(runId)
      .run();
    return;
  }

  const entities = extractEntities(text);
  const symbols = extractSymbols(text);
  const section = detectSection(text, source.section);

  /* --- 3. OLAY KÜMELEME -------------------------------------------------- */
  const clusterId = await findOrCreateCluster(env, {
    fingerprint,
    title: item.title,
    section,
    entities,
    symbols,
    publishedAt: item.publishedAt,
  });


  const cluster = await env.DB.prepare(`SELECT * FROM event_clusters WHERE id = ?`)
    .bind(clusterId)
    .first();

  /* --- 4. ÖNEM PUANI ----------------------------------------------------- */
  const importance = computeImportance({
    sourceTrust: source.trust,
    entities,
    symbols,
    publishedAt: item.publishedAt,
    sourceCount: cluster?.source_count ?? 1,
  });

  /* --- KAYIT ------------------------------------------------------------- */
  await env.DB.prepare(
    `INSERT INTO external_feed_items (
       id, source_id, source_name, external_id, canonical_url, title,
       content_excerpt, published_at, fetched_at, cluster_id, content_hash,
       title_fingerprint, section, entities, symbols, importance_score,
       source_trust, redistribution, status, is_indexable
     ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'clustered',0)`,
  )
    .bind(
      uid(),
      source.id,
      source.name,
      item.externalId,
      item.url,
      item.title,
      /* Kaynak yalnızca bağlantıya izin veriyorsa özeti bile saklamıyoruz. */
      source.redistribution === "link_only" ? null : item.excerpt,
      item.publishedAt,
      nowIso(),
      clusterId,
      hash,
      fingerprint,
      section,
      JSON.stringify(entities),
      JSON.stringify(symbols),
      importance,
      source.trust,
      source.redistribution,
    )
    .run();

  /* Küme istatistiklerini tazele. */
  await env.DB.prepare(
    `UPDATE event_clusters SET
       last_seen_at = ?,
       item_count = item_count + 1,
       source_count = (SELECT COUNT(DISTINCT source_id) FROM external_feed_items WHERE cluster_id = ?),
       max_importance = MAX(max_importance, ?)
     WHERE id = ?`,
  )
    .bind(nowIso(), clusterId, importance, clusterId)
    .run();

  await env.DB.prepare(
    `UPDATE ingestion_runs SET items_new = items_new + 1 WHERE id = ?`,
  )
    .bind(runId)
    .run();

  /* --- 5. EDİTORYAL KUYRUK ---------------------------------------------- */
  const refreshed = await env.DB.prepare(`SELECT * FROM event_clusters WHERE id = ?`)
    .bind(clusterId)
    .first();

  if (shouldQueueForEditorial(refreshed)) {
    const already = await env.DB.prepare(
      `SELECT id FROM editorial_queue WHERE cluster_id = ? AND status IN ('pending','in_progress') LIMIT 1`,
    )
      .bind(clusterId)
      .first();

    if (!already) {
      await env.DB.prepare(
        `INSERT INTO editorial_queue (id, cluster_id, suggested_title, suggested_section, importance_score, source_count)
         VALUES (?,?,?,?,?,?)`,
      )
        .bind(
          uid(),
          clusterId,
          refreshed.representative_title,
          refreshed.section,
          refreshed.max_importance,
          refreshed.source_count,
        )
        .run();

      await env.DB.prepare(`UPDATE event_clusters SET status = 'queued' WHERE id = ?`)
        .bind(clusterId)
        .run();
    }
  }
}

/**
 * Aynı olayı anlatan bir küme var mı?
 *
 * Son 48 saatteki kümelerin parmak izleriyle karşılaştırır. Eşik üstü
 * benzerlikte mevcut kümeye katılır, yoksa yeni küme açar.
 *
 * 48 saat penceresi bilinçli: aynı başlık altı ay sonra tekrar geçerse
 * (örn. "TCMB faiz kararı") o AYRI bir olaydır, aynı kümeye girmemeli.
 */
async function findOrCreateCluster(env, { fingerprint, title, section, entities, symbols, publishedAt }) {
  const since = new Date(Date.now() - 48 * 3600000).toISOString();

  const candidates = await env.DB.prepare(
    `SELECT c.id, c.representative_title, c.entities, c.symbols, f.title_fingerprint
     FROM event_clusters c
     JOIN external_feed_items f ON f.cluster_id = c.id
     WHERE c.last_seen_at >= ?
     GROUP BY c.id
     LIMIT 200`,
  )
    .bind(since)
    .all();

  const safeParse = (value) => {
    try {
      const parsed = JSON.parse(value ?? "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  /* En yüksek skorlu kümeyi seç — ilk eşleşeni değil.
     İlk eşleşen kuralı, birbirine yakın iki olayda yanlış kümeye
     yerleştirebilir. */
  let bestId = null;
  let bestScore = 0;

  for (const row of candidates.results ?? []) {
    const score = clusterScore(
      { fingerprint, entities, symbols },
      {
        fingerprint: row.title_fingerprint ?? "",
        entities: safeParse(row.entities),
        symbols: safeParse(row.symbols),
      },
    );
    if (score > bestScore) {
      bestScore = score;
      bestId = row.id;
    }
  }

  if (bestId && bestScore >= CLUSTER_THRESHOLD) return bestId;

  const id = uid();
  await env.DB.prepare(
    `INSERT INTO event_clusters
       (id, representative_title, section, entities, symbols, first_seen_at, last_seen_at)
     VALUES (?,?,?,?,?,?,?)`,
  )
    .bind(
      id,
      title,
      section,
      JSON.stringify(entities),
      JSON.stringify(symbols),
      publishedAt ?? nowIso(),
      nowIso(),
    )
    .run();

  return id;
}

/* ========================================================================== */
/*  ÖLÜ MEKTUP KUYRUĞU                                                        */
/* ========================================================================== */

/**
 * Üç denemeyi de geçemeyen kayıtlar buraya düşer.
 * Sessizce YUTULMAZ — loglanır ve kaynak sağlığına işlenir ki bir kaynağın
 * biçimi bozulduğunda fark edilsin.
 */
async function handleDeadLetter(batch, env) {
  for (const message of batch.messages) {
    const sourceId = message.body?.source?.id ?? "bilinmiyor";
    console.error(`[DLQ] ${sourceId}: ${message.body?.item?.title ?? "?"}`);

    await env.DB.prepare(
      `UPDATE source_health
       SET last_error = ?, last_failure_at = ?, updated_at = ?
       WHERE source_id = ?`,
    )
      .bind("queue işleme başarısız (DLQ)", nowIso(), nowIso(), sourceId)
      .run()
      .catch(() => {});

    message.ack();
  }
}

/* ========================================================================== */
/*  KAYNAK SAĞLIĞI                                                            */
/* ========================================================================== */

async function loadSourceHealth(env) {
  const rows = await env.DB.prepare(`SELECT * FROM source_health`).all();
  return new Map((rows.results ?? []).map((r) => [r.source_id, r]));
}

async function recordSourceSuccess(env, source, itemCount) {
  await env.DB.prepare(
    `INSERT INTO source_health (source_id, source_name, last_success_at, consecutive_failures, total_items, trust_score, is_enabled, updated_at)
     VALUES (?,?,?,0,?,?,1,?)
     ON CONFLICT(source_id) DO UPDATE SET
       last_success_at = excluded.last_success_at,
       consecutive_failures = 0,
       total_items = source_health.total_items + excluded.total_items,
       is_enabled = 1,
       updated_at = excluded.updated_at`,
  )
    .bind(source.id, source.name, nowIso(), itemCount, source.trust, nowIso())
    .run();
}

async function recordSourceFailure(env, source, error, maxFailures) {
  await env.DB.prepare(
    `INSERT INTO source_health (source_id, source_name, last_failure_at, last_error, consecutive_failures, trust_score, updated_at)
     VALUES (?,?,?,?,1,?,?)
     ON CONFLICT(source_id) DO UPDATE SET
       last_failure_at = excluded.last_failure_at,
       last_error = excluded.last_error,
       consecutive_failures = source_health.consecutive_failures + 1,
       -- Üst üste hata veren kaynak otomatik devre dışı kalır; böylece
       -- ölü bir besleme her cron'da boşuna denenmez.
       is_enabled = CASE WHEN source_health.consecutive_failures + 1 >= ? THEN 0 ELSE 1 END,
       updated_at = excluded.updated_at`,
  )
    .bind(source.id, source.name, nowIso(), error, source.trust, nowIso(), maxFailures)
    .run();
}

/* ========================================================================== */
/*  EVERGREEN TAZELİK KONTROLÜ                                                */
/* ========================================================================== */

/**
 * ⚠️ Bu iş İÇERİĞİ DEĞİŞTİRMEZ.
 * Yalnızca `freshness_status` ve `last_checked_at` alanlarını günceller —
 * yani "buna bakılmalı" işareti koyar. `updated_at` ve dolayısıyla
 * structured data'daki `dateModified` ASLA burada değişmez.
 *
 * Sahte güncellik üretmemenin teknik karşılığı budur (spec §9).
 */
async function runEvergreenFreshnessCheck(env) {
  const today = nowIso();

  const due = await env.DB.prepare(
    `SELECT id, next_review_at FROM evergreen_guides
     WHERE status = 'published' AND next_review_at IS NOT NULL AND next_review_at <= ?`,
  )
    .bind(today)
    .all();

  for (const guide of due.results ?? []) {
    await env.DB.prepare(
      `UPDATE evergreen_guides
       SET freshness_status = 'review_due', last_checked_at = ?
       WHERE id = ? AND freshness_status = 'current'`,
    )
      .bind(today, guide.id)
      .run();
  }

  /* Kontrol edildi ama değişiklik gerekmedi → sadece tarih damgası. */
  await env.DB.prepare(
    `UPDATE evergreen_guides SET last_checked_at = ?
     WHERE status = 'published' AND (last_checked_at IS NULL OR last_checked_at < ?)`,
  )
    .bind(today, new Date(Date.now() - 86400000).toISOString())
    .run();

  console.log(`[evergreen] ${due.results?.length ?? 0} rehber kontrol için işaretlendi`);
}

/** Ayın 1'i: aylık tetikleyicili rehberleri "kontrol zamanı" yapar. */
async function runMonthlyReviewFlags(env) {
  const result = await env.DB.prepare(
    `UPDATE evergreen_guides
     SET freshness_status = 'review_due', last_checked_at = ?
     WHERE status = 'published'
       AND id IN (SELECT guide_id FROM update_schedules WHERE trigger_type = 'monthly' AND is_active = 1)`,
  )
    .bind(nowIso())
    .run();

  console.log(`[evergreen] aylık kontrol: ${result.meta?.changes ?? 0} rehber işaretlendi`);
}
