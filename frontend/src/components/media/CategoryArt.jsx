/**
 * ============================================================================
 *  KATEGORİ GRAFİĞİ — markaya ait fallback görsel sistemi
 * ============================================================================
 *  Lisanslı bir fotoğraf olmadığında kartlarda ve hero alanında çizilen
 *  editoryal grafik.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  NEDEN FOTOĞRAF DEĞİL?
 *  ────────────────────────────────────────────────────────────────────────
 *  Bir ekonomi yayınında görsel, haberin kanıtı gibi okunur. Konuyla
 *  ilgisiz bir stok fotoğrafı ("elinde para tutan adam") koymak, okuru
 *  o görselin habere ait olduğuna inandırır. Bu yüzden burada bilinçli
 *  olarak SOYUT ve GRAFİKSEL bir dil kullanıyoruz: kimse bunu olay
 *  fotoğrafı sanmaz, ama kart da boş durmaz.
 *
 *  Gerçek, lisansı doğrulanmış bir fotoğraf geldiğinde `SmartImage`
 *  otomatik olarak onu tercih eder; bu grafik devre dışı kalır.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  TEKNİK
 *  ────────────────────────────────────────────────────────────────────────
 *  • Saf inline SVG — ağ isteği yok, dolayısıyla LCP'yi geciktirmez ve
 *    yüklenirken layout kaymaz (CLS = 0).
 *  • Renkler `currentColor` ve marka CSS değişkenlerinden gelir; koyu
 *    temada kendiliğinden uyum sağlar.
 *  • `aria-hidden` — dekoratiftir, ekran okuyucu okumaz. Anlamı başlık
 *    taşır (WCAG: dekoratif görsel duyurulmamalı).
 *  • Her kategori FARKLI bir motif kullanır; aynı görselin tekrarı
 *    hissini önler.
 * ============================================================================
 */

/* --------------------------------------------------------------------------
 *  MOTİFLER
 *  Her biri 0 0 320 180 viewBox'ında (16:9'a yakın) çizilir ve kapsayıcıya
 *  `preserveAspectRatio="none"` OLMADAN yayılır — bozulmaz.
 * ------------------------------------------------------------------------ */

/** Yükselen sütun grafiği — Türkiye ekonomisi, büyüme, genel makro. */
const Bars = () => (
  <>
    <rect x="34" y="112" width="26" height="42" rx="2" />
    <rect x="72" y="94" width="26" height="60" rx="2" />
    <rect x="110" y="102" width="26" height="52" rx="2" />
    <rect x="148" y="72" width="26" height="82" rx="2" />
    <rect x="186" y="84" width="26" height="70" rx="2" />
    <rect x="224" y="52" width="26" height="102" rx="2" />
    <path d="M34 62 L110 74 L186 44 L262 30" fill="none" strokeWidth="3" opacity=".55" />
    <circle cx="262" cy="30" r="5" />
  </>
);

/** Meridyenli küre — dünya ekonomisi, küresel piyasalar. */
const Globe = () => (
  <>
    <circle cx="160" cy="90" r="58" fill="none" strokeWidth="2.5" />
    <ellipse cx="160" cy="90" rx="24" ry="58" fill="none" strokeWidth="2" opacity=".7" />
    <ellipse cx="160" cy="90" rx="46" ry="58" fill="none" strokeWidth="1.5" opacity=".45" />
    <path d="M104 68 H216 M102 90 H218 M104 112 H216" strokeWidth="2" opacity=".55" />
    <path d="M40 150 H280" strokeWidth="2" opacity=".3" />
  </>
);

/** Mum grafiği — piyasalar. */
const Candles = () => (
  <>
    {[
      [50, 70, 44, 62],
      [86, 54, 60, 40],
      [122, 86, 34, 74],
      [158, 62, 52, 48],
      [194, 96, 30, 84],
      [230, 44, 68, 32],
    ].map(([x, y, h, wickTop], i) => (
      <g key={i}>
        <rect x={x} y={y} width="18" height={h} rx="2" />
        <path d={`M${x + 9} ${wickTop} V ${y}`} strokeWidth="2.5" />
        <path d={`M${x + 9} ${y + h} V ${y + h + 14}`} strokeWidth="2.5" />
      </g>
    ))}
  </>
);

/** Izgara üzerine çizgi grafiği — borsa, endeksler. */
const LineChart = () => (
  <>
    <path
      d="M30 40 H290 M30 70 H290 M30 100 H290 M30 130 H290"
      strokeWidth="1"
      opacity=".28"
    />
    <path d="M70 30 V150 M130 30 V150 M190 30 V150 M250 30 V150" strokeWidth="1" opacity=".28" />
    <path
      d="M34 126 L74 108 L104 118 L146 74 L188 92 L226 56 L286 38"
      fill="none"
      strokeWidth="3.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <circle cx="286" cy="38" r="5" />
  </>
);

/** Karşılıklı oklar ve banknot çizgileri — döviz. */
const Exchange = () => (
  <>
    <rect x="40" y="52" width="104" height="62" rx="6" fill="none" strokeWidth="2.5" />
    <circle cx="92" cy="83" r="16" fill="none" strokeWidth="2.5" />
    <path d="M56 66 H70 M114 100 H128" strokeWidth="2.5" />
    <rect x="176" y="66" width="104" height="62" rx="6" fill="none" strokeWidth="2.5" opacity=".7" />
    <circle cx="228" cy="97" r="16" fill="none" strokeWidth="2.5" opacity=".7" />
    <path d="M150 74 H172 l-8 -7 M170 106 H148 l8 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </>
);

/** İstiflenmiş külçeler — altın / gümüş. */
const Bullion = () => (
  <>
    <path d="M96 128 L112 104 H208 L224 128 Z" fill="none" strokeWidth="2.5" />
    <path d="M74 154 L90 130 H186 L202 154 Z" fill="none" strokeWidth="2.5" opacity=".75" />
    <path d="M126 100 L142 76 H238 L254 100 Z" fill="none" strokeWidth="2.5" opacity=".55" />
    <path d="M160 42 v18 M138 50 l10 10 M182 50 l-10 10" strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
  </>
);

/** Yükselen fiyat basamakları ve etiket — enflasyon. */
const PriceSteps = () => (
  <>
    <path
      d="M34 150 H82 V126 H130 V102 H178 V74 H226 V44 H278"
      fill="none"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    <path d="M34 150 H278" strokeWidth="2" opacity=".35" />
    <g opacity=".8">
      <path d="M232 24 h44 a6 6 0 0 1 6 6 v18 a6 6 0 0 1 -6 6 h-44 l-10 -15 Z" fill="none" strokeWidth="2.5" />
      <circle cx="246" cy="39" r="3" />
    </g>
  </>
);

/** Bordro satırları ve madeni para — asgari ücret, maaş. */
const Payslip = () => (
  <>
    <rect x="58" y="34" width="128" height="118" rx="6" fill="none" strokeWidth="2.5" />
    <path d="M78 60 H166 M78 78 H150 M78 96 H160 M78 114 H138" strokeWidth="2.5" opacity=".7" />
    <path d="M78 132 H120" strokeWidth="3" />
    <circle cx="232" cy="96" r="30" fill="none" strokeWidth="2.5" />
    <circle cx="232" cy="96" r="20" fill="none" strokeWidth="1.5" opacity=".5" />
    <path d="M226 86 h10 M226 96 h12 M232 82 v28" strokeWidth="2.5" strokeLinecap="round" />
  </>
);

/** Yüzde işareti ve eğri — faiz. */
const Percent = () => (
  <>
    <circle cx="112" cy="66" r="18" fill="none" strokeWidth="3" />
    <circle cx="196" cy="120" r="18" fill="none" strokeWidth="3" />
    <path d="M212 48 L96 138" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M34 150 C 90 150, 110 120, 160 100 S 250 52, 288 34" fill="none" strokeWidth="2.5" opacity=".4" />
  </>
);

/** Belge ve mühür — vergi, SGK, mevzuat. */
const Document = () => (
  <>
    <path d="M96 28 h84 l44 44 v108 a6 6 0 0 1 -6 6 h-122 a6 6 0 0 1 -6 -6 V34 a6 6 0 0 1 6 -6 Z" fill="none" strokeWidth="2.5" />
    <path d="M180 28 v44 h44" fill="none" strokeWidth="2.5" />
    <path d="M118 92 H202 M118 110 H202 M118 128 H176" strokeWidth="2.5" opacity=".7" />
    <circle cx="196" cy="140" r="16" fill="none" strokeWidth="2.5" opacity=".55" />
  </>
);

/** Açık kitap — rehberler. */
const Guide = () => (
  <>
    <path d="M160 54 C136 38, 104 38, 74 46 V138 C104 130, 136 130, 160 146 Z" fill="none" strokeWidth="2.5" />
    <path d="M160 54 C184 38, 216 38, 246 46 V138 C216 130, 184 130, 160 146 Z" fill="none" strokeWidth="2.5" />
    <path d="M160 54 V146" strokeWidth="2.5" opacity=".6" />
    <path d="M92 68 H140 M92 86 H134 M180 68 H228 M180 86 H222" strokeWidth="2" opacity=".5" />
  </>
);

/** Hesap makinesi ızgarası — araçlar. */
const Calculator = () => (
  <>
    <rect x="104" y="26" width="112" height="128" rx="8" fill="none" strokeWidth="2.5" />
    <rect x="120" y="42" width="80" height="26" rx="3" fill="none" strokeWidth="2" />
    {[0, 1, 2].map((r) =>
      [0, 1, 2].map((c) => (
        <rect
          key={`${r}-${c}`}
          x={120 + c * 28}
          y={82 + r * 24}
          width="18"
          height="16"
          rx="2"
          opacity={r === 2 && c === 2 ? 1 : 0.55}
        />
      )),
    )}
  </>
);

/** Varsayılan — soyut ızgara ve trend. */
const Abstract = () => (
  <>
    <path d="M30 46 H290 M30 90 H290 M30 134 H290" strokeWidth="1" opacity=".25" />
    <path d="M30 118 L92 96 L146 106 L206 62 L290 40" fill="none" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="92" cy="96" r="4" opacity=".8" />
    <circle cx="206" cy="62" r="4" opacity=".8" />
  </>
);

/* --------------------------------------------------------------------------
 *  KATEGORİ EŞLEMESİ
 *  Anahtarlar hem haber bölümü (`newsSections`) hem rehber hub'ı
 *  (`evergreen HUBS`) hem de rehber kategorisi slug'larını kapsar.
 * ------------------------------------------------------------------------ */

/**
 * `arts` — bir kategorinin motif havuzu.
 *
 * Neden birden fazla? Aynı hub'a ait iki dosya (örn. iki asgari ücret
 * rehberi) ana sayfada yan yana geliyor. Tek motifle bunlar birbirinin
 * kopyası gibi görünüyordu; sadece ışık/ölçek oynatmak yeterli ayrım
 * yaratmadı. Havuzdan seçim `seed` ile deterministik yapılır — aynı
 * içerik her zaman aynı motifi alır.
 *
 * Havuzdaki motiflerin hepsi kategoriyle ANLAMLI biçimde ilişkili olmalı;
 * çeşitlilik için alakasız görsel koyma.
 */
const MOTIFS = {
  /* Haber bölümleri */
  turkiye: { arts: [Bars, PriceSteps, LineChart], tone: "primary", label: "Türkiye Ekonomisi" },
  dunya: { arts: [Globe, LineChart], tone: "accent", label: "Dünya Ekonomisi" },
  piyasalar: { arts: [Candles, LineChart], tone: "accent", label: "Piyasalar" },
  borsa: { arts: [LineChart, Candles], tone: "accent", label: "Borsa" },
  doviz: { arts: [Exchange, Globe], tone: "accent", label: "Döviz" },
  altin: { arts: [Bullion, Candles], tone: "gold", label: "Altın" },
  gumus: { arts: [Bullion, Abstract], tone: "neutral", label: "Gümüş" },
  kripto: { arts: [Candles, Abstract], tone: "accent", label: "Kripto" },
  emtia: { arts: [Abstract, LineChart], tone: "neutral", label: "Emtia" },
  sirketler: { arts: [Document, LineChart], tone: "accent", label: "Şirketler" },

  /* Rehber hub'ları ve kategoriler */
  enflasyon: { arts: [PriceSteps, Bars], tone: "primary", label: "Enflasyon" },
  "asgari-ucret": { arts: [Payslip, Bars, Document], tone: "primary", label: "Asgari Ücret" },
  faiz: { arts: [Percent, LineChart], tone: "accent", label: "Faiz" },
  vergi: { arts: [Document, Payslip], tone: "neutral", label: "Vergi ve SGK" },
  emekli: { arts: [Payslip, Percent], tone: "neutral", label: "Emeklilik" },
  kredi: { arts: [Percent, Calculator], tone: "neutral", label: "Kredi" },
  butce: { arts: [Calculator, Bars], tone: "primary", label: "Bütçe" },
  birikim: { arts: [Bullion, Calculator], tone: "primary", label: "Birikim" },
  ogrenci: { arts: [Guide, Calculator], tone: "primary", label: "Öğrenci Finansı" },
  rehber: { arts: [Guide, Document], tone: "primary", label: "Rehber" },
  araclar: { arts: [Calculator, Percent], tone: "accent", label: "Araçlar" },
};

/**
 * Ton paletleri. Koyu yüzey + ince çizgi — hero'da metin okunabilirliğini
 * bozmayacak kadar sakin.
 */
const TONES = {
  primary: { bg: "var(--brand-primary-950)", ink: "var(--brand-primary-300)", glow: "var(--brand-primary-500)" },
  accent: { bg: "var(--brand-accent-950)", ink: "var(--brand-accent-300)", glow: "var(--brand-accent-500)" },
  gold: { bg: "var(--brand-gold-950)", ink: "var(--brand-gold-300)", glow: "var(--brand-gold-500)" },
  neutral: { bg: "var(--brand-accent-900)", ink: "var(--brand-accent-200)", glow: "var(--brand-accent-400)" },
};

export function motifFor(category) {
  return MOTIFS[category] ?? { arts: [Abstract, LineChart], tone: "accent", label: "ParaNotu" };
}

/**
 * ----------------------------------------------------------------------------
 *  VARYASYON — aynı kategoride iki kart yan yana gelince tekrar hissi olmasın
 * ----------------------------------------------------------------------------
 *  Aynı hub'a ait iki dosya (örn. iki asgari ücret rehberi) yan yana
 *  durduğunda birebir aynı grafiği göstermek "kopyala-yapıştır" izlenimi
 *  veriyordu. `seed` (içeriğin slug'ı) üzerinden deterministik bir varyant
 *  üretiyoruz: ışık kaynağının yeri, motifin konumu ve ölçeği hafifçe
 *  değişiyor.
 *
 *  Deterministik olması ŞART — her render'da farklı çıkarsa sunucu ve
 *  istemci çıktısı uyuşmaz (hydration hatası) ve görsel titrer.
 */
function seedHash(value) {
  let h = 0;
  const s = String(value ?? "");
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** 4 farklı ışık/konum kombinasyonu — belirgin ama abartısız. */
const VARIANTS = [
  { cx: "72%", cy: "18%", tx: 0, ty: 0, scale: 1 },
  { cx: "22%", cy: "24%", tx: 14, ty: -4, scale: 1.06 },
  { cx: "84%", cy: "72%", tx: -12, ty: 4, scale: 0.96 },
  { cx: "36%", cy: "82%", tx: 6, ty: 6, scale: 1.03 },
];

/**
 * @param {object} props
 * @param {string} [props.category]  Bölüm/hub slug'ı
 * @param {string} [props.seed]      İçerik slug'ı — varyasyon için
 * @param {boolean} [props.showLabel] Kategori adını grafiğin üstüne yaz
 * @param {string} [props.className]
 */
export default function CategoryArt({ category, seed, showLabel = false, className = "" }) {
  const motif = motifFor(category);
  const tone = TONES[motif.tone] ?? TONES.accent;

  const hash = seedHash(seed ?? category);
  /* Motif ve ışık varyantı AYRI hash türevlerinden seçilir; aksi halde
     ikisi birlikte döner ve kombinasyon çeşitliliği kaybolur. */
  const Art = motif.arts[hash % motif.arts.length];
  const variant = VARIANTS[Math.floor(hash / 7) % VARIANTS.length];

  /**
   * SVG `id` değerleri sayfa genelinde BENZERSİZ olmalı — aynı id iki kez
   * geçerse tarayıcı ilkini kullanır ve ikinci kartın gradyanı bozulur.
   * Bu yüzden kimliğe kategori + seed hash'i giriyor.
   */
  const uid = `art-${category ?? "default"}-${hash.toString(36)}`;

  return (
    <div
      /* Dekoratif — ekran okuyucu okumaz, anlamı başlık taşır. */
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ backgroundColor: tone.bg }}
    >
      <svg
        viewBox="0 0 320 180"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        focusable="false"
      >
        <defs>
          <pattern id={`${uid}-grid`} width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M16 0 H0 V16" fill="none" stroke={tone.ink} strokeWidth="0.5" opacity="0.16" />
          </pattern>
          <radialGradient id={`${uid}-glow`} cx={variant.cx} cy={variant.cy} r="72%">
            <stop offset="0%" stopColor={tone.glow} stopOpacity="0.30" />
            <stop offset="100%" stopColor={tone.glow} stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="320" height="180" fill={`url(#${uid}-grid)`} />
        <rect width="320" height="180" fill={`url(#${uid}-glow)`} />

        <g
          fill={tone.ink}
          stroke={tone.ink}
          opacity="0.9"
          transform={`translate(${variant.tx} ${variant.ty}) scale(${variant.scale}) translate(${
            (160 * (1 - variant.scale)) / variant.scale
          } ${(90 * (1 - variant.scale)) / variant.scale})`}
        >
          <Art />
        </g>
      </svg>

      {showLabel ? (
        <span className="absolute bottom-3 left-3 rounded-brand bg-black/35 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur-sm">
          {motif.label}
        </span>
      ) : null}
    </div>
  );
}
