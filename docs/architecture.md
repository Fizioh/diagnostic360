# Architecture — Mission 2027 Control Center

Local-first React application. Target repo: `diagnostic-360` (GitHub: `Fizioh/diagnostic360`).

## Layers

```text
src/app/           Routing shell
src/features/      UI by area (dashboard, today, diagnostic, readiness)
src/domain/        Pure business logic (readiness, types, events)
src/persistence/   IndexedDB workspace store
src/integrations/notion/   NotionAdapter + DTO mapping (read-only Stage 1)
src/components/    Shared UI (diagnostic module legacy layout)
```

## Data flow

- **Notion** → `NotionAdapter` → planning snapshot → Today/Dashboard (read-only)
- **Local workspace** → `MissionWorkspaceV1` → evidence, weaknesses, retests, readiness
- **Diagnostic 360** → separate localStorage session (`sm2027-diagnostic-run`) until merged into workspace export (KHA-180+)

Domain entities never store Notion database IDs.

## Core loop (target)

Diagnostic → external review import → evidence → weakness → retest → readiness → dashboard.

## Out of scope V1

Deployment, auth, Notion writes, Khamseen repo changes.
