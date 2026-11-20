// Fails if UI code uses arbitrary Tailwind values, hex colors, or inline styles.
// Run against a merchant app or the template: node scripts/check-design.mjs <dir>
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const root = process.argv[2] ?? ".";
const RULES = [
  [/\b[a-z-]+-\[[^\]]+\]/g, "arbitrary Tailwind value"],
  [/#[0-9a-fA-F]{3,8}\b/g, "hex color outside design tokens"],
  [/style=\{\{/g, "inline style"]
];
const SKIP = new Set(["node_modules", ".next", "dist", "tokens"]);
let problems = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if ([".tsx", ".jsx"].includes(extname(p))) check(p);
  }
}
function check(file) {
  readFileSync(file, "utf8").split("\n").forEach((line, i) => {
    for (const [re, what] of RULES) {
      for (const m of line.matchAll(re)) {
        problems++;
        console.log(`${file}:${i + 1}  ${what}: ${m[0]}`);
      }
    }
  });
}
walk(root);
if (problems) { console.error(`\n${problems} design violation(s)`); process.exit(1); }
console.log("Design check passed");
