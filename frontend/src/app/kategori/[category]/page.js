import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";

import siteConfig from "~/site.config";
import AdBanner from "@/components/AdBanner";
import PostCard from "@/components/PostCard";
import Newsletter from "@/components/Newsletter";
import { getPostsByCategory, getCategoriesWithCounts } from "@/lib/posts";
import { buildMetadata, JsonLd, breadcrumbJsonLd } from "@/lib/seo";

/* Kategoriler site.config.js'ten geldiği için hepsi statik üretilebilir. */
export function generateStaticParams() {
  return siteConfig.categories.map((cat) => ({ category: cat.slug }));
}

export const dynamicParams = false;

function findCategory(slug) {
  return siteConfig.categories.find((c) => c.slug === slug) ?? null;
}

export async function generateMetadata({ params }) {
  const { category: slug } = await params;
  const category = findCategory(slug);

  if (!category) return buildMetadata({ title: "Kategori bulunamadı", noindex: true });

  return buildMetadata({
    title: category.name,
    description: category.description || `${category.name} kategorisindeki tüm yazılar.`,
    path: `/kategori/${category.slug}`,
    keywords: [category.name],
  });
}

export default async function CategoryPage({ params }) {
  const { category: slug } = await params;
  const category = findCategory(slug);

  if (!category) notFound();

  const posts = getPostsByCategory(slug);
  const others = getCategoriesWithCounts().filter(
    (c) => c.slug !== slug && c.count > 0,
  );
  const adEvery = siteConfig.content.adEveryNPosts;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", path: "/" },
          { name: "Rehberler", path: "/blog" },
          { name: category.name, path: `/kategori/${category.slug}` },
        ])}
      />

      <header className="mb-10 border-b border-line pb-8">
        <nav aria-label="Konum" className="text-xs text-muted">
          <Link href="/" className="hover:text-primary-600">
            Ana Sayfa
          </Link>
          <span className="mx-1.5">/</span>
          <Link href="/blog" className="hover:text-primary-600">
            Rehberler
          </Link>
        </nav>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {category.name}
        </h1>
        {category.description ? (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
            {category.description}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-muted">{posts.length} yazı</p>
      </header>

      <AdBanner placement="headerBelow" className="mt-0" />

      {posts.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
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
          Bu kategoride henüz yazı yok.
        </p>
      )}

      {others.length ? (
        <nav aria-label="Diğer kategoriler" className="mt-14 border-t border-line pt-8">
          <h2 className="text-sm font-bold text-ink">Diğer kategoriler</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {others.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/kategori/${c.slug}`}
                  className="inline-block rounded-full border border-line px-3.5 py-1.5 text-sm text-muted transition-colors hover:border-primary-300 hover:text-primary-700"
                >
                  {c.name} <span className="text-xs text-muted/60">({c.count})</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {siteConfig.features.newsletter ? (
        <div className="mt-12">
          <Newsletter source={`category:${slug}`} />
        </div>
      ) : null}
    </div>
  );
}
