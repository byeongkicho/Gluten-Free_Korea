# RUNBOOK.md

## Daily Publishing Flow
1. Update `data/candidates.naver.json` with sanitized candidates.
2. Add/remove `sid` lines in `data/selected_sids.txt`.
3. Add per-`sid` content overrides in `data/overrides.json`.
4. Generate output: `npm run build:places`.
5. Validate output: `npm run validate:places`.
6. Verify deploy build: `npm run pages:build`.
7. Commit and push.

## Fast Pre-Deploy Command
```bash
npm run build:places && npm run validate:places && npm run pages:build
```

## Guardrails
- If `selected_sids.txt` is empty, build should still pass.
- Treat `data/places.json` as generated output.
- Keep routes unchanged unless a dedicated planning PR says otherwise.
