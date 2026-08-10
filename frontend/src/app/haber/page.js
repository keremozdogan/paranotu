/**
 * HABER GİRİŞ SAYFASI — /haber
 * Tüm bölümlerin son haberleri, önem sırasına göre.
 */

import Link from "next/link";

import { getRankedNews, getSectionsWithCounts } from "@/lib/news";
import { buildMetadata, JsonLd, breadcrumbJsonLd } from "@/lib/seo";
import NewsCard from "@/components/news/NewsCard";
import EmptyState from "@/components/news/EmptyState";
import DailyDigest from "@/components/ai/DailyDigest";

export const metadata = buildMetadata({
  title: "Ekonomi Haberleri",
  description:
    "Türkiye ve dünya ekonomisinden kritik gelişmeler, piyasa haberleri ve resmî açıklamalar — sade ve anlaşılır biçimde.",
  path: "/haber",
  keywords: ["ekonomi haberleri", "son dakika ekonomi", "piyasa haberleri"],
});

/* Haberler zaman duyarlı — sayfa saatlik tazelenir. */
export const revalidate = 900;

export default function NewsIndexPage() {
  const items = getRankedNews(24);
  const sections = getSectionsWithCounts().filter((s) => s.count > 0);
  const [lead, ...rest] = items;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", path: "/" },
          { name: "Haberler", path: "/haber" },
        ])}
      />

      <header className="border-b border-line pb-6">
        <h1 className="headline text-3xl text-ink sm:text-4xl">Ekonomi Haberleri</h1>
        <p className="standfirst mt-3 max-w-2xl">
          Türkiye ve dünya ekonomisinden kritik gelişmeler, karmaşık terimlere boğmadan.
        </p>
      </header>

      {sections.length > 0 ? (
        <nav aria-label="Haber bölümleri" className="mt-5">
          <ul className="scroll-strip flex gap-2">
            {sections.map((s) => (
              <li key={s.slug} className="shrink-0">
                <Link
                  href={`/haber/${s.slug}`}
                  className="inline-flex min-h-9 items-center rounded-brand border border-line px-3 text-sm text-muted transition-colors hover:border-accent-300 hover:text-ink"
                >
                  {s.shortName ?? s.name}
                  <span className="ml-1.5 text-xs text-muted/70">{s.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Haber akışı henüz başlamadı"
            description="ParaNotu'nun haber bölümü yayına hazırlanıyor. Şu an sitede güncel enflasyon verileri, para rehberleri ve hesaplama araçları mevcut."
          />
        </div>
      ) : (
        <>
          {/* Günün özeti — sayfa `revalidate = 900` ile ISR'li olduğu için
              model çağrısı 15 dakikada bir yapılır, her ziyaretçide değil. */}
          <div className="mt-6">
            <DailyDigest items={items.slice(0, 12)} />
          </div>

          <div className="mt-8">
            <NewsCard item={lead} size="lead" priority />
          </div>
          {rest.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((item) => (
                <NewsCard key={item.slug} item={item} />
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
