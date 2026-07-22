"use client";

/**
 * 50/30/20 bütçe hesaplayıcısı — hedef oranla GERÇEK oranını karşılaştırır.
 *
 * Rakiplerden farkı: sadece "gelirini üçe böl" demiyor, kullanıcının kendi
 * harcamalarını alıp gerçek oranını gösteriyor ve açığı TL olarak veriyor.
 *
 * REKLAM POLİTİKASI: Sonuç kutusunun bitişiğine reklam koyma (kaza tıklaması).
 */

import { useMemo, useState } from "react";

const cf = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});
const nf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 });

function parseNumber(value) {
  const cleaned = String(value).replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

const IHTIYAC_KALEMLERI = [
  { key: "kira", label: "Kira" },
  { key: "fatura", label: "Fatura + internet" },
  { key: "market", label: "Market" },
  { key: "ulasim", label: "Ulaşım" },
  { key: "saglik", label: "Zorunlu sağlık / sigorta" },
];

const ISTEK_KALEMLERI = [
  { key: "disarida", label: "Dışarıda yemek, kahve" },
  { key: "abonelik", label: "Abonelikler" },
  { key: "sosyal", label: "Sosyal hayat, hobi" },
  { key: "diger", label: "Diğer" },
];

const fieldClass =
  "w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-primary-500 tabular-nums";

function Bar({ label, ratio, target, tone }) {
  const width = Math.min(100, Math.max(0, ratio));
  const tones = {
    ihtiyac: "bg-accent-500",
    istek: "bg-amber-500",
    birikim: "bg-primary-500",
  };

  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="font-mono tabular-nums text-muted">
          <strong className="text-ink">{nf.format(ratio)}%</strong>
          <span className="ml-1.5 text-xs">hedef {target}%</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-subtle">
        <div
          className={`h-full rounded-full transition-all ${tones[tone]}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function ButceHesaplayici() {
  const [gelir, setGelir] = useState("");
  const [giderler, setGiderler] = useState({});

  const set = (key) => (e) =>
    setGiderler((prev) => ({ ...prev, [key]: e.target.value }));

  const sonuc = useMemo(() => {
    const net = parseNumber(gelir);
    if (net <= 0) return null;

    const ihtiyac = IHTIYAC_KALEMLERI.reduce(
      (sum, k) => sum + parseNumber(giderler[k.key]),
      0,
    );
    const istek = ISTEK_KALEMLERI.reduce(
      (sum, k) => sum + parseNumber(giderler[k.key]),
      0,
    );
    const kalan = net - ihtiyac - istek;

    return {
      net,
      ihtiyac,
      istek,
      kalan,
      ihtiyacOran: (ihtiyac / net) * 100,
      istekOran: (istek / net) * 100,
      kalanOran: (kalan / net) * 100,
      hedefIhtiyac: net * 0.5,
      hedefIstek: net * 0.3,
      hedefBirikim: net * 0.2,
      acikVar: kalan < 0,
    };
  }, [gelir, giderler]);

  return (
    <div className="not-prose rounded-brand border border-line bg-canvas p-5 sm:p-6">
      {/* Gelir */}
      <div>
        <label htmlFor="gelir" className="mb-1.5 block text-sm font-semibold text-ink">
          Aylık net gelirin
        </label>
        <input
          id="gelir"
          inputMode="decimal"
          value={gelir}
          onChange={(e) => setGelir(e.target.value)}
          placeholder="örn. 28.075"
          className={`${fieldClass} py-2.5 text-base`}
        />
      </div>

      {/* Giderler */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <fieldset>
          <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
            İhtiyaçlar
          </legend>
          <div className="space-y-2">
            {IHTIYAC_KALEMLERI.map((k) => (
              <div key={k.key} className="flex items-center gap-2">
                <label htmlFor={k.key} className="w-1/2 shrink-0 text-sm text-muted">
                  {k.label}
                </label>
                <input
                  id={k.key}
                  inputMode="decimal"
                  value={giderler[k.key] ?? ""}
                  onChange={set(k.key)}
                  placeholder="0"
                  className={fieldClass}
                />
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
            İstekler
          </legend>
          <div className="space-y-2">
            {ISTEK_KALEMLERI.map((k) => (
              <div key={k.key} className="flex items-center gap-2">
                <label htmlFor={k.key} className="w-1/2 shrink-0 text-sm text-muted">
                  {k.label}
                </label>
                <input
                  id={k.key}
                  inputMode="decimal"
                  value={giderler[k.key] ?? ""}
                  onChange={set(k.key)}
                  placeholder="0"
                  className={fieldClass}
                />
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Sonuç */}
      <div aria-live="polite" className="mt-6 border-t border-line pt-5">
        {sonuc ? (
          <>
            <div className="space-y-4">
              <Bar label="İhtiyaçlar" ratio={sonuc.ihtiyacOran} target={50} tone="ihtiyac" />
              <Bar label="İstekler" ratio={sonuc.istekOran} target={30} tone="istek" />
              <Bar
                label={sonuc.acikVar ? "Açık" : "Birikime kalan"}
                ratio={Math.abs(sonuc.kalanOran)}
                target={20}
                tone="birikim"
              />
            </div>

            <div
              className={`mt-5 rounded-brand p-4 ${
                sonuc.acikVar ? "bg-red-50" : "bg-primary-50"
              }`}
            >
              {sonuc.acikVar ? (
                <p className="text-sm leading-relaxed text-red-900">
                  <strong>Bütçen açık veriyor.</strong> Giderlerin gelirini{" "}
                  <strong>{cf.format(Math.abs(sonuc.kalan))}</strong> aşıyor. Önce
                  bu açığı kapatmadan birikim planı yapmak işe yaramaz — en büyük
                  kalem olan kira, ulaşım veya markette bir değişiklik, küçük
                  harcamaları kısmaktan çok daha etkili olur.
                </p>
              ) : (
                <p className="text-sm leading-relaxed text-primary-900">
                  Birikime <strong>{cf.format(sonuc.kalan)}</strong> kalıyor —
                  gelirinin <strong>{nf.format(sonuc.kalanOran)}%</strong>&apos;i.{" "}
                  {sonuc.kalanOran >= 20
                    ? "Bu, 50/30/20 hedefinin üstünde. Bu tutarı maaş günü otomatik talimatla ayırmak, ay sonunu beklemekten çok daha güvenli."
                    : `Hedef olan %20'ye ulaşmak için ayda ${cf.format(
                        sonuc.hedefBirikim - sonuc.kalan,
                      )} daha ayırman gerekir. Oran tutmuyorsa %10 ile başlayıp üç ayda bir artırmak gerçekçi bir yol.`}
                </p>
              )}
            </div>

            <table className="mt-5 w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 font-semibold">Kova</th>
                  <th className="py-2 text-right font-semibold">Senin</th>
                  <th className="py-2 text-right font-semibold">Hedef</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                <tr className="border-b border-line">
                  <td className="py-2">İhtiyaçlar</td>
                  <td className="py-2 text-right font-mono">{cf.format(sonuc.ihtiyac)}</td>
                  <td className="py-2 text-right font-mono text-muted">
                    {cf.format(sonuc.hedefIhtiyac)}
                  </td>
                </tr>
                <tr className="border-b border-line">
                  <td className="py-2">İstekler</td>
                  <td className="py-2 text-right font-mono">{cf.format(sonuc.istek)}</td>
                  <td className="py-2 text-right font-mono text-muted">
                    {cf.format(sonuc.hedefIstek)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold">Birikim</td>
                  <td className="py-2 text-right font-mono font-semibold">
                    {cf.format(sonuc.kalan)}
                  </td>
                  <td className="py-2 text-right font-mono text-muted">
                    {cf.format(sonuc.hedefBirikim)}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ) : (
          <p className="text-center text-sm text-muted">
            Net gelirini gir, harcamalarını doldurdukça oranların anlık hesaplanır.
          </p>
        )}
      </div>

      <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-muted">
        Girdiğin hiçbir veri sunucuya gönderilmez, tarayıcında hesaplanır ve
        kaydedilmez. Sonuçlar genel bilgilendirme amaçlıdır.
      </p>
    </div>
  );
}
