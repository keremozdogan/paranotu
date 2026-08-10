"use client";

/**
 * ============================================================================
 *  YAPAY ZEKÂ ÖZET PANELİ — sağdan açılan çekmece
 * ============================================================================
 *  Haber sayfasında bir düğme; tıklanınca sağ kenardan panel açılır ve
 *  haberin özetini gösterir.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  TASARIM KARARLARI
 *  ────────────────────────────────────────────────────────────────────────
 *  • İSTEK TIKLAMAYLA ATILIR, sayfa açılışında değil. Her haber görüntülemesi
 *    için model çalıştırmak, okurun çoğu hiç kullanmayacakken maliyeti
 *    görüntüleme sayısına bağlar.
 *  • Sonuç bileşen içinde tutulur; panel kapanıp açılırsa yeniden istek
 *    atılmaz.
 *  • Panel içerik akışını KAPATMAZ, üzerine gelir — okur özeti okuyup
 *    kapatınca kaldığı yerde kalır.
 *  • Rozet zorunlu: politika gereği yapay zekâ çıktısı etiketlenir
 *    (bkz. /yapay-zeka-politikasi).
 * ============================================================================
 */

import { useCallback, useEffect, useRef, useState } from "react";

/** Kıvılcım — yapay zekâ ikonu. */
const SparkIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" fill="currentColor" opacity=".7" />
  </svg>
);

/** Özet metnini biçimlendirir: satırları paragraf ve maddeye ayırır. */
function OzetMetni({ text }) {
  const satirlar = text.split("\n").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="space-y-2.5">
      {satirlar.map((satir, i) => {
        const madde = /^[-•*]\s+/.test(satir);
        if (madde) {
          return (
            <p key={i} className="flex gap-2 text-sm leading-relaxed text-ink">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-600" />
              <span>{satir.replace(/^[-•*]\s+/, "")}</span>
            </p>
          );
        }
        return (
          <p key={i} className="text-sm leading-relaxed text-ink">
            {satir}
          </p>
        );
      })}
    </div>
  );
}

export default function AiSummaryPanel({ slug, title }) {
  const [acik, setAcik] = useState(false);
  const [durum, setDurum] = useState("bos"); // bos | yukleniyor | hazir | hata
  const [ozet, setOzet] = useState("");
  const panelRef = useRef(null);
  const acanRef = useRef(null);

  const getir = useCallback(async () => {
    setDurum("yukleniyor");
    try {
      const yanit = await fetch("/api/ai/ozet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const veri = await yanit.json();
      if (!yanit.ok || !veri?.ok) {
        setDurum("hata");
        return;
      }
      setOzet(veri.text);
      setDurum("hazir");
    } catch {
      setDurum("hata");
    }
  }, [slug]);

  const ac = () => {
    acanRef.current = document.activeElement;
    setAcik(true);
    /* Sonuç zaten elimizdeyse yeniden isteme. */
    if (durum === "bos" || durum === "hata") getir();
  };

  const kapat = useCallback(() => {
    setAcik(false);
    const geri = acanRef.current;
    if (geri && typeof geri.focus === "function") geri.focus();
  }, []);

  /* Escape ile kapat. */
  useEffect(() => {
    if (!acik) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") kapat();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [acik, kapat]);

  /* Açılınca panele odaklan — klavye kullanıcısı içeriğe girsin. */
  useEffect(() => {
    if (acik) panelRef.current?.focus();
  }, [acik]);

  return (
    <>
      <button
        type="button"
        onClick={ac}
        aria-expanded={acik}
        className="inline-flex items-center gap-2 rounded-brand border border-accent-300 bg-accent-50 px-3 py-2 text-sm font-semibold text-accent-800 transition-colors hover:border-accent-500 hover:bg-accent-100"
      >
        <SparkIcon width="16" height="16" />
        Yapay zekâ ile özetle
      </button>

      {acik ? (
        <>
          {/* Karartma — başlığın altında kalır (arama kutusuyla aynı sıra). */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={kapat}
            role="presentation"
          />

          <aside
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Yapay zekâ özeti"
            className="fixed right-0 top-0 z-[60] flex h-full w-full max-w-md flex-col border-l border-line bg-canvas shadow-2xl outline-none sm:w-[26rem]"
          >
            <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-accent-700">
                  <SparkIcon width="14" height="14" />
                  Yapay zekâ özeti
                </p>
                <p className="clamp-2 mt-1 text-sm font-semibold text-ink">{title}</p>
              </div>
              <button
                type="button"
                onClick={kapat}
                aria-label="Özeti kapat"
                className="shrink-0 rounded-brand p-1.5 text-muted transition-colors hover:bg-subtle hover:text-ink"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {durum === "yukleniyor" ? (
                <div className="space-y-3" aria-live="polite">
                  <p className="text-sm text-muted">Özet hazırlanıyor…</p>
                  {/* İskelet — bekleme sırasında sayfa boş durmasın. */}
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-3 animate-pulse rounded bg-subtle" style={{ width: `${90 - i * 12}%` }} />
                  ))}
                </div>
              ) : null}

              {durum === "hata" ? (
                <div aria-live="polite">
                  <p className="text-sm text-ink">Özet şu anda üretilemedi.</p>
                  <button
                    type="button"
                    onClick={getir}
                    className="mt-3 rounded-brand border border-line px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-subtle"
                  >
                    Tekrar dene
                  </button>
                </div>
              ) : null}

              {durum === "hazir" ? <OzetMetni text={ozet} /> : null}
            </div>

            {/*
              ETİKET — politika gereği zorunlu.
              "Yapay zekâ çıktısı etiketlenir" kuralının arayüzdeki karşılığı
              bu satır. Kaldırma.
            */}
            <footer className="border-t border-line bg-subtle px-5 py-3">
              <p className="text-xs leading-relaxed text-muted">
                Bu özet yapay zekâ tarafından, yalnızca yukarıdaki haber metnine
                dayanarak üretildi. Haberin kendisinin yerine geçmez; tereddütte
                haberi okuyun. Yatırım tavsiyesi değildir.
              </p>
            </footer>
          </aside>
        </>
      ) : null}
    </>
  );
}
