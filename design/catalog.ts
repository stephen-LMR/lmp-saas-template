// The approved themes. tokens/theme-catalog.json is the single list; the pipeline's build
// agent reads the same file to map a merchant's brand color (ThemeCatalog in lmp-builder).
import raw from "../tokens/theme-catalog.json" with { type: "json" };

export type Mode = "light" | "dark";

export type ThemePreset = {
  id: string;
  label: string;
  default_mode: Mode;
  default_font_pairing_id: string;
  default_primary: string;
  default_accent: string;
  primary_shades: string[]; // the shades a brand primary may snap to
  accent_shades: string[]; // the shades a brand accent may snap to
};

export type FontPairing = { id: string; label: string; heading: string; body: string };

export type ThemeCatalog = {
  default_preset_id: string;
  backgrounds: Record<Mode, string>;
  font_pairings: FontPairing[];
  presets: ThemePreset[];
};

export const catalog = raw as ThemeCatalog;

// WCAG 2.2 AA: 4.5:1 for text (primary is used for links on the page background),
// 3:1 for non-text UI (accent is used for highlights).
export const MIN_PRIMARY_CONTRAST = 4.5;
export const MIN_ACCENT_CONTRAST = 3;

export const presetById = (id: string) => catalog.presets.find(p => p.id === id);
export const fontPairingById = (id: string) => catalog.font_pairings.find(f => f.id === id);
