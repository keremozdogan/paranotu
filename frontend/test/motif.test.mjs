/**
 * ============================================================================
 *  MOTİF SEÇİMİ TESTLERİ
 * ============================================================================
 *  Çalıştır:  npm test
 *
 *  Bu testler "hangi haber hangi grafiği alır" kararını KİLİTLER. Kalıp
 *  sözlüğünü veya ağırlıkları değiştirirsen burası kırmızıya döner —
 *  değişikliğin bilinçli olduğunu görmek için.
 *
 *  En kritik davranış: GEÇERKEN ANILAN bir kelime konuyu belirlememeli.
 *  Bu kural gevşerse "kurun enflasyona etkisi" diyen her haber kur
 *  görseli alır ve görsel bilgi taşımayı bırakır.
 * ============================================================================
 */

import test from "node:test";
import assert from "node:assert/strict";

import { resolveMotifKey, MOTIF_KEYS } from "../src/lib/motif.js";

test("elle verilen motif her şeyin önüne geçer", () => {
  const key = resolveMotifKey({
    motif: "altin",
    section: "turkiye",
    title: "Enflasyon verisi açıklandı",
  });
  assert.equal(key, "altin");
});

test("geçersiz elle motif yok sayılır, otomatik seçim devam eder", () => {
  const key = resolveMotifKey({
    motif: "boyle-bir-motif-yok",
    section: "turkiye",
    title: "Enflasyon verisi açıklandı",
  });
  assert.equal(key, "enflasyon");
});

test("sembol yapısal sinyaldir: USDTRY → döviz", () => {
  const key = resolveMotifKey({
    section: "piyasalar",
    symbols: ["USDTRY"],
    title: "Piyasalarda günün özeti",
  });
  assert.equal(key, "doviz");
});

test("sembol: XAUUSD → altın, XU100 → borsa, BTCUSD → kripto", () => {
  assert.equal(resolveMotifKey({ section: "piyasalar", symbols: ["XAUUSD"] }), "altin");
  assert.equal(resolveMotifKey({ section: "piyasalar", symbols: ["XU100"] }), "borsa");
  assert.equal(resolveMotifKey({ section: "piyasalar", symbols: ["BTCUSD"] }), "kripto");
});

test("etiket doğrudan motif anahtarıysa kullanılır", () => {
  const key = resolveMotifKey({ section: "turkiye", tags: ["faiz"] });
  assert.equal(key, "faiz");
});

test("etiketteki Türkçe karakter ve büyük harf sorun çıkarmaz", () => {
  assert.equal(resolveMotifKey({ section: "piyasalar", tags: ["ALTIN"] }), "altin");
  assert.equal(resolveMotifKey({ section: "turkiye", tags: ["Asgari Ücret"] }), "asgari-ucret");
});

test("başlıktaki güçlü kalıp bölümü yener", () => {
  /* Bölüm "Türkiye Ekonomisi" ama haber asgari ücret haberi. */
  const key = resolveMotifKey({
    section: "turkiye",
    title: "Asgari ücrete ara zam gündemde",
  });
  assert.equal(key, "asgari-ucret");
});

test("aynı bölümdeki iki haber FARKLI motif alır", () => {
  const a = resolveMotifKey({ section: "turkiye", title: "Enflasyon temmuzda geriledi" });
  const b = resolveMotifKey({ section: "turkiye", title: "Asgari ücret zammı tartışılıyor" });
  assert.notEqual(a, b, "aynı bölümdeki farklı konular aynı grafiği almamalı");
});

test("⚠️ geçerken anılan kelime konuyu belirlemez", () => {
  /* "dolar" yalnızca özette, zayıf sinyal olarak geçiyor; haber bir
     enflasyon haberi. Kur motifine kaymamalı. */
  const key = resolveMotifKey({
    section: "turkiye",
    title: "Enflasyon temmuzda beklentinin altında kaldı",
    summary: "Veride dolar kurundaki seyrin etkisi tartışılıyor.",
  });
  assert.equal(key, "enflasyon");
});

test("hiçbir sinyal yoksa bölüme düşer", () => {
  const key = resolveMotifKey({ section: "dunya", title: "Günün gelişmeleri" });
  assert.equal(key, "dunya");
});

test("bölüm de sinyal de yoksa güvenli bir varsayılan döner", () => {
  const key = resolveMotifKey({});
  assert.ok(MOTIF_KEYS.has(key), "dönen anahtar geçerli bir motif olmalı");
});

test("her zaman geçerli bir motif anahtarı döner", () => {
  const ornekler = [
    { section: "turkiye", title: "Merkez Bankası faiz kararını açıkladı" },
    { section: "borsa", title: "BIST 100 rekor tazeledi", symbols: ["XU100"] },
    { section: "altin", title: "Gram altın yükselişte" },
    { section: "doviz", summary: "euro" },
    { title: "" },
  ];
  for (const o of ornekler) {
    assert.ok(MOTIF_KEYS.has(resolveMotifKey(o)), `geçersiz anahtar: ${JSON.stringify(o)}`);
  }
});

test("saf fonksiyon: aynı girdi her zaman aynı sonucu verir", () => {
  /* Hydration uyuşmazlığını önleyen ŞART budur. */
  const girdi = {
    section: "piyasalar",
    tags: ["altin", "doviz"],
    symbols: ["XAUUSD", "USDTRY"],
    title: "Altın ve dolar aynı gün yön değiştirdi",
  };
  const ilk = resolveMotifKey(girdi);
  for (let i = 0; i < 20; i += 1) {
    assert.equal(resolveMotifKey(girdi), ilk);
  }
});
