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
