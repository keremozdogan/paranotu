/**
 * ============================================================================
 *  KALICI REHBER SAYFASI — /asgari-ucret/guncel-asgari-ucret gibi
 * ============================================================================
 *  ⚠️ URL YAPISI KALICIDIR. Bir rehber yayına girdikten sonra hub veya slug
 *  değiştirilmez; değişmesi gerekirse next.config.mjs'te 301 kurulur.
 *
 *  `dynamicParams = false` + `generateStaticParams` sayesinde yalnızca
 *  gerçekten var olan hub/slug çiftleri sayfa üretir. Rastgele bir kök
 *  seviye adres (/rastgele/sayfa) 404 döner — bu route kök seviyede olduğu
 *  için bu kısıt ŞART.
 * ============================================================================
 */

import Link from "next/link";
import { notFound } from "next/navigation";

import MdxContent from "@/components/mdx/MdxContent";
import ShareButtons from "@/components/ShareButtons";
import TableOfContents from "@/components/TableOfContents";
import GuideMeta from "@/components/guides/GuideMeta";
import { ContentEndAdSlot, SidebarAdSlot } from "@/components/ads";
import siteConfig from "~/site.config";
import { getGuide, getAllGuideParams, getGuidesByHub } from "@/lib/evergreen";
import { extractHeadings } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import { buildMetadata, JsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { evergreenIndexability, resolveRobots } from "@/lib/indexability";
import { absoluteUrl } from "@/lib/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllGuideParams();
}

export async function generateMetadata({ params }) {
  const { hub, slug } = await params;
  const guide = getGuide(hub, slug);
  if (!guide) return {};

  const base = buildMetadata({
    title: guide.seoTitle ?? guide.title,
    description: guide.seoDescription,
    path: guide.href,
    keywords: guide.keywords,
    type: "article",
    image: guide.image?.src ?? null,
    publishedTime: guide.publishedAt,
    /* ⚠️ modifiedTime SADECE gerçek güncellemeden gelir. */
    modifiedTime: guide.updatedAt,
    authors: guide.author ? [guide.author.name] : undefined,
    ogCategory: guide.hub.name,
    ogReadingTime: guide.readingTime,
  });

  /* Robots kararı tek merkezden — indexability.js */
  return { ...base, robots: resolveRobots(evergreenIndexability(guide)) };
}

export default async function GuidePage({ params }) {
  const { hub, slug } = await params;
  const guide = getGuide(hub, slug);
  if (!guide) notFound();

  const headings = extractHeadings(guide.content);
  const showToc = siteConfig.features.tableOfContents && headings.length >= 3;
  const siblings = getGuidesByHub(hub).filter((g) => g.slug !== slug);

  /* Article / BlogPosting — içeriğin türüne göre (spec §10). */
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": guide.schemaType,
    headline: guide.title,
    description: guide.summary,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    inLanguage: siteConfig.lang,
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(guide.href) },
    url: absoluteUrl(guide.href),
    author: {
      "@type": "Person",
      name: guide.author?.name ?? siteConfig.name,
      ...(guide.author?.id ? { url: absoluteUrl(`/yazarlar/${guide.author.id}`) } : {}),
    },
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    articleSection: guide.hub.name,
    wordCount: guide.wordCount,
    ...(guide.keywords?.length ? { keywords: guide.keywords.join(", ") } : {}),
    /* Kaynaklar sayfada GÖRÜNÜYOR — structured data ile tutarlı. */
    ...(guide.sources?.length
      ? { citation: guide.sources.map((s) => ({ "@type": "CreativeWork", name: s.name, url: s.url })) }
      : {}),
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <JsonLd data={articleSchema} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", path: "/" },
          { name: guide.hub.name, path: `/${guide.hub.slug}` },
          { name: guide.title, path: guide.href },
        ])}
      />

      <nav aria-label="Konum" className="text-xs text-muted">
        <Link href="/" className="inline-flex min-h-6 items-center hover:text-link">Ana Sayfa</Link>
        <span aria-hidden="true" className="mx-1.5">/</span>
        <Link href={`/${guide.hub.slug}`} className="inline-flex min-h-6 items-center hover:text-link">{guide.hub.name}</Link>
      </nav>

      <header className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-700">
          ParaNotu Dosyası
        </p>
        <h1 className="headline mt-2 text-3xl text-ink sm:text-4xl">{guide.title}</h1>
        {guide.summary ? <p className="standfirst mt-4">{guide.summary}</p> : null}

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          {guide.author ? (
            <span>
              <span>Yazan </span>
              <Link href={`/yazarlar/${guide.author.id}`} className="font-medium text-ink hover:underline">
                {guide.author.name}
              </Link>
            </span>
          ) : null}
          <span>{guide.readingTime} dk okuma</span>
        </div>
      </header>

      {/* Tarihler ve kaynaklar — sayfanın üstünde, görünür (spec §1-C). */}
      <div className="mt-6">
        <GuideMeta guide={guide} />
      </div>

      <div className="mt-8 lg:flex lg:items-start lg:gap-10">
        {showToc ? (
          <aside className="hidden w-56 shrink-0 lg:block">
            {/* top-24 → yapışkan header'ın (56px) altında kalır, çakışmaz. */}
            <div className="sticky top-24">
              <TableOfContents headings={headings} />
            </div>
          </aside>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="prose-site mx-auto max-w-[68ch]">
            <MdxContent source={guide.content} />
          </div>

          {/*
            İÇERİK SONU REKLAMI.
            Yazı içi (paragraf arası) reklam yerine burayı seçtik: MDX
            gövdesini parçalayıp araya reklam sokmak, bir cümlenin
            ortasına reklam düşürme riski taşıyor (spec §11 bunu
            yasaklıyor). İçerik bittikten sonra, ilgili dosyalardan önce.
            Kısa içeriklerde hiç gösterilmez.
          */}
          {guide.wordCount >= 500 ? <ContentEndAdSlot /> : null}

          <div className="mx-auto mt-8 max-w-[68ch]">
            <ShareButtons path={guide.href} title={guide.title} />
          </div>

          {/* Değişiklik geçmişi — düzeltme politikasının sayfadaki karşılığı. */}
          {guide.revisions?.length ? (
            <section
              aria-labelledby="degisiklik-gecmisi"
              className="mx-auto mt-8 max-w-[68ch] rounded-brand border border-line bg-subtle p-4"
            >
              <h2 id="degisiklik-gecmisi" className="text-sm font-bold text-ink">
                Değişiklik geçmişi
              </h2>
              <ul className="mt-2 space-y-2">
                {guide.revisions.map((rev, i) => (
                  <li key={i} className="text-sm text-muted">
                    <time dateTime={rev.at} className="font-semibold text-ink">
                      {formatDate(rev.at)}
                    </time>{" "}
                    — {rev.note}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">
                Yaklaşımımız:{" "}
                <Link href="/duzeltme-politikasi" className="underline">Düzeltme Politikası</Link>
              </p>
            </section>
          ) : null}
        </div>

        {/*
          SAĞ SÜTUN REKLAMI — yalnızca xl (1280px+) ve üstünde.
          Daha dar ekranlarda üçüncü sütun içeriği sıkıştırıyor, o yüzden
          hiç render edilmiyor (mobil/tablet zaten kapalı).
          `sticky top-24` → header'ın altında kalır; `self-start` olmadan
          sticky çalışmaz çünkü flex öğesi varsayılan olarak gerilir.
        */}
        <aside className="hidden w-[300px] shrink-0 self-start xl:block">
          <SidebarAdSlot sticky />
        </aside>
      </div>

      {siblings.length > 0 ? (
        <section aria-labelledby="ilgili-dosyalar" className="mt-12 border-t border-line pt-8">
          <h2 id="ilgili-dosyalar" className="mb-4 text-lg font-bold tracking-tight text-ink">
            {guide.hub.name} dosyaları
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {siblings.map((g) => (
              <li key={g.href}>
                <Link
                  href={g.href}
                  className="card-lift block rounded-brand border border-line bg-canvas p-4"
                >
                  <span className="block text-base font-semibold text-ink">{g.title}</span>
                  <span className="clamp-2 mt-1 block text-sm text-muted">{g.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
