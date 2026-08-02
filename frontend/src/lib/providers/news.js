/**
 * ============================================================================
 *  NEWS PROVIDER — dış haber kaynağı köprüsü
 * ============================================================================
 *  ParaNotu'nun BİRİNCİL haber kaynağı editoryal içeriktir (`content/news/`).
 *  Bu dosya, ona EK olarak lisanslı bir haber servisi bağlamak içindir.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  TELİF VE LİSANS — pazarlık konusu değil
 *  ────────────────────────────────────────────────────────────────────────
 *  Bir haber servisinden gelen içerikte:
 *    • TAM METİN izinsiz yeniden yayımlanmaz. Sadece başlık + kısa özet +
 *      kaynağa bağlantı gösterilir (`snippetOnly` bayrağı bunu zorlar).
 *    • Kaynak adı ve orijinal bağlantı her zaman görünür kalır.
 *    • Yayın/güncelleme tarihleri korunur.
 *    • Kaynakta olmayan bilgi ÜRETİLMEZ.
 *
 *  RSS/scraping notu: resmî kurumların RSS beslemeleri genelde serbesttir,
 *  ancak ticari haber sitelerinin içeriğini izinsiz çekmek telif ihlalidir.
 *  Bu katman agresif scraping YAPMAZ — yalnızca sözleşmeli bir API veya
 *  açıkça yeniden yayına izin veren bir besleme bekler.
 * ============================================================================
 */

import "server-only";
import { cache } from "react";

import { fetchJson, guard, ok, unconfigured } from "./base";
import { slugify } from "@/lib/slug";

const PROVIDER_ID = process.env.NEWS_PROVIDER || "";
const API_KEY = process.env.NEWS_API_KEY || "";
const API_BASE = process.env.NEWS_API_BASE_URL || "";
const REVALIDATE = Number(process.env.NEWS_REVALIDATE ?? "300");

const isConfigured = () => Boolean(PROVIDER_ID && (API_KEY || API_BASE));

function sourceInfo() {
  return {
    name: process.env.NEWS_SOURCE_NAME || (isConfigured() ? PROVIDER_ID : "—"),
    url: process.env.NEWS_SOURCE_URL || null,
    license: process.env.NEWS_LICENSE || null,
  };
}

/**
 * Dış kaynaktan gelen haberi site şemasına çevirir.
 *
 * `snippetOnly: true` — bu içerik editoryal değildir; arayüz tam metin
 * göstermez, sadece özet + kaynak bağlantısı çizer.
 */
export function normalizeExternalItem(raw) {
  const title = String(raw?.title ?? "").trim();
  if (!title) return null;

  const url = raw?.url ?? raw?.link ?? null;
  const publishedAt = raw?.publishedAt ?? raw?.published_at ?? raw?.pubDate ?? null;

  return {
    id: raw?.id ?? url ?? slugify(title),
    slug: null, // dış içerik site içinde ayrı sayfa AÇMAZ
    title,
    summary: String(raw?.description ?? raw?.summary ?? "").trim() || null,
    /* Tam metni bilinçli olarak taşımıyoruz — lisans. */
    content: null,
    snippetOnly: true,
    sourceName: raw?.source?.name ?? raw?.sourceName ?? sourceInfo().name,
    sourceUrl: url,
    canonicalUrl: url,
    publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
    updatedAt: null,
    /* Dış görselleri hotlink ETMİYORUZ — lisans belirsiz. */
    heroImage: null,
    imageAlt: null,
    imageCredit: null,
    category: null,
    tags: [],
    isExternal: true,
    isBreaking: false,
    isFeatured: false,
    isLive: false,
    importanceScore: 0,
  };
}

/**
 * Aynı haberin farklı kaynaklardan tekrarını eler.
 * Başlık normalize edilip (küçük harf, noktalama atılmış) karşılaştırılır.
 */
export function dedupe(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = slugify(item.title).split("-").slice(0, 8).join("-");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

const ADAPTERS = {
  /**
   * Genel REST adaptörü:
   *   GET {base}/news?limit=20&lang=tr  → { articles: [...] }
   */
  rest: async ({ limit }) => {
    const url = `${API_BASE.replace(/\/$/, "")}/news?limit=${limit}&lang=tr`;
    return fetchJson(url, {
      headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {},
      revalidate: REVALIDATE,
      tags: ["news-feed"],
      provider: "news:rest",
      timeout: 6000,
    });
  },
};

/**
 * Dış haber akışı.
 * Yapılandırılmamışsa BOŞ liste ile `unconfigured` döner — editoryal
 * içerik zaten ayrı katmandan geliyor, bu yüzden sayfa boş kalmaz.
 *
 * @returns {Promise<import("./base").ProviderResult>} `data` → item[]
 */
export const getExternalNews = cache(async ({ limit = 20 } = {}) => {
  const source = sourceInfo();
  if (!isConfigured()) return unconfigured({ source, data: [] });

  const adapter = ADAPTERS[PROVIDER_ID] ?? ADAPTERS.rest;

  return guard(async () => {
    const raw = await adapter({ limit });
    const list = Array.isArray(raw) ? raw : (raw?.articles ?? raw?.items ?? []);
    const data = dedupe(list.map(normalizeExternalItem).filter(Boolean));
    return ok(data, { source });
  }, source);
});
