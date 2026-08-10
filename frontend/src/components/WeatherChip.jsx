/**
 * ============================================================================
 *  HAVA DURUMU ROZETİ — minimal, göz yormayan
 * ============================================================================
 *  Piyasa bandının yanında duran küçük bir bilgi. Bilinçli olarak sessiz:
 *  tek satır, tek renk, animasyon yok. Ekonomi verisinin dikkatini çalmamalı.
 *
 *  Veri gelmezse bileşen `null` döner — "veri yok" yazan bir kutu, hiç kutu
 *  olmamasından kötüdür.
 * ============================================================================
 */

import { getWeather } from "@/lib/providers/weather";

/* İkonlar 16×16 kutuda, tek renk (currentColor) — banttaki metinle aynı
   ağırlıkta dursunlar diye ince çizgi. */
const IKONLAR = {
  gunes: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6.2 6.2l1.4 1.4M16.4 16.4l1.4 1.4M17.8 6.2l-1.4 1.4M7.6 16.4l-1.4 1.4" strokeLinecap="round" />
    </>
  ),
  parcali: (
    <>
      <circle cx="9" cy="9" r="3.2" />
      <path d="M9 2.8v1.6M2.8 9h1.6M4.9 4.9l1.1 1.1M13.1 4.9l-1.1 1.1" strokeLinecap="round" />
      <path d="M8.5 18.5h8.8a3 3 0 0 0 .2-6 4.4 4.4 0 0 0-8.4-.6 3.3 3.3 0 0 0-.6 6.6Z" />
    </>
  ),
  bulut: <path d="M7.5 18.5h9.8a3.2 3.2 0 0 0 .2-6.4 4.7 4.7 0 0 0-9-.6 3.5 3.5 0 0 0-1 7Z" />,
  sis: (
    <>
      <path d="M7.5 14.5h9.8a3.2 3.2 0 0 0 .2-6.4 4.7 4.7 0 0 0-9-.6 3.5 3.5 0 0 0-1 7Z" />
      <path d="M5 18h14M7 21h10" strokeLinecap="round" />
    </>
  ),
  yagmur: (
    <>
      <path d="M7.5 14.5h9.8a3.2 3.2 0 0 0 .2-6.4 4.7 4.7 0 0 0-9-.6 3.5 3.5 0 0 0-1 7Z" />
      <path d="M9 18l-1 3M13 18l-1 3M17 18l-1 3" strokeLinecap="round" />
    </>
  ),
  kar: (
    <>
      <path d="M7.5 14.5h9.8a3.2 3.2 0 0 0 .2-6.4 4.7 4.7 0 0 0-9-.6 3.5 3.5 0 0 0-1 7Z" />
      <path d="M9 19h.01M13 19h.01M11 22h.01M15 22h.01" strokeLinecap="round" strokeWidth="2.4" />
    </>
  ),
  firtina: (
    <>
      <path d="M7.5 14.5h9.8a3.2 3.2 0 0 0 .2-6.4 4.7 4.7 0 0 0-9-.6 3.5 3.5 0 0 0-1 7Z" />
      <path d="M13 17l-3 4h3l-1 3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

export default async function WeatherChip({ className = "" }) {
  const hava = await getWeather();
  if (!hava.ok) return null;

  const ikon = IKONLAR[hava.icon] ?? IKONLAR.bulut;

  return (
    <div
      className={`inline-flex shrink-0 items-center gap-1.5 text-xs text-muted ${className}`}
      /* Ekran okuyucu tek cümle duysun; parçalı okunması kafa karıştırır. */
      aria-label={`${hava.city} hava durumu: ${hava.temp} derece, ${hava.label}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
        className="shrink-0 opacity-80"
      >
        {ikon}
      </svg>
      <span aria-hidden="true" className="numeric font-semibold text-ink">
        {hava.temp}°
      </span>
      <span aria-hidden="true" className="hidden sm:inline">
        {hava.city}
      </span>
    </div>
  );
}
