/**
 * ============================================================================
 *  EKONOMİNİN GÖSTERGELERİ — resmî, doğrulanmış rakamlar
 * ============================================================================
 *  NEDEN VAR?
 *  Piyasa sağlayıcısı bağlı değilken ana sayfadaki "piyasalar" alanı kesik
 *  çizgili boş bir kutuya iniyordu. Dürüsttü ama sayfayı ölü gösteriyordu:
 *  finans sitesine giren kullanıcı ilk ekranda RAKAM görmek ister.
 *
 *  Çözüm sahte fiyat üretmek DEĞİL. ParaNotu'nun elinde zaten yayımlanabilir
 *  gerçek veri var: `content/data/figures.js` içindeki resmî rakamlar
 *  (TÜİK enflasyonu, TCMB politika faizi, asgari ücret). Bu modül onları
 *  gösterir — her biri kaynağı, dönemi ve açıklanma tarihiyle.
 *
 *  ⚠️ KURALLAR
 *    • Yalnızca `confidence: "high"` olan rakamlar çizilir. `isPublishable`
 *      bunu zorlar; doğrulanmamış bir rakam buraya sızamaz.
 *    • Bunlar PİYASA FİYATI DEĞİLDİR. Anlık kur/altın/endeks bu modülde
 *      gösterilmez — o veri lisanslıdır ve sağlayıcı ister.
 *    • Tahmin olan rakam (TCMB yıl sonu) açıkça "tahmin" diye etiketlenir;
 *      gerçekleşme sanılmasın diye.
 * ============================================================================
 */

import Link from "next/link";

import figures, { isPublishable, dataReviewedAt } from "~/content/data/figures";
import { formatDate } from "@/lib/format";

/** Ana sayfada gösterilecek göstergeler ve sıraları. */
const INDICATOR_IDS = ["tufeYillik", "politikaFaizi", "tcmbYilSonuTahmini", "asgariNet"];

function Indicator({ id }) {
  const figure = figures[id];
  /* Yayımlanamaz rakam hiç çizilmez — eksik veri, yanlış veriden iyidir. */
  if (!figure || !isPublishable(id)) return null;

  const isForecast = Boolean(figure.note);

  return (
    <div className="flex flex-col border-line px-4 py-4 sm:border-l sm:first:border-l-0 sm:first:pl-0 sm:last:pr-0">
      <dt className="flex items-start gap-1.5 text-xs font-medium leading-snug text-muted">
        <span className="clamp-2">{figure.label}</span>
        {isForecast ? (
          <span className="mt-px shrink-0 rounded-brand bg-flat-soft px-1 py-px text-[10px] font-semibold uppercase tracking-wide text-flat">
            Tahmin
          </span>
        ) : null}
      </dt>

      <dd className="numeric mt-2 text-3xl font-bold leading-none text-ink">{figure.display}</dd>

      <dd className="mt-auto pt-2 text-[11px] leading-relaxed text-muted">
        {figure.period}
        {figure.sourceUrl ? (
          <>
            {" · "}
            <a
              href={figure.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-line underline-offset-2 hover:text-link"
            >
              {figure.source}
            </a>
          </>
        ) : (
          <>{figure.source ? ` · ${figure.source}` : null}</>
        )}
      </dd>
    </div>
  );
}

export default function EconomyIndicators() {
  const visible = INDICATOR_IDS.filter((id) => figures[id] && isPublishable(id));
  if (visible.length === 0) return null;

  return (
    <div className="rounded-brand border border-line bg-canvas">
      <dl className="grid grid-cols-2 divide-y divide-line sm:grid-cols-4 sm:divide-y-0">
        {visible.map((id) => (
          <Indicator key={id} id={id} />
        ))}
      </dl>

      <p className="border-t border-line px-4 py-2.5 text-[11px] text-muted">
        Resmî kaynaklardan doğrulanmış rakamlar
        {dataReviewedAt ? ` · son kontrol ${formatDate(dataReviewedAt)}` : null} ·{" "}
        <Link href="/enflasyon" className="text-link hover:underline">
          Enflasyon verilerinin tamamı
        </Link>
      </p>
    </div>
  );
}
