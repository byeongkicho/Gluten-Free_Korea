# Gluten-Free Korea

> 한국 글루텐프리 식당·카페·베이커리 디렉토리  
> **Live:** [noglutenkorea.com](https://noglutenkorea.com) · **Instagram:** [@noglutenkorea](https://instagram.com/noglutenkorea)

## Tech Stack

- Next.js 15 App Router + React 19 + Tailwind CSS 4
- Cloudflare Pages via `@cloudflare/next-on-pages`
- Static-first: `data/places.json`이 유일한 런타임 데이터 소스
- Cloudinary (Instagram 이미지 호스팅)

## Routes

| Route | Description |
|---|---|
| `/` | Place directory (search, filters, nearby, map) |
| `/place/[slug]` | Place detail (images, notes, tips, map) |
| `/guide` | Gluten-free safety guide |

## Quick Start

```bash
npm install
npm run dev          # http://localhost:3000
```

## Build & Deploy

```bash
# Full pipeline (데이터 + 빌드)
npm run publish:local           # import:naver → build:places → validate:places
npm run pages:build             # Next.js build for CF Pages

# Deploy
npx wrangler pages deploy .vercel/output/static --project-name noglutenkorea

# After data-only change (no new photos)
npm run build:places && npm run pages:build

# After photo change
npm run optimize:images && npm run build:places && npm run pages:build
```

## Data Pipeline

```
data/naver_raw.json (gitignored)
  → npm run import:naver
    → data/candidates.naver.json
      + data/overrides.json (manual edits)
        → npm run build:places
          → data/places.json (generated, never edit directly)
```

## Harness Engineering (4기둥)

이 프로젝트는 **하네스 엔지니어링** 원칙을 적용합니다: `Agent = Model + Harness`

### 에이전트 하네스 파일

| 파일 | 대상 | 역할 |
|---|---|---|
| `CLAUDE.md` | Claude Code | 코딩 규칙, 금지 사항, 알려진 함정, 에러 복구 |
| `AGENTS.md` | Codex | CLAUDE.md 참조 + Codex 전용 규칙 |
| `~/.openclaw/workspace-gfkorea/AGENTS.md` | OpenClaw | 운영 하네스 (Instagram, Cloudinary, 데이터 관리) |

### 4개의 기둥

| 기둥 | 구현 |
|---|---|
| **Constrain** (제한) | Forbidden 섹션, 파일 경로 제한, 핸드오프 규칙 |
| **Inform** (정보 제공) | AGENTS.md, PROJECT.md, MULTI_AGENT.md, RUNBOOK.md |
| **Verify** (검증) | Eval 파이프라인 (`eval/`), `validate:places`, CI/CD 자동화 |
| **Correct** (수정) | Error Recovery 규칙, Past Failures 로그, Human-in-the-loop |

### 멀티 에이전트 아키텍처

```
OpenClaw (gfkorea) = 오케스트레이터
├── Claude Code    = 코드 계획 + 소규모 수정
├── Codex          = 대규모 구현 (CODEX_RUN.md)
└── OpenClaw (general) = 개인 업무 (별도)
```

자세한 역할 분담: [`docs/MULTI_AGENT.md`](docs/MULTI_AGENT.md)

## Eval Pipeline

자동화된 품질 검증 파이프라인 (EDD — Eval-Driven Development):

```bash
# 전체 Eval 실행
bash eval/eval-runner.sh

# 기준선 대비 퇴행 체크
bash eval/check-regression.sh --threshold 5.0
```

### Eval 카테고리 & 기준선

| 카테고리 | 테스트 | 기준선 |
|---|---|---|
| 빌드 안정성 | `build:places` → `validate:places` → `build` | ✅ 3/3 |
| Cloudinary URL | URL 형식 검증 | ✅ 1/1 |
| 배포 검증 | 사이트 200 OK + 콘텐츠 확인 | ✅ 2/2 |
| 이미지 무결성 | places.json 참조 이미지 존재 확인 | ✅ 1/1 |
| 데이터 무결성 | 필수 필드 + 가게 수 감소 감지 | ✅ 3/3 |

PR에서 하네스 파일 변경 시 GitHub Actions가 자동으로 Eval 실행 (`.github/workflows/eval.yml`).

### 반복 개선 원칙

> "실패 1건 = 방지책 1줄" — Mitchell Hashimoto

에이전트가 실수할 때마다 `CLAUDE.md`의 Failure Log에 1줄 추가.

## Docs

| 문서 | 역할 |
|---|---|
| [`docs/PROJECT.md`](docs/PROJECT.md) | SSOT (Single Source of Truth) |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | 아키텍처 결정 (append-only) |
| [`docs/OPERATING_MODEL.md`](docs/OPERATING_MODEL.md) | 에이전트 역할 분리 |
| [`docs/RUNBOOK.md`](docs/RUNBOOK.md) | 일일 운영 절차 |
| [`docs/MULTI_AGENT.md`](docs/MULTI_AGENT.md) | 멀티 에이전트 오케스트레이션 |
| [`eval/README.md`](eval/README.md) | Eval 파이프라인 사용법 |

## Places Data Schema

### Required fields
- `slug` (unique, URL-safe)
- `name`
- `type`

### Optional fields
- `location`, `address`, `note`, `tags[]`, `rating`
- `website`, `naverMapUrl`, `instagram`, `sources[]`
- `images[]`, `lat`, `lng`, `nameEn`, `note_ko`
