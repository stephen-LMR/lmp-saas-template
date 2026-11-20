# lmp-saas-template

The base app every merchant app starts from. The build agent configures and extends it. It never regenerates it.

- One repo, one deploy, one database per merchant app, created from this template.
- The app boots from one `AppConfig` in `app.config.json`. The shape is copied from `lmp-builder` (`contracts/`). Do not change it here.
- Rules, stack, and design gates live in the `lmp-builder` repo: `CLAUDE.md`, `docs/STACK.md`, `docs/DESIGN.md`, `docs/LANES.md` (Lane B).

## Run it
Node 24 and npm 11.

```bash
npm ci
npm run typecheck
npm test
```
