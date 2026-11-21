# lmp-saas-template

The base app every merchant app starts from. The build agent configures and extends it. It never regenerates it.

- One repo, one deploy, one database per merchant app, created from this template.
- The app boots from one `AppConfig` in `app.config.json`. A bad config, an unapproved theme, or a module that cannot be built stops the build and lists what is wrong.
- The shape is copied from `lmp-builder` into `contracts/` and `spec/`. Do not change it here; ask Lane E.
- Rules, stack, and design gates live in the `lmp-builder` repo: `CLAUDE.md`, `docs/STACK.md`, `docs/DESIGN.md`, `docs/LANES.md` (Lane B).

## Where things are
| Path | What |
|---|---|
| `app/` | Pages and routes (Next.js App Router). `app/design/` holds the sample screens |
| `components/ui/` | shadcn/ui components, restyled to the tokens |
| `patterns/` | The page patterns every module uses, and `patterns/states.tsx` |
| `tokens/tokens.css` | Design tokens. The only place raw values live |
| `tokens/theme-catalog.json` | The approved theme presets and font pairings |
| `design/` | Theme resolver, contrast math, brand color mapping |
| `modules/` | Module registry, settings schemas, record shapes, booking and money math |
| `seed/` | Demo data. Invented people only |
| `config/` | Loads and checks `app.config.json` |
| `contracts/`, `spec/` | Copied from `lmp-builder`. Do not edit |
| `lib/supabase/` | Supabase clients for the browser and the server |
| `test/` | Unit tests (Vitest) |
| `e2e/` | Browser tests and visual baselines at 375, 768, and 1280 px (Playwright) |
| `scripts/` | `check-design`, `check-tokens`, and `gates` |

The build agent may write only in `src/custom/`, `tests/acceptance/`, `content/help/`, and `supabase/migrations/custom_*.sql`.

## Themes
A merchant app never gets a custom design. It gets a theme: one of 8 presets, a primary and accent shade from that preset, one of 4 font pairings, and light or dark.

- Presets: `ocean`, `forest`, `sunset`, `berry`, `plum`, `slate`, `indigo` (light) and `midnight` (dark).
- Font pairings: `clean`, `friendly`, `classic`, `modern`.
- `tokens/theme-catalog.json` is in the shape of `ThemeCatalog` in `lmp-builder/src/build/theme.ts`, so the pipeline can read it as is.
- `mapBrandColor()` in `design/theme.ts` snaps a merchant's brand color to the nearest approved shade that passes WCAG AA.
- A theme outside the catalog, or a shade that fails contrast in the chosen mode, fails the build.

## Design rules
Tailwind's default colors, type sizes, spacing, radii, shadows, and widths are switched off. Only classes backed by a token in `tokens/tokens.css` exist, so `p-5` or `bg-red-500` produce nothing. `npm run check-tokens` fails on any such class.

- Spacing: 0, 1, 2, 3, 4, 6, 8, 12, 16 (4 to 64 px). Radius: `sm`, `lg`, `full`. Shadow: `sm`, `lg`. Type: `xs` to `2xl`. Width: `max-w-content`. Breakpoints: `md` (768) and `xl` (1280).
- For widths between, use fractions (`w-1/2`) or grid columns.
- State variants: `state-open:`, `state-closed:`, `current:`, `aria-checked:`, `aria-selected:`, `aria-pressed:`. No arbitrary `data-[...]` variants.
- One primary button per screen. Every list and form uses the states in `patterns/states.tsx`.

## Modules
`modules/registry.ts` has one entry per `ModuleKey`. Built so far (settings, records, and logic; pages and database come next): `auth`, `services_catalog`, `booking`, `customers_crm`, `payments_onetime`. Switching on a module that is not built yet fails the build.

## Run it
Node 24 and npm 11.

```bash
npm ci
npm run dev
```

Open `/design` for the component gallery and links to every pattern.

Every gate, with results as JSON (the pipeline calls it this way):

```bash
GATES_OUT=gates.json npm run gates
```

First run on a new machine: `npx playwright install chromium`. Lighthouse needs Chrome, or `CHROME_PATH` set to one.

After an intended design change, approve new visual baselines with `npm run test:visual:update` (Mac) and the "Visual baselines" workflow in GitHub Actions (Linux, used by CI and the build sandbox).
