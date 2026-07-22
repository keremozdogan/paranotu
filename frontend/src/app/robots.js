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
        /* Next.js iç yolları ve API uçları taranmasın. */
        disallow: ["/api/", "/_next/", "/404", "/500"],
      },
      /* AdSense tarayıcısının reklam uyumluluğu için siteyi görmesi gerekir. */
      { userAgent: "Mediapartners-Google", allow: "/" },
      { userAgent: "AdsBot-Google", allow: "/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}
