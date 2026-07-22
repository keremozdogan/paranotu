"use client";

/**
 * "Maaşım enflasyona yenildi mi?" hesaplayıcısı.
 *
 * REKLAM POLİTİKASI UYARISI:
 * Bu bileşenin ÇEVRESİNE, özellikle sonuç kutusunun hemen bitişiğine reklam
 * KOYMA. AdSense'in "kaza tıklaması" (accidental click) politikası, etkileşimli
 * öğelerin dibindeki reklamları ihlal sayar. Reklam ancak sayfanın başka bir
 * bölümünde, belirgin boşlukla ayrılmış olarak durabilir.
 */

import { useMemo, useState } from "react";
import figures from "~/content/data/figures";

const nf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 });
const cf = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

function parseNumber(value) {
  const cleaned = String(value).replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

const fieldClass =
  "w-full rounded-lg border border-line bg-canvas px-4 py-2.5 text-base text-ink outline-none transition-colors placeholder:text-muted focus:border-primary-500 tabular-nums";

export default function EnflasyonHesaplayici() {
  const [oncekiMaas, setOncekiMaas] = useState("");
  const [simdikiMaas, setSimdikiMaas] = useState("");
  const [enflasyon, setEnflasyon] = useState(String(figures.tufeYillik.value).replace(".", ","));

  const sonuc = useMemo(() => {
    const onceki = parseNumber(oncekiMaas);
    const simdiki = parseNumber(simdikiMaas);
    const enf = parseNumber(enflasyon);

    if (!onceki || !simdiki || enf === null || onceki <= 0) return null;

    /* Nominal değişim: cebindeki rakamın büyümesi */
    const nominal = (simdiki - onceki) / onceki;

    /* Reel değişim: alım gücündeki gerçek değişim
       reel = ((1 + nominal) / (1 + enflasyon)) - 1
       Kabaca çıkarma yapmak yüksek enflasyonda yanıltır, o yüzden tam formül. */
    const reel = (1 + nominal) / (1 + enf / 100) - 1;

    /* Bir yıl önceki maaşın bugünkü alım gücü karşılığı */
    const korunmusMaas = onceki * (1 + enf / 100);
    const fark = simdiki - korunmusMaas;

    return {
      nominal: nominal * 100,
      reel: reel * 100,
      korunmusMaas,
      fark,
      kazandi: reel >= 0,
    };
  }, [oncekiMaas, simdikiMaas, enflasyon]);

  return (
    <div className="not-prose rounded-brand border border-line bg-canvas p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="onceki" className="mb-1.5 block text-sm font-medium text-ink">
            1 yıl önceki net maaşın
          </label>
          <input
            id="onceki"
            inputMode="decimal"
            value={oncekiMaas}
            onChange={(e) => setOncekiMaas(e.target.value)}
            placeholder="örn. 22.000"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="simdiki" className="mb-1.5 block text-sm font-medium text-ink">
            Bugünkü net maaşın
          </label>
          <input
            id="simdiki"
            inputMode="decimal"
            value={simdikiMaas}
            onChange={(e) => setSimdikiMaas(e.target.value)}
            placeholder="örn. 28.075"
            className={fieldClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="enflasyon" className="mb-1.5 block text-sm font-medium text-ink">
            Yıllık enflasyon (%)
          </label>
          <input
            id="enflasyon"
            inputMode="decimal"
            value={enflasyon}
            onChange={(e) => setEnflasyon(e.target.value)}
            className={fieldClass}
          />
          <p className="mt-1.5 text-xs text-muted">
            Varsayılan değer {figures.tufeYillik.period} TÜFE oranıdır (
            {figures.tufeYillik.display}).{" "}
            <a
              href={figures.tufeYillik.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 underline underline-offset-2"
            >
              Kaynak: {figures.tufeYillik.source}
            </a>
            . Kendi dönemine göre değiştirebilirsin.
          </p>
        </div>
      </div>

      {/* Sonuç — hesaplama anlık, "Hesapla" butonu yok.
          Buton olmaması, buton-bitişiği reklam ihlali riskini de ortadan kaldırır. */}
      <div
        aria-live="polite"
        className="mt-6 border-t border-line pt-5"
      >
        {sonuc ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-brand bg-subtle/60 p-4 text-center">
                <span className="block text-xs font-medium uppercase tracking-wide text-muted">
                  Nominal artış
                </span>
                <span className="mt-1 block font-mono text-2xl font-bold tabular-nums text-ink">
                  {sonuc.nominal >= 0 ? "+" : ""}
                  {nf.format(sonuc.nominal)}%
                </span>
                <span className="mt-1 block text-[11px] text-muted">
                  Cebindeki rakamın büyümesi
                </span>
              </div>

              <div
                className={`rounded-brand p-4 text-center ${
                  sonuc.kazandi ? "bg-primary-50" : "bg-red-50"
                }`}
              >
                <span className="block text-xs font-medium uppercase tracking-wide text-muted">
                  Reel değişim
                </span>
                <span
                  className={`mt-1 block font-mono text-2xl font-bold tabular-nums ${
                    sonuc.kazandi ? "text-primary-700" : "text-red-700"
                  }`}
                >
                  {sonuc.reel >= 0 ? "+" : ""}
                  {nf.format(sonuc.reel)}%
                </span>
                <span className="mt-1 block text-[11px] text-muted">
                  Alım gücündeki gerçek değişim
                </span>
              </div>

              <div className="rounded-brand bg-subtle/60 p-4 text-center">
                <span className="block text-xs font-medium uppercase tracking-wide text-muted">
                  Başa baş maaş
                </span>
                <span className="mt-1 block font-mono text-2xl font-bold tabular-nums text-ink">
                  {cf.format(sonuc.korunmusMaas)}
                </span>
                <span className="mt-1 block text-[11px] text-muted">
                  Alım gücünü korumak için gereken
                </span>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-ink">
              {sonuc.kazandi ? (
                <>
                  Maaşın enflasyonun{" "}
                  <strong className="text-primary-700">üstünde</strong> arttı. Alım
                  gücün {nf.format(Math.abs(sonuc.reel))}% oranında{" "}
                  <strong>yükseldi</strong>. Aradaki fark aylık{" "}
                  <strong>{cf.format(Math.abs(sonuc.fark))}</strong> —
                  bu tutarı birikim oranını artırmak için kullanabilirsin.
                </>
              ) : (
                <>
                  Maaşın enflasyonun{" "}
                  <strong className="text-red-700">altında</strong> kaldı. Rakam
                  büyümüş olsa da alım gücün{" "}
                  {nf.format(Math.abs(sonuc.reel))}% oranında{" "}
                  <strong>azaldı</strong>. Aynı alım gücüne sahip olmak için
                  maaşının {cf.format(sonuc.korunmusMaas)} olması gerekirdi —
                  aylık <strong>{cf.format(Math.abs(sonuc.fark))}</strong> fark var.
                </>
              )}
            </p>
          </>
        ) : (
          <p className="text-center text-sm text-muted">
            İki maaş tutarını gir, sonuç anında hesaplansın.
          </p>
        )}
      </div>

      <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-muted">
        Hesaplama <code className="text-[11px]">reel = ((1 + nominal) / (1 + enflasyon)) − 1</code>{" "}
        formülünü kullanır. Yüksek enflasyonda &quot;nominal − enflasyon&quot;
        kestirmesi yanıltıcı olduğu için tam formül tercih edilmiştir. Sonuçlar
        genel bilgilendirme amaçlıdır.
      </p>
    </div>
  );
}
