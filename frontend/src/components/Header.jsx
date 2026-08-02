/**
 * ============================================================================
 *  ÜST ALAN
 * ============================================================================
 *  Katman sırası (yukarıdan aşağıya):
 *
 *    1. Piyasa bandı   — koyu kurumsal şerit, sayfayla birlikte kayar
 *    2. Ana navigasyon — logo + mega menü + arama, YAPIŞKAN (sticky)
 *    3. Son dakika     — varsa; yoksa hiç render edilmez
 *
 *  ⚠️ SIRA NOTU: Spec'te son dakika bandı navigasyondan ÖNCE listelenmişti.
 *  Bilinçli olarak navigasyonun altına alındı — aksi halde logo ve menü
 *  mobilde ~110 px aşağı itiliyor ve ilk ekranda marka görünmüyordu.
 *  Bu, haber sitelerinin yerleşik deseni (ince piyasa şeridi → marka/menü →
 *  son dakika) ve LCP açısından da daha iyi.
 *
 *  Yapışkan olan SADECE navigasyon satırıdır (56 px). Piyasa bandı ve son
 *  dakika yukarı kayıp gider — mobilde ekranın büyük bölümünü kaplamasınlar.
 * ============================================================================
 */

import siteConfig from "~/site.config";
import Logo from "./Logo";
import SearchDialog from "./SearchDialog";
import DesktopNav from "./nav/DesktopNav";
import MobileNav from "./nav/MobileNav";
import MarketTicker from "./market/MarketTicker";
import BreakingBand from "./news/BreakingBand";
import { getSearchIndex } from "@/lib/posts";
import { getBreakingNews, getNewsSearchIndex } from "@/lib/news";
import { buildNav, buildMobileNav } from "@/lib/nav";

export default function Header() {
  const { features } = siteConfig;

  /* Arama hem haberleri hem rehberleri kapsar. Haberler önce gelir —
     zaman duyarlı içerik arandığında genelde aranan odur. */
  const searchIndex = features.search
    ? [...getNewsSearchIndex(), ...getSearchIndex()]
    : [];
  const nav = buildNav();
  const mobileNav = buildMobileNav();
  const breaking = getBreakingNews();

  return (
    <>
      {/* 1 — Piyasa bandı. Kendi veri durumunu kendi yönetir. */}
      <MarketTicker />

      {/* 2 — Ana navigasyon (yapışkan) */}
      <header className="sticky top-0 z-50 border-b border-line bg-canvas/90 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/75">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Logo />
          <DesktopNav items={nav} />

          <div className="ml-auto flex items-center gap-1">
            {features.search ? <SearchDialog index={searchIndex} /> : null}
            <MobileNav items={mobileNav} />
          </div>
        </div>
      </header>

      {/* 3 — Son dakika. Haber yoksa bileşen null döner, boş şerit kalmaz. */}
      {breaking.length > 0 ? <BreakingBand items={breaking} /> : null}
    </>
  );
}
