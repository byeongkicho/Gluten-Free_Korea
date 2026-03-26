# AGENTS.md

## Read Order
1. `docs/PROJECT.md` (SSOT — everything is here)
2. `docs/DECISIONS.md` (append-only architecture decisions)
3. This file (implementation constraints)

## Implementation Rules
- Implement minimal diffs.
- Runtime data source: `data/places.json` only.
- Images: edit originals in `NoGlutenSeoul_Assets/`, run `optimize:images`.
- Do not add new dependencies for pipeline scripts (sharp is already installed).
- Keep Cloudflare Pages build compatibility.
- Never commit raw Naver export JSON.
- If data model changes, update `docs/PROJECT.md` and append to `docs/DECISIONS.md`.
