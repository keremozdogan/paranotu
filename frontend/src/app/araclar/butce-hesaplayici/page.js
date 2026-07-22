import Link from "next/link";

import ButceHesaplayici from "@/components/tools/ButceHesaplayici";
import Disclaimer from "@/components/mdx/Disclaimer";
import AdBanner from "@/components/AdBanner";
import { RakamTablosu } from "@/components/mdx/Rakam";
import { buildMetadata, JsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/format";

export const metadata = buildMetadata({
  title: "Bütçe Hesaplayıcı (50/30/20)",
  description:
    "Aylık gelirini ve harcamalarını gir, 50/30/20 kuralına göre gerçek bütçe oranını anında gör. Açık veriyorsan tutarını TL olarak hesaplar. Üyelik gerekmez.",
  path: "/araclar/butce-hesaplayici",
  keywords: ["bütçe hesaplama", "50/30/20 hesaplama", "aylık bütçe planı"],
});

export default function ButceHesaplayiciPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", path: "/" },
          { name: "Araçlar", path: "/araclar" },
          { name: "Bütçe Hesaplayıcı", path: "/araclar/butce-hesaplayici" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Bütçe Hesaplayıcı (50/30/20)",
          url: absoluteUrl("/araclar/butce-hesaplayici"),
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
        Bütçe Hesaplayıcı
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted">
        Gelirini ve harcamalarını gir; 50/30/20 hedefiyle karşılaştırılmış gerçek
        oranını anında gör. Hesaplama tarayıcında yapılır, hiçbir veri
        gönderilmez.
      </p>

      <div className="mt-8">
        <ButceHesaplayici />
      </div>

      {/* Reklam, hesaplayıcıdan belirgin boşlukla ayrılmıştır.
          AdSense'in kaza-tıklaması politikası gereği etkileşimli alanın
          bitişiğine reklam konulmaz. */}
      <div className="mt-16">
        <AdBanner placement="inArticle" className="my-0" />
      </div>

      <section className="prose-site mt-12">
        <h2>50/30/20 kuralı nedir?</h2>
        <p>
          Net gelirini üç kovaya bölen bir bütçe modeli: %50 ihtiyaçlar, %30
          istekler, %20 birikim. Amacı her harcamayı tek tek düşünmek yerine üç
          sınır belirleyip karar yorgunluğunu azaltmak.
        </p>

        <h2>Oranlar tutmuyorsa ne yapmalı?</h2>
        <p>
          Türkiye&apos;de kira/gelir oranı yüksek olduğu için ihtiyaç kovası
          çoğu zaman %50&apos;yi aşıyor. Bu, kuralın işlemediği anlamına gelmez —
          oranı esnetip <strong>sıralamayı</strong> korumak yeterli: birikim, ay
          sonunda kalan para değil, ay başında ayrılan paradır.
        </p>
        <p>
          Gerçekçi bir başlangıç 60/25/15&apos;tir. Üç ay aksatmadan
          uygulayabiliyorsan birikim oranını kademeli artır.
        </p>

        <RakamTablosu ids={["asgariNet", "tufeYillik"]} baslik="Karşılaştırma için güncel veriler" />

        <h2>Hesaplama nasıl yapılıyor?</h2>
        <p>
          İhtiyaç ve istek kalemlerinin toplamı net gelirinden düşülür; kalan
          tutar birikim payıdır. Oranlar bu tutarların net gelire bölünmesiyle
          bulunur. Giderlerin gelirini aşıyorsa açık tutarı gösterilir.
        </p>

        <h2>Sonrası için</h2>
        <p>
          Bütçeni kurduktan sonra sıradaki adım, maaş gününün ertesine{" "}
          <Link href="/blog/ilk-maasimi-aldim-30-gunluk-plan">
            otomatik birikim talimatı kurmak
          </Link>
          . Enflasyonun maaşını ne kadar erittiğini görmek istersen{" "}
          <Link href="/araclar/enflasyon-hesaplayici">
            enflasyon hesaplayıcısını
          </Link>{" "}
          kullanabilirsin.
        </p>
      </section>

      <Disclaimer />
    </div>
  );
}
