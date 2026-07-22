/**
 * ============================================================================
 *  <AdBanner /> — Reklam Alanı
 * ============================================================================
 *  AdSense'i AÇMAK İÇİN (kodda değişiklik gerekmez):
 *    site.config.js →
 *      ads.enabled = true
 *      ads.client  = "ca-pub-XXXXXXXXXXXXXXXX"
 *      ads.slots.inArticle = "1234567890"   ← AdSense panelindeki slot ID
 *
 *  `enabled: false` iken, `showPlaceholders` true ise şık bir "Reklam Alanı"
 *  kutusu görünür; production'da placeholder'ları kapatmak için
 *  showPlaceholders'ı false yap — o zaman bileşen hiçbir şey render etmez.
 * ============================================================================
 */

import siteConfig from "~/site.config";
import AdSenseUnit from "./AdSenseUnit";

/**
 * Yerleşim ön ayarları. Her biri bir `slots` anahtarına ve bir görsel
 * boyuta bağlıdır — sayfa içinde tek satırla kullanılır:
 *   <AdBanner placement="sidebar" />
 */
const PLACEMENTS = {
  headerBelow: {
    slotKey: "headerBelow",
    label: "Reklam Alanı — Başlık Altı",
    className: "min-h-[90px] md:min-h-[90px]",
    format: "horizontal",
  },
  inArticle: {
    slotKey: "inArticle",
    label: "Reklam Alanı — Yazı İçi",
    className: "min-h-[250px]",
    format: "fluid",
    layout: "in-article",
  },
  sidebar: {
    slotKey: "sidebar",
    label: "Reklam Alanı — Yan Menü",
    className: "min-h-[600px]",
    format: "vertical",
  },
  listInline: {
    slotKey: "listInline",
    label: "Reklam Alanı — Liste Arası",
    className: "min-h-[250px]",
    format: "rectangle",
  },
  footer: {
    slotKey: "footer",
    label: "Reklam Alanı — Alt Bilgi",
    className: "min-h-[90px]",
    format: "horizontal",
  },
};

export default function AdBanner({ placement = "inArticle", className = "" }) {
  const preset = PLACEMENTS[placement] ?? PLACEMENTS.inArticle;
  const { ads } = siteConfig;
  const slotId = ads.slots?.[preset.slotKey];

  /* --- 1) Reklamlar aktif ve slot tanımlı → gerçek AdSense birimi --- */
  if (ads.enabled && ads.client && slotId) {
    return (
      <aside
        aria-label="Reklam"
        className={`my-8 w-full overflow-hidden ${className}`}
      >
        <AdSenseUnit
          client={ads.client}
          slot={slotId}
          format={preset.format}
          layout={preset.layout}
          minHeightClass={preset.className}
        />
      </aside>
    );
  }

  /* --- 2) Kapalı ve placeholder istenmiyor → hiçbir şey render etme --- */
  if (!ads.showPlaceholders) return null;

  /* --- 3) Geliştirme placeholder'ı --- */
  return (
    <aside
      aria-label="Reklam alanı (yer tutucu)"
      className={`my-8 w-full ${className}`}
    >
      <div
        className={`flex flex-col items-center justify-center gap-1 rounded-brand border border-dashed border-line bg-subtle/60 px-4 py-6 text-center ${preset.className} ${className}`}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          {preset.label}
        </span>
        <span className="text-xs text-muted/70">
          site.config.js → ads.slots.{preset.slotKey}
        </span>
      </div>
    </aside>
  );
}

/**
 * Yazı içeriğinin arasına, belirli H2 başlıklarından sonra reklam serpiştirmek
 * için yardımcı: `siteConfig.ads.inArticleAfterHeadings` listesini kullanır.
 */
export function shouldPlaceAdAfterHeading(headingIndex) {
  return (siteConfig.ads.inArticleAfterHeadings ?? []).includes(headingIndex);
}
