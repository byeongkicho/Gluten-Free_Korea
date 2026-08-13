# HANDOFF.md — 세션 간 컨텍스트 전달 문서

> 운영(콘텐츠·성장·인스타) SSOT는 `NoGlutenKorea/operations/` — 특히 `현황.md`(Now 대시보드).
> 이 문서는 세션 시작 시 "지금 어디까지 됐고 다음이 뭔지"만 빠르게 전달한다.
> 재개 전략 전체: `~/.claude/plans/noble-discovering-aho.md` (2026-07-24 승인).

## ▶ 다음 세션 시작점 (2026-08-13 종료 시점)

**첫 녹색 — snacks가 판사 게이트 통과 (seo-eeat 10/9.5 · accuracy-safety 9.5/9.5, `88cf6aa`).** 발행 5편 중 1 PASS / 4 FAIL(의도된 빨강 유지). ⚠️ **루브릭을 낮추지 말 것** — 출구는 글 수정→재채점뿐이다.

**▶ 남은 글 수정 백로그 (우선순위순):**
1. ~~blocking 5건~~ ✅(08-12) · ~~snacks 첫 녹색~~ ✅(08-13) — 재채점 2회 필요했음: SEO 8→9.5 도달 순간 **정확성이 9.5→9로 재롤 하락**, minor 6건 전부 수정 후에야 10/9.5·9.5/9.5
2. **사이트 전역 `<title>` 접미사** (`app/layout.js` ` | Gluten-Free Korea`) — 남은 4편 title_meta 공통 감점. 참고: snacks는 현행 접미사(20자) 하에서 39자 제목으로 통과했고, 판사는 "정확 키워드가 접미사에 의존"을 minor로 지적 — 접미사를 줄이면 이 의존이 깨지므로 **키워드 전략과 함께 결정할 것**
3. **출처·정확성 보강:** MFDS 1차 출처는 snacks에 확보됨 — `https://www.law.go.kr/행정규칙/식품등의표시기준` (별표 2) — **labels에 재사용.** 나머지: labels 엿기름 오역(malted barley이지 malt syrup 아님), hidden-gluten "Korea GF" 인증 삭제·"10~30% 밀 배합" 무출처, celiac-guide 알레르기 개수(22→19, 별표 2로 확인 가능), FAQ frontmatter-본문 불일치(celiac-guide Q3·Q5). ⚠️ **celiac-guide는 hash mismatch 상태**(참쌀설병 "is safe" 단정 제거, 08-13) — 이 백로그 반영 후 재채점
4. **snacks 잔여 minor(다음 개정 때, 게이트엔 불요):** 소주=증류주 입장의 출처, pass list 제조사 확인 추가(현재 포카칩 1건 — 오리온처럼 제품 페이지에 맛별 알레르기를 명시하는 브랜드부터), "The honesty section" 헤딩 서술형 전환

**판사 운영 지식 (08-13 실측):** ① 재채점은 **양 축 모두 재롤** — 통과했던 축도 떨어진다(정확성 9.5→9 실측). minor까지 다 잡고 돌리는 게 싸다. ② **판사 실행 중 글 수정 금지** — 해시가 실행 시점 파일로 기록돼 mismatch가 남는다(중지→최종본으로 재실행). ③ 수정이 새 minor를 만든다: 발행일(7/31) 뒤의 인용 retrieval date(8월)는 **본문 "Updated August 2026" 라인**으로 해소. ④ 제조사 제품 페이지가 맛별 알레르기를 한 페이지에 명시하는 경우가 있다(오리온 포카칩: 오리지널 우유·대두·쇠고기 vs 어니언 밀·우유·대두) — flavor trap 주장의 최상급 출처.

수정 후 재채점: `npm run judge -- <slug>` — 크레딧 없으면 **자동으로 claude CLI 백엔드**(구독 과금, `--backend` 플래그 참조). 글을 고치면 해시 불일치로 content-001이 알아서 빨개지므로 재채점 전까지 게이트가 거짓말하지 않는다.

**보류된 원래 작업:** 커머셜 인텐트 글 #1(`~/.claude/plans/1-frolicking-starlight.md`). 키워드 게이트에서 멈춰 있고, 리서치 결과 계획서의 두 후보가 모두 SERP상 부적합했다(`where to buy…`는 확립 도메인 지배, `gluten free soy sauce korea`는 상위 10 중 8개가 상품 페이지). 제3 후보 `gluten free korean pantry`가 유망 — 상위가 전부 "해외 H마트" 관점이라 **한국 현지·한국어 라벨 각도가 비어 있다.** 단, 신규 발행은 이제 게이트를 실제로 통과해야 한다.

## 완료 (2026-08-13) — 관측성 24h 확인 + 다운샘플 날짜 경계 버그 수정

- **24h 연속성 ✅**: 매시간 healthcheck 야간 무중단(전부 success — GitHub cron 지연으로 새벽 1회 스킵은 정상 범위), Grafana push 34 샘플 정상.
- **버그 발견·수정(`9a07936`)**: 23:50 KST 다운샘플 cron이 50분 밀려 00:40 KST에 실행 → "지금 기준 오늘"로 날짜를 정하던 로직이 8/12 요약을 8/13 행으로 흘림. 행 날짜를 **report.timestamp − 6h의 KST 날짜**로 변경(00~06시 관측 = 전날 밤 지연분 → 전날 귀속). CSV 복구: 조기 8/13 행을 fold 규칙 그대로 8/12에 병합(runs 7→8).
- 다음: SLO 문서+장애회고(career 9/14 게이트 — IG -44일 사례 + 이 경계 버그가 둘 다 소재), daily-summary의 Grafana 24h 집계 전환, **11월 초 IG 재인증**.

## 완료 (2026-08-12 오후) — 관측성 파이프라인 가동 (career 트랙 A 인수)

career 세션(`observability-slo-proof`)이 시작한 "경력 연수 대신 내밀 증거" 트랙 A를 이 세션이 **동의 하에 인수**해 완결. 원계획 `~/.claude/plans/https-careers-microsoft-com-v2-global-en-zany-stream.md`, **8/17 게이트(대시보드+알림 2개)를 8/12에 조기 달성.**

```
GitHub Actions (매시간) → healthcheck 16지표 → Grafana Cloud 도쿄(influx push)
                        → 23:50 KST 하루 1행 다운샘플링 → data/daily-summary.csv 자동커밋 [skip ci]
```

- **대시보드**: `https://bronzedeck1580.grafana.net/d/ngk-health` · **공개 링크(로그인 불필요, 면접용)**: `/public-dashboards/4567f98922b2487da8f3d8bdd3be9781` — 무료 티어 공개 대시보드 **가능 확인됨**(career 세션의 미확인 항목 해소)
- **알림 2개 가동**: SSL<30일(Normal, 68일) · IG 데이터접근<7일(**🔴 Alerting — 실제 -44일 방치를 잡음**, 메일→byeongkicho@gmail.com). 알림 라우팅 기본값이 `"empty"`(무전송)였던 것도 수정
- **핵심 함정 (재발 주의)**: 지표가 시간당인데 instant 쿼리 lookback은 5분 → stat 패널·알림이 매시간 55분간 "NoData". **모든 최신값 읽기는 `last_over_time(…[창])`으로** (`058814b`). 알림 range 쿼리도 같은 이유로 instant로 전환
- 커밋: `037bf09`(인수분: 지표화·다운샘플링·워크플로 — pipefail이 6주 침묵 실패를 드러냄) → `f6ca385`(influx push, 크리덴셜 없으면 skip) → `3465423`·`058814b`(대시보드·알림 as code, `monitoring/`)
- **봇이 main에 커밋한다**: 일일 요약이 `github-actions[bot]`으로 push됨 → **세션에서 push 전 `git pull --rebase --autostash` 습관화**
- **✅ 풀 사이클 실증 (16:10 종결)**: 경보 발화(IG -44일) → 사용자 재인증(Graph API Explorer, 데이터접근 **+89일**로 갱신, 2026-11-10까지) → 지표 push → **경보 자동 해제(Normal)**. `INSTAGRAM_*` 3종 시크릿 등록(사용자 승인) → CI에서도 IG 관측(31→34 샘플). 44일 방치 문제를 파이프라인 가동 당일 발견·해결한 실사례 — SLO 문서의 첫 장애회고 소재.
- **남은 것**: ① 내일 24h 지표 연속성 확인 ② SLO 문서+장애회고 = career 9/14 게이트(위 사례로 시작) ③ daily-summary 최종형은 Grafana 24h 집계 질의로 전환(career 세션 설계 의도) ④ IG 데이터접근은 90일 주기 — **11월 초 재인증 필요**(이제 알림이 7일 전에 알려줌)

## 완료 (2026-08-12 오전) — 판사 실채점: claude CLI 백엔드 + 첫 실기록 + 게이트 배선

크레딧 병목의 해소가 세션의 절반이었다. **구독 ≠ API 크레딧** 문제를 `judge-post.mjs`에 `--backend claude-cli`(Claude Code `claude -p` 헤드리스, 구독 과금)를 추가해 풀었다 — `--json-schema`로 스키마 강제, `--effort high` 고정, `--tools ""` 격리라서 API 경로와 거의 계약 동등. 못 고정하는 것(CLI 버전)은 레코드에 `claude_version`으로 기록. PROVENANCE는 A1(runner)/A2(claude-cli)로 분리, 손으로 쓴 점수는 여전히 표현 불가.

**점수 (2026-08-12, Opus effort high, 루브릭 v1):**

| 글 | SEO/E-E-A-T | 정확성/안전성 | 게이트 |
|---|---|---|---|
| celiac-travel-korea-guide | 8 | 6 (blocking 2) | FAIL |
| korean-convenience-store-gf-snacks | 8 | **9.5 통과** | FAIL (SEO만) |
| reading-korean-food-labels | 8 | 5.5 | FAIL |
| hidden-gluten-korean-food | 7.5 | 5.5 | FAIL |
| gluten-free-butter-tteok | 6.5 | 3.5 (blocking 3) | FAIL |
| *(보정) snacks 스텁 @2ed35c2* | *3* | *3.5* | *변별력 증명* |

읽는 법: ① 판사는 변별한다(스텁 3 vs 발행본 8) — "늘 9.5 주는 판사" 아님. ② 7월 평가 루프를 거친 글(labels·snacks)이 상위, 루프 이전 글(butter-tteok)이 최하 — 루프가 실제로 품질을 올렸다. ③ 그러나 7월 자가보고 "9.5/9.5"는 재현 가능한 판사 앞에서 유지되지 않았다(labels 8/5.5) — PROVENANCE bucket C의 한계가 실측으로 확인됨. ④ snacks 정확성 9.5는 기준이 도달 가능함을 증명.

**게이트 배선:** `eval/tasks/content-gate.json`(content-001) 신설 — `check-harness judgments`가 발행글마다 기록 존재·해시 일치·루브릭 버전·**gate PASS**까지 검사. baseline은 7/8 빨간 상태 그대로 정직하게 기록(`content-001,0,1`). eval-runner exit 1 → push마다 CI 빨강 = 게이트가 물고 있다는 뜻.

## 완료 (2026-08-07) — 12-factor 진단 이행, 14커밋 전부 push

뼈대는 볼트 `08_DevEnv/에이전트 시스템 12-factor 점검 2026-08.md`. 그 노트가 진단한 병리가 이 저장소에서 그대로 재현되고 있었다.

| Factor | 무엇이었나 | 커밋 |
|---|---|---|
| **11** Trigger from anywhere | `eval.yml`이 139커밋 동안 **CI 실행 0건** — 트리거가 `pull_request`뿐인데 전부 main 직접 push. **CI 첫 실행 성공** | `4d8c7d1` |
| 그 대가 ① | **라이브 이미지 404 4건** (07-24부터 방치). HANDOFF에 적힌 원인("upload 미실행 또는 네이밍 불일치")은 **둘 다 틀렸다** — `build_places`가 `.jpg` 원본까지 스캔해 업로드된 적 없는 Cloudinary id를 만든 것. 83→79 참조 | `c53196b` |
| 그 대가 ② | `cdn-001`이 CI(Node 20)에서 `require(ESM)`로 **반드시 깨졌을** 상태. 로컬(Node 22)에서만 통과 | `e629804` |
| **양성 케이스** | `harness-001` 신설 — 규칙 문서가 현실을 가리키는지 검사. 의도적 red(2/5) → 결함 3건 수정 → 7/7 → baseline 4개월 만에 갱신 | `2cfdb63`→`22390d6` |
| **5** exec=business state | post-commit 훅이 헤딩 드리프트로 죽어 있었다(조용히 exit 0). 앵커 기반 + 실패 시 stderr | `5f705b1` |
| **8** evaluator-optimizer | 판사 트랙 구축 — 루브릭 2종(각 20점)·프롬프트·`judge-post.mjs`·`check-harness judgments` | `9270ce0`~`dd11040` |
| README | "레스토랑 디렉터리"로 시작해 하네스가 56행에 묻혀 있었고 **깨진 링크 2건**. 검사 대상에 README를 넣자 드러남 | `52bb58b` |

**판사 설계에서 확인한 것:** `jsonSchemaOutputFormat()`은 `enum`을 `description` 문자열로 강등시킨다 → 스키마를 직접 구성해야 점수 범위가 강제된다. 점수는 기준별 **객체**로 받는다(배열은 항목별 범위 제약 불가). 모델은 정수만 반환하고 총점·임계·통과 판정은 JS가 계산 — "10점 만점에 몇 점"을 물으면 숫자를 먼저 고르고 역산한다.

**⚠️ 운영자 액션 2건 — 세션 2 전에 필요:**
1. **GA4 맞춤 측정기준 2개 등록** (관리 → 데이터 표시 → 맞춤 정의, 이벤트 범위): `affiliate_placement`, `link_type`. **소급 적용 불가** — 등록 전 클릭은 영원히 조회 불가. (2분)
2. **쿠팡 링크 4개 목적지 확인** — 봇 차단(403)이라 에이전트가 못 엽니다. 폰에서 열어 상품명·원재료 확인, GF 아닌 건 글에서 뺍니다. (3분)
   `coupang.com/vp/products/` → `7074787242`(고추장) · `7200738817`(간장/타마리) · `7201636498`(쌈장) · `4321004895`(GF 파스타)

**그 외 대기 중:** 버터떡 사진 · 이모님 고추장 레시피 · 제휴 가입(SafetyWing/Genki·Airalo·iHerb) · 이메일 서비스 선택.
**(네이처빌 바지락 라벨 사진은 08-05 수령 완료** — 볼트 `05_Business/Projects/Website/GlutenFree_Korea/바지락쌀칼국수_네이처빌.png`)

**콘텐츠 발행 시 규칙:** 평가 에이전트 2개(SEO/E-E-A-T + 정확성/안전성)로 **둘 다 9.5/10** 도달 후 발행 — 최근 3편 모두 이 루프로 무결성 문제를 잡아냄.

## 완료 (2026-08-05 세션 1) — 제휴 렌더 인프라

핵심 발견: HANDOFF가 적어둔 *"기존 쿠팡 링크 + `AffiliateBox`로 바로 붙일 수 있음"*은 **사실이 아니었다.** 블로그는 `rehype-raw` 없는 react-markdown이라 본문에 컴포넌트를 쓰면 **빌드는 통과하고 화면에서 조용히 사라진다.** 그래서 템플릿 수정이 선행됐다.

| 커밋 | 내용 | 검증 |
|---|---|---|
| `ca01ee9` | 쿠팡 카탈로그·고지문을 `app/lib/affiliate.js`로 추출 (컴플라이언스 문구 SSOT화) | guide.html **정규화 diff 0** — 렌더 완전 동일 |
| `adaedaa` | frontmatter `affiliate:` → `AffiliateBox` 렌더 + `?subId=<slug>` + `affiliate_placement` | 박스가 `</article>` **밖**에 렌더(캐스케이드 회피), rel=sponsored, 잘못된 id는 빌드 실패 |
| `e9db4e5` | `assertPostSchema` — frontmatter 키·status 오타를 빌드 실패로 | 기존 10편 통과, `status: Published`는 파일명과 함께 실패 |

- **왜 `<article>` 밖인가:** `globals.css:147-152`의 `.blog-prose a`가 명시도에서 이겨 **제휴 링크가 본문 텍스트 색**이 된다 — 링크로 안 보이고, 이 글이 측정하려는 CTR을 직격한다. `className` prop으로는 못 고친다(루트 `<section>`만 바꿈).
- **부수 효과:** FAQ가 자체 prose 래퍼를 갖게 되어 **기존 4편의 Q/A 간격 0 버그가 함께 고쳐졌다**(pillar는 본문 `## FAQ`라 무변화).
- **`?subId=`가 302 Location에 전파됨을 확인** → 신규 링크 발급 없이 글별 귀속 가능. 단 **대시보드 리포트 여부와 약관상 공식 파라미터인지는 미확인**(세션 2에서 확인, 아니면 전용 링크로 폴백).
- **`guide.html` 원시 바이트 diff는 원천 불가능** — `generateBuildId`가 없어 매 빌드 build ID가 랜덤이고 flight payload에 박힌다. build ID·자산 해시만 마스킹한 **정규화 diff**를 게이트로 쓸 것.
- DECISIONS.md 기록 완료(CLAUDE.md:44).

## 현재 상태

- **마지막 업데이트:** 2026-08-13 11:05
- **작업자:** Claude Code
- **브랜치:** main
- **CI:** 🔴 content-001 (의도된 빨강 — snacks 1편 PASS, 4편 FAIL + celiac-guide hash mismatch)
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

## 🎯 북극성 목표 (2026-07-30 설정) — 월 $100+ (6개월 내)

프로젝트 goal = **월 $100+ 수익** (목표 유지, ETA 정직하게 6~9개월). 여행자·집밥 균형. **병목=트래픽**(~10 PV/day). **로드맵 v2 = 3-에이전트 평가(전략·PM·적대적 회의론)로 6.5~7.0→전원 9.5/10까지 개선.** 전체: `~/.claude/plans/noble-discovering-aho.md` "💰 목표: 월 $100" 섹션. 메모리: `project_goal_100_month`.
- **핵심 전략(v2):** ① $100은 **stretch(P25~P35)**, 6개월 성공=P50 $40~70+수익 증명(이탈 방지 재정의). ② **AdSense 분리**(재반려 가정, upside only). ③ 여행 **보험(SafetyWing/Genki) 리드 채널**($10~25, 셀리악 fit) > 호텔 > eSIM. ④ 제품은 **iHerb(5~10%)+쿠팡**, **Amazon 보류**(180일 3판매 종료 규칙). ⑤ **M3 결정 게이트**(오가닉 ≥50/day·인덱싱 ≥8·클릭볼륨 → Plan B 분기). ⑥ **비-SEO 헤지**(Pinterest·이메일·IG, 콘텐츠 세션에 얹어 무추가 시간). ⑦ 커머셜 인텐트 글(best eSIM·pantry kit·GF hotels).
- ✅ **쿠팡 4개 링크 `rel="sponsored"` 추가** (07-30, M1 위생) — `app/guide/page.js`.
- ✅ **`AffiliateBox` 컴포넌트 신설 + 쿠팡 클릭 추적** (07-31, M1) — `app/components/AffiliateBox.js`(client, rel=sponsored·이중언어·고지·`trackEvent(link_type:affiliate)`). /guide 쿠팡 블록을 이 컴포넌트로 리팩터 → **기존엔 추적 0이던 제휴 클릭이 이제 GA4로 측정**(KPI 공백 해소). iHerb/SafetyWing/Airalo 링크는 이 패턴에 items만 추가하면 됨.
- **수익화 다음(제가 가능):** 이메일 opt-in(서비스 선택 필요 — Buttondown/ConvertKit 무료). **운영자 필요(가입):** SafetyWing/Genki·Airalo·iHerb → 링크/ID 주면 AffiliateBox items로 삽입. **최우선은 여전히 콘텐츠(트래픽).**

## 🔀 방향 전환 (2026-07-28) — 요리+식재료 co-primary

운영자 실제 경험이 외식→**집밥 GF 요리+식재료 소싱**으로 이동(237 폐업/이전, 이후 집밥). 전체 계획: `~/.claude/plans/noble-discovering-aho.md` v2. 요약: 요리·식재료를 co-primary(외식 디렉터리 유지·보조), 콘텐츠·`/shop` 도구를 이 방향으로 우선.

- ✅ **hidden-gluten-korean-food 발행** (피벗 앵커, 1,170단어, `073b5a9`) — 조미료 속 숨은 글루텐 → 집밥이 통제 열쇠.
- ✅ **gluten-free-butter-tteok 발행** (요리 저널 #1, 07-29) — 버터떡 트렌드 → GF 확인(찹쌀≠글루텐) → 가격 → 집에서 제작 → No Brand 프리믹스. 정성적 레시피(배합비 미지어냄), FAQPage, 링크 3개(펄러·hidden-gluten·monil2-house). **사진 대기중**(운영자 제공 예정 → `<!-- IMG -->` 슬롯에 삽입 후 재커밋 = P1-0b-2).
- ✅ **홈페이지 콘텐츠 우선 허브 전환** (07-29) — 홈=매장 그리드 → hero(`Gluten-Free Living in Korea`, cook·source·dine 3축) + "Latest from the blog"(텍스트 카드) + "Browse restaurants"(featured 6). 매장 디렉터리는 **`/places` 신설**로 이관(PlaceFilter+ItemList+디렉터리 키워드 승계, 24 매장 내부링크 보존). Navbar: Home·Blog·Restaurants(/places)·Guide. 매장 breadcrumb→/places, sitemap에 /places(0.9). 홈 ItemList 제거·WebSite만.
  - ✅ **PSI 모바일 재측정(배포 후 확인):** LCP **9.4s→1.7s**, FCP **5.7s→1.5s**, SI **6.5s→1.9s** (전부 orange→green). TBT 160ms·CLS 0·SEO 100 유지. Performance orange(~50s대)→**green(~95+)**. LCP-lazy/렌더블로킹 경고 소멸. 남은 캐시 절감은 3rd-party AdSense(통제 밖). CrUX 필드는 여전히 No Data(트래픽 부족).
- ✅ **reading-korean-food-labels 발행** (요리·식재료 #2, 07-30, 1,190단어) — 한국 라벨에서 글루텐 판별 4단계(flip-and-scan). **별도 평가 에이전트 2개(SEO/E-E-A-T + 정확성/안전성)로 반복 개선해 둘 다 9.5/10 도달 후 발행.** 핵심 안전 수정: 한국 의무 알레르기 표시는 **밀만** 보장, 보리·호밀은 표시대상 아님 → 전체 원재료명 스캔 필요(이걸 글의 중심 논리로). FAQPage·링크 3개(펄러·hidden-gluten·버터떡). 검증(build·noindex 없음·sitemap·validate) 통과.
- ✅ **korean-convenience-store-gf-snacks 발행** (요리·식재료 #3, 07-31, 1,434단어) — 편의점 GF 스낵(감자·옥수수·쌀 베이스) + 맛별 함정 + 보리차 등 스낵 밖 함정. **평가 에이전트 2개로 7.5/7.0 → 둘 다 9.5/10.** 평가가 잡은 **무결성 문제 2건 수정:** ① CU 211개 데이터를 "product information으로 분류"라 썼으나 실제 `scripts/fetch-cu-gf.mjs`는 name/price/image만 수집 → **상품명 키워드 매칭**임을 명시하고 오분류(반숙계란장 false negative, 꼬마김밥 4개 false positive)까지 자진 공개. ② 스낵 목록 출처가 제3자 블로그(seiming.tistory.com, CC BY)인데 날짜를 2026으로 오기 → 원문 확인 결과 **2023-10-31 발행**, 정정 후 "2년 이상 지남" 명시.
- ✅ **사이트 전역 SEO 버그 수정: FAQ 미렌더** (07-31) — frontmatter `faq`가 FAQPage JSON-LD로만 나가고 화면엔 없었음(published 4편 중 3편) = 구글 "마크업은 보이는 콘텐츠와 일치" 요건 위반·리치결과 자격 상실. `app/blog/[slug]/page.js`에서 렌더하도록 수정(본문에 `## FAQ` 있는 펄러는 정규식 가드로 중복 방지). 펄러도 정리(없는 "package photos" 약속 삭제, "confirmed-safe"→"usually pass").
- ✅ **홈 성능 미세튜닝 + 랩 변동성 학습** (07-30) — 07-30 낮 PSI가 67(orange)로 떨어져 보였으나, **동일 코드에서 67↔95 오감 = 스로틀링 랩 단일측정 노이즈**(실제 악화 아님)로 확인. LCP 요소는 이제 이미지가 아니라 **hero 텍스트 문단**(render delay). 조치: `app/layout.js`에 preconnect(pagead2·googletagmanager·cloudflareinsights·ga) + **GA를 `lazyOnload`로 지연**(LCP 창 메인스레드 경쟁 감소). fonts는 이미 `display:swap`(무변경). 수정 후 재측정 **Perf 95, LCP 2.0s, FCP 1.5s, SI 1.9s (green 복귀)**, A11y 91·BP 96·SEO 100. **교훈: 단일 PSI 점수에 일희일비 금지, 2~3회 중앙값으로.** 더 큰 일관성 레버 = Cloudflare Rocket Loader OFF(대시보드, 미실행).

## 미완료 / 다음에 할 작업 (P1 리밸런싱 — 요리·식재료 우선)

목표 운영 모델: **주 4~6시간, 주 1회 90분 세션 = 배포된 1개 산출물.** 절대 커밋/push 없이 세션 종료 금지.

| 우선순위 | 작업 | 비고 |
|----------|------|------|
| 1 | **#2 레스토랑 초안 재프레이밍 발행** ("personally tested" 제거 → curated/티어) + **237 폐업/이전 확인 후 데이터 정리** | 초안은 `content/blog/gluten-free-restaurants-seoul.md`(현 upcoming) |
| 2 | 요리/식재료 스텁 완성 (주 1편): ~~reading-korean-food-labels~~ ✅(07-30) · ~~convenience-store-snacks~~ ✅(07-31) → **다음: gochujang(이모님 레시피 확보 후) 또는 커머셜 인텐트 글**(best eSIM·pantry kit) | 위키 `concepts/`로 write-ready |
| 3 | **`/shop` 도구 연결** (P2→승격, 반나절): CU 가이드 플래그십 + HACCP 보조, disclaimer 전면, 이미지 hotlink 처리 | 컴포넌트 이미 완성 |
| 4 | **이모님 수제 고추장 레시피 캡처** (운영자 net-new 입력 — 유일한 blocking 갭, 경쟁 전무 시그니처) | #9 |
| 5 | 포지셔닝 재구성 — 홈/nav ✅완료(07-29). **잔여: About 카피 3축 리프레이밍**, IG 토큰 갱신+백로그, 커뮤니티 시딩 | 콘텐츠 쌓인 뒤 |
| ~~6~~ | ~~배포 후 PSI 모바일 재측정~~ ✅완료(07-29): LCP 9.4→1.7s, orange→green (위 참조) | — |

## P2 (트래픽 100 PV/day 도달 후 — park)

- GF 제품검색 `/products` (11MB 데이터 슬리밍 후) — crown jewel, 지금은 커밋만 됨/미연결
- 인텐트 기반 수익화(제휴)로 AdSense 대체. AdSense는 Auto Ads 켜둔 채 KPI를 인덱싱 페이지·오가닉 세션으로.

## 알려진 이슈

- ⚠️ **cafe-pepper 이미지 4장 전부 Cloudinary 404** (IMG_8245, naver_01~03) — 기존 라이브 깨짐, 이번 세션 무관. `upload:cloudinary` 미실행 또는 네이밍 불일치. 별도 수정 필요.
- About 페이지: EN 개인 서사 있음, KO 미번역 (3편 발행 후 선별 번역 예정)
- IG 액세스 토큰 만료 추정
- 🔸 **`<title>` 접미사 중복** — `layout.js` 템플릿의 ` | Gluten-Free Korea`가 붙어 글 제목이 77자로 SERP 잘림 + "Gluten-Free" 중복. 사이트 전역, 발행 차단은 아님 (평가자 지적).
- 🔸 **블로그 글에 이미지 0** — 스낵/라벨 글은 실사 있으면 스니펫·신뢰도 상승 (버터떡 사진과 함께 처리)

## 컨텍스트 노트

- 매장 24개, 위키 50페이지, 인스타 9건 게시(04-21 중단)
- push = 자동 배포 (`.github/workflows/deploy.yml` → Cloudflare Pages `noglutenkorea`)
- 도메인 noglutenkorea.com (구 gluten-free-korea.pages.dev 폐기)
- 재개 전략·개선안·평가: `~/.claude/plans/noble-discovering-aho.md`
- 블로그 9편 시리즈 계획: `NoGlutenKorea/operations/블로그 시리즈 계획.md` (단어 수 목표 1,200~1,500으로 하향)
