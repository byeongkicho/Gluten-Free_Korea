# RUNBOOK.md

## Daily Publishing Flow
1. Save latest Naver export JSON to `data/naver_raw.json` (local only, gitignored).
2. Regenerate publish data: `npm run publish:local`.
3. Add per-`sid` content overrides in `data/overrides.json` if needed, then rerun `npm run publish:local`.
4. Verify deploy build: `npm run pages:build`.
5. Commit and push.

## Fast Pre-Deploy Command
```bash
npm run publish:local && npm run pages:build
```

## Guardrails
- Treat `data/places.json` as generated output.
- Keep routes unchanged unless a dedicated planning PR says otherwise.
