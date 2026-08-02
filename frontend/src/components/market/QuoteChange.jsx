/**
 * Piyasa değişimi — yön bilgisini RENKTEN BAĞIMSIZ taşır.
 *
 * ⚠️ WCAG 1.4.1 (Use of Color)
 * Yeşil/kırmızı tek başına "yükseldi/düştü" bilgisini taşıyamaz. Bu bileşen
 * her zaman bir ok işareti (▲ ▼ ●) çizer ve ekran okuyucular için ayrı bir
 * sözlü etiket verir. Renk yalnızca DESTEKLEYİCİ bir sinyaldir.
 *
 * Bu yüzden piyasa değişimini doğrudan `<span className="text-positive">`
 * ile yazma — hep bu bileşeni kullan.
 */

import { formatChange } from "@/lib/format";

export default function QuoteChange({
  change,
  changePercent,
  precision = 2,
  /** "percent" → sadece yüzde | "both" → mutlak + yüzde */
  variant = "percent",
  className = "",
}) {
  const c = formatChange(change, changePercent, { precision });

  return (
    <span className={`inline-flex items-baseline gap-1 numeric ${c.toneClass} ${className}`}>
      {/* Ok işareti — renkten bağımsız yön göstergesi */}
      <span aria-hidden="true">{c.symbol}</span>
      {variant === "both" ? <span>{c.text}</span> : null}
      <span>{c.percentText}</span>
      {/* Görsel olarak gizli, ekran okuyucuya açık */}
      <span className="sr-only">{c.label}</span>
    </span>
  );
}
