/**
 * Boş durum — "henüz içerik yok" ekranı.
 *
 * NEDEN AYRI BİR BİLEŞEN?
 * ParaNotu'nun haber tarafı yeni kuruluyor. Bir bölüm boşken kullanıcıya
 * kırık bir sayfa değil, ne olduğunu açıklayan ve DEĞER TAŞIYAN bir alternatif
 * sunulmalı — bu yüzden boş durum her zaman mevcut içeriğe (rehberler,
 * enflasyon sayfası, araçlar) yönlendirir.
 *
 * Sahte haber üretip boşluğu doldurmak seçenek değildir.
 */

import Link from "next/link";

const DEFAULT_LINKS = [
  { href: "/enflasyon", label: "Güncel enflasyon verileri" },
  { href: "/blog", label: "Para rehberleri" },
  { href: "/araclar", label: "Hesaplama araçları" },
];

export default function EmptyState({
  title = "Bu bölümde henüz haber yok",
  description = "Haber akışı yayına hazırlanıyor. Bu arada sitedeki diğer içeriklere göz atabilirsin.",
  links = DEFAULT_LINKS,
}) {
  return (
    <div className="rounded-brand border border-dashed border-line bg-subtle/60 px-6 py-12 text-center">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p>

      {links.length > 0 ? (
        <ul className="mt-6 flex flex-wrap justify-center gap-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex min-h-10 items-center rounded-brand border border-line bg-canvas px-4 text-sm font-medium text-ink transition-colors hover:border-accent-300"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
