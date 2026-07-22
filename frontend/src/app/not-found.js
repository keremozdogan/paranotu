import Link from "next/link";

import PostCard from "@/components/PostCard";
import { getFeaturedPosts } from "@/lib/posts";

export const metadata = {
  title: "Sayfa bulunamadı",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  const suggestions = getFeaturedPosts(3);

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <p className="font-mono text-6xl font-bold text-primary-600/30">404</p>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        Aradığın sayfa burada değil
      </h1>
      <p className="mt-3 text-base text-muted">
        Bağlantı eskimiş ya da adres yanlış yazılmış olabilir.
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          Ana sayfaya dön
        </Link>
        <Link
          href="/blog"
          className="rounded-lg border border-line px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-primary-300"
        >
          Rehberlere göz at
        </Link>
      </div>

      {suggestions.length ? (
        <section className="mt-16 text-left">
          <h2 className="mb-5 text-center text-sm font-bold uppercase tracking-wider text-muted">
            Belki bunlar ilgini çeker
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {suggestions.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
