/**
 * Politika/künye sayfaları için ortak kabuk.
 *
 * Aynı düzeni dört ayrı sayfada tekrarlamamak için tek bileşen. Okunabilir
 * genişlik, breadcrumb, son güncelleme tarihi ve `.prose-site` tipografisi
 * burada standartlaşır.
 */

import Link from "next/link";

import { formatDate } from "@/lib/format";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo";

export default function PolicyPage({ title, description, path, updatedAt, children }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", path: "/" },
          { name: title, path },
        ])}
      />

      <nav aria-label="Konum" className="text-xs text-muted">
        <Link href="/" className="inline-flex min-h-6 items-center hover:text-link">
          Ana Sayfa
        </Link>
      </nav>

      <header className="mt-3 border-b border-line pb-6">
        <h1 className="headline text-3xl text-ink sm:text-4xl">{title}</h1>
        {description ? <p className="standfirst mt-3">{description}</p> : null}
        {updatedAt ? (
          <p className="mt-3 text-xs text-muted">
            Son güncelleme:{" "}
            <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
          </p>
        ) : null}
      </header>

      <div className="prose-site mt-8">{children}</div>
    </div>
  );
}
