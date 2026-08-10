"use client";

/**
 * ============================================================================
 *  MOBİL MENÜ
 * ============================================================================
 *  Önceki sürümde düzeltilen sorunlar:
 *
 *  1. ODAK TUZAĞI YOKTU — menü açıkken Tab'lamak arkadaki sayfaya geçiyordu.
 *     Ekran okuyucu ve klavye kullanıcısı için menü "kapanmamış" gibi
 *     davranıyordu. Artık odak panel içinde döner.
 *
 *  2. KAYDIRMA KİLİDİ YATAY SIÇRAMA ÜRETİYORDU — `overflow: hidden`
 *     kaydırma çubuğunu kaldırınca sayfa genişliği değişip içerik zıplıyordu.
 *     Artık `scrollbar-gutter: stable` ile birlikte uygulanıyor (globals.css
 *     `.scroll-locked`).
 *
 *  3. LINT HATASI — effect gövdesinde senkron `setState` cascading render
 *     tetikliyordu. Menü kapatma artık `pathname` değişimini bir ref ile
 *     karşılaştırıyor, koşulsuz setState yapmıyor.
 *
 *  4. `<dialog>` yerine rol tabanlı panel: iOS Safari'de `<dialog>`
 *     kaydırma davranışı hâlâ tutarsız.
 * ============================================================================
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import ThemeToggle from "@/components/ThemeToggle";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function MobileNav({ items }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef(null);
  const triggerRef = useRef(null);
  const lastPathRef = useRef(pathname);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  /* Sayfa GERÇEKTEN değiştiyse kapat.
     (Koşulsuz setState yerine ref karşılaştırması — cascading render yok.) */
  useEffect(() => {
    if (lastPathRef.current !== pathname) {
      lastPathRef.current = pathname;
      setOpen(false);
    }
  }, [pathname]);

  /* Arka plan kaydırma kilidi. */
  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add("scroll-locked");
    return () => document.documentElement.classList.remove("scroll-locked");
  }, [open]);

  /* Escape + odak tuzağı. */
  useEffect(() => {
    if (!open) return;

    /* Panel açılınca ilk odaklanabilir öğeye git. */
    const first = panelRef.current?.querySelector(FOCUSABLE);
    first?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;

      const nodes = panelRef.current?.querySelectorAll(FOCUSABLE);
      if (!nodes?.length) return;

      const list = Array.from(nodes);
      const firstEl = list[0];
      const lastEl = list[list.length - 1];

      /* Odağı panel içinde çevir. */
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
        /* 44×44 px — WCAG 2.5.8 asgari dokunma alanı */
        className="inline-flex h-11 w-11 items-center justify-center rounded-brand text-muted transition-colors hover:bg-subtle hover:text-ink"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open ? (
        <>
          {/* Arka plan — tıklayınca kapanır. Ayrı bir odaklanabilir öğe değil. */}
          <div
            className="fixed inset-0 top-14 z-40 bg-ink/20"
            onClick={close}
            aria-hidden="true"
          />

          <div
            id="mobile-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menüsü"
            className="fixed inset-x-0 top-14 bottom-0 z-40 overflow-y-auto overscroll-contain border-t border-line bg-canvas px-4 py-5"
          >
            <nav aria-label="Mobil menü">
              <ul className="flex flex-col gap-1">
                {items.map((item) =>
                  item.children ? (
                    <li key={item.label} className="mt-3 first:mt-0">
                      <h2 className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                        {item.label}
                      </h2>
                      <ul className="flex flex-col">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              aria-current={pathname === child.href ? "page" : undefined}
                              className="flex min-h-11 items-center rounded-brand px-3 text-base text-ink transition-colors hover:bg-subtle"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ) : (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={pathname === item.href ? "page" : undefined}
                        className="flex min-h-11 items-center rounded-brand px-3 text-base font-medium text-ink transition-colors hover:bg-subtle"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>

            {/* Tema seçici — başlıkta yalnızca sm ve üzeri görünüyor,
                mobilde erişilebilir tek yer burası. */}
            <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Tema
              </span>
              <ThemeToggle />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
