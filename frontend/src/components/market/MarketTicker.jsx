/**
 * ============================================================================
 *  PİYASA BANDI — sayfanın en üstü
 * ============================================================================
 *  TASARIM KARARI: OTOMATİK KAYAN TICKER YOK.
 *
 *  Klasik "kayan bant" okunamaz: kullanıcı bir değeri okumaya başladığında
 *  kayıp gider, geri getirmek için beklemek gerekir. Hareket ayrıca
 *  vestibüler rahatsızlığı tetikleyebilir ve `prefers-reduced-motion` ile
 *  durdurulduğunda içeriğin bir kısmı hiç görünmez hale gelir.
 *
 *  Bunun yerine: SABİT, kullanıcı kontrolünde yatay kaydırılan şerit.
 *  Masaüstünde hepsi sığar; mobilde parmakla kaydırılır (snap ile).
 *  Klavye ile de kaydırılabilir (tabindex + rol).
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  VERİ YOKSA NE OLUR?
 *  Sahte sayı gösterilmez. Sağlayıcı yapılandırılmamışsa bant, ne olduğunu
 *  açıkça yazan tek satırlık şeffaf bir duruma iner.
 * ============================================================================
 */

import Link from "next/link";

import { getTickerQuotes, hasData, ProviderStatus } from "@/lib/providers";
import { formatQuoteValue, formatTime } from "@/lib/format";
import QuoteChange from "./QuoteChange";

function DataNotice({ result }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs text-chrome-muted">
      <span
        aria-hidden="true"
        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-chrome-muted/60"
      />
      <span>{result?.message ?? "Piyasa verisi kullanılamıyor."}</span>
      {result?.status === ProviderStatus.UNCONFIGURED ? (
        <span className="hidden sm:inline text-chrome-muted/70">
          — lisanslı bir veri sağlayıcısı bağlandığında burada canlı değerler görünecek.
        </span>
      ) : null}
    </div>
  );
}

export default async function MarketTicker() {
  const result = await getTickerQuotes();

  return (
    <section
      aria-label="Piyasa özeti"
      className="border-b border-chrome-line bg-chrome text-chrome-text"
    >
      <div className="mx-auto max-w-7xl">
        {!hasData(result) ? (
          <DataNotice result={result} />
        ) : (
          <div className="flex items-stretch">
            <ul
              /* Klavye kullanıcısı da kaydırabilsin diye odaklanabilir liste. */
              tabIndex={0}
              aria-label="Piyasa değerleri"
              /**
               * ⚠️ `min-w-0` ŞART — kaldırma.
               *
               * Bu <ul> bir flex öğesi ve flex öğelerinin varsayılan
               * `min-width: auto` değeri, içeriğinden daha dar olmalarını
               * ENGELLER. O yüzden `overflow-x: auto` hiç devreye girmez;
               * bant 10 enstrümanla ~1630px'e uzar ve TÜM SAYFAYI yatay
               * kaydırılabilir yapar (her sayfada, her genişlikte).
               *
               * Hata yalnızca bant DOLUYKEN görünür; veri sağlayıcısı
               * bağlanmadığı sürece tek satırlık durum mesajı olduğu için
               * fark edilmez. Yani sağlayıcı bağlandığı gün ortaya çıkar.
               */
              className="scroll-strip scroll-snap-strip flex min-w-0 flex-1 items-stretch divide-x divide-chrome-line/70"
            >
              {result.data.map((q) => (
                <li key={q.symbol} className="shrink-0">
                  <Link
                    href={`/piyasalar#${q.symbol}`}
                    className="flex h-full min-w-[9.5rem] flex-col justify-center gap-0.5 px-4 py-2 transition-colors hover:bg-white/5"
                  >
                    <span className="text-[11px] font-medium uppercase tracking-wide text-chrome-muted">
                      {q.shortName}
                    </span>
                    <span className="flex items-baseline gap-2">
                      <span className="numeric text-sm font-semibold">
                        {formatQuoteValue(q.value, { precision: q.precision, unit: q.unit })}
                      </span>
                      <QuoteChange
                        change={q.change}
                        changePercent={q.changePercent}
                        precision={q.precision}
                        className="text-xs"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Künye — gecikme ve kaynak her zaman görünür.
                "Canlı" kelimesi yalnızca gecikme 0 ise kullanılır. */}
            <div className="hidden shrink-0 flex-col justify-center gap-0.5 border-l border-chrome-line/70 px-4 py-2 text-[11px] leading-tight text-chrome-muted lg:flex">
              {result.isMock ? (
                <span className="font-semibold text-gold-300">Geliştirme verisi</span>
              ) : (
                <span>
                  {result.delayMinutes === 0
                    ? "Canlı"
                    : `${result.delayMinutes ?? "?"} dk gecikmeli`}
                </span>
              )}
              {result.source?.name && result.source.name !== "—" ? (
                <span className="max-w-[10rem] truncate">Kaynak: {result.source.name}</span>
              ) : null}
              {result.fetchedAt ? <span>Güncelleme {formatTime(result.fetchedAt)}</span> : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
