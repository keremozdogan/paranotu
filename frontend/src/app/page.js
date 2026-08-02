/**
 * ============================================================================
 *  ANA SAYFA — ekonomi platformu düzeni
 * ============================================================================
 *  Bölüm sırası (spec §6):
 *    A. Kritik haber alanı (manşet + destekleyiciler)
 *    B. Piyasalarda son durum
 *    C–F. Türkiye / Dünya / Döviz-Altın / Borsa bölümleri
 *    H. Yaklaşan ekonomik takvim
 *    I. Para rehberleri  ← MEVCUT İÇERİK, korunuyor
 *    J. Hesaplama araçları
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  KADEMELİ AÇILMA
 *  ────────────────────────────────────────────────────────────────────────
 *  Haber bölümleri içerik YOKSA render edilmez. Sayfa bugün rehber ve veri
 *  odaklı görünür; haber akışı başladığında bölümler kendiliğinden belirir.
 *  Boş başlıklarla iskelet bir sayfa göstermek, hiç göstermemekten kötüdür.
 * ============================================================================
 */

import Link from "next/link";
import { Fragment, Suspense } from "react";

import siteConfig from "~/site.config";
import { BannerAdSlot, InFeedAdSlot } from "@/components/ads";
import PostCard from "@/components/PostCard";
import Newsletter from "@/components/Newsletter";
import SectionRow from "@/components/news/SectionRow";
import FeedStrip from "@/components/news/FeedStrip";
import MarketOverview from "@/components/market/MarketOverview";
import UpcomingEvents from "@/components/market/UpcomingEvents";
import Hero from "@/components/home/Hero";
import FilesSection from "@/components/home/FilesSection";
import { getPostSummaries, getFeaturedPosts, getCategoriesWithCounts } from "@/lib/posts";
import { getRankedNews, getNewsBySection, activeSections } from "@/lib/news";
import { getFeaturedFiles } from "@/lib/evergreen";
import { resolveHero } from "@/lib/slots";
import { getRecentFeedItems } from "@/lib/feed";
import figures from "~/content/data/figures";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ path: "/" });

/* Haber ve piyasa verisi zaman duyarlı — ana sayfa düzenli tazelenir. */
export const revalidate = 600;

/** Ana sayfada satır olarak gösterilecek bölümler ve sıraları. */
const HOME_SECTIONS = ["turkiye", "dunya", "doviz", "altin", "borsa"];

export default async function HomePage() {
  /* ---------------------------------------------------------------- HERO */
  /* Sabitlenmiş slotlar + otomatik doldurma. Haber yoksa dosyalarla dolar. */
  const { primary, secondary } = await resolveHero();

  /* Ham gelişme akışı — D1 bağlı değilse boş dizi, bölüm hiç çizilmez. */
  const feedItems = await getRecentFeedItems({ limit: 10 });

  /* ---------------------------------------------------------------- HABER */
  const ranked = getRankedNews(5);
  const hasNewsContent = ranked.length > 0;

  const sectionRows = HOME_SECTIONS.map((slug) => {
    const section = activeSections().find((s) => s.slug === slug);
    if (!section) return null;
    /* Manşette gösterilenleri satırlarda tekrar etme. */
    const shownSlugs = new Set(ranked.map((n) => n.slug));
    const items = getNewsBySection(slug).filter((n) => !shownSlugs.has(n.slug));
    return items.length > 0 ? { section, items } : null;
  }).filter(Boolean);

  /* -------------------------------------------------------------- REHBER */
  const posts = getPostSummaries();
  const guideHero = getFeaturedPosts(1)[0];
  const guides = posts.filter((p) => p.slug !== guideHero?.slug).slice(0, 4);
  const categories = getCategoriesWithCounts().filter((c) => c.count > 0);

  return (
    <>
      {/* ==================================================== A. MANŞET ALANI */}
      {primary.length > 0 ? (
        <>
          <h1 className="sr-only">{siteConfig.name} — güncel ekonomi gündemi</h1>
          <Hero primary={primary} secondary={secondary} />
        </>
      ) : (
        /* Haber akışı başlamadan önceki editoryal giriş.
           Sahte manşet üretmek yerine sitenin gerçekten sunduğu şeyi anlatır. */
        <section className="border-b border-line bg-subtle/50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">
              {siteConfig.tagline}
            </p>
            <h1 className="headline mt-3 max-w-3xl text-3xl text-ink sm:text-5xl">
              Ekonomiyi anlamak için{" "}
              <span className="text-primary-600">rakamlarla başla</span>
            </h1>
            <p className="standfirst mt-4 max-w-2xl">
              Güncel enflasyon verileri, piyasa görünümü ve bütçeni doğrudan etkileyen
              rakamlar — karmaşık terimlere boğmadan.
            </p>

            {/* Sitenin en güçlü verisi doğrudan ilk ekranda. */}
            <dl className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[figures.tufeYillik, figures.politikaFaizi, figures.asgariNet]
                .filter(Boolean)
                .map((f) => (
                  <div key={f.label} className="rounded-brand border border-line bg-canvas p-4">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                      {f.label}
                    </dt>
                    <dd className="numeric mt-1 text-2xl font-bold text-ink">{f.display}</dd>
                    <dd className="mt-0.5 text-[11px] text-muted">{f.period}</dd>
                  </div>
                ))}
            </dl>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/enflasyon"
                className="inline-flex min-h-11 items-center rounded-brand bg-accent-800 px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-900"
              >
                Enflasyon verilerine bak
              </Link>
              <Link
                href="/blog"
                className="inline-flex min-h-11 items-center rounded-brand border border-line bg-canvas px-5 text-sm font-semibold text-ink transition-colors hover:border-accent-300"
              >
                Para rehberleri
              </Link>
            </div>
          </div>
        </section>
      )}

      {/*
        ⚠️ HERO'NUN ÜSTÜNDE VE HEMEN ALTINDA REKLAM YOK — bilinçli.
        İlk ekran editoryal içeriğe ait. İlk reklam, okur en az bir
        anlamlı bölümü gördükten SONRA, doğal bir ayrım noktasında çıkar.
      */}
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6">
        {/* ========================================= PARANOTU DOSYALARI (§7) */}
        <FilesSection guides={getFeaturedFiles(6)} />

        {/* --- REKLAM 1: ilk içerik bloğundan sonra, doğal ayrım --- */}
        <BannerAdSlot className="my-0" />

        {/* ============================================ B. PİYASALARDA SON DURUM */}
        <MarketOverview />

        {/* ================================= SON GELİŞMELER (ham feed, noindex)
            Bu kartlar ParaNotu sayfasına değil, orijinal kaynağa gider. */}
        <FeedStrip items={feedItems} />

        {/* ===================================== C–F. HABER BÖLÜMLERİ (varsa) */}
        {sectionRows.map(({ section, items }) => (
          <SectionRow key={section.slug} section={section} items={items} />
        ))}

        {/* --- REKLAM 2: haber bölümleri bittikten sonra.
            Bölümlerin ARASINA reklam koymuyoruz; ana sayfada reklam
            yoğunluğu bilinçli olarak düşük tutuldu (§11). --- */}
        {sectionRows.length > 0 ? <BannerAdSlot className="my-0" /> : null}

        {/* ================================================ H. EKONOMİK TAKVİM */}
        <Suspense
          fallback={<div className="skeleton h-48" aria-hidden="true" />}
        >
          <UpcomingEvents />
        </Suspense>

        {/* ================================================ I. PARA REHBERLERİ */}
        <section aria-labelledby="rehberler" className="reveal">
          <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-line pb-2">
            <h2 id="rehberler" className="text-xl font-bold tracking-tight text-ink">
              Para Rehberi
            </h2>
            <Link href="/blog" className="inline-flex min-h-6 shrink-0 items-center text-sm font-medium text-link hover:underline">
              Tümü<span aria-hidden="true"> →</span>
            </Link>
          </div>

          {guideHero ? (
            <div className="mb-6">
              <PostCard post={guideHero} variant="featured" priority={!hasNewsContent} />
            </div>
          ) : null}

          {guides.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {guides.map((post, i) => (
                <Fragment key={post.slug}>
                  <PostCard post={post} />
                  {/* Liste arası reklam — yalnızca kart akışı yeterince
                      uzunsa. Son karttan sonra reklam koymuyoruz. */}
                  {(i + 1) % siteConfig.content.adEveryNPosts === 0 &&
                  i + 1 < guides.length ? (
                    <div className="sm:col-span-2 lg:col-span-4">
                      <InFeedAdSlot className="my-0" />
                    </div>
                  ) : null}
                </Fragment>
              ))}
            </div>
          ) : null}

          {categories.length > 0 ? (
            <nav aria-label="Rehber kategorileri" className="mt-5">
              <ul className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/kategori/${cat.slug}`}
                      className="inline-flex min-h-9 items-center rounded-brand border border-line px-3 text-sm text-muted transition-colors hover:border-accent-300 hover:text-ink"
                    >
                      {cat.name}
                      <span className="ml-1.5 text-xs text-muted/70">{cat.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </section>

        {/* ============================================== J. HESAPLAMA ARAÇLARI */}
        <section aria-labelledby="araclar" className="reveal">
          <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-line pb-2">
            <h2 id="araclar" className="text-xl font-bold tracking-tight text-ink">
              Hesaplama Araçları
            </h2>
            <Link href="/araclar" className="inline-flex min-h-6 shrink-0 items-center text-sm font-medium text-link hover:underline">
              Tümü<span aria-hidden="true"> →</span>
            </Link>
          </div>

          {/* Yalnızca GERÇEKTEN ÇALIŞAN araçlar listeleniyor (spec §6-J).
              Yeni araç eklendikçe buraya eklenir. */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                href: "/araclar/butce-hesaplayici",
                title: "Bütçe Hesaplayıcı",
                description:
                  "Gelirini 50/30/20 kuralına göre böl, harcama kalemlerini gör ve ne kadar biriktirebileceğini hesapla.",
              },
              {
                href: "/araclar/enflasyon-hesaplayici",
                title: "Maaş–Enflasyon Hesaplayıcı",
                description:
                  "Aldığın zam enflasyonun altında mı kaldı? Maaşının reel değişimini rakamla gör.",
              },
            ].map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="card-lift group rounded-brand border border-line bg-canvas p-5"
              >
                <h3 className="text-base font-semibold text-ink underline-offset-2 group-hover:underline">
                  {tool.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{tool.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {siteConfig.features.newsletter ? (
          <Newsletter variant="inline" source="home" />
        ) : null}
      </div>
    </>
  );
}
