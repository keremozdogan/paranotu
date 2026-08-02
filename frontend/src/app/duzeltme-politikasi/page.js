import Link from "next/link";

import siteConfig from "~/site.config";
import PolicyPage from "@/components/PolicyPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Düzeltme Politikası",
  description:
    "ParaNotu'da hataları nasıl düzelttiğimiz, düzeltmeleri nasıl işaretlediğimiz ve nasıl hata bildirebileceğin.",
  path: "/duzeltme-politikasi",
});

export default function CorrectionsPolicyPage() {
  return (
    <PolicyPage
      title="Düzeltme Politikası"
      description="Hata yaptığımızda ne yaparız — sessizce silmek yerine görünür biçimde düzeltiriz."
      path="/duzeltme-politikasi"
    >
      <h2>İlke</h2>
      <p>
        Hata yapabiliriz. Önemli olan hatayı fark ettiğimizde ne yaptığımız.{" "}
        <strong>Yayımladığımız bir hatayı sessizce silmeyiz</strong> — düzeltiriz ve neyi
        düzelttiğimizi haberin içinde görünür biçimde belirtiriz.
      </p>

      <h2>Düzeltme türleri</h2>
      <h3>1. Önemli düzeltme</h3>
      <p>
        Haberin anlamını, bir rakamı veya sonucunu değiştiren hatalar. Örnek: yanlış enflasyon
        oranı, yanlış faiz kararı, yanlış atfedilen bir açıklama.
      </p>
      <p>
        Bu durumda haberin sonuna tarihli bir <strong>düzeltme notu</strong> eklenir ve
        güncelleme tarihi değiştirilir. Not, neyin yanlış olduğunu ve doğrusunun ne olduğunu
        açıkça yazar.
      </p>

      <h3>2. Küçük düzeltme</h3>
      <p>
        Yazım hatası, bozuk bağlantı, biçim sorunu gibi anlamı değiştirmeyen düzeltmeler. Bunlar
        not eklenmeden düzeltilir; içeriğin doğruluğunu etkilemez.
      </p>

      <h3>3. Geri çekme</h3>
      <p>
        Bir haberin temeli tamamen yanlışsa ve düzeltmeyle kurtarılamıyorsa haber geri çekilir.
        Sayfa silinmez — yerinde kalır ve geri çekilme gerekçesi yazılır. Sayfayı silmek,
        okurun yanlış bilgiyi düzeltilmiş olarak görmesini engeller.
      </p>

      <h2>Düzeltmeler nerede görünür?</h2>
      <p>
        Düzeltme notları haberin gövdesinin altında, ayrı ve işaretli bir kutuda gösterilir.
        Her not tarih taşır. Ayrıca haberin <em>güncellenme tarihi</em> künyede güncellenir, bu
        da arama motorlarına içeriğin değiştiğini bildirir.
      </p>

      <h2>Veri düzeltmeleri</h2>
      <p>
        Enflasyon, asgari ücret veya politika faizi gibi resmî rakamlar tek bir doğrulanmış veri
        kaynağından gelir. Bir rakam yanlışsa düzeltme o kaynakta yapılır ve rakamın geçtiği
        tüm sayfalar aynı anda güncellenir.
      </p>
      <p>
        Kurumun kendisi bir veriyi revize ederse (bu, istatistik kurumlarında normaldir) bunu
        düzeltme olarak değil, <strong>revizyon</strong> olarak işaretleriz ve ilgili sayfada
        belirtiriz.
      </p>

      <h2>Nasıl hata bildirebilirsin?</h2>
      <p>
        Bir hata gördüysen lütfen bize yaz — hangi sayfada, neyin yanlış olduğunu ve mümkünse
        doğru bilginin kaynağını belirt.
      </p>
      <p>
        {siteConfig.social?.email ? (
          <a href={`mailto:${siteConfig.social.email}`}>{siteConfig.social.email}</a>
        ) : null}
        {siteConfig.social?.email ? " · " : null}
        <Link href="/iletisim">İletişim formu</Link>
      </p>
      <p>
        Bildirilen hataları en kısa sürede inceleriz. Haklı bulunan her bildirim için düzeltme
        yapılır; bildiren kişi isterse teşekkür notunda anılır.
      </p>
    </PolicyPage>
  );
}
