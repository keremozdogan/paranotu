import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import siteConfig from "~/site.config";
import AdBanner from "@/components/AdBanner";
import PostCard from "@/components/PostCard";
import Newsletter from "@/components/Newsletter";
import LiveRates from "@/components/LiveRates";
import TableOfContents from "@/components/TableOfContents";
import ShareButtons from "@/components/ShareButtons";
import MdxContent from "@/components/mdx/MdxContent";
import {
  getPostBySlug,
  getAllSlugs,
  getRelatedPosts,
  getAdjacentPosts,
  extractHeadings,
  slugify,
} from "@/lib/posts";
import { formatDate } from "@/lib/format";
import {
  buildMetadata,
  JsonLd,
  articleJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo";

/* Tüm yazıları build sırasında statik üret — SEO ve hız için en iyisi. */
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

/* Listede olmayan bir slug gelirse 404 ver (sızıntı sayfa oluşmasın). */
export const dynamicParams = false;

/** Next 16: `params` bir Promise — await edilmeli. */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return buildMetadata({ title: "Yazı bulunamadı", noindex: true });
  }

  return buildMetadata({
    title: post.title,
    description: post.description,
    path: post.canonical ?? `/blog/${post.slug}`,
    keywords: post.keywords,
    /* Kapak görseli varsa OG'de o kullanılır; yoksa /og route'u
       yazının başlığını gömerek görseli otomatik üretir. */
    image: post.image,
    ogCategory: post.category?.name,
    ogReadingTime: post.readingTime,
    type: "article",
    publishedTime: post.date,
    modifiedTime: post.updated ?? post.date,
    authors: [post.author?.name],
    noindex: post.noindex,
  });
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const headings = siteConfig.features.tableOfContents
    ? extractHeadings(post.content)
    : [];
  const related = siteConfig.features.relatedPosts ? getRelatedPosts(slug, 3) : [];
  const { previous, next } = getAdjacentPosts(slug);

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <JsonLd data={articleJsonLd(post)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", path: "/" },
          { name: "Rehberler", path: "/blog" },
          ...(post.category
            ? [{ name: post.category.name, path: `/kategori/${post.category.slug}` }]
            : []),
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />

      {/* ------------------------------------------------------- BAŞLIK */}
      <header className="mx-auto max-w-3xl">
        <nav aria-label="Konum" className="text-xs text-muted">
          <Link href="/" className="hover:text-primary-600">
            Ana Sayfa
          </Link>
          <span className="mx-1.5">/</span>
          <Link href="/blog" className="hover:text-primary-600">
            Rehberler
          </Link>
          {post.category ? (
            <>
              <span className="mx-1.5">/</span>
              <Link
                href={`/kategori/${post.category.slug}`}
                className="hover:text-primary-600"
              >
                {post.category.name}
              </Link>
            </>
          ) : null}
        </nav>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
          {post.title}
        </h1>

        <p className="mt-3 text-lg leading-relaxed text-muted">{post.description}</p>

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-line py-4 text-sm text-muted">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-100 text-xs font-bold text-accent-700">
            {post.author?.name?.charAt(0)}
          </span>
          <span className="font-medium text-ink">{post.author?.name}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {siteConfig.features.readingTime ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{post.readingTime} dk okuma</span>
            </>
          ) : null}
          {post.updated && post.updated !== post.date ? (
            <span className="w-full text-xs text-muted/70">
              Son güncelleme: <time dateTime={post.updated}>{formatDate(post.updated)}</time>
            </span>
          ) : null}
        </div>
      </header>

      {/* Kapak görseli */}
      {post.image ? (
        <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-brand">
          <Image
            src={post.image}
            alt={post.imageAlt}
            width={1200}
            height={630}
            priority
            sizes="(max-width: 896px) 100vw, 896px"
            className="h-auto w-full object-cover"
          />
        </div>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* --------------------------------------------------- GÖVDE */}
        <div className="mx-auto w-full max-w-3xl lg:mx-0">
          {/* REKLAM: yazının hemen başı */}
          <AdBanner placement="inArticle" className="mt-0" />

          <MdxContent source={post.content} />

          {/* REKLAM: yazının sonu */}
          <AdBanner placement="inArticle" />

          {post.tags?.length ? (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/etiket/${slugify(tag)}`}
                  className="rounded-full border border-line px-3 py-1 text-xs text-muted transition-colors hover:border-primary-300 hover:text-primary-700"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          ) : null}

          <ShareButtons title={post.title} path={`/blog/${post.slug}`} />

          {siteConfig.features.newsletter ? (
            <div className="mt-10">
              <Newsletter source={`post:${post.slug}`} />
            </div>
          ) : null}

          {/* Önceki / sonraki yazı */}
          {previous || next ? (
            <nav aria-label="Diğer yazılar" className="mt-10 grid gap-4 sm:grid-cols-2">
              {previous ? (
                <Link
                  href={`/blog/${previous.slug}`}
                  className="rounded-brand border border-line p-4 transition-colors hover:border-primary-300"
                >
                  <span className="text-xs text-muted">← Önceki yazı</span>
                  <span className="mt-1 block text-sm font-semibold text-ink">
                    {previous.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={`/blog/${next.slug}`}
                  className="rounded-brand border border-line p-4 text-right transition-colors hover:border-primary-300"
                >
                  <span className="text-xs text-muted">Sonraki yazı →</span>
                  <span className="mt-1 block text-sm font-semibold text-ink">
                    {next.title}
                  </span>
                </Link>
              ) : null}
            </nav>
          ) : null}
        </div>

        {/* ------------------------------------------------- SIDEBAR */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {headings.length ? <TableOfContents headings={headings} /> : null}

          {siteConfig.features.liveRates ? (
            <Suspense
              fallback={
                <div className="h-48 animate-pulse rounded-brand border border-line bg-subtle/60" />
              }
            >
              <LiveRates />
            </Suspense>
          ) : null}

          <AdBanner placement="sidebar" className="my-0" />
        </aside>
      </div>

      {/* ------------------------------------------------- İLGİLİ YAZILAR */}
      {related.length ? (
        <section className="mt-16 border-t border-line pt-10">
          <h2 className="mb-6 text-xl font-bold tracking-tight text-ink">
            Bunları da okumak isteyebilirsin
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
