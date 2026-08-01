/**
 * ============================================================================
 *  SITE CONFIG — TEK KONTROL NOKTASI (White-Label)
 * ============================================================================
 *  Yeni bir niş için site açarken SADECE bu dosyayı değiştir.
 *  Kod tabanında başka hiçbir yere dokunman gerekmez.
 *
 *  Örnek: Bu dosyayı `presets/tech.config.js` ile değiştir → teknoloji blogu.
 * ============================================================================
 */

const siteConfig = {
  /* ---------------------------------------------------------------- KİMLİK */
  name: "ParaNotu",
  shortName: "ParaNotu",
  tagline: "Finansı sade anlatan notlar",
  description:
    "Bütçe, birikim, kredi, yatırım ve vergi konularını karmaşık terimlere boğmadan anlatan rehberler. Gerçek rakamlarla, bugün uygulayabileceğin adımlarla.",

  /* Canlı domain — sitemap, canonical ve OG etiketleri bunu kullanır. */
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://paranotu.com",

  locale: "tr_TR",
  lang: "tr",

  /* ------------------------------------------------------------------ LOGO */
  logo: {
    /* type: "text" → yazı logosu (dosya gerekmez) | "image" → /public içinden */
    type: "text",
    text: "Para",
    accentText: "Notu", // ana renkte vurgulanan kısım
    src: "/logo.svg",
    width: 132,
    height: 32,
  },

  /* İkon/emoji favicon yerine gerçek dosya kullanacaksan /public'e koy. */
  /**
   * Paylaşım görseli ARTIK ELLE HAZIRLANMIYOR.
   * `src/app/opengraph-image.js` ve `src/app/blog/[slug]/opengraph-image.js`
   * bu config'in renk ve isimlerini kullanarak görseli kodla üretir.
   * Bir yazıya özel kapak istiyorsan frontmatter'da `image:` ver — o öncelikli olur.
   */

  /* ------------------------------------------------------------------ TEMA */
  /**
   * Bu paletler runtime'da CSS değişkenlerine basılır (src/app/layout.js).
   * Tailwind sınıfları hazır: bg-primary-600, text-accent-500, border-primary-200 ...
   * Renk değiştirmek için Tailwind'i yeniden yapılandırmana GEREK YOK.
   */
  theme: {
    /* FİNANS KONSEPTİ: primary = yeşil (güven/büyüme), accent = indigo (kurumsal) */
    primary: {
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      800: "#065f46",
      900: "#064e3b",
      950: "#022c22",
    },
    accent: {
      50: "#eef2ff",
      100: "#e0e7ff",
      200: "#c7d2fe",
      300: "#a5b4fc",
      400: "#818cf8",
      500: "#6366f1",
      600: "#4f46e5",
      700: "#4338ca",
      800: "#3730a3",
      900: "#312e81",
      950: "#1e1b4b",
    },
    /* Nötr yüzeyler — sıcak/soğuk gri tercihini burada değiştir. */
    surface: {
      bg: "#ffffff",
      bgSubtle: "#f8fafc",
      border: "#e2e8f0",
      text: "#0f172a",
      textMuted: "#64748b",
    },
    surfaceDark: {
      bg: "#0b1120",
      bgSubtle: "#111827",
      border: "#1f2937",
      text: "#e5e7eb",
      textMuted: "#94a3b8",
    },
    /* Tarayıcı arayüz rengi (mobil adres çubuğu) */
    themeColor: "#059669",
    /* Köşe yuvarlaklığı karakteri: "sharp" | "soft" | "round" */
    radius: "soft",
  },

  /* -------------------------------------------------------------- NAVİGASYON */
  nav: [
    { label: "Ana Sayfa", href: "/" },
    { label: "Rehberler", href: "/blog" },
    { label: "Enflasyon", href: "/enflasyon" },
    { label: "Araçlar", href: "/araclar" },
    { label: "Bütçe", href: "/kategori/butce" },
    { label: "Birikim", href: "/kategori/birikim" },
    { label: "Hakkında", href: "/hakkinda" },
  ],

  footerNav: [
    { label: "Gizlilik Politikası", href: "/gizlilik" },
    { label: "Kullanım Şartları", href: "/sartlar" },
    { label: "İletişim", href: "/iletisim" },
    { label: "RSS", href: "/rss.xml" },
  ],

  /* ---------------------------------------------------------- KATEGORİLER */
  /**
   * slug → görünen ad + kısa açıklama (kategori sayfası SEO metni)
   *
   * ⚠️ KURAL: Buraya eklenen HER kategori için sayfa üretilir
   * (src/app/kategori/[category]/page.js → generateStaticParams).
   * İçinde yazı olmayan kategori = boş sayfa = Google'ın "thin content"
   * saydığı ve AdSense'in reddettiği durum.
   *
   * Bu yüzden kategoriyi ÖNCE yazı yazıp SONRA aç.
   *
   * YOL HARİTASI — içerik geldikçe eklenecekler:
   *   { slug: "kredi",     name: "Kredi & Borç" }        ← en çok aranan konu, önce bu
   *   { slug: "yatirim",   name: "Yatırım 101" }         ← 0 yazı olduğu için kapatıldı
   *   { slug: "vergi",     name: "Vergi & Bordro" }
   *   { slug: "emeklilik", name: "Emeklilik & Uzun Vade" }
   */
  categories: [
    {
      slug: "butce",
      name: "Bütçe",
      description:
        "Aylık gelirini takip etme, harcama kalemlerini ayırma ve 50/30/20 gibi bütçe modellerini uygulama rehberleri.",
    },
    {
      slug: "birikim",
      name: "Birikim",
      description:
        "Küçük tutarlarla başlayan mikro-birikim yöntemleri, otomatik tasarruf sistemleri ve acil durum fonu kurma.",
    },
    {
      slug: "ogrenci",
      name: "Öğrenci Finansı",
      description:
        "Burs, part-time gelir, öğrenci indirimleri ve sınırlı bütçeyle şehirde yaşama taktikleri.",
    },
  ],

  /* ------------------------------------------------------------- YAZARLAR */
  authors: {
    editor: {
      name: "Kerem Özdoğan",
      title: "Yazar",
      avatar: "/authors/editor.png",
      bio: "Yazılım uzmanı. Finansal okuryazarlığa meraklı; birikim ve bütçe konusunda öğrendiklerini sade bir dille anlatıyor.",
    },
  },
  defaultAuthor: "editor",

  /* --------------------------------------------------------- SOSYAL MEDYA */
  /* Boş bırakılan alanlar arayüzde otomatik gizlenir. */
  social: {
    twitter: "",
    twitterHandle: "",
    instagram: "",
    youtube: "",
    linkedin: "",
    github: "",
    email: "keremozdogannn@gmail.com",
  },

  /* -------------------------------------------------------------- REKLAM */
  /**
   * AdSense'i aktif etmek için:
   *   1) enabled: true
   *   2) client: "ca-pub-XXXXXXXXXXXXXXXX"
   *   3) Aşağıdaki slot ID'lerini AdSense panelinden alıp yapıştır.
   * Kod tarafında başka değişiklik gerekmez — <AdBanner /> otomatik canlanır.
   */
  ads: {
    enabled: false,
    provider: "adsense",
    client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "",
    /* Placeholder'ları geliştirme sırasında görmek için true bırak. */
    showPlaceholders: false,
    slots: {
      headerBelow: "",   // Başlık altı — yatay banner
      inArticle: "",     // Yazı içi — akışkan
      sidebar: "",       // Yan menü — dikey / sabit
      listInline: "",    // Ana sayfa liste araları
      footer: "",        // Alt bilgi üstü
    },
    /* Yazı içi reklamın kaçıncı H2 başlıklarından sonra çıkacağı */
    inArticleAfterHeadings: [2, 5],
  },

  /* ---------------------------------------------------------- ANALİTİK */
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || "",
    /* Google Search Console doğrulama meta etiketi */
    googleSiteVerification: process.env.NEXT_PUBLIC_GSC_VERIFICATION || "",
  },

  /* ------------------------------------------------------------ BACKEND */
  /* .NET API — servis katmanı (src/services/api.js) bunu okur. */
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5199",
    /* Sunucu tarafı cache süresi (saniye) */
    revalidate: 300,
  },

  /* --------------------------------------------------------- ÖZELLİKLER */
  /* Niş değişince gereksiz modülleri tek satırda kapat. */
  features: {
    newsletter: false,     // Bülten aboneliği (.NET API) — backend yayına alınınca true yap
    comments: false,       // Yorumlar (.NET API)
    liveRates: false,      // Canlı döviz/altın kuru widget'ı — backend yayına alınınca true yap
    readingTime: true,
    tableOfContents: true,
    relatedPosts: true,
    search: true,
  },

  /* ------------------------------------------------------------- İÇERİK */
  content: {
    postsPerPage: 9,
    /* Ana sayfa listesinde kaçıncı karttan sonra reklam gelsin */
    adEveryNPosts: 4,
    excerptLength: 160,
  },

  /* ---------------------------------------------------------------- SEO */
  seo: {
    titleTemplate: "%s | ParaNotu",
    defaultKeywords: [
      "bütçe yönetimi",
      "birikim",
      "tasarruf",
      "finansal okuryazarlık",
      "kişisel finans",
      "kredi ve borç",
    ],
    /* Yasal uyarı — finans nişinde AdSense/Google için önemli */
    disclaimer:
      "Bu sitedeki içerikler genel bilgilendirme amaçlıdır ve yatırım tavsiyesi niteliği taşımaz.",
  },
};

export default siteConfig;
