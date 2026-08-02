/**
 * SON GELİŞMELER — ham feed akışı.
 *
 * ⚠️ Bu kartlar ParaNotu sayfasına DEĞİL, orijinal kaynağa gider.
 * Bunu kullanıcıdan gizlemiyoruz: her kartta kaynak adı görünür, dış
 * bağlantı ikonu vardır ve `rel="nofollow noopener"` ile açılır.
 *
 * `nofollow` neden? Bu bağlantılar editoryal bir tavsiye değil, otomatik
 * toplanmış keşif bağlantılarıdır. Google'a "bunlar bizim onayımızdan
 * geçmiş referanslar değil" demenin doğru yolu budur.
 */

import { formatRelativeTime } from "@/lib/format";

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <path
        d="M14 4h6v6M20 4l-8 8M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FeedStrip({ items = [], title = "Son gelişmeler" }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="son-gelismeler" className="reveal">
      <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-line pb-2">
        <h2 id="son-gelismeler" className="text-xl font-bold tracking-tight text-ink">
          {title}
        </h2>
        {/* Okurun ne göreceğini baştan bilmesi için açık uyarı. */}
        <span className="shrink-0 text-xs text-muted">Kaynak sitelerine gider</span>
      </div>

      <ul className="divide-y divide-line overflow-hidden rounded-brand border border-line bg-canvas">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={item.url}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-subtle"
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-xs">
                  <span className="font-semibold uppercase tracking-wide text-accent-700">
                    {item.sourceName}
                  </span>
                  {item.publishedAt ? (
                    <>
                      <span aria-hidden="true" className="text-muted">·</span>
                      <time dateTime={item.publishedAt} className="text-muted">
                        {formatRelativeTime(item.publishedAt)}
                      </time>
                    </>
                  ) : null}
                </span>

                <span className="clamp-2 mt-0.5 block text-sm font-medium text-ink underline-offset-2 group-hover:underline">
                  {item.title}
                </span>

                {/* Özet yalnızca kaynak izin veriyorsa gösterilir. */}
                {item.excerpt ? (
                  <span className="clamp-2 mt-1 block text-xs leading-relaxed text-muted">
                    {item.excerpt}
                  </span>
                ) : null}
              </span>

              <span className="mt-0.5 text-muted transition-colors group-hover:text-ink">
                <ExternalIcon />
                <span className="sr-only">(dış bağlantı — {item.sourceName})</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-2 text-xs leading-relaxed text-muted">
        Bu başlıklar resmî kurumların ve haber kaynaklarının kendi
        beslemelerinden otomatik derlenir. ParaNotu bu içerikleri yeniden
        yayımlamaz; başlığa tıkladığında doğrudan kaynağa gidersin.
      </p>
    </section>
  );
}
