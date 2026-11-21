// Pure helpers for scripts/capture.mjs, kept apart so they can be unit tested.

// "Owner books a visit (happy path)" becomes "owner-books-a-visit-happy-path".
export function slugify(text) {
  const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60).replace(/-+$/g, "");
  return slug || "capture";
}

// Flattens a Playwright JSON report into one row per test, with the files it attached.
export function collectTests(report) {
  const rows = [];
  const walk = (suite, file) => {
    for (const spec of suite.specs ?? []) {
      for (const t of spec.tests ?? []) {
        const last = (t.results ?? []).at(-1);
        const attachment = name => (last?.attachments ?? []).find(a => a.name === name && a.path)?.path ?? null;
        rows.push({
          file: spec.file ?? file,
          title: spec.title,
          passed: t.status === "expected",
          skipped: t.status === "skipped",
          ms: last?.duration ?? 0,
          video: attachment("video"),
          screenshot: attachment("screenshot")
        });
      }
    }
    for (const child of suite.suites ?? []) walk(child, child.file ?? file);
  };
  for (const s of report.suites ?? []) walk(s, s.file);
  return rows;
}

// One capture job per passing test that produced both a clip and a still. A failing test is
// never captured: nobody should be shown a recording of something that did not work.
export function planJobs(rows, { maxSeconds }) {
  const jobs = [];
  const left = [];
  const used = new Set();
  for (const r of rows) {
    if (r.skipped) continue;
    if (!r.passed) { left.push({ title: r.title, reason: "the test failed" }); continue; }
    if (!r.video || !r.screenshot) { left.push({ title: r.title, reason: "no recording was produced" }); continue; }
    const base = slugify(r.title);
    let slug = base;
    for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
    used.add(slug);
    jobs.push({
      slug,
      title: r.title,
      file: r.file,
      alt: `The app on a phone: ${r.title}`.slice(0, 160),
      clip_seconds: Math.max(1, Math.ceil(r.ms / 1000)),
      seconds: Math.max(1, Math.min(maxSeconds, Math.ceil(r.ms / 1000))),
      video: r.video,
      screenshot: r.screenshot
    });
  }
  return { jobs, left };
}
