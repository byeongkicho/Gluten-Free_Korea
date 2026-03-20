# RELEASE_CHECKLIST.md

Quick pre-deploy checks for Gluten-Free Korea.

## Data
- [ ] `npm run validate:places`
- [ ] `data/places.json` diff looks intentional

## Core UX
- [ ] Homepage loads without hydration/build errors
- [ ] Search filter works
- [ ] District filter works
- [ ] Type filter works
- [ ] Nearby flow checked:
  - [ ] Recommended mode works
  - [ ] Location allow → nearest sorting works
  - [ ] Location deny → recovery message appears

## Detail Pages
- [ ] At least one `/place/[slug]` page opens correctly
- [ ] Copy buttons work for place name / Korean address / English address
- [ ] External links open correctly

## SEO / Static Output
- [ ] `npm run build`
- [ ] `/sitemap.xml` builds
- [ ] canonical metadata still present on `/`, `/guide`, `/place/[slug]`
- [ ] custom 404 page still renders

## Deploy Notes
- Full clean redeploy when sitemap/base URL looks stale:
  - `rm -rf .next && npm run pages:build && npx wrangler pages deploy .vercel/output/static --project-name gluten-free-korea`
