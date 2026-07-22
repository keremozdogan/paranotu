import siteConfig from "~/site.config";
import Newsletter from "@/components/Newsletter";
import AdBanner from "@/components/AdBanner";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Hakkında",
  description: `${siteConfig.name} neden var, içerikler nasıl hazırlanıyor?`,
  path: "/hakkinda",
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Hakkında
      </h1>

      <div className="prose-site mt-8">
        <p>
          <strong>{siteConfig.name}</strong>, {siteConfig.tagline.toLowerCase()}.
          Amacımız finansı karmaşık terimlerle değil, bugün uygulayabileceğin
          küçük adımlarla anlatmak.
        </p>

        <h2>Ben kimim?</h2>
        <p>
          Merhaba, ben <strong>{siteConfig.authors.editor.name}</strong>. Mesleğim
          yazılım — işim gereği günlerimi karmaşık sistemleri anlaşılır parçalara
          ayırarak geçiriyorum. Bir süredir aynı şeyi kişisel finans için yapmaya
          çalışıyorum: konuyu ürkütücü terimlerden arındırıp, insanın gerçekten
          uygulayabileceği adımlara indirgemek.
        </p>
        <p>
          Bu merak yeni değil. Çocukken bir bisiklet istemiştim; ailemden isteyip
          almak yerine biriktirmeye karar verdim. Harçlığımı ikiye böldüm — yarısı
          günlük harcamalara, yarısı bir kutuya. Aylar sürdü ve o süreçte asıl
          öğrendiğim şey bisikletin kendisi değildi: <em>küçük ama düzenli bir
          tutarın, büyük ama düzensiz bir niyetten daha güçlü olduğuydu.</em> O
          bisikleti aldığımda kazandığım asıl şey, bir alışkanlıktı.
        </p>
        <p>
          Bu sitede yaptığım şey de aslında bu: kendi öğrendiklerimi, denediğim
          yöntemleri ve yolda karşılaştığım hataları yazıya dökmek. İnsanların
          işine yarayan bir şey üretmek, bence yapılabilecek en keyifli işlerden
          biri — birinin bütçesini biraz olsun rahatlatabildiysem, bu yazılar
          amacına ulaşmış demektir.
        </p>
        <p>
          Finans danışmanı değilim ve öyleymiş gibi de davranmıyorum. Burada
          okuduğun her şey, araştırılmış ve sade anlatılmış <em>bilgi</em>; kararı
          her zaman sen vereceksin.
        </p>

        <h2>Kimin için?</h2>
        <p>
          Öğrenciler, yeni mezunlar ve ilk maaşını almış herkes. Yani birikimin
          “ay sonunda kalan para” değil, planlanmış bir alışkanlık olması gereken
          herkes.
        </p>

        <h2>İçerikler nasıl hazırlanıyor?</h2>
        <ul>
          <li>Her rehber tek bir soruya odaklanır ve uygulanabilir adımla biter.</li>
          <li>Sayısal örnekler gerçekçi tutarlarla verilir.</li>
          <li>Güncelliğini yitiren yazılar tarih notuyla güncellenir.</li>
        </ul>

        <h2>Önemli uyarı</h2>
        <p>{siteConfig.seo.disclaimer}</p>

        <h2>İletişim</h2>
        <p>
          Soru, öneri veya iş birliği için{" "}
          {siteConfig.social.email ? (
            <a href={`mailto:${siteConfig.social.email}`}>{siteConfig.social.email}</a>
          ) : (
            "iletişim sayfasını"
          )}{" "}
          kullanabilirsin.
        </p>
      </div>

      <AdBanner placement="inArticle" />

      {siteConfig.features.newsletter ? (
        <div className="mt-10">
          <Newsletter source="about" />
        </div>
      ) : null}
    </div>
  );
}
