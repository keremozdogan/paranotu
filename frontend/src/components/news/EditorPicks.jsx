/**
 * ============================================================================
 *  ÖNE ÇIKANLAR — numaralı editoryal liste
 * ============================================================================
 *  Premium medya sitelerinin güçlü göründüğü klasik blok: 01–05 numaralı,
 *  görselsiz, tamamen tipografiye dayanan liste. Ana sayfada ve haber
 *  detayının yan sütununda kullanılır.
 *
 *  ⚠️ NEDEN "EN ÇOK OKUNANLAR" DEĞİL?
 *  Sitede görüntülenme sayacı verisi YOK (.NET sayacı kapalı ve geçmiş veri
 *  tutulmuyor). Popülerlik uydurmak, okura yanlış sinyal vermek olurdu —
 *  "en çok okunan" dediğin şey aslında editörün seçtiğiyse bu bir yalandır.
 *  Bu yüzden liste, gerçekte ne olduğunu söyleyen adı taşır: sabitlenmiş ve
 *  önem skoru yüksek içerikler.
 *
 *  Gerçek görüntülenme verisi bağlandığında: `title` prop'unu "En çok
 *  okunanlar" yapıp `items`ı sayaca göre sıralanmış listeyle besle —
 *  bileşenin kendisi değişmez.
 * ============================================================================
 */

import Link from "next/link";

import { formatRelativeTime } from "@/lib/format";

/**
 * @param {object}   props
 * @param {string}   props.title   Blok başlığı — listenin gerçekte ne olduğunu söylemeli.
 * @param {Array}    props.items   { href, title, kicker?, publishedAt? }
 * @param {number}   [props.limit] Gösterilecek en fazla kayıt.
 */
export default function EditorPicks({ title = "Öne çıkanlar", items = [], limit = 5, className = "" }) {
  const list = items.filter(Boolean).slice(0, limit);
  /* Tek maddelik "liste" liste değildir — blok hiç çizilmez. */
  if (list.length < 2) return null;

  return (
    <section aria-labelledby="one-cikanlar" className={className}>
      <h2
        id="one-cikanlar"
        className="border-b border-line pb-2 text-xs font-bold uppercase tracking-[0.16em] text-ink"
      >
        {title}
      </h2>

      <ol className="mt-1">
        {list.map((item, i) => (
          <li key={item.href} className="border-b border-line last:border-b-0">
            <Link href={item.href} className="group flex gap-3 py-3.5">
              {/* Numara: okumayı yönlendiren görsel çapa. Sayı gövde metniyle
                  yarışmasın diye ince ve soluk — hiyerarşi başlıkta kalır. */}
              <span
                aria-hidden="true"
                className="numeric w-7 shrink-0 pt-px text-lg font-semibold leading-none text-line transition-colors group-hover:text-accent-500"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0">
                {item.kicker ? (
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-accent-700">
                    {item.kicker}
                  </span>
                ) : null}
                <h3 className="clamp-3 text-sm font-semibold leading-snug text-ink underline-offset-2 group-hover:underline">
                  {item.title}
                </h3>
                {item.publishedAt ? (
                  <time dateTime={item.publishedAt} className="mt-1 block text-[11px] text-muted">
                    {formatRelativeTime(item.publishedAt)}
                  </time>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
