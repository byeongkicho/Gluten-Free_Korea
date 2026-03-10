# DECISIONS.md

Append-only architecture decisions.
Rule: never edit old entries; add a new entry to supersede prior decisions.

## 2026-03-10 — Automation-first place publishing
- Status: accepted
- Decision: Introduce a generated runtime dataset (`data/places.json`) produced from candidate pool + selected SIDs + per-SID overrides.
- Rationale: Enables reliable automation while preserving static build and minimal runtime complexity.

## 2026-03-10 — No category routes in MVP
- Status: accepted
- Decision: Keep only `/`, `/guide`, `/place/[slug]`; do not introduce `/food`, `/dining`, `/shop` categories now.
- Rationale: Minimize routing complexity and avoid migration churn while content volume is small.

## 2026-03-10 — Never commit raw Naver export
- Status: accepted
- Decision: Raw export artifacts are ignored from git; only sanitized candidate fields are committed.
- Rationale: Reduce sensitive/noisy data in repository and keep deterministic, reviewable inputs.

## 2026-03-10 — select:sync publishes all candidates by default
- Status: accepted
- Decision: `scripts/sync_selected_sids.mjs` rewrites `selected_sids.txt` with every SID in `candidates.naver.json`. No manual cherry-picking step.
- Rationale: Curation happens upstream at the import stage (which candidates enter `candidates.naver.json`), not at the selection stage. Keeps the publish loop to 4 commands: `import:naver → select:sync → build:places → pages:build`.
- Consequence: to exclude a specific place, remove it from `candidates.naver.json` (or add an override) rather than editing `selected_sids.txt` by hand.

## 2026-03-10 — Dual data entry paths (Naver + manual)
- Status: accepted (manual path pending implementation)
- Decision: `places.json` will be merged from two sources: (1) Naver pipeline via `candidates.naver.json` + `selected_sids.txt`, (2) `data/manual.json` for non-Naver places (Instagram, blog-sourced, etc.). Manual entries require explicit `slug` field; no `sid` needed.
- Slug convention: Naver slugs → `{ascii-name}-{sid}` (ends in numeric). Manual slugs → plain words. Prevents collision by convention.
- Status note: `manual.json` path not yet implemented in `build_places.mjs`.

## 2026-03-10 — Remove selected_sids indirection
- Status: accepted
- Decision: `build_places.mjs` now iterates all deduped candidates directly and no longer reads `data/selected_sids.txt`.
- Supersedes: “select:sync publishes all candidates by default” for runtime behavior.
- Rationale: removes one file and one command from the operational loop while preserving overrides and dedupe.
