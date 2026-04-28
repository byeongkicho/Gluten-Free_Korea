# Contributing

Thanks for your interest. This is a personal project that I started for my wife and grew into a public directory for the gluten-free community in Korea. Issues, corrections, and suggestions are warmly welcome.

## What you can contribute

### 1. New restaurants / cafes / bakeries
The fastest path: open a [GitHub Issue](https://github.com/byeongkicho/Gluten-Free_Korea/issues) with the **"new place"** template:

- Place name (Korean + English if possible)
- Naver Place URL or address
- GF level (dedicated, friendly, or has options)
- Any notes (verified visit? menu items? cross-contamination disclosure?)

I curate every entry. Submissions are not auto-merged.

### 2. Corrections to existing entries
- Place closed permanently
- Menu changed (no longer has GF options)
- GF-level inaccurate
- Address / phone number outdated

Open an issue with the place name and what's wrong.

### 3. Code / build / SEO improvements
- Bug fixes — PRs welcome directly
- Performance / accessibility — open an issue first to align on scope
- Architectural changes — discussion first

## Code style

- TypeScript / Next.js 15 conventions (App Router)
- 2-space indent
- `npm run lint` should pass
- Keep `data/places.json` as the single source of runtime truth — don't introduce databases
- Cloudflare Pages compatibility: avoid Node-only APIs in routes that run on edge

## Local setup

See [README.md](README.md) for tech stack and build instructions.

## Disclosure

This project is built with substantial AI pair-programming (primarily Claude Code, with Codex for some specific subtasks). Architectural decisions and final responsibility belong to the human author. The Eval-Driven Development test suite is the artifact of that disclosure: AI-assisted, but every change passes deterministic verification.
