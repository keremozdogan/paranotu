/**
 * ============================================================================
 *  PROVIDER ÇEKİRDEĞİ — ortak sözleşme
 * ============================================================================
 *  Sitedeki HER dış veri kaynağı (piyasa, haber, ekonomik takvim, resmî
 *  kurum) bu dosyadaki `ProviderResult` zarfını döner. Bileşenler ham
 *  `fetch` çağırmaz; provider fonksiyonlarını çağırır.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  EN ÖNEMLİ KURAL — SAHTE VERİ YOK
 *  ────────────────────────────────────────────────────────────────────────
 *  Bir sağlayıcı yapılandırılmamışsa (API anahtarı yok) veya çağrı
 *  başarısızsa, bu katman ASLA uydurma bir sayı üretmez. `status` alanı
 *  "unconfigured" / "error" döner ve arayüz bunu kullanıcıya şeffaf biçimde
 *  gösterir ("Veri sağlayıcısı yapılandırılmadı", "Veri güncellenemedi").
 *
 *  Geliştirme sırasında arayüzü görebilmek için mock veri KULLANILABİLİR;
 *  ancak `isMock: true` işaretlenir ve production'da otomatik devre dışıdır
 *  (bkz. `mockAllowed()`).
 *
 *  Finansal veride yanlış sayı göstermek, hiç göstermemekten çok daha
 *  zararlıdır — kullanıcı buna göre karar veriyor.
 * ============================================================================
 */

import "server-only";

/* -------------------------------------------------------------------------- */
/*  Durum kodları                                                             */
/* -------------------------------------------------------------------------- */

export const ProviderStatus = {
  /** Gerçek sağlayıcıdan taze veri geldi. */
  OK: "ok",
  /** Sağlayıcı yapılandırılmamış (env değişkeni yok). Veri gösterilmez. */
  UNCONFIGURED: "unconfigured",
  /** Çağrı yapıldı ama başarısız oldu (ağ, 5xx, timeout, şema uyuşmazlığı). */
  ERROR: "error",
  /** Sağlayıcıya ulaşılamadı ama elimizde son başarılı yanıt var. */
  STALE: "stale",
  /** Geliştirme ortamı mock verisi — production'da asla oluşmaz. */
  MOCK: "mock",
};

/** Arayüzde veri çizilebilir mi? (mock dahil — ama mock rozeti gösterilir) */
export function hasData(result) {
  return Boolean(
    result &&
      (result.status === ProviderStatus.OK ||
        result.status === ProviderStatus.STALE ||
        result.status === ProviderStatus.MOCK) &&
      result.data != null,
  );
}

/** Kullanıcıya gösterilecek Türkçe durum metni. */
export function statusMessage(result) {
  if (!result) return "Veri yok.";
  switch (result.status) {
    case ProviderStatus.UNCONFIGURED:
      return "Veri sağlayıcısı yapılandırılmadı.";
    case ProviderStatus.ERROR:
      return "Veri güncellenemedi.";
    case ProviderStatus.STALE:
      return "Sağlayıcıya ulaşılamadı — son bilinen veri gösteriliyor.";
    case ProviderStatus.MOCK:
      return "Geliştirme verisi — gerçek piyasa değeri değildir.";
    default:
      return "";
  }
}

/* -------------------------------------------------------------------------- */
/*  Ortam                                                                     */
/* -------------------------------------------------------------------------- */

const isProduction = () => process.env.NODE_ENV === "production";

/**
 * Mock veri kullanılabilir mi?
 *
 * Production'da VARSAYILAN OLARAK HAYIR. Bir sahne (staging) ortamında
 * arayüzü göstermek için bilinçli olarak açmak gerekirse
 * `PARANOTU_ALLOW_MOCK_DATA=true` verilir — ama o zaman bile veri
 * `isMock: true` ile işaretlenir ve arayüzde rozet çıkar.
 */
export function mockAllowed() {
  if (process.env.PARANOTU_ALLOW_MOCK_DATA === "true") return true;
  return !isProduction();
}

/* -------------------------------------------------------------------------- */
/*  Zarf üreticileri                                                          */
/* -------------------------------------------------------------------------- */

/**
 * @typedef {object} ProviderSource
 * @property {string}  name           Görünen kaynak adı ("TCMB", "TÜİK")
 * @property {string} [url]           Kaynağın herkese açık adresi
 * @property {string} [license]       Lisans/kullanım koşulu notu
 * @property {number} [delayMinutes]  Veri gecikmesi (0 = gerçek zamanlı)
 */

/**
 * @typedef {object} ProviderResult
 * @property {string}          status        ProviderStatus değerlerinden biri
 * @property {any|null}        data          Normalize edilmiş veri
 * @property {ProviderSource}  source        Kaynak künyesi
 * @property {string|null}     fetchedAt     Bu yanıtın alındığı an (ISO)
 * @property {string|null}     lastSuccessAt Son BAŞARILI güncelleme (ISO)
 * @property {number|null}     delayMinutes  Gecikme dakikası
 * @property {boolean}         isMock        Gerçek veri değil mi?
 * @property {string|null}     message       Kullanıcıya gösterilecek not
 * @property {string|null}     errorCode     Teknik hata kodu (loglama için)
 */

const EMPTY_SOURCE = { name: "", url: null, license: null };

function envelope(status, { data = null, source, fetchedAt, lastSuccessAt, delayMinutes, message, errorCode } = {}) {
  const result = {
    status,
    data,
    source: { ...EMPTY_SOURCE, ...(source ?? {}) },
    fetchedAt: fetchedAt ?? null,
    lastSuccessAt: lastSuccessAt ?? null,
    delayMinutes: delayMinutes ?? source?.delayMinutes ?? null,
    isMock: status === ProviderStatus.MOCK,
    message: message ?? null,
    errorCode: errorCode ?? null,
  };
  result.message = result.message ?? statusMessage(result) ?? null;
  return result;
}

export const ok = (data, meta = {}) =>
  envelope(ProviderStatus.OK, { ...meta, data, fetchedAt: meta.fetchedAt ?? new Date().toISOString(), lastSuccessAt: meta.lastSuccessAt ?? new Date().toISOString() });

export const unconfigured = (meta = {}) => envelope(ProviderStatus.UNCONFIGURED, meta);

export const failed = (errorCode, meta = {}) => envelope(ProviderStatus.ERROR, { ...meta, errorCode });

export const stale = (data, meta = {}) => envelope(ProviderStatus.STALE, { ...meta, data });

export const mock = (data, meta = {}) =>
  envelope(ProviderStatus.MOCK, { ...meta, data, fetchedAt: new Date().toISOString() });

/* -------------------------------------------------------------------------- */
/*  Ağ katmanı                                                                */
/* -------------------------------------------------------------------------- */

/** Sağlayıcı çağrısı başarısız olduğunda fırlatılır. */
export class ProviderError extends Error {
  constructor(code, message, { status = 0, provider = "" } = {}) {
    super(message);
    this.name = "ProviderError";
    this.code = code;
    this.status = status;
    this.provider = provider;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Zaman aşımı + yeniden deneme + Next cache ile JSON çeker.
 *
 * Yeniden deneme SADECE geçici hatalarda yapılır (ağ hatası, 429, 5xx).
 * 4xx kalıcı bir yapılandırma hatasıdır (yanlış anahtar, yanlış sembol) —
 * tekrar denemek kotayı boşa harcar, o yüzden anında bırakılır.
 *
 * @param {string} url
 * @param {object} options
 * @param {object} [options.headers]
 * @param {number} [options.timeout]     ms (varsayılan 6000)
 * @param {number} [options.retries]     geçici hatada deneme sayısı (varsayılan 2)
 * @param {number} [options.revalidate]  Next ISR süresi (saniye)
 * @param {string[]} [options.tags]      revalidateTag() etiketleri
 * @param {string} [options.provider]    hata mesajında görünecek ad
 */
export async function fetchJson(url, options = {}) {
  const {
    headers = {},
    timeout = 6000,
    retries = 2,
    revalidate = 60,
    tags,
    provider = "provider",
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json", ...headers },
        signal: controller.signal,
        next: { revalidate, ...(tags ? { tags } : {}) },
      });

      /* Kalıcı istemci hatası — tekrar denemenin faydası yok. */
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        throw new ProviderError(
          res.status === 401 || res.status === 403 ? "AUTH" : "BAD_REQUEST",
          `${provider}: ${res.status} ${res.statusText}`,
          { status: res.status, provider },
        );
      }

      if (!res.ok) {
        throw new ProviderError("UPSTREAM", `${provider}: ${res.status}`, {
          status: res.status,
          provider,
        });
      }

      return await res.json();
    } catch (error) {
      lastError = error;

      /* Kalıcı hatalarda döngüyü kır. */
      if (error instanceof ProviderError && (error.code === "AUTH" || error.code === "BAD_REQUEST")) {
        throw error;
      }

      if (attempt < retries) {
        /* Üstel geri çekilme: 250ms, 500ms — sağlayıcıyı boğmadan tekrar dene. */
        await sleep(250 * 2 ** attempt);
      }
    } finally {
      clearTimeout(timer);
    }
  }

  if (lastError?.name === "AbortError") {
    throw new ProviderError("TIMEOUT", `${provider}: ${timeout}ms zaman aşımı`, { provider });
  }
  throw lastError ?? new ProviderError("UNKNOWN", `${provider}: bilinmeyen hata`, { provider });
}

/**
 * Bir provider fonksiyonunu sarar: fırlatılan her hatayı `failed()` zarfına
 * çevirir. Böylece tek bir sağlayıcı çökse bile sayfa render'ı devam eder.
 *
 * @param {() => Promise<ProviderResult>} fn
 * @param {ProviderSource} source
 */
export async function guard(fn, source) {
  try {
    return await fn();
  } catch (error) {
    const code = error instanceof ProviderError ? error.code : "UNKNOWN";
    /* Sunucu logunda görünsün; kullanıcıya teknik detay sızdırmıyoruz. */
    console.error(`[provider:${source?.name ?? "?"}] ${code}: ${error.message}`);
    return failed(code, { source });
  }
}
