/**
 * Dinamik robots.txt — /robots.txt
 *
 * Yayına almadan önce NEXT_PUBLIC_SITE_URL'i gerçek domaine ayarla;
 * sitemap adresi otomatik olarak ondan türetilir.
 */

import siteConfig from "~/site.config";
import { absoluteUrl } from "@/lib/format";

export default function robots() {
  /* Önizleme/staging ortamlarını indekslettirme. */
  const isProduction = process.env.NEXT_PUBLIC_SITE_ENV !== "preview";

  if (!isProduction) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        /* Next.js iç yolları, API uçları ve parametreli arama sonuçları
           taranmasın. Query parametreli URL'ler indekslenirse aynı içerik
           onlarca adresten görünür (duplicate content). */
        disallow: ["/api/", "/_next/", "/404", "/500", "/*?q=", "/*?sayfa=", "/*?page="],
      },
      /* AdSense tarayıcısının reklam uyumluluğu için siteyi görmesi gerekir. */
      { userAgent: "Mediapartners-Google", allow: "/" },
      { userAgent: "AdsBot-Google", allow: "/" },
      /* Google Haberler tarayıcısı — haber bölümüne tam erişim. */
      { userAgent: "Googlebot-News", allow: "/" },
    ],
    /* İki sitemap: genel + Google News (son 48 saat). */
    sitemap: [absoluteUrl("/sitemap.xml"), absoluteUrl("/news-sitemap.xml")],
    host: siteConfig.url,
  };
}
