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

  /**
   * ⚠️ `relative` ŞART — kaldırma.
   *
   * Aşağıdaki `sr-only` etiketi Tailwind tarafından `position: absolute`
   * yapılır. Konumlandırılmış bir ata yoksa referansı sayfanın KÖKÜ olur.
   * CSS kuralı gereği, containing block'u kaydırma kapsayıcısının DIŞINDA
   * olan bir öğe `overflow` ile KIRPILAMAZ.
   *
   * Sonuç: piyasa bandı gibi yatay kaydırmalı bir listede, ekrandan taşan
   * kotasyonların gizli etiketleri sayfa köküne göre konumlanıp belgeyi
   * ~1700px'e uzatıyordu — TÜM SAYFA yatay kaydırılabilir hale geliyordu.
   * `overflow: hidden` bile durduramıyordu, çünkü sorun kırpma değil
   * containing block'tu.
   *
   * `relative` ekleyince etiket bu span'a göre konumlanıyor ve kaydırma
   * kapsayıcısının içinde kalıyor.
   */
  return (
    <span
      className={`relative inline-flex items-baseline gap-1 numeric ${c.toneClass} ${className}`}
    >
      {/* Ok işareti — renkten bağımsız yön göstergesi */}
      <span aria-hidden="true">{c.symbol}</span>
      {variant === "both" ? <span>{c.text}</span> : null}
      <span>{c.percentText}</span>
      {/* Görsel olarak gizli, ekran okuyucuya açık */}
      <span className="sr-only">{c.label}</span>
    </span>
  );
}
