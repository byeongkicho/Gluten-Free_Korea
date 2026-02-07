# Cloudflare Pages Deploy Checklist (Next.js)

## Goal

Deploy this Next.js site to Cloudflare Pages cheaply and repeatably.

## Repo requirements

- No secrets committed.
- Build artifacts not committed (`.next/`, `out/`).

## Cloudflare Pages settings

- Framework preset: Next.js (if available)
- Build command: `npm run build`
- Output directory:
  - If using Next.js SSR/Edge: follow Cloudflare Pages Next integration (no static output dir)
  - If exporting static site: `out` (requires `next export` or `output: 'export'`)

Notes:
- This repo appears to use App Router + dynamic routes. Default assumption: SSR/Edge compatible deployment.

## Environment variables (placeholders)

If Supabase is enabled later, set in Cloudflare dashboard (do not commit):

- `NEXT_PUBLIC_SUPABASE_URL=YOUR_VALUE_HERE`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_VALUE_HERE`

## Monetization (placeholders)

- AdSense: add verification/ads script later (no keys committed)
- Coupang Partners: links should include `rel="nofollow sponsored"` and clear disclosure.

## Verify (local)

Commands (run locally):

- `npm ci`
- `npm run lint`
- `npm run build`
- `npm run dev`

Functional checks:

- Home loads
- `/food`, `/shop`, `/dining` load
- Deep-link refresh works for `/food/<slug>` and `/shop/<slug>`
- Images load
- No runtime errors when Supabase env vars are missing (should fall back to local JSON)
