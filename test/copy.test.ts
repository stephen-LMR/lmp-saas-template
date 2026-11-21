import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Merchant apps carry the merchant's own brand. Nothing a merchant or their customers can
// see may name the platform, and client-facing text never uses em or en dashes.
const UI_DIRS = ["app", "components", "patterns", "content", "seed", "src"];
const files: string[] = [];
const walk = (dir: string) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|mdx?|json)$/.test(name) && name !== "README.md") files.push(p);
  }
};
UI_DIRS.forEach(walk);

describe("client-facing text", () => {
  it("finds the UI files", () => {
    expect(files.length).toBeGreaterThan(30);
  });

  it.each(files)("%s has no platform name and no long dashes", file => {
    const text = readFileSync(file, "utf8");
    expect(text).not.toMatch(/\bLMP\b|\bLMR\b|Loyalty Merchant|MTJBS/);
    expect(text).not.toMatch(/[–—]/);
  });
});
