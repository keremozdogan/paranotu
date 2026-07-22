import Link from "next/link";

import { buildMetadata, JsonLd, breadcrumbJsonLd } from "@/lib/seo";
import AdBanner from "@/components/AdBanner";

export const metadata = buildMetadata({
  title: "Hesaplama Araçları",
  description:
    "Bütçe, enflasyon ve maaş hesaplamalarını tarayıcında anında yap. Veri gönderilmez, kayıt gerekmez.",
  path: "/araclar",
  keywords: ["bütçe hesaplama", "enflasyon hesaplama", "maaş hesaplama"],
});

export const TOOLS = [
  {
    slug: "butce-hesaplayici",
    name: "Bütçe Hesaplayıcı",
    description:
      "Gelirini ve harcamalarını gir, 50/30/20 hedefine göre gerçek oranını gör. Açık veriyorsan ne kadar açık verdiğini TL olarak söyler.",
    icon: "M3 3v18h18M7 15l3-4 3 3 5-7",
  },
  {
    slug: "enflasyon-hesaplayici",
    name: "Maaşın Enflasyona Yenildi mi?",
    description:
      "İki maaş tutarını gir, alım gücündeki gerçek değişimi hesapla. Nominal artış ile reel artış arasındaki farkı gösterir.",
    icon: "M12 2v20M17 7H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  },
];

export default function ToolsIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", path: "/" },
          { name: "Araçlar", path: "/araclar" },
        ])}
      />

      <header className="mb-10 border-b border-line pb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Hesaplama Araçları
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          Hepsi tarayıcında çalışır. Girdiğin veriler sunucuya gönderilmez,
          kaydedilmez, üyelik istemez.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <Link
            key={tool.slug}
            href={`/araclar/${tool.slug}`}
            className="group rounded-brand border border-line bg-canvas p-6 transition-all hover:border-primary-300 hover:shadow-lg hover:shadow-primary-900/5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d={tool.icon}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h2 className="mt-4 text-lg font-bold tracking-tight text-ink transition-colors group-hover:text-primary-600">
              {tool.name}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{tool.description}</p>
          </Link>
        ))}
      </div>

      <AdBanner placement="listInline" />
    </div>
  );
}
