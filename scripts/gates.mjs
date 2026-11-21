// Runs every gate the template can run on itself and writes the results as a JSON array of
// { gate, passed, summary, log_url } (GateResult in lmp-builder's contracts/build.ts).
// The pipeline calls it as: GATES_OUT=<file> npm run --silent gates
// Gates that belong to the pipeline (diff_scan, design_review, guide_coverage, video_checks)
// are not reported here. A gate that could not run is reported as failed, never as passed.
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LOGS = ".gates";
mkdirSync(LOGS, { recursive: true });
const results = [];
const report = (gate, passed, summary) => results.push({ gate, passed, summary: summary.slice(0, 500), log_url: null });

function run(name, cmd, args, env = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", env: { ...process.env, CI: "1", ...env }, maxBuffer: 64 * 1024 * 1024 });
  const output = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  writeFileSync(join(LOGS, `${name}.log`), output);
  const tail = output.trim().split("\n").filter(Boolean).slice(-3).join(" | ");
  return { ok: r.status === 0, output, tail: r.error ? String(r.error.message) : tail };
}
const simple = (gate, cmd, args, okText) => {
  const r = run(gate, cmd, args);
  report(gate, r.ok, r.ok ? okText : r.tail);
  return r.ok;
};

simple("typecheck", "npm", ["run", "--silent", "typecheck"], "No type errors.");
simple("lint", "npm", ["run", "--silent", "lint"], "No lint errors.");
simple("unit_tests", "npm", ["test", "--silent"], "All unit tests passed.");

const design = run("design_tokens_design", "node", ["scripts/check-design.mjs", "."]);
const tokens = run("design_tokens_tokens", "node", ["scripts/check-tokens.mjs", "."]);
report("design_tokens", design.ok && tokens.ok, design.ok && tokens.ok ? "Zero violations." : [design, tokens].filter(x => !x.ok).map(x => x.tail).join(" | "));

const audit = run("dependency_scan", "npm", ["audit", "--omit=dev", "--audit-level=high"]);
report("dependency_scan", audit.ok, audit.ok ? "No high or critical issues in shipped packages." : audit.tail);

const hasGitleaks = spawnSync("gitleaks", ["version"], { encoding: "utf8" }).status === 0;
if (hasGitleaks) simple("secret_scan", "gitleaks", ["detect", "--no-banner", "--redact"], "No secrets found.");
else report("secret_scan", false, "Not run: gitleaks is not installed on this machine.");

// Browser gates share one build and one Playwright run.
const BROWSER_GATES = ["template_regression", "acceptance_tests", "accessibility", "mobile_viewport", "visual_regression", "lighthouse"];
const build = run("build", "npm", ["run", "--silent", "build"]);
if (!build.ok) {
  for (const g of BROWSER_GATES) report(g, false, `Not run: the build failed. ${build.tail}`);
} else {
  const jsonFile = join(LOGS, "playwright.json");
  run("playwright", "npx", ["playwright", "test", "--reporter=json"], { PLAYWRIGHT_JSON_OUTPUT_NAME: jsonFile });
  let tests = [];
  try {
    const walk = (suite, file) => {
      for (const spec of suite.specs ?? []) {
        for (const t of spec.tests ?? []) tests.push({ file: spec.file ?? file, title: spec.title, project: t.projectName, status: t.status });
      }
      for (const child of suite.suites ?? []) walk(child, child.file ?? file);
    };
    for (const s of JSON.parse(readFileSync(jsonFile, "utf8")).suites ?? []) walk(s, s.file);
  } catch {
    tests = null;
  }
  const verdict = (gate, pick, { allowEmpty = false, emptyText = "No tests found." } = {}) => {
    if (!tests) return report(gate, false, "Not run: the browser tests produced no report.");
    const mine = tests.filter(pick);
    const failed = mine.filter(t => t.status === "unexpected" || t.status === "flaky");
    const skipped = mine.filter(t => t.status === "skipped");
    const ran = mine.length - skipped.length;
    if (failed.length > 0) return report(gate, false, `${failed.length} of ${mine.length} failed: ${failed.slice(0, 3).map(t => `${t.title} [${t.project}]`).join("; ")}`);
    if (ran === 0 && !allowEmpty) return report(gate, false, emptyText);
    report(gate, true, `${ran} passed.`);
  };
  const isAcceptance = t => t.file.includes("tests/acceptance/");
  const isVisual = t => t.file.endsWith("visual.spec.ts");
  verdict("template_regression", t => !isAcceptance(t) && !isVisual(t));
  verdict("acceptance_tests", isAcceptance, { emptyText: "No acceptance tests found in tests/acceptance." });
  verdict("accessibility", t => t.title.includes("accessibility"));
  verdict("mobile_viewport", t => t.project === "w375" && t.title.includes("sideways"));
  verdict("visual_regression", isVisual, { emptyText: `Not run: no approved baselines for ${process.platform} in e2e/__screenshots__.` });

  // Mobile Lighthouse: performance 90+, accessibility 95+, best practices 95+ (lighthouserc.json).
  const lh = run("lighthouse", "npx", ["lhci", "autorun"]);
  report("lighthouse", lh.ok, lh.ok ? "Performance, accessibility, and best practices meet the thresholds." : lh.tail);
}

const out = process.env.GATES_OUT;
const json = JSON.stringify(results, null, 2);
if (out) writeFileSync(out, json);
else console.log(json);
const failed = results.filter(r => !r.passed);
console.error(failed.length === 0 ? `All ${results.length} gates passed.` : `${failed.length} of ${results.length} gates failed: ${failed.map(f => f.gate).join(", ")}`);
process.exit(failed.length === 0 ? 0 : 1);
