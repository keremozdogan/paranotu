/**
 * ============================================================================
 *  ÇEKİM KATMANI — beslemeleri oku, ham kayıtları üret
 * ============================================================================
 *  Bu dosya SADECE ağdan okur ve ayrıştırır. Veritabanına yazmaz, karar
 *  vermez. Kararlar pipeline.js ve index.js'te.
 * ============================================================================
 */

/* --------------------------------------------------------------------------
 *  TARİH AYRIŞTIRMA
 * --------------------------------------------------------------------------
 *  `new Date(str)` yalnızca RFC 822 / ISO 8601 biçimlerini anlar. Ama TCMB
 *  Atom beslemeleri tarihi TÜRKÇE yazıyor:
 *
 *      <updated>7 Ağu 2026 09:00:02</updated>
 *
 *  `new Date("7 Ağu 2026 09:00:02")` → Invalid Date. Bu sessiz bir hatadır:
 *  kayıt yine de girer ama `publishedAt` null kalır, `computeImportance`
 *  tazelik puanı veremez ve resmî kaynak haberleri sıralamada dibe düşer.
 *  Yani en güvenilir kaynağımız en görünmez olur.
 *
 *  ⚠️ SAAT DİLİMİ: Bu beslemelerde saat dilimi belirtilmez; değerler Türkiye
 *  yerel saatidir (UTC+3, yaz saati YOK). UTC'ye çevirmeden kaydedersek
 *  Worker'ın UTC ortamında tarih 3 saat İLERİ okunur ve henüz yayımlanmamış
 *  gibi görünür.
 * ------------------------------------------------------------------------ */

/** Türkçe ay adları — hem kısa (Ağu) hem uzun (Ağustos) biçim. */
const TR_MONTHS = {
  oca: 0, ocak: 0,
  sub: 1, subat: 1,
  mar: 2, mart: 2,
  nis: 3, nisan: 3,
  may: 4, mayis: 4,
  haz: 5, haziran: 5,
  tem: 6, temmuz: 6,
  agu: 7, agustos: 7,
  eyl: 8, eylul: 8,
  eki: 9, ekim: 9,
  kas: 10, kasim: 10,
  ara: 11, aralik: 11,
};

/** Türkçe karakterleri sadeleştir — "Ağu" ve "AĞU" aynı anahtara düşsün. */
function foldTr(s) {
  return s
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

/** Türkiye saati (UTC+3, sabit) → UTC. */
const TR_UTC_OFFSET_HOURS = 3;

/**
 * Besleme tarihini ISO string'e çevirir. Ayrıştıramazsa null döner —
 * uydurma tarih üretmez.
 *
 * @param {string|null|undefined} raw
 * @returns {string|null} ISO 8601 veya null
 */
export function parseFeedDate(raw) {
  if (!raw) return null;
  const value = String(raw).trim();
  if (!value) return null;

  /* 1) Standart biçimler (RFC 822 / ISO 8601) — çoğu besleme böyle. */
  const native = new Date(value);
  if (!Number.isNaN(native.getTime())) return native.toISOString();

  /* 2) Türkçe biçim: "7 Ağu 2026 09:00:02" / "7 Ağustos 2026" */
  const m = value.match(
    /^(\d{1,2})\s+([^\s\d]+)\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (!m) return null;

  const month = TR_MONTHS[foldTr(m[2])];
  if (month === undefined) return null;

  const day = Number(m[1]);
  const year = Number(m[3]);
  const hour = Number(m[4] ?? 0);
  const minute = Number(m[5] ?? 0);
  const second = Number(m[6] ?? 0);

  if (day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) return null;

  /* Önce takvim geçerliliğini SAAT FARKI UYGULAMADAN doğrula. "31 Şubat"
     gibi bir girdiyi Date sessizce 3 Mart'a kaydırır; bunu yakalamamız
     lazım. Farkı önce uygularsak ay başındaki geçerli tarihler de (1 Mart
     01:00 TR → 28 Şubat 22:00 UTC) yanlışlıkla elenir. */
  const local = new Date(Date.UTC(year, month, day, hour, minute, second));
  if (
    Number.isNaN(local.getTime()) ||
    local.getUTCFullYear() !== year ||
    local.getUTCMonth() !== month ||
    local.getUTCDate() !== day
  ) {
    return null;
  }

  /* Takvim doğruysa Türkiye saatinden UTC'ye çevir. */
  return new Date(local.getTime() - TR_UTC_OFFSET_HOURS * 3600000).toISOString();
}

/** Küçük RSS/Atom ayrıştırıcı — ağır XML bağımlılığı eklemeye değmez. */
function parseFeed(xml, source) {
  const items = [];
  const blocks = xml.match(/<(item|entry)\b[\s\S]*?<\/\1>/gi) ?? [];

  const pick = (block, tag) => {
    const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
    if (!m) return null;
    return m[1]
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  for (const block of blocks) {
    const title = pick(block, "title");
    if (!title) continue;

    let link = pick(block, "link");
    if (!link) {
      const href = block.match(/<link[^>]*href=["']([^"']+)["']/i);
      link = href ? href[1] : null;
    }
    if (!link) continue; // kaynağa bağlantı veremiyorsak kaydı almayız

    const guid = pick(block, "guid") ?? pick(block, "id") ?? link;
    const dateRaw =
      pick(block, "pubDate") ?? pick(block, "published") ?? pick(block, "updated");
    const publishedAt = parseFeedDate(dateRaw);

    /* Özet: description/summary — 400 karakterle SINIRLI.
       Tam metin taşımıyoruz (telif). */
    const rawSummary =
      pick(block, "description") ?? pick(block, "summary") ?? pick(block, "content") ?? "";

    items.push({
      externalId: guid,
      title,
      excerpt: rawSummary.slice(0, 400) || null,
      url: link,
      publishedAt,
    });
  }

  return items;
}

/** JSON beslemeleri için esnek eşleme. */
function parseJsonFeed(payload) {
  const list = Array.isArray(payload)
    ? payload
    : (payload?.items ?? payload?.articles ?? payload?.results ?? []);

  return list
    .map((raw) => {
      const url = raw?.url ?? raw?.link ?? null;
      const title = raw?.title ?? raw?.headline ?? null;
      if (!url || !title) return null;
      const dateRaw = raw?.publishedAt ?? raw?.published_at ?? raw?.date ?? null;
      return {
        externalId: raw?.id ?? url,
        title: String(title).trim(),
        excerpt: (raw?.description ?? raw?.summary ?? "").slice(0, 400) || null,
        url,
        publishedAt: parseFeedDate(dateRaw),
      };
    })
    .filter(Boolean);
}

/**
 * Tek bir kaynağı çeker.
 *
 * ⚠️ Hata FIRLATMAZ — `{ ok, items, error }` döner. Bir kaynağın çökmesi
 * diğerlerini durdurmamalı (spec §3).
 */
export async function fetchSource(source, { timeoutMs = 8000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        /* Kim olduğumuzu açıkça söylüyoruz — kurum sunucusu bizi
           tanıyabilsin ve gerekirse iletişime geçebilsin. */
        "User-Agent": "ParaNotuBot/1.0 (+https://www.paranotu.com/kunye)",
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, application/json, text/xml;q=0.9",
      },
      cf: { cacheTtl: 60, cacheEverything: true },
    });

    if (!res.ok) {
      return { ok: false, items: [], error: `HTTP ${res.status}` };
    }

    const contentType = res.headers.get("content-type") ?? "";
    const items =
      source.type === "json" || contentType.includes("json")
        ? parseJsonFeed(await res.json())
        : parseFeed(await res.text(), source);

    return { ok: true, items, error: null };
  } catch (error) {
    const message = error?.name === "AbortError" ? `timeout ${timeoutMs}ms` : String(error?.message ?? error);
    return { ok: false, items: [], error: message };
  } finally {
    clearTimeout(timer);
  }
}
