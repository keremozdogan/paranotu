import Link from "next/link";
import { notFound } from "next/navigation";

import PostCard from "@/components/PostCard";
import AdBanner from "@/components/AdBanner";
import { getPostsByTag, getAllTags } from "@/lib/posts";
import { buildMetadata, JsonLd, breadcrumbJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: tag.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { tag: slug } = await params;
  const tag = getAllTags().find((t) => t.slug === slug);

  if (!tag) return buildMetadata({ title: "Etiket bulunamadı", noindex: true });

  return buildMetadata({
    title: `#${tag.name}`,
    description: `“${tag.name}” etiketiyle işaretlenmiş ${tag.count} yazı.`,
    path: `/etiket/${tag.slug}`,
    keywords: [tag.name],
    /* Etiket sayfaları ince içerik sayılabilir; az yazı varsa indeksleme. */
    noindex: tag.count < 2,
  });
}

export default async function TagPage({ params }) {
  const { tag: slug } = await params;
  const tag = getAllTags().find((t) => t.slug === slug);

  if (!tag) notFound();

  const posts = getPostsByTag(slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", path: "/" },
          { name: "Rehberler", path: "/blog" },
          { name: `#${tag.name}`, path: `/etiket/${tag.slug}` },
        ])}
      />

      <header className="mb-10 border-b border-line pb-8">
        <nav aria-label="Konum" className="text-xs text-muted">
          <Link href="/blog" className="hover:text-primary-600">
            Rehberler
          </Link>
        </nav>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          #{tag.name}
        </h1>
        <p className="mt-2 text-sm text-muted">{posts.length} yazı</p>
      </header>

      <AdBanner placement="headerBelow" className="mt-0" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <PostCard key={post.slug} post={post} priority={i < 3} />
        ))}
      </div>
    </div>
  );
}
