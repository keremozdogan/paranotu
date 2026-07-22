import Image from "next/image";
import Link from "next/link";

import siteConfig from "~/site.config";
import { formatDate } from "@/lib/format";

/**
 * Yazı kartı.
 * variant: "default" | "featured" | "compact"
 */
export default function PostCard({ post, variant = "default", priority = false }) {
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <article className="group">
        <Link href={`/blog/${post.slug}`} className="flex gap-3">
          {post.image ? (
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-subtle">
              <Image
                src={post.image}
                alt={post.imageAlt}
                fill
                sizes="64px"
                className="object-cover"
              />
            </span>
          ) : null}
          <span className="min-w-0">
            <span className="block line-clamp-2 text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-primary-600">
              {post.title}
            </span>
            <span className="mt-1 block text-xs text-muted">
              {formatDate(post.date)}
              {siteConfig.features.readingTime
                ? ` · ${post.readingTime} dk okuma`
                : null}
            </span>
          </span>
        </Link>
      </article>
    );
  }

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-brand border border-line bg-canvas transition-all hover:border-primary-300 hover:shadow-lg hover:shadow-primary-900/5 ${
        isFeatured ? "sm:flex-row" : ""
      }`}
    >
      {/* Görsel — yoksa marka renkli degrade yer tutucu */}
      <Link
        href={`/blog/${post.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className={`relative block shrink-0 overflow-hidden bg-subtle ${
          isFeatured ? "aspect-[16/10] sm:aspect-auto sm:w-2/5" : "aspect-[16/9]"
        }`}
      >
        {post.image ? (
          <Image
            src={post.image}
            alt=""
            fill
            priority={priority}
            sizes={isFeatured ? "(max-width: 640px) 100vw, 40vw" : "(max-width: 768px) 100vw, 33vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="absolute inset-0 bg-gradient-to-br from-primary-500/15 via-accent-500/10 to-transparent">
            <span className="absolute bottom-3 left-4 font-mono text-5xl font-bold text-primary-600/25">
              {post.category?.name?.charAt(0) ?? "•"}
            </span>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {post.category ? (
            <Link
              href={`/kategori/${post.category.slug}`}
              className="rounded-full bg-primary-50 px-2.5 py-1 font-semibold text-primary-700 transition-colors hover:bg-primary-100"
            >
              {post.category.name}
            </Link>
          ) : null}
          <time dateTime={post.date} className="text-muted">
            {formatDate(post.date)}
          </time>
          {siteConfig.features.readingTime ? (
            <span className="text-muted">· {post.readingTime} dk</span>
          ) : null}
        </div>

        <h3
          className={`font-bold leading-snug tracking-tight text-ink ${
            isFeatured ? "text-xl sm:text-2xl" : "text-lg"
          }`}
        >
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors group-hover:text-primary-600"
          >
            {post.title}
          </Link>
        </h3>

        <p
          className={`mt-2 text-sm leading-relaxed text-muted ${
            isFeatured ? "line-clamp-3" : "line-clamp-2"
          }`}
        >
          {post.description}
        </p>

        <div className="mt-4 flex items-center gap-2 pt-1 text-xs text-muted">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-100 text-[10px] font-bold text-accent-700">
            {post.author?.name?.charAt(0) ?? "?"}
          </span>
          <span>{post.author?.name}</span>
        </div>
      </div>
    </article>
  );
}
