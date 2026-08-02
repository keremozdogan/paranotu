/**
 * ============================================================================
 *  INDEXABILITY KAPISI — tek karar noktası
 * ============================================================================
 *  "Bu sayfa Google'a açılabilir mi?" sorusunun TEK cevap yeri burasıdır.
 *  Sayfalar `robots` meta'sını kendi başlarına kurmaz; bu fonksiyonu çağırır.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  NEDEN TEK YER?
 *  ────────────────────────────────────────────────────────────────────────
 *  Kural her sayfada tekrar yazılırsa biri eksik kalır ve ham feed içeriği
 *  Google'a sızar. Bir haber sitesinde bu, "thin content" cezası demektir —
 *  ve ceza tek sayfaya değil, tüm alan adına gelir.
 *
 *  Katmanların varsayılanı:
 *    external feed → HER ZAMAN noindex (istisna yok)
 *    editorial     → varsayılan noindex; TÜM kapılar geçilirse index
 *    evergreen     → varsayılan index; eksik varsa noindex
 * ============================================================================
 */

/** İndexlenebilirlik için gereken asgari kelime sayısı. */
export const MIN_WORD_COUNT = 300;

/** Bir özgün değer bölümünün "dolu" sayılması için asgari uzunluk. */
const MIN_SECTION_CHARS = 120;

/**
 * @typedef {object} IndexDecision
 * @property {boolean}  index      Google indexleyebilir mi?
 * @property {boolean}  follow     Bağlantılar takip edilsin mi?
 * @property {string[]} reasons    noindex ise gerekçeler (loglama/teşhis)
 * @property {object}   robots     Next.js `metadata.robots` nesnesi
 */

function decision(index, reasons = [], { follow = true } = {}) {
  return {
    index,
    follow,
    reasons,
    robots: index
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : { index: false, follow, googleBot: { index: false, follow } },
  };
}

/* -------------------------------------------------------------------------- */
/*  A. HAM FEED                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Ham gelişme kayıtları HER ZAMAN noindex.
 *
 * `follow: true` bırakılıyor — bağlantılar orijinal kaynağa gidiyor ve
 * onları takip etmek doğru davranış. İndexlenmeyen ama takip edilen sayfa.
 */
export function feedItemIndexability() {
  return decision(false, ["external_feed_never_indexed"], { follow: true });
}

/* -------------------------------------------------------------------------- */
/*  B. EDİTORYAL HABER                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Spec §2'deki koşulların TAMAMI sağlanmalı. Biri bile eksikse noindex.
 *
 * @param {object} article
 * @returns {IndexDecision}
 */
export function editorialIndexability(article) {
  const reasons = [];

  if (!article) return decision(false, ["missing"]);

  if (article.status !== "published") reasons.push("not_published");
  if (article.noindex === true) reasons.push("manual_noindex");

  /* Editoryal onay — otomatik üretim asla indexlenemez. */
  if (!article.approvedBy) reasons.push("no_editorial_approval");

  /* Güvenilir kaynak */
  if (!article.hasVerifiedSource) reasons.push("no_verified_source");
  if (!article.sources?.length) reasons.push("no_visible_sources");

  /* Özgün ParaNotu değeri — "neden önemli / etkisi" bölümleri.
     API içeriğini birkaç kelime değiştirerek haber üretmeyi engelleyen kapı. */
  const originalValue = [
    article.whyItMatters,
    article.turkeyImpact,
    article.citizenImpact,
  ].filter((s) => typeof s === "string" && s.trim().length >= MIN_SECTION_CHARS);

  if (originalValue.length < 2) reasons.push("insufficient_original_value");

  /* İçerik derinliği */
  if ((article.wordCount ?? 0) < MIN_WORD_COUNT) reasons.push("too_thin");

  /* Künye */
  if (!article.author) reasons.push("no_author");

  /* Görsel hakları — görsel varsa lisansı net olmalı */
  if (article.image && article.image.rightsStatus !== "cleared") {
    reasons.push("media_rights_unclear");
  }

  /* Duplicate kontrolü */
  if (!article.passedDuplicateCheck) reasons.push("duplicate_check_pending");

  /* Aynı olay için tek kanonik sayfa: bu haber bir kümeye bağlıysa ve
     küme başka bir habere işaret ediyorsa, bu sayfa kanonik değildir. */
  if (article.clusterId && article.clusterCanonicalId && article.clusterCanonicalId !== article.id) {
    reasons.push("not_cluster_canonical");
  }

  /* Canonical tutarlılığı */
  if (article.canonicalUrl && article.selfUrl && article.canonicalUrl !== article.selfUrl) {
    reasons.push("canonical_mismatch");
  }

  return decision(reasons.length === 0, reasons);
}

/* -------------------------------------------------------------------------- */
/*  C. EVERGREEN REHBER                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Evergreen içerik varsayılan olarak indexlenebilir — kalıcı, özgün ve
 * editoryal olarak üretilmiş içerikler. Yine de temel kapılar geçerli.
 */
export function evergreenIndexability(guide) {
  const reasons = [];

  if (!guide) return decision(false, ["missing"]);
  if (guide.status !== "published") reasons.push("not_published");
  if (guide.noindex === true) reasons.push("manual_noindex");
  if (!guide.author) reasons.push("no_author");
  if ((guide.wordCount ?? 0) < MIN_WORD_COUNT) reasons.push("too_thin");
  if (!guide.sources?.length) reasons.push("no_visible_sources");

  /* Kaynak hatası olan rehber Google'a açık kalmamalı — üzerinde yanlış
     veri olabilir. Düzeltilene kadar noindex. */
  if (guide.freshnessStatus === "source_error") reasons.push("source_error");
  if (guide.freshnessStatus === "stale") reasons.push("stale_content");

  return decision(reasons.length === 0, reasons);
}

/* -------------------------------------------------------------------------- */
/*  D. LİSTE VE YARDIMCI SAYFALAR                                             */
/* -------------------------------------------------------------------------- */

/**
 * Filtre, arama ve parametreli liste sayfaları.
 *
 * Boş etiket/kategori sayfaları da buraya düşer: içeriği olmayan liste
 * "thin content"tir ve indexlenmemelidir.
 */
export function listingIndexability({ itemCount = 0, hasQueryParams = false, isSearch = false } = {}) {
  const reasons = [];
  if (isSearch) reasons.push("search_results");
  if (hasQueryParams) reasons.push("query_parameters");
  if (itemCount === 0) reasons.push("empty_listing");
  return decision(reasons.length === 0, reasons);
}

/**
 * Sahne/önizleme ortamı ve test sayfaları.
 * `NEXT_PUBLIC_SITE_ENV=preview` ise site genelinde noindex.
 */
export function isPreviewEnvironment() {
  return process.env.NEXT_PUBLIC_SITE_ENV === "preview";
}

/**
 * Sayfaların kullanacağı sarmalayıcı: önizleme ortamındaysa her şeyi
 * noindex yapar, değilse asıl kararı uygular.
 */
export function resolveRobots(dec) {
  if (isPreviewEnvironment()) {
    return { index: false, follow: false, googleBot: { index: false, follow: false } };
  }
  return dec.robots;
}

/* -------------------------------------------------------------------------- */
/*  SITEMAP KATILIM KURALLARI                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Hangi içerik hangi sitemap'e girer? (spec §10)
 *
 *   ham feed   → HİÇBİR sitemap'e girmez
 *   editorial  → normal sitemap + (son 2 gün ise) news sitemap
 *   evergreen  → yalnızca normal sitemap, news sitemap'e ASLA
 */
export const NEWS_SITEMAP_WINDOW_HOURS = 48;

export function belongsInNewsSitemap(article, now = Date.now()) {
  if (!article?.publishedAt) return false;
  if (!editorialIndexability(article).index) return false;
  const ageHours = (now - new Date(article.publishedAt).getTime()) / 3600000;
  return ageHours >= 0 && ageHours <= NEWS_SITEMAP_WINDOW_HOURS;
}

export function belongsInMainSitemap(item, type) {
  if (type === "feed") return false;
  if (type === "editorial") return editorialIndexability(item).index;
  if (type === "evergreen") return evergreenIndexability(item).index;
  return false;
}
