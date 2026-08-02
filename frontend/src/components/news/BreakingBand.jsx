"use client";

/**
 * ============================================================================
 *  SON DAKİKA BANDI
 * ============================================================================
 *  Kritik haberleri gösteren tek satırlık bant.
 *
 *  HAREKET KURALLARI (spec §5, §10):
 *   • Tek haber varsa HİÇ hareket etmez — dönecek bir şey yok.
 *   • Birden fazlaysa 7 saniyede bir yumuşak geçiş yapar (hızlı ticker değil).
 *   • Fare üzerine gelince, içindeki bir bağlantı odaklanınca veya dokununca
 *     DURUR — kullanıcı okurken kaymaz.
 *   • Görünür bir duraklat/oynat düğmesi vardır (WCAG 2.2.2: 5 saniyeden uzun
 *     süren otomatik hareket için kullanıcı kontrolü zorunludur).
 *   • `prefers-reduced-motion: reduce` → otomatik dönüş HİÇ başlamaz,
 *     bant listeye döner ve tüm başlıklar aynı anda görünür.
 *   • Sekme arka plandayken zamanlayıcı çalışmaz (pil/CPU).
 *
 *  Bant `aria-live` KULLANMAZ: otomatik dönen içeriği ekran okuyucuya sürekli
 *  duyurmak rahatsız edicidir. Bunun yerine normal, gezinilebilir bir liste
 *  olarak işaretlenir.
 * ============================================================================
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { formatRelativeTime } from "@/lib/format";

const ROTATE_MS = 7000;

/** Kullanıcı hareket azaltma istiyor mu? (değişimi de dinler) */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return reduced;
}

export default function BreakingBand({ items = [] }) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef(null);

  const multiple = items.length > 1;
  /* Hareket azaltma açıkken otomatik dönüş hiç kurulmaz. */
  const rotating = multiple && !reducedMotion && !paused;

  useEffect(() => {
    if (!rotating) return;

    const tick = () => setIndex((i) => (i + 1) % items.length);
    let timer = window.setInterval(tick, ROTATE_MS);

    /* Sekme arka plandayken durdur, geri gelince yeniden kur. */
    const onVisibility = () => {
      window.clearInterval(timer);
      if (!document.hidden) timer = window.setInterval(tick, ROTATE_MS);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [rotating, items.length]);

  if (items.length === 0) return null;

  /* Hareket azaltmada: dönüş yok, hepsi kaydırılabilir şeritte. */
  const showAll = reducedMotion && multiple;
  const visible = showAll ? items : [items[index]];

  return (
    <section
      aria-label="Son dakika"
      ref={containerRef}
      className="border-b border-line bg-negative-soft"
      /* Okurken kaymasın: üzerine gelince veya içeride odak varken dur. */
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget)) setPaused(false);
      }}
      onTouchStart={() => setPaused(true)}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6">
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-brand bg-negative px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
          Son Dakika
        </span>

        <ul className={showAll ? "scroll-strip flex flex-1 gap-6" : "min-w-0 flex-1"}>
          {visible.map((item) => (
            <li key={item.slug} className={showAll ? "shrink-0" : "min-w-0"}>
              <Link
                href={`/haber/${item.section.slug}/${item.slug}`}
                className="group flex items-baseline gap-2 text-sm"
              >
                <span className="truncate font-medium text-ink underline-offset-2 group-hover:underline">
                  {item.shortTitle ?? item.title}
                </span>
                {item.publishedAt ? (
                  <time
                    dateTime={item.publishedAt}
                    className="hidden shrink-0 text-xs text-muted sm:inline"
                  >
                    {formatRelativeTime(item.publishedAt)}
                  </time>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>

        {/* Duraklat/oynat — sadece gerçekten dönen bir şey varsa. */}
        {multiple && !reducedMotion ? (
          <div className="flex shrink-0 items-center gap-2">
            <span aria-hidden="true" className="hidden text-[11px] text-muted sm:inline">
              {index + 1}/{items.length}
            </span>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Son dakika akışını sürdür" : "Son dakika akışını duraklat"}
              className="rounded-brand p-1 text-muted transition-colors hover:bg-canvas hover:text-ink"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                {paused ? <path d="M8 5v14l11-7z" /> : <path d="M6 5h4v14H6zM14 5h4v14h-4z" />}
              </svg>
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
