# Architecture — Mission 2027 Control Center

React + TypeScript app. Repository: [Fizioh/diagnostic360](https://github.com/Fizioh/diagnostic360).

## Layers

```text
src/app/                 Routing shell
src/features/            UI (dashboard, today, diagnostic, readiness, remediation, auth, data)
src/domain/              Pure logic (readiness, weakness/retest, backup, diagnostic review)
src/persistence/         IndexedDB workspace store
src/integrations/        auth API client, NotionAdapter + DTO mapping
src/components/          Diagnostic module UI
services/mission2027-api/ Cloudflare Worker — auth + protected planning API
```

## Data flow

```text
GitHub Pages UI
   → Auth Worker (session cookie)
   → GET /api/planning (when authenticated)
   → NotionAdapter → domain planning snapshot → Today/Dashboard

Local workspace (IndexedDB) → evidence, weaknesses, retests → readiness compute
Diagnostic 360 (localStorage) → export → external review JSON → import → workspace
```

Domain entities **never** store Notion database IDs.

## Core loop

Diagnostic → external review import → evidence → weakness (+ retest scheduled) → remediate → pass retest → stronger evidence → readiness → dashboard.

## Security boundary

- No secrets in Vite bundles.
- Private planning data is not published under `public/` for Pages.
- Future live Notion sync: server-side adapter only ([docs/security-access.md](security-access.md)).
