# Access control (Mission 2027)

## Architecture

```text
GitHub Pages (static React)
   → Locked UI
   → Cloudflare Worker (mission2027-api)
        POST /auth/login   (PBKDF2 verifier, rate limited)
        GET  /auth/session (HttpOnly cookie JWT)
        GET  /api/planning (authenticated only)
   → NotionAdapter (future: server-side only)
```

## Rules

- No passphrase, hash, or session secret in the frontend bundle.
- `VITE_MISSION_API_URL` is only the public HTTPS origin of the Worker.
- Personal planning data is **not** shipped under `public/` on GitHub Pages.
- Browser-local IndexedDB / localStorage (diagnostic, workspace backup) remains on device; protect device access separately.

## Worker setup

```bash
cd services/mission2027-api
npm install
npm run hash-passphrase -- "your-long-passphrase"
npx wrangler secret put SESSION_SECRET   # openssl rand -base64 32
npx wrangler secret put PASSPHRASE_SALT
npx wrangler secret put PASSPHRASE_HASH
npm run deploy
```

Optional global login rate limits: `wrangler kv namespace create RATE_LIMIT_KV`, then bind `RATE_LIMIT_KV` in `wrangler.toml`. Without KV, the Worker uses the Cache API (better than in-memory; KV preferred in production).

Login hardening: request body capped at 4 KiB, passphrase max 256 characters, JWT verification restricted to HS256.

Set GitHub repository variable `MISSION_API_URL` to the Worker URL for Pages builds.

## Production (2026-10-02)

| Item | Value |
|------|--------|
| GitHub Pages | `https://fizioh.github.io/diagnostic360/` |
| Worker (public API origin) | `https://mission2027-api.batrom.workers.dev` |
| Cloudflare account | `batrom@laposte.net` (Workers + KV `RATE_LIMIT_KV`) |
| Rate limiting | KV-backed login failures (8 / 15 min → 429) |

Previous Cloudflare account and KV/Worker resources are obsolete.

**GitHub Actions:** `CLOUDFLARE_API_TOKEN` secret is configured for `deploy-api.yml`. Prefer a dedicated account API token (Workers Scripts Edit + Workers KV Storage Edit on account `ec00ef17164a55a5b3fad3d8b5524201`) over short-lived Wrangler OAuth tokens — rotate via [API token template](https://dash.cloudflare.com/profile/api-tokens?permissionGroupKeys=%5B%7B%22key%22%3A%22workers_scripts%22%2C%22type%22%3A%22edit%22%7D%2C%7B%22key%22%3A%22workers_kv_storage%22%2C%22type%22%3A%22edit%22%7D%5D&accountId=ec00ef17164a55a5b3fad3d8b5524201&zoneId=all&name=GitHub%20Actions%20mission2027-api). `MISSION_API_URL` is set as a repository variable for Pages builds.

## Audit note (2026-10-02)

Removed `public/data/mission2027-planning.json` from static deployment. Content was generic mission placeholders but still operational context; it is now served only via `GET /api/planning` after authentication.
