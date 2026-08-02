/**
 * ============================================================================
 *  HABER KARTI — tek bileşen, üç boyut
 * ============================================================================
 *  Aynı işi yapan üç ayrı kart bileşeni üretmemek için tek bileşen +
 *  `size` prop'u:
 *
 *    "lead"    → manşet (hero). Büyük görsel, spot metin.
 *    "default" → standart liste kartı.
 *    "compact" → görselsiz, yan sütun / "en çok okunan" listesi.
 *
 *  GÖRSEL KURALI
 *  Görsel yalnızca `item.image` DOLU ise çizilir. `src/lib/news.js`
 *  kredisiz görselleri zaten düşürdüğü için buraya lisanssız bir görsel
 *  gelemez. Boyutlar (`width`/`height`) verildiğinde layout shift olmaz;
 *  verilmediğinde sabit en-boy oranlı kutu kullanılır — her iki durumda da
 *  CLS üretmez.
 * ============================================================================
 */

import Link from "next/link";

import SmartImage from "@/components/media/SmartImage";
import { formatRelativeTime } from "@/lib/format";

/** Son dakika / canlı / öne çıkan rozetleri. */
function Badges({ item }) {
  if (!item.isBreaking && !item.isLive) return null;
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5">
      {item.isBreaking ? (
        <span className="rounded-brand bg-negative px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Son Dakika
        </span>
      ) : null}
      {item.isLive ? (
        <span className="inline-flex items-center gap-1 rounded-brand bg-gold-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
          Canlı
        </span>
      ) : null}
    </span>
  );
}

function Meta({ item, className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted ${className}`}>
      {item.section ? (
        <span className="font-semibold uppercase tracking-wide text-accent-700">
          {item.section.shortName ?? item.section.name}
        </span>
      ) : null}
      {item.publishedAt ? (
        <>
          <span aria-hidden="true">·</span>
          <time dateTime={item.publishedAt}>{formatRelativeTime(item.publishedAt)}</time>
        </>
      ) : null}
      {item.readingTime ? (
        <>
          <span aria-hidden="true">·</span>
          <span>{item.readingTime} dk okuma</span>
        </>
      ) : null}
    </div>
  );
}

export default function NewsCard({ item, size = "default", priority = false }) {
  if (!item?.section) return null;

  const href = `/haber/${item.section.slug}/${item.slug}`;
  const title = size === "compact" ? (item.shortTitle ?? item.title) : item.title;

  /* ------------------------------------------------------------- COMPACT */
  if (size === "compact") {
    return (
      <article className="group border-b border-line pb-3 last:border-b-0 last:pb-0">
        <Link href={href} className="block">
          <div className="flex items-start gap-2">
            <Badges item={item} />
            <h3 className="clamp-3 text-sm font-semibold leading-snug text-ink underline-offset-2 group-hover:underline">
              {title}
            </h3>
          </div>
          <Meta item={item} className="mt-1.5" />
        </Link>
      </article>
    );
  }

  const isLead = size === "lead";

  /**
   * `h-full` + `flex-col` — grid içinde kart yüksekliği satırdaki en uzun
   * karta uyar ve metadata satırı her kartta AYNI hizada, altta kalır.
   * Bu olmadan farklı uzunluktaki başlıklar tarih/okuma süresi satırını
   * yukarı-aşağı kaydırıyordu.
   */
  return (
    <article
      className={`card-lift group flex h-full flex-col overflow-hidden rounded-brand border border-line bg-canvas ${
        isLead ? "sm:flex-row sm:items-stretch" : ""
      }`}
    >
      <Link
        href={href}
        className={isLead ? "flex flex-1 flex-col sm:flex-row" : "flex flex-1 flex-col"}
      >
        {/* Görsel: lisanslı fotoğraf varsa o, yoksa kategori grafiği.
            Her iki durumda da oran sabit → CLS yok. */}
        <SmartImage
          image={item.image ? { ...item.image, src: item.image.thumbnail ?? item.image.src } : null}
          category={item.section?.slug}
          seed={item.slug}
          alt={item.image?.alt ?? ""}
          ratio={isLead ? "16/9" : "16/9"}
          priority={priority}
          zoom
          showLabel={isLead}
          sizes={
            isLead
              ? "(max-width: 640px) 100vw, 58vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          }
          className={isLead ? "shrink-0 sm:aspect-auto sm:w-[58%]" : "shrink-0"}
        />

        <div
          className={`flex flex-1 flex-col p-4 ${
            isLead ? "sm:justify-center sm:p-6" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <Badges item={item} />
          </div>

          <h3
            className={`headline mt-2 text-ink underline-offset-2 group-hover:underline ${
              isLead ? "clamp-3 text-2xl sm:text-3xl" : "clamp-3 text-lg"
            }`}
          >
            {title}
          </h3>

          {item.summary ? (
            <p className={`mt-2 text-muted ${isLead ? "clamp-3 text-base" : "clamp-2 text-sm"}`}>
              {item.summary}
            </p>
          ) : null}

          {/* `mt-auto` — metadata her kartta dibe yapışır, hizalı kalır. */}
          <Meta item={item} className="mt-auto pt-3" />
        </div>
      </Link>
    </article>
  );
}
