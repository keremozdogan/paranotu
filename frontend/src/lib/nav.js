/**
 * ============================================================================
 *  NAVİGASYON KURUCU
 * ============================================================================
 *  `site.config.js` içindeki ham menü tanımını alır ve GERÇEKTEN VAR OLAN
 *  sayfalara indirger.
 *
 *  Neden gerekli?
 *  Menüde bir haber bölümü linki varsa ama o bölüm `active: false` ise ya da
 *  içinde hiç haber yoksa, kullanıcı boş sayfaya ya da 404'e düşer. Google
 *  bunu "thin content" sayar. Bu dosya, menüyü içerik gerçekliğine bağlar —
 *  editör bir bölümü kapattığında menü kendiliğinden düzelir.
 * ============================================================================
 */

import "server-only";
import { cache } from "react";

import siteConfig from "~/site.config";
import { getSectionsWithCounts } from "@/lib/news";

/**
 * Menüyü filtreler:
 *   • `section` alanı olan öğe → bölüm aktif VE en az 1 haber varsa kalır
 *   • Tüm çocukları elenen grup → tamamen düşer
 *
 * @returns {Array} Render edilebilir menü ağacı
 */
export const buildNav = cache(() => {
  const counts = new Map(getSectionsWithCounts().map((s) => [s.slug, s.count]));

  const keep = (item) => {
    if (!item.section) return true; // bölüm bağımlı değil (statik sayfa)
    return (counts.get(item.section) ?? 0) > 0;
  };

  return (siteConfig.nav ?? [])
    .map((item) => {
      if (!item.children) return keep(item) ? item : null;
      const children = item.children.filter(keep);
      if (children.length === 0) return null;
      return { ...item, children };
    })
    .filter(Boolean);
});

/**
 * Mobil menü için düz liste — grup başlıkları korunur ama iç içe
 * gezinme yerine tek seviyeli, dokunması kolay bir yapı üretir.
 */
export const buildMobileNav = cache(() =>
  buildNav().map((item) =>
    item.children ? { label: item.label, children: item.children } : { label: item.label, href: item.href },
  ),
);
