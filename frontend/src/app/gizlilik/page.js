import siteConfig from "~/site.config";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Gizlilik Politikası",
  description: `${siteConfig.name} gizlilik politikası ve çerez kullanımı.`,
  path: "/gizlilik",
});

/**
 * ŞABLON SAYFA — AdSense başvurusu için gizlilik politikası zorunludur.
 * Yayına almadan önce bir hukukçuya kontrol ettir ve kendi durumuna göre
 * düzenle; buradaki metin hukuki tavsiye değildir.
 */
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Gizlilik Politikası
      </h1>

      <div className="prose-site mt-8">
        <p className="rounded-brand border border-amber-200 bg-amber-50 p-4 text-sm not-italic">
          <strong>Not (yayına almadan önce sil):</strong> Bu bir şablondur.
          Toplanan verileri, kullandığın araçları ve yasal dayanağını kendi
          durumuna göre güncelle; yayımlamadan önce hukuki kontrolden geçir.
        </p>

        <h2>Toplanan veriler</h2>
        <ul>
          <li>
            <strong>Bülten aboneliği:</strong> Yalnızca verdiğin e-posta adresi
            saklanır ve içerik bildirimi dışında kullanılmaz.
          </li>
          <li>
            <strong>İletişim formu:</strong> Ad, e-posta ve mesaj içeriği yalnızca
            talebini yanıtlamak için işlenir.
          </li>
          <li>
            <strong>Ölçümleme:</strong> Sayfa görüntülenmeleri toplu (anonim)
            olarak analiz edilir.
          </li>
        </ul>

        <h2>Çerezler ve reklamlar</h2>
        <p>
          Sitede Google AdSense üzerinden reklam gösterilebilir. Google ve iş
          ortakları, ilgi alanına dayalı reklam sunmak için çerez kullanabilir.
          Kişiselleştirilmiş reklamları{" "}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Reklam Ayarları
          </a>{" "}
          üzerinden kapatabilirsin.
        </p>

        <h2>Üçüncü taraf bağlantılar</h2>
        <p>
          İçeriklerde dış sitelere bağlantı verilebilir. Bu sitelerin gizlilik
          uygulamalarından sorumlu değiliz.
        </p>

        <h2>Haklarını kullanma</h2>
        <p>
          Verilerinin silinmesini veya düzeltilmesini istiyorsan{" "}
          {siteConfig.social.email ? (
            <a href={`mailto:${siteConfig.social.email}`}>
              {siteConfig.social.email}
            </a>
          ) : (
            "iletişim sayfası"
          )}{" "}
          üzerinden bize yaz.
        </p>
      </div>
    </div>
  );
}
