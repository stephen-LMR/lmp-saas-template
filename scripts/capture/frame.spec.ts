import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

// Second step of scripts/capture.mjs. For each captured test it opens the phone frame page
// with that test's clip, lets it play once while Playwright records, and saves a sharp
// still of the frame. It only runs when the capture script asks for it.
type Job = { slug: string; alt: string; seconds: number; dir: string };
const jobs: Job[] = process.env.CAPTURE_JOBS ? JSON.parse(readFileSync(process.env.CAPTURE_JOBS, "utf8")) : [];

for (const job of jobs) {
  test(job.slug, async ({ page, browser, baseURL }) => {
    const serve = async (target: typeof page) => {
      await target.route(url => url.pathname.startsWith(`/__capture/${job.slug}/`), route => {
        const name = new URL(route.request().url()).pathname.split("/").pop()!;
        return route.fulfill({ path: join(job.dir, name), contentType: name.endsWith(".webm") ? "video/webm" : "image/png" });
      });
    };
    const query = (withClip: boolean) => {
      const q = new URLSearchParams({ still: `/__capture/${job.slug}/still.png`, alt: job.alt });
      if (withClip) q.set("clip", `/__capture/${job.slug}/clip.webm`);
      return `/design/phone/frame?${q}`;
    };

    // The framed still: twice the pixels so it stays sharp, with see-through corners.
    const sharp = await browser.newContext({ baseURL, viewport: { width: 440, height: 880 }, deviceScaleFactor: 2 });
    const stillPage = await sharp.newPage();
    await serve(stillPage);
    await stillPage.goto(query(false));
    const img = stillPage.locator('[data-slot="phone-frame"] img');
    await expect(img).toBeVisible();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    await stillPage.locator('[data-slot="phone-frame"]').screenshot({ path: join(job.dir, "framed.png"), omitBackground: true });
    await sharp.close();

    // The framed clip: this page is being recorded while the clip plays through once.
    await serve(page);
    await page.goto(query(true));
    const video = page.locator('[data-slot="phone-frame"] video');
    await expect(video).toBeVisible();
    await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime > 0 && !el.paused)).toBe(true);
    await page.waitForTimeout(job.seconds * 1000);
  });
}
