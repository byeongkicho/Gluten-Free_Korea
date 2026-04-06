# DECISIONS.md

Append-only architecture decisions.
Rule: never edit old entries; add a new entry to supersede prior decisions.

## 2026-03-10 — Automation-first place publishing
- Status: accepted
- Decision: Introduce a generated runtime dataset (`data/places.json`) produced from candidate pool + selected SIDs + per-SID overrides.
- Rationale: Enables reliable automation while preserving static build and minimal runtime complexity.

## 2026-03-10 — No category routes in MVP
- Status: accepted
- Decision: Keep only `/`, `/guide`, `/place/[slug]`; do not introduce `/food`, `/dining`, `/shop` categories now.
- Rationale: Minimize routing complexity and avoid migration churn while content volume is small.

## 2026-03-10 — Never commit raw Naver export
- Status: accepted
- Decision: Raw export artifacts are ignored from git; only sanitized candidate fields are committed.
- Rationale: Reduce sensitive/noisy data in repository and keep deterministic, reviewable inputs.

## 2026-03-10 — select:sync publishes all candidates by default
- Status: accepted
- Decision: `scripts/sync_selected_sids.mjs` rewrites `selected_sids.txt` with every SID in `candidates.naver.json`. No manual cherry-picking step.
- Rationale: Curation happens upstream at the import stage (which candidates enter `candidates.naver.json`), not at the selection stage. Keeps the publish loop to 4 commands: `import:naver → select:sync → build:places → pages:build`.
- Consequence: to exclude a specific place, remove it from `candidates.naver.json` (or add an override) rather than editing `selected_sids.txt` by hand.

## 2026-03-10 — Dual data entry paths (Naver + manual)
- Status: accepted (manual path pending implementation)
- Decision: `places.json` will be merged from two sources: (1) Naver pipeline via `candidates.naver.json` + `selected_sids.txt`, (2) `data/manual.json` for non-Naver places (Instagram, blog-sourced, etc.). Manual entries require explicit `slug` field; no `sid` needed.
- Slug convention: Naver slugs → `{ascii-name}-{sid}` (ends in numeric). Manual slugs → plain words. Prevents collision by convention.
- Status note: `manual.json` path not yet implemented in `build_places.mjs`.

## 2026-03-10 — Remove selected_sids indirection
- Status: accepted
- Decision: `build_places.mjs` now iterates all deduped candidates directly and no longer reads `data/selected_sids.txt`.
- Supersedes: “select:sync publishes all candidates by default” for runtime behavior.
- Rationale: removes one file and one command from the operational loop while preserving overrides and dedupe.

## 2026-03-10 — Cloudflare Pages deployment via wrangler CLI
- Status: accepted
- Decision: Deploy using `npx wrangler pages deploy` with API token authentication. Project name: `gluten-free-korea`.
- Config: `wrangler.toml` at repo root manages compatibility flags and env vars.
- Rationale: SSH environment prevents browser-based OAuth login; API token with Cloudflare Pages:Edit permission works headlessly.

## 2026-03-10 — wrangler.toml manages env vars (not dashboard)
- Status: accepted
- Decision: All environment variables (`NEXT_PUBLIC_SITE_URL`, `SITE_URL`) are declared in `wrangler.toml [vars]`. Dashboard env var management is disabled when wrangler.toml is present.
- Consequence: Non-secret env vars must be committed to `wrangler.toml`; only secrets (encrypted) can be set via dashboard.

## 2026-03-10 — SITE_URL for sitemap runtime fallback
- Status: accepted
- Decision: `app/sitemap.js` uses `process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL` with hardcoded fallback `https://gluten-free-korea.pages.dev`.
- Rationale: `NEXT_PUBLIC_SITE_URL` is inlined at build time by Next.js; sitemap may run at runtime in Cloudflare Workers where build-time inlining is unavailable. `SITE_URL` (non-prefixed) is available at runtime via wrangler.toml vars.

## 2026-03-12 — Codex-executable improvement backlog in docs/TASKS.md
- Status: accepted
- Decision: Improvement tasks (P0–P3) and deployment automation are tracked in `docs/TASKS.md` using a Codex-executable format. Claude plans; Codex executes.
- Task scope: sitemap dates, Tailwind v4 cleanup, html lang, aria-labels, shared utils extraction, OG meta cleanup, canonical URLs, custom 404, security headers, GitHub Actions CI/CD.
- CI/CD target: GitHub Actions → `npm run pages:build` → `npx wrangler pages deploy` on push to main.
- Rationale: Separates planning (Claude) from implementation (Codex) to keep context clean and diffs reviewable.

## 2026-03-10 — Bilingual place data (nameEn, addressEn, location)
- Status: accepted
- Decision: All 11 places have `nameEn`, `addressEn`, and `location` (English) fields in `overrides.json`. Place detail pages show Korean + English address side by side for taxi use.
- Rationale: Target users are English-speaking tourists who need readable addresses for navigation.

## 2026-03-12 — Bilingual safety notes via note_ko
- Status: accepted
- Decision: Place overrides may include `note_ko` alongside English `note`, and `build_places.mjs` passes both through into `data/places.json`.
- Rationale: The UI now renders practical safety notes in both English and Korean without introducing a second runtime data source.

## 2026-03-26 — Image optimization pipeline (optimize-images.mjs)
- Status: accepted
- Decision: Original photos in `public/images/NoGlutenSeoul_Assets/{한국어폴더}/` are converted to webp via sharp (1200px full + 640px thumb) into `public/images/places/{slug}/`. Output dir is cleaned before each run.
- Rationale: Reduces 332MB originals to ~6MB; keeps static build; avoids external image services.

## 2026-03-26 — coverImage field in overrides
- Status: accepted
- Decision: `overrides.json` supports `"coverImage": "05.webp"` to select card thumbnail. `build_places.mjs` moves it to front of images array. Omit for default (01.webp).
- Rationale: Decouples thumbnail selection from file naming; no file renaming needed.

## 2026-03-26 — Manual-only place entries
- Status: accepted
- Supersedes: "Dual data entry paths" (manual.json path)
- Decision: Manual places use string SIDs (e.g., `manual_francois`) directly in `overrides.json`. `build_places.mjs` processes override-only entries not found in candidates.
- Rationale: Simpler than a separate `manual.json`; single file to manage all overrides.

## 2026-03-26 — Unified documentation in PROJECT.md
- Status: accepted
- Decision: `docs/PROJECT.md` is the sole comprehensive reference. `CLAUDE.md` and `AGENTS.md` point to it. Includes image system, pipeline commands, component specs, and known gaps.
- Rationale: Eliminates need for agents to scan multiple files on every session start.

## 2026-04-06 — LLM Wiki vault (NoGlutenKorea/)
- Status: accepted
- Decision: An Obsidian vault at `NoGlutenKorea/` serves as an LLM Wiki following Karpathy's pattern: raw sources → wiki markdown → schema (CLAUDE.md). Separate git repo.
- Rationale: Structured knowledge base for LLM-assisted site operation and gluten-free domain knowledge.

## 2026-04-06 — Place count correction (18 → 21)
- Status: accepted
- Supersedes: "All 11 places" count in 2026-03-10 bilingual entry
- Decision: `data/places.json` now contains 21 verified places. All 21 have at least 1 image. 4 places tagged Dedicated GF (sisemdal-atelier, 237-pizza, cafe-rebirths, monil2-house).
- Rationale: Documentation audit found PROJECT.md stated 18, actual data has 21. Previous "5 places without photos" gap is resolved.
