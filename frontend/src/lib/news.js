/**
 * ============================================================================
 *  HABER İÇERİK KATMANI — editoryal haberler
 * ============================================================================
 *  `content/news/*.mdx` dosyalarını okur ve haber objesine çevirir.
 *  `posts.js` (rehberler) ile aynı desenleri izler ama farklı bir şema
 *  kullanır: haberler zaman duyarlıdır, kaynak künyesi taşır, önem
 *  skoruyla sıralanır ve canlı gelişme olabilir.
 *
 *  SADECE sunucu tarafında çalışır (fs kullanır).
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  GÖRSEL KURALI — sıkı
 *  ────────────────────────────────────────────────────────────────────────
 *  Bir haberin görseli varsa `imageCredit` ZORUNLUDUR. Kredi yoksa görsel
 *  yayımlanmaz (`resolveImage()` onu düşürür ve uyarı basar). Bu, lisanssız
 *  görselin sisteme sızmasını yapısal olarak engeller — editörün iyi
 *  niyetine bırakılmaz.
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

const NEWS_DIR = path.join(process.cwd(), "content", "news");
const EXTENSIONS = [".mdx", ".md"];

/* -------------------------------------------------------------------------- */
/*  Taksonomi                                                                 */
/* -------------------------------------------------------------------------- */

/** Yayımlanabilir (aktif) haber bölümleri. */
export const activeSections = () =>
  (siteConfig.newsSections ?? []).filter((s) => s.active !== false);

/** Ana menüde görünecek bölümler. */
export const navSections = () => activeSections().filter((s) => s.inNav !== false);

export function getSection(slug) {
  return (siteConfig.newsSections ?? []).find((s) => s.slug === slug) ?? null;
}

function resolveSection(value) {
  if (!value) return null;
  const wanted = slugify(value);
  const found = (siteConfig.newsSections ?? []).find(
    (s) => s.slug === wanted || slugify(s.name) === wanted,
  );
  return found ? { slug: found.slug, name: found.name, shortName: found.shortName ?? found.name } : null;
}

function resolveAuthor(key) {
  const id = key || siteConfig.defaultAuthor;
  const author = siteConfig.authors[id] ?? siteConfig.authors[siteConfig.defaultAuthor];
  return author ? { id, ...author } : null;
}

/* -------------------------------------------------------------------------- */
/*  Görsel                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Görsel metadata'sını çözer.
 *
 * Kredisiz görsel YAYIMLANMAZ. Bu bilinçli olarak sert bir kural:
 * bir haber sitesinde lisans takibi editörün hafızasına bırakılamaz.
 *
 * @returns {object|null} Görsel yoksa veya kredi eksikse null
 */
function resolveImage(data, slug) {
  const src = data.heroImage ?? data.image ?? data.cover ?? null;
  if (!src) return null;

  const credit = data.imageCredit ?? null;
  if (!credit) {
    console.warn(
      `[news] "${slug}" görseli KREDİSİZ olduğu için yayımlanmadı. ` +
        `frontmatter'a imageCredit ekle (örn. imageCredit: "TCMB").`,
    );
    return null;
  }

  /**
   * Lisans adı da ZORUNLU. Kredi "kimin çektiği", lisans "hangi hakla
   * kullandığımız" sorusunu yanıtlar. İkincisi olmadan birincisi
   * kullanım izni anlamına gelmez.
   */
  const licenseName = data.imageLicense ?? data.imageLicenseName ?? null;
  if (!licenseName) {
    console.warn(
      `[news] "${slug}" görseli LİSANSSIZ olduğu için yayımlanmadı. ` +
        `frontmatter'a imageLicense ekle (örn. imageLicense: "CC BY-SA 4.0").`,
    );
    return null;
  }

  return {
    src,
    thumbnail: data.thumbnailImage ?? src,
    alt: data.imageAlt ?? "",
    caption: data.imageCaption ?? null,
    credit,
    source: data.imageSource ?? null,
    /* Görselin geldiği sayfa — atıf koşulu genelde bunu ister. */
    sourceUrl: data.imageSourceUrl ?? null,
    licenseName,
    licenseUrl: data.imageLicenseUrl ?? null,
    /* "50% 30%" — mobilde kırpma merkezini kaydırmak için */
    focalPoint: data.imageFocalPoint ?? "50% 50%",
    width: data.imageWidth ?? null,
    height: data.imageHeight ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/*  Önem skoru                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Ana sayfadaki sıralamayı belirler. "En yeni" tek başına yeterli değil —
 * TCMB faiz kararı, üç saat önceki bir sektör haberinden önemlidir.
 *
 * ⚠️ OTOMATİK PUAN EDİTORYAL KONTROLÜN YERİNE GEÇMEZ.
 * `editorialPriority` (frontmatter) her zaman en ağır sinyaldir ve
 * `isPinned` skoru tamamen bypass eder.
 *
 * @returns {number} 0–100 arası
 */
export function computeImportance(item, now = new Date()) {
  /* Editör elle puan verdiyse ona saygı duy. */
  if (typeof item.editorialPriority === "number") {
    return Math.max(0, Math.min(100, item.editorialPriority));
  }

  let score = 0;

  /* Son dakika — en güçlü otomatik sinyal */
  if (item.isBreaking) score += 30;
  if (item.isLive) score += 15;
  if (item.isFeatured) score += 12;

  /* Resmî açıklamaya dayanıyor mu? (TCMB kararı, TÜİK verisi) */
  if (item.isOfficial) score += 12;

  /* Piyasa etkisi ve Türkiye ilgisi — frontmatter'dan, 0–3 arası */
  score += Math.min(3, Math.max(0, item.marketImpact ?? 0)) * 6;
  score += Math.min(3, Math.max(0, item.turkeyRelevance ?? 0)) * 5;

  /* Tazelik — 48 saatte doğrusal sönümlenir. Haberin yaşı önemlidir ama
     tek başına belirleyici değildir. */
  if (item.publishedAt) {
    const ageHours = (now - new Date(item.publishedAt)) / 3600000;
    if (ageHours >= 0) score += Math.max(0, 20 * (1 - ageHours / 48));
  }

  return Math.round(Math.max(0, Math.min(100, score)));
}

/* -------------------------------------------------------------------------- */
/*  Ayrıştırma                                                                */
/* -------------------------------------------------------------------------- */

function listNewsFiles() {
  if (!fs.existsSync(NEWS_DIR)) return [];
  return fs.readdirSync(NEWS_DIR).filter((f) => EXTENSIONS.includes(path.extname(f)));
}

function stripMarkdown(md) {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNewsFile(filename) {
  const raw = fs.readFileSync(path.join(NEWS_DIR, filename), "utf8");
  const { data, content } = matter(raw);
  const slug = data.slug || filename.replace(/\.mdx?$/, "");
  const stats = readingTime(content);

  const summary =
    data.summary ??
    data.description ??
    (() => {
      const text = stripMarkdown(content);
      const limit = siteConfig.content.excerptLength;
      return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text;
    })();

  const item = {
    id: data.id ?? slug,
    slug,
    title: data.title ?? slug,
    /* Dar alanlarda (piyasa bandı, ilgili haberler) kullanılacak kısa başlık */
    shortTitle: data.shortTitle ?? null,
    summary,
    seoTitle: data.seoTitle ?? null,
    seoDescription: data.seoDescription ?? summary,

    /* --- Sınıflandırma --- */
    section: resolveSection(data.section ?? data.category),
    subsections: data.subsections ?? [],
    tags: data.tags ?? [],
    keywords: data.keywords ?? data.tags ?? [],

    /**
     * Kart ve haber sayfasındaki grafiğin motifi. Normalde haberin
     * konusundan otomatik çıkarılır (`resolveMotifKey`); bu alan yalnızca
     * otomatik seçim isabetsiz kaldığında editörün elle devraldığı kapıdır.
     * Geçerli değerler: CategoryArt içindeki MOTIFS anahtarları.
     */
    motif: data.motif ?? null,

    /* --- Künye --- */
    author: resolveAuthor(data.author),
    editor: data.editor ? resolveAuthor(data.editor) : null,
    sourceName: data.sourceName ?? null,
    sourceUrl: data.sourceUrl ?? null,
    canonicalUrl: data.canonicalUrl ?? null,

    /* --- Zaman --- */
    publishedAt: data.publishedAt ?? data.date ? new Date(data.publishedAt ?? data.date).toISOString() : null,
    updatedAt: data.updatedAt ?? data.updated ? new Date(data.updatedAt ?? data.updated).toISOString() : null,

    /* --- Görsel --- */
    /* Görsel — kredi/lisans eksikse `resolveImage` null döner ve
       `rightsStatus` üzerinden indexability kapısı da bunu görür. */
    image: (() => {
      const img = resolveImage(data, slug);
      if (!img) return null;
      /* Kredi + lisans varsa kullanılabilir. `resolveImage` zaten ikisi
         eksikse null döndürüyor; bu, arayüz tarafındaki ikinci kapı. */
      return {
        ...img,
        rightsStatus: img.credit && img.licenseName ? "cleared" : "unknown",
      };
    })(),

    /* --- Editoryal bayraklar --- */
    isBreaking: data.isBreaking === true,
    isFeatured: data.isFeatured === true || data.featured === true,
    isPinned: data.isPinned === true,
    isOfficial: data.isOfficial === true,
    isLive: data.isLive === true,
    liveStatus: data.liveStatus ?? null, // "ongoing" | "paused" | "ended"
    liveUpdates: Array.isArray(data.liveUpdates) ? data.liveUpdates : [],

    /* --- Sıralama sinyalleri --- */
    editorialPriority: typeof data.editorialPriority === "number" ? data.editorialPriority : null,
    marketImpact: data.marketImpact ?? 0,
    turkeyRelevance: data.turkeyRelevance ?? 0,

    /* --- İlişkiler --- */
    relatedSymbols: data.relatedSymbols ?? [],
    relatedCountries: data.relatedCountries ?? [],
    relatedCompanies: data.relatedCompanies ?? [],

    /* --- Düzeltme geçmişi (§18) --- */
    corrections: Array.isArray(data.corrections) ? data.corrections : [],

    /* --- Özgün değer bölümleri (indexability kapısı bunları okur) --- */
    whyItMatters: data.whyItMatters ?? null,
    turkeyImpact: data.turkeyImpact ?? null,
    citizenImpact: data.citizenImpact ?? null,
    marketImpactNote: data.marketImpactNote ?? null,
    comparison: data.comparison ?? null,

    /* --- Kaynaklar --- */
    sources: Array.isArray(data.sources) ? data.sources : [],

    /**
     * --- KALİTE KAPILARI ---
     *
     * MDX'te elle yazılan bir haber, tanımı gereği editoryal süreçten
     * geçmiştir: repoya commit edilmiş, gözden geçirilmiştir. Bu yüzden
     * onay bilgisini frontmatter'dan türetiyoruz.
     *
     * ⚠️ Ama otomatik VARSAYMIYORUZ:
     *   • `approvedBy` yoksa editör, o da yoksa yazar sayılır — ama
     *     ikisi de yoksa NULL kalır ve haber indexlenemez.
     *   • `hasVerifiedSource` kaynak listesi DOLU ise true olur.
     *     Kaynaksız haber indexlenemez.
     *   • `passedDuplicateCheck` elle yazılan içerikte varsayılan true;
     *     D1'den gelen otomatik içerikte Worker bunu ayrıca işaretler.
     */
    approvedBy: data.approvedBy ?? data.editor ?? data.author ?? null,
    hasVerifiedSource: Array.isArray(data.sources) && data.sources.length > 0,
    passedDuplicateCheck: data.passedDuplicateCheck !== false,
    clusterId: data.clusterId ?? null,
    clusterCanonicalId: data.clusterCanonicalId ?? null,

    /* --- Durum --- */
    status: data.status ?? (data.draft === true ? "draft" : "published"),
    noindex: data.noindex === true,

    /* --- Türetilmiş --- */
    readingTime: Math.max(1, Math.round(stats.minutes)),
    wordCount: stats.words,
    isExternal: false,
    snippetOnly: false,

    content,
    _file: filename,
  };

  item.importanceScore = computeImportance(item);
  return item;
}

/* -------------------------------------------------------------------------- */
/*  Genel API                                                                 */
/* -------------------------------------------------------------------------- */

/** Yayındaki tüm haberler — yeniden eskiye. */
export const getAllNews = cache(() =>
  listNewsFiles()
    .map(parseNewsFile)
    .filter((item) => {
      if (item.status !== "published" && process.env.NODE_ENV === "production") return false;
      /* Bölümü tanınmayan veya kapalı bölümdeki haber yayımlanmaz. */
      if (!item.section) return false;
      return true;
    })
    .sort((a, b) => new Date(b.publishedAt ?? 0) - new Date(a.publishedAt ?? 0)),
);

/** Liste görünümleri için — ağır `content` alanı olmadan. */
export const getNewsSummaries = cache(() =>
  getAllNews().map(({ content, ...meta }) => meta),
);

export const getNewsBySlug = cache((slug) => getAllNews().find((n) => n.slug === slug) ?? null);

export const getAllNewsSlugs = cache(() => getAllNews().map((n) => n.slug));

export const getNewsBySection = cache((sectionSlug) =>
  getNewsSummaries().filter((n) => n.section?.slug === sectionSlug),
);

/**
 * Ana sayfa manşet sıralaması: sabitlenenler önce, sonra önem skoru,
 * eşitlikte daha yeni olan.
 */
export const getRankedNews = cache((limit = 12) =>
  [...getNewsSummaries()]
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      if (b.importanceScore !== a.importanceScore) return b.importanceScore - a.importanceScore;
      return new Date(b.publishedAt ?? 0) - new Date(a.publishedAt ?? 0);
    })
    .slice(0, limit),
);

/** Son dakika bandı için — sadece işaretli ve taze olanlar. */
export const getBreakingNews = cache((limit = 5, maxAgeHours = 24) => {
  const now = Date.now();
  return getNewsSummaries()
    .filter((n) => {
      if (!n.isBreaking || !n.publishedAt) return false;
      return (now - new Date(n.publishedAt).getTime()) / 3600000 <= maxAgeHours;
    })
    .slice(0, limit);
});

/** İlgili haberler: aynı bölüm + ortak etiket/sembol. */
export const getRelatedNews = cache((slug, limit = 4) => {
  const current = getNewsBySlug(slug);
  if (!current) return [];

  const tags = new Set((current.tags ?? []).map(slugify));
  const symbols = new Set(current.relatedSymbols ?? []);

  return getNewsSummaries()
    .filter((n) => n.slug !== slug)
    .map((n) => {
      let score = 0;
      if (n.section?.slug === current.section?.slug) score += 10;
      score += (n.tags ?? []).filter((t) => tags.has(slugify(t))).length * 3;
      score += (n.relatedSymbols ?? []).filter((s) => symbols.has(s)).length * 4;
      return { item: n, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.item.publishedAt ?? 0) - new Date(a.item.publishedAt ?? 0))
    .slice(0, limit)
    .map((x) => x.item);
});

/** Bölümleri gerçek haber sayılarıyla döner — boş bölüm menüde gizlenir. */
export const getSectionsWithCounts = cache(() => {
  const news = getNewsSummaries();
  return activeSections().map((section) => ({
    ...section,
    count: news.filter((n) => n.section?.slug === section.slug).length,
  }));
});

/** Haber var mı? Ana sayfa düzeni buna göre değişir. */
export const hasNews = cache(() => getNewsSummaries().length > 0);

/**
 * Arama indeksi — `posts.js` içindeki `getSearchIndex()` ile AYNI şekli
 * döner, böylece ikisi tek listede birleştirilebilir.
 */
export const getNewsSearchIndex = cache(() =>
  getNewsSummaries()
    .filter((n) => n.section && !n.noindex)
    .map((n) => ({
      slug: n.slug,
      href: `/haber/${n.section.slug}/${n.slug}`,
      title: n.title,
      description: n.summary,
      category: n.section.name,
      tags: n.tags ?? [],
      date: n.publishedAt,
      kind: "haber",
    })),
);
