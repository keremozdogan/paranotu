/**
 * HUB SAYFASI — /asgari-ucret, /faiz, /altin ...
 *
 * ⚠️ Yalnızca İÇİ DOLU hub'lar için sayfa üretilir. Boş hub sayfası
 * "thin content"tir; hem kullanıcıya faydasızdır hem de alan adının
 * genel kalite sinyalini düşürür.
 *
 * ⚠️ Bu route KÖK SEVİYEDEDİR. `dynamicParams = false` olmadan her
 * `/rastgele` adresi bu sayfaya düşerdi.
 */

import Link from "next/link";
import { notFound } from "next/navigation";

import { getActiveHubs, getGuidesByHub, getHub } from "@/lib/evergreen";
import { buildMetadata, JsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { listingIndexability, resolveRobots } from "@/lib/indexability";
import { formatDate } from "@/lib/format";
import SmartImage from "@/components/media/SmartImage";

export const dynamicParams = false;

/**
 * ⚠️ ÇAKIŞMA KORUMASI
 * Bazı hub slug'larının kök seviyede ADANMIŞ statik sayfası var
 * (`/enflasyon` → src/app/enflasyon/page.js). Next.js statik segmenti
 * dinamik olana tercih ettiği için çalışma anında sorun çıkmaz, ancak
 * ikisini birden üretmek aynı adres için iki çıktı demektir ve
 * sitemap'e çift kayıt sızabilir.
 *
 * Bu yüzden adanmış sayfası olan hub'lar burada üretilmez. Hub'ın
 * rehberleri yine `/enflasyon/maaslara-etkisi` gibi çalışır — sadece
 * hub'ın LİSTE sayfası mevcut zengin sayfaya bırakılır.
 */
const RESERVED_HUB_SLUGS = new Set(["enflasyon"]);

export function generateStaticParams() {
  return getActiveHubs()
    .filter((hub) => !RESERVED_HUB_SLUGS.has(hub.slug))
    .map((hub) => ({ hub: hub.slug }));
}

export async function generateMetadata({ params }) {
  const { hub: hubSlug } = await params;
  const hub = getHub(hubSlug);
  if (!hub) return {};

  const guides = getGuidesByHub(hubSlug);

  const base = buildMetadata({
    title: hub.name,
    description: hub.description,
    path: `/${hub.slug}`,
    keywords: [hub.name],
  });

  return { ...base, robots: resolveRobots(listingIndexability({ itemCount: guides.length })) };
}

export default async function HubPage({ params }) {
  const { hub: hubSlug } = await params;
  const hub = getHub(hubSlug);
  if (!hub) notFound();

  const guides = getGuidesByHub(hubSlug);
  if (guides.length === 0) notFound();

  /* İlk yazı öne çıkan kartı alır, gerisi ızgaraya düşer.
     `getGuidesByHub` zaten filePriority + tarihe göre sıralı döner. */
  const [lead, ...rest] = guides;

  const otherHubs = getActiveHubs().filter((h) => h.slug !== hubSlug);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", path: "/" },
          { name: hub.name, path: `/${hub.slug}` },
        ])}
      />

      <nav aria-label="Konum" className="text-xs text-muted">
        <Link href="/" className="inline-flex min-h-6 items-center hover:text-link">Ana Sayfa</Link>
      </nav>

      <header className="mt-3 border-b border-line pb-6">
        <h1 className="headline text-3xl text-ink sm:text-4xl">{hub.name}</h1>
        <p className="standfirst mt-3 max-w-2xl">{hub.description}</p>
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted">
          {guides.length} içerik
        </p>
      </header>

      {/* ÖNE ÇIKAN — kategorinin en güçlü içeriği geniş kartla ayrışır.
          Hepsi aynı boyutta olduğunda okur nereden başlayacağını bilemiyor;
          editoryal hiyerarşi tam olarak bu işe yarar. Sıralama
          `filePriority` ile yönetilir (küçük sayı = daha önemli). */}
      {lead ? (
        <article className="card-lift group mt-8 overflow-hidden rounded-brand border border-line bg-canvas sm:flex">
          <Link href={lead.href} className="flex flex-1 flex-col sm:flex-row">
            <SmartImage
              image={lead.image}
              category={hub.slug}
              seed={lead.slug}
              alt={lead.imageAlt ?? ""}
              ratio="16/9"
              priority
              zoom
              showLabel
              sizes="(max-width: 640px) 100vw, 52vw"
              className="shrink-0 sm:aspect-auto sm:w-[52%]"
            />
            <div className="flex flex-1 flex-col justify-center p-5 sm:p-6">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-accent-700">
                Öne çıkan
              </span>
              <h2 className="headline mt-1.5 text-xl text-ink underline-offset-2 group-hover:underline sm:text-2xl">
                {lead.title}
              </h2>
              <p className="clamp-3 mt-2 text-sm leading-relaxed text-muted">{lead.summary}</p>
              <p className="mt-3 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                <time dateTime={lead.updatedAt ?? lead.publishedAt}>
                  {formatDate(lead.updatedAt ?? lead.publishedAt)}
                </time>
                <span aria-hidden="true">·</span>
                <span>{lead.readingTime} dk</span>
              </p>
            </div>
          </Link>
        </article>
      ) : null}

      {rest.length > 0 ? (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((guide) => (
            <li key={guide.href}>
              <article className="card-lift group flex h-full flex-col overflow-hidden rounded-brand border border-line bg-canvas">
                <Link href={guide.href} className="flex flex-1 flex-col">
                  <SmartImage
                    image={guide.image}
                    category={hub.slug}
                    seed={guide.slug}
                    alt={guide.imageAlt ?? ""}
                    ratio="16/9"
                    zoom
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="shrink-0"
                  />
                  <div className="flex flex-1 flex-col p-4">
                    <h2 className="clamp-3 text-base font-bold leading-snug text-ink underline-offset-2 group-hover:underline">
                      {guide.title}
                    </h2>
                    <p className="clamp-2 mt-2 text-sm leading-relaxed text-muted">
                      {guide.summary}
                    </p>
                    {/* mt-auto → künye her kartta dibe yapışır, satır hizalı kalır */}
                    <p className="mt-auto flex flex-wrap items-center gap-x-2 pt-3 text-xs text-muted">
                      {guide.updatedAt && guide.updatedAt !== guide.publishedAt ? (
                        <>
                          <span>Güncellendi</span>
                          <time dateTime={guide.updatedAt}>{formatDate(guide.updatedAt)}</time>
                        </>
                      ) : (
                        <time dateTime={guide.publishedAt}>{formatDate(guide.publishedAt)}</time>
                      )}
                      <span aria-hidden="true">·</span>
                      <span>{guide.readingTime} dk</span>
                    </p>
                  </div>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      ) : null}

      {otherHubs.length > 0 ? (
        <nav aria-label="Diğer konular" className="mt-12 border-t border-line pt-6">
          <h2 className="text-sm font-semibold text-ink">Diğer konular</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {otherHubs.map((h) => (
              <li key={h.slug}>
                <Link
                  href={`/${h.slug}`}
                  className="inline-flex min-h-9 items-center rounded-brand border border-line px-3 text-sm text-muted transition-colors hover:border-accent-300 hover:text-ink"
                >
                  {h.name}
                  <span className="ml-1.5 text-xs text-muted/70">{h.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
