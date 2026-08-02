/**
 * ============================================================================
 *  KAYNAK KAYDI
 * ============================================================================
 *  Hangi beslemenin çekileceği burada tanımlıdır.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  ⚠️ BESLEME ADRESLERİ BİLİNÇLİ OLARAK BOŞ
 *  ────────────────────────────────────────────────────────────────────────
 *  Kurumların RSS adreslerini hafızadan yazmak, yanlış veya ölü adreslere
 *  istek atmak demektir. Daha kötüsü: yanlış adres bir gün başka bir içeriğe
 *  yönlenirse sisteme kontrolsüz veri girer.
 *
 *  Her kaynağı eklemeden önce ŞUNLARI DOĞRULA:
 *    1. Besleme adresi kurumun kendi sitesinde yayımlanıyor mu?
 *    2. robots.txt bu adrese erişime izin veriyor mu?
 *    3. Kullanım koşulları yeniden yayına ne diyor? → `redistribution`
 *
 *  `redistribution` alanı ne demek:
 *    "link_only" → sadece başlık + kaynağa bağlantı. VARSAYILAN.
 *    "excerpt"   → başlık + kısa özet gösterilebilir.
 *    "full"      → tam metin izni var (nadirdir; sözleşme gerektirir).
 *
 *  Emin değilsen "link_only" bırak. Bu katman ASLA tam metin saklamaz.
 * ============================================================================
 */

/**
 * @typedef {object} Source
 * @property {string}  id            Benzersiz kimlik
 * @property {string}  name          Görünen ad
 * @property {string}  url           RSS/Atom/JSON besleme adresi
 * @property {string}  type          "rss" | "json"
 * @property {string}  group         "official" | "news" | "market"
 * @property {number}  trust         0-100 başlangıç güven puanı
 * @property {string}  redistribution "link_only" | "excerpt" | "full"
 * @property {string} [section]      Varsayılan bölüm
 * @property {number} [intervalMin]  Minimum çekim aralığı (dakika)
 */

/** @type {Source[]} */
export const SOURCES = [
  /* ------------------------------------------------------------- RESMÎ ----
   * En yüksek güven. Bu kaynakların açıklamaları birincil kaynaktır.
   * Adresleri kurumun sitesinden doğrulayıp doldur.
   */
  // {
  //   id: "tcmb-duyuru",
  //   name: "TCMB Duyuruları",
  //   url: "",                       // ← tcmb.gov.tr üzerinden doğrula
  //   type: "rss",
  //   group: "official",
  //   trust: 100,
  //   redistribution: "link_only",
  //   section: "turkiye",
  //   intervalMin: 10,
  // },
  // {
  //   id: "tuik-bulten",
  //   name: "TÜİK Haber Bültenleri",
  //   url: "",                       // ← tuik.gov.tr üzerinden doğrula
  //   type: "rss",
  //   group: "official",
  //   trust: 100,
  //   redistribution: "link_only",
  //   section: "turkiye",
  //   intervalMin: 10,
  // },
  // {
  //   id: "resmi-gazete",
  //   name: "Resmî Gazete",
  //   url: "",
  //   type: "rss",
  //   group: "official",
  //   trust: 100,
  //   redistribution: "link_only",
  //   section: "turkiye",
  //   intervalMin: 15,
  // },
  // {
  //   id: "kap-bildirim",
  //   name: "KAP Bildirimleri",
  //   url: "",
  //   type: "rss",
  //   group: "official",
  //   trust: 100,
  //   redistribution: "link_only",
  //   section: "borsa",
  //   intervalMin: 10,
  // },

  /* -------------------------------------------------------------- HABER ----
   * Ticari haber kaynakları. Yalnızca lisanslı API veya kurumun açıkça
   * yeniden yayına izin verdiği besleme kullanılabilir.
   * Lisanssız scraping YAPILMAZ.
   */
];

/** Etkin kaynak grupları env'den okunur. */
export function activeSources(env) {
  const groups = (env.ENABLED_SOURCE_GROUPS ?? "official")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  return SOURCES.filter((s) => s.url && groups.includes(s.group));
}

/** Cron ifadesine göre hangi grupların çekileceğini belirler. */
export function groupsForCron(cron) {
  switch (cron) {
    case "*/10 * * * *":
      return ["official"];
    case "*/20 * * * *":
      return ["news"];
    case "*/5 7 3 * *":
      /* TÜFE açıklama penceresi — sadece resmî kaynaklar, sık. */
      return ["official"];
    default:
      return [];
  }
}
