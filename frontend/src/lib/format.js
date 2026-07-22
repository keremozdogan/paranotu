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

/** Mutlak URL üretir — OG etiketleri, canonical ve sitemap için. */
export function absoluteUrl(pathname = "/") {
  const base = siteConfig.url.replace(/\/$/, "");
  return `${base}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}
