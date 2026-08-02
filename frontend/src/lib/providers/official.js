/**
 * ============================================================================
 *  OFFICIAL SOURCE PROVIDER — resmî kurum duyuruları
 * ============================================================================
 *  TCMB, TÜİK, Resmî Gazete, SPK, KAP gibi kurumların herkese açık
 *  beslemelerinden duyuru başlıklarını okur.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  ERİŞİM ETİĞİ — bu katmanın en önemli kısmı
 *  ────────────────────────────────────────────────────────────────────────
 *  • SADECE kurumun kendi yayımladığı RSS/JSON beslemeleri kullanılır.
 *    HTML sayfası kazınmaz (scrape edilmez).
 *  • Besleme adresi env ile verilir; kod içine gömülü kurum adresi YOKTUR.
 *    Böylece bir kurum beslemesini kapatırsa veya koşullarını değiştirirse
 *    kod değişikliği gerekmeden devre dışı bırakılabilir.
 *  • İstekler seyrektir (varsayılan 30 dk cache) — kurum sunucusuna yük
 *    bindirmez. Agresif polling YAPMA.
 *  • Duyurunun TAM METNİ alınmaz; başlık, tarih ve kuruma giden bağlantı
 *    gösterilir. Kullanıcı asıl kaynağa yönlendirilir.
 *  • Kurumun robots.txt ve kullanım koşulları bağlayıcıdır. Yeni bir kaynak
 *    eklemeden önce KONTROL ET.
 *
 *  ⚠️ Borsa İstanbul eş zamanlı fiyat verisi bu katmanın konusu DEĞİLDİR —
 *  o lisanslıdır ve `market.js` üzerinden sözleşmeli sağlayıcıyla alınır.
 *  KAP duyuru metinleri ile piyasa fiyat verisi farklı hukuki rejimlerdir.
 * ============================================================================
 */

import "server-only";
import { cache } from "react";

import { guard, ok, unconfigured } from "./base";

/**
 * Beslemeler env üzerinden tanımlanır:
 *   OFFICIAL_FEEDS="tcmb|TCMB Duyuruları|https://.../rss;tuik|TÜİK Bültenleri|https://.../rss"
 *
 * Biçim:  id|görünen ad|besleme adresi   (kayıtlar `;` ile ayrılır)
 */
function configuredFeeds() {
  const raw = process.env.OFFICIAL_FEEDS || "";
  return raw
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [id, name, url] = entry.split("|").map((s) => s?.trim());
      return id && name && url ? { id, name, url } : null;
    })
    .filter(Boolean);
}

const REVALIDATE = Number(process.env.OFFICIAL_REVALIDATE ?? "1800");

/**
 * Çok küçük bir RSS/Atom başlık ayrıştırıcısı.
 * Tam bir XML parser değil — sadece <item>/<entry> başlık, bağlantı ve
 * tarihini alır. Ağır bir XML bağımlılığı eklemeye değmez.
 */
function parseFeedTitles(xml, feed) {
  const items = [];
  const blocks = xml.match(/<(item|entry)\b[\s\S]*?<\/\1>/gi) ?? [];

  const pick = (block, tag) => {
    const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
    if (!m) return null;
    return m[1]
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  };

  for (const block of blocks) {
    const title = pick(block, "title");
    if (!title) continue;

    /* Atom'da bağlantı href attribute'unda durur. */
    let link = pick(block, "link");
    if (!link) {
      const href = block.match(/<link[^>]*href=["']([^"']+)["']/i);
      link = href ? href[1] : null;
    }

    const dateRaw = pick(block, "pubDate") ?? pick(block, "updated") ?? pick(block, "published");
    const date = dateRaw ? new Date(dateRaw) : null;

    items.push({
      id: link ?? `${feed.id}-${title.slice(0, 40)}`,
      title,
      url: link,
      publishedAt: date && !Number.isNaN(date.getTime()) ? date.toISOString() : null,
      institution: feed.name,
      institutionId: feed.id,
    });
  }

  return items;
}

/**
 * Yapılandırılmış resmî beslemelerden son duyurular.
 *
 * Bir besleme çökerse diğerleri çalışmaya devam eder — tek kurum
 * erişilemez diye bölüm tamamen kaybolmaz.
 *
 * @returns {Promise<import("./base").ProviderResult>} `data` → duyuru[]
 */
export const getOfficialAnnouncements = cache(async ({ limit = 10 } = {}) => {
  const feeds = configuredFeeds();
  const source = {
    name: feeds.length ? feeds.map((f) => f.name).join(", ") : "—",
    url: null,
    license: "Kurumların herkese açık beslemeleri",
  };

  if (feeds.length === 0) return unconfigured({ source, data: [] });

  return guard(async () => {
    const settled = await Promise.allSettled(
      feeds.map(async (feed) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6000);
        try {
          const res = await fetch(feed.url, {
            headers: { Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" },
            signal: controller.signal,
            next: { revalidate: REVALIDATE, tags: ["official-feeds"] },
          });
          if (!res.ok) throw new Error(`${feed.id}: ${res.status}`);
          return parseFeedTitles(await res.text(), feed);
        } finally {
          clearTimeout(timer);
        }
      }),
    );

    const data = settled
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value)
      .sort((a, b) => new Date(b.publishedAt ?? 0) - new Date(a.publishedAt ?? 0))
      .slice(0, limit);

    const failedCount = settled.filter((r) => r.status === "rejected").length;
    if (failedCount) {
      console.error(`[provider:official] ${failedCount}/${feeds.length} besleme okunamadı`);
    }

    return ok(data, { source });
  }, source);
});
