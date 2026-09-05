/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * ==========================================================================
   *  KALICI YÖNLENDİRMELER
   * ==========================================================================
   *  ⚠️ BU LİSTEDEN KAYIT SİLME.
   *  Bir URL yayına girdikten sonra değişirse, eski adres SONSUZA KADAR
   *  yönlendirilmelidir. Dış bağlantılar, arama sonuçları ve kullanıcıların
   *  yer imleri eski adrese bağlı kalır. Yönlendirmeyi kaldırmak, o
   *  bağlantıların taşıdığı değeri 404'e göndermek demektir.
   *
   *  `permanent: true` → 301: "kalıcı taşındı, indeksini güncelle".
   * ==========================================================================
   */
  async redirects() {
    return [
      {
        /* Takvim, kalıcı rehber URL şemasına taşındı (spec §1-C). */
        source: "/takvim",
        destination: "/ekonomik-takvim",
        permanent: true,
      },

      /* ----------------------------------------------------------------
         KATEGORİ YENİDEN YAPILANMASI
         ----------------------------------------------------------------
         Site haber odaklıdan evergreen finans bilgi merkezine geçti.
         Hub'lar 8 ana kategoriye indirildi; `enflasyon` ve `faiz` konu
         olarak Ekonomi'ye, `butce` ve `asgari-ucret` Kişisel Finans'a
         taşındı. `altin`, `doviz` ve `kredi` yerinde kaldı — onlar için
         yönlendirme YOK, çünkü URL değişmedi.

         ⚠️ Not: `permanent: true` Next'te 301 değil 308 üretir (istek
         metodunu koruyan kalıcı yönlendirme). Google bunu 301'e denk
         sayar; SEO değeri aktarılır.
         ---------------------------------------------------------------- */

      /* Tekil rehberler — slug'lar da konuyu taşıyacak şekilde netleşti. */
      {
        source: "/enflasyon/maaslara-etkisi",
        destination: "/ekonomi/enflasyonun-maaslara-etkisi",
        permanent: true,
      },
      {
        source: "/faiz/kredi-ve-mevduata-etkisi",
        destination: "/ekonomi/faizin-kredi-ve-mevduata-etkisi",
        permanent: true,
      },
      {
        source: "/butce/40-40-20-kurali",
        destination: "/kisisel-finans/40-40-20-kurali",
        permanent: true,
      },
      {
        source: "/asgari-ucret/guncel-asgari-ucret",
        destination: "/kisisel-finans/guncel-asgari-ucret",
        permanent: true,
      },
      {
        source: "/asgari-ucret/ara-zam-olacak-mi",
        destination: "/kisisel-finans/ara-zam-olacak-mi",
        permanent: true,
      },

      /* Kapanan hub sayfalarının kendisi. `/enflasyon` BURADA YOK —
         o adres bağımsız bir veri sayfası olarak yaşamaya devam ediyor
         (src/app/enflasyon/page.js). Statik route dinamik route'u yener,
         çakışma olmaz. */
      { source: "/faiz", destination: "/ekonomi", permanent: true },
      { source: "/butce", destination: "/kisisel-finans", permanent: true },
      { source: "/asgari-ucret", destination: "/kisisel-finans", permanent: true },
      /* `emekli` hub'ı hiç içerik almadı; yine de indekslenmiş olabilir. */
      { source: "/emekli", destination: "/kisisel-finans", permanent: true },
    ];
  },

  images: {
    /**
     * Modern format tercihi — aynı görsel, belirgin biçimde küçük dosya.
     * Tarayıcı desteklemiyorsa Next otomatik olarak orijinale düşer.
     */
    formats: ["image/avif", "image/webp"],
    /* Kart ve hero boyutlarına yakın kırılımlar — gereksiz varyant üretme. */
    deviceSizes: [360, 420, 640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [96, 160, 240, 320, 480],
    /* Optimize edilmiş görseller uzun süre cache'lensin (saniye). */
    minimumCacheTTL: 2592000,
  },

  /** Statik varlıklar uzun cache; HTML'i ISR yönetir. */
  async headers() {
    return [
      {
        source: "/:path*.(jpg|jpeg|png|webp|avif|svg|ico|woff2)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
