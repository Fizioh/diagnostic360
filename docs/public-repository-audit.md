# Public repository audit

**Date:** 2026-10-02  
**Scope:** Tracked files, recent git history, frontend bundles.

## Method

- Grep for `NOTION_TOKEN`, `ghp_`, `github_pat_`, `SESSION_SECRET`, `PASSPHRASE_HASH`, `VITE_ACCESS` in source (excluding `node_modules`).
- `npm run build:check` — automated bundle scan on `dist/assets/*.js`.
- Git history search for `NOTION_TOKEN` and `ghp_` — **no matches**.
- Review of former `public/data/mission2027-planning.json` (removed from `main` working tree).

## Findings

| Item | Severity | Status |
|------|----------|--------|
| `public/data/mission2027-planning.json` in commit `670e758` | Low | Generic placeholder roadmap/tasks (no company names, no tokens). **Removed** from current tree; served only via authenticated Worker API going forward. History still contains the file — rewrite history only if you require complete removal from clones. |
| `.env.example` | OK | Documents public `VITE_MISSION_API_URL` only; no secrets. |
| Worker secrets | OK | Expected only in Cloudflare Wrangler secrets, not in repo. |
| README / docs | OK | No tokens, DB IDs, or personal pipeline data after this audit. |

## Ongoing

- Do not commit `.env`, exports, or personal Mission 2027 JSON backups.
- Run `npm run build:check` before merging to `main`.
- Keep planning snapshots off `public/` in GitHub Pages builds.
