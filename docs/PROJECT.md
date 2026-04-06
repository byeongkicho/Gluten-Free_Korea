# PROJECT.md (SSOT)

> Single Source of Truth for the Gluten-Free Korea project.
> Last updated: 2026-04-06

## Project
- Name: Gluten-Free Korea (No Gluten Korea)
- Stack: Next.js 15 App Router, React 19, Tailwind CSS 4
- Deployment: Cloudflare Pages via `@cloudflare/next-on-pages`
- **Live URL:** https://noglutenkorea.com
- **Instagram:** https://www.instagram.com/noglutenkorea/
- **Contact:** contact@noglutenkorea.com (CF Email Routing)
- **Places:** 21 verified locations

## Routes
- `/` — Home: place directory with search, district/type filters, nearby sorting (geolocation), radius filter
- `/guide` — Static gluten-free safety guide
- `/place/[slug]` — Place detail with images, gallery, notes, tips, maps

## Architecture Principles
- **Static-first:** all pages statically rendered at build time
- **No DB / no API fetch:** `data/places.json` is the sole runtime data source
- **Cloudflare Pages free tier:** no external servers
- **Bilingual:** EN/KO toggle (`lang-en`/`lang-ko` CSS classes)
- **Dark mode:** `.dark` class on `<html>`, persisted to localStorage

---

## Data Pipeline

### Sources
| File | Purpose |
|---|---|
| `data/naver_raw.json` | Raw Naver export (gitignored, never commit) |
| `data/candidates.naver.json` | Sanitized candidates |
| `data/overrides.json` | Per-SID overrides + manual-only entries |
| `data/places.json` | **Generated output** (do not edit manually) |

### Override-only entries
Places not in Naver (e.g., `manual_francois`) use string SIDs in `overrides.json`.
`build_places.mjs` processes these as standalone entries.

### coverImage field
Set `"coverImage": "03.webp"` in overrides to pick which optimized image becomes the card thumbnail.
`build_places.mjs` moves it to the front of the `images` array. Omit to default to `01.webp`.

### Pipeline commands
```bash
# Full pipeline
npm run import:naver        # naver_raw.json → candidates.naver.json
npm run optimize:images     # original photos → webp (places/ dir)
npm run build:places        # candidates + overrides + image scan → places.json
npm run pages:build         # Next.js build for CF Pages
npx wrangler pages deploy .vercel/output/static --project-name noglutenkorea

# After data-only change (no new photos)
npm run build:places && npm run pages:build && npx wrangler pages deploy .vercel/output/static --project-name noglutenkorea

# After photo change
npm run optimize:images && npm run build:places && npm run pages:build && npx wrangler pages deploy .vercel/output/static --project-name noglutenkorea
```

---

## Image System

### Directory structure
```
public/images/
  NoGlutenSeoul_Assets/     ← ORIGINALS (edit here)
    237피자/
      IMG_7043.JPG
      IMG_8950.JPEG
    카페 리벌스/
      IMG_9330.JPEG
    ...
  places/                   ← GENERATED (do not edit)
    237-pizza/
      01.webp               ← full (1200px max)
      thumb_01.webp          ← thumbnail (640px max)
      02.webp
      thumb_02.webp
    ...
```

### Folder name → slug mapping (optimize-images.mjs)
```
237피자       → 237-pizza
6일닭강정      → 6day-chicken
GrainSeoul   → grain-seoul
글루닉        → glunic
다크앤라이트    → dark-and-light
뚜쥬르        → toujours-dolgama-village
모닐이네       → monil2-house
미니마이즈      → minimize-itaewon
써니하우스      → sunny-bread
지화자        → jihwaja
카페 리벌스     → cafe-rebirths
카페 페퍼      → cafe-pepper
쿠촐로        → cucciolo-seoul
프랑스와       → francois
```

### Photo workflow
1. Add/delete/rotate photos in `NoGlutenSeoul_Assets/{한국어폴더}/`
   - macOS Preview: `⌘+R` (rotate CW), `⌘+L` (rotate CCW)
2. Run `npm run optimize:images` — converts to webp, cleans stale output
3. Run `npm run build:places` — scans `places/` dir, updates places.json
4. To change thumbnail: set `"coverImage": "02.webp"` in overrides.json

### Optimization specs
- Full: max 1200px width, webp quality 80
- Thumbnail: max 640px width, webp quality 80
- Typical reduction: 94% (332MB originals → ~6MB webp)

### Future (Phase 2, when 50+ places)
- Cloudflare R2 for image storage
- CF Image Resizing (on-the-fly)
- `next/image` with `srcset` for device-optimal delivery

---

## Frontend Components

### PlaceCard (home)
- Image: `aspect-[16/9]`, `object-cover`, hover zoom `scale-[1.02]` duration-500
- No image: gradient + emoji fallback
- Dedicated GF badge overlays on both

### Place detail page
- Hero: `aspect-[16/9]`, full width, rounded-2xl
- Gallery: max 5 images, 3-col square grid, "+N" overlay if more
- Tips section: auto-generated from tags (Dedicated GF, Pizza, Italian, etc.)

### Footer
- "GET IN TOUCH / 연락하기" heading
- SVG icons: ✉️ contact@noglutenkorea.com + 📸 @noglutenkorea
- Hover effects, Coupang Partners disclosure

---

## npm Scripts
```bash
npm run dev               # local dev → http://localhost:3000
npm run import:naver      # sanitize naver_raw.json → candidates
npm run optimize:images   # originals → webp (places/ dir)
npm run build:places      # generate places.json
npm run validate:places   # validate places data
npm run build             # Next.js production build
npm run pages:build       # CF Pages build (runs build:places first)
```

## Cloudflare Configuration
- Project: `noglutenkorea`
- Build output: `.vercel/output/static`
- Config: `wrangler.toml`
- Compatibility: `nodejs_compat`
- Email: CF Email Routing → contact@noglutenkorea.com
- Domain: noglutenkorea.com (custom domain on CF Pages)

## Environment Variables
| Variable | File | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `.env.local` + `wrangler.toml` | Metadata base URL |
| `SITE_URL` | `wrangler.toml` | sitemap.js runtime fallback |

---

## Known Gaps
- No GitHub Actions CI/CD (manual wrangler deploy)
- No map view
- No favorites/share flow
- 10 places with only 1 photo (los-dias-cafe, sisemdal-atelier, ang-bear-bake, jihwaja, ssal-tongdak, minimize-itaewon, glunic, toujours, cafe-pepper, sunny-bread)
- Grain Seoul, Sunny Bread: `addressEn` missing (empty string)
- "+N" gallery doesn't expand yet (future: lightbox)
- Instagram automation not implemented (Graph API requires business account)
