import siteConfig from "~/site.config";

const LOCALE = siteConfig.locale.replace("_", "-");

/** ISO tarih → "12 Mart 2026" */
export function formatDate(iso, options) {
  if (!iso) return "";
  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  }).format(new Date(iso));
}

/** "2026-03-12" — <time dateTime> ve sitemap için */
export function toDateOnly(iso) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

/** 1234.5 → "1.234,50 ₺" */
export function formatCurrency(value, currency = "TRY") {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

/** 2.34 → "+%2,34" */
export function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  const n = Number(value);
  const sign = n > 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 2 }).format(n)}%`;
}

/** ISO → "14:35" (haber saatleri için) */
export function formatTime(iso) {
  if (!iso) return "";
  return new Intl.DateTimeFormat(LOCALE, { hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso),
  );
}

/**
 * "3 dakika önce", "2 saat önce", "dün" — haber listelerinde tazelik hissi.
 * 7 günden eskiyse tam tarihe düşer.
 *
 * ----------------------------------------------------------------------------
 *  ⚠️ GELECEK TARİH KIRPMASI — neden var?
 * ----------------------------------------------------------------------------
 *  Frontmatter'daki `2026-08-03` gibi SAATSİZ tarihler UTC gece yarısı
 *  olarak ayrıştırılır: `2026-08-03T00:00:00Z` = TSİ 03:00.
 *  Türkiye UTC+3 olduğu için, gecenin ilk saatlerinde bu tarih HENÜZ
 *  GELMEMİŞ sayılır ve arayüzde "2 saat sonra" yazardı.
 *
 *  Yayımlanmış bir içeriğin "2 saat sonra" yayımlanacakmış gibi görünmesi,
 *  bir haber sitesinde doğrudan güvenilirlik kaybıdır. Bu yüzden gelecek
 *  tarihler "az önce"ye kırpılır.
 *
 *  `allowFuture: true` — gelecekteki bir olayı (ekonomik takvim) kasten
 *  göstermek gerekirse açılır.
 * ----------------------------------------------------------------------------
 */
export function formatRelativeTime(iso, now = new Date(), { allowFuture = false } = {}) {
  if (!iso) return "";
  const diffMs = new Date(iso) - now;

  /* Yayımlanmış içerik gelecekte olamaz — saat dilimi kaymasını yut. */
  if (!allowFuture && diffMs > 0) return "az önce";

  const diffMin = Math.round(diffMs / 60000);
  const abs = Math.abs(diffMin);

  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });
  if (abs < 1) return "az önce";
  if (abs < 60) return rtf.format(diffMin, "minute");
  if (abs < 60 * 24) return rtf.format(Math.round(diffMin / 60), "hour");
  if (abs < 60 * 24 * 7) return rtf.format(Math.round(diffMin / 1440), "day");
  return formatDate(iso);
}

/* ==========================================================================
   PİYASA VERİSİ BİÇİMLEME
   ========================================================================== */

/**
 * Piyasa değerini enstrümanın hassasiyetiyle biçimler.
 * `null` → "—" (sıfır DEĞİL; sıfır gerçek bir fiyattır).
 */
export function formatQuoteValue(value, { precision = 2, unit } = {}) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "—";
  const formatted = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(Number(value));

  if (unit === "TRY") return `${formatted} ₺`;
  if (unit === "USD") return `$${formatted}`;
  if (unit === "EUR") return `€${formatted}`;
  return formatted;
}

/**
 * Yön bilgisini RENKTEN BAĞIMSIZ taşıyan değişim gösterimi.
 *
 * ⚠️ WCAG 1.4.1 — "Renk tek başına bilgi taşıyamaz."
 * Renk körü bir kullanıcı yeşil/kırmızıyı ayırt edemez, bu yüzden her
 * değişim değeri bir OK İŞARETİ ve işaretli sayı ile birlikte döner.
 * Bileşenler `symbol` alanını çizmek ZORUNDADIR.
 *
 * @returns {{symbol: string, text: string, percentText: string,
 *            direction: -1|0|1, label: string, toneClass: string}}
 */
export function formatChange(change, changePercent, { precision = 2 } = {}) {
  const pct = Number.isFinite(Number(changePercent)) ? Number(changePercent) : null;
  const abs = Number.isFinite(Number(change)) ? Number(change) : null;

  if (pct === null && abs === null) {
    return {
      symbol: "",
      text: "—",
      percentText: "—",
      direction: 0,
      label: "değişim verisi yok",
      toneClass: "text-flat",
    };
  }

  const basis = pct ?? abs;
  const direction = basis > 0 ? 1 : basis < 0 ? -1 : 0;

  /* ▲ ▼ ● — ekran okuyucular için `label` ayrıca veriliyor. */
  const symbol = direction === 1 ? "▲" : direction === -1 ? "▼" : "●";
  const sign = direction === 1 ? "+" : direction === -1 ? "-" : "";

  const nf = (n, digits) =>
    new Intl.NumberFormat(LOCALE, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(n);

  return {
    symbol,
    text: abs === null ? "—" : `${sign}${nf(Math.abs(abs), precision)}`,
    /* Türkçe'de yüzde işareti sayıdan ÖNCE gelir: "-%0,27" (❌ "%-0,27").
       Sitedeki diğer rakamlar da (figures.js) bu biçimi kullanıyor. */
    percentText: pct === null ? "—" : `${sign}%${nf(Math.abs(pct), 2)}`,
    direction,
    label:
      direction === 1
        ? `yükseliş, yüzde ${pct === null ? "" : nf(Math.abs(pct), 2)}`
        : direction === -1
          ? `düşüş, yüzde ${pct === null ? "" : nf(Math.abs(pct), 2)}`
          : "değişim yok",
    toneClass:
      direction === 1 ? "text-positive" : direction === -1 ? "text-negative" : "text-flat",
  };
}

/** Mutlak URL üretir — OG etiketleri, canonical ve sitemap için. */
export function absoluteUrl(pathname = "/") {
  const base = siteConfig.url.replace(/\/$/, "");
  return `${base}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}
