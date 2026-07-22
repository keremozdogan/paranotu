import siteConfig from "~/site.config";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Kullanım Şartları",
  description: `${siteConfig.name} kullanım şartları.`,
  path: "/sartlar",
});

/** ŞABLON SAYFA — yayına almadan önce hukuki kontrolden geçir. */
export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Kullanım Şartları
      </h1>

      <div className="prose-site mt-8">
        <p className="rounded-brand border border-amber-200 bg-amber-50 p-4 text-sm not-italic">
          <strong>Not (yayına almadan önce sil):</strong> Bu bir şablondur;
          yayımlamadan önce kendi koşullarına göre düzenle ve hukuki kontrolden
          geçir.
        </p>

        <h2>İçeriğin niteliği</h2>
        <p>{siteConfig.seo.disclaimer}</p>
        <p>
          Yazılardaki örnek tutar ve oranlar yayım tarihindeki koşullara göre
          hazırlanmıştır; kendi durumun için karar vermeden önce güncel verileri
          ve gerekiyorsa bir uzman görüşünü kontrol et.
        </p>

        <h2>Telif</h2>
        <p>
          Sitedeki içerikler {siteConfig.name} tarafından hazırlanmıştır.
          Kaynak göstermek ve bağlantı vermek koşuluyla kısa alıntılar
          yapılabilir; içeriğin tamamının izinsiz kopyalanması yasaktır.
        </p>

        <h2>Sorumluluk sınırı</h2>
        <p>
          İçeriklerin kullanımından doğabilecek doğrudan veya dolaylı
          zararlardan {siteConfig.name} sorumlu tutulamaz.
        </p>

        <h2>Değişiklikler</h2>
        <p>
          Bu şartlar önceden bildirilmeksizin güncellenebilir. Güncel sürüm her
          zaman bu sayfada yayımlanır.
        </p>
      </div>
    </div>
  );
}
