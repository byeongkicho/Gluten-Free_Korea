# AGENTS.md

Implementation wrapper.

## Read Order
1. `docs/PROJECT.md` (SSOT)
2. `docs/DECISIONS.md` (append-only)
3. This file

## Implementation Rules
- Implement minimal diffs.
- Runtime data source must remain `data/places.json` only.
- Do not add new dependencies for pipeline scripts.
- Keep Cloudflare Pages build compatibility.
- Never commit raw Naver export JSON.
- If data model changes, update `docs/PROJECT.md` and append decision in `docs/DECISIONS.md`.
