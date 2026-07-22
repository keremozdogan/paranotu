"use client";

/**
 * Gerçek AdSense birimi. Yalnızca <AdBanner /> tarafından, reklamlar
 * site.config.js'te açıkken render edilir.
 *
 * AdSense script'i bir kez <Scripts /> içinde yüklenir; burada sadece
 * ilgili <ins> bloğu doldurulur.
 */

import { useEffect, useRef } from "react";

export default function AdSenseUnit({
  client,
  slot,
  format = "auto",
  layout,
  minHeightClass = "",
}) {
  const ref = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    /* React 18+ StrictMode dev'de effect'i iki kez çalıştırır —
       aynı <ins> için iki push "already have ads" hatası verir. */
    if (pushed.current) return;
    if (!ref.current) return;
    if (ref.current.getAttribute("data-adsbygoogle-status")) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* Reklam engelleyici veya script yüklenmedi — sessizce geç. */
    }
  }, []);

  return (
    <ins
      ref={ref}
      className={`adsbygoogle block w-full ${minHeightClass}`}
      style={{ display: "block" }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      {...(layout ? { "data-ad-layout": layout } : {})}
      data-full-width-responsive="true"
    />
  );
}
