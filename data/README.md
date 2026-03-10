# data/ directory guide

## `naver_raw.json`
- Local Naver export snapshot used as import source.
- Not committed to git (`.gitignore`).
- Regenerate candidates with `npm run import:naver`.

## `candidates.naver.json`
- Sanitized candidate pool from Naver export.
- Keep only: `sid`, `name`, `address`, `mcid`, `mcidName`, `px`, `py`, `memo`, `useTime`, `lastUpdateTime`.
- This file is overwritten by `scripts/import_naver.mjs`.
- This is an input file for `scripts/build_places.mjs`.

## `overrides.json`
- Manual curation map: `sid -> overrides object`.
- Use this to override fields like `note`, `tags`, `website`, `sources`.
- Override values win over candidate-derived defaults.

## `places.json`
- Generated publish-ready output used by runtime pages.
- Top-level array only.
- Do not edit manually; regenerate with `npm run build:places`.

## `restaurants.json`
- Legacy dataset from earlier MVP flow.
- Current runtime and pipeline do not use this file.
- Kept temporarily for migration/back-reference.
