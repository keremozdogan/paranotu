/**
 * YAKLAŞAN EKONOMİK TAKVİM — ana sayfa modülü.
 *
 * Doğrulanmamış tarihler "tahmini" olarak işaretlenir; kesinmiş gibi
 * gösterilmez (bkz. content/data/calendar.js).
 */

import Link from "next/link";

import { getUpcomingEvents, hasData } from "@/lib/providers";
import { formatDate } from "@/lib/format";

export default async function UpcomingEvents({ limit = 5 }) {
  const result = await getUpcomingEvents({ limit, daysAhead: 90 });
  if (!hasData(result) || result.data.length === 0) return null;

  return (
    <section aria-labelledby="takvim-ozet" className="reveal">
      <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-line pb-2">
        <h2 id="takvim-ozet" className="text-xl font-bold tracking-tight text-ink">
          Yaklaşan ekonomik takvim
        </h2>
        <Link href="/takvim" className="inline-flex min-h-6 shrink-0 items-center text-sm font-medium text-link hover:underline">
          Tümü<span aria-hidden="true"> →</span>
        </Link>
      </div>

      <ol className="divide-y divide-line overflow-hidden rounded-brand border border-line bg-canvas">
        {result.data.map((event) => (
          <li key={event.id} className="flex items-center gap-4 px-4 py-3">
            <time
              dateTime={event.date}
              className="numeric w-24 shrink-0 text-sm font-semibold text-ink"
            >
              {formatDate(event.date, { day: "numeric", month: "short", year: undefined })}
            </time>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-ink">{event.title}</span>
              <span className="block text-xs text-muted">
                {event.institution}
                {event.time ? ` · ${event.time}` : ""}
                {!event.confirmed ? " · tahmini" : ""}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
