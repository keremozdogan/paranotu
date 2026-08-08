import Link from "next/link";
import { Fragment, Suspense } from "react";

import siteConfig from "~/site.config";
import AdBanner from "@/components/AdBanner";
import PostCard from "@/components/PostCard";
import Reveal from "@/components/Reveal";
import Newsletter from "@/components/Newsletter";
import LiveRates from "@/components/LiveRates";
import {
  getPostSummaries,
  getFeaturedPosts,
  getCategoriesWithCounts,
} from "@/lib/posts";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ path: "/" });

export default function HomePage() {
  const all = getPostSummaries();
  const hero = getFeaturedPosts(1)[0];
  const rest = all.filter((p) => p.slug !== hero?.slug);
  const categories = getCategoriesWithCounts().filter((c) => c.count > 0);
  const adEvery = siteConfig.content.adEveryNPosts;

  return (
    <>
      {/* ------------------------------------------------------------ HERO */}
      <section className="border-b border-line bg-gradient-to-b from-primary-50/60 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600">
            {siteConfig.tagline}
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-extrabold leading-[1.15] tracking-tight text-ink sm:text-5xl">
            Küçük tutarlarla başlayan{" "}
            <span className="text-primary-600">büyük alışkanlıklar</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {siteConfig.description}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/blog"
              className="rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              Rehberlere göz at
            </Link>
            <Link
              href="/kategori/butce"
              className="rounded-lg border border-line bg-canvas px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-primary-300"
            >
              Bütçeye sıfırdan başla
            </Link>
          </div>
        </div>
      </section>

      {/* --------------------------------------------- REKLAM: BAŞLIK ALTI */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AdBanner placement="headerBelow" />
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* --------------------------------------------------- ANA SÜTUN */}
        <div>
          {hero ? (
            <Reveal as="section" className="mb-12">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted">
                Öne çıkan
              </h2>
              <PostCard post={hero} variant="featured" priority />
            </Reveal>
          ) : null}

          <section>
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="text-xl font-bold tracking-tight text-ink">Son yazılar</h2>
              <Link
                href="/blog"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Tümü →
              </Link>
            </div>

            {rest.length ? (
              <Reveal stagger className="grid gap-6 sm:grid-cols-2">
                {rest.slice(0, siteConfig.content.postsPerPage).map((post, i) => (
                  <Fragment key={post.slug}>
                    <PostCard post={post} />
                    {/* Liste araları — her N karttan sonra reklam */}
                    {(i + 1) % adEvery === 0 ? (
                      <div className="sm:col-span-2">
                        <AdBanner placement="listInline" className="my-0" />
                      </div>
                    ) : null}
                  </Fragment>
                ))}
              </Reveal>
            ) : (
              <p className="rounded-brand border border-dashed border-line p-8 text-center text-sm text-muted">
                Henüz yazı yok. <code>content/posts/</code> içine bir .mdx dosyası ekle.
              </p>
            )}
          </section>
        </div>

        {/* ------------------------------------------------------ SIDEBAR */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {siteConfig.features.liveRates ? (
            /* Backend yavaşsa sayfanın geri kalanı onu beklemesin */
            <Suspense
              fallback={
                <div className="h-48 animate-pulse rounded-brand border border-line bg-subtle/60" />
              }
            >
              <LiveRates />
            </Suspense>
          ) : null}

          {categories.length ? (
            <nav
              aria-label="Kategoriler"
              className="rounded-brand border border-line bg-canvas p-5"
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink">
                Kategoriler
              </h2>
              <ul className="mt-3 space-y-1">
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/kategori/${cat.slug}`}
                      className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-muted transition-colors hover:bg-subtle hover:text-ink"
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-muted/60">{cat.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {siteConfig.features.newsletter ? (
            <Newsletter variant="inline" source="home-sidebar" />
          ) : null}

          <AdBanner placement="sidebar" className="my-0" />
        </aside>
      </div>
    </>
  );
}
