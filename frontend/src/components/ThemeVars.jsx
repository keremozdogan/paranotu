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

  return (
    `:root{${light}}` +
    (dark ? `@media (prefers-color-scheme:dark){:root{${dark}}}` : "")
  );
}

export default function ThemeVars() {
  return (
    <style
      id="brand-theme"
      // Değerler site.config.js'ten gelir (kullanıcı girdisi değil) — güvenli.
      dangerouslySetInnerHTML={{ __html: buildThemeCss() }}
    />
  );
}
