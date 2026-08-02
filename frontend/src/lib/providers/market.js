/**
 * ============================================================================
 *  MARKET DATA PROVIDER — piyasa verisi
 * ============================================================================
 *  Arayüz bu dosyadaki `getQuotes()` / `getTickerQuotes()` fonksiyonlarını
 *  çağırır. Hangi sağlayıcının bağlı olduğunu BİLMEZ.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  ŞU AN HİÇBİR SAĞLAYICI BAĞLI DEĞİL — bu bilinçli bir durumdur.
 *  ────────────────────────────────────────────────────────────────────────
 *  Piyasa verisi lisanslıdır. Özellikle:
 *
 *   • Borsa İstanbul eş zamanlı verisi lisans gerektirir. Lisanssız
 *     scrape etmek veya yeniden dağıtmak SÖZLEŞME İHLALİDİR.
 *     Gecikmeli (15 dk) veri bile çoğu zaman izne tabidir.
 *   • TCMB kurları resmî ve serbestçe kullanılabilir, ancak GÜNDE BİR KEZ
 *     (15:30) yayımlanır — "canlı kur" değildir, öyle sunulmamalıdır.
 *   • Uluslararası endeks ve emtia verisi için ticari bir sağlayıcı gerekir.
 *
 *  Bu yüzden `getQuotes()` yapılandırma yoksa `unconfigured` döner ve arayüz
 *  "Veri sağlayıcısı yapılandırılmadı" yazar. Sahte fiyat ÜRETMEZ.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  YENİ SAĞLAYICI BAĞLAMA
 *  ────────────────────────────────────────────────────────────────────────
 *  1. `.env.local` içine `MARKET_DATA_PROVIDER` ve anahtarını yaz.
 *  2. Aşağıdaki `ADAPTERS` objesine bir adaptör ekle.
 *  3. Adaptör ham yanıtı `normalizeQuote()` ile site şemasına çevirsin.
 *  Arayüzde tek satır değişiklik gerekmez.
 * ============================================================================
 */

import "server-only";
import { cache } from "react";

import {
  ProviderStatus,
  fetchJson,
  guard,
  mock,
  mockAllowed,
  ok,
  unconfigured,
} from "./base";
import { getInstrument, tickerInstruments, instrumentsByGroup } from "./instruments";

/* -------------------------------------------------------------------------- */
/*  Yapılandırma                                                              */
/* -------------------------------------------------------------------------- */

const PROVIDER_ID = process.env.MARKET_DATA_PROVIDER || "";
const API_KEY = process.env.MARKET_DATA_API_KEY || "";
const API_BASE = process.env.MARKET_DATA_BASE_URL || "";

/** Sağlayıcının bildirdiği gecikme (dakika). Lisansa göre değişir. */
const DELAY_MINUTES = Number(process.env.MARKET_DATA_DELAY_MINUTES ?? "15");

/** Kaç saniyede bir tazelensin? Gecikmeli veride sık çekmenin anlamı yok. */
const REVALIDATE = Number(process.env.MARKET_DATA_REVALIDATE ?? "60");

const isConfigured = () => Boolean(PROVIDER_ID && (API_KEY || API_BASE));

/** Kaynak künyesi — arayüzde "Kaynak: …" satırını besler. */
function sourceInfo() {
  return {
    name: process.env.MARKET_DATA_SOURCE_NAME || (isConfigured() ? PROVIDER_ID : "—"),
    url: process.env.MARKET_DATA_SOURCE_URL || null,
    license: process.env.MARKET_DATA_LICENSE || null,
    delayMinutes: isConfigured() ? DELAY_MINUTES : null,
  };
}

/* -------------------------------------------------------------------------- */
/*  Normalizasyon                                                             */
/* -------------------------------------------------------------------------- */

/**
 * @typedef {object} Quote
 * @property {string}  symbol         Kanonik sembol (INSTRUMENTS'tan)
 * @property {string}  name
 * @property {string}  shortName
 * @property {string}  group
 * @property {string}  unit
 * @property {number}  precision
 * @property {number|null} value          Son değer
 * @property {number|null} previousClose  Önceki kapanış
 * @property {number|null} change         Mutlak değişim
 * @property {number|null} changePercent  Yüzde değişim
 * @property {-1|0|1}      direction      Yön — RENKTEN BAĞIMSIZ işaret için
 * @property {string|null} updatedAt      Verinin ait olduğu an (ISO)
 */

/**
 * Ham sağlayıcı yanıtını site şemasına çevirir.
 * Eksik/geçersiz sayılar `null` kalır — 0 YAZILMAZ, çünkü 0 gerçek bir
 * fiyat değeridir ve "veri yok" ile karıştırılmamalıdır.
 */
export function normalizeQuote(symbol, raw) {
  const instrument = getInstrument(symbol);
  if (!instrument) return null;

  const num = (v) => {
    const n = typeof v === "string" ? Number(v.replace(",", ".")) : v;
    return Number.isFinite(n) ? n : null;
  };

  const value = num(raw?.value ?? raw?.price ?? raw?.last);
  const previousClose = num(raw?.previousClose ?? raw?.prevClose ?? raw?.open);

  let change = num(raw?.change);
  let changePercent = num(raw?.changePercent ?? raw?.changePct);

  /* Sağlayıcı değişimi vermediyse kapanıştan türet — ikisi de varsa. */
  if (change === null && value !== null && previousClose !== null) {
    change = value - previousClose;
  }
  if (changePercent === null && change !== null && previousClose) {
    changePercent = (change / previousClose) * 100;
  }

  return {
    symbol: instrument.symbol,
    name: instrument.name,
    shortName: instrument.shortName,
    group: instrument.group,
    unit: instrument.unit,
    precision: instrument.precision,
    value,
    previousClose,
    change,
    changePercent,
    direction: changePercent === null ? 0 : Math.sign(changePercent),
    updatedAt: raw?.updatedAt ?? raw?.timestamp ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/*  Adaptörler                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Sağlayıcıya özel adaptörler. Her biri kanonik sembol listesi alır ve
 * `{ [symbol]: rawQuote }` döner. Normalizasyonu çağıran taraf yapar.
 *
 * Örnek bir adaptör iskeleti aşağıda yorumda bırakıldı — gerçek sağlayıcı
 * seçilince doldurulacak. Uydurma bir endpoint yazmıyoruz.
 */
const ADAPTERS = {
  /**
   * Genel amaçlı REST adaptörü.
   * `MARKET_DATA_BASE_URL` şu biçimde bir uç nokta beklenir:
   *   GET {base}/quotes?symbols=USDTRY,EURTRY
   *   → { "USDTRY": { value, previousClose, updatedAt }, ... }
   *
   * Kendi backend'in (.NET API) bu biçimi sunuyorsa doğrudan çalışır.
   */
  rest: async (symbols) => {
    const url = `${API_BASE.replace(/\/$/, "")}/quotes?symbols=${symbols.join(",")}`;
    return fetchJson(url, {
      headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {},
      revalidate: REVALIDATE,
      tags: ["market-data"],
      provider: "market:rest",
      timeout: 5000,
    });
  },
};

/* -------------------------------------------------------------------------- */
/*  Geliştirme verisi                                                         */
/* -------------------------------------------------------------------------- */

/**
 * SADECE GELİŞTİRME. Arayüzü (hizalama, taşma, uzun sayı) test etmek için
 * sabit değerler. Rastgelelik YOK — her yenilemede aynı sayı gelir ki
 * "canlı görünüp" kimseyi yanıltmasın. Production'da çağrılmaz.
 */
function developmentQuotes(symbols) {
  const FIXTURES = {
    USDTRY: { value: 42.1834, previousClose: 42.0102 },
    EURTRY: { value: 49.2671, previousClose: 49.4013 },
    GBPTRY: { value: 56.8420, previousClose: 56.7011 },
    EURUSD: { value: 1.1679, previousClose: 1.1702 },
    XAUTRY_G: { value: 5842.30, previousClose: 5810.75 },
    XAUUSD: { value: 4312.60, previousClose: 4298.10 },
    XAGUSD: { value: 58.44, previousClose: 59.02 },
    XAGTRY_G: { value: 79.16, previousClose: 79.88 },
    XU100: { value: 11284.37, previousClose: 11190.02 },
    XU030: { value: 12408.11, previousClose: 12330.45 },
    XBANK: { value: 18902.55, previousClose: 19044.20 },
    SPX: { value: 6842.11, previousClose: 6810.44 },
    NDX: { value: 25311.80, previousClose: 25190.33 },
    DJI: { value: 48120.66, previousClose: 48233.10 },
    DAX: { value: 24788.90, previousClose: 24701.15 },
    FTSE: { value: 9612.44, previousClose: 9598.20 },
    CAC: { value: 8344.72, previousClose: 8360.11 },
    N225: { value: 51204.30, previousClose: 50880.65 },
    HSI: { value: 26840.12, previousClose: 27010.44 },
    SSEC: { value: 3988.71, previousClose: 3971.02 },
    BRENT: { value: 71.84, previousClose: 72.40 },
    WTI: { value: 68.12, previousClose: 68.70 },
    NATGAS: { value: 4.318, previousClose: 4.290 },
    BTCUSD: { value: 96420, previousClose: 94880 },
    ETHUSD: { value: 3284, previousClose: 3311 },
  };

  const out = {};
  for (const symbol of symbols) {
    if (FIXTURES[symbol]) out[symbol] = { ...FIXTURES[symbol], updatedAt: null };
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/*  Genel API                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Verilen semboller için kotasyon çeker.
 *
 * @param {string[]} symbols  Kanonik semboller
 * @returns {Promise<import("./base").ProviderResult>} `data` → Quote[]
 */
export const getQuotes = cache(async (symbols) => {
  const wanted = (symbols ?? []).filter(Boolean);
  if (wanted.length === 0) return ok([], { source: sourceInfo() });

  const source = sourceInfo();

  /* Sağlayıcı yok → geliştirmede mock, production'da şeffaf boş durum. */
  if (!isConfigured()) {
    if (mockAllowed()) {
      const raw = developmentQuotes(wanted);
      const data = wanted.map((s) => normalizeQuote(s, raw[s] ?? {})).filter(Boolean);
      return mock(data, {
        source: { ...source, name: "Geliştirme verisi" },
        delayMinutes: null,
      });
    }
    return unconfigured({ source });
  }

  const adapter = ADAPTERS[PROVIDER_ID] ?? ADAPTERS.rest;

  return guard(async () => {
    const raw = await adapter(wanted);
    const data = wanted
      .map((symbol) => normalizeQuote(symbol, raw?.[symbol]))
      .filter((q) => q && q.value !== null);

    /* Sağlayıcı yanıt verdi ama hiçbir sembol çözülemedi → hata say. */
    if (data.length === 0) {
      return unconfigured({
        source,
        message: "Sağlayıcı yanıt verdi ancak tanınan sembol dönmedi.",
      });
    }

    return ok(data, { source, delayMinutes: DELAY_MINUTES });
  }, source);
});

/** Üst piyasa bandı için hazır çağrı. */
export const getTickerQuotes = cache(() =>
  getQuotes(tickerInstruments().map((i) => i.symbol)),
);

/** Belirli bir piyasa grubu için (ana sayfa sekmeleri, kategori sayfaları). */
export const getGroupQuotes = cache((group) =>
  getQuotes(instrumentsByGroup(group).map((i) => i.symbol)),
);

export { ProviderStatus };
