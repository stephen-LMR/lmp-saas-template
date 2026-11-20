import { defineConfig } from "@playwright/test";

const PORT = 3100;
// The widths every screen is checked at. Same list as DESIGN_VIEWPORTS in contracts/template.ts.
const WIDTHS = [375, 768, 1280];

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: WIDTHS.map(width => ({
    name: `w${width}`,
    use: { browserName: "chromium" as const, viewport: { width, height: 900 } }
  })),
  webServer: {
    command: `npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: !process.env.CI
  }
});
