/**
 * ============================================================================
 *  KALICI REHBERLER (EVERGREEN) — içerik katmanı
 * ============================================================================
 *  `content/guides/<hub>/<slug>.mdx` dosyalarını okur.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  NEDEN MDX, D1 DEĞİL?
 *  ────────────────────────────────────────────────────────────────────────
 *  Evergreen içerik uzun ömürlüdür, sürüm kontrolünde tutulmalıdır ve
 *  editör onayıyla değişir. Git'te tutmak = değişiklik geçmişi, code review,
 *  geri alma. D1'deki `evergreen_guides` tablosu bu içeriklerin TAZELİK
 *  DURUMUNU izler (Worker oraya "kontrol zamanı geldi" işareti koyar);
 *  metnin kendisi burada, repoda durur.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  TARİH DİSİPLİNİ — en kritik kural
 *  ────────────────────────────────────────────────────────────────────────
 *    publishedAt    → İLK yayın. ASLA değişmez.
 *    updatedAt      → yalnızca içerikte ANLAMLI değişiklik olduğunda.
 *    lastCheckedAt  → kontrol edildi, değişiklik gerekmedi.
 *
 *  `dateModified` structured data'ya SADECE `updatedAt`'ten gider.
 *  Kontrol tarihini güncelleme tarihi gibi göstermek sahte güncelliktir ve
 *  Google'ın "content freshness" sinyalini manipüle etmek sayılır.
 * ============================================================================
 */

import "server-only";

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import readingTime from "reading-time";

import siteConfig from "~/site.config";

const GUIDES_DIR = path.join(process.cwd(), "content", "guides");

/**
 * HUB KAYDI — kalıcı URL yapısının tek tanımı.
 *
 * ⚠️ Bir hub veya slug yayına girdikten sonra DEĞİŞTİRİLMEZ. Değişmesi
 * gerekiyorsa eski URL'den 301 yönlendirme kurulmalıdır (next.config.mjs).
 * Kalıcı içeriğin URL'i kalıcı olmalı — bağlantılar ve sıralama ona bağlı.
 */
export const HUBS = [
  {
    slug: "asgari-ucret",
    name: "Asgari Ücret",
    description:
      "Güncel asgari ücret, işverene maliyeti ve ara zam tartışmaları — resmî rakamlarla.",
  },
  {
    slug: "faiz",
    name: "Faiz",
    description:
      "TCMB faiz kararlarının kredi, mevduat ve bütçen üzerindeki etkisi.",
  },
  {
    slug: "enflasyon",
    name: "Enflasyon",
    description: "Enflasyonun maaşlara, birikime ve alım gücüne etkisi.",
  },
  {
    slug: "butce",
    name: "Bütçe",
    description: "Bütçe kurma yöntemleri ve harcama planlama rehberleri.",
  },
  {
    slug: "altin",
    name: "Altın",
    description: "Gram altın ve ons altını etkileyen faktörler.",
  },
  {
    slug: "doviz",
    name: "Döviz",
    description: "Dolar ve euro kurunu etkileyen gelişmeler.",
  },
  {
    slug: "emekli",
    name: "Emekli",
    description: "Emekli maaşı, zam oranları ve refah payı.",
  },
  {
    slug: "kredi",
    name: "Kredi",
    description: "Kredi faizleri, taksit hesabı ve borç yönetimi.",
  },
];

export const getHub = (slug) => HUBS.find((h) => h.slug === slug) ?? null;

/** Tazelik durumu → okura gösterilecek Türkçe etiket. */
export const FRESHNESS_LABEL = {
  current: "Güncel",
  review_due: "Kontrol zamanı geldi",
  official_data_changed: "Resmî veri değişti",
  editor_update_needed: "Editör güncellemesi gerekli",
  source_error: "Kaynak hatası",
  stale: "Eski içerik",
};

function resolveAuthor(key) {
  const id = key || siteConfig.defaultAuthor;
  const author = siteConfig.authors[id] ?? siteConfig.authors[siteConfig.defaultAuthor];
  return author ? { id, ...author } : null;
}

function listGuideFiles() {
  if (!fs.existsSync(GUIDES_DIR)) return [];

  const out = [];
  for (const hub of fs.readdirSync(GUIDES_DIR)) {
    const hubDir = path.join(GUIDES_DIR, hub);
    if (!fs.statSync(hubDir).isDirectory()) continue;
    for (const file of fs.readdirSync(hubDir)) {
      if (/\.mdx?$/.test(file)) out.push({ hub, file });
    }
  }
  return out;
}

function parseGuideFile({ hub, file }) {
  const raw = fs.readFileSync(path.join(GUIDES_DIR, hub, file), "utf8");
  const { data, content } = matter(raw);
  const slug = data.slug || file.replace(/\.mdx?$/, "");
  const stats = readingTime(content);

  const publishedAt = data.publishedAt ? new Date(data.publishedAt).toISOString() : null;
  /* updatedAt verilmemişse publishedAt'e düşer — "hiç güncellenmedi" demek.
     Bugünün tarihini KOYMUYORUZ; bu sahte güncellik olurdu. */
  const updatedAt = data.updatedAt ? new Date(data.updatedAt).toISOString() : publishedAt;

  return {
    id: `${hub}/${slug}`,
    hub: getHub(hub) ?? { slug: hub, name: hub, description: "" },
    slug,
    href: `/${hub}/${slug}`,

    title: data.title ?? slug,
    summary: data.summary ?? data.description ?? "",
    seoTitle: data.seoTitle ?? null,
    seoDescription: data.seoDescription ?? data.summary ?? data.description ?? "",
    keywords: data.keywords ?? [],

    publishedAt,
    updatedAt,
    lastCheckedAt: data.lastCheckedAt ? new Date(data.lastCheckedAt).toISOString() : null,
    /* Güncelleme nedeni sayfada GÖRÜNÜR — okur neyin değiştiğini bilmeli. */
    updateReason: data.updateReason ?? null,
    nextReviewAt: data.nextReviewAt ? new Date(data.nextReviewAt).toISOString() : null,
    updateTrigger: data.updateTrigger ?? null,
    freshnessStatus: data.freshnessStatus ?? "current",

    author: resolveAuthor(data.author),
    editor: data.editor ? resolveAuthor(data.editor) : null,

    /* Kaynaklar zorunlu — indexability kapısı bunu kontrol ediyor. */
    sources: Array.isArray(data.sources) ? data.sources : [],
    revisions: Array.isArray(data.revisions) ? data.revisions : [],

    /**
     * Görsel — kredi VE lisans zorunlu.
     * `rightsStatus !== "cleared"` ise `SmartImage` gerçek görseli
     * çizmez, kategori grafiğine düşer. Lisansı belirsiz görselin
     * yayına çıkması bu şekilde yapısal olarak engellenir.
     */
    image: data.image
      ? {
          src: data.image,
          alt: data.imageAlt ?? "",
          caption: data.imageCaption ?? null,
          credit: data.imageCredit ?? null,
          sourceUrl: data.imageSourceUrl ?? null,
          licenseName: data.imageLicense ?? data.imageLicenseName ?? null,
          licenseUrl: data.imageLicenseUrl ?? null,
          focalPoint: data.imageFocalPoint ?? "50% 50%",
          width: data.imageWidth ?? null,
          height: data.imageHeight ?? null,
          rightsStatus:
            data.imageCredit && (data.imageLicense ?? data.imageLicenseName)
              ? "cleared"
              : "unknown",
        }
      : null,

    /* Ana sayfa "ParaNotu Dosyaları" bölümünde görünsün mü? */
    isFile: data.isFile === true,
    filePriority: typeof data.filePriority === "number" ? data.filePriority : 100,

    schemaType: data.schemaType === "BlogPosting" ? "BlogPosting" : "Article",
    status: data.status ?? (data.draft === true ? "draft" : "published"),
    noindex: data.noindex === true,

    readingTime: Math.max(1, Math.round(stats.minutes)),
    wordCount: stats.words,
    content,
  };
}

export const getAllGuides = cache(() =>
  listGuideFiles()
    .map(parseGuideFile)
    .filter((g) => g.status === "published" || process.env.NODE_ENV !== "production")
    .sort((a, b) => a.filePriority - b.filePriority),
);

export const getGuideSummaries = cache(() =>
  getAllGuides().map(({ content, ...meta }) => meta),
);

export const getGuide = cache((hub, slug) =>
  getAllGuides().find((g) => g.hub.slug === hub && g.slug === slug) ?? null,
);

export const getGuidesByHub = cache((hub) =>
  getGuideSummaries().filter((g) => g.hub.slug === hub),
);

/** Ana sayfadaki "ParaNotu Dosyaları" bölümü. */
export const getFeaturedFiles = cache((limit = 6) =>
  getGuideSummaries()
    .filter((g) => g.isFile)
    .slice(0, limit),
);

/** Sayfa üretimi için — yalnızca gerçekten var olan hub/slug çiftleri. */
export const getAllGuideParams = cache(() =>
  getAllGuides().map((g) => ({ hub: g.hub.slug, slug: g.slug })),
);

/** İçi dolu hub'lar — boş hub sayfası açılmaz (thin content). */
export const getActiveHubs = cache(() =>
  HUBS.map((hub) => ({ ...hub, count: getGuidesByHub(hub.slug).length })).filter(
    (h) => h.count > 0,
  ),
);
