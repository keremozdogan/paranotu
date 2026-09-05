"use client";

/**
 * ============================================================================
 *  OKUMA İLERLEMESİ + BAŞA DÖN
 * ============================================================================
 *  Uzun haber ve rehberlerde iki küçük ama gerçek UX kazancı:
 *    1. Üstte ince bir ilerleme çizgisi — "ne kadar kaldı?" sorusunu yanıtlar.
 *    2. Yeterince aşağı inildiğinde beliren "başa dön" düğmesi.
 *
 *  NEDEN TEK BİLEŞEN?
 *  İkisi de aynı kaydırma olayını dinliyor. Ayrı bileşen olsalardı sayfada
 *  iki ayrı scroll listener çalışırdı; burada tek `requestAnimationFrame`
 *  döngüsü ikisini birden besliyor.
 *
 *  PERFORMANS
 *    • Listener `passive: true` — kaydırmayı bloklamaz.
 *    • Çizgi `transform: scaleX()` ile çizilir; `width` DEĞİL. Genişlik
 *      animasyonu her karede layout tetikler, scaleX GPU'da kalır.
 *    • Ölçüm rAF içinde yapılır, olay başına bir kez.
 *
 *  ERİŞİLEBİLİRLİK
 *    • İlerleme çizgisi tamamen dekoratiftir (`aria-hidden`) — okuyucuya
 *      "yüzde 43" diye seslenmek bilgi değil gürültüdür.
 *    • Başa dön GERÇEK bir <button>, klavyeyle odaklanılır ve etiketlidir.
 *    • `prefers-reduced-motion` seçiliyse yumuşak kaydırma yerine anında
 *      atlar; çizgi geçiş animasyonu da kapanır.
 * ============================================================================
 */

import { useEffect, useRef, useState } from "react";

export default function ReadingProgress() {
  const barRef = useRef(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const doc = document.documentElement;
      /* Kaydırılabilir toplam mesafe. Sayfa ekrandan kısaysa 0'a bölmeyi
         önlemek için alt sınır 1. */
      const scrollable = Math.max(doc.scrollHeight - window.innerHeight, 1);
      const y = window.scrollY;
      const ratio = Math.min(Math.max(y / scrollable, 0), 1);

      if (barRef.current) barRef.current.style.transform = `scaleX(${ratio})`;
      /* Bir buçuk ekran aşağı inilmeden düğme görünmez — kısa sayfada
         "başa dön" gereksiz gürültüdür. */
      setShowTop(y > window.innerHeight * 1.5);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const toTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <>
      {/* İlerleme çizgisi — header'ın hemen altına sabitlenir. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent"
      >
        <div
          ref={barRef}
          className="h-full origin-left bg-accent-500 will-change-transform motion-safe:transition-transform motion-safe:duration-100"
          style={{ transform: "scaleX(0)" }}
        />
      </div>

      {/* Başa dön — sağ altta, içeriğin üstünü kapatmayacak konumda. */}
      <button
        type="button"
        onClick={toTop}
        aria-label="Sayfanın başına dön"
        className={`fixed bottom-5 right-5 z-40 inline-flex h-10 w-10 items-center justify-center rounded-brand border border-line bg-canvas text-ink shadow-lg motion-safe:transition-all motion-safe:duration-200 hover:border-accent-300 ${
          showTop ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M10 15.5V4.5M4.5 10L10 4.5L15.5 10" />
        </svg>
      </button>
    </>
  );
}
