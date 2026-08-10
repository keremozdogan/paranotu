/**
 * ============================================================================
 *  HAVA DURUMU SAĞLAYICISI
 * ============================================================================
 *  Ekonomi sitesinde hava durumu küçük bir dokunuştur; veri katmanı da öyle
 *  olmalı — tek şehir, tek değer, anahtarsız.
 *
 *  Open-Meteo seçildi çünkü API anahtarı istemiyor ve ticari olmayan kullanım
 *  için ücretsiz. Böylece özellik "anahtar bekleyen" bir kutu olarak kalmıyor,
 *  ilk günden çalışıyor.
 *
 *  ⚠️ SAHTE VERİ YOK. Piyasa sağlayıcılarındaki `mock` kavramı buraya
 *  taşınmadı: uydurma bir sıcaklık göstermenin hiçbir faydası yok, hata
 *  durumunda bileşen kendini gizler.
 * ============================================================================
 */

import "server-only";

/**
 * Şehir. Tek şehirle başlıyoruz — çoklu şehir seçimi, konum izni ve tercih
 * saklama demek; bu kadarı için ağır.
 */
const SEHIR = { ad: "İstanbul", enlem: 41.0082, boylam: 28.9784 };

/** WMO hava kodu → kısa Türkçe etiket ve ikon anahtarı. */
const KODLAR = {
  0: { etiket: "Açık", ikon: "gunes" },
  1: { etiket: "Az bulutlu", ikon: "parcali" },
  2: { etiket: "Parçalı bulutlu", ikon: "parcali" },
  3: { etiket: "Kapalı", ikon: "bulut" },
  45: { etiket: "Sisli", ikon: "sis" },
  48: { etiket: "Sisli", ikon: "sis" },
  51: { etiket: "Çiseliyor", ikon: "yagmur" },
  53: { etiket: "Çiseliyor", ikon: "yagmur" },
  55: { etiket: "Çiseliyor", ikon: "yagmur" },
  61: { etiket: "Hafif yağmur", ikon: "yagmur" },
  63: { etiket: "Yağmurlu", ikon: "yagmur" },
  65: { etiket: "Kuvvetli yağmur", ikon: "yagmur" },
  71: { etiket: "Hafif kar", ikon: "kar" },
  73: { etiket: "Karlı", ikon: "kar" },
  75: { etiket: "Yoğun kar", ikon: "kar" },
  80: { etiket: "Sağanak", ikon: "yagmur" },
  81: { etiket: "Sağanak", ikon: "yagmur" },
  82: { etiket: "Kuvvetli sağanak", ikon: "yagmur" },
  95: { etiket: "Gök gürültülü", ikon: "firtina" },
  96: { etiket: "Gök gürültülü", ikon: "firtina" },
  99: { etiket: "Gök gürültülü", ikon: "firtina" },
};

const ENDPOINT =
  `https://api.open-meteo.com/v1/forecast` +
  `?latitude=${SEHIR.enlem}&longitude=${SEHIR.boylam}` +
  `&current=temperature_2m,weather_code&timezone=Europe%2FIstanbul`;

/**
 * Güncel havayı getirir.
 *
 * @returns {Promise<{ok: true, city: string, temp: number, label: string, icon: string} | {ok: false}>}
 */
export async function getWeather() {
  try {
    const yanit = await fetch(ENDPOINT, {
      /* Hava 15 dakikada bir yeterince değişir; her istekte çekmek gereksiz. */
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(4000),
    });
    if (!yanit.ok) return { ok: false };

    const veri = await yanit.json();
    const sicaklik = veri?.current?.temperature_2m;
    const kod = veri?.current?.weather_code;

    if (typeof sicaklik !== "number" || !Number.isFinite(sicaklik)) {
      return { ok: false };
    }

    const durum = KODLAR[kod] ?? { etiket: "—", ikon: "bulut" };

    return {
      ok: true,
      city: SEHIR.ad,
      temp: Math.round(sicaklik),
      label: durum.etiket,
      icon: durum.ikon,
    };
  } catch {
    /* Ağ hatası, zaman aşımı, bozuk gövde — hepsinde sessizce gizlen. */
    return { ok: false };
  }
}
