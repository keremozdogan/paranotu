/**
 * ============================================================================
 *  ECONOMIC CALENDAR PROVIDER — ekonomik takvim
 * ============================================================================
 *  Yaklaşan veri açıklamaları ve karar toplantıları.
 *
 *  Bu provider'ın diğerlerinden farkı: TAKVİM VERİSİ TAHMİN DEĞİLDİR.
 *  "TÜİK 3 Ağustos'ta TÜFE açıklayacak" bilgisi resmî yayın takviminden
 *  gelen bir OLGUDUR — piyasa fiyatı gibi lisanslı ve anlık bir veri değil.
 *
 *  Bu yüzden burada editoryal olarak elle bakımı yapılan bir takvim
 *  (`content/data/calendar.js`) birincil kaynaktır; dış sağlayıcı isteğe
 *  bağlı bir zenginleştirmedir.
 *
 *  ⚠️ Takvimdeki her kayıt `confirmed` alanı taşır:
 *     true  → resmî yayın takviminden doğrulandı
 *     false → beklenen tarih, kaymaya açık (arayüz "tahmini" yazar)
 *  Doğrulanmamış bir tarihi kesinmiş gibi göstermek, sitenin en çok
 *  güven kaybedeceği yerdir.
 * ============================================================================
 */

import "server-only";
import { cache } from "react";

import { fetchJson, guard, ok } from "./base";
import calendarEvents, { calendarSource } from "~/content/data/calendar";

const PROVIDER_ID = process.env.CALENDAR_PROVIDER || "";
const API_KEY = process.env.CALENDAR_API_KEY || "";
const API_BASE = process.env.CALENDAR_API_BASE_URL || "";
const REVALIDATE = Number(process.env.CALENDAR_REVALIDATE ?? "3600");

const isConfigured = () => Boolean(PROVIDER_ID && (API_KEY || API_BASE));

/**
 * @typedef {object} CalendarEvent
 * @property {string}  id
 * @property {string}  title       "Temmuz 2026 TÜFE"
 * @property {string}  institution "TÜİK" | "TCMB" | "Fed" | "ECB"
 * @property {string}  country     "TR" | "US" | "EU"
 * @property {string}  date        ISO tarih
 * @property {string|null} time    "10:00" — bilinmiyorsa null
 * @property {boolean} confirmed   Resmî takvimden doğrulandı mı?
 * @property {"high"|"medium"|"low"} impact  Piyasa etkisi beklentisi
 * @property {string|null} sourceUrl
 */

function normalizeEvent(raw) {
  if (!raw?.title || !raw?.date) return null;
  return {
    id: raw.id ?? `${raw.institution ?? "x"}-${raw.date}`,
    title: raw.title,
    institution: raw.institution ?? "",
    country: raw.country ?? "TR",
    date: new Date(raw.date).toISOString(),
    time: raw.time ?? null,
    confirmed: raw.confirmed === true,
    impact: ["high", "medium", "low"].includes(raw.impact) ? raw.impact : "medium",
    sourceUrl: raw.sourceUrl ?? null,
  };
}

/**
 * Yaklaşan olaylar — bugünden itibaren, tarihe göre artan.
 *
 * @param {object}  options
 * @param {number} [options.limit]     Kaç olay dönsün
 * @param {number} [options.daysAhead] Kaç gün ileriye baksın
 * @param {Date}   [options.now]       Test edilebilirlik için "şimdi"
 */
export const getUpcomingEvents = cache(
  async ({ limit = 8, daysAhead = 60, now = new Date() } = {}) => {
    const source = {
      name: calendarSource.name,
      url: calendarSource.url,
      license: calendarSource.license,
    };

    const horizon = new Date(now.getTime() + daysAhead * 86400000);

    const withinWindow = (event) => {
      const d = new Date(event.date);
      return d >= new Date(now.toDateString()) && d <= horizon;
    };

    /* Editoryal takvim — her zaman mevcut, birincil kaynak. */
    const editorial = calendarEvents.map(normalizeEvent).filter(Boolean).filter(withinWindow);

    if (!isConfigured()) {
      const data = editorial.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, limit);
      return ok(data, { source });
    }

    /* Dış sağlayıcı varsa editoryal kayıtlarla BİRLEŞTİR — editoryal kazanır,
       çünkü `confirmed` bilgisi elle doğrulanmıştır. */
    return guard(async () => {
      const url = `${API_BASE.replace(/\/$/, "")}/calendar?days=${daysAhead}`;
      const raw = await fetchJson(url, {
        headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {},
        revalidate: REVALIDATE,
        tags: ["economic-calendar"],
        provider: "calendar",
        timeout: 6000,
      });

      const external = (Array.isArray(raw) ? raw : (raw?.events ?? []))
        .map(normalizeEvent)
        .filter(Boolean)
        .filter(withinWindow);

      const seen = new Set(editorial.map((e) => `${e.institution}|${e.date.slice(0, 10)}`));
      const merged = [
        ...editorial,
        ...external.filter((e) => !seen.has(`${e.institution}|${e.date.slice(0, 10)}`)),
      ].sort((a, b) => new Date(a.date) - new Date(b.date));

      return ok(merged.slice(0, limit), { source });
    }, source);
  },
);
