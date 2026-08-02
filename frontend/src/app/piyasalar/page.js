/**
 * PİYASALAR — /piyasalar
 * Tüm piyasa gruplarının tek sayfada özeti.
 *
 * ⚠️ LİSANS: Bu sayfa veriyi `MarketDataProvider` üzerinden alır. Sağlayıcı
 * yapılandırılmamışsa gruplar "veri sağlayıcısı yapılandırılmadı" durumunu
 * gösterir. Uydurma fiyat basılmaz.
 */

import { MARKET_GROUPS, getGroupQuotes } from "@/lib/providers";
import { buildMetadata, JsonLd, breadcrumbJsonLd } from "@/lib/seo";
import MarketTable from "@/components/market/MarketTable";
import Disclaimer from "@/components/mdx/Disclaimer";

export const metadata = buildMetadata({
  title: "Piyasalar",
  description:
    "Döviz, altın, gümüş, Borsa İstanbul, küresel endeksler, emtia ve kripto para piyasalarının güncel görünümü.",
  path: "/piyasalar",
  keywords: ["döviz kurları", "borsa", "altın fiyatları", "piyasalar", "endeksler"],
});

export const revalidate = 300;

/* Sayfada gösterilecek gruplar ve sırası. */
const GROUP_ORDER = ["doviz", "metal", "bist", "abd", "avrupa", "asya", "emtia", "kripto"];

export default async function MarketsPage() {
  /* Gruplar paralel çekilir — biri yavaşsa diğerlerini bekletmesin. */
  const results = await Promise.all(
    GROUP_ORDER.map(async (group) => ({
      group,
      label: MARKET_GROUPS[group]?.label ?? group,
      result: await getGroupQuotes(group),
    })),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", path: "/" },
          { name: "Piyasalar", path: "/piyasalar" },
        ])}
      />

      <header className="border-b border-line pb-6">
        <h1 className="headline text-3xl text-ink sm:text-4xl">Piyasalar</h1>
        <p className="standfirst mt-3 max-w-2xl">
          Döviz, değerli metal, borsa endeksleri, emtia ve kripto piyasalarının güncel görünümü.
        </p>
      </header>

      {/* Bölüm içi hızlı gezinme — uzun sayfada yararlı. */}
      <nav aria-label="Piyasa grupları" className="mt-5">
        <ul className="scroll-strip flex gap-2">
          {results.map(({ group, label }) => (
            <li key={group} className="shrink-0">
              <a
                href={`#${group}`}
                className="inline-flex min-h-9 items-center rounded-brand border border-line px-3 text-sm text-muted transition-colors hover:border-accent-300 hover:text-ink"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 space-y-10">
        {results.map(({ group, label, result }) => (
          <section key={group} id={group} aria-labelledby={`${group}-baslik`} className="scroll-mt-20">
            <h2
              id={`${group}-baslik`}
              className="mb-3 text-lg font-bold tracking-tight text-ink"
            >
              {label}
            </h2>
            <MarketTable result={result} title={label} id={group} />
          </section>
        ))}
      </div>

      <Disclaimer />
    </div>
  );
}
