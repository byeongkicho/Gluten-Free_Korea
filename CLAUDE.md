# CLAUDE.md — Gluten-Free Korea

## Read First
→ `docs/PROJECT.md` (SSOT for architecture, routes, data pipeline)
→ `docs/DECISIONS.md` (append-only, never edit old entries)

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
docs/          → PROJECT.md, DECISIONS.md, RUNBOOK.md, MULTI_AGENT.md
public/images/ → NoGlutenSeoul_Assets/ (originals) + places/ (generated webp)
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

## Error Recovery
- 빌드 실패: 에러 메시지 읽고 해당 파일만 수정. 전체 리라이트 금지.
- 같은 접근법 3회 실패 → 대안 시도.
- 5회 총 실패 → 중단 후 보고.
- 파일 5회 이상 반복 편집 시 → 접근법 재고.

## Failure Log (실패 1건 = 방지책 1줄)
- (에이전트 실수 발생 시 날짜와 함께 여기에 추가)
