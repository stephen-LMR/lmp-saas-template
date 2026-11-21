import { existsSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { DESIGN_PAGES } from "./pages";

// Visual regression: each sample screen is compared with its approved baseline at every width.
// Baselines are per operating system because fonts render differently. A system with no
// baselines yet skips, so the suite never passes or fails on pictures it does not have.
// Create or approve baselines with: npm run test:visual:update
const baselineDir = `e2e/__screenshots__/${process.platform}`;
const updating = process.env.UPDATE_VISUAL === "1";

test.describe("visual regression", () => {
  test.skip(!updating && !existsSync(baselineDir), `no baselines for ${process.platform} yet`);

  for (const { path, name } of DESIGN_PAGES) {
    test(name, async ({ page }) => {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true, animations: "disabled", maxDiffPixelRatio: 0.01 });
    });
  }
});
