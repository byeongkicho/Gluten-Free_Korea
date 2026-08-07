# Gluten-Free Korea

> Gluten-free restaurants, cafés, and bakeries in Korea — plus the label-reading
> knowledge you need to shop here.
> **Live:** [noglutenkorea.com](https://noglutenkorea.com) · **Instagram:** [@noglutenkorea](https://instagram.com/noglutenkorea)

A static Next.js site, but the part worth reading is how it is operated: the
agent rules are files in this repository, and CI checks that those files still
describe reality.

## How this repo is run

Every non-trivial change goes through a Planner → Generator → Evaluator loop
(`docs/HARNESS.md`), and the rules those agents follow live in version control
next to the code they govern.

| File | Runtime | Role |
|---|---|---|
| `CLAUDE.md` | Claude Code | Coding rules, forbidden operations, known pitfalls, error recovery |
| `AGENTS.md` | Codex | Imports CLAUDE.md, adds one-commit-per-task execution rules |
| `docs/HARNESS.md` | both | The 3-agent loop and subagent guardrails |
| `docs/DECISIONS.md` | — | Append-only architecture decisions; superseding, never editing |
| `docs/HANDOFF.md` | — | Session state — where work stopped and what is next |
| `prompts/*.md` | scripts | Prompts as reviewable files, not string literals |

Four things hold it together:

| | |
|---|---|
| **Constrain** | Forbidden section, subagent limits (≤4 files, ≤1000 lines, ≤3 parallel), human approval for irreversible work |
| **Inform** | `docs/PROJECT.md` as SSOT, `docs/RUNBOOK.md` for operations, decisions recorded with their rationale |
| **Verify** | The eval suite below, build-time schema guards, dual LLM judges before publishing |
| **Correct** | Error-recovery rules (3 failures → change approach, 5 → stop and report), decisions that supersede rather than overwrite |

Earlier generations of this harness are kept under `docs/archive/` rather than
deleted, so the reasoning behind each change stays readable.

## Verification

```bash
bash eval/eval-runner.sh                    # the whole suite
bash eval/check-regression.sh --threshold 5.0
npm run check:harness refs                  # one check on its own
```

Seven tasks run on every push to `main` and on pull requests
(`.github/workflows/eval.yml`), gated on the paths that can affect them —
including `prompts/**` and `CLAUDE.md`, so a prompt change is a tested change.

| Task | What it protects |
|---|---|
| `data-001` | Required fields, slug uniqueness, place-count regressions |
| `build-001` | The `build:places → validate:places → build` chain |
| `img-001` | Every referenced Cloudinary id actually resolves |
| `cdn-001` | The URL builder honours all presets and rejects unknown ones |
| `deploy-001` | Production responds and serves the expected content |
| `review-001` | Edge-runtime compatibility, security headers, canonical metadata |
| `harness-001` | **The rule documents still describe this repository** |

That last one is the unusual one. It verifies that paths cited in `CLAUDE.md`,
`AGENTS.md`, `docs/HARNESS.md`, and this README exist, that every `npm run`
they instruct an agent to use is defined, that the baseline is not older than
the harness it grades, that `eval/README.md` matches the actual suite, and that
files marked un-committable are in fact untracked.

The failure it prevents is quiet: when a rule document cites a path that has
moved, an agent reading it skips the instruction. The build stays green, the
deploy succeeds, and the rule silently stops existing. It found three such
defects the first time it ran.

## Publishing gate

Blog posts are graded by two independent LLM judges — one for search
performance and E-E-A-T, one for factual accuracy and reader safety — and
publish only at **9.5/10 on both** with no blocking finding. Readers here
include people with celiac disease, for whom a wrong claim about food is a
health event.

```bash
npm run judge -- <slug> --dry-run   # render prompt and schema, no API key
npm run judge -- --all              # judge every published post
```

The judges never see each other's output; that is two API calls, not a promise
inside a prompt. The model returns integer points per criterion and never a
total — the score, the threshold, and the pass/fail are computed in JS, because
a model asked for "a score out of 10" picks the number first and reasons
backwards. Each run records the article's SHA-256 and the rubric version, so
editing a post after it was judged breaks the hash and fails CI. See
[`prompts/README.md`](prompts/README.md) and
[`eval/judgments/PROVENANCE.md`](eval/judgments/PROVENANCE.md) — the latter
separates reproducible scores from ones that only exist in session notes, and
refuses to blend them.

## Stack

Next.js 15 App Router · React 19 · Tailwind CSS 4 · Cloudflare Pages via
`@cloudflare/next-on-pages` · Cloudinary for images. Static-first:
`data/places.json` is the only runtime data source, and it is generated.

LLM calls appear in exactly two places in the content pipeline — caption
drafting and note enrichment — plus the judges above. Collection, merging,
validation, and deployment are deterministic on purpose: a hallucination in the
data path is much more expensive than one in a caption draft.

## Quick start

```bash
npm install
npm run dev                     # http://localhost:3000
npm run build && npm run validate:places   # required before any commit
```

## Data pipeline

```
data/naver_raw.json (gitignored)
  → npm run import:naver
    → data/candidates.naver.json
      + data/overrides.json (manual)
        → npm run build:places
          → data/places.json  (generated — never edit by hand)
```

Images follow the same shape: originals live outside the generated tree,
`npm run optimize:images` produces `.webp`, and `npm run upload:cloudinary`
publishes them. Only `.webp` is uploaded, so only `.webp` is scanned.

```bash
npm run publish:local           # import → build → validate
npm run pages:build             # build for Cloudflare Pages
```

Pushing to `main` deploys (`.github/workflows/deploy.yml`).

## Routes

| Route | |
|---|---|
| `/` | Home — latest posts and featured places |
| `/places` | Directory with search, filters, map |
| `/place/[slug]` | Place detail |
| `/blog/[slug]` | Posts |
| `/guide` | Gluten-free safety guide |

## Docs

| | |
|---|---|
| [`docs/PROJECT.md`](docs/PROJECT.md) | Architecture, routes, data pipeline (SSOT) |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Why things are the way they are (append-only) |
| [`docs/HARNESS.md`](docs/HARNESS.md) | The 3-agent loop |
| [`docs/RUNBOOK.md`](docs/RUNBOOK.md) | Operating procedures |
| [`eval/README.md`](eval/README.md) | Eval suite |
| [`prompts/README.md`](prompts/README.md) | Prompt and rubric contracts |
