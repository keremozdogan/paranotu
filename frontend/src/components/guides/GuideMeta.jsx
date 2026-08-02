/**
 * ============================================================================
 *  REHBER KÜNYE KUTUSU — sayfanın en üstünde, görünür
 * ============================================================================
 *  Spec §1-C'nin gerektirdiği dört tarihi ve kaynakları okura AÇIKÇA gösterir:
 *    • İlk yayın tarihi
 *    • Son güncelleme tarihi + güncelleme nedeni
 *    • Bir sonraki kontrol tarihi
 *    • Kullanılan resmî kaynaklar
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  "GÜNCELLENDİ" YAZISI NE ZAMAN ÇIKAR?
 *  ────────────────────────────────────────────────────────────────────────
 *  Yalnızca `updatedAt !== publishedAt` ise. İçerik hiç değişmediyse
 *  "güncellendi" satırı HİÇ görünmez — sahte güncellik üretmemek için.
 *
 *  `lastCheckedAt` ayrı bir satırdır ve "kontrol edildi, değişiklik
 *  gerekmedi" der. Bu ikisini karıştırmak, okuru yanıltmanın en kolay yolu.
 * ============================================================================
 */

import { formatDate } from "@/lib/format";
import { FRESHNESS_LABEL } from "@/lib/evergreen";

export default function GuideMeta({ guide }) {
  const wasUpdated = guide.updatedAt && guide.updatedAt !== guide.publishedAt;
  const needsAttention = guide.freshnessStatus && guide.freshnessStatus !== "current";

  return (
    <aside
      aria-label="İçerik künyesi"
      className="rounded-brand border border-line bg-subtle/70 p-4 text-sm"
    >
      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
            İlk yayın
          </dt>
          <dd className="text-ink">
            <time dateTime={guide.publishedAt}>{formatDate(guide.publishedAt)}</time>
          </dd>
        </div>

        {/* Yalnızca GERÇEK bir güncelleme olduysa. */}
        {wasUpdated ? (
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              Son güncelleme
            </dt>
            <dd className="font-medium text-ink">
              <time dateTime={guide.updatedAt}>{formatDate(guide.updatedAt)}</time>
            </dd>
          </div>
        ) : null}

        {/* Kontrol edildi ≠ güncellendi. Ayrı satır, ayrı anlam. */}
        {guide.lastCheckedAt && !wasUpdated ? (
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              Son kontrol
            </dt>
            <dd className="text-muted">
              <time dateTime={guide.lastCheckedAt}>{formatDate(guide.lastCheckedAt)}</time>
              <span className="ml-1 text-xs">(içerik değişmedi)</span>
            </dd>
          </div>
        ) : null}

        {guide.nextReviewAt ? (
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              Sonraki kontrol
            </dt>
            <dd className="text-muted">
              <time dateTime={guide.nextReviewAt}>{formatDate(guide.nextReviewAt)}</time>
            </dd>
          </div>
        ) : null}
      </dl>

      {guide.updateReason ? (
        <p className="mt-3 border-t border-line pt-3 text-sm text-muted">
          <span className="font-semibold text-ink">Güncelleme nedeni: </span>
          {guide.updateReason}
        </p>
      ) : null}

      {needsAttention ? (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-brand bg-gold-50 px-2 py-1 text-xs font-medium text-gold-800">
          <span aria-hidden="true">⚠</span>
          {FRESHNESS_LABEL[guide.freshnessStatus] ?? guide.freshnessStatus}
        </p>
      ) : null}

      {guide.sources?.length ? (
        <div className="mt-3 border-t border-line pt-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Kullanılan kaynaklar
          </h2>
          <ul className="mt-1.5 space-y-1">
            {guide.sources.map((source) => (
              <li key={source.url} className="text-sm">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-6 items-center text-link underline underline-offset-2"
                >
                  {source.name}
                </a>
                {source.kind === "official" ? (
                  <span className="ml-1.5 rounded-brand bg-accent-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-700">
                    Resmî
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
