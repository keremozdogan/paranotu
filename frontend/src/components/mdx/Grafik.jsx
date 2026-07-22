/**
 * ============================================================================
 *  YAZI İÇİ GRAFİKLER — MDX'ten çağrılır, sunucuda SVG olarak render edilir
 * ============================================================================
 *  Kullanım (prop'lar STRING — MDX dizi ifadelerini boş geçirdiği için):
 *
 *    <Sutun veri="Kira:7500|Market:4500|Ulaşım:1400" birim="₺" />
 *    <Yigin veri="İhtiyaç:54|İstek:16|Birikim:30" birim="%" />
 *    <Cizgi seriler="1.500 ₺:20000,19300,18572|2.500 ₺:20000,18300,16532"
 *           etiketler="0.ay,1.ay,2.ay" />
 *
 *  PALET (doğrulanmış)
 *   #6366f1 · #059669 · #ea580c — parlaklık bandı, kroma, renk körlüğü ayrımı
 *   ve kontrast kontrollerinin TAMAMINDAN hem açık hem koyu yüzeyde geçti.
 *   Renk eklemek istersen doğrulamadan ekleme.
 *
 *  KURALLAR
 *   • Çift eksen yok. İki farklı ölçek = iki ayrı grafik.
 *   • Metin asla seri rengini giymez — ink/muted token'ları kullanır.
 *   • Kimlik hiçbir zaman yalnızca renkle taşınmaz: her segmentin/serinin
 *     görünür etiketi var.
 *   • Her grafiğin altında değerler yazıyla da bulunur (tablo görünümü).
 * ============================================================================
 */

const PALET = ["#6366f1", "#059669", "#ea580c"];
const IZGARA = "var(--brand-border)";

const nf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 });

/** "Kira:7500|Market:4500" → [{ad:"Kira", deger:7500}, ...] */
function parseVeri(veri) {
  return String(veri || "")
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const i = p.lastIndexOf(":");
      return {
        ad: p.slice(0, i).trim(),
        deger: Number(p.slice(i + 1).replace(",", ".")),
      };
    })
    .filter((d) => d.ad && Number.isFinite(d.deger));
}

/** "Ad:1,2,3|Ad2:4,5,6" → [{ad, degerler:[...]}] */
function parseSeriler(seriler) {
  return String(seriler || "")
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const i = p.indexOf(":");
      return {
        ad: p.slice(0, i).trim(),
        degerler: p
          .slice(i + 1)
          .split(",")
          .map((v) => Number(v.trim()))
          .filter(Number.isFinite),
      };
    })
    .filter((s) => s.ad && s.degerler.length);
}

function bicim(v, birim) {
  return birim === "%" ? `%${nf.format(v)}` : `${nf.format(v)}${birim ? ` ${birim}` : ""}`;
}

function Sarmal({ baslik, not, children }) {
  return (
    <figure className="not-prose my-8 rounded-brand border border-line bg-canvas p-5">
      {baslik ? (
        <figcaption className="mb-4 text-sm font-semibold text-ink">{baslik}</figcaption>
      ) : null}
      {children}
      {not ? <p className="mt-3 mb-0 text-[11px] leading-relaxed text-muted">{not}</p> : null}
    </figure>
  );
}

/* ========================================================== YATAY SÜTUN ==== */

/**
 * Yatay sütun — kategori adları uzun olduğunda dikey sütundan çok daha okunur.
 * Tek serili olduğu için tek renk kullanır; lejant gerekmez.
 */
export function Sutun({ veri, birim = "₺", baslik, not, vurgu }) {
  const data = parseVeri(veri);
  if (!data.length) return null;

  const max = Math.max(...data.map((d) => d.deger));
  const vurguSet = new Set(
    String(vurgu || "").split("|").map((s) => s.trim()).filter(Boolean),
  );

  return (
    <Sarmal baslik={baslik} not={not}>
      <div className="space-y-2.5">
        {data.map((d) => {
          const oran = max > 0 ? (d.deger / max) * 100 : 0;
          const renk = vurguSet.has(d.ad) ? PALET[2] : PALET[0];
          return (
            <div key={d.ad}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-ink">{d.ad}</span>
                {/* Doğrudan etiket — kontrast uyarısına karşı zorunlu çare */}
                <span className="shrink-0 font-mono tabular-nums text-muted">
                  {bicim(d.deger, birim)}
                </span>
              </div>
              <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-subtle">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(oran, 1.5)}%`, background: renk }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Sarmal>
  );
}

/* ============================================================ YIĞIN BAR ==== */

/**
 * Tek satırlık yığın çubuk — bir bütünün paylarını gösterir (bütçe kovaları).
 * Segmentler arasında 2px yüzey boşluğu var; her segmentin altında adı yazılı.
 */
export function Yigin({ veri, birim = "%", baslik, not }) {
  const data = parseVeri(veri);
  if (!data.length) return null;

  const toplam = data.reduce((s, d) => s + d.deger, 0) || 1;

  return (
    <Sarmal baslik={baslik} not={not}>
      <div className="flex h-8 w-full gap-[2px] overflow-hidden rounded-lg">
        {data.map((d, i) => (
          <div
            key={d.ad}
            title={`${d.ad}: ${bicim(d.deger, birim)}`}
            style={{
              width: `${(d.deger / toplam) * 100}%`,
              background: PALET[i % PALET.length],
            }}
            className="first:rounded-l-lg last:rounded-r-lg"
          />
        ))}
      </div>

      {/* Lejant — kimlik renge bırakılmaz */}
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {data.map((d, i) => (
          <li key={d.ad} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden="true"
              className="h-3 w-3 shrink-0 rounded-sm"
              style={{ background: PALET[i % PALET.length] }}
            />
            <span className="text-ink">{d.ad}</span>
            <span className="font-mono tabular-nums text-muted">
              {bicim(d.deger, birim)}
            </span>
          </li>
        ))}
      </ul>
    </Sarmal>
  );
}

/* ================================================================ ÇİZGİ ==== */

/**
 * Çok serili çizgi — zaman içindeki değişim (borç eritme, birikim büyümesi).
 * En fazla 3 seri; daha fazlası için grafiği böl.
 */
export function Cizgi({ seriler, etiketler, birim = "₺", baslik, not }) {
  const data = parseSeriler(seriler).slice(0, PALET.length);
  if (!data.length) return null;

  const labels = String(etiketler || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const n = Math.max(...data.map((s) => s.degerler.length));
  const tumDegerler = data.flatMap((s) => s.degerler);
  const max = Math.max(...tumDegerler);
  const min = Math.min(0, ...tumDegerler);

  const W = 640, H = 240;
  const P = { top: 16, right: 16, bottom: 30, left: 62 };
  const iw = W - P.left - P.right;
  const ih = H - P.top - P.bottom;

  const x = (i) => P.left + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v) => P.top + ih - ((v - min) / (max - min || 1)) * ih;

  const ticks = [min, min + (max - min) / 2, max];
  const kisaBirim = (v) =>
    v >= 1000 ? `${nf.format(Math.round(v / 1000))}b` : nf.format(v);

  return (
    <Sarmal baslik={baslik} not={not}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${baslik ?? "Grafik"}. ${data.length} seri: ${data.map((s) => s.ad).join(", ")}.`}
      >
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={P.left} x2={W - P.right} y1={y(t)} y2={y(t)} stroke={IZGARA} strokeWidth="1" />
            <text
              x={P.left - 8} y={y(t)} dy="0.32em" textAnchor="end"
              className="fill-[var(--brand-text-muted)] text-[10px]"
            >
              {kisaBirim(t)}
            </text>
          </g>
        ))}

        {data.map((s, si) => {
          const d = s.degerler
            .map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`)
            .join(" ");
          return (
            <g key={s.ad}>
              <path
                d={d} fill="none"
                stroke={PALET[si]} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
              />
              {/* Son noktada uç işareti — 2px yüzey halkasıyla */}
              <circle
                cx={x(s.degerler.length - 1)}
                cy={y(s.degerler[s.degerler.length - 1])}
                r="4" fill={PALET[si]}
                stroke="var(--brand-bg)" strokeWidth="2"
              >
                <title>{`${s.ad}: ${bicim(s.degerler[s.degerler.length - 1], birim)}`}</title>
              </circle>
            </g>
          );
        })}

        {labels.length ? (
          <>
            <text x={P.left} y={H - 8} className="fill-[var(--brand-text-muted)] text-[10px]">
              {labels[0]}
            </text>
            <text
              x={W - P.right} y={H - 8} textAnchor="end"
              className="fill-[var(--brand-text-muted)] text-[10px]"
            >
              {labels[labels.length - 1]}
            </text>
          </>
        ) : null}
      </svg>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {data.map((s, i) => (
          <li key={s.ad} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden="true"
              className="h-0.5 w-4 shrink-0 rounded-full"
              style={{ background: PALET[i] }}
            />
            <span className="text-ink">{s.ad}</span>
          </li>
        ))}
      </ul>
    </Sarmal>
  );
}
