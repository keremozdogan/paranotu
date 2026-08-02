/**
 * ============================================================================
 *  D1 OKUMA İSTEMCİSİ — Cloudflare D1 HTTP API
 * ============================================================================
 *  Site Vercel'de kaldığı için D1'e native binding YOK; Cloudflare'in REST
 *  API'si üzerinden okuyoruz.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  SALT OKUNUR — bilinçli
 *  ────────────────────────────────────────────────────────────────────────
 *  Bu katman yalnızca SELECT çalıştırır. Yazma işleri Worker'a aittir.
 *  `assertReadOnly()` bunu çalışma anında da denetler: web sunucusundan
 *  gelen bir INSERT/UPDATE/DELETE hata fırlatır. Böylece bir hata veya
 *  kötü niyetli girdi veritabanını değiştiremez.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  YAPILANDIRILMAMIŞSA NE OLUR?
 *  ────────────────────────────────────────────────────────────────────────
 *  Boş sonuç döner, hata fırlatmaz. Site bugün D1 olmadan da tam çalışıyor
 *  (MDX içerik katmanı ayakta). D1 bağlandığında feed akışı ve slot
 *  yönetimi kendiliğinden devreye girer.
 * ============================================================================
 */

import "server-only";
import { cache } from "react";

const ACCOUNT_ID = process.env.CF_ACCOUNT_ID || "";
const DATABASE_ID = process.env.CF_D1_DATABASE_ID || "";
const API_TOKEN = process.env.CF_API_TOKEN || "";

export const isD1Configured = () => Boolean(ACCOUNT_ID && DATABASE_ID && API_TOKEN);

const ENDPOINT = () =>
  `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;

/** Yazma girişimlerini engelle — bu katman asla veri değiştirmemeli. */
const WRITE_RE = /\b(insert|update|delete|drop|alter|create|replace|truncate|attach|pragma)\b/i;

function assertReadOnly(sql) {
  if (WRITE_RE.test(sql)) {
    throw new Error(
      "d1.js salt okunurdur — yazma işlemleri Worker üzerinden yapılmalı.",
    );
  }
}

/**
 * D1'de bir SELECT çalıştırır.
 *
 * @param {string}   sql     Parametreli SQL (`?` yer tutucuları)
 * @param {any[]}    params
 * @param {object}   options
 * @param {number}  [options.revalidate]  Next ISR süresi (saniye)
 * @param {string[]}[options.tags]        revalidateTag etiketleri
 * @param {number}  [options.timeout]     ms
 * @returns {Promise<{ok: boolean, rows: any[], error: string|null}>}
 */
export async function d1Query(sql, params = [], options = {}) {
  const { revalidate = 60, tags, timeout = 6000 } = options;

  if (!isD1Configured()) {
    return { ok: false, rows: [], error: "unconfigured" };
  }

  assertReadOnly(sql);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(ENDPOINT(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
      signal: controller.signal,
      next: { revalidate, ...(tags ? { tags } : {}) },
    });

    if (!res.ok) {
      console.error(`[d1] HTTP ${res.status}`);
      return { ok: false, rows: [], error: `http_${res.status}` };
    }

    const payload = await res.json();

    if (!payload?.success) {
      const message = payload?.errors?.[0]?.message ?? "bilinmeyen hata";
      console.error(`[d1] ${message}`);
      return { ok: false, rows: [], error: message };
    }

    /* D1 API sonuçları dizi içinde döner (çoklu ifade desteği için). */
    const rows = payload.result?.[0]?.results ?? [];
    return { ok: true, rows, error: null };
  } catch (error) {
    const message = error?.name === "AbortError" ? "timeout" : String(error?.message ?? error);
    console.error(`[d1] ${message}`);
    /* Veritabanı erişilemezse sayfa çökmez — boş sonuçla devam eder. */
    return { ok: false, rows: [], error: message };
  } finally {
    clearTimeout(timer);
  }
}

/** Tek satır döndüren sorgular için kısayol. */
export async function d1First(sql, params = [], options = {}) {
  const { rows } = await d1Query(sql, params, options);
  return rows[0] ?? null;
}

/** JSON sütunlarını güvenle çözer — bozuk JSON sayfayı çökertmesin. */
export function parseJsonColumn(value, fallback = []) {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

/** SQLite'ın 0/1 tamsayısını boolean'a çevirir. */
export const toBool = (value) => value === 1 || value === true;

/**
 * Sağlık kontrolü — admin/teşhis için.
 * `cache()` ile tek istek içinde bir kez çalışır.
 */
export const d1Health = cache(async () => {
  if (!isD1Configured()) {
    return { configured: false, reachable: false, message: "D1 yapılandırılmadı." };
  }
  const { ok, error } = await d1Query("SELECT 1 AS ok", [], { revalidate: 30 });
  return {
    configured: true,
    reachable: ok,
    message: ok ? "Bağlantı sağlıklı." : `Bağlantı hatası: ${error}`,
  };
});
