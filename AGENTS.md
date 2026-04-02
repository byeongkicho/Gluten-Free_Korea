# AGENTS.md — Gluten-Free Korea (Codex)

## Read First
1. `CLAUDE.md` — 공유 규칙 (반드시 먼저 읽을 것)
2. `docs/PROJECT.md` — SSOT
3. `docs/DECISIONS.md` — 아키텍처 결정 (append-only)

## Codex 전용 규칙
- `docs/CODEX_RUN.md`의 실행 순서를 정확히 따를 것.
- 1 commit = 1 task. 배치 커밋 금지.
- Pre-flight 실패 → 전체 중단. 다음 태스크 진행 금지.
- Post-flight 실패 → 중단 후 보고. 커밋하지 말 것.
- TASKS.md에서 `[x]` 표시된 태스크는 건너뛸 것.
- `CLAUDE.md`의 Forbidden / Known Pitfalls / Error Recovery 모두 동일 적용.
