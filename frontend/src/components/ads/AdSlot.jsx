/**
 * ============================================================================
 *  <AdSlot /> — reklam alanı çekirdeği
 * ============================================================================
 *  Sitedeki HER reklam alanı bu bileşenden türer. Gerçek reklam ağı
 *  bağlandığında SAYFA BİLEŞENLERİNE DOKUNULMAZ — yalnızca bu dosyadaki
 *  `renderNetworkUnit()` doldurulur.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  ÜÇ DURUM
 *  ────────────────────────────────────────────────────────────────────────
 *    1. Reklam ağı aktif + slot ID tanımlı → gerçek reklam birimi
 *    2. Ağ yok ama placeholder açık        → temsili alan
 *    3. İkisi de yok                        → HİÇBİR ŞEY render edilmez
 *
 *  3. durumda boş bir kutu bile bırakılmaz; aksi halde production'da
 *  sayfada anlamsız boşluklar kalırdı.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  CLS — sıfır olmak zorunda
 *  ────────────────────────────────────────────────────────────────────────
 *  Her yerleşimin SABİT bir `minHeight` değeri vardır ve alan reklam
 *  yüklenmeden önce ayrılır. Reklam gelmezse alan kontrollü biçimde
 *  kapanır (bileşen null döner), sonradan içerik itilmez.
 *
 *  ⚠️ `minHeight` değerlerini rastgele değiştirme — IAB standart reklam
 *  boyutlarına göre seçildiler. Küçültürsen reklam geldiğinde sayfa zıplar.
 * ============================================================================
 */

import siteConfig from "~/site.config";
import AdSenseUnit from "@/components/AdSenseUnit";

/* -------------------------------------------------------------------------- */
/*  Ortam bayrakları                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Reklam ağı gerçekten bağlı mı?
 * `site.config.js → ads.enabled` + geçerli publisher ID gerekir.
 */
export function adsEnabled() {
  const { ads } = siteConfig;
  if (process.env.NEXT_PUBLIC_ADS_ENABLED === "false") return false;
  return Boolean(ads?.enabled && ads?.client);
}

/**
 * Temsili placeholder gösterilsin mi?
 *
 * Varsayılan: geliştirmede AÇIK, production'da KAPALI.
 * `NEXT_PUBLIC_AD_PLACEHOLDERS_ENABLED` ile ikisi de ezilebilir —
 * demo/sahne ortamında yerleşimi göstermek için kullanışlı.
 */
export function placeholdersEnabled() {
  const flag = process.env.NEXT_PUBLIC_AD_PLACEHOLDERS_ENABLED;
  if (flag === "true") return true;
  if (flag === "false") return false;
  /* site.config açıkça istiyorsa ona da saygı duy (geriye dönük uyum). */
  if (siteConfig.ads?.showPlaceholders) return true;
  return process.env.NODE_ENV !== "production";
}

/* -------------------------------------------------------------------------- */
/*  Yerleşim ön ayarları                                                      */
/* -------------------------------------------------------------------------- */

/**
 * `minHeight` değerleri IAB standart boyutlarından gelir:
 *   leaderboard 728×90 · billboard 970×250 · rectangle 300×250
 *   halfPage 300×600 · mobileBanner 320×100
 *
 * `maxWidth` reklamın içerik genişliğini aşmasını engeller — mobilde
 * yatay taşmanın en yaygın sebebi budur.
 */
export const AD_PLACEMENTS = {
  homeTop: {
    slotKey: "headerBelow",
    label: "Reklam",
    format: "horizontal",
    minHeight: 90,
    minHeightDesktop: 250,
    maxWidth: 970,
    teaser: "Marka İş Birliği Alanı",
  },
  inFeed: {
    slotKey: "listInline",
    label: "Reklam",
    format: "rectangle",
    minHeight: 250,
    maxWidth: 728,
    teaser: "Finansal Ürünleri Karşılaştırın",
  },
  sidebar: {
    slotKey: "sidebar",
    label: "Reklam",
    format: "vertical",
    minHeight: 250,
    minHeightDesktop: 600,
    maxWidth: 300,
    teaser: "Sponsorlu Finans İçeriği",
  },
  inArticle: {
    slotKey: "inArticle",
    label: "Reklam",
    format: "fluid",
    layout: "in-article",
    minHeight: 250,
    maxWidth: 680,
    teaser: "Bütçenizi Daha İyi Yönetin",
  },
  contentEnd: {
    slotKey: "footer",
    label: "Reklam",
    format: "horizontal",
    minHeight: 90,
    minHeightDesktop: 250,
    maxWidth: 728,
    teaser: "Reklam Alanı",
  },
  mobileSticky: {
    slotKey: "mobileSticky",
    label: "Reklam",
    format: "horizontal",
    minHeight: 50,
    maxWidth: 480,
    teaser: "Reklam Alanı",
  },
};

/* -------------------------------------------------------------------------- */
/*  Temsili placeholder                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Temsili reklam alanı.
 *
 * ⚠️ TASARIM KISITLARI — bunlar keyfi değil:
 *   • Gerçek marka adı, logo veya kampanya YOK. Sahte bir kampanya
 *     göstermek, gerçek bir markayı taklit etmeye dönüşür.
 *   • Haber kartına BENZEMEZ: kesikli kenarlık, farklı zemin, farklı
 *     tipografi. Okur bunu editoryal içerik sanmamalı (spec §13).
 *   • Tıklanabilir değil — yanlışlıkla tıklama üretmez.
 *   • Nötr renkler; dikkat çekmeye çalışmaz.
 */
function AdPlaceholder({ preset, label }) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-brand border border-dashed border-line bg-subtle/50 px-4 py-5 text-center"
      /* Placeholder içeriği dekoratiftir; ekran okuyucuya
         dış <aside> zaten "Reklam alanı" diyor. */
      aria-hidden="true"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted/70">
        {label ?? preset.label}
      </span>
      <span className="text-sm font-medium text-muted">{preset.teaser}</span>
      <span className="text-[11px] text-muted/60">Temsili alan — reklam ağı bağlı değil</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Gerçek reklam birimi                                                      */
/* -------------------------------------------------------------------------- */

/**
 * ============================================================================
 *  GERÇEK REKLAM AĞI ENTEGRASYON NOKTASI
 * ============================================================================
 *  AdSense dışında bir ağ (GAM, Ezoic, Media.net…) bağlanacaksa TEK
 *  değiştirilecek yer burasıdır. Sayfalarda hiçbir şey değişmez.
 *
 *  Beklenen sözleşme: sabit yükseklikli bir kap döndür; script yüklemesi
 *  viewport'a girene kadar ERTELENMELİ (lazy) ki ana thread bloke olmasın.
 * ============================================================================
 */
function renderNetworkUnit({ preset, slotId, minHeightClass }) {
  const { ads } = siteConfig;

  /* Şu an yalnızca AdSense destekleniyor. */
  if (ads.provider === "adsense" || !ads.provider) {
    return (
      <AdSenseUnit
        client={ads.client}
        slot={slotId}
        format={preset.format}
        layout={preset.layout}
        minHeightClass={minHeightClass}
      />
    );
  }

  /* Bilinmeyen sağlayıcı — sessizce hiçbir şey çizme, sahte alan bırakma. */
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Ana bileşen                                                               */
/* -------------------------------------------------------------------------- */

/**
 * @param {object}  props
 * @param {string}  props.placement       AD_PLACEMENTS anahtarı
 * @param {string} [props.slotId]         Ağ slot ID'si (yoksa config'ten)
 * @param {string} [props.label]          Görünen etiket ("Reklam")
 * @param {boolean}[props.enabled]        false → hiç render etme
 * @param {boolean}[props.desktopVisible]
 * @param {boolean}[props.tabletVisible]
 * @param {boolean}[props.mobileVisible]
 * @param {number} [props.minHeight]      Ön ayarı ez
 * @param {number} [props.maxWidth]       Ön ayarı ez
 * @param {string} [props.className]
 */
export default function AdSlot({
  placement = "inFeed",
  slotId,
  label,
  enabled = true,
  desktopVisible = true,
  tabletVisible = true,
  mobileVisible = true,
  minHeight,
  maxWidth,
  className = "",
}) {
  const preset = AD_PLACEMENTS[placement] ?? AD_PLACEMENTS.inFeed;
  if (!enabled) return null;

  const networkReady = adsEnabled();
  const resolvedSlotId = slotId ?? siteConfig.ads?.slots?.[preset.slotKey];
  const showReal = networkReady && resolvedSlotId;
  const showPlaceholder = !showReal && placeholdersEnabled();

  /* Ne gerçek reklam ne placeholder → alanı hiç açma (boş kutu bırakma). */
  if (!showReal && !showPlaceholder) return null;

  /**
   * Responsive görünürlük. Tailwind sınıfları STATİK yazılmalı —
   * şablon dizesiyle üretilen sınıflar derlemede taranmaz.
   */
  const visibility = [
    mobileVisible ? "block" : "hidden",
    tabletVisible ? "sm:block" : "sm:hidden",
    desktopVisible ? "lg:block" : "lg:hidden",
  ].join(" ");

  const baseMin = minHeight ?? preset.minHeight;
  const deskMin = preset.minHeightDesktop ?? baseMin;
  const width = maxWidth ?? preset.maxWidth;

  return (
    <aside
      /* Ekran okuyucu için açık etiket — reklam olduğu gizlenmez (§17). */
      aria-label="Reklam alanı"
      role="complementary"
      className={`${visibility} my-8 w-full ${className}`}
    >
      <div className="mx-auto w-full" style={{ maxWidth: `${width}px` }}>
        {/*
          Alan reklam gelmeden ÖNCE ayrılır. `minHeight` inline style ile
          veriliyor çünkü değer ön ayardan geliyor ve Tailwind'in statik
          tarayıcısı dinamik sınıf üretemez.
        */}
        <div
          className="flex w-full items-center justify-center"
          style={{ minHeight: `${baseMin}px`, "--ad-min-desktop": `${deskMin}px` }}
        >
          {showReal ? (
            renderNetworkUnit({
              preset,
              slotId: resolvedSlotId,
              minHeightClass: "",
            })
          ) : (
            <AdPlaceholder preset={preset} label={label} />
          )}
        </div>
      </div>
    </aside>
  );
}
