/**
 * ============================================================================
 *  HABER DETAY SAYFASI
 * ============================================================================
 *  Profesyonel yayın standardı: künye, tarih/saat, görsel kredisi, kaynaklar,
 *  düzeltme geçmişi ve yasal uyarı.
 *
 *  OKUMA GENİŞLİĞİ: gövde metni `max-w-[68ch]` ile sınırlı. Geniş ekranda
 *  satırın tamamını doldurmak okumayı zorlaştırır (göz satır başını kaybeder).
 * ============================================================================
 */

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import siteConfig from "~/site.config";
import MdxContent from "@/components/mdx/MdxContent";
import ShareButtons from "@/components/ShareButtons";
import TableOfContents from "@/components/TableOfContents";
import NewsCard from "@/components/news/NewsCard";
import CategoryArt from "@/components/media/CategoryArt";
import { ContentEndAdSlot, SidebarAdSlot } from "@/components/ads";
import Disclaimer from "@/components/mdx/Disclaimer";
import { getAllNews, getNewsBySlug, getRelatedNews, activeSections } from "@/lib/news";
import { extractHeadings } from "@/lib/posts";
import { formatDate, formatTime, absoluteUrl } from "@/lib/format";
import { buildMetadata, JsonLd, newsArticleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { editorialIndexability, resolveRobots } from "@/lib/indexability";
import { resolveMotifKey } from "@/lib/motif";
import { isAiConfigured } from "@/lib/ai";
import AiSummaryPanel from "@/components/ai/AiSummaryPanel";
import { getClusterSources } from "@/lib/feed";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllNews()
    .filter((n) => n.section)
    .map((n) => ({ section: n.section.slug, slug: n.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = getNewsBySlug(slug);
  if (!item) return {};

  const path = `/haber/${item.section.slug}/${item.slug}`;

  const base = buildMetadata({
    title: item.seoTitle ?? item.title,
    description: item.seoDescription ?? item.summary,
    path,
    keywords: item.keywords,
    type: "article",
    image: item.image?.src ?? null,
    publishedTime: item.publishedAt,
    modifiedTime: item.updatedAt ?? item.publishedAt,
    authors: item.author ? [item.author.name] : undefined,
    ogCategory: item.section.name,
    ogReadingTime: item.readingTime,
  });

  /**
   * Robots kararı TEK MERKEZDEN gelir (indexability.js).
   * Onaysız, kaynaksız, özgün değeri yetersiz veya çok kısa bir haber
   * burada otomatik olarak noindex olur — sayfanın kendisi bu kuralı
   * tekrar etmez, dolayısıyla unutulamaz.
   */
  const decision = editorialIndexability({
    ...item,
    selfUrl: absoluteUrl(path),
    canonicalUrl: item.canonicalUrl ? absoluteUrl(item.canonicalUrl) : absoluteUrl(path),
  });

  return { ...base, robots: resolveRobots(decision) };
}

export default async function NewsDetailPage({ params }) {
  const { section: sectionSlug, slug } = await params;
  const item = getNewsBySlug(slug);

  /* Bölüm slug'ı uyuşmuyorsa 404 — aynı haber iki URL'den açılmasın
     (duplicate content). */
  if (!item || item.section?.slug !== sectionSlug) notFound();

  const related = getRelatedNews(slug);
  /* Bu haber bir olay kümesine bağlıysa, aynı olayı bildiren diğer
     kaynakları D1'den çek. D1 yoksa boş dizi döner. */
  const clusterSources = await getClusterSources(item.clusterId);
  const headings = extractHeadings(item.content);
  const showToc = siteConfig.features.tableOfContents && headings.length >= 3;
  const updated = item.updatedAt && item.updatedAt !== item.publishedAt;

  /* Yapay zekâ özeti düğmesi çizilsin mi? Sunucuda karar verilir; anahtar
     istemciye hiç gitmez. */
  const aiHazir = isAiConfigured();

  /* "Neden önemli?" kutusunun içeriği. Boş olanlar elenir; hiçbiri yoksa
     kutu hiç çizilmez (eski haberler bu alanlar olmadan da yayımlanabilir,
     yalnızca indexlenemez). */
  const whyBlocks = [
    { label: "Kısaca", text: item.whyItMatters },
    { label: "Türkiye'ye etkisi", text: item.turkeyImpact },
    { label: "Vatandaşa etkisi", text: item.citizenImpact },
    { label: "Piyasaya etkisi", text: item.marketImpactNote },
  ].filter((b) => typeof b.text === "string" && b.text.trim().length > 0);

  /* Fotoğrafsız haberlerde çizilecek grafiğin motifi. Kartla birebir aynı
     çağrı — okur kartta hangi grafiği gördüyse haberde de onu görür. */
  const artMotifKey = resolveMotifKey({
    motif: item.motif,
    section: item.section?.slug,
    tags: item.tags,
    symbols: item.relatedSymbols,
    title: item.title,
    summary: item.summary,
  });

  return (
    <article className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <JsonLd data={newsArticleJsonLd(item)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", path: "/" },
          { name: "Haberler", path: "/haber" },
          { name: item.section.name, path: `/haber/${item.section.slug}` },
          { name: item.title, path: `/haber/${item.section.slug}/${item.slug}` },
        ])}
      />

      {/* ------------------------------------------------------ BREADCRUMB */}
      <nav aria-label="Konum" className="text-xs text-muted">
        <Link href="/" className="inline-flex min-h-6 items-center hover:text-link">
          Ana Sayfa
        </Link>
        <span aria-hidden="true" className="mx-1.5">/</span>
        <Link href="/haber" className="inline-flex min-h-6 items-center hover:text-link">
          Haberler
        </Link>
        <span aria-hidden="true" className="mx-1.5">/</span>
        <Link href={`/haber/${item.section.slug}`} className="inline-flex min-h-6 items-center hover:text-link">
          {item.section.name}
        </Link>
      </nav>

      {/* ---------------------------------------------------------- BAŞLIK */}
      <header className="mx-auto mt-4 max-w-[72ch]">
        <div className="flex flex-wrap items-center gap-2">
          {item.isBreaking ? (
            <span className="rounded-brand bg-negative px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
              Son Dakika
            </span>
          ) : null}
          {item.isLive ? (
            <span className="inline-flex items-center gap-1 rounded-brand bg-gold-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
              {item.liveStatus === "ended" ? "Canlı yayın sona erdi" : "Canlı"}
            </span>
          ) : null}
          <Link
            href={`/haber/${item.section.slug}`}
            className="text-xs font-semibold uppercase tracking-wide text-accent-700 hover:underline"
          >
            {item.section.name}
          </Link>
        </div>

        <h1 className="headline mt-3 text-3xl text-ink sm:text-4xl">{item.title}</h1>

        {item.summary ? <p className="standfirst mt-4">{item.summary}</p> : null}

        {/* --------------------------------------------------------- KÜNYE */}
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-line py-3 text-sm text-muted">
          {item.author ? (
            <span>
              <span className="text-muted">Yazan </span>
              <Link
                href={`/yazarlar/${item.author.id}`}
                className="font-medium text-ink hover:underline"
              >
                {item.author.name}
              </Link>
            </span>
          ) : null}

          {item.editor ? (
            <span className="text-xs">Editör: {item.editor.name}</span>
          ) : null}

          {item.publishedAt ? (
            <span>
              <time dateTime={item.publishedAt}>
                {formatDate(item.publishedAt)} · {formatTime(item.publishedAt)}
              </time>
            </span>
          ) : null}

          {updated ? (
            <span className="font-medium text-ink">
              Güncellendi:{" "}
              <time dateTime={item.updatedAt}>
                {formatDate(item.updatedAt)} · {formatTime(item.updatedAt)}
              </time>
            </span>
          ) : null}

          <span>{item.readingTime} dk okuma</span>
        </div>
      </header>

      {/* ---------------------------------------------------- HERO GÖRSELİ */}
      {item.image ? (
        <figure className="mx-auto mt-6 max-w-[80ch]">
          <div className="relative aspect-[16/9] overflow-hidden rounded-brand bg-subtle">
            <Image
              src={item.image.src}
              alt={item.image.alt || ""}
              fill
              /* Hero LCP adayı — öncelikli. */
              priority
              sizes="(max-width: 1024px) 100vw, 80ch"
              style={{ objectFit: "cover", objectPosition: item.image.focalPoint }}
            />
          </div>
          {/* Görsel açıklaması ve KREDİSİ — kredi zorunlu alan (bkz. lib/news.js) */}
          <figcaption className="mt-2 text-xs leading-relaxed text-muted">
            {item.image.caption ? <span>{item.image.caption} </span> : null}
            <span className="text-muted/80">
              Fotoğraf: {item.image.credit}
              {item.image.source ? ` / ${item.image.source}` : ""}
              {item.image.license ? ` (${item.image.license})` : ""}
            </span>
          </figcaption>
        </figure>
      ) : (
        /*
         * Lisanslı fotoğraf yoksa kategori grafiği çizilir.
         *
         * Daha önce burada HİÇBİR ŞEY yoktu: kartta grafik gören okur
         * habere girince çıplak bir metinle karşılaşıyordu. Grafik hem bu
         * kopukluğu kapatır hem de sosyal paylaşımda kartla tutarlı kalır.
         *
         * Motif haberin konusundan seçilir (kartla AYNI `resolveMotifKey`
         * çağrısı) — böylece kartta gördüğü grafiğin aynısı burada da
         * çıkar; `seed` de aynı olduğu için varyantı bile aynıdır.
         *
         * `aria-hidden` CategoryArt'ın kendi içinde: dekoratiftir, haberin
         * anlamını başlık taşır. Bir olayın fotoğrafı sanılmaması için
         * bilinçli olarak soyut bir dil kullanılır (bkz. CategoryArt).
         */
        <figure className="mx-auto mt-6 max-w-[80ch]">
          <div className="relative aspect-[16/9] overflow-hidden rounded-brand bg-subtle">
            <CategoryArt
              category={artMotifKey}
              seed={item.slug}
              showLabel
            />
          </div>
        </figure>
      )}

      {/* --------------------------------------------------- CANLI AKIŞ */}
      {item.isLive && item.liveUpdates.length > 0 ? (
        <section
          aria-labelledby="canli-akis"
          className="mx-auto mt-8 max-w-[72ch] rounded-brand border border-gold-200 bg-gold-50 p-4"
        >
          <h2 id="canli-akis" className="text-sm font-bold uppercase tracking-wide text-gold-800">
            Canlı gelişmeler
          </h2>
          <ol className="mt-3 space-y-3">
            {item.liveUpdates.map((u, i) => (
              <li key={`${u.at}-${i}`} className="border-l-2 border-gold-400 pl-3">
                <time dateTime={u.at} className="numeric text-xs font-semibold text-gold-800">
                  {formatTime(u.at)}
                </time>
                <p className="mt-0.5 text-sm text-ink">{u.title}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* --------------------------------------------------------- GÖVDE */}
      <div className="mt-8 lg:flex lg:items-start lg:gap-10">
        {showToc ? (
          <aside className="hidden w-56 shrink-0 lg:block">
            {/* Yapışkan header 56px; top-24 (96px) güvenli boşluk bırakır. */}
            <div className="sticky top-24">
              <TableOfContents headings={headings} />
            </div>
          </aside>
        ) : null}

        <div className="min-w-0 flex-1">
          {/* ------------------------------------------- NEDEN ÖNEMLİ?
              Yayın kapısı (lib/indexability.js) bir haberin indexlenmesi
              için `whyItMatters` / `turkeyImpact` / `citizenImpact`
              alanlarından en az ikisinin dolu olmasını şart koşuyor —
              "API içeriğini birkaç kelime değiştirip haber üretmeyi"
              engelleyen kapı bu.

              Ama bu alanlar hiçbir yerde ÇİZİLMİYORDU: kapı özgün değer
              yazılmasını zorunlu tutuyor, okur ise o değeri hiç görmüyordu.
              Yazılan metnin okura ulaşması için burada gösteriliyor.

              Metnin gövdesinden önce, özet niteliğinde duruyor: okur
              haberin kendisini okumadan önce "bu beni neden ilgilendiriyor"
              sorusunun cevabını görüyor. */}
          {whyBlocks.length > 0 ? (
            <section
              aria-labelledby="neden-onemli"
              className="mx-auto mb-8 max-w-[68ch] rounded-brand border border-line bg-subtle p-5"
            >
              <h2
                id="neden-onemli"
                className="text-sm font-bold uppercase tracking-wide text-accent-700"
              >
                Neden önemli?
              </h2>
              <dl className="mt-3 space-y-3">
                {whyBlocks.map((block) => (
                  <div key={block.label}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {block.label}
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-ink">{block.text}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {/* Okunabilir genişlik — geniş ekranda satır uzamasın. */}
          <div className="prose-site mx-auto max-w-[68ch]">
            <MdxContent source={item.content} />
          </div>

          {/* Yapay zekâ özeti — yalnızca sağlayıcı yapılandırılmışsa çizilir.
              Anahtar yoksa düğme hiç görünmez (bozuk buton göstermeyiz). */}
          {aiHazir ? (
            <div className="mx-auto mt-8 max-w-[68ch]">
              <AiSummaryPanel slug={item.slug} title={item.title} />
            </div>
          ) : null}

          <div className="mx-auto mt-8 max-w-[68ch]">
            <ShareButtons
              path={`/haber/${item.section.slug}/${item.slug}`}
              title={item.title}
            />
          </div>

          {/* ------------------------------------------------- KAYNAKLAR
              Aynı olayı bildiren farklı kaynaklar TEK sayfada, burada
              listelenir (spec §4). Her kaynak için ayrı ParaNotu sayfası
              açılmaz; kanonik sayfa budur. */}
          {item.sources?.length || clusterSources.length || item.sourceUrl ? (
            <section
              aria-labelledby="kaynaklar"
              className="mx-auto mt-8 max-w-[68ch] rounded-brand border border-line bg-subtle p-4"
            >
              <h2 id="kaynaklar" className="text-sm font-bold text-ink">
                Kaynaklar
              </h2>

              <ul className="mt-2 space-y-1.5">
                {/* Editörün elle girdiği birincil kaynaklar önce. */}
                {(item.sources ?? []).map((source) => (
                  <li key={source.url} className="text-sm">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link underline underline-offset-2"
                    >
                      {source.name}
                    </a>
                    {source.kind === "official" ? (
                      <span className="ml-1.5 rounded-brand bg-accent-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-700">
                        Resmî
                      </span>
                    ) : null}
                  </li>
                ))}

                {item.sourceUrl && !item.sources?.length ? (
                  <li className="text-sm">
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link underline underline-offset-2"
                    >
                      {item.sourceName ?? item.sourceUrl}
                    </a>
                  </li>
                ) : null}
              </ul>

              {clusterSources.length > 0 ? (
                <div className="mt-3 border-t border-line pt-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Aynı konuda diğer kaynaklar
                  </h3>
                  <ul className="mt-1.5 space-y-1">
                    {clusterSources.map((source) => (
                      <li key={source.id} className="text-sm">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="nofollow noopener noreferrer"
                          className="text-muted underline underline-offset-2 hover:text-ink"
                        >
                          {source.sourceName}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}

          {/* --------------------------------------- DÜZELTME GEÇMİŞİ */}
          {item.corrections.length > 0 ? (
            <section
              aria-labelledby="duzeltmeler"
              className="mx-auto mt-4 max-w-[68ch] rounded-brand border border-gold-200 bg-gold-50 p-4"
            >
              <h2 id="duzeltmeler" className="text-sm font-bold text-gold-900">
                Düzeltmeler
              </h2>
              <ul className="mt-2 space-y-2">
                {item.corrections.map((c, i) => (
                  <li key={i} className="text-sm text-gold-900/90">
                    <time dateTime={c.at} className="font-semibold">
                      {formatDate(c.at)}
                    </time>{" "}
                    — {c.note}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-gold-900/70">
                Düzeltme yaklaşımımız için{" "}
                <Link href="/duzeltme-politikasi" className="underline">
                  Düzeltme Politikası
                </Link>
                .
              </p>
            </section>
          ) : null}

          <div className="mx-auto max-w-[68ch]">
            <Disclaimer />
          </div>

          {/* İçerik sonu reklamı — yalnızca yeterince uzun haberlerde.
              Kısa haberde reklam, içerikten büyük görünür. */}
          {item.wordCount >= 400 ? <ContentEndAdSlot /> : null}
        </div>

        {/* Sağ sütun — yalnızca xl ve üstü. Dar ekranda hiç render edilmez. */}
        <aside className="hidden w-[300px] shrink-0 self-start xl:block">
          <SidebarAdSlot sticky />
        </aside>
      </div>

      {/* ------------------------------------------------- İLGİLİ HABERLER */}
      {related.length > 0 ? (
        <section aria-labelledby="ilgili" className="mt-12 border-t border-line pt-8">
          <h2 id="ilgili" className="mb-4 text-lg font-bold tracking-tight text-ink">
            İlgili haberler
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <NewsCard key={r.slug} item={r} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
