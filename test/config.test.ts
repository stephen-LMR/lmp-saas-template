import { describe, expect, it } from "vitest";
import raw from "../app.config.json" with { type: "json" };
import { appConfig } from "../config/index.js";
import { AppConfigError, parseAppConfig } from "../config/load.js";
import { ModuleKey } from "../spec/schema.js";

const clone = () => structuredClone(raw) as Record<string, any>;

describe("app config", () => {
  it("boots from the demo app.config.json", () => {
    expect(appConfig.merchant_name).toBe("Demo Merchant");
    expect(appConfig.modules.map(m => m.key).sort()).toEqual([...ModuleKey.options].sort());
  });

  it("rejects a config that is missing a module", () => {
    const c = clone();
    c.modules = c.modules.filter((m: { key: string }) => m.key !== "booking");
    expect(() => parseAppConfig(c)).toThrow(/every ModuleKey exactly once/);
  });

  it("rejects a config that lists a module twice", () => {
    const c = clone();
    c.modules.push({ key: "auth", enabled: false, settings: {} });
    expect(() => parseAppConfig(c)).toThrow(AppConfigError);
  });

  it("names the field that is wrong", () => {
    const c = clone();
    c.theme.primary_color = "blue";
    try {
      parseAppConfig(c);
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(AppConfigError);
      expect((e as AppConfigError).problems.some(p => p.startsWith("theme.primary_color"))).toBe(true);
    }
  });

  it("rejects a module key the template does not have", () => {
    const c = clone();
    c.modules[0].key = "inventory";
    expect(() => parseAppConfig(c)).toThrow(AppConfigError);
  });

  it("rejects a missing config", () => {
    expect(() => parseAppConfig(undefined)).toThrow(AppConfigError);
  });
});
