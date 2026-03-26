# CLAUDE.md

## Read this first
→ `docs/PROJECT.md` — the single source of truth for everything.

## Rules
- Propose smallest viable diff first.
- Preserve static-first architecture (no DB, no API fetch).
- Runtime data = `data/places.json` only.
- Never edit `public/images/places/` directly — always use `optimize:images`.
- Never commit `data/naver_raw.json`.
- If data model changes, append decision in `docs/DECISIONS.md`.
