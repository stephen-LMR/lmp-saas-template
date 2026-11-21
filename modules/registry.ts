// One entry per ModuleKey. A module that is not built yet cannot be switched on:
// the build stops instead of shipping an app that is missing something the owner approved.
import type { z } from "zod";
import type { AppConfig } from "../contracts/template";
import { ModuleKey } from "../spec/schema";
import {
  AuthSettings, BookingSettings, CustomersCrmSettings, PaymentsOnetimeSettings, ServicesCatalogSettings
} from "./settings";

export type ModuleDefinition = {
  key: ModuleKey;
  label: string;          // shown in navigation and help
  ready: boolean;         // false until the module is built and tested
  requires: ModuleKey[];  // modules that must also be on
  settings: z.ZodType | null;
};

const planned = (key: ModuleKey, label: string, requires: ModuleKey[] = []): ModuleDefinition =>
  ({ key, label, ready: false, requires, settings: null });

export const MODULES: Record<ModuleKey, ModuleDefinition> = {
  auth: { key: "auth", label: "Sign in", ready: true, requires: [], settings: AuthSettings },
  services_catalog: { key: "services_catalog", label: "Services", ready: true, requires: ["auth"], settings: ServicesCatalogSettings },
  customers_crm: { key: "customers_crm", label: "Customers", ready: true, requires: ["auth"], settings: CustomersCrmSettings },
  booking: { key: "booking", label: "Calendar", ready: true, requires: ["auth", "services_catalog", "customers_crm"], settings: BookingSettings },
  payments_onetime: { key: "payments_onetime", label: "Payments", ready: true, requires: ["auth", "customers_crm"], settings: PaymentsOnetimeSettings },
  subscriptions: planned("subscriptions", "Memberships", ["auth", "customers_crm", "payments_onetime"]),
  invoicing: planned("invoicing", "Invoices", ["auth", "customers_crm"]),
  loyalty: planned("loyalty", "Rewards", ["auth", "customers_crm"]),
  staff_scheduling: planned("staff_scheduling", "Staff", ["auth"]),
  notifications: planned("notifications", "Reminders", ["auth"]),
  reporting: planned("reporting", "Reports", ["auth"]),
  custom_entities: planned("custom_entities", "Custom records", ["auth"])
};

export class ModuleConfigError extends Error {
  constructor(public readonly problems: string[]) {
    super(`The modules in app.config.json cannot be built:\n- ${problems.join("\n- ")}`);
    this.name = "ModuleConfigError";
  }
}

export type ResolvedModules = {
  enabled: ModuleKey[];
  settings: Partial<Record<ModuleKey, unknown>>; // parsed, with defaults filled in
};

export function resolveModules(config: Pick<AppConfig, "modules" | "custom_entities">): ResolvedModules {
  const problems: string[] = [];
  const on = new Set(config.modules.filter(m => m.enabled).map(m => m.key));
  const settings: Partial<Record<ModuleKey, unknown>> = {};

  for (const m of config.modules) {
    const def = MODULES[m.key];
    if (!m.enabled) continue;
    if (!def.ready || !def.settings) {
      problems.push(`${m.key}: this module is not built yet, so it cannot be switched on`);
      continue;
    }
    for (const need of def.requires) {
      if (!on.has(need)) problems.push(`${m.key}: needs ${need} to be switched on too`);
    }
    const parsed = def.settings.safeParse(m.settings);
    if (parsed.success) settings[m.key] = parsed.data;
    else for (const i of parsed.error.issues) problems.push(`${m.key}.settings${i.path.length ? "." + i.path.join(".") : ""}: ${i.message}`);
  }

  const booking = settings.booking as { payment_at_booking?: string } | undefined;
  if (booking && booking.payment_at_booking !== "none" && !on.has("payments_onetime")) {
    problems.push("booking.settings.payment_at_booking: taking payment at booking needs payments_onetime switched on");
  }
  if (config.custom_entities.length > 0 && !on.has("custom_entities")) {
    problems.push("custom_entities: the config defines custom records but the custom_entities module is off");
  }

  if (problems.length > 0) throw new ModuleConfigError(problems);
  return { enabled: ModuleKey.options.filter(k => on.has(k)), settings };
}
