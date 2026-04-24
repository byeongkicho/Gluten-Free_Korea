# CLAUDE.md — Gluten-Free Korea

## Read First
→ `docs/PROJECT.md` (SSOT for architecture, routes, data pipeline)
→ `docs/DECISIONS.md` (append-only, never edit old entries)
→ `docs/HARNESS.md` (3-agent 루프, handoff, subagent 규칙)
→ `docs/HANDOFF.md` (현재 진행 상태 — 세션 시작 시 필수 확인)

## Stack
- Next.js 15 App Router + React 19 + Tailwind CSS 4
- Deploy: Cloudflare Pages via `@cloudflare/next-on-pages`
- Data: `data/places.json` is the sole runtime source (generated, never edit)
- Images: originals in `NoGlutenSeoul_Assets/`, optimized in `public/images/places/`

## Directory Map
```
app/           → pages + components + lib
data/          → places.json (generated), overrides.json (manual), candidates.naver.json
scripts/       → build_places, import_naver, optimize-images, upload-cloudinary, etc.
docs/          → PROJECT.md, DECISIONS.md, HARNESS.md, HANDOFF.md, RUNBOOK.md
public/images/ → NoGlutenSeoul_Assets/ (originals) + places/ (generated webp)
NoGlutenKorea/ → LLM Wiki (별도 git repo, 자체 CLAUDE.md 하네스). 블로그·콘텐츠 교차 작업 시 상위에서 수정 가능, 위키 단독 lint/ingest는 위키 세션 권장.
```

## Build & Verify
- Dev: `npm run dev`
- Build: `npm run build`
- Validate: `npm run validate:places`
- Full pipeline: `npm run publish:local && npm run pages:build`
- Deploy: `npx wrangler pages deploy .vercel/output/static --project-name noglutenkorea`
- **커밋 전 필수:** `npm run build && npm run validate:places`

## Code Style
- JS/JSX only. Functional components. No class components.
- Tailwind utility classes only. No inline style. No CSS modules.
- Import order: external → internal → components → lib
- Smallest viable diff. No bonus improvements.

## Forbidden
- `data/places.json` 직접 편집 → `npm run build:places`로 생성
- `data/naver_raw.json` 커밋 → gitignored
- `public/images/places/` 직접 편집 → `npm run optimize:images`로 생성
- 새 npm 패키지 추가 시 bundle size 변화 미기록
- 데이터 모델 변경 시 `docs/DECISIONS.md` 미기록

## Known Pitfalls
- Cloudflare Pages: Node.js server API (fs, path) 사용 불가. Edge runtime 호환 필수.
- next-on-pages 빌드 시 `output: "export"` 필요.
- Tailwind v4: `tailwind.config.ts` 아닌 CSS `@theme` 방식.
- `coverImage` 필드: `overrides.json`에서 설정 → `build_places`가 images 배열 재정렬.
- 이미지 최적화 없이 places 빌드하면 이미지 경로 깨짐.
- Override-only entries (manual_*): string SID 사용, Naver SID와 충돌 없음.

## Harness (3-Agent 루프)
- 비자명한 작업: Planner → Generator → Evaluator 순환
- Evaluator REJECT → 구체적 사유와 함께 Planner로 반환
- 상세: `docs/HARNESS.md`

## Subagent 제한
- 변경 파일: ≤ 4개/agent
- 파일 읽기: ≤ 1000줄/파일 (offset/limit 사용)
- 병렬 agent: ≤ 3개 동시
- 같은 파일 동시 수정: 금지

## 세션 프로토콜
- 시작: `docs/HANDOFF.md` 읽기 → 미완료 작업 확인
- 종료: `docs/HANDOFF.md` 업데이트 (필수)
- 컨텍스트 70%+ → HANDOFF.md 갱신 후 새 세션 권장

## Error Recovery
- 빌드 실패: 에러 메시지 읽고 해당 파일만 수정. 전체 리라이트 금지.
- 같은 접근법 3회 실패 → 대안 시도.
- 5회 총 실패 → 중단 후 보고.
- 파일 5회 이상 반복 편집 시 → 접근법 재고.

## Failure Log (실패 1건 = 방지책 1줄)
- (에이전트 실수 발생 시 날짜와 함께 여기에 추가)
