# CLAUDE.md

Planning wrapper.

## Read Order
1. `docs/PROJECT.md` (SSOT)
2. `docs/DECISIONS.md` (append-only)
3. `AGENTS.md` (implementation rules wrapper)

## Planning Rules
- Propose smallest viable diff first.
- Preserve static-first architecture.
- Keep runtime reads limited to `data/places.json`.
- Avoid route changes unless explicitly requested.
