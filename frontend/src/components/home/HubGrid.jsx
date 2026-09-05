/**
 * ============================================================================
 *  KONU BAŞLIKLARI — ana sayfadaki kategori ızgarası
 * ============================================================================
 *  NEDEN VAR?
 *  Ana sayfa bir haber akışı gibi kurgulanmıştı; siteye ilk gelen kullanıcı
 *  "burası ne hakkında?" sorusunu ancak aşağı kaydırarak yanıtlayabiliyordu.
 *  Bir bilgi kütüphanesinde bu soru ilk ekranda cevaplanmalı: kullanıcı
 *  ilgilendiği konuya doğrudan girebilmeli.
 *
 *  ⚠️ YALNIZCA DOLU KATEGORİLER
 *  Liste `getActiveHubs()` ile beslenir; o da içeriği olmayan kategoriyi
 *  düşürür. Boş bir "Vergi" kartı göstermek, kullanıcıyı boş sayfaya
 *  göndermek demektir — hem güven kaybı hem thin content sinyali.
 *  Kategori ilk yazısını aldığı gün ızgarada kendiliğinden belirir.
 * ============================================================================
 */

import Link from "next/link";

import Reveal from "@/components/Reveal";

export default function HubGrid({ hubs = [] }) {
  const list = hubs.filter((h) => h && h.count > 0);
  if (list.length === 0) return null;

  return (
    <Reveal as="section" aria-labelledby="konular" stagger>
      <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-line pb-2">
        <h2 id="konular" className="text-xl font-bold tracking-tight text-ink">
          Konu başlıkları
        </h2>
        <span className="shrink-0 text-sm text-muted">{list.length} kategori</span>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((hub) => (
          <li key={hub.slug}>
            <Link
              href={`/${hub.slug}`}
              className="card-lift group flex h-full flex-col rounded-brand border border-line bg-canvas p-4"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-base font-bold text-ink underline-offset-2 group-hover:underline">
                  {hub.name}
                </h3>
                {/* Sayı, kategorinin ne kadar derin olduğunu önden söyler. */}
                <span className="numeric shrink-0 text-xs text-muted">{hub.count}</span>
              </div>
              <p className="clamp-3 mt-1.5 text-sm leading-relaxed text-muted">
                {hub.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
