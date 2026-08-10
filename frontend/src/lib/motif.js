/**
 * ============================================================================
 *  HABERİN KONUSUNA GÖRE GÖRSEL MOTİFİ
 * ============================================================================
 *  Bir haberin kartında ve sayfasında hangi editoryal grafiğin çizileceğini
 *  belirler. Motiflerin kendisi `components/media/CategoryArt.jsx` içinde
 *  çizilir; burada yalnızca HANGİSİ sorusunun cevabı hesaplanır.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  NEDEN BÖLÜM YETMİYOR?
 *  ────────────────────────────────────────────────────────────────────────
 *  Görsel önce bölüme göre seçiliyordu. Ama "Türkiye Ekonomisi" bölümündeki
 *  bir enflasyon haberi ile bir asgari ücret haberi aynı sütun grafiğini
 *  alıyordu; liste sayfasında art arda dizilince hepsi aynı görünüyordu ve
 *  görsel hiçbir bilgi taşımıyordu.
 *
 *  Burada haberin KENDİ sinyallerinden (sembol, etiket, başlık) konuyu
 *  çıkarıyoruz: dolar haberi kur motifini, faiz kararı yüzde motifini alır.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  ⚠️ GEÇERKEN ANILAN KELİME KONUYU BELİRLEMEZ
 *  ────────────────────────────────────────────────────────────────────────
 *  Worker'daki `detectSection` ile aynı disiplin. Yapısal alanlar (sembol,
 *  etiket) güçlü sinyaldir; serbest metinde geçen kelime zayıftır ve tek
 *  başına bölümün önüne geçemez. Aksi halde "enflasyonun kur üzerindeki
 *  etkisi" cümlesi geçen her haber kur görseli alırdı.
 *
 *  Bu bir GÖRSEL seçimidir, editoryal sınıflandırma değil: yanlış seçim
 *  haberi yanlış bölüme koymaz, yalnızca daha az isabetli bir grafik çizer.
 * ============================================================================
 */

/**
 * Geçerli motif anahtarları — TEK DOĞRULUK KAYNAĞI.
 *
 * ⚠️ `CategoryArt.jsx` içindeki `MOTIFS` nesnesiyle aynı anahtarları
 * taşımalıdır. Oraya yeni bir kategori eklersen buraya da ekle; buradaki
 * bir anahtar orada yoksa çizim sessizce varsayılan soyut grafiğe düşer.
 */
export const MOTIF_KEYS = new Set([
  /* Haber bölümleri */
  "turkiye", "dunya", "amerika", "avrupa", "asya", "piyasalar", "borsa",
  "doviz", "altin", "gumus", "kripto", "emtia", "sirketler",
  /* Rehber hub'ları ve kategoriler */
  "enflasyon", "asgari-ucret", "faiz", "vergi", "emekli", "kredi",
  "butce", "birikim", "ogrenci", "rehber", "araclar",
]);

/** Türkçe harfleri sadeleştir — "altın" ve "altin" aynı eşleşsin. */
function fold(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

/** Sembol öneki → motif. Yapısal alan olduğu için güçlü sinyal. */
const SYMBOL_MOTIFS = [
  { re: /^(usd|eur|gbp|jpy|chf)try|^dxy/, key: "doviz" },
  { re: /^xau|^gau|gramaltin/, key: "altin" },
  { re: /^xag|gumus/, key: "gumus" },
  { re: /^(xu\d+|bist)/, key: "borsa" },
  { re: /^(btc|eth|sol|xrp)/, key: "kripto" },
  { re: /^(brent|wti|ng|cl)|petrol|dogalgaz/, key: "emtia" },
];

/**
 * Metin kalıpları. `weight: 2` → tek başına yeter; `weight: 1` → zayıf,
 * yalnızca başka bir sinyalle birleşince kazanır.
 */
const TOPIC_PATTERNS = [
  /* Güçlü: haberin konusunun bu olduğunu gösteren kalıplar */
  { key: "enflasyon", re: /(enflasyon|tufe|ufe|fiyat endeksi)/, weight: 2 },
  { key: "faiz", re: /(politika faizi|faiz karar|ppk|faiz oran|mevduat faiz)/, weight: 2 },
  { key: "asgari-ucret", re: /(asgari ucret|net asgari)/, weight: 2 },
  { key: "doviz", re: /(dolar kur|euro kur|doviz kur|serbest piyasa)/, weight: 2 },
  { key: "altin", re: /(gram altin|ons altin|altin fiyat|ceyrek altin)/, weight: 2 },
  { key: "borsa", re: /(bist|borsa istanbul|halka arz|hisse)/, weight: 2 },
  { key: "vergi", re: /(vergi|kdv|otv|beyanname|sgk prim)/, weight: 2 },
  { key: "emekli", re: /(emekli|emeklilik|bagkur|bag-kur|ikramiye)/, weight: 2 },
  { key: "kredi", re: /(kredi|kredi karti|borclanma)/, weight: 2 },
  { key: "kripto", re: /(bitcoin|kripto|ethereum|stablecoin)/, weight: 2 },
  { key: "emtia", re: /(brent|ham petrol|dogalgaz|varil)/, weight: 2 },
  { key: "sirketler", re: /(bilanco|kap bildirim|birlesme|ceyrek kar)/, weight: 2 },
  { key: "butce", re: /(butce|harcama plan|tasarruf plan)/, weight: 2 },

  /* Bölgeler — kurum ve ülke adları güçlü sinyaldir */
  { key: "amerika", re: /(\bfed\b|fomc|abd ekonomi|wall street|nasdaq|s&p 500|beyaz saray)/, weight: 2 },
  { key: "avrupa", re: /(avrupa merkez bankasi|\becb\b|euro bolgesi|avrupa birligi|\bdax\b|almanya ekonomi)/, weight: 2 },
  { key: "asya", re: /(\bcin\b ekonomi|japonya ekonomi|nikkei|hindistan ekonomi|asya piyasa)/, weight: 2 },

  /* Zayıf: haberde geçebilir ama konusu olmayabilir */
  { key: "doviz", re: /(dolar|euro|doviz)/, weight: 1 },
  { key: "altin", re: /(altin|ons)/, weight: 1 },
  { key: "faiz", re: /(faiz)/, weight: 1 },
  { key: "enflasyon", re: /(zam|pahalilik)/, weight: 1 },
];

/** Bölümün taban puanı: zayıf bir metin sinyali bölümü deviremesin. */
const SECTION_BASE_SCORE = 1.5;

/** Bir metin sinyalinin kazanabilmesi için gereken en düşük puan. */
const MIN_CONFIDENT_SCORE = 2;

/**
 * Bir içerik için en uygun motif anahtarını bulur.
 *
 * Öncelik sırası:
 *   1. `motif` — frontmatter'da elle verilmişse editörün sözü geçer
 *   2. Semboller ve etiketler — yapısal, güvenilir
 *   3. Başlık + özet metni — başlıkta geçen güçlü kalıp kabul edilir
 *   4. Bölüm slug'ı — hiçbir güçlü sinyal yoksa
 *
 * Saf fonksiyondur: aynı girdi her zaman aynı sonucu verir. Bu ŞARTTIR —
 * sunucu ve istemci farklı motif seçerse hydration uyuşmazlığı olur.
 *
 * @param {object} [item]
 * @param {string} [item.motif]     Elle verilen motif anahtarı
 * @param {string} [item.section]   Bölüm/hub slug'ı (yedek)
 * @param {string[]} [item.tags]    Etiketler
 * @param {string[]} [item.symbols] İlgili semboller (USDTRY, XAUUSD…)
 * @param {string} [item.title]
 * @param {string} [item.summary]
 * @returns {string} MOTIF_KEYS üyesi bir anahtar
 */
export function resolveMotifKey(item = {}) {
  const { motif, section, tags = [], symbols = [], title = "", summary = "" } = item;

  /* 1) Editör elle seçtiyse tartışma yok. */
  if (motif && MOTIF_KEYS.has(motif)) return motif;

  const scores = new Map();
  const add = (key, weight) => {
    if (!key || !MOTIF_KEYS.has(key)) return;
    scores.set(key, (scores.get(key) ?? 0) + weight);
  };

  /* 2) Semboller — yapısal alan, en güçlü sinyal. */
  for (const raw of Array.isArray(symbols) ? symbols : []) {
    const s = fold(raw).replace(/[^a-z0-9]/g, "");
    if (!s) continue;
    for (const rule of SYMBOL_MOTIFS) {
      if (rule.re.test(s)) add(rule.key, 3);
    }
  }

  /* 3) Etiketler — doğrudan motif anahtarına eşitse güçlü sinyal. */
  for (const tag of Array.isArray(tags) ? tags : []) {
    const t = fold(tag).trim().replace(/\s+/g, "-");
    if (MOTIF_KEYS.has(t)) add(t, 2);
  }

  /* 4) Serbest metin — başlık özete göre daha belirleyicidir, bu yüzden
        özetten gelen sinyal her zaman zayıf sayılır. */
  const titleText = fold(title);
  const summaryText = fold(summary);
  for (const p of TOPIC_PATTERNS) {
    if (p.re.test(titleText)) add(p.key, p.weight);
    else if (p.re.test(summaryText)) add(p.key, 1);
  }

  /* Bölüm de bir adaydır ve eşitlikte kazanması için taban puan alır. */
  if (section && MOTIF_KEYS.has(section)) add(section, SECTION_BASE_SCORE);

  /* Map ekleme sırasını korur; eşit puanda önce eklenen (daha güçlü
     sinyalden gelen) kazanır — sonuç deterministiktir. */
  let best = null;
  let bestScore = 0;
  for (const [key, score] of scores) {
    if (score > bestScore) {
      best = key;
      bestScore = score;
    }
  }

  if (best && bestScore >= MIN_CONFIDENT_SCORE) return best;
  if (section && MOTIF_KEYS.has(section)) return section;
  return best ?? "rehber";
}
