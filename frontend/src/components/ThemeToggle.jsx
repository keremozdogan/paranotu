"use client";

/**
 * ============================================================================
 *  TEMA DEĞİŞTİRİCİ — sistem / açık / koyu
 * ============================================================================
 *  Üç durumlu bilinçli bir tercihtir, iki değil:
 *
 *    sistem → kullanıcının işletim sistemi ne diyorsa o (VARSAYILAN)
 *    açık   → sistem koyu olsa bile açık
 *    koyu   → sistem açık olsa bile koyu
 *
 *  İki durumlu bir anahtar yapsaydık, "sisteme uy" seçeneği kaybolurdu:
 *  akşam olunca telefonu koyuya geçen kullanıcı sitenin de geçmesini bekler.
 *  Bir kez "açık"a basınca bu davranışı geri getirmenin yolu kalmazdı.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  HYDRATION NOTU
 *  ────────────────────────────────────────────────────────────────────────
 *  Sunucu hangi temanın seçili olduğunu BİLEMEZ (localStorage tarayıcıda).
 *  Bu yüzden ilk render'da nötr bir durum çizilir ve seçim `useEffect`
 *  içinde okunur. Sunucu çıktısıyla istemci çıktısı böylece uyuşur.
 *
 *  Temanın kendisi yine de anında doğrudur: `ThemeVars` içindeki senkron
 *  script `data-theme`'i ilk boyamadan önce koyar. Burada geç yüklenen tek
 *  şey DÜĞMENİN hangi seçeneği işaretlediğidir.
 * ============================================================================
 */

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "paranotu-theme";

/**
 * ----------------------------------------------------------------------------
 *  SEÇİMİ DIŞ KAYNAK OLARAK OKUMAK
 * ----------------------------------------------------------------------------
 *  Tema tercihi React'in dışında yaşıyor: localStorage'da. Bunu `useEffect`
 *  içinde okuyup `setState` ile içeri almak, effect'te koşulsuz setState
 *  demek olur (render → effect → render zinciri).
 *
 *  `useSyncExternalStore` tam olarak bu iş için var: sunucu anlık görüntüsü
 *  "system", istemci anlık görüntüsü localStorage'daki değer. React ikisi
 *  arasındaki farkı hydration'dan sonra kendisi uyumlar — uyarı çıkmaz.
 *
 *  Ayrıca bedava gelen bir kazanç: `storage` olayını dinlediğimiz için
 *  kullanıcı başka bir sekmede temayı değiştirdiğinde bu sekme de anında
 *  güncellenir.
 * -------------------------------------------------------------------------- */

/** Aynı sekmedeki değişikliği duyurmak için — `storage` olayı kendi
    sekmesinde tetiklenmez. */
const OLAY = "paranotu-theme-change";

function subscribe(onChange) {
  window.addEventListener("storage", onChange);
  window.addEventListener(OLAY, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(OLAY, onChange);
  };
}

function getSnapshot() {
  try {
    const kayitli = localStorage.getItem(STORAGE_KEY);
    return kayitli === "dark" || kayitli === "light" ? kayitli : "system";
  } catch {
    /* localStorage kapalı olabilir (gizli sekme, çerez engeli). */
    return "system";
  }
}

/** Sunucu localStorage'ı göremez; nötr durum çizilir. */
const getServerSnapshot = () => "system";

const SECENEKLER = [
  { value: "light", label: "Açık" },
  { value: "dark", label: "Koyu" },
  { value: "system", label: "Sistem" },
];

/** Güneş — açık tema. */
const SunIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

/** Ay — koyu tema. */
const MoonIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M20 13.4A8.2 8.2 0 0 1 10.6 4a8.4 8.4 0 1 0 9.4 9.4Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

/** Ekran — sisteme uy. */
const SystemIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <rect x="3" y="4.5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M8.5 20h7M12 16.5V20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const IKONLAR = { light: SunIcon, dark: MoonIcon, system: SystemIcon };

/** Seçimi <html> üzerine uygular. "system" ise özniteliği tamamen kaldırır. */
function uygula(secim) {
  const kok = document.documentElement;
  if (secim === "system") kok.removeAttribute("data-theme");
  else kok.setAttribute("data-theme", secim);
}

export default function ThemeToggle({ className = "" }) {
  const secim = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const sec = (deger) => {
    uygula(deger);
    try {
      if (deger === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, deger);
    } catch {
      /* Kaydedemesek de bu oturumda tema değişmiş olur. */
    }
    /* Kendi sekmemizi haberdar et — `storage` olayı burada tetiklenmez. */
    window.dispatchEvent(new Event(OLAY));
  };

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className={`inline-flex items-center gap-0.5 rounded-brand border border-line bg-subtle p-0.5 ${className}`}
    >
      {SECENEKLER.map((secenek) => {
        const Ikon = IKONLAR[secenek.value];
        const aktif = secim === secenek.value;
        return (
          <button
            key={secenek.value}
            type="button"
            role="radio"
            aria-checked={aktif}
            aria-label={`${secenek.label} tema`}
            title={`${secenek.label} tema`}
            onClick={() => sec(secenek.value)}
            className={`rounded-[calc(var(--brand-radius)-2px)] p-1.5 transition-colors ${
              aktif
                ? "bg-canvas text-ink shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            <Ikon width="16" height="16" />
          </button>
        );
      })}
    </div>
  );
}
