"use client";

/**
 * İstemci tarafı arama. Backend gerektirmez — `getSearchIndex()` ile
 * üretilen hafif indeks prop olarak gelir.
 *
 * İçerik binlerce yazıya çıkarsa bu indeksi .NET tarafına taşıyıp
 * services/api.js üzerinden sorgulamak daha doğru olur.
 */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** Türkçe karakterleri normalize ederek karşılaştırma yapar. */
function normalize(value) {
  const map = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", i̇: "i" };
  return String(value)
    .toLocaleLowerCase("tr")
    .replace(/[çğıöşü]/g, (ch) => map[ch] ?? ch);
}

export default function SearchDialog({ index = [] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  /* Kapatma tek yerden — hem paneli kapatır hem aramayı temizler,
     böylece bir sonraki açılış boş kutuyla başlar. */
  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  /* Ctrl/Cmd + K ile aç */
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  /* Açılınca arama alanına odaklan.
     Aramayı temizleme işi `close()` içine taşındı — effect gövdesinde
     koşulsuz setState cascading render tetikliyordu. */
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (q.length < 2) return [];
    return index
      .map((post) => {
        const haystackTitle = normalize(post.title);
        const haystackBody = normalize(
          `${post.description} ${post.category} ${(post.tags || []).join(" ")}`,
        );
        let score = 0;
        if (haystackTitle.includes(q)) score += 10;
        if (haystackTitle.startsWith(q)) score += 5;
        if (haystackBody.includes(q)) score += 3;
        return { post, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.post);
  }, [query, index]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ara"
        className="flex items-center gap-2 rounded-lg border border-line px-2.5 py-1.5 text-sm text-muted transition-colors hover:border-primary-300 hover:text-ink sm:px-3"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="hidden sm:inline">Ara</span>
        <kbd className="hidden rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted lg:inline">
          ⌘K
        </kbd>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 p-4 pt-[10vh] backdrop-blur-sm"
          onClick={close}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Yazılarda ara"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-brand border border-line bg-canvas shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-muted">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Yazılarda ara…"
                className="w-full bg-transparent py-4 text-base text-ink outline-none placeholder:text-muted"
              />
            </div>

            <div className="max-h-[55vh] overflow-y-auto">
              {query.trim().length >= 2 && results.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted">
                  “{query}” için sonuç bulunamadı.
                </p>
              ) : null}

              {results.map((post) => (
                <Link
                  key={post.href ?? post.slug}
                  /* Yol indeksten gelir — bileşen haber/rehber ayrımını bilmez. */
                  href={post.href ?? `/blog/${post.slug}`}
                  onClick={close}
                  className="block border-b border-line px-4 py-3 last:border-b-0 hover:bg-subtle"
                >
                  <span className="flex items-baseline gap-2">
                    {post.kind ? (
                      <span className="shrink-0 rounded-brand bg-subtle px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                        {post.kind}
                      </span>
                    ) : null}
                    <span className="text-sm font-semibold text-ink">{post.title}</span>
                  </span>
                  <span className="mt-0.5 block line-clamp-1 text-xs text-muted">
                    {post.description}
                  </span>
                </Link>
              ))}

              {query.trim().length < 2 ? (
                <p className="px-4 py-8 text-center text-sm text-muted">
                  Aramak için en az 2 karakter yaz.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
