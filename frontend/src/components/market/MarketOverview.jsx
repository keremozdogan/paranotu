/**
 * PİYASALARDA SON DURUM — ana sayfa modülü.
 *
 * Sekme yerine tek bakışta okunan gruplar kullanıldı: sekme, kullanıcıyı
 * gizli içeriği keşfetmeye zorlar ve mobilde ek dokunuş ister. Üç ana grup
 * (döviz, değerli metal, endeks) doğrudan yan yana verilir; gerisi
 * /piyasalar sayfasında.
 *
 * Veri sağlayıcısı yoksa modül dürüst bir durum kutusuna iner — ana sayfada
 * sahte fiyat gösterilmez.
 */

import Link from "next/link";

import { getGroupQuotes, hasData, ProviderStatus } from "@/lib/providers";
import { formatQuoteValue } from "@/lib/format";
import QuoteChange from "./QuoteChange";
import Reveal from "@/components/Reveal";

const GROUPS = [
  { slug: "doviz", label: "Döviz" },
  { slug: "metal", label: "Altın ve Gümüş" },
  { slug: "bist", label: "Borsa İstanbul" },
];

function QuoteRow({ quote }) {
  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <span className="min-w-0 truncate text-sm text-ink">{quote.shortName}</span>
      <span className="flex shrink-0 items-baseline gap-2">
        <span className="numeric text-sm font-semibold text-ink">
          {formatQuoteValue(quote.value, { precision: quote.precision, unit: quote.unit })}
        </span>
        <QuoteChange
          change={quote.change}
          changePercent={quote.changePercent}
          precision={quote.precision}
          className="text-xs"
        />
      </span>
    </li>
  );
}

export default async function MarketOverview() {
  const results = await Promise.all(
    GROUPS.map(async (g) => ({ ...g, result: await getGroupQuotes(g.slug) })),
  );

  const anyData = results.some((r) => hasData(r.result));
  const firstResult = results[0]?.result;

  return (
    <Reveal as="section" aria-labelledby="piyasalar-ozet">
      <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-line pb-2">
        <h2 id="piyasalar-ozet" className="text-xl font-bold tracking-tight text-ink">
          Piyasalarda son durum
        </h2>
        <Link href="/piyasalar" className="inline-flex min-h-6 shrink-0 items-center text-sm font-medium text-link hover:underline">
          Tümü<span aria-hidden="true"> →</span>
        </Link>
      </div>

      {!anyData ? (
        <div className="rounded-brand border border-dashed border-line bg-subtle/60 px-5 py-8">
          <p className="text-sm font-medium text-ink">
            {firstResult?.message ?? "Piyasa verisi kullanılamıyor."}
          </p>
          {firstResult?.status === ProviderStatus.UNCONFIGURED ? (
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
              Piyasa verisi lisanslı bir sağlayıcı gerektirir. Sağlayıcı bağlandığında döviz,
              altın ve endeks değerleri burada kaynağı ve gecikmesiyle birlikte görünecek. O
              zamana kadar tahmini veya geçmiş değer göstermiyoruz.
            </p>
          ) : null}
        </div>
      ) : (
        <>
          {results.some((r) => r.result.isMock) ? (
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-brand bg-gold-50 px-2 py-1 text-xs font-medium text-gold-800">
              <span aria-hidden="true">⚠</span>
              Geliştirme verisi — gerçek piyasa değeri değildir.
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map(({ slug, label, result }) => (
              <div key={slug} className="rounded-brand border border-line bg-canvas p-4">
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted">{label}</h3>
                {hasData(result) ? (
                  <ul className="mt-2 divide-y divide-line">
                    {result.data.slice(0, 4).map((q) => (
                      <QuoteRow key={q.symbol} quote={q} />
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-muted">{result.message}</p>
                )}
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-muted">
            {firstResult?.delayMinutes === 0
              ? "Gerçek zamanlı veri."
              : firstResult?.delayMinutes
                ? `Veriler ${firstResult.delayMinutes} dakika gecikmelidir.`
                : null}{" "}
            Yatırım tavsiyesi değildir.
          </p>
        </>
      )}
    </Reveal>
  );
}
