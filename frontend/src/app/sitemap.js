/**
 * Dinamik sitemap — /sitemap.xml
 *
 * Kaynaklar: statik sayfalar + tüm yazılar + dolu kategoriler + etiketler.
 * Yeni bir .mdx dosyası eklediğinde sitemap kendiliğinden güncellenir.
 */

import { getPostSummaries, getCategoriesWithCounts, getAllTags } from "@/lib/posts";
import { getNewsSummaries, getSectionsWithCounts } from "@/lib/news";
import { getGuideSummaries, getActiveHubs } from "@/lib/evergreen";
import { evergreenIndexability, editorialIndexability } from "@/lib/indexability";
import { absoluteUrl } from "@/lib/format";

/**
 * ⚠️ HAM FEED KAYITLARI BU SITEMAP'E GİRMEZ.
 * `external_feed_items` için ParaNotu'da URL açılmıyor; kartlar doğrudan
 * orijinal kaynağa gidiyor. Bu yüzden sitemap'te gösterilecek bir adres
 * de yok (spec §10). Buraya feed eklemek, indexlenmesini istemediğimiz
 * içeriği Google'a bizzat sunmak olurdu.
 */
export default function sitemap() {
  const posts = getPostSummaries().filter((p) => !p.noindex);
  /* Sitemap'e yalnızca GERÇEKTEN indexlenebilir içerik girer —
     karar `indexability.js`'te, burada tekrar edilmiyor. */
  const news = getNewsSummaries().filter((n) => editorialIndexability(n).index);
  const guides = getGuideSummaries().filter((g) => evergreenIndexability(g).index);

  /* Ana sayfanın lastModified'ı en yeni yazının tarihi olsun. */
  const latest = posts[0]?.date ? new Date(posts[0].date) : new Date();

  const staticRoutes = [
    { path: "/", changeFrequency: "daily", priority: 1, lastModified: latest },
    { path: "/blog", changeFrequency: "daily", priority: 0.9, lastModified: latest },
    /* Aylık güncellenen veri sayfası — sık taranmasını istiyoruz. */
    { path: "/enflasyon", changeFrequency: "weekly", priority: 0.9, lastModified: latest },
    /* Araçlar backlink ve dönen ziyaretçi kaynağı — yüksek öncelik. */
    { path: "/araclar", changeFrequency: "monthly", priority: 0.8, lastModified: latest },
    {
      path: "/araclar/butce-hesaplayici",
      changeFrequency: "monthly",
      priority: 0.8,
      lastModified: latest,
    },
    {
      path: "/araclar/enflasyon-hesaplayici",
      changeFrequency: "monthly",
      priority: 0.8,
      lastModified: latest,
    },
    /* Haber ve piyasa rotaları — zaman duyarlı, sık taranmalı. */
    { path: "/haber", changeFrequency: "hourly", priority: 0.9, lastModified: latest },
    { path: "/son-dakika", changeFrequency: "hourly", priority: 0.8, lastModified: latest },
    { path: "/piyasalar", changeFrequency: "hourly", priority: 0.8, lastModified: latest },
    { path: "/ekonomik-takvim", changeFrequency: "daily", priority: 0.7, lastModified: latest },
    { path: "/hakkinda", changeFrequency: "yearly", priority: 0.4, lastModified: latest },
    { path: "/iletisim", changeFrequency: "yearly", priority: 0.3, lastModified: latest },
    /* Güven ve şeffaflık sayfaları — E-E-A-T sinyali, indekslenmeli. */
    { path: "/kunye", changeFrequency: "yearly", priority: 0.4, lastModified: latest },
    { path: "/editoryal-ilkeler", changeFrequency: "yearly", priority: 0.4, lastModified: latest },
    { path: "/duzeltme-politikasi", changeFrequency: "yearly", priority: 0.3, lastModified: latest },
    { path: "/yapay-zeka-politikasi", changeFrequency: "yearly", priority: 0.3, lastModified: latest },
    { path: "/gizlilik", changeFrequency: "yearly", priority: 0.2, lastModified: latest },
    { path: "/sartlar", changeFrequency: "yearly", priority: 0.2, lastModified: latest },
  ];

  const postRoutes = posts.map((post) => ({
    path: `/blog/${post.slug}`,
    changeFrequency: "monthly",
    /* Öne çıkan yazılara biraz daha ağırlık ver */
    priority: post.featured ? 0.9 : 0.7,
    lastModified: new Date(post.updated ?? post.date ?? Date.now()),
  }));

  const categoryRoutes = getCategoriesWithCounts()
    .filter((cat) => cat.count > 0)
    .map((cat) => ({
      path: `/kategori/${cat.slug}`,
      changeFrequency: "weekly",
      priority: 0.6,
      lastModified: latest,
    }));

  const tagRoutes = getAllTags().map((tag) => ({
    path: `/etiket/${tag.slug}`,
    changeFrequency: "weekly",
    priority: 0.4,
    lastModified: latest,
  }));

  /* Haber detay sayfaları. Haberler hızlı bayatlar; `changeFrequency`
     yayından sonra düşürülür ki tarayıcı bütçesi boşa gitmesin. */
  const newsRoutes = news
    .filter((n) => n.section)
    .map((item) => ({
      path: `/haber/${item.section.slug}/${item.slug}`,
      changeFrequency: "daily",
      priority: item.isFeatured || item.isBreaking ? 0.9 : 0.7,
      lastModified: new Date(item.updatedAt ?? item.publishedAt ?? Date.now()),
    }));

  /* Sadece içi DOLU haber bölümleri — boş bölüm sitemap'e girmez. */
  const sectionRoutes = getSectionsWithCounts()
    .filter((s) => s.count > 0)
    .map((s) => ({
      path: `/haber/${s.slug}`,
      changeFrequency: "hourly",
      priority: 0.8,
      lastModified: latest,
    }));

  /**
   * Kalıcı rehberler (evergreen).
   *
   * ⚠️ `lastModified` GERÇEK güncelleme tarihinden gelir — kontrol
   * tarihinden değil. Her kontrolde bu tarihi ileri almak, arama motoruna
   * yalan söylemektir ve "sahte tazelik" sinyalidir.
   *
   * Öncelik yüksek: bunlar sitenin kalıcı değeri ve en çok aranan
   * içerikleri. Haberler bayatlar, dosyalar kalır.
   */
  const guideRoutes = guides.map((guide) => ({
    path: guide.href,
    changeFrequency: "monthly",
    priority: guide.isFile ? 0.9 : 0.8,
    lastModified: new Date(guide.updatedAt ?? guide.publishedAt),
  }));

  /* Hub liste sayfaları — yalnızca içi dolu olanlar.
     `/enflasyon` hariç: adanmış statik sayfası zaten yukarıda. */
  const hubRoutes = getActiveHubs()
    .filter((hub) => hub.slug !== "enflasyon")
    .map((hub) => ({
      path: `/${hub.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
      lastModified: latest,
    }));

  return [
    ...staticRoutes,
    ...guideRoutes,
    ...hubRoutes,
    ...newsRoutes,
    ...sectionRoutes,
    ...postRoutes,
    ...categoryRoutes,
    ...tagRoutes,
  ].map(
    ({ path, ...rest }) => ({
      url: absoluteUrl(path),
      ...rest,
    }),
  );
}

/* Sitemap'i saatte bir tazele.
   (Next segment config'leri statik analiz eder — buraya değişken konamaz.) */
export const revalidate = 3600;
