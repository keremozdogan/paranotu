/**
 * TÜFE grafikleri — sunucuda render edilen satır içi SVG (JS yok, SEO dostu).
 *
 * TASARIM KARARLARI
 *  • Yıllık (%32 civarı) ve aylık (%1 civarı) TÜFE ölçekleri çok farklı.
 *    Bu yüzden ÇİFT EKSEN KULLANILMIYOR — iki ayrı grafik (small multiples).
 *    Çift eksen, iki ölçeği tek grafikte göstererek yanıltıcı kesişimler üretir.
 *  • Her grafik tek serili ve ikisi de aynı varlığı (TÜFE) gösteriyor →
 *    tek hue, lejant yok (başlık seriyi zaten adlandırıyor).
 *  • Renk: accent-500 (#6366f1). Hem açık hem koyu yüzeyde parlaklık bandı ve
 *    kontrast kontrolünden geçtiği doğrulandı.
 *  • Metin asla seri rengini giymez — ink/muted token'ları kullanır.
 *  • Her işaretin <title>'ı var (yerel tooltip) ve altında tam veri tablosu
 *    bulunur; bilgi hiçbir zaman yalnızca renkle taşınmaz.
 */

const AYLAR = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
];

const SERI = "var(--brand-accent-500)";
const IZGARA = "var(--brand-border)";

const nf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 });

function kisaEtiket(donem) {
  const [yil, ay] = donem.split("-");
  return `${AYLAR[Number(ay) - 1]} ${yil.slice(2)}`;
}

/** Veriyi eskiden yeniye çevirir (grafikler soldan sağa okunur). */
function kronolojik(history) {
  return [...history].reverse();
}

function niceDomain(values, { fromZero = false } = {}) {
  const min = fromZero ? 0 : Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.15 || max * 0.15 || 1;
  const lo = fromZero ? 0 : Math.max(0, min - pad);
  const hi = max + pad;
  return [lo, hi];
}

/* -------------------------------------------------------------- ÇİZGİ ---- */

function CizgiGrafik({ data, title }) {
  const W = 640, H = 200;
  const P = { top: 16, right: 52, bottom: 28, left: 44 };
  const iw = W - P.left - P.right;
  const ih = H - P.top - P.bottom;

  const values = data.map((d) => d.yillik);
  const [lo, hi] = niceDomain(values);

  const x = (i) => P.left + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const y = (v) => P.top + ih - ((v - lo) / (hi - lo)) * ih;

  const d = data.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.yillik)}`).join(" ");
  const son = data[data.length - 1];
  const ilk = data[0];

  /* Üç yatay ızgara çizgisi — daha fazlası gürültü yapıyor */
  const ticks = [lo, (lo + hi) / 2, hi];

  return (
    <figure className="m-0">
      <figcaption className="mb-2 text-sm font-semibold text-ink">{title}</figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${title}. ${data.length} aylık seri. Son değer ${nf.format(son.yillik)} yüzde.`}
      >
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={P.left} x2={W - P.right} y1={y(t)} y2={y(t)}
              stroke={IZGARA} strokeWidth="1"
            />
            <text
              x={P.left - 8} y={y(t)} dy="0.32em" textAnchor="end"
              className="fill-[var(--brand-text-muted)] text-[10px]"
            >
              %{nf.format(t)}
            </text>
          </g>
        ))}

        {data.length > 1 ? (
          <path d={d} fill="none" stroke={SERI} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ) : null}

        {data.map((p, i) => (
          <circle
            key={p.donem}
            cx={x(i)} cy={y(p.yillik)} r="4"
            fill={SERI}
            /* 2px yüzey halkası — üst üste binen işaretleri ayırır */
            stroke="var(--brand-bg)" strokeWidth="2"
          >
            <title>{`${p.label}: %${nf.format(p.yillik)} yıllık`}</title>
          </circle>
        ))}

        {/* Doğrudan etiket sadece son noktada — her noktaya sayı yazılmaz */}
        <text
          x={x(data.length - 1) + 10} y={y(son.yillik)} dy="0.32em"
          className="fill-[var(--brand-text)] text-[11px] font-semibold"
        >
          %{nf.format(son.yillik)}
        </text>

        {/* X ekseni: sadece ilk ve son etiket — kalabalık yapmaz */}
        <text x={P.left} y={H - 8} className="fill-[var(--brand-text-muted)] text-[10px]">
          {kisaEtiket(ilk.donem)}
        </text>
        {data.length > 1 ? (
          <text x={W - P.right} y={H - 8} textAnchor="end" className="fill-[var(--brand-text-muted)] text-[10px]">
            {kisaEtiket(son.donem)}
          </text>
        ) : null}
      </svg>
    </figure>
  );
}

/* --------------------------------------------------------------- SÜTUN ---- */

function SutunGrafik({ data, title }) {
  const W = 640, H = 180;
  const P = { top: 16, right: 16, bottom: 28, left: 44 };
  const iw = W - P.left - P.right;
  const ih = H - P.top - P.bottom;

  const values = data.map((d) => d.aylik);
  const [lo, hi] = niceDomain(values, { fromZero: true });

  const bant = iw / data.length;
  const genislik = Math.min(24, bant - 2); // ≤24px, aradaki 2px yüzey boşluğu
  const y = (v) => P.top + ih - ((v - lo) / (hi - lo)) * ih;
  const taban = y(0);

  const ticks = [lo, hi];

  return (
    <figure className="m-0">
      <figcaption className="mb-2 text-sm font-semibold text-ink">{title}</figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${title}. ${data.length} aylık seri.`}
      >
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={P.left} x2={W - P.right} y1={y(t)} y2={y(t)} stroke={IZGARA} strokeWidth="1" />
            <text
              x={P.left - 8} y={y(t)} dy="0.32em" textAnchor="end"
              className="fill-[var(--brand-text-muted)] text-[10px]"
            >
              %{nf.format(t)}
            </text>
          </g>
        ))}

        {data.map((p, i) => {
          const cx = P.left + bant * i + bant / 2;
          const yy = y(p.aylik);
          const h = Math.max(2, taban - yy);
          return (
            /* Tabanda kare, veri ucunda 4px yuvarlak */
            <rect
              key={p.donem}
              x={cx - genislik / 2} y={yy}
              width={genislik} height={h}
              rx="4" ry="4"
              fill={SERI}
            >
              <title>{`${p.label}: %${nf.format(p.aylik)} aylık`}</title>
            </rect>
          );
        })}

        <text x={P.left} y={H - 8} className="fill-[var(--brand-text-muted)] text-[10px]">
          {kisaEtiket(data[0].donem)}
        </text>
        {data.length > 1 ? (
          <text x={W - P.right} y={H - 8} textAnchor="end" className="fill-[var(--brand-text-muted)] text-[10px]">
            {kisaEtiket(data[data.length - 1].donem)}
          </text>
        ) : null}
      </svg>
    </figure>
  );
}

/* ---------------------------------------------------------------- DIŞA ---- */

export default function EnflasyonGrafik({ history = [] }) {
  const data = kronolojik(history);

  /* Tek veri noktasıyla grafik anlamsız — tablo zaten sayfada var. */
  if (data.length < 2) {
    return (
      <div className="rounded-brand border border-dashed border-line bg-subtle/50 p-6 text-center">
        <p className="m-0 text-sm text-muted">
          Grafik için en az iki aylık veri gerekiyor. Şu an{" "}
          <strong className="text-ink">{data.length}</strong> ay kayıtlı — yeni
          aylar eklendikçe grafik burada görünecek.
        </p>
        <p className="mt-1 mb-0 text-xs text-muted/80">
          Veri eklemek için: <code>content/data/figures.js</code> →{" "}
          <code>tufeHistory</code>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 rounded-brand border border-line bg-canvas p-5">
      <CizgiGrafik data={data} title="Yıllık TÜFE (%)" />
      <SutunGrafik data={data} title="Aylık TÜFE (%)" />
      <p className="m-0 border-t border-line pt-3 text-[11px] leading-relaxed text-muted">
        İki ölçek çok farklı olduğu için tek grafikte birleştirilmemiştir.
        Değerlerin tamamı aşağıdaki tabloda, kaynaklarıyla birlikte yer alıyor.
      </p>
    </div>
  );
}
