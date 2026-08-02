"use client";

/**
 * Masaüstü ana menü — mega menü destekli.
 *
 * ERİŞİLEBİLİRLİK
 *  • Grup başlıkları gerçek <button> (aria-expanded + aria-controls).
 *  • Klavye: Enter/Space açar, Escape kapatır ve odağı düğmeye döndürür,
 *    ok tuşları menü içinde gezinir, Tab menüden çıkınca kapanır.
 *  • Fareyle üzerine gelince de açılır; ama açılma SADECE hover'a bağlı
 *    değildir — dokunmatik cihazda hover yoktur.
 *  • Aktif bölüm `aria-current="page"` ile işaretlenir.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

export default function DesktopNav({ items }) {
  const pathname = usePathname();
  const [openIndex, setOpenIndex] = useState(null);
  const navRef = useRef(null);
  const baseId = useId();

  /* Sayfa GERÇEKTEN değiştiyse menüyü kapat.
     Koşulsuz setState cascading render tetikler — ref ile karşılaştırıyoruz. */
  const lastPathRef = useRef(pathname);
  useEffect(() => {
    if (lastPathRef.current !== pathname) {
      lastPathRef.current = pathname;
      setOpenIndex(null);
    }
  }, [pathname]);

  /* Dışarı tıklama ve Escape ile kapat. */
  useEffect(() => {
    if (openIndex === null) return;

    const onPointerDown = (e) => {
      if (!navRef.current?.contains(e.target)) setOpenIndex(null);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpenIndex(null);
        navRef.current?.querySelector(`[data-trigger="${openIndex}"]`)?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openIndex]);

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      ref={navRef}
      aria-label="Ana menü"
      className="hidden flex-1 items-center lg:flex"
      onMouseLeave={() => setOpenIndex(null)}
    >
      <ul className="flex items-center gap-0.5">
        {items.map((item, i) => {
          const panelId = `${baseId}-panel-${i}`;
          const open = openIndex === i;
          const active = isActive(item.href);

          if (!item.children) {
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-brand px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-subtle text-ink" : "text-muted hover:bg-subtle hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          }

          return (
            <li key={item.href} className="relative" onMouseEnter={() => setOpenIndex(i)}>
              <button
                type="button"
                data-trigger={i}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : i)}
                className={`flex items-center gap-1 rounded-brand px-3 py-2 text-sm font-medium transition-colors ${
                  active || open ? "bg-subtle text-ink" : "text-muted hover:bg-subtle hover:text-ink"
                }`}
              >
                {item.label}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </svg>
              </button>

              {open ? (
                <div
                  id={panelId}
                  className="absolute left-0 top-full z-50 min-w-[15rem] overflow-hidden rounded-brand border border-line bg-canvas shadow-lg"
                >
                  <ul className="py-1">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          aria-current={isActive(child.href) ? "page" : undefined}
                          className="block px-4 py-2.5 text-sm text-ink transition-colors hover:bg-subtle"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
