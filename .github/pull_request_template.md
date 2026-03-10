## Summary
- What changed:
- Why:

## Scope
- [ ] Follows `docs/PROJECT.md` (SSOT)
- [ ] If architecture changed, appended decision in `docs/DECISIONS.md`

## Data / Pipeline
- [ ] Runtime data source remains `data/places.json`
- [ ] Did not manually edit generated `data/places.json`
- [ ] Did not commit raw Naver export JSON

## Constraints
- [ ] No new dependencies added
- [ ] Minimal diff / PR-sized changes
- [ ] No route changes unless explicitly planned

## Verification
- [ ] `npm run build:places`
- [ ] `npm run validate:places`
- [ ] `npm run build`
- [ ] `npm run pages:build`

## Risk / Rollback
- Risk:
- Rollback plan:
