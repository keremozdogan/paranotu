/**
 * ============================================================================
 *  PROVIDER KATMANI — tek giriş noktası
 * ============================================================================
 *  Bileşenler dış veriye SADECE buradan erişir:
 *
 *      import { getTickerQuotes, hasData } from "@/lib/providers";
 *
 *  Doğrudan `fetch` çağırma, doğrudan alt modül import etme. Sağlayıcı
 *  değiştiğinde tek dokunulacak yer bu klasör olsun.
 * ============================================================================
 */

export {
  ProviderStatus,
  ProviderError,
  hasData,
  statusMessage,
  mockAllowed,
} from "./base";

export {
  INSTRUMENTS,
  MARKET_GROUPS,
  getInstrument,
  instrumentsByGroup,
  tickerInstruments,
} from "./instruments";

export { getQuotes, getTickerQuotes, getGroupQuotes, normalizeQuote } from "./market";
export { getExternalNews, dedupe } from "./news";
export { getUpcomingEvents } from "./calendar";
export { getOfficialAnnouncements } from "./official";
