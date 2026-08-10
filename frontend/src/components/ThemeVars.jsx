/**
 * site.config.js → CSS değişkenleri köprüsü.
 *
 * `theme` objesindeki her rengi `--brand-*` olarak :root'a basar.
 * globals.css içindeki @theme bloğu bu değişkenleri okur, böylece
 * `bg-primary-600` gibi Tailwind sınıfları config'i takip eder.
 *
 * <head> içine basıldığı için renkler ilk boyamada hazırdır (FOUC yok).
 */

import siteConfig from "~/site.config";

const RADIUS_SCALE = {
  sharp: "0.25rem",
  soft: "0.75rem",
  round: "1.25rem",
};

function paletteToVars(prefix, palette) {
  if (!palette) return "";
  return Object.entries(palette)
    .map(([step, value]) => `--brand-${prefix}-${step}:${value};`)
    .join("");
}

function surfaceToVars(surface) {
  if (!surface) return "";
  return [
    `--brand-bg:${surface.bg};`,
    `--brand-bg-subtle:${surface.bgSubtle};`,
    `--brand-border:${surface.border};`,
    `--brand-text:${surface.text};`,
    `--brand-text-muted:${surface.textMuted};`,
  ].join("");
}

/**
 * Semantik roller — camelCase anahtarları kebab-case CSS değişkenine çevirir.
 * `positiveSoft` → `--brand-positive-soft`
 */
function rolesToVars(roles) {
  if (!roles) return "";
  return Object.entries(roles)
    .map(([key, value]) => {
      const name = key.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`);
      return `--brand-${name}:${value};`;
    })
    .join("");
}

/**
 * ----------------------------------------------------------------------------
 *  ÜÇ TEMA DURUMU
 * ----------------------------------------------------------------------------
 *  Tema artık yalnızca işletim sistemine bağlı değil; kullanıcı elle de
 *  seçebiliyor. Bu üç ayrı durum demek ve üçünün de doğru çalışması için
 *  seçicilerin sırası önemlidir:
 *
 *    1. Sistem (varsayılan) → `<html>` üzerinde data-theme YOK.
 *       Karar `prefers-color-scheme` medya sorgusuna kalır.
 *    2. Elle AÇIK           → data-theme="light"
 *       Sistem koyu olsa bile açık kalmalı. Bu yüzden medya sorgusu
 *       `:not([data-theme="light"])` ile korunur — aksi halde sistem koyu
 *       olan bir kullanıcı "açık"ı seçemezdi.
 *    3. Elle KOYU           → data-theme="dark"
 *       Medya sorgusundan SONRA geldiği için sistem açık olsa bile kazanır.
 *
 *  ⚠️ Bu üç bloğun sırasını değiştirme; CSS'te sonra gelen kazandığı için
 *  sıra bozulursa elle seçim sistemi geçemez.
 * -------------------------------------------------------------------------- */
export function buildThemeCss(theme = siteConfig.theme) {
  const light = [
    paletteToVars("primary", theme.primary),
    paletteToVars("accent", theme.accent),
    paletteToVars("gold", theme.gold),
    surfaceToVars(theme.surface),
    rolesToVars(theme.roles?.light),
    `--brand-radius:${RADIUS_SCALE[theme.radius] ?? RADIUS_SCALE.soft};`,
  ].join("");

  /* Koyu tema: yüzeyler + roller birlikte değişir. Paletler sabit kalır —
     bu yüzden bağlantı/yükseliş/düşüş renkleri role devredildi. */
  const dark = [surfaceToVars(theme.surfaceDark), rolesToVars(theme.roles?.dark)].join("");

  /* `color-scheme` tarayıcının KENDİ çizdiği parçaları da uyumlu yapar:
     kaydırma çubuğu, form denetimleri, otomatik doldurma rengi. Bu satır
     olmadan koyu temada beyaz bir kaydırma çubuğu kalıyor. */
  const lightScheme = "color-scheme:light;";
  const darkScheme = "color-scheme:dark;";

  if (!dark) return `:root{${light}${lightScheme}}`;

  return [
    `:root{${light}${lightScheme}}`,
    `@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){${dark}${darkScheme}}}`,
    `:root[data-theme="dark"]{${dark}${darkScheme}}`,
    `:root[data-theme="light"]{${light}${lightScheme}}`,
  ].join("");
}

/**
 * ----------------------------------------------------------------------------
 *  YANIP SÖNMEYİ ÖNLEYEN SCRIPT
 * ----------------------------------------------------------------------------
 *  Kullanıcının seçimi localStorage'da; ama React hydrate olana kadar
 *  çalışmazsa sayfa önce açık temada boyanır, sonra koyuya atlar. Bu göze
 *  çarpan bir "flaş"tır.
 *
 *  Bu script <head> içinde, SENKRON çalışır ve ilk boyamadan önce
 *  `data-theme`'i yerine koyar. Kısa tutulması bilinçlidir — render'ı
 *  bloklar.
 *
 *  try/catch şart: gizli sekmede veya çerezler kapalıyken localStorage
 *  erişimi hata fırlatabilir; tema yüzünden sayfa çökmemeli.
 */
const NO_FLASH_SCRIPT = `(function(){try{var t=localStorage.getItem("paranotu-theme");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;

export default function ThemeVars() {
  return (
    <>
      <style
        id="brand-theme"
        // Değerler site.config.js'ten gelir (kullanıcı girdisi değil) — güvenli.
        dangerouslySetInnerHTML={{ __html: buildThemeCss() }}
      />
      <script
        id="brand-theme-init"
        // Sabit metin — kullanıcı girdisi içermez.
        dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }}
      />
    </>
  );
}
