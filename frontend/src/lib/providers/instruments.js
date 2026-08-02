/**
 * ============================================================================
 *  ENSTRÜMAN KAYDI — piyasa verisinin tek tanım noktası
 * ============================================================================
 *  Hangi sembolün nerede, hangi adla, kaç ondalıkla ve hangi birimle
 *  gösterileceği burada durur. Sağlayıcı değişse bile bu kayıt aynı kalır;
 *  provider'lar sadece `providerSymbol` eşlemesini günceller.
 *
 *  Yeni enstrüman eklerken: buraya ekle, arayüzde başka yere dokunma.
 * ============================================================================
 */

/** Piyasa grupları — ana sayfadaki sekmeleri ve kategori sayfalarını besler. */
export const MARKET_GROUPS = {
  doviz: { slug: "doviz", label: "Döviz" },
  metal: { slug: "metal", label: "Değerli Metal" },
  bist: { slug: "bist", label: "Borsa İstanbul" },
  abd: { slug: "abd", label: "ABD" },
  avrupa: { slug: "avrupa", label: "Avrupa" },
  asya: { slug: "asya", label: "Asya" },
  emtia: { slug: "emtia", label: "Emtia" },
  kripto: { slug: "kripto", label: "Kripto" },
};

/**
 * @typedef {object} Instrument
 * @property {string} symbol      Site içi kanonik sembol
 * @property {string} name        Tam ad
 * @property {string} shortName   Dar alanlar (piyasa bandı) için kısa ad
 * @property {string} group       MARKET_GROUPS anahtarı
 * @property {string} unit        "TRY" | "USD" | "EUR" | "point" | "%"
 * @property {number} precision   Gösterilecek ondalık basamak
 * @property {boolean} [inTicker] Üst piyasa bandında görünsün mü?
 */

/** @type {Instrument[]} */
export const INSTRUMENTS = [
  /* ------------------------------------------------------------------ DÖVİZ */
  { symbol: "USDTRY", name: "Amerikan Doları / Türk Lirası", shortName: "Dolar", group: "doviz", unit: "TRY", precision: 4, inTicker: true },
  { symbol: "EURTRY", name: "Euro / Türk Lirası", shortName: "Euro", group: "doviz", unit: "TRY", precision: 4, inTicker: true },
  { symbol: "GBPTRY", name: "İngiliz Sterlini / Türk Lirası", shortName: "Sterlin", group: "doviz", unit: "TRY", precision: 4 },
  { symbol: "EURUSD", name: "Euro / Amerikan Doları", shortName: "EUR/USD", group: "doviz", unit: "USD", precision: 4 },

  /* ---------------------------------------------------------- DEĞERLİ METAL */
  { symbol: "XAUTRY_G", name: "Gram Altın", shortName: "Gram Altın", group: "metal", unit: "TRY", precision: 2, inTicker: true },
  { symbol: "XAUUSD", name: "Ons Altın", shortName: "Ons Altın", group: "metal", unit: "USD", precision: 2, inTicker: true },
  { symbol: "XAGUSD", name: "Gümüş (ons)", shortName: "Gümüş", group: "metal", unit: "USD", precision: 2, inTicker: true },
  { symbol: "XAGTRY_G", name: "Gram Gümüş", shortName: "Gram Gümüş", group: "metal", unit: "TRY", precision: 2 },

  /* --------------------------------------------------------------- BORSA TR */
  { symbol: "XU100", name: "BIST 100", shortName: "BIST 100", group: "bist", unit: "point", precision: 2, inTicker: true },
  { symbol: "XU030", name: "BIST 30", shortName: "BIST 30", group: "bist", unit: "point", precision: 2 },
  { symbol: "XBANK", name: "BIST Bankacılık", shortName: "BIST Banka", group: "bist", unit: "point", precision: 2 },

  /* ------------------------------------------------------------- BORSA ABD */
  { symbol: "SPX", name: "S&P 500", shortName: "S&P 500", group: "abd", unit: "point", precision: 2, inTicker: true },
  { symbol: "NDX", name: "Nasdaq 100", shortName: "Nasdaq", group: "abd", unit: "point", precision: 2, inTicker: true },
  { symbol: "DJI", name: "Dow Jones Sanayi", shortName: "Dow Jones", group: "abd", unit: "point", precision: 2 },

  /* ---------------------------------------------------------- BORSA AVRUPA */
  { symbol: "DAX", name: "DAX (Almanya)", shortName: "DAX", group: "avrupa", unit: "point", precision: 2 },
  { symbol: "FTSE", name: "FTSE 100 (İngiltere)", shortName: "FTSE 100", group: "avrupa", unit: "point", precision: 2 },
  { symbol: "CAC", name: "CAC 40 (Fransa)", shortName: "CAC 40", group: "avrupa", unit: "point", precision: 2 },

  /* ------------------------------------------------------------ BORSA ASYA */
  { symbol: "N225", name: "Nikkei 225 (Japonya)", shortName: "Nikkei", group: "asya", unit: "point", precision: 2 },
  { symbol: "HSI", name: "Hang Seng (Hong Kong)", shortName: "Hang Seng", group: "asya", unit: "point", precision: 2 },
  { symbol: "SSEC", name: "Shanghai Composite (Çin)", shortName: "Shanghai", group: "asya", unit: "point", precision: 2 },

  /* ----------------------------------------------------------------- EMTİA */
  { symbol: "BRENT", name: "Brent Petrol", shortName: "Brent", group: "emtia", unit: "USD", precision: 2, inTicker: true },
  { symbol: "WTI", name: "WTI Ham Petrol", shortName: "WTI", group: "emtia", unit: "USD", precision: 2 },
  { symbol: "NATGAS", name: "Doğal Gaz", shortName: "Doğal Gaz", group: "emtia", unit: "USD", precision: 3 },

  /* ---------------------------------------------------------------- KRİPTO */
  { symbol: "BTCUSD", name: "Bitcoin", shortName: "Bitcoin", group: "kripto", unit: "USD", precision: 0, inTicker: true },
  { symbol: "ETHUSD", name: "Ethereum", shortName: "Ethereum", group: "kripto", unit: "USD", precision: 0 },
];

const BY_SYMBOL = new Map(INSTRUMENTS.map((i) => [i.symbol, i]));

export const getInstrument = (symbol) => BY_SYMBOL.get(symbol) ?? null;

/** Üst piyasa bandında gösterilecekler — kayıt sırasını korur. */
export const tickerInstruments = () => INSTRUMENTS.filter((i) => i.inTicker);

/** Bir gruba ait enstrümanlar. */
export const instrumentsByGroup = (group) => INSTRUMENTS.filter((i) => i.group === group);

/** Tüm kanonik semboller. */
export const allSymbols = () => INSTRUMENTS.map((i) => i.symbol);
