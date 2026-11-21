// Turns the theme in app.config.json into CSS variables. A merchant app never gets a custom
// design, only an approved theme, so anything outside the catalog stops the build.
import type { Theme } from "../contracts/template";
import {
  catalog, fontPairingById, presetById, MIN_ACCENT_CONTRAST, MIN_PRIMARY_CONTRAST, type Mode, type ThemePreset
} from "./catalog";
import { colorDistance, contrastRatio, parseHex, readableOn } from "./color";

export class ThemeError extends Error {
  constructor(public readonly problems: string[]) {
    super(`The theme in app.config.json is not an approved theme:\n- ${problems.join("\n- ")}`);
    this.name = "ThemeError";
  }
}

export type ResolvedTheme = {
  preset_id: string;
  font_pairing_id: string;
  mode: Mode;
  logo_url: string | null;
  vars: Record<string, string>;
};

const has = (list: string[], hex: string) => list.some(x => x.toLowerCase() === hex.toLowerCase());

export function resolveTheme(theme: Theme): ResolvedTheme {
  const problems: string[] = [];
  const preset = presetById(theme.preset_id);
  if (!preset) problems.push(`preset_id "${theme.preset_id}" is not one of: ${catalog.presets.map(p => p.id).join(", ")}`);
  if (!fontPairingById(theme.font_pairing_id)) {
    problems.push(`font_pairing_id "${theme.font_pairing_id}" is not one of: ${catalog.font_pairings.map(f => f.id).join(", ")}`);
  }
  const background = catalog.backgrounds[theme.mode];
  if (preset) {
    if (!has(preset.primary_shades, theme.primary_color)) {
      problems.push(`primary_color ${theme.primary_color} is not a ${preset.id} shade (${preset.primary_shades.join(", ")})`);
    } else if (contrastRatio(theme.primary_color, background) < MIN_PRIMARY_CONTRAST) {
      problems.push(`primary_color ${theme.primary_color} is too hard to read on the ${theme.mode} background`);
    }
    if (!has(preset.accent_shades, theme.accent_color)) {
      problems.push(`accent_color ${theme.accent_color} is not a ${preset.id} shade (${preset.accent_shades.join(", ")})`);
    } else if (contrastRatio(theme.accent_color, background) < MIN_ACCENT_CONTRAST) {
      problems.push(`accent_color ${theme.accent_color} is too faint on the ${theme.mode} background`);
    }
  }
  if (problems.length > 0) throw new ThemeError(problems);

  const primary = theme.primary_color.toLowerCase();
  const accent = theme.accent_color.toLowerCase();
  return {
    preset_id: theme.preset_id,
    font_pairing_id: theme.font_pairing_id,
    mode: theme.mode,
    logo_url: theme.logo_url,
    vars: {
      "--primary": primary,
      "--primary-foreground": readableOn(primary),
      "--accent": accent,
      "--accent-foreground": readableOn(accent),
      "--font-body": `var(--font-${theme.font_pairing_id}-body)`,
      "--font-display": `var(--font-${theme.font_pairing_id}-heading)`
    }
  };
}

// The selector outranks the defaults in tokens/tokens.css whatever order the styles load in.
export function themeCss(resolved: ResolvedTheme): string {
  const body = Object.entries(resolved.vars).map(([k, v]) => `${k}:${v}`).join(";");
  return `html[data-mode]{${body}}`;
}

export type BrandMatch = { preset_id: string; primary_color: string; accent_color: string; font_pairing_id: string; mode: Mode };

function nearest(target: string, shades: string[]): { hex: string; distance: number } | null {
  let best: { hex: string; distance: number } | null = null;
  for (const s of shades) {
    const d = colorDistance(target, s);
    if (!best || d < best.distance) best = { hex: s.toLowerCase(), distance: d }; // ties go to the earlier shade
  }
  return best;
}

const passing = (shades: string[], background: string, min: number) => shades.filter(s => contrastRatio(s, background) >= min);

// Maps a merchant's brand color to the nearest approved shade that passes contrast.
// Returns null when the color is not a hex value: the caller asks the owner, it never guesses.
export function mapBrandColor(brandPrimary: string, brandAccent: string | null = null, mode: Mode = "light"): BrandMatch | null {
  const target = parseHex(brandPrimary);
  if (!target) return null;
  const background = catalog.backgrounds[mode];
  let best: { preset: ThemePreset; hex: string; distance: number } | null = null;
  for (const preset of catalog.presets.filter(p => p.default_mode === mode)) {
    const hit = nearest(target, passing(preset.primary_shades, background, MIN_PRIMARY_CONTRAST));
    if (hit && (!best || hit.distance < best.distance)) best = { preset, ...hit };
  }
  if (!best) return null;
  const accentTarget = brandAccent ? parseHex(brandAccent) : null;
  const accent = accentTarget
    ? nearest(accentTarget, passing(best.preset.accent_shades, background, MIN_ACCENT_CONTRAST))?.hex
    : undefined;
  return {
    preset_id: best.preset.id,
    primary_color: best.hex,
    accent_color: accent ?? best.preset.default_accent.toLowerCase(),
    font_pairing_id: best.preset.default_font_pairing_id,
    mode
  };
}
