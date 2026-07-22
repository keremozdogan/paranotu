import Link from "next/link";

import EnflasyonHesaplayici from "@/components/tools/EnflasyonHesaplayici";
import Disclaimer from "@/components/mdx/Disclaimer";
import AdBanner from "@/components/AdBanner";
import { RakamTablosu } from "@/components/mdx/Rakam";
import { buildMetadata, JsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/format";

export const metadata = buildMetadata({
  title: "Maaşın Enflasyona Yenildi mi? Hesaplayıcı",
  description:
    "İki maaş tutarını gir, alım gücündeki gerçek değişimi hesapla. Nominal zam ile reel zam arasındaki farkı güncel TÜFE oranıyla gösterir.",
  path: "/araclar/enflasyon-hesaplayici",
  keywords: [
    "enflasyon hesaplama",
    "reel maaş hesaplama",
    "maaş enflasyon karşılaştırma",
    "alım gücü hesaplama",
  ],
});

export default function EnflasyonHesaplayiciPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", path: "/" },
          { name: "Araçlar", path: "/araclar" },
          { name: "Enflasyon Hesaplayıcı", path: "/araclar/enflasyon-hesaplayici" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Maaş Enflasyon Hesaplayıcı",
          url: absoluteUrl("/araclar/enflasyon-hesaplayici"),
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
        }}
      />

      <nav aria-label="Konum" className="text-xs text-muted">
        <Link href="/araclar" className="hover:text-primary-600">
          Araçlar
        </Link>
      </nav>

      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Maaşın enflasyona yenildi mi?
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted">
        Zam aldın ama alım gücün gerçekten arttı mı? İki maaş tutarını gir,
        aradaki reel farkı gör.
      </p>

      <div className="mt-8">
        <EnflasyonHesaplayici />
      </div>

      {/* Reklam, hesaplayıcıdan belirgin boşlukla ayrılmıştır (AdSense
          kaza-tıklaması politikası). */}
      <div className="mt-16">
        <AdBanner placement="inArticle" className="my-0" />
      </div>

      <section className="prose-site mt-12">
        <h2>Nominal artış ile reel artış farkı</h2>
        <p>
          <strong>Nominal artış</strong>, hesabına yatan rakamın büyümesidir.{" "}
          <strong>Reel artış</strong> ise alım gücündeki gerçek değişimdir —
          yani aynı parayla eskisi kadar şey alabiliyor musun?
        </p>
        <p>
          Enflasyonun yüksek olduğu dönemlerde bu iki sayı ciddi biçimde ayrışır.
          Maaşın rakam olarak artmışken alım gücün azalmış olabilir.
        </p>

        <h2>Hesaplama formülü</h2>
        <p>Hesaplayıcı şu formülü kullanır:</p>
        <pre>
          <code>reel = ((1 + nominal) / (1 + enflasyon)) − 1</code>
        </pre>
        <p>
          Sık kullanılan <code>nominal − enflasyon</code> kestirmesi düşük
          enflasyonda yeterince yakın sonuç verir, ancak enflasyon yükseldikçe
          sapma büyür. Bu yüzden tam formül tercih edilmiştir.
        </p>

        <RakamTablosu
          ids={["tufeYillik", "tufeAylik", "cekirdekYillik", "tcmbYilSonuTahmini"]}
          baslik="Hesaplamada kullanılan güncel veriler"
        />

        <h2>Hangi enflasyon oranını kullanmalıyım?</h2>
        <ul>
          <li>
            <strong>Yıllık TÜFE</strong> — bir yıl öncesiyle karşılaştırma
            yapıyorsan bu oranı kullan. Hesaplayıcıda varsayılan olarak gelir.
          </li>
          <li>
            <strong>Çekirdek enflasyon</strong> — gıda ve enerji gibi oynak
            kalemleri dışarıda bırakır; eğilimi görmek için kullanılır.
          </li>
          <li>
            <strong>Kendi sepetin</strong> — harcamalarının dağılımı ortalamadan
            çok farklıysa (örneğin gelirinin yarısı kiraysa), hissettiğin
            enflasyon resmî orandan yüksek olabilir. Oranı elle değiştirebilirsin.
          </li>
        </ul>

        <h2>Sonuç negatifse ne yapmalı?</h2>
        <p>
          Reel kaybın varsa, bunu bütçe tarafında telafi etmek gerekir. Sıradaki
          adım genelde en büyük gider kalemine bakmak:{" "}
          <Link href="/araclar/butce-hesaplayici">bütçe hesaplayıcı</Link> ile
          gerçek oranını çıkar, sonra{" "}
          <Link href="/blog/asgari-ucretle-50-30-20-kurali">
            50/30/20 kuralının Türkiye koşullarına nasıl uyarlanacağını
          </Link>{" "}
          incele.
        </p>
      </section>

      <Disclaimer />
    </div>
  );
}
