/**
 * Dinamik sitemap — /sitemap.xml
 *
 * Kaynaklar: statik sayfalar + tüm yazılar + dolu kategoriler + etiketler.
 * Yeni bir .mdx dosyası eklediğinde sitemap kendiliğinden güncellenir.
 */

import siteConfig from "~/site.config";
import { getPostSummaries, getCategoriesWithCounts, getAllTags } from "@/lib/posts";
import { absoluteUrl } from "@/lib/format";

export default function sitemap() {
  const posts = getPostSummaries().filter((p) => !p.noindex);

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
    { path: "/hakkinda", changeFrequency: "yearly", priority: 0.4, lastModified: latest },
    { path: "/iletisim", changeFrequency: "yearly", priority: 0.3, lastModified: latest },
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

  return [...staticRoutes, ...postRoutes, ...categoryRoutes, ...tagRoutes].map(
    ({ path, ...rest }) => ({
      url: absoluteUrl(path),
      ...rest,
    }),
  );
}

/* Sitemap'i saatte bir tazele.
   (Next segment config'leri statik analiz eder — buraya değişken konamaz.) */
export const revalidate = 3600;
