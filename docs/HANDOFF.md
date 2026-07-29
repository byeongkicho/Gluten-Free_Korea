# HANDOFF.md — 세션 간 컨텍스트 전달 문서

> 운영(콘텐츠·성장·인스타) SSOT는 `NoGlutenKorea/operations/` — 특히 `현황.md`(Now 대시보드).
> 이 문서는 세션 시작 시 "지금 어디까지 됐고 다음이 뭔지"만 빠르게 전달한다.
> 재개 전략 전체: `~/.claude/plans/noble-discovering-aho.md` (2026-07-24 승인).

## 현재 상태

- **마지막 업데이트:** 2026-07-29 10:31
- **작업자:** Claude Code
- **브랜치:** main
- **점수 진단(2026-07-24, 별도 전문가 평가):** 웹 5.3/10, PM 4.3/10 — "자산 품질은 7, 운영 규율은 3.5". 갭은 대부분 *이미 시작한 것의 완성*.

## 완료된 작업 (2026-07-24 재개 세션 — P0 안정화)

| # | 작업 | 검증 |
|---|------|------|
| 1 | ~2.5개월치 미커밋 작업 커밋+push (블로그 시스템, 이미지 수정, 제품검색 park 자산) → 백업·배포 | ✅ `71c88a2..7386c04` |
| 2 | 블로그 시스템 발행 (펄러 1편 published + 스텁 8편) | ✅ build 46 pages |
| 3 | 스텁 8편 `noindex,nofollow` + sitemap 제외 + 인덱스 링크 제거 (thin-content SEO 자해 차단) | ✅ 빌드 HTML 확인 |
| 4 | sitemap 하드코딩 stale 날짜(~03-10) → 빌드 시각 freshness | ✅ |
| 5 | 이미지 드리프트 수정: build_places가 override `images` 우선. cucciolo(6)·ssal(01)를 라이브 Cloudinary ID로 고정 | ✅ 전부 200, validate 24 |
| 6 | 11MB `data/gf-products.json` gitignore (재생성 가능) | ✅ |
| 7 | 문서 SSOT 재정리: PROJECT/DECISIONS 정정, SUPERSEDED 3종 아카이브, operations=SSOT | ✅ |

## 🔀 방향 전환 (2026-07-28) — 요리+식재료 co-primary

운영자 실제 경험이 외식→**집밥 GF 요리+식재료 소싱**으로 이동(237 폐업/이전, 이후 집밥). 전체 계획: `~/.claude/plans/noble-discovering-aho.md` v2. 요약: 요리·식재료를 co-primary(외식 디렉터리 유지·보조), 콘텐츠·`/shop` 도구를 이 방향으로 우선.

- ✅ **hidden-gluten-korean-food 발행** (피벗 앵커, 1,170단어, `073b5a9`) — 조미료 속 숨은 글루텐 → 집밥이 통제 열쇠.
- ✅ **gluten-free-butter-tteok 발행** (요리 저널 #1, 07-29) — 버터떡 트렌드 → GF 확인(찹쌀≠글루텐) → 가격 → 집에서 제작 → No Brand 프리믹스. 정성적 레시피(배합비 미지어냄), FAQPage, 링크 3개(펄러·hidden-gluten·monil2-house). **사진 대기중**(운영자 제공 예정 → `<!-- IMG -->` 슬롯에 삽입 후 재커밋 = P1-0b-2).

## 미완료 / 다음에 할 작업 (P1 리밸런싱 — 요리·식재료 우선)

목표 운영 모델: **주 4~6시간, 주 1회 90분 세션 = 배포된 1개 산출물.** 절대 커밋/push 없이 세션 종료 금지.

| 우선순위 | 작업 | 비고 |
|----------|------|------|
| 1 | **#2 레스토랑 초안 재프레이밍 발행** ("personally tested" 제거 → curated/티어) + **237 폐업/이전 확인 후 데이터 정리** | 초안은 `content/blog/gluten-free-restaurants-seoul.md`(현 upcoming) |
| 2 | 요리/식재료 스텁 완성 (주 1편): reading-korean-food-labels → convenience-store-snacks → gochujang(레시피 확보 후) | 위키 `concepts/`로 write-ready |
| 3 | **`/shop` 도구 연결** (P2→승격, 반나절): CU 가이드 플래그십 + HACCP 보조, disclaimer 전면, 이미지 hotlink 처리 | 컴포넌트 이미 완성 |
| 4 | **이모님 수제 고추장 레시피 캡처** (운영자 net-new 입력 — 유일한 blocking 갭, 경쟁 전무 시그니처) | #9 |
| 5 | 포지셔닝 재구성(홈/About/nav 3축), IG 토큰 갱신+백로그, 커뮤니티 시딩 | 콘텐츠 쌓인 뒤 |

## P2 (트래픽 100 PV/day 도달 후 — park)

- GF 제품검색 `/products` (11MB 데이터 슬리밍 후) — crown jewel, 지금은 커밋만 됨/미연결
- 인텐트 기반 수익화(제휴)로 AdSense 대체. AdSense는 Auto Ads 켜둔 채 KPI를 인덱싱 페이지·오가닉 세션으로.

## 알려진 이슈

- ⚠️ **cafe-pepper 이미지 4장 전부 Cloudinary 404** (IMG_8245, naver_01~03) — 기존 라이브 깨짐, 이번 세션 무관. `upload:cloudinary` 미실행 또는 네이밍 불일치. 별도 수정 필요.
- About 페이지: EN 개인 서사 있음, KO 미번역 (3편 발행 후 선별 번역 예정)
- IG 액세스 토큰 만료 추정

## 컨텍스트 노트

- 매장 24개, 위키 50페이지, 인스타 9건 게시(04-21 중단)
- push = 자동 배포 (`.github/workflows/deploy.yml` → Cloudflare Pages `noglutenkorea`)
- 도메인 noglutenkorea.com (구 gluten-free-korea.pages.dev 폐기)
- 재개 전략·개선안·평가: `~/.claude/plans/noble-discovering-aho.md`
- 블로그 9편 시리즈 계획: `NoGlutenKorea/operations/블로그 시리즈 계획.md` (단어 수 목표 1,200~1,500으로 하향)
