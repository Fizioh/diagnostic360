# GitHub Pages deployment

- **URL:** https://fizioh.github.io/diagnostic360/
- **Base path:** `/diagnostic360/` (Vite `base` in production)
- **SPA routing:** `dist/404.html` is a copy of `index.html` after build

## CI/CD

| Workflow | Trigger | Steps |
|----------|---------|--------|
| `ci.yml` | Pull request → `main` | lint, test, build:check |
| `deploy-pages.yml` | Push → `main` | lint, test, build:check, deploy Pages |

## Security

No Notion/GitHub/Khamseen secrets in frontend bundles. Planning data: static JSON under `public/data/` or browser import on `/data`.

Live Notion sync: **KHA-229** (trusted backend behind `NotionAdapter`).
