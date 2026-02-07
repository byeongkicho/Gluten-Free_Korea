# Spec 001 — MVP Ship (Gluten-Free Korea)

You are a spec writer; do not write code.

## Goals

- Ship a usable public MVP quickly on Cloudflare Pages.
- Provide immediate value: dining directory, food guide, shop essentials.
- Ensure the site works without any external services (Supabase optional).

## Non-goals

- No full CMS/admin panel.
- No user accounts.
- No complex map search (later).

## Acceptance Criteria (testable)

- Home loads and clearly routes users to Food / Dining / Shop.
- `/food`, `/dining`, `/shop` pages load with meaningful content from local JSON.
- Detail pages work via deep link refresh for `/food/<slug>`, `/dining/<slug>`, `/shop/<slug>`.
- Build passes with no required env vars.
- Basic SEO: page titles + descriptions for top routes.

## Scope

- In scope:
  - `data/*.json` as the initial content store
  - `app/*` pages that present content
  - Cloudflare Pages deploy setup/documentation
- Out of scope:
  - Supabase schema + data migration
  - AdSense live integration (placeholders only)

## Risks / Unknowns

- Next.js on Cloudflare Pages requires the correct adapter/integration.
- Content quality (real reviews/photos) is the long-term differentiator.

## Work breakdown (2–5 small steps)

1) Make all routes buildable without Supabase and ensure local JSON fallback works everywhere.
2) Add Cloudflare Pages deployment recipe (adapter + settings) and document env vars as placeholders.
3) Add MVP content templates for restaurant/product/review entries.
4) Add minimal SEO improvements (metadata, robots/sitemap basics).

## Verification plan (commands only; do not run)

- `npm ci`
- `npm run lint`
- `npm run build`
- `npm run dev`
