/**
 * ============================================================================
 *  PARANOTU DOSYALARI — kalıcı içerik bölümü
 * ============================================================================
 *  Hero'nun hemen altında. Haber akışından bağımsız, uzun ömürlü içerikler.
 *
 *  NEDEN BURADA?
 *  Haber sitelerinin en büyük zayıflığı, içeriğin bir gün sonra ölmesidir.
 *  Bu bölüm ParaNotu'nun kalıcı değerini ilk ekranın hemen altına koyar:
 *  ziyaretçi bir haber için gelse bile burada kalıcı bir şey bulur.
 *
 *  Masaüstünde grid, mobilde kaydırmalı şerit. Aşırı yuvarlaklık ve gölge
 *  yok — reklam kartı değil, editoryal dosya görünümü.
 * ============================================================================
 */

import Link from "next/link";

import Reveal from "@/components/Reveal";
import SmartImage from "@/components/media/SmartImage";
import { formatDate } from "@/lib/format";

function FileCard({ guide }) {
  const wasUpdated = guide.updatedAt && guide.updatedAt !== guide.publishedAt;

  return (
    /*
      `relative` — başlık bağlantısı `after:absolute after:inset-0` ile
      kartın TAMAMINI tıklanabilir yapıyor.
      Neden bu desen? Kartı `<Link>` ile sarmalarsak içindeki metin
      seçilemez ve erişilebilirlik ağacında dev bir bağlantı oluşur.
      "Stretched link" deseni tek ve anlamlı bir bağlantı bırakırken
      dokunma alanını kart boyutuna çıkarır (WCAG 2.5.8).
    */
    <article className="card-lift relative flex h-full flex-col overflow-hidden rounded-brand border border-line bg-canvas">
      {/* Hub'a özel kategori grafiği — dosyalar arasında görsel çeşitlilik
          sağlar, aynı kutunun tekrarı hissini önler. */}
      <SmartImage
        image={guide.image}
        category={guide.hub.slug}
        seed={guide.slug}
        alt={guide.image?.alt ?? ""}
        ratio="16/9"
        zoom
        showLabel
        sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 30vw"
        className="shrink-0"
      />

      <div className="flex flex-1 flex-col p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-accent-700">
          {guide.hub.name}
        </span>

        <h3 className="clamp-3 mt-1.5 text-base font-bold leading-snug text-ink">
          <Link
            href={guide.href}
            className="after:absolute after:inset-0 after:content-[''] hover:underline"
          >
            {guide.title}
          </Link>
        </h3>

        <p className="clamp-2 mt-2 flex-1 text-sm leading-relaxed text-muted">
          {guide.summary}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-2 text-xs text-muted">
          {/* "Güncellendi" yalnızca GERÇEK güncelleme varsa yazılır. */}
          {wasUpdated ? (
            <>
              <span>Güncellendi</span>
              <time dateTime={guide.updatedAt}>{formatDate(guide.updatedAt)}</time>
            </>
          ) : (
            <time dateTime={guide.publishedAt}>{formatDate(guide.publishedAt)}</time>
          )}
          <span aria-hidden="true">·</span>
          <span>{guide.readingTime} dk okuma</span>
        </div>

        <p className="mt-3 text-sm font-semibold text-link">
          Dosyayı İncele<span aria-hidden="true"> →</span>
        </p>
      </div>
    </article>
  );
}

export default function FilesSection({ guides = [], title = "ParaNotu Dosyaları" }) {
  if (guides.length === 0) return null;

  return (
    <Reveal as="section" aria-labelledby="paranotu-dosyalari">
      <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-line pb-2">
        <div>
          <h2 id="paranotu-dosyalari" className="text-xl font-bold tracking-tight text-ink">
            {title}
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            Paranızı etkileyen konular — düzenli kontrol edilen kalıcı rehberler.
          </p>
        </div>
      </div>

      {/* Mobil: kaydırmalı şerit. Masaüstü: grid. */}
      <ul className="scroll-strip scroll-snap-strip flex gap-4 sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {guides.map((guide) => (
          <li key={guide.href} className="w-[78%] shrink-0 sm:w-auto">
            <FileCard guide={guide} />
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
