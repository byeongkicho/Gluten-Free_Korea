# OPERATING_MODEL.md (SUPERSEDED)

> **⚠️ 이 문서는 `docs/HARNESS.md`로 대체되었습니다. 새 작업은 HARNESS.md를 참조하세요.**

## Purpose
Lock a simple operating model: plan with Claude, implement with Codex, and keep one factual source of truth.

## Role Split
- Claude: planning only (`what/why/order/acceptance criteria/risk`).
- Codex: implementation only (file edits, scripts, build fixes, verification).

## Document Roles
- SSOT facts: `docs/PROJECT.md`
- Decision lock (append-only): `docs/DECISIONS.md`
- Tool wrappers: `CLAUDE.md`, `AGENTS.md`

## Pipeline Model
- Local raw input (gitignored): `data/naver_raw.json`
- Candidate pool: `data/candidates.naver.json`
- Editorial overrides: `data/overrides.json`
- Generated runtime output: `data/places.json`

Flow: `naver_raw -> import_naver -> candidates -> overrides -> build_places -> places.json`

## Rules
- Runtime must read only `data/places.json`.
- Do not manually edit `data/places.json`.
- Do not commit raw Naver export files.
- Prefer smallest diff per PR.
