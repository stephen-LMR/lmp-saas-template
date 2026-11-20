import { expect, test, type Page } from "@playwright/test";
import config from "../app.config.json" with { type: "json" };

async function expectNoSidewaysScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test("home page shows the merchant name", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(config.merchant_name);
  await expect(page.locator("html")).toHaveAttribute("data-mode", config.theme.mode);
  await expectNoSidewaysScroll(page);
});

test("health check reports the template version", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBe(true);
  expect(await res.json()).toEqual({
    ok: true,
    project_id: config.project_id,
    template_version: config.template_version
  });
});

test("an unknown page shows not found with one way back", async ({ page }) => {
  const res = await page.goto("/no-such-page");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
  const home = page.getByRole("link", { name: "Go to home page" });
  await expect(home).toBeVisible();
  await expectNoSidewaysScroll(page);
  await home.click();
  await expect(page).toHaveURL("/");
});

test("the primary button uses the primary token", async ({ page }) => {
  await page.goto("/no-such-page");
  const colors = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.className = "bg-primary";
    document.body.append(probe);
    const token = getComputedStyle(probe).backgroundColor;
    probe.remove();
    const link = document.querySelector("[data-slot=button]")!;
    return { token, button: getComputedStyle(link).backgroundColor };
  });
  expect(colors.button).toBe(colors.token);
  expect(colors.button).not.toBe("rgba(0, 0, 0, 0)");
});
