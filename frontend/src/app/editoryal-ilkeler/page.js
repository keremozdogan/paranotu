/**
 * EDİTORYAL İLKELER — /editoryal-ilkeler
 *
 * Bu metin sitenin GERÇEK çalışma biçimini anlatır. Uygulama değişirse
 * (örneğin lisanslı bir haber servisi bağlanırsa) metin de güncellenmelidir —
 * yazdığın ilkeyi uygulamıyorsan ilke değil, süs olur.
 */

import Link from "next/link";

import PolicyPage from "@/components/PolicyPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Editoryal İlkeler",
  description:
    "ParaNotu'nun haber seçimi, kaynak kullanımı, veri doğrulama ve bağımsızlık ilkeleri.",
  path: "/editoryal-ilkeler",
});

export default function EditorialPolicyPage() {
  return (
    <PolicyPage
      title="Editoryal İlkeler"
      description="Neyi, nasıl ve hangi kaynaklara dayanarak yayımladığımız."
      path="/editoryal-ilkeler"
    >
      <h2>Temel yaklaşım</h2>
      <p>
        ParaNotu&apos;nun amacı ekonomiyi <strong>sade ve doğru</strong> anlatmak. Bir haberi
        hızlı yayımlamakla doğru yayımlamak arasında seçim gerektiğinde doğruyu seçeriz.
        Teyit edilmemiş bir bilgiyi &quot;iddia&quot; etiketiyle bile olsa manşete taşımayız.
      </p>

      <h2>Kaynak önceliği</h2>
      <p>Bir bilgiyi yayımlarken kaynakları şu sırayla değerlendiririz:</p>
      <ol>
        <li>
          <strong>Resmî kurumlar</strong> — TÜİK, TCMB, Hazine ve Maliye Bakanlığı, Çalışma ve
          Sosyal Güvenlik Bakanlığı, Resmî Gazete, SPK, KAP.
        </li>
        <li>
          <strong>Birincil kaynaklar</strong> — kurumun kendi açıklaması, tebliğ metni, bilanço
          dosyası; haberin kendisi değil, haberin dayandığı belge.
        </li>
        <li>
          <strong>Lisanslı haber ve veri servisleri</strong>.
        </li>
        <li>
          <strong>Güvenilir ulusal ve uluslararası yayınlar</strong> — kaynak göstererek.
        </li>
        <li>
          <strong>Editoryal olarak eklenen kendi içeriğimiz</strong> — analiz ve rehberler.
        </li>
      </ol>

      <h2>Rakamlar tek kaynaktan gelir</h2>
      <p>
        Sitedeki her resmî rakam (enflasyon, asgari ücret, politika faizi, vergi dilimleri) tek
        bir doğrulanmış veri dosyasından beslenir. Yazıların içine sabit sayı yazılmaz. Böylece
        bir rakam değiştiğinde site genelinde aynı anda güncellenir; eski veriyle kalan sayfa
        oluşmaz.
      </p>
      <p>Her rakam bir güven seviyesi taşır:</p>
      <ul>
        <li>
          <strong>Doğrulandı</strong> — birincil/resmî kaynaktan teyit edildi, yayımlanabilir.
        </li>
        <li>
          <strong>Teyit bekliyor</strong> — tutarlı ikincil kaynaklar var, birincil kaynaktan
          doğrulanmalı. Arayüzde işaretlenir.
        </li>
        <li>
          <strong>Doğrulanmadı</strong> — yayımlanmaz.
        </li>
      </ul>

      <h2>Piyasa verisi ve &quot;canlı&quot; ifadesi</h2>
      <p>
        &quot;Canlı&quot;, &quot;anlık&quot; ve &quot;son dakika&quot; ifadelerini yalnızca veri
        gerçekten bu niteliğe sahipse kullanırız. Piyasa verilerinde <strong>kaynak</strong> ve{" "}
        <strong>gecikme süresi</strong> her zaman görünür biçimde belirtilir.
      </p>
      <p>
        Bir veri sağlayıcısı bağlı değilse tahmini veya eski değer göstermeyiz; ne olduğunu
        açıkça yazarız. Yanlış bir fiyat göstermek, hiç göstermemekten çok daha zararlıdır —
        okur buna göre karar veriyor.
      </p>

      <h2>Telif ve alıntı</h2>
      <p>
        Başka bir yayının içeriğini tam metin olarak yeniden yayımlamayız. Alıntı yaptığımızda
        kaynağı görünür biçimde belirtir ve orijinal içeriğe bağlantı veririz. Kaynakta
        bulunmayan bir bilgiyi üretmeyiz.
      </p>

      <h2>Görseller</h2>
      <p>
        Haber görselleri editoryal içerikle bağlantılı olmalıdır; dekoratif amaçla rastgele
        görsel kullanmayız. Her görselin <strong>kredisi zorunludur</strong> — kaynağı
        belirtilmemiş bir görsel sistemimizde yayımlanamaz. Başka sitelerin görsellerini
        kopyalamaz veya izinsiz bağlantı vermeyiz.
      </p>

      <h2>Bağımsızlık ve çıkar çatışması</h2>
      <p>
        Reklam ve sponsorlu içerik, editoryal içerikten görsel olarak ayrılır ve açıkça
        etiketlenir. Reklam veren, haber seçimine veya içeriğine müdahale edemez.
      </p>

      <h2>Yatırım tavsiyesi değildir</h2>
      <p>
        ParaNotu&apos;daki içerikler genel bilgilendirme amaçlıdır ve yatırım tavsiyesi niteliği
        taşımaz. Alım-satım kararlarını kendi araştırman ve gerekiyorsa yetkili bir danışmanla
        birlikte vermelisin.
      </p>

      <h2>Hata bildirimi</h2>
      <p>
        Bir hata fark edersen bize bildir. Nasıl düzelttiğimiz{" "}
        <Link href="/duzeltme-politikasi">Düzeltme Politikası</Link> sayfasında yazıyor.
      </p>
    </PolicyPage>
  );
}
