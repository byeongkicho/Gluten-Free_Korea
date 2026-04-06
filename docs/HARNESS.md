# HARNESS.md — 3-Agent 하네스 아키텍처

> 이 프로젝트의 모든 비자명한 작업은 3단계 루프를 거칩니다.
> 결과물이 아닌, 결과물을 만드는 장치입니다.
>
> **작업 백로그:** `docs/TASKS.md` — 각 태스크에 Pre-flight, Done-when, Evaluator 체크 포함

## 3-Agent 루프

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Planner │ ──▶ │Generator│ ──▶ │Evaluator│
│ (what)  │     │ (how)   │     │ (so?)   │
└─────────┘     └─────────┘     └────┬────┘
      ▲                              │
      └──────── reject ──────────────┘
```

- **통과:** Evaluator 승인 → 커밋
- **거부:** Evaluator가 구체적 사유와 함께 Planner로 반환 → 재계획

---

## Agent 1: Planner

**역할:** 무엇을, 왜, 어떤 순서로 할지 결정.

**입력:** 사용자 요청 + HANDOFF.md + 현재 코드 상태
**출력:** 구조화된 실행 계획 (아래 포맷)

```markdown
## Plan: {제목}
- **목표:** (1문장)
- **변경 파일:** (최대 4개)
- **접근법:** (구체적 단계, 번호 매기기)
- **위험:** (실패할 수 있는 것)
- **검증:** (완료 조건)
```

**규칙:**
- 코드를 직접 작성하지 않음
- 파일 4개 초과 변경이 필요하면 작업을 분할
- docs/PROJECT.md (SSOT) 기반으로 판단
- 불확실하면 탐색(Phase 1)부터 시작

**Claude Code에서 호출:**
```
Agent(subagent_type="Plan", prompt="...")
```

---

## Agent 2: Generator

**역할:** Planner의 계획을 코드로 구현.

**입력:** Planner의 실행 계획
**출력:** 코드 변경 + 빌드/검증 결과

**규칙:**
- 계획에 명시된 파일만 수정 (최대 4개)
- 파일당 1000줄 이하만 읽기/수정
- 계획에 없는 "보너스 개선" 금지
- 완료 후 반드시 검증 명령 실행 (`npm run build`, `npm run validate:places`)

**Claude Code에서 호출:**
- 소규모: 직접 Edit/Write 도구 사용
- 대규모: `Agent(isolation="worktree", prompt="...")` 또는 Codex

---

## Agent 3: Evaluator (회의적 평가자)

**역할:** Generator의 결과물을 비판적으로 검토.

**입력:** Generator의 변경사항 (diff) + 원래 계획
**출력:** PASS / REJECT + 상세 사유

**평가 체크리스트:**
1. **계획 준수:** 계획에 명시된 것만 변경했는가?
2. **최소 변경:** 불필요한 추가/삭제가 없는가?
3. **빌드 통과:** `npm run build` 성공하는가?
4. **SSOT 일관성:** docs/PROJECT.md와 모순되지 않는가?
5. **Edge case:** 빈 데이터, 한국어/영어 전환, 다크모드에서 깨지지 않는가?
6. **보안:** OWASP Top 10 위반 없는가?
7. **Cloudflare 호환:** Node.js server API (fs, path) 사용하지 않았는가?

**회의적 튜닝:**
- 기본 태도: "이 변경은 문제가 있을 것이다"
- 통과 기준: 7개 체크리스트 전부 PASS일 때만 승인
- 부분 통과 없음. 하나라도 실패하면 REJECT.
- REJECT 시 반드시 구체적 파일:라인 + 이유 명시

**Claude Code에서 호출:**
```
Agent(prompt="다음 diff를 Evaluator로서 검토해주세요. 회의적으로 평가하고,
7개 체크리스트 각각에 PASS/FAIL 판정을 내려주세요.
하나라도 FAIL이면 전체 REJECT + 구체적 사유를 보고하세요.
[diff 내용]
[원래 계획]")
```

---

## 5-Phase 워크플로우

| Phase | 목적 | 행동 | 산출물 |
|-------|------|------|--------|
| 1. 탐색 | 컨텍스트 채우기 | "고려할 것이 뭘까?" | 현황 분석 |
| 2. 계획 | SSOT + 실행 계획 | Planner agent | Plan 문서 |
| 3. 실행 | 코드 구현 | Generator agent | 코드 변경 |
| 4. 평가 | 비판적 리뷰 | Evaluator agent | PASS/REJECT |
| 5. 기록 | Handoff + 결정 | HANDOFF.md, DECISIONS.md 업데이트 | 컨텍스트 보존 |

---

## 세션 프로토콜

### 세션 시작
1. `docs/HANDOFF.md` 읽기
2. 미완료 작업 확인
3. 현재 브랜치 + `git status` 확인

### 세션 중
- 컨텍스트 70% 이상 차면 → HANDOFF.md 업데이트 후 새 세션 권장
- 작업 완료마다 → HANDOFF.md "완료된 작업" 행 추가

### 세션 종료
1. HANDOFF.md 업데이트 (필수)
2. 미커밋 변경 있으면 → 사용자에게 알림
3. 다음 작업 우선순위 기록

---

## Subagent 가드레일

| 제한 | 값 | 이유 |
|------|---|------|
| 변경 파일 수 | ≤ 4개/agent | 컨텍스트 폭주 방지 |
| 파일 읽기 크기 | ≤ 1000줄/파일 | offset/limit으로 필요한 부분만 |
| 병렬 agent | ≤ 3개 동시 | 파일 충돌 방지 |
| 같은 파일 동시 수정 | 금지 | merge conflict 방지 |
| worktree 사용 | 대규모 변경 시 필수 | 메인 작업 영역 보호 |

## 에스컬레이션

- 같은 접근법 3회 실패 → 대안 시도
- 총 5회 실패 → 중단 후 Ki에게 보고
- 보안/비가역적/비용 발생 → Ki 승인 필수
