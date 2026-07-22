import { Fragment } from "react";

import siteConfig from "~/site.config";
import AdBanner from "@/components/AdBanner";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";
import { getPostSummaries, paginate } from "@/lib/posts";
import { buildMetadata, JsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Tüm Rehberler",
  description:
    "Bütçe kurma, mikro-birikim, acil durum fonu ve yatırıma ilk adım — yayımlanan tüm rehberler.",
  path: "/blog",
});

export default async function BlogIndexPage({ searchParams }) {
  /* Next 16: searchParams bir Promise. */
  const params = await searchParams;
  const page = Number(params?.sayfa ?? 1) || 1;

  const result = paginate(getPostSummaries(), page);
  const adEvery = siteConfig.content.adEveryNPosts;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", path: "/" },
          { name: "Rehberler", path: "/blog" },
        ])}
      />

      <header className="mb-10 border-b border-line pb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Tüm Rehberler
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">
          Bütçe kurmaktan ilk yatırıma kadar, sırayla okunabilecek rehberler.
          Toplam {result.totalItems} yazı.
        </p>
      </header>

      <AdBanner placement="headerBelow" className="mt-0" />

      {result.items.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((post, i) => (
            <Fragment key={post.slug}>
              <PostCard post={post} priority={i < 3} />
              {(i + 1) % adEvery === 0 ? (
                <div className="sm:col-span-2 lg:col-span-3">
                  <AdBanner placement="listInline" className="my-0" />
                </div>
              ) : null}
            </Fragment>
          ))}
        </div>
      ) : (
        <p className="rounded-brand border border-dashed border-line p-10 text-center text-sm text-muted">
          Bu sayfada gösterilecek yazı yok.
        </p>
      )}

      <Pagination result={result} basePath="/blog" />
    </div>
  );
}
