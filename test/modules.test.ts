import { describe, expect, it } from "vitest";
import raw from "../app.config.json" with { type: "json" };
import { parseAppConfig } from "../config/load";
import { modules } from "../config/index";
import { MODULES, ModuleConfigError, resolveModules } from "../modules/registry";
import { BookingSettings, CustomersCrmSettings, AuthSettings, PaymentsOnetimeSettings } from "../modules/settings";
import { ModuleKey } from "../spec/schema";

const base = () => parseAppConfig(structuredClone(raw));
const setModule = (c: ReturnType<typeof base>, key: string, patch: { enabled?: boolean; settings?: Record<string, unknown> }) => {
  const m = c.modules.find(x => x.key === key)!;
  Object.assign(m, patch);
  return c;
};
const problemsOf = (fn: () => unknown): string[] => {
  try { fn(); } catch (e) { if (e instanceof ModuleConfigError) return e.problems; throw e; }
  return [];
};

describe("module registry", () => {
  it("has exactly one definition per ModuleKey", () => {
    expect(Object.keys(MODULES).sort()).toEqual([...ModuleKey.options].sort());
    for (const k of ModuleKey.options) expect(MODULES[k].key).toBe(k);
  });

  it("only requires modules that exist, and never itself", () => {
    for (const def of Object.values(MODULES)) {
      for (const r of def.requires) expect(ModuleKey.options).toContain(r);
      expect(def.requires).not.toContain(def.key);
    }
  });

  it("the demo config resolves with defaults filled in", () => {
    expect(modules.enabled).toEqual(["auth", "booking", "services_catalog", "customers_crm", "payments_onetime"]);
    expect(modules.settings.booking).toMatchObject({ slot_minutes: 30, payment_at_booking: "none" });
  });

  it("refuses a module that is not built yet", () => {
    expect(problemsOf(() => resolveModules(setModule(base(), "loyalty", { enabled: true })))).toEqual([
      "loyalty: this module is not built yet, so it cannot be switched on"
    ]);
  });

  it("refuses a module whose required module is off", () => {
    const p = problemsOf(() => resolveModules(setModule(base(), "customers_crm", { enabled: false })));
    expect(p).toContain("booking: needs customers_crm to be switched on too");
    expect(p).toContain("payments_onetime: needs customers_crm to be switched on too");
  });

  it("rejects unknown and invalid settings, naming the field", () => {
    const p = problemsOf(() => resolveModules(setModule(base(), "booking", { settings: { slot_minutes: 7, colour: "red" } })));
    expect(p.some(x => x.startsWith("booking.settings.slot_minutes"))).toBe(true);
    expect(p.some(x => x.includes("colour"))).toBe(true);
  });

  it("refuses payment at booking when payments are off", () => {
    const c = setModule(setModule(base(), "payments_onetime", { enabled: false }), "booking", { settings: { payment_at_booking: "deposit" } });
    expect(problemsOf(() => resolveModules(c))).toEqual([
      "booking.settings.payment_at_booking: taking payment at booking needs payments_onetime switched on"
    ]);
  });

  it("refuses custom records when the custom_entities module is off", () => {
    const c = base();
    c.custom_entities = [{ name: "Pet", description: "A customer's pet", fields: [] }];
    expect(problemsOf(() => resolveModules(c))[0]).toMatch(/^custom_entities:/);
  });

  it("ignores settings on a module that is off", () => {
    expect(() => resolveModules(setModule(base(), "loyalty", { enabled: false, settings: { anything: 1 } }))).not.toThrow();
  });
});

describe("module settings", () => {
  it("accept an empty object and fill sensible defaults", () => {
    expect(BookingSettings.parse({}).business_hours).toHaveLength(5);
    expect(AuthSettings.parse({}).staff_sign_in).toBe("magic_link");
    expect(PaymentsOnetimeSettings.parse({}).tip_percent_options).toEqual([15, 18, 20]);
  });

  it("reject hours that close before they open, and a day listed twice", () => {
    expect(BookingSettings.safeParse({ business_hours: [{ day: 1, open: "17:00", close: "09:00" }] }).success).toBe(false);
    expect(BookingSettings.safeParse({ business_hours: [{ day: 1, open: "09:00", close: "12:00" }, { day: 1, open: "13:00", close: "17:00" }] }).success).toBe(false);
  });

  it("reject staff roles without an owner and duplicate customer fields", () => {
    expect(AuthSettings.safeParse({ staff_roles: ["staff"] }).success).toBe(false);
    const field = { key: "pet_name", label: "Pet name", type: "text" };
    expect(CustomersCrmSettings.safeParse({ custom_fields: [field, field] }).success).toBe(false);
    expect(CustomersCrmSettings.safeParse({ custom_fields: [{ ...field, key: "Pet Name" }] }).success).toBe(false);
  });
});
