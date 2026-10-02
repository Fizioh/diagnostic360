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

Set GitHub repository variable `MISSION_API_URL` to the Worker URL for Pages builds.

## Audit note (2026-10-02)

Removed `public/data/mission2027-planning.json` from static deployment. Content was generic mission placeholders but still operational context; it is now served only via `GET /api/planning` after authentication.
