# .ai

Operating rules for working in this repository with an AI agent.

## Scope limitation

- Work only inside this repository.
- Prefer minimal, safe changes. Avoid large refactors.

## No secrets

- Never add secrets/keys/tokens to the repo.
- If configuration is needed, use placeholders (e.g. `YOUR_VALUE_HERE`) and document required environment variables.

## Command approval gate

- Before running any shell command, propose the exact command(s) and why.
- Wait for explicit approval.

## Small commits

- Keep each change set small and easy to review.
- Prefer one intent per commit.

## Review-only mode

- When asked to "review", act as a reviewer only: identify issues and propose minimal diffs.
- Do not implement big rewrites during review.

## Basic verification gate

Before considering a change "done", propose verification commands (do not run without approval):

- Install: `npm ci` (if `package-lock.json` exists)
- Lint: `npm run lint` (if present)
- Build: `npm run build`
- Dev: `npm run dev` (manual check)

## Deployment safety

- Prefer deploy targets with free/low-cost tiers.
- Do not commit build artifacts (`.next/`, `out/`).
- Keep environment variables in the hosting dashboard, not in git.
