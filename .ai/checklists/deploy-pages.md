# Cloudflare Pages Deploy Checklist (Next.js)

## Goal

Deploy this Next.js site to Cloudflare Pages cheaply and repeatably.

## Repo requirements

- No secrets committed.
- Build artifacts not committed (`.next/`, `out/`).

## Recommended approach (fastest for Next.js on Pages)

Use Cloudflare's Next.js adapter during the build.

- Add dev dependency: `@cloudflare/next-on-pages`
- Build command (Cloudflare Pages):

```bash
npm run build && npx @cloudflare/next-on-pages
```

Notes:
- This produces a `.vercel/output`-style bundle that Cloudflare Pages can run.
- Do not commit generated output.

## Cloudflare Pages settings

- Framework preset: Next.js
- Build command: `npm run build && npx @cloudflare/next-on-pages`
- Build output directory: `.vercel/output/static`

## Environment variables (placeholders)

If Supabase is enabled later, set in Cloudflare dashboard (do not commit):

- `NEXT_PUBLIC_SUPABASE_URL=YOUR_VALUE_HERE`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_VALUE_HERE`

## Monetization (placeholders)

- AdSense: add verification/ads script later (no keys committed)
- Coupang Partners: links should include `rel=\"nofollow sponsored\"` and clear disclosure.

## Verify (local)

Commands (run locally):

- `npm ci`
- `npm run lint`
- `npm run build`
- `npm run dev`

Functional checks:

- Home loads
- `/food`, `/shop`, `/dining` load
- Deep-link refresh works for `/food/<slug>`, `/dining/<slug>`, `/shop/<slug>`
- Images load
- No runtime errors when Supabase env vars are missing (should fall back to local JSON)
