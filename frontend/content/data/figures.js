/**
 * ============================================================================
 *  DOĞRULANMIŞ RAKAMLAR — TEK KAYNAK
 * ============================================================================
 *  Sitedeki HER resmî rakam buradan gelir. Yazılara sabit sayı yazma.
 *
 *  MDX içinde kullanım:
 *      <Rakam id="tufeYillik" />              → %32,11 (kaynak linkiyle)
 *      <Rakam id="asgariNet" />               → 28.075,50 ₺
 *      <RakamTablosu ids={["tufeYillik", "politikaFaizi"]} />
 *      <SonGuncelleme />                      → veri tazeliği rozeti
 *
 *  NEDEN BÖYLE?
 *  Enflasyon her ay, asgari ücret her yıl değişiyor. Rakamı 30 yazıya
 *  gömerseniz güncelleme imkânsız hale gelir ve site eski veriyle kalır —
 *  YMYL/finans içeriğinde Google'ın en sert cezalandırdığı şeylerden biri budur.
 *
 *  GÜNCELLEME TAKVİMİ
 *    • TÜFE .................... her ayın 3'ü civarı (TÜİK)
 *    • Politika faizi .......... PPK toplantı günleri (TCMB)
 *    • Asgari ücret ............ Aralık sonu (Resmî Gazete)
 *    • Gelir vergisi dilimleri . Aralık sonu (GİB tebliği)
 *    • Kıdem tazminatı tavanı .. Ocak ve Temmuz (Hazine ve Maliye genelgesi)
 *
 *  confidence alanı:
 *    "high"     → birincil/resmî kaynaktan doğrulandı, yayımlanabilir
 *    "medium"   → tutarlı ikincil kaynaklar, birincil kaynaktan teyit edilmeli
 *    "unverified" → DOĞRULANMADI, yazılarda KULLANMA
 * ============================================================================
 */

/** Verinin son elden geçirildiği tarih — <SonGuncelleme /> bunu gösterir. */
export const dataReviewedAt = "2026-07-22";

/* ==========================================================================
   TÜFE GEÇMİŞ SERİSİ — /enflasyon sayfasını besler
   --------------------------------------------------------------------------
   AYLIK GÜNCELLEME İŞİ (tek yapman gereken bakım):
     1. TÜİK verileri açıkladığında (genelde ayın 3'ü) yeni ayı EN BAŞA ekle
     2. Yukarıdaki `figures.tufeYillik` / `tufeAylik` / `cekirdekYillik`
        değerlerini de aynı rakamlarla güncelle
     3. `dataReviewedAt` tarihini güncelle
     4. `sonrakiAciklama`yı bir sonraki açıklama tarihine al

   Sayfa, tablo ve grafiği bu diziden otomatik üretir.
   Doğrulayamadığın bir ayı EKLEME — eksik veri, yanlış veriden iyidir.
   ======================================================================== */

/**
 * TÜİK'in bir sonraki TÜFE açıklamasının beklenen tarihi.
 *
 * TÜİK kural olarak her ayın 3'ünde saat 10:00'da açıklıyor; 3'ü hafta sonu ya
 * da tatile denk gelirse ilk iş gününe kayıyor. Ancak takvim iş gününde bile
 * kayabiliyor: Mayıs 2026 verisi, Kurban Bayramı tatili veri toplama süresini
 * kısalttığı için 3 Haziran yerine 5 Haziran'da açıklandı.
 * Bu yüzden `kesin: false` — tarihi yayın öncesi teyit et.
 */
export const sonrakiAciklama = {
  tarih: "2026-08-03",
  donem: "Temmuz 2026",
  kesin: false,
};

/**
 * ÖNEMLİ METODOLOJİ NOTU
 * TÜİK, Ocak 2026'dan itibaren TÜFE'nin baz yılını 2003=100'den 2025=100'e
 * çevirdi (AB uyumu). Ana harcama grubu sayısı 12'den 13'e çıktı.
 *
 * Sonucu: YÜZDE DEĞİŞİM serisi kesintisiz ve grafiklenebilir (bu sayfada
 * gösterilen budur). Ancak ENDEKS SEVİYELERİ Ocak 2026 öncesi ve sonrası
 * karşılaştırılabilir DEĞİLDİR — 2003=100 ile 2025=100 değerlerini aynı
 * eksende gösterme.
 */
export const bazYiliNotu = {
  degisimTarihi: "2026-01",
  eskiBaz: "2003=100",
  yeniBaz: "2025=100",
};

/**
 * Yeniden eskiye sıralı olmalı.
 * guven: "high" → TÜİK / SBB / TCMB gibi birincil kaynak
 *        "medium" → güvenilir ikincil kaynak (haber ajansı, banka araştırma)
 */
export const tufeHistory = [
  { donem: "2026-06", label: "Haziran 2026", aylik: 0.99, yillik: 32.11, cekirdek: 29.84, aciklanma: "2026-07-03", kaynak: "https://www.sbb.gov.tr/2026-yili-haziran-ayi-tuketici-ve-uretici-fiyat-gelismeleri-aciklandi/", guven: "high" },
  { donem: "2026-05", label: "Mayıs 2026",   aylik: 1.71, yillik: 32.61, cekirdek: 30.44, aciklanma: "2026-06-05", kaynak: "https://www.sbb.gov.tr/2026-yili-mayis-ayi-tuketici-ve-uretici-fiyat-gelismeleri-aciklandi/", guven: "high" },
  { donem: "2026-04", label: "Nisan 2026",   aylik: 4.18, yillik: 32.37, cekirdek: 29.83, aciklanma: "2026-05-04", kaynak: "https://www.sbb.gov.tr/2026-yili-nisan-ayi-tuketici-ve-uretici-fiyat-gelismeleri/", guven: "high" },
  { donem: "2026-03", label: "Mart 2026",    aylik: 1.94, yillik: 30.87, cekirdek: 29.68, aciklanma: "2026-04-03", kaynak: "https://www.sbb.gov.tr/2026-yili-mart-ayi-tuketici-ve-uretici-fiyat-gelismeleri-aciklandi/", guven: "high" },
  { donem: "2026-02", label: "Şubat 2026",   aylik: 2.96, yillik: 31.53, cekirdek: 29.46, aciklanma: "2026-03-03", kaynak: "https://www.sbb.gov.tr/2026-yili-subat-ayi-tuketici-ve-uretici-fiyat-gelismeleri-aciklandi/", guven: "high" },
  { donem: "2026-01", label: "Ocak 2026",    aylik: 4.84, yillik: 30.65, cekirdek: 29.80, aciklanma: "2026-02-03", kaynak: "https://www.sbb.gov.tr/2026-yili-ocak-ayi-tuketici-ve-uretici-fiyat-gelismeleri-aciklandi/", guven: "high" },
  { donem: "2025-12", label: "Aralık 2025",  aylik: 0.89, yillik: 30.89, cekirdek: 31.08, aciklanma: "2026-01-05", kaynak: "https://www.sbb.gov.tr/2025-yili-aralik-ayi-tuketici-ve-uretici-fiyat-gelismeleri/", guven: "high" },
  { donem: "2025-11", label: "Kasım 2025",   aylik: 0.87, yillik: 31.07, cekirdek: 31.65, aciklanma: "2025-12-03", kaynak: "https://www.sbb.gov.tr/2025-yili-kasim-ayi-tuketici-ve-uretici-fiyat-gelismeleri-aciklandi/", guven: "high" },
  { donem: "2025-10", label: "Ekim 2025",    aylik: 2.55, yillik: 32.87, cekirdek: 32.05, aciklanma: "2025-11-03", kaynak: "https://www.sbb.gov.tr/2025-yili-ekim-ayi-tuketici-ve-uretici-fiyat-gelismeleri/", guven: "high" },
  { donem: "2025-09", label: "Eylül 2025",   aylik: 3.23, yillik: 33.29, cekirdek: 32.54, aciklanma: "2025-10-03", kaynak: "https://www.sbb.gov.tr/2025-yili-eylul-ayi-tuketici-ve-uretici-fiyat-gelismeleri/", guven: "high" },
  { donem: "2025-08", label: "Ağustos 2025", aylik: 2.04, yillik: 32.95, cekirdek: 33.00, aciklanma: "2025-09-03", kaynak: "https://www.sbb.gov.tr/2025-yili-agustos-ayi-tuketici-ve-uretici-fiyat-gelismeleri-aciklandi/", guven: "high" },
  { donem: "2025-07", label: "Temmuz 2025",  aylik: 2.06, yillik: 33.52, cekirdek: 34.70, aciklanma: "2025-08-04", kaynak: "https://www.sbb.gov.tr/2025-yili-temmuz-ayi-tuketici-ve-uretici-fiyat-gelismeleri/", guven: "high" },
];

export const figures = {
  /* ------------------------------------------------------------ ENFLASYON */
  tufeYillik: {
    label: "Yıllık enflasyon (TÜFE)",
    display: "%32,11",
    value: 32.11,
    period: "Haziran 2026",
    /* TÜİK'in açıklama tarihi (SBB yorum sayfasının tarihi değil). */
    announcedAt: "2026-07-03",
    source: "T.C. Strateji ve Bütçe Başkanlığı",
    sourceUrl:
      "https://www.sbb.gov.tr/2026-yili-haziran-ayi-tuketici-ve-uretici-fiyat-gelismeleri-aciklandi/",
    confidence: "high",
  },
  tufeAylik: {
    label: "Aylık enflasyon (TÜFE)",
    display: "%0,99",
    value: 0.99,
    period: "Haziran 2026",
    announcedAt: "2026-07-06",
    source: "T.C. Strateji ve Bütçe Başkanlığı",
    sourceUrl:
      "https://www.sbb.gov.tr/2026-yili-haziran-ayi-tuketici-ve-uretici-fiyat-gelismeleri-aciklandi/",
    confidence: "high",
  },
  cekirdekYillik: {
    label: "Çekirdek enflasyon (C endeksi, yıllık)",
    display: "%29,84",
    value: 29.84,
    period: "Haziran 2026",
    announcedAt: "2026-07-06",
    source: "T.C. Strateji ve Bütçe Başkanlığı",
    sourceUrl:
      "https://www.sbb.gov.tr/2026-yili-haziran-ayi-tuketici-ve-uretici-fiyat-gelismeleri-aciklandi/",
    confidence: "high",
  },

  /* ----------------------------------------------------------------- FAİZ */
  politikaFaizi: {
    label: "TCMB politika faizi (1 hafta repo)",
    display: "%37,00",
    value: 37.0,
    period: "11 Haziran 2026 PPK kararı",
    announcedAt: "2026-06-11",
    source: "TCMB Para Politikası Kurulu",
    sourceUrl: "https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/PPK/PPK+Toplanti+Kararlari",
    confidence: "high",
    /* PPK takvimini takip et; karar değişirse burayı güncelle. */
    note: "PPK kararlarında değişebilir.",
  },

  /* -------------------------------------------------------- ASGARİ ÜCRET */
  asgariNet: {
    label: "Asgari ücret (net)",
    display: "28.075,50 ₺",
    value: 28075.5,
    period: "1 Ocak – 31 Aralık 2026",
    announcedAt: "2025-12-26",
    source: "Çalışma ve Sosyal Güvenlik Bakanlığı",
    sourceUrl: "https://www.csgb.gov.tr/poco-pages/asgari-ucret/",
    confidence: "high",
  },
  asgariBrut: {
    label: "Asgari ücret (brüt)",
    display: "33.030,00 ₺",
    value: 33030.0,
    period: "1 Ocak – 31 Aralık 2026",
    announcedAt: "2025-12-26",
    source: "Çalışma ve Sosyal Güvenlik Bakanlığı",
    sourceUrl: "https://www.csgb.gov.tr/poco-pages/asgari-ucret/",
    confidence: "high",
  },
  sgkIsciPayi: {
    label: "SGK işçi payı (%14)",
    display: "4.624,20 ₺",
    value: 4624.2,
    period: "2026, asgari ücret üzerinden",
    source: "Çalışma ve Sosyal Güvenlik Bakanlığı",
    sourceUrl: "https://www.csgb.gov.tr/poco-pages/asgari-ucret/",
    confidence: "high",
  },
  issizlikIsciPayi: {
    label: "İşsizlik sigortası işçi payı (%1)",
    display: "330,30 ₺",
    value: 330.3,
    period: "2026, asgari ücret üzerinden",
    source: "Çalışma ve Sosyal Güvenlik Bakanlığı",
    sourceUrl: "https://www.csgb.gov.tr/poco-pages/asgari-ucret/",
    confidence: "high",
  },
  toplamKesinti: {
    label: "Toplam yasal kesinti",
    display: "4.954,50 ₺",
    value: 4954.5,
    period: "2026, asgari ücret üzerinden",
    source: "Çalışma ve Sosyal Güvenlik Bakanlığı",
    sourceUrl: "https://www.csgb.gov.tr/poco-pages/asgari-ucret/",
    confidence: "high",
  },

  /* -------------------------------------------------------------- BURSLAR */
  kykLisans: {
    label: "KYK lisans bursu/kredisi",
    display: "4.000 ₺",
    value: 4000,
    period: "2026",
    source: "Gençlik ve Spor Bakanlığı / Cumhurbaşkanlığı açıklaması",
    sourceUrl: "https://gsb.gov.tr/tr/haber-detay/294270-ilk-kez-burskredi-alacak-ogrenciler-icin-odemeler-basladi",
    confidence: "medium",
    note: "Çok sayıda kaynakta tutarlı; GSB duyurusundan teyit et.",
  },
  kykYuksekLisans: {
    label: "KYK yüksek lisans bursu/kredisi",
    display: "8.000 ₺",
    value: 8000,
    period: "2026",
    source: "Gençlik ve Spor Bakanlığı",
    sourceUrl: "https://gsb.gov.tr/tr/haber-detay/294270-ilk-kez-burskredi-alacak-ogrenciler-icin-odemeler-basladi",
    confidence: "medium",
  },
  kykDoktora: {
    label: "KYK doktora bursu/kredisi",
    display: "12.000 ₺",
    value: 12000,
    period: "2026",
    source: "Gençlik ve Spor Bakanlığı",
    sourceUrl: "https://gsb.gov.tr/tr/haber-detay/294270-ilk-kez-burskredi-alacak-ogrenciler-icin-odemeler-basladi",
    confidence: "medium",
  },

  /* ---------------------------------------------------------------- VERGİ */
  gelirVergisiIlkDilim: {
    label: "Gelir vergisi ilk dilim sınırı (%15)",
    display: "190.000 ₺",
    value: 190000,
    period: "2026",
    source: "Gelir İdaresi Başkanlığı tebliği",
    sourceUrl: "https://www.gib.gov.tr/",
    confidence: "medium",
    note: "YAYIMLAMADAN ÖNCE GİB tebliğinden teyit et.",
  },
  kidemTavani: {
    label: "Kıdem tazminatı tavanı",
    display: "73.729,84 ₺",
    value: 73729.84,
    period: "1 Temmuz – 31 Aralık 2026",
    source: "Hazine ve Maliye Bakanlığı genelgesi",
    sourceUrl: "https://www.alomaliye.com/2026/07/06/2026-kidem-tazminati-tavani-2-donem-guncel-tutar-ve-merak-edilenler/",
    confidence: "medium",
    note: "YAYIMLAMADAN ÖNCE genelgeden teyit et.",
  },

  /* ------------------------------------------------------------ TAHMİNLER */
  tcmbYilSonuTahmini: {
    label: "TCMB 2026 yıl sonu enflasyon tahmini",
    display: "%26",
    value: 26,
    period: "Enflasyon Raporu 2026-II",
    announcedAt: "2026-05-14",
    source: "TCMB Enflasyon Raporu",
    sourceUrl: "https://www.tcmb.gov.tr/",
    confidence: "high",
    note: "Bu bir TAHMİNDİR, gerçekleşme değil. %24 ise ara hedeftir — karıştırma.",
  },
};

/* ==========================================================================
   ⛔ DOĞRULANAMAYANLAR — yazılarda KULLANMA
   --------------------------------------------------------------------------
   Aşağıdakiler araştırmada birincil kaynaktan teyit EDİLEMEDİ.
   Kullanmadan önce parantezdeki kurumdan doğrula ve yukarı taşı.

     • BES devlet katkısı oranı 2026 ....... (Emeklilik Gözetim Merkezi)
     • Temmuz 2026 TÜFE .................... (henüz açıklanmadı, ~3 Ağustos)
     • 23 Temmuz 2026 PPK kararı ........... (toplantı sonrası TCMB duyurusu)
     • Asgari ücrete Temmuz ara zammı ...... (ARAŞTIRMA: böyle bir karar YOK)
   ========================================================================== */

/** Yalnızca yayımlanabilir (yüksek güvenli) rakamlar. */
export function isPublishable(id) {
  return figures[id]?.confidence === "high";
}

/** Yayın öncesi kontrol için: teyit bekleyen rakamları listeler. */
export function getUnverifiedFigures() {
  return Object.entries(figures)
    .filter(([, f]) => f.confidence !== "high")
    .map(([id, f]) => ({ id, ...f }));
}

export default figures;
