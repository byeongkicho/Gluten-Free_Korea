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
