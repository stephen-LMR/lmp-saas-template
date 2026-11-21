import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { DESIGN_PAGES } from "./pages";

// Design gates from docs/DESIGN.md that a browser can check: no sideways scrolling,
// one primary action per screen, and no serious accessibility problems.
for (const { path, name, onePrimary } of DESIGN_PAGES) {
  test.describe(name, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
    });

    test("does not scroll sideways", async ({ page }) => {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test("has at most one primary action", async ({ page }) => {
      test.skip(!onePrimary, "the gallery shows every button on purpose");
      const primary = page.locator('[data-slot="button"][data-variant="default"]:visible');
      expect(await primary.count()).toBeLessThanOrEqual(1);
    });

    test("has no serious accessibility problems", async ({ page }) => {
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      const serious = results.violations.filter(v => v.impact === "serious" || v.impact === "critical");
      expect(serious.map(v => `${v.id}: ${v.help} (${v.nodes.length}) ${v.nodes[0]?.target}`)).toEqual([]);
    });

    test("has exactly one h1", async ({ page }) => {
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    });
  });
}

test("the dialog opens, traps the page behind it, and closes", async ({ page }) => {
  await page.goto("/design");
  await page.getByRole("button", { name: "Open dialog" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading")).toHaveText("Cancel this booking?");
  const results = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
  expect(results.violations.filter(v => v.impact === "serious" || v.impact === "critical").map(v => v.id)).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("the menu opens and lists its items", async ({ page }) => {
  await page.goto("/design");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("menuitem", { name: "Reschedule" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
});

test("navigation is a side bar on wide screens and a menu on small ones", async ({ page }) => {
  await page.goto("/design/dashboard");
  const wide = (page.viewportSize()?.width ?? 0) >= 1280;
  if (wide) {
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");
  } else {
    await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog").getByRole("link", { name: "Customers" })).toBeVisible();
  }
});

test("settings tabs switch panels", async ({ page }) => {
  await page.goto("/design/settings");
  await page.getByRole("tab", { name: "Reminders" }).click();
  await expect(page.getByRole("switch", { name: "Email reminders" })).toBeVisible();
});

test("picking a time marks it as chosen and only it", async ({ page }) => {
  await page.goto("/design/booking");
  const three = page.getByRole("button", { name: "3:00 PM" });
  await three.click();
  await expect(three).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "2:00 PM" })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("button", { name: "9:00 AM" })).toBeDisabled();
});
