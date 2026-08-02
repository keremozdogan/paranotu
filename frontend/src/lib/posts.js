/**
 * ============================================================================
 *  İÇERİK KATMANI — Markdown / MDX okuma
 * ============================================================================
 *  `/content/posts/*.mdx` dosyalarını okur, frontmatter'ı ayrıştırır ve
 *  uygulamanın geri kalanına temiz bir post objesi verir.
 *
 *  SADECE sunucu tarafında çalışır (fs kullanır). Client component'ten
 *  import etme — gerekli veriyi prop olarak geçir.
 * ============================================================================
 */

import "server-only";

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import readingTime from "reading-time";

import siteConfig from "~/site.config";
import { slugify } from "@/lib/slug";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const EXTENSIONS = [".mdx", ".md"];

/* -------------------------------------------------------------------------- */
/*  Yardımcılar                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Slug üretimi `@/lib/slug` içine taşındı — haber katmanı, provider'lar ve
 * istemci tarafı arama da aynı fonksiyonu kullanıyor.
 * Geriye dönük uyumluluk için buradan yeniden dışa aktarılıyor.
 */
export { slugify };

function stripMarkdown(md) {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[#>*_`~|-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toExcerpt(frontmatter, body) {
  if (frontmatter.description) return frontmatter.description;
  if (frontmatter.excerpt) return frontmatter.excerpt;
  const text = stripMarkdown(body);
  const limit = siteConfig.content.excerptLength;
  return text.length > limit ? text.slice(0, limit).trimEnd() + "…" : text;
}

function resolveCategory(slugOrName) {
  if (!slugOrName) return null;
  const wanted = slugify(slugOrName);
  const found = siteConfig.categories.find(
    (c) => c.slug === wanted || slugify(c.name) === wanted,
  );
  /* site.config'de tanımlı değilse yine de kullanılabilir bir obje üret */
  return found ?? { slug: wanted, name: slugOrName, description: "" };
}

function resolveAuthor(key) {
  const id = key || siteConfig.defaultAuthor;
  const author = siteConfig.authors[id] ?? siteConfig.authors[siteConfig.defaultAuthor];
  return { id, ...author };
}

/* -------------------------------------------------------------------------- */
/*  Dosya okuma                                                               */
/* -------------------------------------------------------------------------- */

function listPostFiles() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => EXTENSIONS.includes(path.extname(f)));
}

/**
 * Tek bir dosyayı post objesine çevirir.
 * `content` alanı ham MDX metnidir — render'ı sayfa yapar.
 */
function parsePostFile(filename) {
  const filePath = path.join(POSTS_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const slug = data.slug || filename.replace(/\.mdx?$/, "");
  const stats = readingTime(content);

  return {
    slug,
    /* --- SEO / frontmatter --- */
    title: data.title || slug,
    description: toExcerpt(data, content),
    keywords: data.keywords || data.tags || [],
    tags: data.tags || [],
    canonical: data.canonical || null,
    noindex: data.noindex === true,

    /* --- Sınıflandırma --- */
    category: resolveCategory(data.category),
    author: resolveAuthor(data.author),

    /* --- Tarihler (ISO string; Date objesi serialize sorunu çıkarır) --- */
    date: data.date ? new Date(data.date).toISOString() : null,
    updated: data.updated ? new Date(data.updated).toISOString() : null,

    /* --- Görsel --- */
    image: data.image || data.cover || null,
    imageAlt: data.imageAlt || data.title || "",

    /* --- Bayraklar --- */
    featured: data.featured === true,
    draft: data.draft === true,

    /* --- Türetilmiş --- */
    readingTime: Math.max(1, Math.round(stats.minutes)),
    wordCount: stats.words,

    content,
    _file: filename,
  };
}

/* -------------------------------------------------------------------------- */
/*  Genel API                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Yayındaki tüm yazılar — yeniden eskiye sıralı.
 * `cache()` sayesinde tek istek içinde diski bir kez okur.
 */
export const getAllPosts = cache(() => {
  return listPostFiles()
    .map(parsePostFile)
    .filter((post) => {
      /* Taslaklar sadece geliştirmede görünür */
      if (post.draft && process.env.NODE_ENV === "production") return false;
      return true;
    })
    .sort((a, b) => new Date(b.date ?? 0) - new Date(a.date ?? 0));
});

/** Liste görünümleri için — ağır `content` alanı olmadan. */
export const getPostSummaries = cache(() =>
  getAllPosts().map(({ content, ...meta }) => meta),
);

/** @returns {object|null} */
export const getPostBySlug = cache((slug) => {
  return getAllPosts().find((post) => post.slug === slug) ?? null;
});

/** generateStaticParams için */
export const getAllSlugs = cache(() => getAllPosts().map((p) => p.slug));

/** Kategori slug'ına göre filtreler. */
export const getPostsByCategory = cache((categorySlug) =>
  getPostSummaries().filter((p) => p.category?.slug === categorySlug),
);

/** Etikete göre filtreler. */
export const getPostsByTag = cache((tag) => {
  const wanted = slugify(tag);
  return getPostSummaries().filter((p) =>
    (p.tags || []).some((t) => slugify(t) === wanted),
  );
});

/**
 * site.config'deki kategorileri, gerçek yazı sayılarıyla birlikte döner.
 * Boş kategoriler menüde/sitemap'te gösterilmesin diye `count` kullanılır.
 */
export const getCategoriesWithCounts = cache(() => {
  const posts = getPostSummaries();
  return siteConfig.categories.map((cat) => ({
    ...cat,
    count: posts.filter((p) => p.category?.slug === cat.slug).length,
  }));
});

/** Tüm etiketler, kullanım sayısına göre azalan. */
export const getAllTags = cache(() => {
  const counts = new Map();
  for (const post of getPostSummaries()) {
    for (const tag of post.tags || []) {
      const key = slugify(tag);
      const entry = counts.get(key) ?? { slug: key, name: tag, count: 0 };
      entry.count += 1;
      counts.set(key, entry);
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count);
});

/** Öne çıkan yazılar; işaretli yazı yoksa en yeniler. */
export const getFeaturedPosts = cache((limit = 3) => {
  const posts = getPostSummaries();
  const featured = posts.filter((p) => p.featured);
  return (featured.length ? featured : posts).slice(0, limit);
});

/**
 * İlgili yazılar: önce aynı kategori, sonra ortak etiket sayısına göre.
 */
export const getRelatedPosts = cache((slug, limit = 3) => {
  const current = getPostBySlug(slug);
  if (!current) return [];

  const currentTags = new Set((current.tags || []).map(slugify));

  return getPostSummaries()
    .filter((p) => p.slug !== slug)
    .map((p) => {
      let score = 0;
      if (p.category?.slug === current.category?.slug) score += 10;
      score += (p.tags || []).filter((t) => currentTags.has(slugify(t))).length * 3;
      return { post: p, score };
    })
    .sort((a, b) => b.score - a.score || new Date(b.post.date) - new Date(a.post.date))
    .slice(0, limit)
    .map((x) => x.post);
});

/** Yazı içi gezinme: önceki / sonraki. */
export const getAdjacentPosts = cache((slug) => {
  const posts = getPostSummaries();
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) return { previous: null, next: null };
  return {
    /* Liste yeniden eskiye sıralı: index+1 daha eski = "önceki yazı" */
    previous: posts[i + 1] ?? null,
    next: posts[i - 1] ?? null,
  };
});

/** Basit sayfalama yardımcısı. */
export function paginate(items, page = 1, perPage = siteConfig.content.postsPerPage) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    page: current,
    perPage,
    totalItems: items.length,
    totalPages,
    hasPrevious: current > 1,
    hasNext: current < totalPages,
  };
}

/**
 * Markdown başlıklarından içindekiler tablosu çıkarır (H2 + H3).
 * rehype-slug ile aynı id'yi üretmek için aynı slugify'ı kullanır.
 */
export function extractHeadings(markdown) {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, "");
  const headings = [];
  const re = /^(#{2,3})\s+(.+?)\s*$/gm;
  let match;
  while ((match = re.exec(withoutCode)) !== null) {
    const text = match[2].replace(/[*_`]/g, "").trim();
    headings.push({ level: match[1].length, text, id: slugify(text) });
  }
  return headings;
}

/**
 * İstemci tarafı arama için hafif indeks.
 *
 * `href` alanı burada üretilir — arama bileşeni yol biçimini bilmez.
 * Haber katmanı da aynı şekli döndürdüğü için ikisi tek listede birleşebilir
 * (bkz. Header.jsx).
 */
export const getSearchIndex = cache(() =>
  getPostSummaries().map((p) => ({
    slug: p.slug,
    href: `/blog/${p.slug}`,
    title: p.title,
    description: p.description,
    category: p.category?.name ?? "",
    tags: p.tags ?? [],
    date: p.date,
    kind: "rehber",
  })),
);
