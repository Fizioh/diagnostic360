# Mission 2027 — Control Center (`diagnostic-360`)

**Engineering Readiness Control Center** with **Diagnostic 360** as one module. Hosted on **GitHub Pages** (static); personal state stays in the browser.

**Live:** https://fizioh.github.io/diagnostic360/

## Run locally

```bash
npm install
npm run dev
```

```bash
npm run lint
npm run test
npm run build:check
```

Production build uses `base: /diagnostic360/` for GitHub Pages. `dist/404.html` is copied from `index.html` so client-side routes work on refresh.

## Scope

- Overview dashboard, Today, Readiness (evidence-based)
- Full Diagnostic 360 (`/diagnostic`)
- IndexedDB workspace + localStorage diagnostic sessions
- Notion planning via `StaticSnapshotNotionAdapter` (bundled JSON + optional browser import; no API secrets on Pages)

## Docs

- [docs/architecture.md](docs/architecture.md)
- [docs/domain-model.md](docs/domain-model.md)

## Linear

Project: **Mission 2027 — Control Center**

Notion workspace (product context): *Mission 2027 — Préparation technique & recherche de mission* — integrated read-only in Stage 1.
