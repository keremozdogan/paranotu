/**
 * ============================================================================
 *  HAM GELİŞME AKIŞI — okuma katmanı
 * ============================================================================
 *  Worker'ın D1'e yazdığı `external_feed_items` kayıtlarını okur.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  BU KAYITLAR HABER SAYFASI DEĞİLDİR
 *  ────────────────────────────────────────────────────────────────────────
 *  Her feed kaydı için ParaNotu'da AYRI BİR URL AÇILMAZ. Kayıtlar yalnızca
 *  "Son gelişmeler" akışında kart olarak görünür ve tıklandığında
 *  ORİJİNAL KAYNAĞA gider. Böylece:
 *    • başka yayının içeriği ParaNotu'da yayımlanmış olmaz (telif),
 *    • Google'a değersiz sayfa açılmaz (thin content),
 *    • okur asıl kaynağa ulaşır (şeffaflık).
 *
 *  Bir gelişme ParaNotu haberine ancak editör onayıyla dönüşür.
 * ============================================================================
 */

import "server-only";
import { cache } from "react";

import { d1Query, isD1Configured, parseJsonColumn } from "@/lib/d1";

/**
 * @typedef {object} FeedItem
 * @property {string}  id
 * @property {string}  title
 * @property {string|null} excerpt      Kaynak izin veriyorsa özet
 * @property {string}  url              ORİJİNAL kaynak adresi
 * @property {string}  sourceName
 * @property {string|null} publishedAt
 * @property {string|null} section
 * @property {string[]} symbols
 * @property {number}  importanceScore
 * @property {boolean} linkOnly         Özet gösterilebilir mi?
 */

function toFeedItem(row) {
  return {
    id: row.id,
    title: row.title,
    /* Kaynak yalnızca bağlantıya izin veriyorsa Worker özeti zaten
       kaydetmemiştir; burada da göstermiyoruz. */
    excerpt: row.redistribution === "link_only" ? null : row.content_excerpt,
    url: row.canonical_url,
    sourceName: row.source_name,
    publishedAt: row.published_at,
    section: row.section,
    symbols: parseJsonColumn(row.symbols, []),
    importanceScore: row.importance_score ?? 0,
    linkOnly: row.redistribution === "link_only",
    clusterId: row.cluster_id,
  };
}

/**
 * Son gelişmeler.
 *
 * Aynı olayın farklı kaynaklardaki kopyaları GÖSTERİLMEZ — her olay
 * kümesinden yalnızca en yüksek puanlı kayıt gelir. Bu, akışın aynı
 * haberin on farklı versiyonuyla dolmasını engeller.
 *
 * D1 yoksa boş dizi döner; çağıran taraf bölümü hiç render etmez.
 */
export const getRecentFeedItems = cache(async ({ limit = 12, section = null } = {}) => {
  if (!isD1Configured()) return [];

  /* Küme başına en iyi kaydı seç: aynı olay tek satır olarak görünsün. */
  const sql = `
    SELECT f.*
    FROM external_feed_items f
    JOIN (
      SELECT COALESCE(cluster_id, id) AS grp, MAX(importance_score) AS top
      FROM external_feed_items
      WHERE status IN ('clustered','queued','new')
        ${section ? "AND section = ?" : ""}
      GROUP BY grp
    ) best
      ON COALESCE(f.cluster_id, f.id) = best.grp
     AND f.importance_score = best.top
    WHERE f.status IN ('clustered','queued','new')
      ${section ? "AND f.section = ?" : ""}
    ORDER BY f.published_at DESC
    LIMIT ?
  `;

  const params = section ? [section, section, limit] : [limit];

  const { rows } = await d1Query(sql, params, {
    revalidate: 300,
    tags: ["feed-items"],
  });

  return rows.map(toFeedItem);
});

/** Bir haberin "Aynı konudaki diğer kaynaklar" bölümü için. */
export const getClusterSources = cache(async (clusterId, { limit = 8 } = {}) => {
  if (!isD1Configured() || !clusterId) return [];

  const { rows } = await d1Query(
    `SELECT id, source_name, canonical_url, title, published_at, redistribution
     FROM external_feed_items
     WHERE cluster_id = ?
     ORDER BY published_at DESC
     LIMIT ?`,
    [clusterId, limit],
    { revalidate: 600, tags: ["feed-items"] },
  );

  return rows.map((r) => ({
    id: r.id,
    sourceName: r.source_name,
    url: r.canonical_url,
    title: r.title,
    publishedAt: r.published_at,
  }));
});

/** Akışta hiç kayıt var mı? Ana sayfa bölümü buna göre çizilir. */
export const hasFeedItems = cache(async () => {
  if (!isD1Configured()) return false;
  const items = await getRecentFeedItems({ limit: 1 });
  return items.length > 0;
});
