/**
 * YAZAR SAYFASI — /yazarlar/[id]
 *
 * Haber künyesindeki isim ve `NewsArticle` JSON-LD'deki `author.url` buraya
 * bağlanır. Google'ın E-E-A-T değerlendirmesinde yazarın kim olduğunun
 * izlenebilir olması önemlidir — künyede isim yazıp arkasında sayfa olmaması
 * zayıf bir sinyaldir.
 */

import Link from "next/link";
import { notFound } from "next/navigation";

import siteConfig from "~/site.config";
import PostCard from "@/components/PostCard";
import NewsCard from "@/components/news/NewsCard";
import { getPostSummaries } from "@/lib/posts";
import { getNewsSummaries } from "@/lib/news";
import { buildMetadata, JsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(siteConfig.authors ?? {}).map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const author = siteConfig.authors?.[id];
  if (!author) return {};

  return buildMetadata({
    title: author.name,
    description: author.bio ?? `${author.name} — ${siteConfig.name} yazarı.`,
    path: `/yazarlar/${id}`,
  });
}

export default async function AuthorPage({ params }) {
  const { id } = await params;
  const author = siteConfig.authors?.[id];
  if (!author) notFound();

  const posts = getPostSummaries().filter((p) => p.author?.id === id);
  const news = getNewsSummaries().filter((n) => n.author?.id === id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", path: "/" },
          { name: "Yazarlar", path: "/kunye" },
          { name: author.name, path: `/yazarlar/${id}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: author.name,
          ...(author.title ? { jobTitle: author.title } : {}),
          ...(author.bio ? { description: author.bio } : {}),
          url: absoluteUrl(`/yazarlar/${id}`),
          worksFor: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
        }}
      />

      <nav aria-label="Konum" className="text-xs text-muted">
        <Link href="/" className="inline-flex min-h-6 items-center hover:text-link">
          Ana Sayfa
        </Link>
        <span aria-hidden="true" className="mx-1.5">/</span>
        <Link href="/kunye" className="inline-flex min-h-6 items-center hover:text-link">
          Künye
        </Link>
      </nav>

      <header className="mt-3 border-b border-line pb-6">
        <h1 className="headline text-3xl text-ink sm:text-4xl">{author.name}</h1>
        {author.title ? (
          <p className="mt-1 text-sm font-medium text-accent-700">{author.title}</p>
        ) : null}
        {author.bio ? <p className="standfirst mt-3 max-w-2xl">{author.bio}</p> : null}
      </header>

      {news.length > 0 ? (
        <section aria-labelledby="yazar-haberler" className="mt-8">
          <h2 id="yazar-haberler" className="mb-4 text-lg font-bold tracking-tight text-ink">
            Haberleri
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <NewsCard key={item.slug} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {posts.length > 0 ? (
        <section aria-labelledby="yazar-rehberler" className="mt-10">
          <h2 id="yazar-rehberler" className="mb-4 text-lg font-bold tracking-tight text-ink">
            Rehberleri
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      ) : null}

      {news.length === 0 && posts.length === 0 ? (
        <p className="mt-8 rounded-brand border border-dashed border-line p-8 text-center text-sm text-muted">
          Bu yazarın yayımlanmış içeriği henüz yok.
        </p>
      ) : null}
    </div>
  );
}
