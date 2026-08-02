/**
 * ============================================================================
 *  <AdBanner /> — GERİYE DÖNÜK UYUMLULUK SARMALAYICISI
 * ============================================================================
 *  Reklam mantığı `@/components/ads/AdSlot` içine taşındı. Bu dosya,
 *  projede zaten 13 sayfada kullanılan eski API'yi çalışır tutuyor;
 *  çağrıları yeni sisteme yönlendiriyor. Böylece o sayfaları tek tek
 *  değiştirmeden yeni reklam sistemine geçtiler.
 *
 *  YENİ KOD YAZARKEN BUNU KULLANMA — doğrudan `@/components/ads` içindeki
 *  adlandırılmış bileşenleri tercih et:
 *
 *      import { BannerAdSlot, SidebarAdSlot, InlineAdSlot } from "@/components/ads";
 *
 *  Eski `placement` adları yeni yerleşimlere şöyle eşlenir:
 *      headerBelow → homeTop      (bölüm arası yatay)
 *      inArticle   → inArticle    (yazı içi)
 *      sidebar     → sidebar      (yan sütun)
 *      listInline  → inFeed       (liste araları)
 *      footer      → contentEnd   (içerik sonu)
 * ============================================================================
 */

import siteConfig from "~/site.config";
import AdSlot from "./ads/AdSlot";

const LEGACY_MAP = {
  headerBelow: "homeTop",
  inArticle: "inArticle",
  sidebar: "sidebar",
  listInline: "inFeed",
  footer: "contentEnd",
};

export default function AdBanner({ placement = "inArticle", className = "" }) {
  return <AdSlot placement={LEGACY_MAP[placement] ?? "inFeed"} className={className} />;
}

/**
 * Yazı içeriğinin arasına, belirli H2 başlıklarından sonra reklam
 * serpiştirmek için yardımcı — `site.config.js → ads.inArticleAfterHeadings`.
 */
export function shouldPlaceAdAfterHeading(headingIndex) {
  return (siteConfig.ads.inArticleAfterHeadings ?? []).includes(headingIndex);
}
