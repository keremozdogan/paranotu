/**
 * Ana sayfada bir haber bölümünün satırı.
 *
 * İçeriği olmayan bölüm HİÇ RENDER EDİLMEZ (null döner). Boş başlık +
 * "içerik yok" kutusu ana sayfayı iskelet gibi gösterir; bunun yerine bölüm
 * sessizce yokluğa çekilir ve içerik geldiğinde kendiliğinden belirir.
 */

import Link from "next/link";

import NewsCard from "./NewsCard";

export default function SectionRow({ section, items, limit = 4, priority = false }) {
  if (!items || items.length === 0) return null;

  const shown = items.slice(0, limit);
  const headingId = `bolum-${section.slug}`;

  return (
    <section aria-labelledby={headingId} className="reveal">
      <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-line pb-2">
        <h2 id={headingId} className="text-xl font-bold tracking-tight text-ink">
          {section.name}
        </h2>
        <Link
          href={`/haber/${section.slug}`}
          /* min-h-6 → WCAG 2.5.8 asgari dokunma alanı. Bu bağlantı bir
             cümlenin içinde değil, bağımsız bir gezinme öğesi. */
          className="inline-flex min-h-6 shrink-0 items-center text-sm font-medium text-link hover:underline"
        >
          Tümü
          <span aria-hidden="true"> →</span>
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((item, i) => (
          <NewsCard key={item.slug} item={item} priority={priority && i === 0} />
        ))}
      </div>
    </section>
  );
}
