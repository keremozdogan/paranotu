/**
 * ============================================================================
 *  KATEGORİ GRAFİĞİ — markaya ait fallback görsel sistemi
 * ============================================================================
 *  Lisanslı bir fotoğraf olmadığında kartlarda, hero alanında ve haber
 *  sayfasında çizilen editoryal grafik.
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
 *  ÇİZİM DİLİ — üç katman
 *  ────────────────────────────────────────────────────────────────────────
 *  Önceki sürüm tek renkli ince çizgilerden oluşuyordu ve "elle yazılmış
 *  HTML" gibi duruyordu. Derinlik hissi veren üç katmana geçtik:
 *
 *    1. GÖLGE katmanı  — ana biçimin kaydırılmış, çok düşük opaklıkta
 *                        kopyası. Nesneyi zeminden ayırır.
 *    2. GÖVDE katmanı  — dikey gradyanla dolu ana biçim. Düz renk yerine
 *                        gradyan, ekranda hacim hissi verir.
 *    3. VURGU katmanı  — tek bir aksan renginde küçük detay (parlama,
 *                        işaret noktası, ışık çizgisi). Gözü odaklar.
 *
 *  Zemin de düz değil: köşegen gradyan + ızgara dokusu + konumu içeriğe
 *  göre değişen ışık + alt vinyet.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  TEKNİK
 *  ────────────────────────────────────────────────────────────────────────
 *  • Saf inline SVG — ağ isteği yok, LCP'yi geciktirmez, CLS = 0.
 *  • Renkler marka CSS değişkenlerinden gelir; koyu temada kendiliğinden
 *    uyum sağlar (değişkenler tema ile değişir).
 *  • `aria-hidden` — dekoratiftir, ekran okuyucu okumaz. Anlamı başlık
 *    taşır (WCAG: dekoratif görsel duyurulmamalı).
 *  • SVG filtresi (blur/shadow) KULLANILMAZ: liste sayfasında 20+ kart
 *    yan yana geldiğinde filtreler gözle görülür şekilde yavaşlatıyor.
 *    Derinlik, opaklık katmanlarıyla taklit ediliyor.
 * ============================================================================
 */

/* --------------------------------------------------------------------------
 *  MOTİFLER
 *  Her biri 0 0 320 180 viewBox'ında (16:9'a yakın) çizilir.
 *
 *  Her motif `p` (palet) alır:
 *    p.fill   → gövde gradyanı (url)
 *    p.soft   → soluk gradyan, arka katmanlar için (url)
 *    p.accent → vurgu rengi (düz renk)
 *    p.ink    → çizgi rengi (düz renk)
 * ------------------------------------------------------------------------ */

/** Sütun grafiği + trend — Türkiye ekonomisi, büyüme, genel makro. */
const Bars = (p) => {
  const bars = [
    [40, 108, 46],
    [78, 88, 66],
    [116, 98, 56],
    [154, 66, 88],
    [192, 80, 74],
    [230, 44, 110],
  ];
  return (
    <>
      {/* Gölge katmanı */}
      <g opacity="0.18">
        {bars.map(([x, y, h]) => (
          <rect key={`s${x}`} x={x + 4} y={y + 4} width="26" height={h} rx="3" fill={p.ink} />
        ))}
      </g>
      {/* Gövde */}
      {bars.map(([x, y, h]) => (
        <rect key={x} x={x} y={y} width="26" height={h} rx="3" fill={p.fill} />
      ))}
      {/* Taban çizgisi */}
      <path d="M28 154 H292" stroke={p.ink} strokeWidth="1.5" opacity="0.35" />
      {/* Trend + vurgu noktası */}
      <path
        d="M53 96 L91 76 L129 86 L167 54 L205 68 L243 32"
        fill="none"
        stroke={p.accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <circle cx="243" cy="32" r="6" fill={p.accent} opacity="0.25" />
      <circle cx="243" cy="32" r="3" fill={p.accent} />
    </>
  );
};

/** Meridyenli küre + yörünge — dünya ekonomisi, küresel piyasalar. */
const Globe = (p) => (
  <>
    <circle cx="160" cy="88" r="62" fill={p.soft} opacity="0.5" />
    <circle cx="160" cy="88" r="62" fill="none" stroke={p.ink} strokeWidth="2" opacity="0.8" />
    <ellipse cx="160" cy="88" rx="26" ry="62" fill="none" stroke={p.ink} strokeWidth="1.5" opacity="0.55" />
    <ellipse cx="160" cy="88" rx="48" ry="62" fill="none" stroke={p.ink} strokeWidth="1.2" opacity="0.35" />
    <path
      d="M100 66 H220 M98 88 H222 M100 110 H220 M110 132 H210"
      stroke={p.ink}
      strokeWidth="1.5"
      opacity="0.45"
    />
    {/* Yörünge — hafif eğik elips, küreyi kesiyor */}
    <ellipse
      cx="160"
      cy="88"
      rx="88"
      ry="30"
      fill="none"
      stroke={p.accent}
      strokeWidth="2"
      opacity="0.65"
      transform="rotate(-18 160 88)"
    />
    <circle cx="238" cy="60" r="5" fill={p.accent} opacity="0.3" />
    <circle cx="238" cy="60" r="2.5" fill={p.accent} />
  </>
);

/** Mum grafiği + hacim — piyasalar. */
const Candles = (p) => {
  const candles = [
    [48, 62, 40, 46, 122],
    [86, 48, 54, 32, 116],
    [124, 78, 30, 62, 130],
    [162, 56, 46, 40, 118],
    [200, 86, 26, 70, 134],
    [238, 38, 58, 24, 110],
  ];
  return (
    <>
      {/* Hacim çubukları — altta, soluk */}
      {candles.map(([x, , , , v]) => (
        <rect key={`v${x}`} x={x - 2} y={v} width="22" height={158 - v} rx="2" fill={p.soft} opacity="0.55" />
      ))}
      <path d="M28 158 H292" stroke={p.ink} strokeWidth="1.5" opacity="0.3" />
      {/* Mumlar */}
      {candles.map(([x, y, h, wick]) => (
        <g key={x}>
          <path d={`M${x + 9} ${wick} V ${y + h + 12}`} stroke={p.ink} strokeWidth="2" opacity="0.7" />
          <rect x={x} y={y} width="18" height={h} rx="2.5" fill={p.fill} />
          <rect x={x} y={y} width="18" height={h} rx="2.5" fill="none" stroke={p.ink} strokeWidth="1" opacity="0.5" />
        </g>
      ))}
      <circle cx="247" cy="38" r="3" fill={p.accent} />
    </>
  );
};

/** Alan dolgulu çizgi grafiği — borsa, endeksler. */
const LineChart = (p) => (
  <>
    <path d="M28 44 H292 M28 76 H292 M28 108 H292 M28 140 H292" stroke={p.ink} strokeWidth="1" opacity="0.18" />
    <path d="M76 28 V152 M136 28 V152 M196 28 V152 M256 28 V152" stroke={p.ink} strokeWidth="1" opacity="0.12" />
    {/* Alan dolgusu — çizginin altını doldurur, grafiğe ağırlık verir */}
    <path
      d="M32 128 L76 106 L110 118 L152 70 L196 90 L236 52 L288 34 L288 152 L32 152 Z"
      fill={p.soft}
      opacity="0.7"
    />
    <path
      d="M32 128 L76 106 L110 118 L152 70 L196 90 L236 52 L288 34"
      fill="none"
      stroke={p.ink}
      strokeWidth="3"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    {[
      [76, 106],
      [152, 70],
      [236, 52],
    ].map(([cx, cy]) => (
      <circle key={cx} cx={cx} cy={cy} r="3.5" fill={p.accent} />
    ))}
    <circle cx="288" cy="34" r="7" fill={p.accent} opacity="0.22" />
    <circle cx="288" cy="34" r="3.5" fill={p.accent} />
  </>
);

/** Banknotlar + dönüşüm okları — döviz. */
const Exchange = (p) => (
  <>
    {/* Arkadaki banknot — derinlik */}
    <g opacity="0.35">
      <rect x="52" y="42" width="112" height="66" rx="8" fill={p.soft} />
    </g>
    {/* Ön banknot */}
    <rect x="40" y="54" width="112" height="66" rx="8" fill={p.fill} />
    <rect x="40" y="54" width="112" height="66" rx="8" fill="none" stroke={p.ink} strokeWidth="1.5" opacity="0.6" />
    <circle cx="96" cy="87" r="18" fill="none" stroke={p.ink} strokeWidth="2" opacity="0.75" />
    <path d="M90 79 v16 M90 84 h11 M90 90 h11 M101 79 l-11 16" stroke={p.ink} strokeWidth="2" strokeLinecap="round" opacity="0.85" />
    <path d="M54 66 h16 M122 108 h16" stroke={p.ink} strokeWidth="2" strokeLinecap="round" opacity="0.5" />

    {/* İkinci banknot — daha soluk, ikinci para birimi */}
    <rect x="178" y="66" width="104" height="62" rx="8" fill={p.soft} opacity="0.85" />
    <rect x="178" y="66" width="104" height="62" rx="8" fill="none" stroke={p.ink} strokeWidth="1.5" opacity="0.45" />
    <circle cx="230" cy="97" r="16" fill="none" stroke={p.ink} strokeWidth="2" opacity="0.5" />

    {/* Dönüşüm okları */}
    <path d="M158 74 h26 l-7 -7 M176 104 h-26 l7 7" stroke={p.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>
);

/** İstiflenmiş külçeler + parıltı — altın / gümüş. */
const Bullion = (p) => (
  <>
    <g opacity="0.2">
      <path d="M80 156 L98 128 H198 L216 156 Z" fill={p.ink} />
    </g>
    {/* Alt sıra */}
    <path d="M74 152 L92 124 H188 L206 152 Z" fill={p.fill} />
    <path d="M74 152 L92 124 H188 L206 152 Z" fill="none" stroke={p.ink} strokeWidth="1.5" opacity="0.55" />
    {/* Orta */}
    <path d="M98 122 L114 96 H208 L224 122 Z" fill={p.fill} opacity="0.92" />
    <path d="M98 122 L114 96 H208 L224 122 Z" fill="none" stroke={p.ink} strokeWidth="1.5" opacity="0.5" />
    {/* Üst */}
    <path d="M124 94 L138 70 H226 L240 94 Z" fill={p.fill} opacity="0.8" />
    <path d="M124 94 L138 70 H226 L240 94 Z" fill="none" stroke={p.ink} strokeWidth="1.5" opacity="0.45" />
    {/* Üst yüzey ışığı */}
    <path d="M138 70 H226" stroke={p.accent} strokeWidth="2" opacity="0.55" />
    {/* Parıltı */}
    <path d="M96 44 v20 M84 54 h24 M88 46 l16 16 M104 46 l-16 16" stroke={p.accent} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
  </>
);

/** Yükselen fiyat basamakları + etiket — enflasyon. */
const PriceSteps = (p) => (
  <>
    {/* Basamakların altını dolduran alan */}
    <path
      d="M32 152 H80 V128 H128 V104 H176 V76 H224 V46 H286 V152 Z"
      fill={p.soft}
      opacity="0.6"
    />
    <path
      d="M32 152 H80 V128 H128 V104 H176 V76 H224 V46 H286"
      fill="none"
      stroke={p.ink}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path d="M28 152 H292" stroke={p.ink} strokeWidth="1.5" opacity="0.35" />
    {/* Fiyat etiketi */}
    <g>
      <path
        d="M228 22 h50 a7 7 0 0 1 7 7 v20 a7 7 0 0 1 -7 7 h-50 l-12 -17 Z"
        fill={p.fill}
      />
      <path
        d="M228 22 h50 a7 7 0 0 1 7 7 v20 a7 7 0 0 1 -7 7 h-50 l-12 -17 Z"
        fill="none"
        stroke={p.ink}
        strokeWidth="1.5"
        opacity="0.6"
      />
      <circle cx="240" cy="39" r="3.5" fill={p.accent} />
      <path d="M252 33 h24 M252 45 h16" stroke={p.ink} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </g>
    {/* Yukarı ok */}
    <path d="M196 60 v-22 l-7 8 M196 38 l7 8" stroke={p.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>
);

/** Bordro + madeni para yığını — asgari ücret, maaş. */
const Payslip = (p) => (
  <>
    <g opacity="0.2">
      <rect x="58" y="30" width="126" height="120" rx="8" fill={p.ink} />
    </g>
    <rect x="50" y="24" width="126" height="120" rx="8" fill={p.fill} />
    <rect x="50" y="24" width="126" height="120" rx="8" fill="none" stroke={p.ink} strokeWidth="1.5" opacity="0.55" />
    <path d="M68 50 H158" stroke={p.ink} strokeWidth="3" opacity="0.75" />
    <path d="M68 70 H144 M68 88 H154 M68 106 H132" stroke={p.ink} strokeWidth="2" opacity="0.45" />
    {/* Toplam satırı — vurgulu */}
    <path d="M68 126 H112" stroke={p.accent} strokeWidth="3" strokeLinecap="round" />

    {/* Madeni para yığını */}
    {[122, 106, 90].map((cy, i) => (
      <g key={cy}>
        <ellipse cx="238" cy={cy} rx="34" ry="12" fill={p.fill} opacity={0.75 + i * 0.08} />
        <ellipse cx="238" cy={cy} rx="34" ry="12" fill="none" stroke={p.ink} strokeWidth="1.5" opacity="0.5" />
      </g>
    ))}
    <path d="M231 84 h14 M231 90 h14 M238 80 v16" stroke={p.accent} strokeWidth="2" strokeLinecap="round" />
  </>
);

/** Yüzde işareti + eğri — faiz. */
const Percent = (p) => (
  <>
    <path
      d="M28 152 C 84 152, 106 118, 158 96 S 248 46, 292 26 L292 152 Z"
      fill={p.soft}
      opacity="0.5"
    />
    <path
      d="M28 152 C 84 152, 106 118, 158 96 S 248 46, 292 26"
      fill="none"
      stroke={p.ink}
      strokeWidth="2"
      opacity="0.45"
    />
    <circle cx="108" cy="62" r="20" fill="none" stroke={p.ink} strokeWidth="4" />
    <circle cx="200" cy="118" r="20" fill="none" stroke={p.ink} strokeWidth="4" />
    <path d="M216 44 L92 136" stroke={p.fill} strokeWidth="6" strokeLinecap="round" />
    <path d="M216 44 L92 136" stroke={p.accent} strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
  </>
);

/** Belge + mühür — vergi, SGK, mevzuat, şirket bildirimi. */
const Document = (p) => (
  <>
    <g opacity="0.2">
      <path d="M104 30 h84 l44 44 v104 h-128 Z" fill={p.ink} />
    </g>
    <path
      d="M92 22 h84 l46 46 v104 a7 7 0 0 1 -7 7 h-116 a7 7 0 0 1 -7 -7 V29 a7 7 0 0 1 7 -7 Z"
      fill={p.fill}
    />
    <path
      d="M92 22 h84 l46 46 v104 a7 7 0 0 1 -7 7 h-116 a7 7 0 0 1 -7 -7 V29 a7 7 0 0 1 7 -7 Z"
      fill="none"
      stroke={p.ink}
      strokeWidth="1.5"
      opacity="0.55"
    />
    {/* Kıvrık köşe */}
    <path d="M176 22 v46 h46" fill="none" stroke={p.ink} strokeWidth="1.5" opacity="0.6" />
    <path d="M112 88 H198 M112 106 H198 M112 124 H170" stroke={p.ink} strokeWidth="2" opacity="0.45" />
    {/* Mühür */}
    <circle cx="196" cy="146" r="20" fill={p.soft} />
    <circle cx="196" cy="146" r="20" fill="none" stroke={p.accent} strokeWidth="2" opacity="0.8" />
    <path d="M188 146 l6 6 l12 -13" fill="none" stroke={p.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </>
);

/** Açık kitap — rehberler. */
const Guide = (p) => (
  <>
    <g opacity="0.18">
      <path d="M164 60 C140 44, 108 44, 78 52 V144 C108 136, 140 136, 164 152 Z" fill={p.ink} />
      <path d="M164 60 C188 44, 220 44, 250 52 V144 C220 136, 188 136, 164 152 Z" fill={p.ink} />
    </g>
    <path d="M158 54 C134 38, 102 38, 72 46 V138 C102 130, 134 130, 158 146 Z" fill={p.fill} />
    <path d="M158 54 C182 38, 214 38, 244 46 V138 C214 130, 182 130, 158 146 Z" fill={p.fill} opacity="0.88" />
    <path d="M158 54 C134 38, 102 38, 72 46 V138 C102 130, 134 130, 158 146 Z" fill="none" stroke={p.ink} strokeWidth="1.5" opacity="0.55" />
    <path d="M158 54 C182 38, 214 38, 244 46 V138 C214 130, 182 130, 158 146 Z" fill="none" stroke={p.ink} strokeWidth="1.5" opacity="0.5" />
    <path d="M158 54 V146" stroke={p.accent} strokeWidth="2" opacity="0.7" />
    <path d="M90 68 H138 M90 86 H132 M178 68 H226 M178 86 H220" stroke={p.ink} strokeWidth="2" opacity="0.4" />
  </>
);

/** Hesap makinesi — araçlar, bütçe. */
const Calculator = (p) => (
  <>
    <g opacity="0.2">
      <rect x="106" y="30" width="118" height="132" rx="12" fill={p.ink} />
    </g>
    <rect x="98" y="22" width="118" height="132" rx="12" fill={p.fill} />
    <rect x="98" y="22" width="118" height="132" rx="12" fill="none" stroke={p.ink} strokeWidth="1.5" opacity="0.55" />
    {/* Ekran */}
    <rect x="112" y="36" width="90" height="28" rx="5" fill={p.soft} />
    <path d="M150 50 h44" stroke={p.accent} strokeWidth="3" strokeLinecap="round" />
    {/* Tuşlar */}
    {[0, 1, 2].map((r) =>
      [0, 1, 2].map((c) => (
        <rect
          key={`${r}-${c}`}
          x={114 + c * 30}
          y={76 + r * 24}
          width="20"
          height="16"
          rx="4"
          fill={p.ink}
          opacity={r === 1 && c === 1 ? 0 : 0.4}
        />
      )),
    )}
    <rect x="144" y="100" width="20" height="16" rx="4" fill={p.accent} opacity="0.9" />
  </>
);

/** Kasa kapağı — birikim, mevduat. */
const Vault = (p) => (
  <>
    <g opacity="0.18">
      <rect x="72" y="26" width="184" height="140" rx="14" fill={p.ink} />
    </g>
    <rect x="62" y="18" width="184" height="140" rx="14" fill={p.fill} />
    <rect x="62" y="18" width="184" height="140" rx="14" fill="none" stroke={p.ink} strokeWidth="1.5" opacity="0.55" />
    <circle cx="154" cy="88" r="48" fill={p.soft} />
    <circle cx="154" cy="88" r="48" fill="none" stroke={p.ink} strokeWidth="2" opacity="0.6" />
    <circle cx="154" cy="88" r="30" fill="none" stroke={p.ink} strokeWidth="1.5" opacity="0.4" />
    {/* Kol */}
    <path d="M154 44 v-14 M154 132 v14 M110 88 h-14 M198 88 h14" stroke={p.accent} strokeWidth="3" strokeLinecap="round" />
    <circle cx="154" cy="88" r="8" fill={p.accent} />
    <path d="M78 148 h20 M210 148 h20" stroke={p.ink} strokeWidth="2" opacity="0.35" />
  </>
);

/** Ev + anahtar deliği — kredi, konut. */
const House = (p) => (
  <>
    <g opacity="0.18">
      <path d="M168 40 L246 100 V158 H90 V100 Z" fill={p.ink} />
    </g>
    <path d="M160 34 L238 96 V152 a6 6 0 0 1 -6 6 H88 a6 6 0 0 1 -6 -6 V96 Z" fill={p.fill} />
    <path d="M160 34 L238 96 V152 a6 6 0 0 1 -6 6 H88 a6 6 0 0 1 -6 -6 V96 Z" fill="none" stroke={p.ink} strokeWidth="1.5" opacity="0.55" />
    {/* Çatı çizgisi */}
    <path d="M68 102 L160 28 L252 102" fill="none" stroke={p.ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    {/* Kapı */}
    <path d="M142 158 v-40 a18 18 0 0 1 36 0 v40" fill={p.soft} />
    <path d="M142 158 v-40 a18 18 0 0 1 36 0 v40" fill="none" stroke={p.ink} strokeWidth="1.5" opacity="0.5" />
    <circle cx="170" cy="136" r="3" fill={p.accent} />
    {/* Pencereler */}
    <rect x="100" y="112" width="24" height="22" rx="3" fill={p.accent} opacity="0.35" />
    <rect x="196" y="112" width="24" height="22" rx="3" fill={p.accent} opacity="0.35" />
  </>
);

/** Alışveriş sepeti — enflasyon sepeti, tüketici fiyatları. */
const Basket = (p) => (
  <>
    <g opacity="0.18">
      <path d="M92 76 h150 l-18 76 h-114 Z" fill={p.ink} />
    </g>
    <path d="M84 68 h152 l-19 78 a8 8 0 0 1 -8 6 h-98 a8 8 0 0 1 -8 -6 Z" fill={p.fill} />
    <path d="M84 68 h152 l-19 78 a8 8 0 0 1 -8 6 h-98 a8 8 0 0 1 -8 -6 Z" fill="none" stroke={p.ink} strokeWidth="1.5" opacity="0.55" />
    <path d="M118 68 L138 28 M202 68 L182 28" fill="none" stroke={p.ink} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    <path d="M118 90 l6 44 M160 90 v44 M202 90 l-6 44" stroke={p.ink} strokeWidth="2" opacity="0.35" strokeLinecap="round" />
    {/* Yukarı ok — fiyat artışı */}
    <circle cx="248" cy="52" r="22" fill={p.soft} />
    <circle cx="248" cy="52" r="22" fill="none" stroke={p.accent} strokeWidth="2" opacity="0.8" />
    <path d="M248 64 v-24 l-8 9 M248 40 l8 9" fill="none" stroke={p.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </>
);

/** Çip ve ağ — dijital para, ödeme sistemleri, kripto. */
const Chip = (p) => (
  <>
    <g opacity="0.18">
      <rect x="112" y="48" width="112" height="112" rx="16" fill={p.ink} />
    </g>
    <rect x="104" y="40" width="112" height="112" rx="16" fill={p.fill} />
    <rect x="104" y="40" width="112" height="112" rx="16" fill="none" stroke={p.ink} strokeWidth="1.5" opacity="0.55" />
    <rect x="132" y="68" width="56" height="56" rx="8" fill={p.soft} />
    <rect x="132" y="68" width="56" height="56" rx="8" fill="none" stroke={p.accent} strokeWidth="2" opacity="0.8" />
    {/* Bacaklar */}
    <path
      d="M128 40 V22 M160 40 V22 M192 40 V22 M128 152 v18 M160 152 v18 M192 152 v18 M104 66 H86 M104 96 H86 M104 126 H86 M216 66 h18 M216 96 h18 M216 126 h18"
      stroke={p.ink}
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.5"
    />
    {[
      [86, 66],
      [86, 126],
      [234, 96],
    ].map(([cx, cy]) => (
      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill={p.accent} opacity="0.75" />
    ))}
  </>
);

/** Varsayılan — soyut ızgara ve trend. */
const Abstract = (p) => (
  <>
    <path d="M28 48 H292 M28 92 H292 M28 136 H292" stroke={p.ink} strokeWidth="1" opacity="0.2" />
    <path
      d="M28 124 L96 98 L150 110 L212 62 L292 38 L292 152 L28 152 Z"
      fill={p.soft}
      opacity="0.6"
    />
    <path
      d="M28 124 L96 98 L150 110 L212 62 L292 38"
      fill="none"
      stroke={p.ink}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="96" cy="98" r="4" fill={p.accent} />
    <circle cx="212" cy="62" r="4" fill={p.accent} />
  </>
);

/* --------------------------------------------------------------------------
 *  KATEGORİ EŞLEMESİ
 *  Anahtarlar hem haber bölümü (`newsSections`) hem rehber hub'ı
 *  (`evergreen HUBS`) hem de rehber kategorisi slug'larını kapsar.
 *
 *  ⚠️ Buradaki anahtarlar `src/lib/motif.js` içindeki MOTIF_KEYS ile aynı
 *  olmalıdır. Yeni kategori eklerken iki dosyayı birlikte güncelle.
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
  amerika: { arts: [LineChart, Globe, Candles], tone: "accent", label: "Amerika" },
  avrupa: { arts: [Globe, Bars], tone: "accent", label: "Avrupa" },
  asya: { arts: [Globe, Candles], tone: "accent", label: "Asya" },
  piyasalar: { arts: [Candles, LineChart], tone: "accent", label: "Piyasalar" },
  borsa: { arts: [LineChart, Candles], tone: "accent", label: "Borsa" },
  doviz: { arts: [Exchange, Globe], tone: "accent", label: "Döviz" },
  altin: { arts: [Bullion, Candles], tone: "gold", label: "Altın" },
  gumus: { arts: [Bullion, Abstract], tone: "neutral", label: "Gümüş" },
  kripto: { arts: [Chip, Candles], tone: "accent", label: "Kripto" },
  emtia: { arts: [Abstract, LineChart], tone: "neutral", label: "Emtia" },
  sirketler: { arts: [Document, LineChart], tone: "accent", label: "Şirketler" },

  /* Rehber hub'ları ve kategoriler */
  enflasyon: { arts: [Basket, PriceSteps, Bars], tone: "primary", label: "Enflasyon" },
  "asgari-ucret": { arts: [Payslip, Bars, Document], tone: "primary", label: "Asgari Ücret" },
  faiz: { arts: [Percent, LineChart], tone: "accent", label: "Faiz" },
  vergi: { arts: [Document, Payslip], tone: "neutral", label: "Vergi ve SGK" },
  emekli: { arts: [Payslip, Percent], tone: "neutral", label: "Emeklilik" },
  kredi: { arts: [House, Percent, Calculator], tone: "neutral", label: "Kredi" },
  butce: { arts: [Calculator, Bars], tone: "primary", label: "Bütçe" },
  birikim: { arts: [Vault, Bullion, Calculator], tone: "primary", label: "Birikim" },
  ogrenci: { arts: [Guide, Calculator], tone: "primary", label: "Öğrenci Finansı" },
  rehber: { arts: [Guide, Document], tone: "primary", label: "Rehber" },
  araclar: { arts: [Calculator, Percent], tone: "accent", label: "Araçlar" },
};

/**
 * Ton paletleri.
 *
 * `bg` → `bgTo` köşegen gradyanın iki ucu; düz zemin yerine hafif bir
 * geçiş, görseli "ekran görüntüsü" olmaktan çıkarıp kompozisyon yapar.
 * `ink` çizgi/gövde rengi, `accent` ise tek vurgu rengidir. Vurgu TEK
 * renkte kalmalı — iki vurgu rengi kompozisyonu dağıtıyor.
 */
const TONES = {
  primary: {
    bg: "var(--brand-primary-950)",
    bgTo: "var(--brand-primary-900)",
    ink: "var(--brand-primary-300)",
    accent: "var(--brand-primary-400)",
    glow: "var(--brand-primary-500)",
  },
  accent: {
    bg: "var(--brand-accent-950)",
    bgTo: "var(--brand-accent-900)",
    ink: "var(--brand-accent-300)",
    accent: "var(--brand-accent-400)",
    glow: "var(--brand-accent-500)",
  },
  gold: {
    bg: "var(--brand-gold-950)",
    bgTo: "var(--brand-gold-900)",
    ink: "var(--brand-gold-300)",
    accent: "var(--brand-gold-400)",
    glow: "var(--brand-gold-500)",
  },
  neutral: {
    bg: "var(--brand-accent-900)",
    bgTo: "var(--brand-accent-950)",
    ink: "var(--brand-accent-200)",
    accent: "var(--brand-accent-300)",
    glow: "var(--brand-accent-400)",
  },
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
 * -------------------------------------------------------------------------- */
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

  /* Motiflere geçirilen palet — gradyan referansları url() olarak. */
  const p = {
    fill: `url(#${uid}-fill)`,
    soft: `url(#${uid}-soft)`,
    ink: tone.ink,
    accent: tone.accent,
  };

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
          {/* Zemin — köşegen geçiş */}
          <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={tone.bg} />
            <stop offset="100%" stopColor={tone.bgTo} />
          </linearGradient>

          {/* Gövde dolgusu — dikey gradyan, hacim hissi */}
          <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tone.ink} stopOpacity="0.95" />
            <stop offset="100%" stopColor={tone.ink} stopOpacity="0.45" />
          </linearGradient>

          {/* Soluk dolgu — arka katmanlar ve alan grafikleri */}
          <linearGradient id={`${uid}-soft`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tone.ink} stopOpacity="0.35" />
            <stop offset="100%" stopColor={tone.ink} stopOpacity="0.05" />
          </linearGradient>

          {/* Işık — konumu içeriğe göre değişir */}
          <radialGradient id={`${uid}-glow`} cx={variant.cx} cy={variant.cy} r="70%">
            <stop offset="0%" stopColor={tone.glow} stopOpacity="0.38" />
            <stop offset="55%" stopColor={tone.glow} stopOpacity="0.10" />
            <stop offset="100%" stopColor={tone.glow} stopOpacity="0" />
          </radialGradient>

          {/* Alt vinyet — üstüne yazı gelirse okunur kalsın */}
          <linearGradient id={`${uid}-vignette`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.28" />
          </linearGradient>

          <pattern id={`${uid}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0 H0 V20" fill="none" stroke={tone.ink} strokeWidth="0.5" opacity="0.14" />
          </pattern>
        </defs>

        <rect width="320" height="180" fill={`url(#${uid}-bg)`} />
        <rect width="320" height="180" fill={`url(#${uid}-grid)`} />
        <rect width="320" height="180" fill={`url(#${uid}-glow)`} />

        <g
          transform={`translate(${variant.tx} ${variant.ty}) scale(${variant.scale}) translate(${
            (160 * (1 - variant.scale)) / variant.scale
          } ${(90 * (1 - variant.scale)) / variant.scale})`}
        >
          <Art {...p} />
        </g>

        <rect width="320" height="180" fill={`url(#${uid}-vignette)`} />
      </svg>

      {showLabel ? (
        <span className="absolute bottom-3 left-3 rounded-brand bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
          {motif.label}
        </span>
      ) : null}
    </div>
  );
}
