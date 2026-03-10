# PROJECT.md (SSOT)

## Project
- Name: Gluten-Free Korea
- Stack: Next.js 15 App Router, React 19, Tailwind CSS 4
- Deployment: Cloudflare Pages via `@cloudflare/next-on-pages`

## Routes (current)
- `/` home place directory
- `/guide` static gluten-free safety guide
- `/place/[slug]` place detail route backed by `data/places.json`

## Data Pipeline (automation-friendly)
- Raw import source (local, gitignored): `data/naver_raw.json`
- Import script: `scripts/import_naver.mjs` -> `data/candidates.naver.json`
- Generated output: `data/places.json` (top-level array, site reads only this file)
- Candidate pool: `data/candidates.naver.json`
- Manual overrides: `data/overrides.json` (map `sid -> overrides`)
- Build script: `scripts/build_places.mjs`
- Validation script: `scripts/validate_places.mjs`

## Source of Truth
- Runtime SSOT for pages: `data/places.json`
- Authoring inputs: candidates + overrides
- `data/places.json` is generated and should not be edited manually

## Commands
- `npm run dev` start local dev server on `http://localhost:3000`
- `npm run import:naver` sanitize `data/naver_raw.json` into `data/candidates.naver.json`
- `npm run publish:local` run `import:naver -> build:places -> validate:places`
- `npm run build:places` generate `data/places.json`
- `npm run validate:places` validate generated places data
- `npm run build` Next.js production build
- `npm run pages:build` Cloudflare Pages build (`build:places` first)

## Build/Deploy Requirements
- No DB/API/client fetch for places
- Keep static-first architecture

## Notes
- Naver raw export JSON must not be committed.
- Commit only sanitized candidate data (`data/candidates.naver.json`).
