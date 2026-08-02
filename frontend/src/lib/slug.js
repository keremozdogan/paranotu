/**
 * Türkçe uyumlu slug üretimi — TEK KAYNAK.
 *
 * Hem içerik katmanı (posts.js, news.js, evergreen.js) hem provider'lar hem
 * de MDX başlık id'leri bunu kullanır. `MdxContent` başlık id'lerini bu
 * fonksiyonla ürettiği için içindekiler bağlantıları birebir tutar
 * (rehype-slug bilinçli olarak devre dışı — Türkçe karakterleri farklı
 * çeviriyor).
 *
 * `server-only` DEĞİL — istemci bileşenleri de (arama) kullanabilir.
 *
 * ----------------------------------------------------------------------------
 *  ⚠️ NEDEN `toLocaleLowerCase("tr")` KULLANMIYORUZ?
 * ----------------------------------------------------------------------------
 *  Türkçe locale'de ASCII büyük "I" harfi noktasız "ı"ya dönüşür:
 *
 *      "BIST".toLocaleLowerCase("tr")  →  "bıst"
 *
 *  Ardından "ı" harfi [a-z0-9] filtresine takılıp silindiği için slug
 *  "b-st" oluyordu. Aynı şekilde "IMF" → "mf". Bu, akronim içeren her
 *  başlığın bağlantısını bozan sessiz bir hataydı.
 *
 *  Çözüm: Türkçe harfleri (büyük/küçük) ÖNCE elle çeviriyoruz, sonra düz
 *  `toLowerCase()` kullanıyoruz. Böylece locale'in noktasız-i kuralı hiç
 *  devreye girmiyor.
 * ----------------------------------------------------------------------------
 */

const TR_MAP = {
  ç: "c", Ç: "c",
  ğ: "g", Ğ: "g",
  ı: "i", I: "i", // ASCII büyük I → i  (tr locale "ı" verirdi, silinirdi)
  İ: "i",
  ö: "o", Ö: "o",
  ş: "s", Ş: "s",
  ü: "u", Ü: "u",
};

/** "Bütçe Nasıl Yapılır?" → "butce-nasil-yapilir" · "BIST 100" → "bist-100" */
export function slugify(value) {
  return String(value)
    .replace(/[çÇğĞıIİöÖşŞüÜ]/g, (ch) => TR_MAP[ch] ?? ch)
    /* Türkçe harfler çözüldü; artık locale'e bağımlı değiliz. */
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default slugify;
