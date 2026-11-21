// Fails if UI code uses a Tailwind class that is not backed by a design token
// (tokens/tokens.css). Those classes produce no CSS at all, so the screen would silently
// lose spacing, color, or type. Runs next to scripts/check-design.mjs.
// Usage: node scripts/check-tokens.mjs <dir>
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const root = process.argv[2] ?? ".";
const SPACING = new Set(["0", "1", "2", "3", "4", "6", "8", "12", "16"]);
const START = "(?<![\\w-])";
const END = "(?![\\w/.-])";
const SPACING_PREFIX =
  "-?(?:p[xytrbl]?|m[xytrbl]?|gap(?:-[xy])?|space-[xy]|w|h|size|min-w|min-h|max-w|max-h|inset(?:-[xy])?|top|right|bottom|left|basis|translate-[xy]|scroll-[mp][xytrbl]?)";
const PALETTE =
  "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|stone|white|black";
const COLOR_PREFIX = "bg|text|border|ring|ring-offset|fill|stroke|from|via|to|outline|divide|decoration|placeholder|caret|accent|shadow";

const RULES = [
  [new RegExp(`${START}${SPACING_PREFIX}-(\\d+(?:\\.\\d+)?)${END}`, "g"), m => !SPACING.has(m[1]), "spacing off the 4, 8, 12, 16, 24, 32, 48, 64 scale"],
  [new RegExp(`${START}rounded(?:-[trbl]{1,2})?(?:-(\\w+))?${END}`, "g"), m => !["sm", "lg", "full", "none"].includes(m[1] ?? ""), "radius that is not sm, lg, full, or none"],
  [new RegExp(`${START}shadow(?:-(\\w+))?${END}`, "g"), m => !["sm", "lg", "none"].includes(m[1] ?? ""), "shadow that is not sm, lg, or none"],
  [new RegExp(`${START}text-(\\d?xs|[3-9]xl|md)${END}`, "g"), m => m[1] !== "xs", "type size off the 6-step scale"],
  [new RegExp(`${START}(?:${COLOR_PREFIX})-(?:${PALETTE})(?:-\\d+)?${END}`, "g"), () => true, "color outside the design tokens"],
  [new RegExp(`${START}max-w-(?:\\d?xs|sm|md|lg|\\d?xl|prose|screen-\\w+)${END}`, "g"), () => true, "width that is not max-w-content"],
  [new RegExp(`${START}(?:sm|lg|2xl):[\\w-]`, "g"), () => true, "breakpoint that is not md or xl"]
];
const SKIP = new Set(["node_modules", ".next", "dist", "tokens", "test", "e2e", "tests", "scripts", "test-results", "playwright-report"]);
let problems = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name) || name.startsWith(".")) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if ([".tsx", ".jsx"].includes(extname(p))) check(p);
  }
}
function check(file) {
  readFileSync(file, "utf8").split("\n").forEach((line, i) => {
    for (const [re, bad, what] of RULES) {
      for (const m of line.matchAll(re)) {
        if (!bad(m)) continue;
        problems++;
        console.log(`${file}:${i + 1}  ${what}: ${m[0]}`);
      }
    }
  });
}
walk(root);
if (problems) { console.error(`\n${problems} token violation(s)`); process.exit(1); }
console.log("Token check passed");
