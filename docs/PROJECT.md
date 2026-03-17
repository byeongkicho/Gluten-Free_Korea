# PROJECT.md (SSOT)

## Project
- Name: Gluten-Free Korea
- Stack: Next.js 15 App Router, React 19, Tailwind CSS 4
- Deployment: Cloudflare Pages via `@cloudflare/next-on-pages`
- **Live URL:** https://gluten-free-korea.pages.dev

## Routes (current)
- `/` home place directory
- `/guide` static gluten-free safety guide
- `/place/[slug]` place detail route backed by `data/places.json`

## Data Pipeline (automation-friendly)
- Raw import source (local, gitignored): `data/naver_raw.json`
- Import script: `scripts/import_naver.mjs` → `data/candidates.naver.json`
- Manual overrides: `data/overrides.json` (map `sid → overrides`; also supports manual-only entries)
- Build script: `scripts/build_places.mjs` → `data/places.json`
- Validation script: `scripts/validate_places.mjs`
- Generated output: `data/places.json` (do not edit manually)
- Bilingual note fields: `note` (EN) + optional `note_ko` (KO) may be provided in overrides and passed through to runtime data

### Pipeline flow
```
naver_raw.json (gitignored)
  → import:naver
  → candidates.naver.json + overrides.json
  → build:places
  → places.json
  → pages:build
  → wrangler pages deploy
```

## Source of Truth
- Runtime SSOT for pages: `data/places.json`
- Authoring inputs: `candidates.naver.json` + `overrides.json`

## Commands
```bash
npm run dev             # local dev server → http://localhost:3000
npm run import:naver    # sanitize naver_raw.json → candidates.naver.json
npm run build:places    # generate places.json from candidates + overrides
npm run validate:places # validate generated places data
npm run build           # Next.js production build
npm run pages:build     # Cloudflare Pages build (runs build:places first)
```

### Deploy (manual)
```bash
# Full clean deploy
rm -rf .next && npm run pages:build && npx wrangler pages deploy .vercel/output/static --project-name gluten-free-korea

# After data-only change
npm run build:places && npm run pages:build && npx wrangler pages deploy .vercel/output/static --project-name gluten-free-korea
```

## Cloudflare Pages Configuration
- Project name: `gluten-free-korea`
- Build output: `.vercel/output/static`
- Config file: `wrangler.toml`
- Compatibility flag: `nodejs_compat` (required for next-on-pages)
- Env vars: managed via `wrangler.toml [vars]` (dashboard blocked for non-secrets)

## Environment Variables
| Variable | File | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `.env.local` + `wrangler.toml` | Metadata base URL |
| `SITE_URL` | `wrangler.toml` | sitemap.js runtime fallback |

## Language & Theme System
- **EN/KO toggle:** `lang-en` / `lang-ko` CSS classes on `<html>`; persisted to `localStorage["lang"]`
- **Dark mode:** `.dark` class on `<html>`; persisted to `localStorage["theme"]`
- InitScript in `layout.js` applies both before hydration to prevent flicker

## Build/Deploy Requirements
- No DB / API / client-side fetch for places
- Static-first: all pages must be statically renderable at build time
- Naver raw export must not be committed — gitignored

## Known Gaps (as of 2026-03-10)
- sitemap.xml URLs show `localhost:3000` — fix: `rm -rf .next` then full redeploy
- GitHub auto-deploy not connected (currently manual wrangler deploy)
- Grain Seoul, Sunny Bread: `addressEn` is district-level only
- No search/filter on homepage
- No image optimization (no `image` field used in cards yet)
