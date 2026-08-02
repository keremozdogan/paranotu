/**
 * HABER BÖLÜM SAYFASI — /haber/turkiye, /haber/borsa ...
 *
 * Yalnızca `active: true` VE en az bir haberi olan bölümler için sayfa
 * üretilir (`generateStaticParams`). Boş bölüm sayfası = "thin content";
 * Google'ın cezalandırdığı ve AdSense'in reddettiği durum.
 */

import Link from "next/link";
import { notFound } from "next/navigation";

import { activeSections, getNewsBySection, getSection } from "@/lib/news";
import { buildMetadata, JsonLd, breadcrumbJsonLd } from "@/lib/seo";
import NewsCard from "@/components/news/NewsCard";
import AdBanner from "@/components/AdBanner";

/* Tanımsız bölüm slug'ı 404 döner — rastgele URL'ler sayfa üretmez. */
export const dynamicParams = false;

export function generateStaticParams() {
  return activeSections()
    .filter((s) => getNewsBySection(s.slug).length > 0)
    .map((s) => ({ section: s.slug }));
}

export async function generateMetadata({ params }) {
  const { section: slug } = await params;
  const section = getSection(slug);
  if (!section) return {};

  return buildMetadata({
    title: section.name,
    description: section.description,
    path: `/haber/${section.slug}`,
    keywords: [section.name, section.shortName].filter(Boolean),
  });
}

export default async function SectionPage({ params }) {
  const { section: slug } = await params;
  const section = getSection(slug);
  if (!section || section.active === false) notFound();

  const items = getNewsBySection(slug);
  if (items.length === 0) notFound();

  const [lead, ...rest] = items;
  const otherSections = activeSections().filter(
    (s) => s.slug !== slug && getNewsBySection(s.slug).length > 0,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", path: "/" },
          { name: "Haberler", path: "/haber" },
          { name: section.name, path: `/haber/${section.slug}` },
        ])}
      />

      <nav aria-label="Konum" className="text-xs text-muted">
        <Link href="/" className="inline-flex min-h-6 items-center hover:text-link">
          Ana Sayfa
        </Link>
        <span aria-hidden="true" className="mx-1.5">
          /
        </span>
        <Link href="/haber" className="inline-flex min-h-6 items-center hover:text-link">
          Haberler
        </Link>
      </nav>

      <header className="mt-3 border-b border-line pb-6">
        <h1 className="headline text-3xl text-ink sm:text-4xl">{section.name}</h1>
        {section.description ? (
          <p className="standfirst mt-3 max-w-2xl">{section.description}</p>
        ) : null}
      </header>

      {/* Bölümün öne çıkan haberi */}
      <div className="mt-8">
        <NewsCard item={lead} size="lead" priority />
      </div>

      <AdBanner placement="headerBelow" />

      {rest.length > 0 ? (
        <section className="mt-8" aria-labelledby="son-haberler">
          <h2 id="son-haberler" className="mb-4 text-lg font-bold tracking-tight text-ink">
            Son haberler
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((item) => (
              <NewsCard key={item.slug} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {/* İç bağlantılar — ilgili bölümler */}
      {otherSections.length > 0 ? (
        <nav aria-label="Diğer bölümler" className="mt-12 border-t border-line pt-6">
          <h2 className="text-sm font-semibold text-ink">Diğer bölümler</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {otherSections.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/haber/${s.slug}`}
                  className="inline-flex min-h-9 items-center rounded-brand border border-line px-3 text-sm text-muted transition-colors hover:border-accent-300 hover:text-ink"
                >
                  {s.shortName ?? s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
