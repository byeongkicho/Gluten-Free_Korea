# AGENTS.md — Gluten-Free Korea (Codex)

## Read First
1. `CLAUDE.md` — 공유 규칙 (반드시 먼저 읽을 것)
2. `docs/PROJECT.md` — SSOT
3. `docs/HARNESS.md` — 3-agent 루프 + subagent 가드레일
4. `docs/TASKS.md` — 작업 백로그 + 실행 순서
5. `docs/DECISIONS.md` — 아키텍처 결정 (append-only)

## Codex 전용 규칙
- `docs/TASKS.md`의 미완료 작업을 실행 순서대로 처리.
- 각 태스크의 Pre-flight → 실행 → Done-when → Evaluator 체크 순서 준수.
- 1 commit = 1 task. 배치 커밋 금지.
- Pre-flight 실패 → 전체 중단. 다음 태스크 진행 금지.
- Done-when / Evaluator 체크 실패 → 중단 후 보고. 커밋하지 말 것.
- TASKS.md에서 `[x]` 표시된 태스크는 건너뛸 것.
- `CLAUDE.md`의 Forbidden / Known Pitfalls / Error Recovery 모두 동일 적용.
