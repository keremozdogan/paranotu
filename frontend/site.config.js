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
    /**
     * KONSEPT — kurumsal ekonomi yayıncılığı
     *   primary = ParaNotu yeşili (marka sürekliliği, "büyüme/güven")
     *   accent  = koyu lacivert (kurumsal kimlik: header, veri vurguları)
     *   gold    = sınırlı sıcak vurgu (editoryal işaretler, son dakika)
     *
     * ⚠️ KONTRAST NOTU
     * Eski palette `primary-600` (#059669) beyaz üzerinde 3.77:1 veriyordu —
     * WCAG AA gövde metni eşiği 4.5:1 olduğu için makale içi bağlantılar
     * başarısızdı. Ramp bir kademe koyulaştırıldı: yeni 600 (#047857)
     * beyaz üzerinde 5.49:1. Marka tonu korundu, sadece derinleştirildi.
     */
    primary: {
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#0d9668",
      600: "#047857", // 5.49:1 (beyaz üzerinde) — AA ✓
      700: "#036148",
      800: "#064e3b",
      900: "#053a2c",
      950: "#022c22",
    },

    /**
     * KOYU LACİVERT — sitenin kurumsal omurgası.
     * Header, mega menü, veri vurgu kutuları ve footer bunu kullanır.
     * (Önceki indigo paletinin yerini aldı; `accent-*` sınıfları aynen çalışır.)
     */
    accent: {
      50: "#eff3f9",
      100: "#dbe4f0",
      200: "#b9c9e0",
      300: "#8ea7cb",
      400: "#5f7fae",
      500: "#3f5e8f",
      600: "#2d4870",
      700: "#23385a", // 9.8:1 (beyaz üzerinde)
      800: "#1a2a44",
      900: "#121e33",
      950: "#0a1322",
    },

    /**
     * ALTIN — ÖLÇÜLÜ KULLAN.
     * Sadece editoryal işaretler için: "Son Dakika" rozeti, öne çıkan etiket,
     * canlı yayın göstergesi. Geniş yüzeylerde ve gövde metninde kullanma.
     */
    gold: {
      50: "#fdf8ec",
      100: "#faeecd",
      200: "#f4dc9c",
      300: "#ecc463",
      400: "#e3ad3a",
      500: "#c8901d",
      600: "#a4740f", // 4.6:1 (beyaz üzerinde) — küçük metin için sınırda AA ✓
      700: "#825b0f",
      800: "#6a4a13",
      900: "#593e15",
      950: "#33220a",
    },

    /* Nötr yüzeyler — kırık beyaz, kontrollü gri. */
    surface: {
      bg: "#ffffff",
      bgSubtle: "#f6f7f9",
      border: "#dfe3e8",
      text: "#0f1723",
      textMuted: "#5b6672",
    },
    surfaceDark: {
      bg: "#0a1322",
      bgSubtle: "#111d30",
      border: "#1e2c42",
      text: "#e8ecf1",
      textMuted: "#94a3b8",
    },

    /**
     * ------------------------------------------------------------------
     *  SEMANTİK ROLLER — açık ve koyu tema için AYRI değerler
     * ------------------------------------------------------------------
     *  Palet adımları (primary-600 gibi) her iki temada aynı kalır; bu
     *  yüzden koyu zeminde kontrast düşebiliyor. Aşağıdaki roller iki
     *  temada farklı değer alır ve Tailwind'de şu sınıflara dönüşür:
     *
     *    text-link  bg-positive-soft  text-positive  text-negative ...
     *
     *  YÜKSELİŞ/DÜŞÜŞ RENGİ TEK BAŞINA ANLAM TAŞIMAZ (WCAG 1.4.1).
     *  Bileşenler renge ek olarak ok/işaret göstermek ZORUNDADIR —
     *  `formatChange()` (src/lib/format.js) bunu otomatik üretir.
     */
    roles: {
      light: {
        link: "#047857",
        linkHover: "#036148",
        /* Piyasa yönü — marka yeşilinden kasıtlı olarak farklı tonlar,
           böylece "marka rengi" ile "yükseliş" karışmaz. */
        positive: "#157f4d", // 5.07:1 ✓
        positiveSoft: "#e8f5ee",
        negative: "#b3261e", // 6.57:1 ✓
        negativeSoft: "#fbeceb",
        neutral: "#5b6672",
        neutralSoft: "#f0f2f5",
        /* Header/footer gibi kurumsal yüzeyler */
        chrome: "#0f1c2e",
        chromeText: "#e8ecf1",
        chromeMuted: "#93a3b8",
        chromeBorder: "#1f2f45",
      },
      dark: {
        link: "#34d399",
        linkHover: "#6ee7b7",
        positive: "#3ecf8e",
        positiveSoft: "#0f2a1f",
        negative: "#f2726a",
        negativeSoft: "#2c1512",
        neutral: "#94a3b8",
        neutralSoft: "#16233a",
        chrome: "#070f1c",
        chromeText: "#e8ecf1",
        chromeMuted: "#93a3b8",
        chromeBorder: "#1b2942",
      },
    },

    /* Tarayıcı arayüz rengi (mobil adres çubuğu) — kurumsal lacivert */
    themeColor: "#0f1c2e",
    /**
     * Köşe yuvarlaklığı: "sharp" | "soft" | "round"
     * Ciddi yayıncılık görünümü için "sharp" — oyuncak hissi vermez.
     */
    radius: "sharp",
  },

  /* -------------------------------------------------------------- NAVİGASYON */
  /**
   * Ana menü. `children` verilen öğeler masaüstünde mega menü açar,
   * mobilde katlanır grup olur.
   *
   * ⚠️ Haber bölümlerine giden bağlantılar `newsSections` içinde
   * `active: true` olanlarla SINIRLI tutulmalı — kapalı bölüme menüden
   * link vermek 404 üretir. `buildNav()` (src/lib/nav.js) bunu filtreler.
   */
  nav: [
    { label: "Son Dakika", href: "/son-dakika" },
    {
      label: "Haberler",
      href: "/haber",
      children: [
        { label: "Türkiye Ekonomisi", href: "/haber/turkiye", section: "turkiye" },
        { label: "Dünya Ekonomisi", href: "/haber/dunya", section: "dunya" },
        { label: "Borsa", href: "/haber/borsa", section: "borsa" },
        { label: "Şirketler", href: "/haber/sirketler", section: "sirketler" },
      ],
    },
    {
      label: "Piyasalar",
      href: "/piyasalar",
      children: [
        { label: "Genel Görünüm", href: "/piyasalar" },
        { label: "Döviz", href: "/haber/doviz", section: "doviz" },
        { label: "Altın ve Gümüş", href: "/haber/altin", section: "altin" },
        { label: "Piyasa Haberleri", href: "/haber/piyasalar", section: "piyasalar" },
      ],
    },
    {
      label: "Veriler",
      href: "/enflasyon",
      children: [
        { label: "Enflasyon (TÜFE)", href: "/enflasyon" },
        { label: "Ekonomik Takvim", href: "/takvim" },
      ],
    },
    {
      label: "Para Rehberi",
      href: "/blog",
      children: [
        { label: "Tüm Rehberler", href: "/blog" },
        { label: "Bütçe", href: "/kategori/butce" },
        { label: "Birikim", href: "/kategori/birikim" },
        { label: "Öğrenci Finansı", href: "/kategori/ogrenci" },
      ],
    },
    { label: "Araçlar", href: "/araclar" },
  ],

  /**
   * Alt bilgi menüsü.
   * Güven ve şeffaflık sayfaları (künye, editoryal ilkeler, düzeltme ve YZ
   * politikası) bilinçli olarak burada — Google'ın E-E-A-T değerlendirmesinde
   * ve AdSense başvurusunda bu sayfaların erişilebilir olması bekleniyor.
   */
  footerNav: [
    { label: "Künye", href: "/kunye" },
    { label: "Editoryal İlkeler", href: "/editoryal-ilkeler" },
    { label: "Düzeltme Politikası", href: "/duzeltme-politikasi" },
    { label: "Yapay Zekâ Politikası", href: "/yapay-zeka-politikasi" },
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

  /* ------------------------------------------------------- HABER BÖLÜMLERİ */
  /**
   * Haber tarafının taksonomisi. `categories` (yukarıda) REHBER içeriği
   * içindir; bölümler haber içindir. İkisi bilinçli olarak ayrı:
   *
   *   /kategori/butce      → rehber kategorisi (kalıcı, eğitici içerik)
   *   /haber/turkiye       → haber bölümü (zaman duyarlı içerik)
   *
   * ⚠️ Yukarıdaki kategori kuralı burada da geçerli: içi boş bölüm =
   * "thin content". Bir bölümü ancak içerik akışı varken `active: true` yap.
   * `active: false` olan bölüm menüde ve sitemap'te GÖRÜNMEZ, route üretilmez.
   */
  newsSections: [
    {
      slug: "turkiye",
      name: "Türkiye Ekonomisi",
      shortName: "Türkiye",
      active: true,
      inNav: true,
      description:
        "Enflasyon, faiz, asgari ücret, vergi, SGK ve emekli maaşları başta olmak üzere Türkiye ekonomisindeki kritik gelişmeler.",
    },
    {
      slug: "dunya",
      name: "Dünya Ekonomisi",
      shortName: "Dünya",
      active: true,
      inNav: true,
      description:
        "Fed, Avrupa Merkez Bankası, Çin ve küresel ticaret başta olmak üzere dünya piyasalarını yönlendiren gelişmeler.",
    },
    {
      slug: "piyasalar",
      name: "Piyasalar",
      shortName: "Piyasalar",
      active: true,
      inNav: true,
      description:
        "Döviz, altın, emtia ve endeksler — piyasa hareketleri ve bunların arkasındaki nedenler.",
    },
    {
      slug: "borsa",
      name: "Borsa",
      shortName: "Borsa",
      active: true,
      inNav: true,
      description:
        "Borsa İstanbul, şirket haberleri, KAP gelişmeleri ve küresel endeksler.",
    },
    {
      slug: "doviz",
      name: "Döviz",
      shortName: "Döviz",
      active: true,
      inNav: true,
      description: "Dolar, euro ve diğer para birimlerindeki hareketler ve nedenleri.",
    },
    {
      slug: "altin",
      name: "Altın ve Gümüş",
      shortName: "Altın",
      active: true,
      inNav: true,
      description:
        "Gram altın, ons altın ve gümüş fiyatları ile değerli metal piyasasındaki gelişmeler.",
    },
    /* ----------------------------------------------------------- BÖLGELER
     * "Dünya" tek bir yığın olduğunda okur aradığını bulamıyor: Fed kararı
     * ile Çin büyüme verisi aynı listede karışıyor. Bölge kırılımı bunu
     * ayırır ve her bölgenin kendi motifi olur (bkz. lib/motif.js).
     *
     * ⚠️ İçi boş bölüm "thin content"tir: Google için de okur için de kötü.
     * Bu yüzden üçü de `active: false` başlıyor. Bir bölgeye ait birkaç
     * haber girdiğinde o bölümü `active: true` yap — hepsini birden açma.
     */
    { slug: "amerika", name: "Amerika Ekonomisi", shortName: "Amerika", active: false, inNav: false, description: "Fed kararları, ABD makro verileri ve Wall Street endeksleri." },
    { slug: "avrupa", name: "Avrupa Ekonomisi", shortName: "Avrupa", active: false, inNav: false, description: "Avrupa Merkez Bankası, euro bölgesi verileri ve Avrupa borsaları." },
    { slug: "asya", name: "Asya Ekonomisi", shortName: "Asya", active: false, inNav: false, description: "Çin, Japonya ve Asya piyasalarındaki gelişmeler." },

    /* İçerik akışı başlayınca açılacaklar — şimdilik boş kalmasın diye kapalı. */
    { slug: "kripto", name: "Kripto Para", shortName: "Kripto", active: false, inNav: false, description: "Kripto para piyasasındaki gelişmeler." },
    { slug: "emtia", name: "Emtia ve Enerji", shortName: "Emtia", active: false, inNav: false, description: "Petrol, doğal gaz ve emtia piyasaları." },
    { slug: "sirketler", name: "Şirketler", shortName: "Şirketler", active: false, inNav: false, description: "Şirket bilançoları, birleşmeler ve sektör haberleri." },
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
      headerBelow: "",   // Bölüm arası yatay banner (970×250 / 728×90)
      inArticle: "",     // Yazı içi — akışkan
      sidebar: "",       // Yan menü — 300×250 / 300×600
      listInline: "",    // Liste araları — 300×250
      footer: "",        // İçerik sonu
      mobileSticky: "",  // Mobil alt yapışkan (varsayılan KAPALI)
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
