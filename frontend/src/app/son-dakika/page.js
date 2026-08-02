/**
 * SON DAKİKA — /son-dakika
 *
 * ⚠️ "Son dakika" ifadesi yalnızca gerçekten öyle olan içerik için kullanılır.
 * Bu sayfa `isBreaking` işaretli VE son 48 saat içindeki haberleri listeler.
 * Eski haberleri "son dakika" başlığı altında tutmak okuru yanıltır.
 */

import { getBreakingNews, getRankedNews } from "@/lib/news";
import { buildMetadata, JsonLd, breadcrumbJsonLd } from "@/lib/seo";
import NewsCard from "@/components/news/NewsCard";
import EmptyState from "@/components/news/EmptyState";

export const metadata = buildMetadata({
  title: "Son Dakika Ekonomi Haberleri",
  description:
    "Ekonomi ve piyasalardan son dakika gelişmeleri — resmî açıklamalar, faiz kararları ve kritik veriler.",
  path: "/son-dakika",
  keywords: ["son dakika", "son dakika ekonomi", "flaş haber"],
});

/* Son dakika sayfası sık tazelenmeli. */
export const revalidate = 300;

export default function BreakingPage() {
  const breaking = getBreakingNews(30, 48);
  /* Son dakika yoksa en azından güncel gündemi göster — boş sayfa bırakma. */
  const fallback = breaking.length === 0 ? getRankedNews(6) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", path: "/" },
          { name: "Son Dakika", path: "/son-dakika" },
        ])}
      />

      <header className="border-b border-line pb-6">
        <h1 className="headline text-3xl text-ink sm:text-4xl">Son Dakika</h1>
        <p className="standfirst mt-3 max-w-2xl">
          Son 48 saat içindeki kritik ekonomi gelişmeleri.
        </p>
      </header>

      {breaking.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {breaking.map((item, i) => (
            <NewsCard key={item.slug} item={item} priority={i === 0} />
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <EmptyState
            title="Şu an son dakika gelişmesi yok"
            description="Son 48 saat içinde son dakika olarak işaretlenmiş bir haber bulunmuyor. Kritik bir gelişme olduğunda burada ve sitenin üst bandında görünecek."
            links={[]}
          />

          {fallback.length > 0 ? (
            <section aria-labelledby="gundem">
              <h2 id="gundem" className="mb-4 text-lg font-bold tracking-tight text-ink">
                Gündemdekiler
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {fallback.map((item) => (
                  <NewsCard key={item.slug} item={item} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
