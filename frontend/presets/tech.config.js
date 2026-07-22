/**
 * ============================================================================
 *  PRESET ÖRNEĞİ — TEKNOLOJİ BLOGU
 * ============================================================================
 *  Yeni bir niş açmak için:
 *
 *    cp presets/tech.config.js site.config.js
 *    # content/posts içini yeni yazılarla değiştir
 *    npm run dev
 *
 *  Kod tabanında BAŞKA HİÇBİR DEĞİŞİKLİK gerekmez. Renkler, menü,
 *  kategoriler, reklam slotları ve nişe özel modüller (liveRates gibi)
 *  hepsi buradan gelir.
 * ============================================================================
 */

const siteConfig = {
  name: "DevNot",
  shortName: "DevNot",
  tagline: "Yazılımcılar için haftalık teknoloji notları",
  description:
    "Yeni araçlar, dil güncellemeleri ve mimari kararlar üzerine sade, uygulamaya dönük teknoloji yazıları.",

  url: process.env.NEXT_PUBLIC_SITE_URL || "https://devnot.example",
  locale: "tr_TR",
  lang: "tr",

  logo: {
    type: "text",
    text: "Dev",
    accentText: "Not",
    src: "/logo.svg",
    width: 120,
    height: 32,
  },
  /* Paylaşım görseli kodla üretilir — bkz. src/app/opengraph-image.js */

  theme: {
    /* TEKNOLOJİ: primary = mavi (net/teknik), accent = mor */
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
      950: "#172554",
    },
    accent: {
      50: "#faf5ff",
      100: "#f3e8ff",
      200: "#e9d5ff",
      300: "#d8b4fe",
      400: "#c084fc",
      500: "#a855f7",
      600: "#9333ea",
      700: "#7e22ce",
      800: "#6b21a8",
      900: "#581c87",
      950: "#3b0764",
    },
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
    themeColor: "#2563eb",
    radius: "sharp",
  },

  nav: [
    { label: "Ana Sayfa", href: "/" },
    { label: "Yazılar", href: "/blog" },
    { label: "Araçlar", href: "/kategori/araclar" },
    { label: "Mimari", href: "/kategori/mimari" },
    { label: "Hakkında", href: "/hakkinda" },
  ],

  footerNav: [
    { label: "Gizlilik Politikası", href: "/gizlilik" },
    { label: "Kullanım Şartları", href: "/sartlar" },
    { label: "İletişim", href: "/iletisim" },
    { label: "RSS", href: "/rss.xml" },
  ],

  categories: [
    { slug: "araclar", name: "Araçlar", description: "Günlük iş akışını hızlandıran editör, CLI ve otomasyon araçları." },
    { slug: "mimari", name: "Mimari", description: "Servis sınırları, veri modelleme ve ölçeklenme kararları." },
    { slug: "dil", name: "Diller", description: "Dil güncellemeleri ve pratik kullanım notları." },
  ],

  authors: {
    editor: {
      name: "Editör",
      title: "Yazılım Ekibi",
      avatar: "/authors/editor.png",
      bio: "Üretimde çalışan kodla ilgilenen küçük bir ekip.",
    },
  },
  defaultAuthor: "editor",

  social: {
    twitter: "",
    twitterHandle: "",
    instagram: "",
    youtube: "",
    linkedin: "",
    github: "https://github.com/",
    email: "merhaba@devnot.example",
  },

  ads: {
    enabled: false,
    provider: "adsense",
    client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "",
    showPlaceholders: true,
    slots: {
      headerBelow: "",
      inArticle: "",
      sidebar: "",
      listInline: "",
      footer: "",
    },
    inArticleAfterHeadings: [2, 5],
  },

  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || "",
    googleSiteVerification: process.env.NEXT_PUBLIC_GSC_VERIFICATION || "",
  },

  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5199",
    revalidate: 300,
  },

  features: {
    newsletter: true,
    comments: false,
    /* Finans nişine özel widget — teknoloji blogunda kapalı. */
    liveRates: false,
    readingTime: true,
    tableOfContents: true,
    relatedPosts: true,
    search: true,
  },

  content: {
    postsPerPage: 12,
    adEveryNPosts: 6,
    excerptLength: 160,
  },

  seo: {
    titleTemplate: "%s | DevNot",
    defaultKeywords: ["yazılım", "geliştirici araçları", "mimari", "teknoloji"],
    disclaimer: "",
  },
};

export default siteConfig;
