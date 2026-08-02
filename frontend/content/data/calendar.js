/**
 * ============================================================================
 *  EKONOMİK TAKVİM — editoryal kayıt
 * ============================================================================
 *  Yaklaşan veri açıklamaları ve karar toplantıları. `figures.js` ile aynı
 *  disiplin geçerlidir: DOĞRULAYAMADIĞIN KAYDI EKLEME.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  `confirmed` alanı
 *  ────────────────────────────────────────────────────────────────────────
 *    true  → Kurumun yayımladığı resmî takvimden BİREBİR doğrulandı.
 *    false → Kurumun bilinen kuralından türetildi; kayabilir.
 *            Arayüz bu kayıtların yanına "tahmini" yazar.
 *
 *  Bir tarihi `confirmed: true` yapmadan önce kurumun yayın takvimini aç ve
 *  gör. Yanlış tarih, sitenin güvenilirliğine en hızlı zarar veren şeydir.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  BAKIM
 *  ────────────────────────────────────────────────────────────────────────
 *  • Ay başında geçmiş kayıtları sil, yeni ayı ekle.
 *  • TCMB PPK, Fed FOMC ve ECB toplantı tarihleri yıllık olarak önceden
 *    yayımlanır — yıl başında resmî takvimden toplu girilmeli.
 *  • Bir açıklama gerçekleştiğinde ilgili rakamı `figures.js` içinde
 *    güncellemeyi unutma.
 * ============================================================================
 */

/** Takvimin künyesi — arayüzde "Kaynak" satırını besler. */
export const calendarSource = {
  name: "ParaNotu editoryal takvimi",
  url: null,
  license: "Kurumların herkese açık yayın takvimlerinden derlenmiştir.",
};

/**
 * TÜİK TÜFE açıklamaları.
 *
 * KURAL: Her ayın 3'ünde saat 10:00'da, bir önceki ay için. 3'ü hafta sonu
 * veya resmî tatile denk gelirse ilk iş gününe kayar.
 *
 * ⚠️ Hepsi `confirmed: false` — kural bazlı türetildiler. TÜİK'in yayın
 * takvimi iş gününde bile kayabiliyor (örn. Mayıs 2026 verisi, Kurban
 * Bayramı veri toplamayı kısalttığı için 3 Haziran yerine 5 Haziran'da
 * açıklandı). Yayın öncesi teyit et ve `confirmed: true` yap.
 */
const tuikTufe = [
  { id: "tuik-tufe-2026-07", title: "Temmuz 2026 TÜFE", date: "2026-08-03", time: "10:00" },
  { id: "tuik-tufe-2026-08", title: "Ağustos 2026 TÜFE", date: "2026-09-03", time: "10:00" },
  /* 3 Ekim 2026 Cumartesi → ilk iş günü Pazartesi 5 Ekim */
  { id: "tuik-tufe-2026-09", title: "Eylül 2026 TÜFE", date: "2026-10-05", time: "10:00" },
  { id: "tuik-tufe-2026-10", title: "Ekim 2026 TÜFE", date: "2026-11-03", time: "10:00" },
  { id: "tuik-tufe-2026-11", title: "Kasım 2026 TÜFE", date: "2026-12-03", time: "10:00" },
  /* 3 Ocak 2027 Pazar → ilk iş günü Pazartesi 4 Ocak */
  { id: "tuik-tufe-2026-12", title: "Aralık 2026 TÜFE", date: "2027-01-04", time: "10:00" },
].map((e) => ({
  ...e,
  institution: "TÜİK",
  country: "TR",
  impact: "high",
  confirmed: false,
  sourceUrl: "https://data.tuik.gov.tr/Bulten/Index?p=Tuketici-Fiyat-Endeksi",
}));

/**
 * TCMB Para Politikası Kurulu (PPK) faiz kararları.
 *
 * ⚠️ BOŞ BIRAKILDI — BİLİNÇLİ.
 * TCMB yıllık PPK takvimini önceden yayımlar, ancak buraya elle
 * doğrulanmadan tarih girilmemelidir. Faiz kararı tarihi piyasanın en çok
 * izlediği veridir; yanlış tarih doğrudan güven kaybıdır.
 *
 * DOLDURMAK İÇİN: tcmb.gov.tr → Para Politikası → PPK Toplantı Takvimi
 * adresinden tarihleri al, `confirmed: true` ile ekle.
 */
const tcmbPpk = [];

/**
 * Fed (FOMC) ve ECB faiz kararları.
 *
 * ⚠️ BOŞ BIRAKILDI — yukarıdaki gerekçenin aynısı.
 * Fed: federalreserve.gov → FOMC Meeting Calendars
 * ECB: ecb.europa.eu → Governing Council meeting dates
 */
const globalCentralBanks = [];

/**
 * Diğer TÜİK verileri (işsizlik, büyüme, sanayi üretimi).
 *
 * ⚠️ BOŞ BIRAKILDI — bu serilerin yayın günü TÜFE kadar sabit bir kurala
 * bağlı değil. TÜİK'in "Veri Yayımlama Takvimi" sayfasından doğrulanmalı.
 */
const tuikOther = [];

/** Tüm olaylar — provider bunları tarihe göre sıralar ve pencereye kırpar. */
const calendarEvents = [...tuikTufe, ...tcmbPpk, ...globalCentralBanks, ...tuikOther];

export default calendarEvents;
