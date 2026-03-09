# Gluten-Free Korea (MVP)

Minimal MVP focused on content display.

## Routes

- `/` : unified places list
- `/place/[slug]` : place detail
- `/guide` : basic safety guide

## Tech

- Next.js App Router
- Tailwind CSS
- Cloudflare Pages build via `@cloudflare/next-on-pages`

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run pages:build
```

## Notes

- Data source: `data/restaurants.json`
- Keep `.env*` files out of git

## Cloudflare Pages (recommended)

- Build command: `npm run pages:build`
- Build output directory: `.vercel/output/static`

## Places data schema (`data/restaurants.json`)

### Required fields

- `slug` (unique, URL-safe string)
- `name`
- `type`

### Optional fields

- `location`
- `address`
- `note`
- `tags` (array of strings)
- `rating`
- `website`
- `naverMapUrl`
- `sources` (array of strings)
- `image`
- `photos` (array of strings)

### Example

```json
{
  "slug": "example-place",
  "name": "Example Place",
  "type": "Dining",
  "location": "Seoul",
  "note": "Always verify ingredients and cross-contamination on visit.",
  "tags": ["Dedicated GF"],
  "website": "https://example.com",
  "sources": ["User review (2026-03-09)"]
}
```
