/**
 * ============================================================================
 *  API SERVİS KATMANI — .NET Back-End Köprüsü
 * ============================================================================
 *  Tüm .NET çağrıları buradan geçer. Bileşenler `fetch` çağırmaz; bu
 *  dosyadaki adlandırılmış fonksiyonları kullanır.
 *
 *  Neden tek katman?
 *   - Base URL, header ve hata biçimi tek yerde durur.
 *   - Backend endpoint'i değişirse UI'a dokunmadan burada düzeltirsin.
 *   - Backend henüz ayakta değilken UI çökmesin diye her fonksiyon
 *     güvenli bir "fallback" döner (bkz. `safe()`).
 *
 *  Karşılık gelen .NET tarafı: backend/Website1.Api/Endpoints/
 * ============================================================================
 */

import siteConfig from "~/site.config";

const BASE_URL = siteConfig.api.baseUrl.replace(/\/$/, "");
const DEFAULT_REVALIDATE = siteConfig.api.revalidate;

/** Backend yanıt vermediğinde/hatalıyken fırlatılan tip. */
export class ApiError extends Error {
  constructor(message, { status = 0, endpoint = "", body = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.endpoint = endpoint;
    this.body = body;
  }
}

/**
 * Düşük seviyeli istemci. Doğrudan kullanma — aşağıdaki servisleri kullan.
 *
 * @param {string} endpoint  "/api/rates" gibi kök-göreli yol
 * @param {object} options
 * @param {"GET"|"POST"|"PUT"|"DELETE"} [options.method]
 * @param {object} [options.body]         JSON gövdesi (otomatik serialize)
 * @param {object} [options.query]        Query string objesi
 * @param {object} [options.headers]
 * @param {number|false} [options.revalidate]  ISR süresi (saniye) | false = her istekte taze
 * @param {string[]} [options.tags]       revalidateTag() için cache etiketleri
 * @param {number} [options.timeout]      ms — backend takılırsa sayfayı kilitlemesin
 */
async function request(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    query,
    headers = {},
    revalidate = DEFAULT_REVALIDATE,
    tags,
    timeout = 8000,
  } = options;

  const qs = query
    ? "?" +
      new URLSearchParams(
        Object.entries(query).filter(([, v]) => v !== undefined && v !== null),
      ).toString()
    : "";

  const url = `${BASE_URL}${endpoint}${qs}`;

  /* Backend yavaşsa sayfa render'ını süresiz bekletme. */
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  /* Next cache stratejisi: revalidate=false → her zaman taze (no-store). */
  const nextOptions =
    revalidate === false
      ? { cache: "no-store" }
      : { next: { revalidate, ...(tags ? { tags } : {}) } };

  try {
    const res = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
      ...nextOptions,
    });

    if (!res.ok) {
      /* .NET ProblemDetails gövdesini okumaya çalış — hata mesajı işe yarasın. */
      let detail = null;
      try {
        detail = await res.json();
      } catch {
        /* gövde JSON değilse yut */
      }
      throw new ApiError(
        detail?.detail || detail?.title || `İstek başarısız (${res.status})`,
        { status: res.status, endpoint, body: detail },
      );
    }

    if (res.status === 204) return null;
    return await res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === "AbortError") {
      throw new ApiError(`Zaman aşımı: ${endpoint}`, { endpoint, status: 408 });
    }
    throw new ApiError(`Backend'e ulaşılamadı: ${err.message}`, { endpoint });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Hata durumunda sayfayı çökertmek yerine `fallback` döner.
 * Backend henüz yazılmamışken UI'ın ayakta kalmasını sağlar.
 */
async function safe(promiseFn, fallback) {
  try {
    return await promiseFn();
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[api] ${err.message}`);
    }
    return fallback;
  }
}

/* ==========================================================================
   1) CANLI DÖVİZ / ALTIN KURLARI          → GET /api/rates
   ========================================================================== */

/**
 * TCMB günlük döviz kuru bülteni.
 * TCMB günde bir kez (~15:30) yayımladığı için sık tazelemenin anlamı yok;
 * backend zaten 30 dakika önbelleğe alıyor.
 *
 * @returns {Promise<{updatedAt: string, source: string, sourceUrl: string,
 *                    items: Array<{code, name, buy, sell, changePercent}>}|null>}
 */
export function getLiveRates() {
  return safe(
    () =>
      request("/api/rates", {
        revalidate: 900, // 15 dk
        tags: ["rates"],
      }),
    null, // backend kapalıysa widget kendini gizler
  );
}

/* ==========================================================================
   2) BÜLTEN ABONELİĞİ                     → POST /api/newsletter/subscribe
   ========================================================================== */

/**
 * @param {{email: string, source?: string}} payload
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function subscribeToNewsletter({ email, source = "web" }) {
  try {
    const data = await request("/api/newsletter/subscribe", {
      method: "POST",
      body: { email, source },
      revalidate: false,
    });
    return {
      success: true,
      message: data?.message || "Aboneliğin oluşturuldu. Hoş geldin!",
    };
  } catch (err) {
    return {
      success: false,
      message:
        err.status === 409
          ? "Bu e-posta zaten kayıtlı."
          : err.status === 400
            ? "Geçerli bir e-posta adresi gir."
            : "Şu an kaydedemedik, birazdan tekrar dene.",
    };
  }
}

/* ==========================================================================
   3) YORUMLAR                             → GET/POST /api/comments
   ========================================================================== */

/** @param {string} slug */
export function getComments(slug) {
  return safe(
    () =>
      request("/api/comments", {
        query: { slug },
        revalidate: 30,
        tags: [`comments:${slug}`],
      }),
    [],
  );
}

/** @param {{slug: string, author: string, email?: string, content: string}} payload */
export async function postComment(payload) {
  try {
    const data = await request("/api/comments", {
      method: "POST",
      body: payload,
      revalidate: false,
    });
    return { success: true, comment: data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/* ==========================================================================
   4) İLETİŞİM FORMU                       → POST /api/contact
   ========================================================================== */

export async function sendContactMessage({ name, email, subject, message }) {
  try {
    await request("/api/contact", {
      method: "POST",
      body: { name, email, subject, message },
      revalidate: false,
    });
    return { success: true, message: "Mesajın iletildi. Teşekkürler!" };
  } catch {
    return { success: false, message: "Mesaj gönderilemedi, tekrar dener misin?" };
  }
}

/* ==========================================================================
   5) YAZI GÖRÜNTÜLENME SAYACI             → POST /api/posts/{slug}/view
   ========================================================================== */

export function trackPostView(slug) {
  return safe(
    () =>
      request(`/api/posts/${encodeURIComponent(slug)}/view`, {
        method: "POST",
        revalidate: false,
      }),
    null,
  );
}

export function getPostStats(slug) {
  return safe(
    () =>
      request(`/api/posts/${encodeURIComponent(slug)}/stats`, {
        revalidate: 120,
      }),
    { views: 0 },
  );
}

/* ==========================================================================
   6) SAĞLIK KONTROLÜ                      → GET /health
   ========================================================================== */

export async function checkApiHealth() {
  try {
    await request("/health", { revalidate: false, timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

export { request as rawRequest, BASE_URL as apiBaseUrl };
