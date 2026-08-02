/**
 * Piyasa tablosu — bir grup enstrümanı listeler.
 *
 * MOBİL: tablo kart listesine dönüşür (yatay kaydırma yerine). Finansal
 * tablolarda yatay kaydırma, kullanıcının sembol sütununu kaybetmesine yol
 * açar; kart düzeni dar ekranda daha okunabilir.
 *
 * Veri yoksa sahte satır çizilmez — durum mesajı gösterilir.
 */

import { hasData } from "@/lib/providers";
import { formatQuoteValue } from "@/lib/format";
import QuoteChange from "./QuoteChange";

export default function MarketTable({ result, title, id }) {
  if (!hasData(result)) {
    return (
      <div className="rounded-brand border border-dashed border-line bg-subtle/60 px-4 py-8 text-center">
        <p className="text-sm text-muted">{result?.message ?? "Veri kullanılamıyor."}</p>
      </div>
    );
  }

  return (
    <div>
      {result.isMock ? (
        <p className="mb-2 inline-flex items-center gap-1.5 rounded-brand bg-gold-50 px-2 py-1 text-xs font-medium text-gold-800">
          <span aria-hidden="true">⚠</span>
          Geliştirme verisi — gerçek piyasa değeri değildir.
        </p>
      ) : null}

      {/* ------------------------------------------------ MOBİL: kart listesi */}
      <ul className="space-y-2 sm:hidden">
        {result.data.map((q) => (
          <li
            key={q.symbol}
            id={q.symbol}
            className="flex items-center justify-between gap-3 rounded-brand border border-line bg-canvas px-3 py-2.5"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-ink">{q.shortName}</span>
              <span className="block truncate text-xs text-muted">{q.name}</span>
            </span>
            <span className="shrink-0 text-right">
              <span className="numeric block text-sm font-semibold text-ink">
                {formatQuoteValue(q.value, { precision: q.precision, unit: q.unit })}
              </span>
              <QuoteChange
                change={q.change}
                changePercent={q.changePercent}
                precision={q.precision}
                className="text-xs"
              />
            </span>
          </li>
        ))}
      </ul>

      {/* --------------------------------------------- MASAÜSTÜ: gerçek tablo */}
      <div className="hidden overflow-hidden rounded-brand border border-line sm:block">
        <table className="w-full text-sm">
          <caption className="sr-only">{title ?? "Piyasa değerleri"}</caption>
          <thead>
            <tr className="border-b border-line bg-subtle text-left text-xs uppercase tracking-wide text-muted">
              <th scope="col" className="px-4 py-2.5 font-semibold">Enstrüman</th>
              <th scope="col" className="px-4 py-2.5 text-right font-semibold">Son</th>
              <th scope="col" className="px-4 py-2.5 text-right font-semibold">Değişim</th>
              <th scope="col" className="px-4 py-2.5 text-right font-semibold">Önceki Kapanış</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((q) => (
              <tr key={q.symbol} id={q.symbol} className="border-b border-line last:border-b-0">
                <th scope="row" className="px-4 py-2.5 text-left font-medium text-ink">
                  {q.name}
                </th>
                <td className="numeric px-4 py-2.5 text-right font-semibold text-ink">
                  {formatQuoteValue(q.value, { precision: q.precision, unit: q.unit })}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <QuoteChange
                    change={q.change}
                    changePercent={q.changePercent}
                    precision={q.precision}
                    variant="both"
                  />
                </td>
                <td className="numeric px-4 py-2.5 text-right text-muted">
                  {formatQuoteValue(q.previousClose, { precision: q.precision, unit: q.unit })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Künye — kaynak ve gecikme her tabloda görünür. */}
      <p className="mt-2 text-xs text-muted">
        {result.source?.name && result.source.name !== "—" ? (
          <>Kaynak: {result.source.name} · </>
        ) : null}
        {result.delayMinutes === 0
          ? "Gerçek zamanlı"
          : result.delayMinutes
            ? `${result.delayMinutes} dakika gecikmeli`
            : "Gecikme bilgisi yok"}
      </p>
    </div>
  );
}
