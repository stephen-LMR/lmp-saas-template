// COPIED FILE. Do not edit here.
// Source: lmp-builder src/contracts/template.ts at commit e5a68f43cfc6affefa7e8e256f5bf09f4077aed5.
// Only difference from the source: relative imports drop the ".js" ending, because the
// Next.js bundler (Turbopack) cannot resolve "./x.js" to "./x.ts". The shapes are identical.
// To change a shape, ask Lane E; then copy the file again and update this header.
// What the build agent hands the template: which modules are on, how they are configured,
// and the theme. Merchant apps never get a custom design, only a theme (docs/DESIGN.md).
import { z } from "zod";
import { ModuleKey, Spec } from "../spec/schema";
import { HexColor, Id } from "./common";

export const DESIGN_VIEWPORTS = [375, 768, 1280] as const;

export const Theme = z.object({
  preset_id: z.string().min(1),       // one of the 6 to 8 approved presets. Lane B defines the list in the template.
  primary_color: HexColor,            // merchant brand color, already mapped to the nearest preset shade that passes contrast
  accent_color: HexColor,
  font_pairing_id: z.string().min(1), // from the approved list. Lane B defines it.
  mode: z.enum(["light", "dark"]),
  logo_url: z.url().nullable()
});
export type Theme = z.infer<typeof Theme>;

export const ModuleConfig = z.object({
  key: ModuleKey,
  enabled: z.boolean(),
  // Validated by that module's own config schema inside the template. Opaque to the pipeline.
  settings: z.record(z.string(), z.unknown())
});
export type ModuleConfig = z.infer<typeof ModuleConfig>;

export const AppConfig = z.object({
  project_id: Id,
  template_version: z.string().regex(/^\d+\.\d+\.\d+$/),
  merchant_name: z.string().min(1), // merchant apps carry the merchant's own brand
  theme: Theme,
  modules: z.array(ModuleConfig),
  custom_entities: Spec.shape.custom_entities,
  processor: z.string().min(1),     // payment adapter id, "cardpointe" first
  // True only once the merchant's own A2P 10DLC campaign is approved. Until then the app emails customers.
  customer_sms_enabled: z.boolean()
}).refine(
  c => ModuleKey.options.every(k => c.modules.filter(m => m.key === k).length === 1),
  { message: "modules must list every ModuleKey exactly once, enabled or not" }
);
export type AppConfig = z.infer<typeof AppConfig>;
