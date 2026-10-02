# Security policy

## Reporting

Open a GitHub Issue **without** pasting secrets, tokens, exports, or personal mission data.

## Design

- The GitHub Pages frontend is fully public static JavaScript.
- Authentication passphrases and session keys belong **only** on the Cloudflare Worker (`services/mission2027-api`).
- See [docs/security-access.md](docs/security-access.md) and [docs/public-repository-audit.md](docs/public-repository-audit.md).

## Prohibited in commits

Notion tokens, GitHub PATs, Cloudflare API tokens, access passphrases, personal JSON exports, private URLs with credentials.
