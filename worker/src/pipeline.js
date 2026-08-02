/**
 * ============================================================================
 *  İŞLEME HATTI — normalize → dedup → cluster → puanla → kuyruk
 * ============================================================================
 *  Queue tüketicisi her ham kaydı bu hattan geçirir.
 *
 *  HAT SONUNDA HABER SAYFASI OLUŞMAZ. Hattın çıktısı en fazla
 *  `editorial_queue` kaydıdır — yani bir editöre "buna bak" demektir.
 *  Ham gelişmeden yayımlanmış habere geçiş yalnızca insan onayıyla olur.
 * ============================================================================
 */

/* -------------------------------------------------------------------------- */
/*  Metin normalizasyonu                                                      */
/* -------------------------------------------------------------------------- */

/**
 * ⚠️ Büyük/küçük TÜM Türkçe harfler burada — ve ASCII büyük "I" dahil.
 *
 * Neden? `toLocaleLowerCase("tr")` ASCII "I" harfini noktasız "ı"ya çevirir;
 * ardından [a-z0-9] filtresinde silinir. Sonuç: "BIST" → "b st", "IMF" → "mf".
 * Bu, akronim içeren başlıkların kümelenmesini sessizce bozardı.
 * Türkçe harfleri önce elle çevirip düz `toLowerCase()` kullanıyoruz.
 */
const TR_MAP = {
  ç: "c", Ç: "c",
  ğ: "g", Ğ: "g",
  ı: "i", I: "i",
  İ: "i",
  ö: "o", Ö: "o",
  ş: "s", Ş: "s",
  ü: "u", Ü: "u",
};

/** Karşılaştırma için metni sadeleştirir (Türkçe duyarlı). */
export function normalizeText(value) {
  return String(value ?? "")
    .replace(/[çÇğĞıIİöÖşŞüÜ]/g, (ch) => TR_MAP[ch] ?? ch)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * EŞANLAMLI SÖZLÜĞÜ — parmak izi öncesi normalizasyon.
 *
 * Haber başlıkları aynı kurumu farklı adlarla anar: "TCMB", "Merkez
 * Bankası", "Türkiye Cumhuriyet Merkez Bankası". Bunları tek forma
 * indirmezsek aynı olayın iki başlığı sözlük olarak hiç örtüşmez ve
 * kümeleme kaçırır.
 *
 * Uzun ifadeler ÖNCE gelmeli — "merkez bankasi" kısaltılmadan önce
 * "turkiye cumhuriyet merkez bankasi" yakalanmalı.
 */
const SYNONYMS = [
  [/turkiye cumhuriyet merkez bankasi/g, "tcmb"],
  [/merkez bankasi/g, "tcmb"],
  [/para politikasi kurulu/g, "tcmb ppk"],
  [/turkiye istatistik kurumu/g, "tuik"],
  [/istatistik kurumu/g, "tuik"],
  [/tuketici fiyat endeksi/g, "tufe"],
  [/federal reserve/g, "fed"],
  [/avrupa merkez bankasi/g, "ecb"],
  [/borsa istanbul/g, "bist"],
  [/sosyal guvenlik kurumu/g, "sgk"],
  /* Fiil eşanlamlıları: "sabit tuttu" ve "değiştirmedi" aynı olayı anlatır. */
  [/degistirmedi|sabit tuttu|sabit biraki\w*|ayni seviyede tuttu/g, "sabit"],
  [/aciklandi|acikladi|duyurdu|duyuruldu|yayimladi/g, "aciklama"],
  [/yukseldi|artti|yukselis|zam geldi|zam yapildi|zammi/g, "artis"],
  [/dustu|geriledi|azaldi|dusus/g, "dusus"],
  /* "rekor kırdı" / "rekor tazeledi" / "rekor yeniledi" aynı olaydır. */
  [/rekor (kirdi|tazeledi|yeniledi|seviyeye|seviyesine)/g, "rekor"],
  [/(kirdi|tazeledi|yeniledi) rekor/g, "rekor"],
];

function applySynonyms(text) {
  let out = text;
  for (const [re, replacement] of SYNONYMS) out = out.replace(re, replacement);
  return out;
}

/**
 * Başlıktan "parmak izi" üretir: eşanlamlılar sadeleştirilir, anlamsız
 * bağlaçlar atılır, kalan kelimeler alfabetik sıralanır. Böylece kelime
 * sırası farklı olan aynı haber eşleşir.
 *
 *   "TCMB faizi sabit tuttu"          →  faiz sabit tcmb
 *   "Merkez Bankası faizi değiştirmedi" →  faiz sabit tcmb   ← aynı
 */
const STOPWORDS = new Set([
  "ve", "ile", "icin", "de", "da", "bir", "bu", "su", "o", "ama", "ancak",
  "gibi", "kadar", "sonra", "once", "daha", "en", "cok", "az", "mi", "mu",
  "ne", "her", "tum", "olarak", "oldu", "olan", "the", "and", "for", "to",
]);

export function titleFingerprint(title) {
  const words = applySynonyms(normalizeText(title))
    .split(" ")
    /**
     * Kaba gövdeleme: uzun kelimeleri SABİT uzunluğa kırp.
     *
     * Önceki sürüm `w.length - 2` kullanıyordu; bu, farklı uzunluktaki
     * çekimleri farklı köklere indiriyordu:
     *   "enflasyonu" (10) → "enflasyo"   "enflasyon" (9) → "enflasy"  ✗
     *
     * Sabit 5 karakterlik önek ikisini de "enfla" yapar. 5 seçildi çünkü
     * 6'da "faizini"(7)→"faizin" ile "faizi"(5) hâlâ ayrışıyordu;
     * 5'te ikisi de "faizi" oluyor. Daha kısası (4) alakasız kelimeleri
     * birleştirmeye başlıyor.
     */
    .map((w) => (w.length > 5 ? w.slice(0, 5) : w))
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));

  return [...new Set(words)].sort().join(" ");
}

/** İçerik hash'i — birebir tekrarları yakalar. */
export async function contentHash(title, excerpt) {
  const input = `${normalizeText(title)}|${normalizeText(excerpt).slice(0, 400)}`;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * İki parmak izi arasındaki Jaccard benzerliği (0–1).
 * Kelime kümesi kesişimi / birleşimi.
 */
export function similarity(a, b) {
  const setA = new Set(a.split(" ").filter(Boolean));
  const setB = new Set(b.split(" ").filter(Boolean));
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const w of setA) if (setB.has(w)) intersection += 1;

  return intersection / (setA.size + setB.size - intersection);
}

/**
 * Aynı olay sayılma eşiği.
 *
 * ÖLÇÜM (worker/test/pipeline.test.mjs):
 *   gerçekten aynı olan çiftler  → 0.50 – 0.85
 *   gerçekten farklı olan çiftler → 0.00 – 0.35
 * Eşik bu iki kümenin arasına, farklı olanların ÜSTÜNE yakın konumlandı.
 *
 * ⚠️ Düşürürsen farklı olaylar birleşir ve biri gömülür — bu, tekrar
 * sayfa üretmekten daha kötüdür. Yükseltirsen aynı olay birden fazla
 * kümede kalır; editör kuyruğunda bunu görür ve elle birleştirebilir.
 * Yani yanılma payını YUKARI yönde bırakmak daha güvenli.
 */
export const CLUSTER_THRESHOLD = 0.45;

/**
 * BİLEŞİK KÜMELEME SKORU.
 *
 * Tek başına kelime benzerliği yetersizdir: iki gazete aynı olayı tamamen
 * farklı cümlelerle yazabilir. Bu yüzden üç sinyali birleştiriyoruz:
 *
 *   %55  başlık benzerliği (sözlüksel)
 *   %30  ortak varlıklar   (TCMB, TÜİK, Fed — kurum örtüşmesi güçlü sinyal)
 *   %15  ortak semboller   (USDTRY, XU100 — aynı piyasayı ilgilendiriyor)
 *
 * Ağırlıklar sözlüksel benzerliğe yaslanıyor; varlık örtüşmesi tek başına
 * eşiği geçirmemeli, yoksa "TCMB" geçen her haber tek kümede toplanır.
 */
export function clusterScore(a, b) {
  const lexical = similarity(a.fingerprint, b.fingerprint);

  /**
   * ⚠️ EKSİK SİNYAL, KARŞIT KANIT DEĞİLDİR.
   *
   * Bir başlıkta kurum adı geçip diğerinde geçmiyorsa ("Temmuz enflasyonu
   * açıklandı" vs "TÜİK temmuz enflasyonunu açıkladı") bu, iki haberin
   * farklı olay olduğunu göstermez — sadece o sinyalin karşılaştırılamaz
   * olduğunu gösterir.
   *
   * Eski sürüm bu durumu 0 puan sayıyor ve toplam skoru aşağı çekiyordu;
   * gerçekten aynı olan haberler eşiğin altında kalıyordu. Artık
   * karşılaştırılamayan sinyalin ağırlığı sözlüksel benzerliğe DEVREDİLİR.
   */
  const compare = (x = [], y = []) => {
    /* İki taraftan biri boşsa bu sinyal karşılaştırılamaz. */
    if (x.length === 0 || y.length === 0) return null;
    const setY = new Set(y);
    const shared = x.filter((v) => setY.has(v)).length;
    return shared / Math.max(x.length, y.length);
  };

  const entityScore = compare(a.entities, b.entities);
  const symbolScore = compare(a.symbols, b.symbols);

  let lexicalWeight = 0.55;
  let total = 0;

  if (entityScore === null) lexicalWeight += 0.3;
  else total += entityScore * 0.3;

  if (symbolScore === null) lexicalWeight += 0.15;
  else total += symbolScore * 0.15;

  return total + lexical * lexicalWeight;
}

/* -------------------------------------------------------------------------- */
/*  Varlık ve sembol çıkarımı                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Basit sözlük tabanlı çıkarım. Kasıtlı olarak sade — bir dil modeli
 * çağırmıyoruz, çünkü bu aşama sınıflandırmadır ve deterministik olmalıdır.
 */
const ENTITY_PATTERNS = [
  { key: "TCMB", re: /\b(tcmb|merkez bankasi|para politikasi kurulu|ppk)\b/ },
  { key: "TÜİK", re: /\b(tuik|istatistik kurumu)\b/ },
  { key: "Fed", re: /\b(fed|federal reserve|fomc)\b/ },
  { key: "ECB", re: /\b(ecb|avrupa merkez bankasi)\b/ },
  { key: "BDDK", re: /\bbddk\b/ },
  { key: "SPK", re: /\bspk\b/ },
  { key: "KAP", re: /\bkap\b/ },
  { key: "Hazine", re: /\b(hazine|maliye bakanligi)\b/ },
  { key: "SGK", re: /\b(sgk|sosyal guvenlik)\b/ },
];

const SYMBOL_PATTERNS = [
  { symbol: "USDTRY", re: /\b(dolar|usd|amerikan dolari)\b/ },
  { symbol: "EURTRY", re: /\b(euro|eur)\b/ },
  { symbol: "XAUTRY_G", re: /\b(gram altin|altin)\b/ },
  { symbol: "XAUUSD", re: /\b(ons altin)\b/ },
  { symbol: "XAGUSD", re: /\b(gumus)\b/ },
  { symbol: "XU100", re: /\b(bist|borsa istanbul|bist 100)\b/ },
  { symbol: "BRENT", re: /\b(brent|petrol)\b/ },
  { symbol: "BTCUSD", re: /\b(bitcoin|btc)\b/ },
];

/**
 * Bölüm tespiti PUAN TABANLIDIR, ilk eşleşme değil.
 *
 * Neden? "TCMB faizi sabit tuttu, dolar geriledi" başlığında hem "faiz"
 * hem "dolar" geçer. İlk eşleşme kuralıyla bu haber "döviz" bölümüne
 * düşerdi — oysa haber bir para politikası haberidir.
 *
 * `weight` alanı sinyalin ne kadar belirleyici olduğunu söyler:
 *   3 → kurumsal/politika sinyali, haberin KONUSUNU belirler
 *   2 → güçlü tematik sinyal
 *   1 → geçerken anılmış olabilir
 */
const SECTION_PATTERNS = [
  /* Para politikası ve makro — haberin konusu genelde budur. */
  { section: "turkiye", re: /\b(tcmb|ppk|politika faizi|enflasyon|tufe|asgari ucret|vergi|sgk|emekli|issizlik|butce)\b/, weight: 3 },
  { section: "dunya", re: /\b(fed|fomc|ecb|abd ekonomi\w*|avrupa merkez|cin ekonomi\w*|kuresel|jeopolitik)\b/, weight: 3 },
  /* Piyasa bölümleri — konu gerçekten fiyat hareketiyse. */
  { section: "borsa", re: /\b(bist|borsa|hisse|kap|bilanco|halka arz|endeks)\b/, weight: 2 },
  { section: "altin", re: /\b(gram altin|ons altin|altin fiyat\w*|gumus)\b/, weight: 2 },
  { section: "doviz", re: /\b(dolar kuru|euro kuru|doviz kuru|kur atag\w*|serbest piyasa)\b/, weight: 2 },
  /* Zayıf sinyaller — tek başına bölüm belirlemeye yetmez. */
  { section: "doviz", re: /\b(dolar|euro|doviz)\b/, weight: 1 },
  { section: "altin", re: /\b(altin|ons)\b/, weight: 1 },
  { section: "dunya", re: /\b(nasdaq|s&p|dax|nikkei|abd|avrupa|cin)\b/, weight: 1 },
];

export function extractEntities(text) {
  const t = normalizeText(text);
  return ENTITY_PATTERNS.filter((p) => p.re.test(t)).map((p) => p.key);
}

export function extractSymbols(text) {
  const t = normalizeText(text);
  return [...new Set(SYMBOL_PATTERNS.filter((p) => p.re.test(t)).map((p) => p.symbol))];
}

export function detectSection(text, fallback = null) {
  const t = applySynonyms(normalizeText(text));

  /* Her bölüm için ağırlıkları topla; en yüksek puanlı kazansın. */
  const scores = new Map();
  for (const p of SECTION_PATTERNS) {
    if (!p.re.test(t)) continue;
    scores.set(p.section, (scores.get(p.section) ?? 0) + p.weight);
  }

  if (scores.size === 0) return fallback;

  let best = null;
  let bestScore = 0;
  for (const [section, score] of scores) {
    if (score > bestScore) {
      best = section;
      bestScore = score;
    }
  }

  /* Yalnızca zayıf sinyal (puan 1) varsa emin değiliz — kaynağın
     varsayılan bölümüne güven. */
  return bestScore >= 2 ? best : (fallback ?? best);
}

/* -------------------------------------------------------------------------- */
/*  Önem puanı                                                                */
/* -------------------------------------------------------------------------- */

/**
 * 0–100. Bu puan SIRALAMA içindir, yayın kararı için DEĞİL.
 * Yüksek puanlı bir kayıt bile editör onayı olmadan yayımlanmaz.
 */
export function computeImportance({ sourceTrust, entities, symbols, publishedAt, sourceCount = 1 }, now = Date.now()) {
  let score = 0;

  /* Kaynak güvenilirliği en ağır sinyal — resmî açıklama her zaman önemli. */
  score += Math.round((sourceTrust ?? 50) * 0.35);

  /* Merkez bankası / istatistik kurumu geçiyorsa piyasa etkisi yüksektir. */
  const heavyweight = ["TCMB", "TÜİK", "Fed", "ECB"];
  if (entities.some((e) => heavyweight.includes(e))) score += 18;
  else if (entities.length > 0) score += 8;

  /* İlgili finansal sembol sayısı — ne kadar çok piyasayı ilgilendiriyorsa. */
  score += Math.min(3, symbols.length) * 4;

  /* Kaç FARKLI kaynak aynı olayı bildirdi? Doğrulama sinyali. */
  score += Math.min(4, sourceCount - 1) * 5;

  /* Tazelik — 24 saatte sönümlenir. */
  if (publishedAt) {
    const ageHours = (now - new Date(publishedAt).getTime()) / 3600000;
    if (ageHours >= 0) score += Math.max(0, 15 * (1 - ageHours / 24));
  }

  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Bir kümenin editoryal kuyruğa girip girmeyeceğine karar verir.
 *
 * Eşik bilinçli olarak yüksek: kuyruğu doldurmak editörü boğar ve
 * gerçekten önemli olan kaybolur.
 */
export function shouldQueueForEditorial(cluster) {
  if (cluster.status !== "open") return false;
  /* Resmî tek kaynak yeterlidir; ikincil kaynaklarda doğrulama isteriz. */
  const officialSignal = (cluster.max_importance ?? 0) >= 70;
  const corroborated = (cluster.source_count ?? 1) >= 2 && (cluster.max_importance ?? 0) >= 55;
  return officialSignal || corroborated;
}
