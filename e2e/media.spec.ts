import { expect, test } from "@playwright/test";

// Image slots and the phone frame (the merchant's own photos, with a clean fallback).

test("every picture on the page has alt text and loads", async ({ page }) => {
  await page.goto("/design/site");
  const imgs = page.locator("main img");
  await expect(imgs).toHaveCount(7);
  for (const img of await imgs.all()) {
    await img.scrollIntoViewIfNeeded();
    expect((await img.getAttribute("alt"))?.trim().length).toBeGreaterThan(2);
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
});

test("the logo shows with alt text, and falls back to the first letter", async ({ page }) => {
  await page.goto("/design/site");
  await expect(page.getByRole("img", { name: "Demo Merchant logo" })).toBeVisible();
  await page.goto("/design/site-empty");
  await expect(page.locator('header [data-slot="merchant-mark"]')).toHaveText("D");
  await page.route("**/design-samples/logo.svg", route => route.abort());
  await page.goto("/design/site");
  await expect(page.locator('header [data-slot="merchant-mark"]')).toHaveText("D");
});

test("a service with no photo sits next to the others with a quiet placeholder", async ({ page }) => {
  await page.goto("/design/site");
  const cards = page.locator('[data-section="services"] [data-slot="image-slot"]');
  await expect(cards).toHaveCount(3);
  await expect(cards.nth(2)).toHaveAttribute("data-state", "empty");
  await expect(cards.nth(2)).toHaveAttribute("aria-hidden", "true");
});

test("with no photos the page closes up: no empty boxes and no gallery", async ({ page }) => {
  await page.goto("/design/site-empty");
  await expect(page.locator("main img")).toHaveCount(0);
  await expect(page.locator('[data-slot="image-slot"]')).toHaveCount(0);
  await expect(page.locator('[data-section="gallery"]')).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Services" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "About us" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Book a visit" })).toBeVisible();
});

test("a photo that fails to load turns into the placeholder and keeps its description", async ({ page }) => {
  await page.route("**/design-samples/hero.svg", route => route.abort());
  await page.goto("/design/site");
  const hero = page.locator('[data-section="hero"] [data-slot="image-slot"]');
  await expect(hero).toHaveAttribute("data-state", "failed");
  await expect(hero).toHaveAttribute("aria-label", /grooming table/);
  await expect(page.locator('[data-section="hero"] img')).toHaveCount(0);
});

test("the photo box keeps its shape before the photo arrives", async ({ page }) => {
  await page.route("**/design-samples/about.svg", () => {}); // never answers
  await page.goto("/design/site");
  const box = await page.locator('[data-section="about"] [data-slot="image-slot"]').boundingBox();
  expect(box!.height).toBeGreaterThan(100);
  expect(Math.abs(box!.width / box!.height - 4 / 3)).toBeLessThan(0.02);
});

test("the phone frame fits the screen and keeps a phone shape", async ({ page }) => {
  await page.goto("/design/phone");
  const screen = await page.locator('[data-slot="phone-screen"]').boundingBox();
  const width = page.viewportSize()!.width;
  expect(screen!.width).toBeLessThanOrEqual(375);
  expect(screen!.x + screen!.width).toBeLessThanOrEqual(width);
  expect(Math.abs(screen!.width / screen!.height - 375 / 812)).toBeLessThan(0.01);
  await expect(page.getByRole("img", { name: /booking page on a phone/ })).toBeVisible();
});

test("the capture frame page only accepts capture files", async ({ page }) => {
  for (const q of ["", "?still=https://example.com/a.png", "?still=/__capture/a/still.png&clip=/etc/passwd", "?still=/__capture/../x/still.png"]) {
    const res = await page.goto(`/design/phone/frame${q}`);
    expect(res!.status(), q).toBe(404);
  }
});

test("people who ask for less motion get the still, not the clip", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route(url => url.pathname.startsWith("/__capture/demo/"), route => route.fulfill({ path: "public/design-samples/phone-still.png", contentType: "image/png" }));
  await page.goto("/design/phone/frame?still=/__capture/demo/still.png&clip=/__capture/demo/clip.webm&alt=Booking%20a%20visit");
  await expect(page.locator("video")).toBeHidden();
  await expect(page.getByRole("img", { name: "Booking a visit" })).toBeVisible();
});
