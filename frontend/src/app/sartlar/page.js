/**
 * KULLANIM ŞARTLARI — /sartlar
 *
 * ⚠️ HUKUKİ KONTROL GEREKİYOR
 * Metin sitenin gerçek işleyişini anlatır ancak hukuki denetimden
 * geçmemiştir. Özellikle "Uygulanacak hukuk" bölümündeki yetkili yer,
 * yayıncının gerçek yerleşim yerine göre doğrulanmalıdır.
 */

import Link from "next/link";

import siteConfig from "~/site.config";
import PolicyPage from "@/components/PolicyPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Kullanım Şartları",
  description:
    "ParaNotu içeriklerini hangi koşullarda kullanabilirsin, hesaplama araçlarının sonuçları ne anlama gelir ve sorumluluk sınırı nedir.",
  path: "/sartlar",
});

/** Metnin yürürlük tarihi. İçerik her değiştiğinde bu da güncellenmeli. */
const YURURLUK = "2026-09-05";

export default function TermsPage() {
  const eposta = siteConfig.social?.email;

  return (
    <PolicyPage
      title="Kullanım Şartları"
      description="Siteyi kullanarak aşağıdaki koşulları kabul etmiş olursun."
      path="/sartlar"
      updatedAt={YURURLUK}
    >
      <h2>İçeriğin niteliği</h2>
      <p>{siteConfig.seo.disclaimer}</p>
      <p>
        Yazılardaki örnek tutar ve oranlar yayım tarihindeki koşullara göre
        hazırlanmıştır. Vergi oranları, faiz oranları ve yasal tutarlar sık
        değişir; kendi durumun için karar vermeden önce güncel resmî verileri
        ve gerekiyorsa bir uzman görüşünü kontrol et.
      </p>
      <p>
        {siteConfig.name} yatırım danışmanlığı, vergi danışmanlığı veya hukuki
        danışmanlık hizmeti vermez. Burada okuduğun hiçbir şey kişiye özel
        tavsiye değildir.
      </p>

      <h2>Hesaplama araçları</h2>
      <p>
        Sitedeki hesaplayıcılar (bütçe, enflasyon vb.) girdiğin sayılarla
        basit matematiksel işlem yapar. Sonuçlar <strong>tahmini</strong>
        niteliktedir; banka, kurum veya resmî hesaplamalarla birebir aynı
        olmayabilir. Bağlayıcı bir tutar için ilgili kurumun kendi
        hesaplamasını esas al.
      </p>

      <h2>Kaynaklar ve doğruluk</h2>
      <p>
        İçerikler resmî kaynaklara dayandırılır ve kaynak bağlantıları
        görünür biçimde verilir. Buna rağmen hata yapabiliriz; fark ettiğimiz
        hataları{" "}
        <Link href="/duzeltme-politikasi">Düzeltme Politikası</Link>&apos;nda
        anlatıldığı şekilde açıkça düzeltiriz. Bir hata görürsen bize bildir.
      </p>
      <p>
        İçerik üretiminde yapay zekâdan nasıl yararlandığımızı{" "}
        <Link href="/yapay-zeka-politikasi">Yapay Zekâ Politikası</Link>{" "}
        sayfasında açıkladık.
      </p>

      <h2>Telif ve alıntı</h2>
      <p>
        Sitedeki içerikler {siteConfig.name} tarafından hazırlanmıştır.
        <strong> Kaynak göstermek ve bu sayfaya bağlantı vermek koşuluyla</strong>{" "}
        kısa alıntılar yapabilirsin. İçeriğin tamamının veya önemli bir
        bölümünün izinsiz kopyalanması, başka bir sitede yeniden yayımlanması
        ya da yapay zekâ modeli eğitmek üzere toplu olarak çekilmesi yasaktır.
      </p>

      <h2>Kullanıcı yükümlülükleri</h2>
      <ul>
        <li>Siteye otomatik araçlarla aşırı yük bindirmemek</li>
        <li>Güvenlik önlemlerini aşmaya çalışmamak</li>
        <li>İçeriği yanıltıcı biçimde değiştirip yeniden yayımlamamak</li>
      </ul>

      <h2>Sorumluluk sınırı</h2>
      <p>
        İçeriklerin veya hesaplama araçlarının kullanımından doğabilecek
        doğrudan ya da dolaylı zararlardan {siteConfig.name} sorumlu
        tutulamaz. Aldığın finansal kararların sorumluluğu sana aittir.
      </p>
      <p>
        Site kesintisiz ve hatasız çalışacağı taahhüdüyle sunulmaz; bakım,
        teknik arıza veya sağlayıcı kaynaklı kesintiler olabilir.
      </p>

      <h2>Dış bağlantılar</h2>
      <p>
        İçeriklerde resmî kurumların ve haber kaynaklarının sayfalarına
        bağlantı verilir. Bu sitelerin içeriğinden veya uygulamalarından
        sorumlu değiliz.
      </p>

      <h2>Uygulanacak hukuk</h2>
      <p>
        Bu şartlar Türkiye Cumhuriyeti mevzuatına tabidir. Uyuşmazlıklarda
        Türkiye Cumhuriyeti mahkemeleri yetkilidir.
      </p>

      <h2>Değişiklikler</h2>
      <p>
        Bu şartlar önceden bildirilmeksizin güncellenebilir. Güncel sürüm her
        zaman bu sayfada yayımlanır ve yukarıdaki tarih değiştirilir. Siteyi
        kullanmaya devam etmen güncel şartları kabul ettiğin anlamına gelir.
      </p>

      <h2>İletişim</h2>
      <p>
        Bu şartlarla ilgili sorular için{" "}
        {eposta ? (
          <a href={`mailto:${eposta}`}>{eposta}</a>
        ) : (
          <Link href="/iletisim">iletişim sayfası</Link>
        )}
        .
      </p>
    </PolicyPage>
  );
}
