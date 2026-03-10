# OPERATING_MODEL.md

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
- Candidate pool: `data/candidates.naver.json`
- Publishing selection: `data/selected_sids.txt`
- Editorial overrides: `data/overrides.json`
- Generated runtime output: `data/places.json`

Flow: `candidates -> selected_sids -> overrides -> build_places -> places.json`

## Rules
- Runtime must read only `data/places.json`.
- Do not manually edit `data/places.json`.
- Do not commit raw Naver export files.
- Prefer smallest diff per PR.
