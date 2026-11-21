import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { catalog, MIN_ACCENT_CONTRAST, MIN_PRIMARY_CONTRAST } from "../design/catalog";
import { contrastRatio, parseHex, readableOn } from "../design/color";
import { mapBrandColor, resolveTheme, themeCss, ThemeError } from "../design/theme";
import type { Theme } from "../contracts/template";

const css = readFileSync("tokens/tokens.css", "utf8");
const cssVar = (name: string) => css.match(new RegExp(`${name}: (#[0-9a-f]{6});`))?.[1];
const ocean: Theme = {
  preset_id: "ocean", primary_color: "#2563eb", accent_color: "#b45309",
  font_pairing_id: "clean", mode: "light", logo_url: null
};

describe("theme catalog", () => {
  it("has 6 to 8 presets with unique ids and a valid default", () => {
    expect(catalog.presets.length).toBeGreaterThanOrEqual(6);
    expect(catalog.presets.length).toBeLessThanOrEqual(8);
    expect(new Set(catalog.presets.map(p => p.id)).size).toBe(catalog.presets.length);
    expect(catalog.presets.some(p => p.id === catalog.default_preset_id)).toBe(true);
  });

  it("matches the page backgrounds in tokens.css", () => {
    expect(cssVar("--color-neutral-50")).toBe(catalog.backgrounds.light);
    expect(cssVar("--color-neutral-950")).toBe(catalog.backgrounds.dark);
  });

  it.each(catalog.presets)("$id defaults pass WCAG AA and resolve", preset => {
    const bg = catalog.backgrounds[preset.default_mode];
    expect(preset.primary_shades).toContain(preset.default_primary);
    expect(preset.accent_shades).toContain(preset.default_accent);
    expect(contrastRatio(preset.default_primary, bg)).toBeGreaterThanOrEqual(MIN_PRIMARY_CONTRAST);
    expect(contrastRatio(preset.default_accent, bg)).toBeGreaterThanOrEqual(MIN_ACCENT_CONTRAST);
    expect(catalog.font_pairings.some(f => f.id === preset.default_font_pairing_id)).toBe(true);
    const resolved = resolveTheme({
      preset_id: preset.id, primary_color: preset.default_primary, accent_color: preset.default_accent,
      font_pairing_id: preset.default_font_pairing_id, mode: preset.default_mode, logo_url: null
    });
    expect(contrastRatio(resolved.vars["--primary-foreground"]!, resolved.vars["--primary"]!)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(resolved.vars["--accent-foreground"]!, resolved.vars["--accent"]!)).toBeGreaterThanOrEqual(4.5);
  });

  it("every shade has readable text on top of it", () => {
    for (const p of catalog.presets) {
      for (const s of [...p.primary_shades, ...p.accent_shades]) {
        expect(contrastRatio(readableOn(s), s)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("every font pairing has its variables in tokens.css", () => {
    for (const f of catalog.font_pairings) {
      expect(css).toContain(`--font-${f.id}-heading:`);
      expect(css).toContain(`--font-${f.id}-body:`);
    }
  });
});

describe("fixed colors in tokens.css", () => {
  const pairs: [string, string, string][] = [
    ["light text on background", "#111827", "#f9fafb"],
    ["light muted text on muted", "#4b5563", "#f3f4f6"],
    ["light danger with white", "#b91c1c", "#ffffff"],
    ["light danger text on background", "#b91c1c", "#f9fafb"],
    ["light success with white", "#047857", "#ffffff"],
    ["light warning with ink", "#fbbf24", "#030712"],
    ["dark text on background", "#f9fafb", "#030712"],
    ["dark muted text on muted", "#d1d5db", "#1f2937"],
    ["dark danger with ink", "#f87171", "#030712"],
    ["dark success with ink", "#34d399", "#030712"]
  ];
  it.each(pairs)("%s passes AA", (_name, a, b) => {
    expect(css).toContain(a);
    expect(contrastRatio(a, b)).toBeGreaterThanOrEqual(4.5);
  });

  it("input borders reach 3:1 on cards", () => {
    expect(contrastRatio("#6b7280", "#ffffff")).toBeGreaterThanOrEqual(3);
    expect(contrastRatio("#9ca3af", "#111827")).toBeGreaterThanOrEqual(3);
  });
});

describe("resolveTheme", () => {
  it("emits the CSS variables for an approved theme", () => {
    const cssText = themeCss(resolveTheme(ocean));
    expect(cssText).toBe(
      "html[data-mode]{--primary:#2563eb;--primary-foreground:#ffffff;--accent:#b45309;--accent-foreground:#ffffff;" +
      "--font-body:var(--font-clean-body);--font-display:var(--font-clean-heading)}"
    );
  });

  it("rejects an unknown preset and font pairing, naming the choices", () => {
    try {
      resolveTheme({ ...ocean, preset_id: "neon", font_pairing_id: "comic" });
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(ThemeError);
      expect((e as ThemeError).problems).toHaveLength(2);
      expect((e as ThemeError).message).toContain("ocean");
    }
  });

  it("rejects a color that is not one of the preset's shades", () => {
    expect(() => resolveTheme({ ...ocean, primary_color: "#ff00ff" })).toThrow(/not a ocean shade/);
    expect(() => resolveTheme({ ...ocean, accent_color: "#ff00ff" })).toThrow(ThemeError);
  });

  it("rejects an approved shade that fails contrast in the chosen mode", () => {
    expect(() => resolveTheme({ ...ocean, primary_color: "#3b82f6" })).toThrow(/too hard to read/);
    expect(() => resolveTheme({ ...ocean, mode: "dark", primary_color: "#1e40af" })).toThrow(/too hard to read/);
  });
});

describe("mapBrandColor", () => {
  it("snaps a brand color to the nearest passing shade", () => {
    expect(mapBrandColor("#1a73e8")).toMatchObject({ preset_id: "ocean", mode: "light" });
    expect(mapBrandColor("#0a7d4f")?.preset_id).toBe("forest");
    expect(mapBrandColor("#ff6600")?.preset_id).toBe("sunset");
  });

  it("always returns a theme that resolves", () => {
    for (const hex of ["#000000", "#ffffff", "#ff0000", "#00ff00", "#ffff00", "#123456", "#abc"]) {
      for (const mode of ["light", "dark"] as const) {
        const m = mapBrandColor(hex, "#00ffff", mode)!;
        expect(() => resolveTheme({ ...m, logo_url: null })).not.toThrow();
      }
    }
  });

  it("returns null for a color that is not hex, so nobody guesses", () => {
    expect(mapBrandColor("navy")).toBeNull();
    expect(mapBrandColor("rgb(0,0,0)")).toBeNull();
    expect(parseHex("#ABC")).toBe("#aabbcc");
  });
});
