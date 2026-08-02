"use client";

/**
 * İçindekiler — okunan başlığı IntersectionObserver ile vurgular.
 * Başlık id'leri `extractHeadings()` ve rehype-slug tarafından üretilir.
 */

import { useEffect, useState } from "react";

export default function TableOfContents({ headings = [] }) {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      /* Üst şerit yüksekliği kadar boşluk bırak; başlık ekranın üst
         üçte birine girdiğinde aktif sayılsın. */
      { rootMargin: "-88px 0px -66% 0px", threshold: 0 },
    );

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav aria-label="İçindekiler" className="rounded-brand border border-line bg-canvas p-5">
      <h2 className="text-xs font-bold uppercase tracking-wider text-ink">
        İçindekiler
      </h2>
      <ol className="mt-3 space-y-1.5 text-sm">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
            <a
              href={`#${h.id}`}
              aria-current={activeId === h.id ? "location" : undefined}
              /* min-h-6 → WCAG 2.5.8 asgari 24px dokunma alanı.
                 py-0.5 tek başına 21px veriyordu. */
              className={`flex min-h-6 items-center border-l-2 py-0.5 pl-3 leading-snug transition-colors ${
                activeId === h.id
                  ? "border-primary-500 font-medium text-primary-700"
                  : "border-transparent text-muted hover:border-line hover:text-ink"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
