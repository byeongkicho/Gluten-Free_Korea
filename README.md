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
npm run build
npm run pages:build
```

## Notes

- Data source: `data/restaurants.json`
- Keep `.env*` files out of git
