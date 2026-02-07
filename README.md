# Gluten-Free Korea

A practical guide for people with celiac disease or gluten sensitivity living in Korea or visiting Korea.

## What this site is

- Dining directory: gluten-free friendly restaurants/cafes (with notes and safety caveats)
- Food guide: ingredient safety + practical tips
- Shop essentials: recommended gluten-free products (affiliate disclosure)

## Tech

- Next.js (App Router)
- Tailwind CSS
- Optional Supabase (falls back to local JSON when env vars are not set)

## Local development

```bash
npm ci
npm run dev
```

## Build

```bash
npm run lint
npm run build
```

## Deployment (Cloudflare Pages)

See `.ai/checklists/deploy-pages.md`.

## Environment variables (optional)

If you choose to enable Supabase, set these in the hosting dashboard (do not commit):

- `NEXT_PUBLIC_SUPABASE_URL=YOUR_VALUE_HERE`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_VALUE_HERE`

## Affiliate disclosure

Some links may be affiliate links. If you purchase through them, we may earn a commission at no extra cost to you.
