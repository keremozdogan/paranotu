/**
 * ============================================================================
 *  HABER SITEMAP — /news-sitemap.xml
 * ============================================================================
 *  Google News sitemap protokolü normal sitemap'ten AYRIDIR ve katı kuralları
 *  vardır:
 *
 *   • YALNIZCA SON 48 SAATİN haberleri girer. Daha eskisini koymak protokol
 *     ihlalidir ve Google beslemeyi görmezden gelebilir. Eski haberler zaten
 *     normal /sitemap.xml içinde duruyor.
 *   • En fazla 1000 URL.
 *   • `news:publication_date` tam zaman damgası (saat dilimiyle) olmalı.
 *   • Yayın adı ve dili her kayıtta tekrar edilir.
 *
 *  Bu route, haber yokken bile GEÇERLİ ve boş bir sitemap döner — Google'a
 *  404 vermek, beslemeyi hatalı olarak işaretlemesine yol açar.
 * ============================================================================
 */

import siteConfig from "~/site.config";
import { getNewsSummaries } from "@/lib/news";
import { belongsInNewsSitemap } from "@/lib/indexability";
import { absoluteUrl } from "@/lib/format";

/**
 * ⚠️ BURAYA YALNIZCA EDİTORYAL HABER GİRER.
 *
 *  • Ham feed kayıtları  → GİRMEZ (zaten ParaNotu URL'i yok)
 *  • Evergreen rehberler → GİRMEZ. Google News beslemesi zaman duyarlı
 *    haber içindir; kalıcı rehberi buraya koymak protokol ihlalidir ve
 *    beslemenin tamamının yok sayılmasına yol açabilir. Rehberler normal
 *    /sitemap.xml içinde durur (spec §10).
 *  • Onaysız/taslak haberler → GİRMEZ (indexability kapısı eler).
 */
const MAX_URLS = 1000;

/** XML'e gömülecek metni kaçır — başlıkta & veya < olabilir. */
function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const now = Date.now();

  /* Tek karar noktası: indexability.js. Pencere ve kalite kapıları
     orada tanımlı; burada tekrar edilmiyor ki ikisi ayrışmasın. */
  const recent = getNewsSummaries()
    .filter((item) => belongsInNewsSitemap(item, now))
    .slice(0, MAX_URLS);

  const entries = recent
    .map((item) => {
      const url = absoluteUrl(`/haber/${item.section.slug}/${item.slug}`);
      const keywords = (item.keywords ?? []).slice(0, 10).join(", ");

      return `  <url>
    <loc>${escapeXml(url)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(siteConfig.name)}</news:name>
        <news:language>${escapeXml(siteConfig.lang)}</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(item.publishedAt)}</news:publication_date>
      <news:title>${escapeXml(item.title)}</news:title>${
        keywords ? `\n      <news:keywords>${escapeXml(keywords)}</news:keywords>` : ""
      }
    </news:news>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      /* Haber sitemap'i sık taranır — kısa cache. */
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}

export const revalidate = 300;
