import { ImageResponse } from "next/og";
import siteConfig from "~/site.config";

/**
 * ============================================================================
 *  OTOMATİK PAYLAŞIM GÖRSELİ  —  /og?title=...&cat=...&rt=...
 * ============================================================================
 *  WhatsApp, X, LinkedIn ve Google Discover'da çıkan 1200×630 görseli
 *  kodla üretir. Elle tasarım dosyası hazırlamak gerekmez.
 *
 *  NEDEN ROUTE HANDLER, NEDEN `opengraph-image.js` DEĞİL?
 *  Next'te metadata birleştirmesi SIĞ yapılır: bir sayfa `openGraph` nesnesi
 *  tanımladığı anda kökteki `opengraph-image.js` görselini komple ezer.
 *  Sonuç olarak sadece kendi dosyası olan sayfalar görsel alıyordu.
 *  Tek bir route + sabit URL kullanmak bu tuzağı tamamen ortadan kaldırır:
 *  `buildMetadata()` her sayfa için geçerli bir adres üretebiliyor.
 *
 *  Renkler ve marka adı site.config.js'ten gelir — niş değişince görsel de
 *  kendiliğinden değişir.
 * ============================================================================
 */

export const runtime = "nodejs";

const SIZE = { width: 1200, height: 630 };

/** Uzun başlıklar kutuyu taşırmasın. */
function kirp(value, limit) {
  const s = String(value ?? "").trim();
  return s.length > limit ? s.slice(0, limit - 1).trimEnd() + "…" : s;
}

export function GET(request) {
  const { searchParams } = new URL(request.url);
  const { theme, logo, name, tagline, url } = siteConfig;

  const baslik = kirp(searchParams.get("title") || tagline, 110);
  const kategori = kirp(searchParams.get("cat"), 28);
  const okuma = searchParams.get("rt");

  /* Başlık uzadıkça punto küçülsün — taşma yerine ölçek. */
  const fontSize =
    baslik.length > 85 ? 44 : baslik.length > 60 ? 52 : baslik.length > 38 ? 60 : 68;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: theme.surface.bg,
          backgroundImage: `linear-gradient(135deg, ${theme.primary[50]} 0%, ${theme.surface.bg} 50%, ${theme.accent[50]} 100%)`,
        }}
      >
        {/* ÜST: kategori + okuma süresi */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {kategori ? (
            <div
              style={{
                display: "flex",
                padding: "10px 24px",
                borderRadius: 999,
                background: theme.primary[600],
                color: "#ffffff",
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              {kategori}
            </div>
          ) : null}
          {okuma ? (
            <div style={{ display: "flex", fontSize: 24, color: theme.surface.textMuted }}>
              {okuma} dk okuma
            </div>
          ) : null}
        </div>

        {/* ORTA: başlık */}
        <div
          style={{
            display: "flex",
            fontSize,
            fontWeight: 800,
            lineHeight: 1.18,
            letterSpacing: -1.5,
            color: theme.surface.text,
            maxWidth: 1010,
          }}
        >
          {baslik}
        </div>

        {/* ALT: marka şeridi */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `4px solid ${theme.primary[500]}`,
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: theme.primary[600],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              {(logo.text || name).charAt(0)}
            </div>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: theme.surface.text }}>
              <span>{logo.text}</span>
              <span style={{ color: theme.primary[600] }}>{logo.accentText}</span>
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 24, color: theme.surface.textMuted }}>
            {url.replace(/^https?:\/\//, "")}
          </div>
        </div>
      </div>
    ),
    {
      ...SIZE,
      headers: {
        /* Crawler'lar sık ister; uzun süre önbelleklensin. */
        "Cache-Control": "public, immutable, no-transform, max-age=31536000",
      },
    },
  );
}
