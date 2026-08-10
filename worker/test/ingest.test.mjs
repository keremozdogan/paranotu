/**
 * ============================================================================
 *  ÇEKİM KATMANI TESTLERİ — tarih ayrıştırma
 * ============================================================================
 *  Çalıştır:  node --test test/
 *
 *  Neden bu testler var: TCMB Atom beslemeleri tarihi Türkçe yazıyor
 *  ("7 Ağu 2026 09:00:02"). `new Date()` bunu anlamaz ve SESSİZCE
 *  Invalid Date döner — kayıt girer ama tarihsiz kalır, tazelik puanı
 *  alamaz, en güvenilir kaynağımız sıralamada dibe düşer.
 *
 *  Saat dilimi kısmı ayrıca kritik: besleme Türkiye yerel saatini (UTC+3)
 *  yazar, saat dilimi belirtmez. Çevirmezsek haberler 3 saat ileri görünür.
 * ============================================================================
 */

import test from "node:test";
import assert from "node:assert/strict";

import { parseFeedDate } from "../src/ingest.js";

test("standart biçimler bozulmadan geçer (ISO 8601)", () => {
  assert.equal(parseFeedDate("2026-08-07T09:00:02Z"), "2026-08-07T09:00:02.000Z");
});

test("standart biçimler bozulmadan geçer (RFC 822)", () => {
  assert.equal(parseFeedDate("Fri, 07 Aug 2026 09:00:02 GMT"), "2026-08-07T09:00:02.000Z");
});

test("TCMB Türkçe tarihi: kısa ay adı, TSİ → UTC (-3 saat)", () => {
  /* Beslemedeki "7 Ağu 2026 09:00:02" Türkiye saatidir → UTC 06:00:02 */
  assert.equal(parseFeedDate("7 Ağu 2026 09:00:02"), "2026-08-07T06:00:02.000Z");
});

test("Türkçe uzun ay adı da anlaşılır", () => {
  assert.equal(parseFeedDate("30 Temmuz 2026 14:00:00"), "2026-07-30T11:00:00.000Z");
});

test("büyük/küçük harf ve Türkçe karakter farkı sonucu değiştirmez", () => {
  const beklenen = "2026-08-07T06:00:02.000Z";
  assert.equal(parseFeedDate("7 AĞU 2026 09:00:02"), beklenen);
  assert.equal(parseFeedDate("7 agu 2026 09:00:02"), beklenen);
});

test("saatsiz Türkçe tarih gece yarısı TSİ sayılır", () => {
  /* 5 Ocak 2026 00:00 TSİ → 4 Ocak 21:00 UTC */
  assert.equal(parseFeedDate("5 Ocak 2026"), "2026-01-04T21:00:00.000Z");
});

test("ay başında saat farkı günü geriye taşıyabilir — bu GEÇERLİdir", () => {
  /* 1 Mart 01:00 TSİ → 28 Şubat 22:00 UTC. Takvim doğrulaması bunu elemez. */
  assert.equal(parseFeedDate("1 Mart 2026 01:00:00"), "2026-02-28T22:00:00.000Z");
});

test("her Türkçe ay adı tanınır", () => {
  const aylar = [
    ["Oca", "01"], ["Şub", "02"], ["Mar", "03"], ["Nis", "04"],
    ["May", "05"], ["Haz", "06"], ["Tem", "07"], ["Ağu", "08"],
    ["Eyl", "09"], ["Eki", "10"], ["Kas", "11"], ["Ara", "12"],
  ];
  for (const [ad, no] of aylar) {
    const sonuc = parseFeedDate(`15 ${ad} 2026 12:00:00`);
    assert.equal(sonuc, `2026-${no}-15T09:00:00.000Z`, `${ad} ayı yanlış çözüldü`);
  }
});

test("geçersiz takvim tarihi sessizce kaydırılmaz, null döner", () => {
  /* new Date(2026, 1, 31) → 3 Mart'a kayar. Uydurma tarih üretmiyoruz. */
  assert.equal(parseFeedDate("31 Şubat 2026 10:00:00"), null);
});

test("tanınmayan ay adı null döner", () => {
  assert.equal(parseFeedDate("7 Blah 2026 09:00:02"), null);
});

test("boş ve anlamsız girdiler null döner", () => {
  assert.equal(parseFeedDate(null), null);
  assert.equal(parseFeedDate(undefined), null);
  assert.equal(parseFeedDate(""), null);
  assert.equal(parseFeedDate("   "), null);
  assert.equal(parseFeedDate("yakında"), null);
});
