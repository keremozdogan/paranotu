/**
 * ============================================================================
 *  SEO YARDIMCILARI
 * ============================================================================
 *  Tüm metadata ve JSON-LD üretimi burada. Sayfalar tek satırla çağırır:
 *      export const metadata = buildMetadata({ ... })
 *  Böylece niş değiştiğinde SEO davranışı da tek yerden değişir.
 * ============================================================================
 */

import siteConfig from "~/site.config";
import { absoluteUrl } from "./format";

/**
 * /og route'u için sorgu dizesi kurar. Başlık verilmezse route
 * site sloganına düşer.
 */
export function buildOgPath({ title, category, readingTime } = {}) {
  const params = new URLSearchParams();
  if (title) params.set("title", title);
  if (category) params.set("cat", category);
  if (readingTime) params.set("rt", String(readingTime));
  const qs = params.toString();
  return qs ? `/og?${qs}` : "/og";
}

/**
 * Sayfa metadata'sı üretir.
 * @param {object} o
 * @param {string} [o.title]        Sayfa başlığı (şablon otomatik uygulanır)
 * @param {string} [o.description]
 * @param {string} [o.path]         "/blog/slug" — canonical ve OG url
 * @param {string[]} [o.keywords]
 * @param {string} [o.image]        OG görseli (göreli yol olabilir)
 * @param {"website"|"article"} [o.type]
 * @param {string} [o.publishedTime] ISO
 * @param {string} [o.modifiedTime]  ISO
 * @param {string[]} [o.authors]
 * @param {boolean} [o.noindex]
 */
export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  keywords = [],
  /* Varsayılan YOK — boş bırakılırsa opengraph-image.js otomatik üretir. */
  image = null,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  noindex = false,
  /* Otomatik OG görselini zenginleştirmek için (yazı sayfalarında) */
  ogCategory,
  ogReadingTime,
} = {}) {
  const url = absoluteUrl(path);

  /**
   * OG görseli:
   *  1) Sayfanın kendi kapak görseli varsa o kullanılır
   *  2) Yoksa /og route'u başlığı gömerek görseli otomatik üretir
   * Böylece HER sayfanın geçerli bir paylaşım görseli olur.
   */
  const ogImage = image
    ? image.startsWith("http")
      ? image
      : absoluteUrl(image)
    : absoluteUrl(buildOgPath({ title, category: ogCategory, readingTime: ogReadingTime }));

  return {
    title,
    description,
    keywords: [...new Set([...(keywords || []), ...siteConfig.seo.defaultKeywords])],
    alternates: {
      canonical: path,
      types: { "application/rss+xml": absoluteUrl("/rss.xml") },
    },
    openGraph: {
      title: title ? `${title} | ${siteConfig.name}` : siteConfig.name,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      ...(ogImage
        ? { images: [{ url: ogImage, width: 1200, height: 630, alt: title ?? siteConfig.name }] }
        : {}),
      ...(type === "article"
        ? {
            publishedTime,
            modifiedTime,
            authors,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? siteConfig.name,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
      ...(siteConfig.social.twitterHandle
        ? { creator: siteConfig.social.twitterHandle, site: siteConfig.social.twitterHandle }
        : {}),
    },
    ...(noindex
      ? { robots: { index: false, follow: false } }
      : {
          robots: {
            index: true,
            follow: true,
            googleBot: {
              index: true,
              follow: true,
              "max-image-preview": "large",
              "max-snippet": -1,
              "max-video-preview": -1,
            },
          },
        }),
  };
}

/* -------------------------------------------------------------------------- */
/*  JSON-LD (yapılandırılmış veri)                                            */
/* -------------------------------------------------------------------------- */

export function organizationJsonLd() {
  const sameAs = Object.entries(siteConfig.social)
    .filter(([key, value]) => value && !["email", "twitterHandle"].includes(key))
    .map(([, value]) => value);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: siteConfig.lang,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/blog?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function articleJsonLd(post) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    inLanguage: siteConfig.lang,
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/blog/${post.slug}`) },
    author: { "@type": "Person", name: post.author?.name ?? siteConfig.name },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    ...(post.image ? { image: [absoluteUrl(post.image)] } : {}),
    ...(post.keywords?.length ? { keywords: post.keywords.join(", ") } : {}),
    articleSection: post.category?.name,
    wordCount: post.wordCount,
  };
}

/**
 * NewsArticle JSON-LD — haber sayfaları için.
 *
 * `BlogPosting` yerine `NewsArticle` kullanılır; Google Haberler ve "Top
 * stories" karuseli bu tipi bekler.
 *
 * ⚠️ Structured data SAYFADA GÖRÜNMEYEN bilgi içermemelidir. Bu yüzden
 * buradaki her alan sayfada da render edilir: başlık, özet, tarihler, yazar,
 * bölüm, görsel. Görünmeyen alan eklemek Google'ın manuel işlem gerekçesidir.
 */
export function newsArticleJsonLd(item) {
  const url = absoluteUrl(`/haber/${item.section.slug}/${item.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description: item.summary,
    datePublished: item.publishedAt,
    dateModified: item.updatedAt ?? item.publishedAt,
    inLanguage: siteConfig.lang,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    author: {
      "@type": "Person",
      name: item.author?.name ?? siteConfig.name,
      ...(item.author?.id ? { url: absoluteUrl(`/yazarlar/${item.author.id}`) } : {}),
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    /* Google birden fazla en-boy oranı önerir (1:1, 4:3, 16:9).
       Kendi görselimiz yoksa /og üretimi 16:9 verir. */
    image: item.image?.src
      ? [absoluteUrl(item.image.src)]
      : [absoluteUrl(buildOgPath({ title: item.title, category: item.section?.name }))],
    articleSection: item.section?.name,
    ...(item.keywords?.length ? { keywords: item.keywords.join(", ") } : {}),
    wordCount: item.wordCount,
    /* Kaynak gösterimi — telif şeffaflığı */
    ...(item.sourceUrl ? { isBasedOn: item.sourceUrl } : {}),
    /* Canlı gelişme haberleri için */
    ...(item.isLive
      ? {
          "@type": "NewsArticle",
          liveBlogUpdate: (item.liveUpdates ?? []).map((u) => ({
            "@type": "BlogPosting",
            headline: u.title,
            datePublished: u.at,
          })),
        }
      : {}),
  };
}

/** @param {Array<{name: string, path: string}>} items */
export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * JSON-LD script etiketi. Sunucuda üretilen veriyi basar.
 * Kullanım: <JsonLd data={articleJsonLd(post)} />
 */
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        /* `<` kaçışı: içerik </script> ile HTML'i kırmasın */
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
