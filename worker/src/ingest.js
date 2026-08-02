/**
 * ============================================================================
 *  ÇEKİM KATMANI — beslemeleri oku, ham kayıtları üret
 * ============================================================================
 *  Bu dosya SADECE ağdan okur ve ayrıştırır. Veritabanına yazmaz, karar
 *  vermez. Kararlar pipeline.js ve index.js'te.
 * ============================================================================
 */

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
    const date = dateRaw ? new Date(dateRaw) : null;

    /* Özet: description/summary — 400 karakterle SINIRLI.
       Tam metin taşımıyoruz (telif). */
    const rawSummary =
      pick(block, "description") ?? pick(block, "summary") ?? pick(block, "content") ?? "";

    items.push({
      externalId: guid,
      title,
      excerpt: rawSummary.slice(0, 400) || null,
      url: link,
      publishedAt: date && !Number.isNaN(date.getTime()) ? date.toISOString() : null,
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
      const date = dateRaw ? new Date(dateRaw) : null;
      return {
        externalId: raw?.id ?? url,
        title: String(title).trim(),
        excerpt: (raw?.description ?? raw?.summary ?? "").slice(0, 400) || null,
        url,
        publishedAt: date && !Number.isNaN(date.getTime()) ? date.toISOString() : null,
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
