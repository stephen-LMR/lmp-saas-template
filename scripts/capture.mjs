// Films the acceptance tests on a phone-sized screen (375 px wide) and saves, for each
// passing test: the clip, a still picture, and both again inside the phone frame.
//
//   npm run capture                         films tests/acceptance
//   npm run capture -- e2e/design.spec.ts -g "picking a time"
//
// Output: captures/<test>/clip.webm, still.png, framed.webm, framed.png, and
// captures/manifest.json. The clips have no sound and loop cleanly in a <video loop> tag.
//   CAPTURE_BASE_URL=https://preview.example.com npm run capture     films a deployed preview
//
// Without CAPTURE_BASE_URL it films a local build (run npm run build first).
// Exits with an error if nothing could be captured.
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { collectTests, planJobs } from "./capture-lib.mjs";

const WORK = ".capture";
const OUT = process.env.CAPTURE_OUT ?? "captures";
const MAX_SECONDS = Number(process.env.CAPTURE_MAX_SECONDS ?? 12);
const args = process.argv.slice(2);
const targets = args.length > 0 ? args : ["tests/acceptance"];

const fail = message => { console.error(`Capture failed: ${message}`); process.exit(1); };
if (!Number.isFinite(MAX_SECONDS) || MAX_SECONDS < 1 || MAX_SECONDS > 60) fail("CAPTURE_MAX_SECONDS must be between 1 and 60.");
const BASE = process.env.CAPTURE_BASE_URL;
if (BASE !== undefined && !/^https?:\/\/[^\s/]+\/?$/.test(BASE)) fail("CAPTURE_BASE_URL must be an address like https://preview.example.com with no path.");
if (!BASE && !existsSync(".next")) fail("the app is not built. Run: npm run build");

rmSync(WORK, { recursive: true, force: true });
rmSync(OUT, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });

function playwright(stage, extraArgs, env = {}) {
  const jsonFile = join(WORK, `${stage}.json`);
  const r = spawnSync("npx", ["playwright", "test", ...extraArgs, "--reporter=json"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, CAPTURE_STAGE: stage, PLAYWRIGHT_JSON_OUTPUT_NAME: jsonFile, ...env }
  });
  writeFileSync(join(WORK, `${stage}.log`), `${r.stdout ?? ""}${r.stderr ?? ""}`);
  try {
    return collectTests(JSON.parse(readFileSync(jsonFile, "utf8")));
  } catch {
    fail(`the ${stage} step produced no report. See ${join(WORK, `${stage}.log`)}`);
  }
}

// Step 1: film the tests.
const { jobs, left } = planJobs(playwright("record", targets), { maxSeconds: MAX_SECONDS });
if (jobs.length === 0) fail(`no passing test to capture in ${targets.join(" ")}.${left.length ? ` Left out: ${left.map(l => `${l.title} (${l.reason})`).join("; ")}` : ""}`);

for (const job of jobs) {
  job.dir = resolve(OUT, job.slug);
  mkdirSync(job.dir, { recursive: true });
  copyFileSync(job.video, join(job.dir, "clip.webm"));
  copyFileSync(job.screenshot, join(job.dir, "still.png"));
}
const jobsFile = resolve(WORK, "jobs.json");
writeFileSync(jobsFile, JSON.stringify(jobs, null, 2));

// Step 2: put each clip and still inside the phone frame.
const framed = playwright("frame", [], { CAPTURE_JOBS: jobsFile });
for (const job of jobs) {
  const row = framed.find(r => r.title === job.slug);
  if (!row?.passed || !row.video) fail(`could not frame "${job.title}". See ${join(WORK, "frame.log")}`);
  copyFileSync(row.video, join(job.dir, "framed.webm"));
}

// Step 3: check every file is really there, then write the list.
const FILES = ["clip.webm", "still.png", "framed.webm", "framed.png"];
for (const job of jobs) {
  for (const f of FILES) {
    const p = join(job.dir, f);
    if (!existsSync(p) || statSync(p).size === 0) fail(`${join(OUT, job.slug, f)} is missing or empty.`);
  }
}
const manifest = {
  width: 375,
  height: 812,
  base_url: BASE ?? null,
  captures: jobs.map(j => ({
    slug: j.slug, title: j.title, test_file: j.file, alt: j.alt,
    clip_seconds: j.clip_seconds, framed_clip_seconds: j.seconds,
    clip: `${j.slug}/clip.webm`, still: `${j.slug}/still.png`,
    framed_clip: `${j.slug}/framed.webm`, framed_still: `${j.slug}/framed.png`
  })),
  left_out: left
};
writeFileSync(join(OUT, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Captured ${jobs.length} flow(s) into ${OUT}/${left.length ? `. Left out ${left.length}: ${left.map(l => l.title).join("; ")}` : ""}`);
