/**
 * TCMB döviz kuru widget'ı — .NET API'den beslenir (GET /api/rates).
 *
 * VERİNİN DOĞASI (arayüzde dürüst göstermek önemli):
 *  • TCMB kurları her iş günü ~15:30'da yayımlar. Bu ANLIK bir kur değildir.
 *  • Hafta sonu ve resmî tatillerde yeni bülten yoktur.
 *  • Bu yüzden "canlı" demiyoruz; bültenin tarihini ve kaynağı gösteriyoruz.
 *
 * NİŞE ÖZEL BİLEŞEN. Teknoloji/gezi bloguna geçerken
 * site.config.js → features.liveRates = false yeter.
 *
 * Backend kapalıysa `getLiveRates()` null döner ve widget kendini gizler.
 */

import siteConfig from "~/site.config";
import { getLiveRates } from "@/services/api";
import { formatCurrency, formatPercent } from "@/lib/format";

export default async function LiveRates({ className = "" }) {
  if (!siteConfig.features.liveRates) return null;

  const data = await getLiveRates();
  if (!data?.items?.length) return null;

  const bulletinDate = data.updatedAt
    ? new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(data.updatedAt))
    : null;

  return (
    <section
      aria-label="TCMB döviz kurları"
      className={`rounded-brand border border-line bg-canvas p-5 ${className}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
          Döviz Kurları
        </h2>
        <span className="rounded-full bg-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
          {data.source || "TCMB"}
        </span>
      </div>

      {bulletinDate ? (
        <p className="mt-1 text-[11px] text-muted">
          <time dateTime={data.updatedAt}>{bulletinDate}</time> tarihli bülten
        </p>
      ) : null}

      <ul className="mt-3 divide-y divide-line">
        {data.items.map((item) => {
          const change = Number(item.changePercent);
          const isFlat = !change;
          return (
            <li key={item.code} className="flex items-center justify-between py-2.5">
              <div className="min-w-0">
                <span className="block text-sm font-semibold text-ink">{item.code}</span>
                <span className="block truncate text-xs text-muted">{item.name}</span>
              </div>
              <div className="shrink-0 text-right">
                <span className="block font-mono text-sm font-semibold text-ink">
                  {formatCurrency(item.sell)}
                </span>
                <span
                  className={`block font-mono text-xs ${
                    isFlat
                      ? "text-muted"
                      : change > 0
                        ? "text-primary-600"
                        : "text-red-600"
                  }`}
                >
                  {formatPercent(change)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 border-t border-line pt-3 text-[11px] leading-relaxed text-muted">
        Efektif satış kuru, bir önceki yayın gününe göre değişim.{" "}
        {data.sourceUrl ? (
          <a
            href={data.sourceUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-primary-600 underline underline-offset-2 hover:text-primary-700"
          >
            Kaynak: TCMB
          </a>
        ) : (
          <span>Kaynak: TCMB</span>
        )}
        . Bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.
      </p>
    </section>
  );
}
