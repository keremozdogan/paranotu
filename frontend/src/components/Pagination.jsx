import Link from "next/link";

/**
 * Sayfalama. `paginate()` çıktısını alır.
 * URL biçimi: /blog?sayfa=2  (SEO için rel=prev/next Next tarafından
 * üretilmez; bağlantıların taranabilir <a> olması yeterlidir.)
 */
export default function Pagination({ result, basePath }) {
  if (!result || result.totalPages <= 1) return null;

  const href = (page) => (page === 1 ? basePath : `${basePath}?sayfa=${page}`);

  /* Geçerli sayfanın etrafında en fazla 5 numara göster. */
  const start = Math.max(1, Math.min(result.page - 2, result.totalPages - 4));
  const end = Math.min(result.totalPages, start + 4);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav
      aria-label="Sayfalama"
      className="mt-12 flex items-center justify-center gap-1.5"
    >
      {result.hasPrevious ? (
        <Link
          href={href(result.page - 1)}
          rel="prev"
          className="rounded-lg border border-line px-3 py-2 text-sm text-muted transition-colors hover:border-primary-300 hover:text-ink"
        >
          ← Önceki
        </Link>
      ) : null}

      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === result.page ? "page" : undefined}
          className={`min-w-9 rounded-lg border px-3 py-2 text-center text-sm transition-colors ${
            p === result.page
              ? "border-primary-600 bg-primary-600 font-semibold text-white"
              : "border-line text-muted hover:border-primary-300 hover:text-ink"
          }`}
        >
          {p}
        </Link>
      ))}

      {result.hasNext ? (
        <Link
          href={href(result.page + 1)}
          rel="next"
          className="rounded-lg border border-line px-3 py-2 text-sm text-muted transition-colors hover:border-primary-300 hover:text-ink"
        >
          Sonraki →
        </Link>
      ) : null}
    </nav>
  );
}
