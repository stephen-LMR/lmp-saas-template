import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// The first five modules, end to end, on the built-in demo records (APP_DATA=demo).
// Each width runs in parallel against one server, so anything a test creates is made
// unique to its width and never collides with another run.

async function signIn(page: Page, email = "dana@example.com") {
  await page.goto("/sign-in");
  await page.getByLabel("Work email").fill(email);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}
const unique = (page: Page) => String(page.viewportSize()!.width);
const noSerious = async (page: Page) => {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(r.violations.filter(v => v.impact === "serious" || v.impact === "critical").map(v => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
};
// Time tiles need the page's scripts. Click until the tile shows as picked.
const pickTime = async (page: Page, label: string) => {
  const tile = page.getByRole("button", { name: label });
  await expect(async () => {
    await tile.click();
    await expect(tile).toHaveAttribute("aria-pressed", "true", { timeout: 500 });
  }).toPass();
};
const noSideways = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);

test("staff pages send you to sign in first", async ({ page }) => {
  for (const path of ["/dashboard", "/calendar", "/customers", "/services", "/payments", "/bookings/new"]) {
    await page.goto(path);
    await expect(page, path).toHaveURL(/\/sign-in$/);
  }
});

test("someone not on the team cannot sign in", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Work email").fill("maria@example.com");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("That email is not on the demo team")).toBeVisible();
  await expect(page.getByLabel("Work email")).toHaveAttribute("aria-invalid", "true");
});

test("every staff screen is usable, accessible, and fits the screen", async ({ page }) => {
  await signIn(page);
  for (const [path, h1] of [["/dashboard", "Hi, Dana"], ["/calendar?date=2026-11-23", "Calendar"], ["/customers", "Customers"], ["/services", "Services"],
    ["/payments", "Payments"], ["/services/new", "Add a service"], ["/customers/new", "Add a customer"], ["/bookings/new", "New booking"]] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 }), path).toHaveText(h1);
    await noSideways(page);
    await noSerious(page);
    expect(await page.locator('main [data-slot="button"][data-variant="default"]:visible').count(), `${path} primary buttons`).toBeLessThanOrEqual(1);
  }
});

test("the calendar shows the day's bookings and moves between days", async ({ page }) => {
  await signIn(page);
  await page.goto("/calendar?date=2026-11-23");
  await expect(page.getByRole("heading", { name: "Monday, November 23" })).toBeVisible();
  await expect(page.getByText("Maria Alvarez with Dana")).toBeVisible();
  await page.getByRole("link", { name: "Next day" }).click();
  await expect(page.getByRole("heading", { name: "Tuesday, November 24" })).toBeVisible();
});

test("the owner adds a service, and a mistake is explained first", async ({ page }) => {
  await signIn(page);
  const name = `Teeth clean ${unique(page)}`;
  await page.goto("/services/new");
  await page.getByLabel("Service name").fill(name);
  await page.getByLabel("Length in minutes").fill("20");
  await page.getByLabel("Price").fill("free");
  await page.getByRole("button", { name: "Save service" }).click();
  await expect(page.getByText("Enter a price, like 85.00")).toBeVisible();
  await expect(page.getByLabel("Service name")).toHaveValue(name); // nothing typed is lost
  await page.getByLabel("Price").fill("25");
  await page.getByRole("button", { name: "Save service" }).click();
  await expect(page).toHaveURL(/\/services\?added=service$/);
  await expect(page.getByRole("cell", { name })).toBeVisible();
});

test("staff who are not managers cannot add services", async ({ page }) => {
  await signIn(page, "lee@example.com");
  await page.goto("/services");
  await expect(page.getByRole("link", { name: "Add service" })).toHaveCount(0);
  await page.goto("/services/new");
  await expect(page).toHaveURL(/\/services$/);
});

test("staff add a customer and book them, and a double booking is refused", async ({ page }) => {
  await signIn(page);
  const w = unique(page);
  await page.goto("/customers/new");
  await page.getByLabel("Name").fill(`Test Person ${w}`);
  await page.getByLabel("Phone").fill(`555 010 ${w.padStart(4, "0")}`);
  await page.getByRole("button", { name: "Save customer" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(`Test Person ${w}`);
  await expect(page.getByText(`(555) 010-${w.padStart(4, "0")}`)).toBeVisible();

  await page.getByRole("link", { name: "Book a visit" }).click();
  const day = { "375": "2026-12-01", "768": "2026-12-02", "1280": "2026-12-03" }[w]!;
  await page.getByLabel("Service").selectOption({ label: "Nail trim (15 min, $15.00)" });
  await page.getByLabel("Date").fill(day);
  await page.getByLabel("Start time").fill("11:00");
  await page.getByRole("button", { name: "Save booking" }).click();
  await expect(page).toHaveURL(new RegExp(`/calendar\\?date=${day}$`));
  await expect(page.getByText(`Test Person ${w} with Dana`)).toBeVisible();

  await page.goto("/bookings/new");
  await page.getByLabel("Customer").selectOption({ label: "Maria Alvarez" });
  await page.getByLabel("Service").selectOption({ label: "Nail trim (15 min, $15.00)" });
  await page.getByLabel("Date").fill(day);
  await page.getByLabel("Start time").fill("11:05");
  await page.getByRole("button", { name: "Save booking" }).click();
  await expect(page.getByText("That person is already booked then")).toBeVisible();
});

test("customer search finds by name and by phone", async ({ page }) => {
  await signIn(page);
  await page.goto("/customers?q=priya");
  await expect(page.getByRole("link", { name: /Priya Shah/ }).locator("visible=true")).toHaveCount(1);
  await expect(page.getByText("Maria Alvarez")).toHaveCount(0);
  await page.goto("/customers?q=0104");
  await expect(page.getByRole("link", { name: /Tom Becker/ }).locator("visible=true")).toHaveCount(1);
  await page.goto("/customers?q=nobody-here");
  await expect(page.getByRole("heading", { name: "No customers match" })).toBeVisible();
});

test("signing out ends the session", async ({ page }) => {
  await signIn(page);
  const wide = page.viewportSize()!.width >= 1280;
  if (!wide) await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("a customer books online, and the time is then gone", async ({ page }) => {
  const day = { "375": "2026-12-08", "768": "2026-12-09", "1280": "2026-12-10" }[unique(page)]!;
  await page.goto(`/book?date=${day}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Book a visit");
  await noSideways(page);
  await noSerious(page);
  await page.getByRole("radio", { name: /Bath and brush/ }).check();
  await page.getByRole("button", { name: "Show open times" }).click();
  await pickTime(page, "9:00 AM");
  await page.getByLabel("Your name").fill("Online Person");
  await page.getByLabel("Email").fill(`online-${unique(page)}@example.com`);
  await page.getByRole("button", { name: "Confirm booking" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("You are booked");
  await expect(page.getByText(/Bath and brush, Tuesday|Bath and brush, Wednesday|Bath and brush, Thursday/)).toBeVisible();
  await expect(page).toHaveTitle(/^You are booked \|/); // the title follows the page in after a redirect
  await noSerious(page);

  // Two staff can each take 9:00, so it stays open once and closes after the second booking.
  await page.goto(`/book?date=${day}`);
  await page.getByRole("radio", { name: /Bath and brush/ }).check();
  await page.getByRole("button", { name: "Show open times" }).click();
  await pickTime(page, "9:00 AM");
  await page.getByLabel("Your name").fill("Second Person");
  await page.getByLabel("Email").fill(`second-${unique(page)}@example.com`);
  await page.getByRole("button", { name: "Confirm booking" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("You are booked");
  await page.goto(`/book?date=${day}&service=00000000-0000-4000-8002-000000000002`);
  await expect(page.getByRole("button", { name: "9:00 AM" })).toHaveCount(0);
});

test("the booking form explains what is missing", async ({ page }) => {
  await page.goto("/book?date=2026-12-14");
  await page.getByRole("button", { name: "Confirm booking" }).click();
  await expect(page.getByText("Choose a time")).toBeVisible();
  await expect(page.getByText("Enter your name")).toBeVisible();
  await expect(page.getByText("Enter a valid email")).toBeVisible();
});

test("a closed day says so", async ({ page }) => {
  await page.goto("/book?date=2026-11-29"); // a Sunday
  await expect(page.getByRole("heading", { name: "No open times on Sunday, November 29" })).toBeVisible();
});

test("a booking sent for a time that is not open is refused", async ({ page }) => {
  await page.goto("/book?date=2026-12-15");
  // Send the form with a time outside business hours, as a tampered browser would.
  await page.evaluate(() => {
    const radio = document.querySelector<HTMLInputElement>('input[name="time"]')!;
    radio.value = "06:00";
  });
  await page.getByLabel("Your name").fill("Sneaky");
  await page.getByLabel("Email").fill("sneaky@example.com");
  await page.getByRole("button", { name: "Confirm booking" }).click();
  await expect(page.getByText("That time is no longer open. Choose another.")).toBeVisible();
});
