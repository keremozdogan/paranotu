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
