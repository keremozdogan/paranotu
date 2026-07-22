import figures, { dataReviewedAt } from "~/content/data/figures";
import { formatDate } from "@/lib/format";

/**
 * <Rakam id="tufeYillik" />
 *
 * Doğrulanmış bir resmî rakamı, kaynağına bağlı olarak basar.
 * Rakam `content/data/figures.js` içinde tanımlı değilse görünür bir hata
 * gösterir — sessizce yanlış/boş sayı yayımlanmasın diye.
 *
 * Seçenekler:
 *   <Rakam id="..." bare />      → sadece değer, kaynak linki olmadan
 *   <Rakam id="..." label />     → "Yıllık enflasyon: %32,11"
 */
export default function Rakam({ id, bare = false, label = false }) {
  const figure = figures[id];

  if (!figure) {
    return (
      <mark className="rounded bg-red-100 px-1.5 py-0.5 text-sm font-semibold text-red-700">
        ⚠ tanımsız rakam: {id}
      </mark>
    );
  }

  const value = (
    <span className="font-mono font-semibold tabular-nums">{figure.display}</span>
  );

  if (bare) return value;

  return (
    <span className="whitespace-nowrap">
      {label ? <span>{figure.label}: </span> : null}
      {value}
      <a
        href={figure.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={`${figure.label} — ${figure.period} · Kaynak: ${figure.source}`}
        className="ml-0.5 align-super text-[10px] font-normal text-primary-600 no-underline hover:underline"
      >
        [kaynak]
      </a>
    </span>
  );
}

/**
 * <RakamTablosu ids={["tufeYillik", "politikaFaizi", "asgariNet"]} />
 * Yazının başına konulacak "güncel veriler" kutusu.
 */
export function RakamTablosu({ ids = [], baslik = "Bu yazıdaki güncel veriler" }) {
  const list = Array.isArray(ids) ? ids : String(ids).split(",");
  const rows = list
    .map((id) => String(id).trim())
    .map((id) => ({ id, ...figures[id] }))
    .filter((f) => f.display);

  if (!rows.length) {
    return (
      <mark className="block rounded bg-red-100 p-2 text-sm font-semibold text-red-700">
        ⚠ RakamTablosu: geçerli rakam bulunamadı (verilen: {JSON.stringify(ids)})
      </mark>
    );
  }

  return (
    <aside className="my-6 rounded-brand border border-line bg-subtle/60 p-4">
      <h3 className="m-0 text-xs font-bold uppercase tracking-wider text-muted">
        {baslik}
      </h3>
      <dl className="mt-3 space-y-2">
        {rows.map((f) => (
          <div key={f.id} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <dt className="text-sm text-ink">
              {f.label}
              <span className="ml-1.5 text-xs text-muted">({f.period})</span>
            </dt>
            <dd className="m-0 font-mono text-sm font-semibold tabular-nums text-primary-700">
              {f.display}
              <a
                href={f.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 align-super text-[10px] font-normal text-primary-600 no-underline hover:underline"
              >
                [{f.source}]
              </a>
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 mb-0 border-t border-line pt-2 text-[11px] text-muted">
        Veriler {formatDate(dataReviewedAt)} tarihinde kontrol edildi. Resmî
        rakamlar açıklandıkça güncellenir.
      </p>
    </aside>
  );
}

/** Yazı başında veri tazeliğini gösteren küçük rozet. */
export function SonGuncelleme() {
  return (
    <p className="my-4 text-xs text-muted">
      📊 Bu yazıdaki resmî rakamlar{" "}
      <time dateTime={dataReviewedAt}>{formatDate(dataReviewedAt)}</time>{" "}
      tarihinde kontrol edildi.
    </p>
  );
}
