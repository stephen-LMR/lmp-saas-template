# lmp-saas-template

The base app every merchant app starts from. The build agent configures and extends it. It never regenerates it.

- One repo, one deploy, one database per merchant app, created from this template.
- The app boots from one `AppConfig` in `app.config.json`. A bad config stops the build and lists what is wrong.
- The shape is copied from `lmp-builder` into `contracts/` and `spec/`. Do not change it here; ask Lane E.
- Rules, stack, and design gates live in the `lmp-builder` repo: `CLAUDE.md`, `docs/STACK.md`, `docs/DESIGN.md`, `docs/LANES.md` (Lane B).

## Where things are
| Path | What |
|---|---|
| `app/` | Pages and routes (Next.js App Router) |
| `components/ui/` | shadcn/ui components, restyled to the tokens |
| `tokens/tokens.css` | Design tokens. The only place raw values live |
| `config/` | Loads and checks `app.config.json` |
| `contracts/`, `spec/` | Copied from `lmp-builder`. Do not edit |
| `lib/supabase/` | Supabase clients for the browser and the server |
| `test/` | Unit tests (Vitest) |
| `e2e/` | Browser tests at 375, 768, and 1280 px (Playwright) |
| `scripts/check-design.mjs` | Fails on arbitrary Tailwind values, hex colors, and inline styles |

## Design rules
Tailwind's default colors, type sizes, spacing, radii, shadows, and widths are switched off. Only classes backed by a token in `tokens/tokens.css` exist, so `p-5` or `bg-red-500` produce nothing.

## Run it
Node 24 and npm 11.

```bash
npm ci
npm run dev
```

Every check CI runs:

```bash
npm run typecheck && npm run lint && npm run check-design && npm test && npm run build && npm run test:e2e
```

The first browser test run needs `npx playwright install chromium`.
