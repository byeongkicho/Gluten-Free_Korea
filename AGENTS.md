# AGENTS.md — Gluten-Free Korea (Codex)

## Read First
1. `CLAUDE.md` — 공유 규칙 (반드시 먼저 읽을 것)
2. `docs/PROJECT.md` — SSOT
3. `docs/HARNESS.md` — 3-agent 루프 + subagent 가드레일
4. `docs/HANDOFF.md` — 현재 진행 상태 + 다음 작업
5. `docs/DECISIONS.md` — 아키텍처 결정 (append-only)

## Codex 전용 규칙
- 작업 지시는 `docs/HANDOFF.md`의 "다음 세션 시작점"에서 받는다.
  (구 백로그 파일 방식은 2026-07-24 폐기 — `docs/archive/TASKS.md`, DECISIONS.md 참조)
- 각 태스크의 Pre-flight → 실행 → Done-when → Evaluator 체크 순서 준수.
- 1 commit = 1 task. 배치 커밋 금지.
- Pre-flight 실패 → 전체 중단. 다음 태스크 진행 금지.
- Done-when / Evaluator 체크 실패 → 중단 후 보고. 커밋하지 말 것.
- `CLAUDE.md`의 Forbidden / Known Pitfalls / Error Recovery 모두 동일 적용.
