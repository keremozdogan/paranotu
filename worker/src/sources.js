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

/**
 * TCMB besleme kökü. Beş beslemenin tamamı bu yolun altında ve hepsi Atom
 * (`<entry>`) döndürür — RSS değil. `parseFeed` ikisini de anlar.
 *
 * ⚠️ Sunucu `Content-Type: text/html` başlığı gönderir ama gövde XML'dir.
 * Bu yüzden içerik türüne göre ayrıştırıcı seçen bir mantık buraya
 * eklenirse TCMB kırılır; `type: "rss"` alanına güven.
 */
const TCMB_RSS = "https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Bottom+Menu/Diger/RSS";

/** @type {Source[]} */
export const SOURCES = [
  /* ------------------------------------------------------------- RESMÎ ----
   * En yüksek güven. Bu kaynakların açıklamaları birincil kaynaktır.
   *
   * Aşağıdaki beş TCMB beslemesi 11 Ağustos 2026'da tek tek istek atılarak
   * doğrulandı: hepsi 200 ve dolu Atom döndürüyor (17-30 kayıt, en yenisi
   * birkaç günlük). robots.txt yalnızca arama sonucu sayfalarını kapatıyor,
   * bu adreslere izin var.
   *
   * Tarih biçimi Türkçedir ("7 Ağu 2026 09:00:02") ve saat dilimi
   * yazmaz — TSİ'dir. `ingest.js → parseFeedDate` bunu çözüp UTC'ye
   * çevirir; oradaki testleri bozma.
   */
  {
    id: "tcmb-basin-duyuru",
    name: "TCMB Basın Duyuruları",
    url: `${TCMB_RSS}/Basin+Duyurulari`,
    type: "rss",
    group: "official",
    trust: 100,
    redistribution: "link_only",
    section: "turkiye",
    intervalMin: 10,
  },
  {
    id: "tcmb-ppk",
    name: "TCMB Para Politikası Kurulu Kararları",
    url: `${TCMB_RSS}/PPK+Kararlari`,
    type: "rss",
    group: "official",
    trust: 100,
    redistribution: "link_only",
    section: "turkiye",
    intervalMin: 10,
  },
  {
    id: "tcmb-veriler",
    name: "TCMB Veri Duyuruları",
    url: `${TCMB_RSS}/Veriler`,
    type: "rss",
    group: "official",
    trust: 100,
    redistribution: "link_only",
    section: "turkiye",
    intervalMin: 10,
  },
  {
    id: "tcmb-yayinlar",
    name: "TCMB Yayınları",
    url: `${TCMB_RSS}/Yayinlar`,
    type: "rss",
    group: "official",
    trust: 95,
    redistribution: "link_only",
    section: "turkiye",
    intervalMin: 30,
  },
  {
    id: "tcmb-baskan-konusma",
    name: "TCMB Başkanının Konuşmaları",
    url: `${TCMB_RSS}/Baskanin+Konusmalari`,
    type: "rss",
    group: "official",
    trust: 100,
    redistribution: "link_only",
    section: "turkiye",
    intervalMin: 30,
  },

  /* ----------------------------------------------------- RSS'İ OLMAYANLAR --
   * Aşağıdakiler 11 Ağustos 2026'da arandı, YAYIMLANMIŞ RSS BESLEMESİ
   * BULUNAMADI. Denenen ve 404/HTML dönen adresler kayıt için burada —
   * aynı tahminleri tekrar denemeyelim:
   *
   *   TÜİK          data.tuik.gov.tr/Bulten/Rss, /rss, veriportali/rss  → HTML
   *                 www.tuik.gov.tr/jsp/duyuru/rss/tuik_rip.xml (eski)  → 404
   *   Resmî Gazete  resmigazete.gov.tr/rss, /rss/rss.xml               → yok
   *   KAP           kap.org.tr/tr/rss                                   → 404
   *
   * Bunlar için seçenekler: (a) kurumların sayfalarını besleyen JSON
   * uçlarını bulmak, (b) HTML'i ayrıştırmak. İkisi de doğrulama ister;
   * tahminle adres yazma.
   */

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
