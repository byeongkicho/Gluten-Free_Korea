# TASKS.md — 작업 백로그 (HARNESS 체계)

> 모든 작업은 `docs/HARNESS.md`의 3-agent 루프를 따릅니다.
> Planner → Generator → Evaluator → 커밋 (또는 REJECT → 재계획)

## 포맷

```
### TASK-{ID}: {제목}
- **상태:** [ ] 미완 / [x] 완료 / [~] 건너뜀
- **우선순위:** P0 (필수) / P1 (중요) / P2 (개선) / P3 (있으면 좋음)
- **변경 파일:** (최대 4개)
- **Plan:** (무엇을, 왜)
- **Pre-flight:** (실행 전 확인)
- **Done when:** (완료 기준 — Evaluator가 이걸로 판정)
- **Evaluator 추가 체크:** (해당 작업 고유의 평가 항목)
- **Commit message:** (규격)
```

---

## 완료된 작업 (CODEX_RUN에서 이관)

<details>
<summary>TASK-00 ~ TASK-13 (13/14 완료) — 클릭하여 펼치기</summary>

- [x] TASK-00: GitHub Actions deploy workflow
- [x] TASK-02: Remove dead Tailwind v3 config
- [x] TASK-03: Set server-side lang="en" on html element
- [x] TASK-01: Fix sitemap lastModified dates (updatedAt)
- [x] TASK-05: Extract shared place utilities to lib/places.js
- [x] TASK-04: Add aria-label to toggle buttons
- [x] TASK-06: Remove OG/Twitter client-side meta updates
- [x] TASK-07: Add canonical URLs to metadata
- [x] TASK-08: Add custom 404 page
- [x] TASK-09: Add security headers
- [x] TASK-10: Hardcode footer year 2026
- [x] TASK-11: 검색 + 지역 필터
- [x] TASK-13: 가이드 — 쌀빵 경고 섹션

</details>

---

## 미완료 작업

### TASK-12: CopyButton을 PlaceCard에 통합
- **상태:** [ ]
- **우선순위:** P2
- **변경 파일:** `app/components/PlaceCard.js` (또는 PlaceFilter.js 카드 영역)
- **Plan:** CopyButton 컴포넌트(이미 존재)를 PlaceCard에 import하여 가게 이름+주소 복사 기능 추가. 택시 탑승 시 주소를 빠르게 복사하는 UX.
- **Pre-flight:**
  - `app/components/CopyButton.js` 존재 확인
  - PlaceCard.js에 CopyButton import가 아직 없음 확인
- **Done when:**
  - PlaceCard에서 CopyButton이 렌더링됨
  - 복사 텍스트: 가게명 + 한국어 주소
  - `npm run build` 통과
- **Evaluator 추가 체크:**
  - CopyButton의 `e.preventDefault()` / `e.stopPropagation()`이 카드 링크 클릭을 방해하지 않는가?
  - 다크모드에서 버튼 스타일이 깨지지 않는가?
  - 모바일에서 터치 영역 충분한가?
- **Commit message:** `feat: integrate CopyButton into PlaceCard for name+address copy`

---

## 신규 작업 (하네스 구축 후 식별)

### TASK-14: eval/ 파이프라인에 Evaluator 코드 리뷰 태스크 추가
- **상태:** [ ]
- **우선순위:** P2
- **변경 파일:** `eval/tasks/code-review.json`, `eval/eval-runner.sh`
- **Plan:** 현재 eval/은 빌드/데이터/이미지만 검증. diff를 받아 HARNESS.md의 7개 체크리스트를 자동 실행하는 eval 태스크 추가.
- **Pre-flight:**
  - `eval/tasks/` 디렉토리 존재
  - 기존 eval-runner.sh 동작 확인
- **Done when:**
  - `eval/tasks/code-review.json` 존재
  - `bash eval/eval-runner.sh` 가 새 태스크 포함하여 통과
- **Evaluator 추가 체크:**
  - 기존 5개 eval 태스크가 깨지지 않았는가?
  - CI workflow (eval.yml)에서 새 태스크가 트리거되는가?
- **Commit message:** `feat: add code-review eval task to eval pipeline`

### TASK-15: HANDOFF.md 자동 갱신 훅
- **상태:** [ ]
- **우선순위:** P3
- **변경 파일:** `.claude/settings.local.json` (또는 hooks 설정)
- **Plan:** 커밋 시 HANDOFF.md의 "완료된 작업" 섹션을 자동 업데이트하는 메커니즘 탐색. Claude Code hooks 또는 git post-commit hook 활용 가능성 검토.
- **Pre-flight:**
  - 현재 hooks 설정 확인 (`.git/hooks/` 상태)
  - Claude Code hooks API 확인
- **Done when:**
  - 커밋 후 HANDOFF.md에 자동으로 작업 기록이 추가됨
  - 또는: 실현 불가 판단 시 사유 기록 + TASK 닫기
- **Evaluator 추가 체크:**
  - hook이 빌드/커밋 속도를 저하시키지 않는가?
  - hook 실패 시 커밋이 차단되면 안 됨 (non-blocking)
- **Commit message:** `feat: add post-commit hook for HANDOFF.md auto-update`

---

## 실행 순서

```
TASK-12 → TASK-14 → TASK-15
```

TASK-12는 독립적. TASK-14, 15는 하네스 인프라 강화.
