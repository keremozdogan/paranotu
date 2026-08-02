/**
 * EKONOMİK TAKVİM — /takvim
 *
 * ⚠️ Her kayıt `confirmed` bayrağı taşır. Doğrulanmamış tarihler açıkça
 * "tahmini" olarak işaretlenir — kesinmiş gibi gösterilmez.
 */

import Link from "next/link";

import { getUpcomingEvents, hasData } from "@/lib/providers";
import { buildMetadata, JsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/format";

export const metadata = buildMetadata({
  title: "Ekonomik Takvim",
  description:
    "TÜİK veri açıklamaları, TCMB faiz kararları ve küresel merkez bankası toplantıları — yaklaşan ekonomik olaylar takvimi.",
  path: "/takvim",
  keywords: ["ekonomik takvim", "TÜİK veri takvimi", "faiz kararı tarihi", "enflasyon açıklama"],
});

export const revalidate = 3600;

const IMPACT_LABEL = { high: "Yüksek etki", medium: "Orta etki", low: "Düşük etki" };

export default async function CalendarPage() {
  const result = await getUpcomingEvents({ limit: 40, daysAhead: 180 });
  const events = hasData(result) ? result.data : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", path: "/" },
          { name: "Ekonomik Takvim", path: "/takvim" },
        ])}
      />

      <header className="border-b border-line pb-6">
        <h1 className="headline text-3xl text-ink sm:text-4xl">Ekonomik Takvim</h1>
        <p className="standfirst mt-3">
          Yaklaşan veri açıklamaları ve karar toplantıları. Bu tarihler bütçeni, kredini ve
          birikimini doğrudan etkileyen rakamların ne zaman açıklanacağını gösterir.
        </p>
      </header>

      {events.length === 0 ? (
        <div className="mt-8 rounded-brand border border-dashed border-line bg-subtle/60 px-6 py-10 text-center">
          <p className="text-sm text-muted">
            {result?.message ?? "Yaklaşan olay bulunamadı."}
          </p>
        </div>
      ) : (
        <ol className="mt-8 space-y-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex flex-col gap-2 rounded-brand border border-line bg-canvas p-4 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="shrink-0 sm:w-36">
                <time
                  dateTime={event.date}
                  className="block text-sm font-semibold text-ink"
                >
                  {formatDate(event.date)}
                </time>
                <span className="numeric block text-xs text-muted">
                  {event.time ? `${event.time}` : "saat belirsiz"}
                  {!event.confirmed ? " · tahmini" : ""}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-ink">{event.title}</h2>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                  <span className="font-medium text-accent-700">{event.institution}</span>
                  <span aria-hidden="true">·</span>
                  <span>{IMPACT_LABEL[event.impact]}</span>
                  {!event.confirmed ? (
                    <>
                      <span aria-hidden="true">·</span>
                      {/* Doğrulanmamış tarih — okuru yanıltmamak için açıkça yazılır. */}
                      <span className="inline-flex items-center gap-1 rounded-brand bg-gold-50 px-1.5 py-0.5 font-medium text-gold-800">
                        <span aria-hidden="true">⚠</span> Tarih teyit edilmedi
                      </span>
                    </>
                  ) : null}
                </p>
              </div>

              {event.sourceUrl ? (
                <a
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs text-link underline underline-offset-2"
                >
                  Kaynak
                </a>
              ) : null}
            </li>
          ))}
        </ol>
      )}

      <section className="mt-10 rounded-brand border border-line bg-subtle p-4">
        <h2 className="text-sm font-bold text-ink">Tarihler neden kayabiliyor?</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          TÜİK, TÜFE verilerini kural olarak her ayın 3&apos;ünde saat 10:00&apos;da açıklıyor;
          3&apos;ü hafta sonu veya resmî tatile denk gelirse ilk iş gününe kayıyor. Ancak takvim
          iş gününde bile kayabiliyor — örneğin Mayıs 2026 verisi, Kurban Bayramı tatili veri
          toplama süresini kısalttığı için 3 Haziran yerine 5 Haziran&apos;da açıklandı.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Bu yüzden teyit edilmemiş tarihleri &quot;tahmini&quot; olarak işaretliyoruz. Açıklanan
          rakamları{" "}
          <Link href="/enflasyon" className="text-link underline underline-offset-2">
            enflasyon sayfasında
          </Link>{" "}
          takip edebilirsin.
        </p>
      </section>
    </div>
  );
}
