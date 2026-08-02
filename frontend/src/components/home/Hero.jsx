"use client";

/**
 * ============================================================================
 *  ANA SAYFA HERO
 * ============================================================================
 *  Bir büyük ana içerik + 3-4 destekleyici. Mobilde swipe, masaüstünde grid.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  ANİMASYON KARARLARI (spec §6)
 *  ────────────────────────────────────────────────────────────────────────
 *  • Ken Burns zoom: 12 saniyede scale(1) → scale(1.035). Çok yavaş ve çok
 *    küçük — bakarken fark edilmez, ama görsel "ölü" durmaz.
 *  • Zoom SADECE aktif slayta uygulanır; arka plandaki kartlar hareketsizdir
 *    (GPU'yu boşuna meşgul etmesin).
 *  • Otomatik geçiş 9 saniye. Hover, focus ve dokunuşta DURUR.
 *  • Görünür önceki/sonraki düğmeleri + duraklat düğmesi (WCAG 2.2.2).
 *  • Klavye: ← → ile gezinme, düğmeler gerçek <button>.
 *  • `prefers-reduced-motion: reduce` → zoom YOK, otomatik geçiş YOK,
 *    slaytlar dikey listeye döner ve hepsi aynı anda görünür.
 *  • Sekme arka plandayken zamanlayıcı durur.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  CLS KORUMASI
 *  ────────────────────────────────────────────────────────────────────────
 *  Hero kutusu SABİT en-boy oranına sahiptir (mobil 4/3, masaüstü 16/9).
 *  Görsel yüklenmeden de yükseklik bilinir; içerik zıplamaz.
 *  İlk görsel `priority`, diğerleri lazy.
 * ============================================================================
 */

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import CategoryArt from "@/components/media/CategoryArt";
import { formatRelativeTime } from "@/lib/format";

const ROTATE_MS = 9000;

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

function Slide({ item, active, priority, animate }) {
  /* Lisansı doğrulanmamış görsel çizilmez — kategori grafiğine düşer. */
  const usableImage = item.image?.src && item.image.rightsStatus === "cleared";

  return (
    <article className="relative h-full w-full overflow-hidden rounded-brand bg-accent-950">
      {usableImage ? (
        <Image
          src={item.image.src}
          alt={item.image.alt || ""}
          fill
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 66vw"
          style={{ objectFit: "cover", objectPosition: item.image.focalPoint ?? "50% 50%" }}
          /* Ken Burns yalnızca aktif slaytta ve hareket azaltma kapalıysa. */
          className={active && animate ? "hero-zoom" : ""}
        />
      ) : (
        <CategoryArt category={item.category} seed={item.href} />
      )}

      {/*
        Okunabilirlik katmanı — alttan yukarı doğru koyulaşan gradyan.
        Görselin ÜST kısmı büyük ölçüde açık kalır ki konu kaybolmasın
        (spec §12: "hero yazısı görselin önemli bölümünü kapatmasın").
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent"
      />

      {/*
        Metin bloğu — slayt aktif olduğunda kısa fade + translate.
        `key` yerine `active` sınıfı kullanılıyor: DOM yeniden kurulmaz,
        yalnızca animasyon tetiklenir. Böylece geçiş sırasında layout
        hesaplanmaz ve CLS oluşmaz.
      */}
      <div className={`absolute inset-x-0 bottom-0 p-5 sm:p-7 ${active ? "hero-text-in" : ""}`}>
        <div className="flex flex-wrap items-center gap-2">
          {item.badge ? (
            <span className="rounded-brand bg-negative px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
              {item.badge}
            </span>
          ) : null}
          {item.sectionLabel ? (
            <span className="rounded-brand bg-white/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              {item.sectionLabel}
            </span>
          ) : null}
        </div>

        <h2 className="headline clamp-3 mt-3 text-2xl text-white sm:text-4xl">
          <Link href={item.href} className="after:absolute after:inset-0 hover:underline">
            {item.title}
          </Link>
        </h2>

        {item.summary ? (
          <p className="clamp-2 mt-2 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
            {item.summary}
          </p>
        ) : null}

        <p className="mt-2 text-xs text-white/70">
          {item.publishedAt ? (
            <time dateTime={item.publishedAt}>{formatRelativeTime(item.publishedAt)}</time>
          ) : null}
          {item.readingTime ? <span> · {item.readingTime} dk okuma</span> : null}
        </p>
      </div>
    </article>
  );
}

export default function Hero({ primary = [], secondary = [] }) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const regionRef = useRef(null);

  const count = primary.length;
  const multiple = count > 1;
  const rotating = multiple && !reducedMotion && !paused;

  const go = useCallback(
    (delta) => setIndex((i) => (i + delta + count) % count),
    [count],
  );

  useEffect(() => {
    if (!rotating) return;
    const tick = () => setIndex((i) => (i + 1) % count);
    let timer = window.setInterval(tick, ROTATE_MS);
    const onVisibility = () => {
      window.clearInterval(timer);
      if (!document.hidden) timer = window.setInterval(tick, ROTATE_MS);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [rotating, count]);

  /* Klavye: sol/sağ ok. Bölge odaklanabilir olduğu için erişilebilir. */
  const onKeyDown = (e) => {
    if (!multiple) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  };

  if (count === 0) return null;

  /* Hareket azaltma: döndürme yok, hepsi listede. */
  const showAll = reducedMotion && multiple;

  return (
    <section aria-label="Öne çıkan içerikler" className="border-b border-line">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* ------------------------------------------------ ANA İÇERİK */}
          <div
            ref={regionRef}
            tabIndex={multiple ? 0 : -1}
            role={multiple ? "group" : undefined}
            aria-roledescription={multiple ? "karusel" : undefined}
            aria-label={multiple ? `Öne çıkan ${count} içerik` : undefined}
            onKeyDown={onKeyDown}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={(e) => {
              if (!regionRef.current?.contains(e.relatedTarget)) setPaused(false);
            }}
            onTouchStart={() => setPaused(true)}
            className="min-w-0"
          >
            {showAll ? (
              /* Hareket azaltmada: kaydırmalı şerit, hepsi erişilebilir. */
              <ul className="scroll-strip scroll-snap-strip flex gap-4">
                {primary.map((item, i) => (
                  <li key={item.href} className="aspect-[4/3] w-[88%] shrink-0 sm:aspect-[16/9]">
                    <Slide item={item} active priority={i === 0} animate={false} />
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <div className="relative aspect-[4/3] w-full sm:aspect-[16/9]">
                  {primary.map((item, i) => (
                    <div
                      key={item.href}
                      className={`absolute inset-0 transition-opacity duration-500 ease-out ${
                        i === index ? "opacity-100" : "pointer-events-none opacity-0"
                      }`}
                      aria-hidden={i !== index}
                      /* Gizli slaytlar odak sırasından çıkar. */
                      {...(i !== index ? { inert: "" } : {})}
                    >
                      <Slide item={item} active={i === index} priority={i === 0} animate />
                    </div>
                  ))}
                </div>

                {multiple ? (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    {/* Nokta göstergeleri — tıklanabilir, 44px dokunma alanı */}
                    <ul className="flex items-center gap-1">
                      {primary.map((item, i) => (
                        <li key={item.href}>
                          <button
                            type="button"
                            onClick={() => setIndex(i)}
                            aria-label={`${i + 1}. içeriğe git: ${item.title}`}
                            aria-current={i === index ? "true" : undefined}
                            className="flex h-11 w-6 items-center justify-center"
                          >
                            <span
                              aria-hidden="true"
                              className={`block h-1.5 rounded-full transition-all duration-200 ${
                                i === index ? "w-6 bg-accent-700" : "w-1.5 bg-line"
                              }`}
                            />
                          </button>
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPaused((p) => !p)}
                        aria-label={paused ? "Otomatik geçişi sürdür" : "Otomatik geçişi duraklat"}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-brand text-muted transition-colors hover:bg-subtle hover:text-ink"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          {paused ? <path d="M8 5v14l11-7z" /> : <path d="M6 5h4v14H6zM14 5h4v14h-4z" />}
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => go(-1)}
                        aria-label="Önceki içerik"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-brand text-muted transition-colors hover:bg-subtle hover:text-ink"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => go(1)}
                        aria-label="Sonraki içerik"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-brand text-muted transition-colors hover:bg-subtle hover:text-ink"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>

          {/* ------------------------------------------ DESTEKLEYİCİLER */}
          {secondary.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {secondary.slice(0, 4).map((item) => (
                <li
                  key={item.href}
                  className="card-lift rounded-brand border border-line bg-canvas p-3"
                >
                  <Link href={item.href} className="block">
                    <span className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      {item.badge ? (
                        <span className="rounded-brand bg-negative px-1.5 py-0.5 font-bold uppercase tracking-wide text-white">
                          {item.badge}
                        </span>
                      ) : null}
                      {item.sectionLabel ? (
                        <span className="font-semibold uppercase tracking-wide text-accent-700">
                          {item.sectionLabel}
                        </span>
                      ) : null}
                    </span>
                    <span className="clamp-3 mt-1 block text-sm font-semibold leading-snug text-ink">
                      {item.title}
                    </span>
                    {item.publishedAt ? (
                      <time dateTime={item.publishedAt} className="mt-1 block text-xs text-muted">
                        {formatRelativeTime(item.publishedAt)}
                      </time>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
