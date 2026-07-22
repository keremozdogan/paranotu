import Link from "next/link";

import figures, {
  tufeHistory,
  sonrakiAciklama,
  dataReviewedAt,
  bazYiliNotu,
} from "~/content/data/figures";
import EnflasyonGrafik from "@/components/EnflasyonGrafik";
import Disclaimer from "@/components/mdx/Disclaimer";
import AdBanner from "@/components/AdBanner";
import Newsletter from "@/components/Newsletter";
import { buildMetadata, JsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { formatDate, absoluteUrl } from "@/lib/format";

export const metadata = buildMetadata({
  title: "Güncel Enflasyon Oranları (TÜFE)",
  description: `Türkiye'de güncel yıllık ve aylık enflasyon oranları, çekirdek enflasyon ve aylık TÜFE serisi. Resmî kaynaklara dayalı, her ay güncellenen takip sayfası.`,
  path: "/enflasyon",
  keywords: [
    "güncel enflasyon",
    "TÜFE",
    "yıllık enflasyon oranı",
    "aylık enflasyon",
    "çekirdek enflasyon",
    "enflasyon oranı 2026",
  ],
});

/* Aylık açıklama takvimine uyum için günlük tazele. */
export const revalidate = 86400;

function BuyukRakam({ figure, vurgu = false }) {
  return (
    <div
      className={`rounded-brand border p-5 text-center ${
        vurgu ? "border-accent-200 bg-accent-50" : "border-line bg-canvas"
      }`}
    >
      <span className="block text-xs font-medium uppercase tracking-wide text-muted">
        {figure.label}
      </span>
      <span
        className={`mt-1 block font-mono font-bold tabular-nums ${
          vurgu ? "text-4xl text-accent-700" : "text-3xl text-ink"
        }`}
      >
        {figure.display}
      </span>
      <span className="mt-1 block text-[11px] text-muted">{figure.period}</span>
    </div>
  );
}

export default function EnflasyonPage() {
  const { tufeYillik, tufeAylik, cekirdekYillik, tcmbYilSonuTahmini, politikaFaizi } =
    figures;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", path: "/" },
          { name: "Enflasyon", path: "/enflasyon" },
        ])}
      />
      {/* Veri kümesi olarak işaretlemek, arama motorlarının bu sayfayı
          "güncel veri" olarak anlamasına yardım eder. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: "Türkiye Tüketici Fiyat Endeksi (TÜFE) aylık takip",
          description:
            "Türkiye'de aylık ve yıllık tüketici enflasyonu ile çekirdek enflasyon serisi.",
          url: absoluteUrl("/enflasyon"),
          temporalCoverage: tufeHistory.length
            ? `${tufeHistory[tufeHistory.length - 1].donem}/${tufeHistory[0].donem}`
            : undefined,
          dateModified: dataReviewedAt,
          isAccessibleForFree: true,
          creator: { "@type": "Organization", name: "TÜİK" },
          spatialCoverage: { "@type": "Place", name: "Türkiye" },
        }}
      />

      <header className="border-b border-line pb-8">
        <nav aria-label="Konum" className="text-xs text-muted">
          <Link href="/" className="hover:text-primary-600">
            Ana Sayfa
          </Link>
        </nav>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Güncel Enflasyon Oranları
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          Türkiye&apos;de en son açıklanan TÜFE verileri, aylık seri ve bu
          rakamların bütçen açısından ne anlama geldiği. Tüm veriler resmî
          kaynaklara bağlıdır ve her açıklama sonrası güncellenir.
        </p>
      </header>

      {/* -------------------------------------------------- BÜYÜK RAKAMLAR */}
      <section className="mt-8" aria-labelledby="son-veriler">
        <h2 id="son-veriler" className="sr-only">
          Son açıklanan veriler
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <BuyukRakam figure={tufeYillik} vurgu />
          <BuyukRakam figure={tufeAylik} />
          <BuyukRakam figure={cekirdekYillik} />
        </div>

        <p className="mt-3 text-xs text-muted">
          Kaynak:{" "}
          <a
            href={tufeYillik.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 underline underline-offset-2 hover:text-primary-700"
          >
            {tufeYillik.source}
          </a>{" "}
          · {tufeYillik.period} verisi,{" "}
          <time dateTime={tufeYillik.announcedAt}>
            {formatDate(tufeYillik.announcedAt)}
          </time>{" "}
          tarihinde açıklandı.
        </p>
      </section>

      {/* ------------------------------------------- SONRAKİ AÇIKLAMA */}
      <aside className="mt-6 flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-brand border border-line bg-subtle/60 p-4">
        <span className="text-sm font-semibold text-ink">
          Sıradaki açıklama:
        </span>
        <span className="text-sm text-muted">
          {sonrakiAciklama.donem} verileri —{" "}
          <time dateTime={sonrakiAciklama.tarih}>
            {formatDate(sonrakiAciklama.tarih)}
          </time>
          {sonrakiAciklama.kesin ? null : " (tahmini)"}
        </span>
        <span className="w-full text-xs text-muted/80">
          TÜİK, TÜFE verilerini genellikle her ayın başında açıklıyor. Kesin
          tarih için TÜİK yayın takvimini kontrol et.
        </span>
      </aside>

      <AdBanner placement="headerBelow" />

      {/* ------------------------------------------------------- GRAFİK */}
      <section className="mt-4" aria-labelledby="seri">
        <h2 id="seri" className="mb-4 text-xl font-bold tracking-tight text-ink">
          Aylık seri
        </h2>
        <EnflasyonGrafik history={tufeHistory} />
      </section>

      {/* -------------------------------------------------------- TABLO */}
      <section className="mt-10" aria-labelledby="tablo">
        <h2 id="tablo" className="mb-4 text-xl font-bold tracking-tight text-ink">
          Veri tablosu
        </h2>

        <div className="overflow-x-auto rounded-brand border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-subtle/60 text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Dönem</th>
                <th className="px-4 py-3 text-right font-semibold">Aylık</th>
                <th className="px-4 py-3 text-right font-semibold">Yıllık</th>
                <th className="px-4 py-3 text-right font-semibold">Çekirdek</th>
                <th className="px-4 py-3 font-semibold">Kaynak</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {tufeHistory.map((row) => (
                <tr key={row.donem} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3 font-medium text-ink">{row.label}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    %{row.aylik?.toLocaleString("tr-TR") ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">
                    %{row.yillik?.toLocaleString("tr-TR") ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-muted">
                    {row.cekirdek ? `%${row.cekirdek.toLocaleString("tr-TR")}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={row.kaynak}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 underline underline-offset-2 hover:text-primary-700"
                    >
                      bağlantı
                    </a>
                    {row.guven !== "high" ? (
                      <span
                        title="İkincil kaynak — birincil kaynaktan teyit edilmeli"
                        className="ml-1.5 text-[10px] text-amber-600"
                      >
                        ⚠
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ------------------------------------------------------ AÇIKLAMA */}
      <section className="prose-site mt-12">
        <h2>TÜFE nedir?</h2>
        <p>
          <strong>TÜFE (Tüketici Fiyat Endeksi)</strong>, hanehalkının satın
          aldığı mal ve hizmetlerden oluşan bir sepetin fiyat değişimini ölçer.
          Bu sepet gıdadan kiraya, ulaşımdan giyime kadar geniş bir kapsamı
          içerir ve harcama ağırlıklarına göre hesaplanır.
        </p>
        <ul>
          <li>
            <strong>Aylık TÜFE</strong> — bir önceki aya göre değişim. Kısa
            vadeli hareketleri gösterir, mevsimsellikten etkilenir.
          </li>
          <li>
            <strong>Yıllık TÜFE</strong> — bir önceki yılın aynı ayına göre
            değişim. Genelde &quot;enflasyon oranı&quot; denince kastedilen budur.
          </li>
          <li>
            <strong>Çekirdek enflasyon (C endeksi)</strong> — gıda, enerji, alkol,
            tütün ve altın gibi oynak kalemler dışlanarak hesaplanır. Enflasyonun
            ana eğilimini görmek için kullanılır.
          </li>
        </ul>

        <h2>Neden hissettiğim enflasyon farklı?</h2>
        <p>
          TÜFE <em>ortalama</em> bir sepeti ölçer. Senin harcama dağılımın bu
          ortalamadan farklıysa, hissettiğin enflasyon resmî orandan sapabilir.
        </p>
        <p>
          En yaygın örnek kira: gelirinin yarısını kiraya veren bir kiracı için,
          kira artışı kişisel enflasyonu ortalamanın çok üstüne çıkarabilir. Aynı
          şekilde arabası olmayan biri akaryakıt artışından daha az etkilenir.
        </p>
        <p>
          Bu yüzden{" "}
          <Link href="/araclar/enflasyon-hesaplayici">
            enflasyon hesaplayıcısında
          </Link>{" "}
          oranı elle değiştirebiliyorsun — kendi sepetine daha yakın bir oran
          kullanmak, maaşının reel değişimini daha doğru gösterir.
        </p>

        <h2>Politika faizi ile ilişkisi</h2>
        <p>
          TCMB politika faizi şu an <strong>{politikaFaizi.display}</strong> (
          {politikaFaizi.period}). Merkez bankaları enflasyonu hedeflenen
          seviyeye çekmek için politika faizini bir araç olarak kullanır.
        </p>
        <p>
          TCMB&apos;nin {tcmbYilSonuTahmini.period} kapsamında açıkladığı 2026 yıl
          sonu enflasyon tahmini <strong>{tcmbYilSonuTahmini.display}</strong>.
          Bunun bir <em>tahmin</em> olduğunu, gerçekleşme olmadığını unutma.
        </p>

        <h2>Bu rakamlar bütçen için ne anlama geliyor?</h2>
        <p>Yüksek enflasyon dönemlerinde üç pratik sonuç ortaya çıkıyor:</p>
        <ol>
          <li>
            <strong>Bütçeyi 3 ayda bir güncelle.</strong> Yılda bir yapılan bütçe
            planı, aynı market sepetinin fiyatı değiştiği için birkaç ay içinde
            geçersizleşiyor.
          </li>
          <li>
            <strong>Birikimi tutarla değil oranla belirle.</strong> &quot;Ayda
            5.000 ₺&quot; hedefi her yıl reel olarak küçülür; &quot;gelirimin
            %20&apos;si&quot; hedefi kendini korur.
          </li>
          <li>
            <strong>Nominal zam ile reel zamı ayır.</strong> Maaşın rakam olarak
            artmışken alım gücün azalmış olabilir.
          </li>
        </ol>
        <p>
          Bu üçünün nasıl uygulanacağını{" "}
          <Link href="/blog/asgari-ucretle-50-30-20-kurali">
            asgari ücretle bütçe kurma rehberinde
          </Link>{" "}
          rakamlarla anlattık.
        </p>

        <h2>Veriler ne sıklıkla güncelleniyor?</h2>
        <p>
          TÜİK, TÜFE verilerini kural olarak <strong>her ayın 3&apos;ünde saat
          10:00&apos;da</strong> bir önceki ay için açıklıyor. 3&apos;ü hafta
          sonu veya resmî tatile denk gelirse ilk iş gününe kayıyor.
        </p>
        <p>
          Takvim iş gününde bile kayabiliyor: Mayıs 2026 verisi, Kurban Bayramı
          tatilinin veri toplama süresini kısaltması nedeniyle 3 Haziran yerine
          5 Haziran&apos;da açıklandı. Bu yüzden yukarıdaki tarihi kesin değil,
          beklenen tarih olarak veriyoruz.
        </p>
        <p>
          Bu sayfadaki rakamlar her açıklama sonrası elden geçiriliyor; en son
          kontrol tarihi{" "}
          <time dateTime={dataReviewedAt}>{formatDate(dataReviewedAt)}</time>.
          Tablodaki her satır doğrulandığı kaynağa bağlıdır.
        </p>

        <h2>Baz yılı değişikliği (Ocak 2026)</h2>
        <p>
          TÜİK, Ocak 2026&apos;dan itibaren TÜFE&apos;nin baz yılını{" "}
          <strong>{bazYiliNotu.eskiBaz}</strong>&apos;den{" "}
          <strong>{bazYiliNotu.yeniBaz}</strong>&apos;e çevirdi. Bu, Avrupa
          Birliği istatistik uyumu kapsamında yapılan bir güncelleme; ana
          harcama grubu sayısı da 12&apos;den 13&apos;e çıktı.
        </p>
        <p>
          Bunun pratik anlamı şu: <strong>yüzde değişim serisi kesintisizdir</strong>{" "}
          — yukarıdaki grafik ve tablo bu yüzden Ocak 2026 öncesi ve sonrasını
          birlikte gösterebiliyor. Ancak <strong>endeks seviyeleri</strong>{" "}
          (puan değerleri) baz değişikliği nedeniyle öncesi ve sonrasıyla
          karşılaştırılabilir değildir. Endeks puanlarıyla çalışıyorsan bu ayrımı
          gözet.
        </p>
      </section>

      <div className="mt-10">
        <Newsletter
          source="enflasyon"
          title="Yeni enflasyon verisi açıklandığında haberdar ol"
          description="Ayda bir, yeni TÜFE rakamı ve bunun bütçen için ne anlama geldiği."
        />
      </div>

      <Disclaimer />
    </div>
  );
}
