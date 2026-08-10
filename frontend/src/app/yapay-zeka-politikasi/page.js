/**
 * YAPAY ZEKÂ KULLANIM POLİTİKASI — /yapay-zeka-politikasi
 *
 * ⚠️ Bu metin sitenin GERÇEK uygulamasını anlatmalıdır. Yapay zekâ
 * kullanımı değişirse (örneğin otomatik özetleme devreye alınırsa) bu sayfa
 * ÖNCE güncellenmelidir. Uygulanmayan bir politika yazmak, hiç yazmamaktan
 * daha kötüdür.
 */

import Link from "next/link";

import PolicyPage from "@/components/PolicyPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Yapay Zekâ Kullanım Politikası",
  description:
    "ParaNotu'da yapay zekânın nerede kullanıldığı, nerede kullanılmadığı ve editoryal kontrolün nasıl işlediği.",
  path: "/yapay-zeka-politikasi",
});

export default function AiPolicyPage() {
  return (
    <PolicyPage
      title="Yapay Zekâ Kullanım Politikası"
      description="Yapay zekâyı nerede kullanıyoruz, nerede kullanmıyoruz ve son sözü kim söylüyor."
      path="/yapay-zeka-politikasi"
    >
      <h2>Temel kural</h2>
      <p>
        <strong>
          Yapay zekâ tarafından üretilmiş hiçbir metin, insan editör kontrolünden geçmeden
          yayımlanmaz.
        </strong>{" "}
        Yayımlanan her içeriğin sorumluluğu, adı künyede geçen kişilere aittir — bir modele
        değil.
      </p>

      <h2>Nerede kullanılabilir</h2>
      <ul>
        <li>
          <strong>Okur için haber özeti</strong> — haber sayfalarındaki &quot;Yapay zekâ ile
          özetle&quot; düğmesi. Özet <em>yalnızca</em> o haberin kendi metnine dayanır; model
          dışarıdan bilgi ekleyemez, rakam üretemez, yorum yapamaz. Çıktı her zaman yapay
          zekâ ürünü olarak etiketlenir ve haberin yerine geçmez.
        </li>
        <li>
          <strong>Günün özeti</strong> — haber listesinin başındaki paragraf. Yalnızca o gün
          yayımladığımız haberlerin başlık ve spotlarından üretilir, aynı sınırlarla ve aynı
          etiketle.
        </li>
        <li>
          <strong>Taslak ve düzenleme</strong> — metni sadeleştirme, başlık alternatifleri
          üretme, yazım denetimi.
        </li>
        <li>
          <strong>Teknik geliştirme</strong> — sitenin kodunun yazımı ve bakımı.
        </li>
        <li>
          <strong>Çeviri desteği</strong> — yabancı kaynaklı bir açıklamanın ilk çevirisi;
          yayımlanmadan önce insan tarafından kontrol edilir.
        </li>
        <li>
          <strong>Özet önerisi</strong> — uzun bir resmî belgenin ön özeti; editör belgenin
          kendisini de okur.
        </li>
      </ul>

      <h2>Nerede kullanılmaz</h2>
      <ul>
        <li>
          <strong>Rakam üretmede.</strong> Enflasyon, faiz, kur, asgari ücret gibi hiçbir sayı
          bir dil modelinden alınmaz. Her rakam resmî kaynaktan doğrulanarak girilir.
        </li>
        <li>
          <strong>Haber uydurmada.</strong> Kaynağı olmayan bir olay, açıklama veya alıntı
          üretilmez.
        </li>
        <li>
          <strong>Tahmin ve yorum üretmede.</strong> &quot;Dolar şu seviyeye çıkar&quot; türü
          öngörüler yayımlamayız.
        </li>
        <li>
          <strong>Görsel üretiminde.</strong> Gerçek bir olayı temsil ediyormuş izlenimi veren
          yapay görseller kullanılmaz. Kullanılırsa açıkça etiketlenir.
        </li>
        <li>
          <strong>Yazar kimliği uydurmada.</strong> Var olmayan yazar adı kullanmayız.
        </li>
      </ul>

      <h2>Şeffaflık</h2>
      <p>
        Bir içeriğin oluşturulmasında yapay zekâ belirgin bir rol oynadıysa bunu içerikte
        belirtiriz. Rutin düzenleme ve yazım denetimi için ayrı etiket kullanmayız — bu, imla
        denetleyicisi kullanmak gibidir.
      </p>
      <p>
        Okura gösterilen özetler her zaman etiketlidir: hem panelin altında hem günün özetinin
        altında, metnin yapay zekâ ile üretildiği ve haberin yerine geçmediği yazar. Etiketsiz
        bir yapay zekâ çıktısı yayımlamayız.
      </p>
      <p>
        Özet üretilirken haber metninin içinde modele yönelik bir talimat bulunması ihtimaline
        karşı, model o metni <em>veri</em> olarak işler; içindeki yönergeleri uygulamaz. Bu,
        dışarıdan gelen içeriğin sistemi yönlendirmesini engellemek içindir.
      </p>

      <h2>Sorumluluk</h2>
      <p>
        Yapay zekâ kaynaklı bir hata da bizim hatamızdır. Böyle bir durumda{" "}
        <Link href="/duzeltme-politikasi">Düzeltme Politikası</Link> aynen işler; &quot;model
        yanlış yaptı&quot; bir mazeret değildir.
      </p>

      <h2>Bu politika değişirse</h2>
      <p>
        Yapay zekâ kullanımımız genişlerse bu sayfa <em>önce</em> güncellenir. Sayfanın üstünde
        son güncelleme tarihi yer alır.
      </p>
    </PolicyPage>
  );
}
