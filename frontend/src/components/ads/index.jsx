/**
 * ============================================================================
 *  REKLAM BİLEŞENLERİ — adlandırılmış sarmalayıcılar
 * ============================================================================
 *  Hepsi `AdSlot` üzerine kuruludur; tekrar eden yerleşim ayarlarını
 *  kopyalamamak için var. Sayfalar bunları kullanır:
 *
 *      <BannerAdSlot />          — yatay, bölüm arası
 *      <SidebarAdSlot sticky />  — masaüstü sağ sütun
 *      <InlineAdSlot />          — yazı içi
 *      <ContentEndAdSlot />      — içerik sonu
 *      <StickyMobileAdSlot />    — mobil alt (VARSAYILAN KAPALI)
 *      <SponsoredPlaceholder />  — sponsorlu içerik kartı
 * ============================================================================
 */

import AdSlot, { adsEnabled, placeholdersEnabled, AD_PLACEMENTS } from "./AdSlot";

export { default as AdSlot, adsEnabled, placeholdersEnabled, AD_PLACEMENTS } from "./AdSlot";

/** Yatay banner — bölümler arası doğal ayrım noktalarında. */
export function BannerAdSlot(props) {
  return <AdSlot placement="homeTop" {...props} />;
}

/** Liste araları — kart akışının içinde. */
export function InFeedAdSlot(props) {
  return <AdSlot placement="inFeed" {...props} />;
}

/**
 * Masaüstü yan sütun reklamı.
 *
 * ⚠️ MOBİLDE GÖSTERİLMEZ (`mobileVisible: false`) — dar ekranda yan sütun
 * içeriğin altına düşer ve kullanıcıyı gereksiz kaydırmaya zorlar.
 *
 * `sticky` verilirse:
 *   • `top-24` → yapışkan header'ın (56px) ALTINDA kalır, çakışmaz
 *   • `max-h` + `overflow-auto` → footer'a taşmaz
 *   • Yalnızca lg ve üstünde yapışır; tablette normal akışta kalır
 */
export function SidebarAdSlot({ sticky = false, className = "", ...props }) {
  return (
    <div className={sticky ? "lg:sticky lg:top-24" : ""}>
      <AdSlot
        placement="sidebar"
        mobileVisible={false}
        tabletVisible={false}
        className={`my-0 ${className}`}
        {...props}
      />
    </div>
  );
}

/** Yazı içi reklam — paragraf akışının içinde, blok aralarında. */
export function InlineAdSlot(props) {
  return <AdSlot placement="inArticle" {...props} />;
}

/** İçerik bittikten sonra, ilgili içeriklerden önce. */
export function ContentEndAdSlot(props) {
  return <AdSlot placement="contentEnd" {...props} />;
}

/**
 * ============================================================================
 *  MOBİL YAPIŞKAN ALT REKLAM — VARSAYILAN OLARAK KAPALI
 * ============================================================================
 *  Bu bileşen hazır ama `NEXT_PUBLIC_MOBILE_STICKY_AD_ENABLED=true`
 *  verilmeden ASLA render edilmez.
 *
 *  Neden kapalı? Ekranın altına yapışan reklam:
 *    • küçük ekranda içeriğin önemli bölümünü kaplar,
 *    • yanlış tıklamaya en çok yol açan reklam biçimidir,
 *    • Google'ın "intrusive interstitial" değerlendirmesine takılabilir.
 *
 *  Açılırsa uygulanan korumalar:
 *    • Görünür kapatma düğmesi (44×44 dokunma alanı)
 *    • `env(safe-area-inset-bottom)` — çentikli ekranlarda alt çubukla
 *      çakışmaz
 *    • Düşük yükseklik (50px) — ekranı kaplamaz
 *    • Yalnızca mobilde; masaüstü ve tablette hiç çıkmaz
 * ============================================================================
 */
export function StickyMobileAdSlot({ className = "" }) {
  if (process.env.NEXT_PUBLIC_MOBILE_STICKY_AD_ENABLED !== "true") return null;
  if (!adsEnabled() && !placeholdersEnabled()) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 backdrop-blur-sm lg:hidden ${className}`}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="relative flex items-center justify-center px-10 py-1">
        <AdSlot
          placement="mobileSticky"
          desktopVisible={false}
          tabletVisible={false}
          className="my-0"
        />
        {/* Kapatma — detay etiketiyle, yeterli dokunma alanıyla. */}
        <button
          type="button"
          aria-label="Reklamı kapat"
          className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-brand text-muted hover:bg-subtle hover:text-ink"
          /* Kapatma davranışı istemci tarafında; şu an ağ bağlı olmadığı
             için görsel olarak hazır bırakıldı. */
          data-ad-dismiss
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Sponsorlu içerik kartı.
 *
 * ⚠️ Editoryal karttan GÖRSEL OLARAK AYRIŞMAK ZORUNDA (spec §13):
 * farklı kenarlık, farklı zemin ve her zaman görünür "Sponsorlu İçerik"
 * etiketi. Haber başlığı biçiminde başlık kullanmaz.
 */
export function SponsoredPlaceholder({ title = "Marka İş Birliği Alanı", className = "" }) {
  if (!placeholdersEnabled()) return null;

  return (
    <aside
      aria-label="Sponsorlu içerik alanı"
      className={`rounded-brand border border-dashed border-gold-300 bg-gold-50/60 p-4 ${className}`}
    >
      <span className="inline-flex items-center gap-1.5 rounded-brand bg-gold-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
        Sponsorlu İçerik
      </span>
      <p className="mt-2 text-sm font-medium text-gold-900">{title}</p>
      <p className="mt-1 text-xs text-gold-900/70">
        Temsili alan — marka iş birlikleri için ayrılmıştır.
      </p>
    </aside>
  );
}
