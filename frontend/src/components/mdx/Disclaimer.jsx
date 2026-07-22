import siteConfig from "~/site.config";

/**
 * <Disclaimer />  — her finans yazısının sonuna konur.
 *
 * NEDEN ZORUNLU?
 * 6362 sayılı Sermaye Piyasası Kanunu kapsamında, bir finansal varlığın
 * alınması/satılması/elde tutulması yönünde YÖNLENDİRİCİ öneri vermek
 * "yatırım tavsiyesi" sayılır ve SPK izni gerektirir. İzinsiz yapılması
 * ağır yaptırıma tabidir.
 *
 * Bu bileşen tek başına koruma sağlamaz — asıl koruma, yazıların
 * eğitici/bilgilendirici dilde kalması ve belirli bir yatırım aracı, banka
 * ya da hisse ADI VERİLMEMESİDİR.
 *
 * Ayrıca Google'ın YMYL (Your Money or Your Life) değerlendirmesinde
 * açık feragatname bir güven (trust) sinyalidir.
 */
export default function Disclaimer({ variant = "full" }) {
  if (variant === "short") {
    return (
      <p className="my-6 rounded-brand border border-line bg-subtle/60 p-3 text-xs leading-relaxed text-muted">
        {siteConfig.seo.disclaimer}
      </p>
    );
  }

  return (
    <aside
      aria-label="Yasal uyarı"
      className="my-8 rounded-brand border border-amber-200 bg-amber-50 p-4"
    >
      <h3 className="m-0 flex items-center gap-2 text-sm font-bold text-amber-900">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Yasal uyarı
      </h3>
      <p className="mt-2 mb-0 text-[13px] leading-relaxed text-amber-900/90">
        Bu içerik <strong>genel bilgilendirme</strong> amaçlıdır; yatırım
        danışmanlığı veya finansal tavsiye niteliği taşımaz. Burada yer alan
        hesaplamalar örnek senaryolardır ve kişisel durumunuza göre değişir.
        Yatırım kararlarınızı, SPK lisanslı kuruluşlardan alacağınız
        danışmanlıkla veriniz. Vergi ve mevzuat konularında bağlayıcı bilgi
        için ilgili resmî kuruma başvurunuz.
      </p>
    </aside>
  );
}
