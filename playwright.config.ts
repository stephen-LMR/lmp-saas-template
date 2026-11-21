import { defineConfig } from "@playwright/test";

const PORT = 3100;
// The widths every screen is checked at. Same list as DESIGN_VIEWPORTS in contracts/template.ts.
const WIDTHS = [375, 768, 1280];

// scripts/capture.mjs runs Playwright twice with CAPTURE_STAGE set:
// "record" films the tests on a phone-sized screen; "frame" puts each clip in the phone frame.
const stage = process.env.CAPTURE_STAGE;
const PHONE = { width: 375, height: 812 };
const FRAMED = { width: 440, height: 880 };

const projects =
  stage === "record"
    ? [{ name: "w375", use: { browserName: "chromium" as const, viewport: PHONE, video: { mode: "on" as const, size: PHONE }, screenshot: "on" as const } }]
    : stage === "frame"
      ? [{ name: "frame", use: { browserName: "chromium" as const, viewport: FRAMED, video: { mode: "on" as const, size: FRAMED } } }]
      : WIDTHS.map(width => ({ name: `w${width}`, use: { browserName: "chromium" as const, viewport: { width, height: 900 } } }));

export default defineConfig({
  testDir: ".",
  testMatch: stage === "frame" ? ["scripts/capture/frame.spec.ts"] : ["e2e/**/*.spec.ts", "tests/acceptance/**/*.spec.ts"],
  outputDir: stage ? `.capture/${stage}` : "test-results",
  snapshotPathTemplate: "e2e/__screenshots__/{platform}/{projectName}/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI && !stage ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: stage ? "off" : "retain-on-failure" },
  projects,
  webServer: {
    command: `npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: !process.env.CI
  }
});
