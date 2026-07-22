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
  return Object.entries(palette)
    .map(([step, value]) => `--brand-${prefix}-${step}:${value};`)
    .join("");
}

export function buildThemeCss(theme = siteConfig.theme) {
  const light = [
    paletteToVars("primary", theme.primary),
    paletteToVars("accent", theme.accent),
    `--brand-bg:${theme.surface.bg};`,
    `--brand-bg-subtle:${theme.surface.bgSubtle};`,
    `--brand-border:${theme.surface.border};`,
    `--brand-text:${theme.surface.text};`,
    `--brand-text-muted:${theme.surface.textMuted};`,
    `--brand-radius:${RADIUS_SCALE[theme.radius] ?? RADIUS_SCALE.soft};`,
  ].join("");

  const dark = theme.surfaceDark
    ? [
        `--brand-bg:${theme.surfaceDark.bg};`,
        `--brand-bg-subtle:${theme.surfaceDark.bgSubtle};`,
        `--brand-border:${theme.surfaceDark.border};`,
        `--brand-text:${theme.surfaceDark.text};`,
        `--brand-text-muted:${theme.surfaceDark.textMuted};`,
      ].join("")
    : "";

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
