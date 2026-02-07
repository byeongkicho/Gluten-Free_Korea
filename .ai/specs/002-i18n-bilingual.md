# Spec 002 — Bilingual Content (EN primary, KR secondary)

You are a spec writer; do not write code.

## Goals

- Support English-first UI/content with Korean as secondary.
- Keep the authoring workflow lightweight (JSON/MDX driven).

## Non-goals

- No full translation pipeline.
- No automatic translation generation.

## Acceptance Criteria (testable)

- Users can view core pages in EN and KR (either via language toggle or URL prefix).
- Content entries can include both languages without duplicating too much structure.

## Scope

- In scope:
  - Language toggle UX
  - Content model for bilingual fields
- Out of scope:
  - i18n across every UI string at once

## Risks / Unknowns

- Next.js i18n strategy choice (route groups vs URL prefix).

## Work breakdown (2–5 small steps)

1) Choose i18n routing pattern (`/en/*`, `/ko/*` recommended).
2) Update content schema to include bilingual fields (title, description, notes).
3) Update 1–2 key routes as proof (Home + one directory page).

## Verification plan (commands only; do not run)

- `npm run build`
- Manual: switch languages and verify URLs + content rendering
