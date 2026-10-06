# HANDOFF.md — 세션 간 컨텍스트 전달 문서

> 운영(콘텐츠·성장·인스타) SSOT는 `NoGlutenKorea/operations/` — 특히 `현황.md`(Now 대시보드).
> 이 문서는 세션 시작 시 "지금 어디까지 됐고 다음이 뭔지"만 빠르게 전달한다.
> 재개 전략 전체: `~/.claude/plans/noble-discovering-aho.md` (2026-07-24 승인).

## ▶ 쿠촐로 재방문 (2026-10-04 점심) — 운영자 보고 10-06 · 사진 대기

**Ki 확인 사실(10-06):** 런치 메뉴는 이번이 처음 · 먹은 것 = **트러플 파스타(GF 면으로 변경)** + **스테이크앤프라이** · 감자튀김은 **주방 확인 후 글루텐프리 가능** 답변 · 디저트 메뉴판에 **GF 표시 있음**(사진만, 먹지 않음) · 아내(NCGS) 이상 없음 — 셀리악 기준은 모름 · ❌ **GF 면 재료·따로 삶는지는 묻지 않음** → 글에 "확인 안 함"으로 명시할 것. 가격·영수증 미확인.
**사진:** 사진첩 DB(`Photos.sqlite` 복사본 조회)에서 10-04 **13:37~14:11 쿠촐로 20~29m** 이내 15장 + 12:26·12:45 근접 2장 + 14:44~14:57 60~100m 13장 확인(UUID 목록 = scratchpad, 세션 한정). 🔴 **원본 내보내기(Photos AppleScript)는 샌드박스 해제가 필요해 자동 권한 검사가 거부** → Ki 가 Photos 앱에서 직접 내보내기(파일 ▸ 내보내기 ▸ 수정되지 않은 원본) 또는 권한 판단.
**✅ 10-06 반영:** Ki 승인(옵션 2)으로 `.claude/settings.local.json` 에 **Photos 내보내기 명령 한 형태만** 허용 + 샌드박스 제외(`osascript -e 'tell application "Photos" to export *`) → 원본 32장(IMG_1708~1739) 수령. 직접 열어 확인한 1차 자료: 메뉴판 각주 **「글루텐프리 파스타면 변경 필요 시에 말씀 부탁드립니다」** · 트러플 파스타 35(원래 노른자 타야린 생면) · 스테이크앤프라이 75/99 · **같은 메뉴판에 피시앤칩스**(튀김기 공유 미확인) · 디저트 **Glutenfree Cheesecake 10**. 제외: 1708 설화수 진열장 · **1709 인물 사진(동의 없이 게시 ✗)**.
- 쿠촐로 `visits`·`details`(6줄, 미확인 3가지 명시) + 방문 배지. restaurants 단락 보강 + 글 끝 10월 변경 이력 + 튀김옷 뜻풀이·FEEKE(창원) 산수·홍대입구역·지화자 확인월 → **판정 9.5/9.5 PASS (3롤)** → **운영자 예외 해제**(`gate-overrides.json` 비움). 발행 7편 전원 판정 PASS.
- ▶ 남은 것(Ki 판단): 사이트 사진 교체(네이버 사진 4장 → 직촬, Cloudinary 업로드 = 외부 전송) · IG 게시물 초안 · push(c373db1 정리 커밋이 함께 나간다).

## ▶ 10-06 정리 (홈 ki-f5 경유 Ki 지시 — A급만 · 로컬 커밋 · push ✗)

- **HANDOFF 463 → 131줄.** 07-24~09-08 완료 섹션을 `docs/archive/HANDOFF-2026-07-to-09.md` 로 **원문 그대로** 이동, 열린 항목은 아래 「📌 열린 항목」으로 승계.
- **`eval-runner.sh`: 실패 사유·`OVERRIDE:` 줄을 로그에 출력.** 지금까지 단계 출력을 임시 파일에 버려 CI 로그에 ❌만 찍히고 이유가 없었다(9-07~ 빨강을 아무도 못 읽은 이유의 일부).
- 확인만: lint 0건 · 죽은 코드 없음(미사용 `CUGFGuide`·`GFProductSearch` = `/shop` 보류 자산, 고아 스크립트 3개 = IG 수동 도구).
- **B급(Ki 판단):** ①**CI freshness 는 구조적으로 실패할 수 없다** — `eval.yml` 이 `checkout@v4` 기본 `fetch-depth: 1` 이라 모든 파일의 마지막 커밋일 = HEAD. 깊이를 늘리면 즉시 빨강 + 기준선 갱신 순환 문제를 같이 풀어야 한다 ②`package.json` `"type":"module"` 경고(judge 실행마다) — 빌드 의미가 바뀔 수 있어 보류 ③볼트 `05_Business/.../GlutenFree_Korea/` 정리 후보(아래) ④위키 `NoGlutenKorea/entities` 낡음(x-ake "미등록·주소 미확인" 등 4-06 상태) — 위키 세션 몫 ⑤**소재: 이도곰탕 계동점**(종로구 계동길 33-8) 10-05 Ki 일행 곰탕+밥 1회 실식 문제없음 — **성분 확인 아님**, 쌀면곰탕은 안 시킴 = 미검증. 게시 여부 Ki.
- 볼트 후보(삭제 ✗, 목록만): 「Gluten-Free Korea 리팩터링 노트」(3월 아이디어 — 지도·다크모드·복사·지역필터 대부분 구현됨 → 보관 처리 후보) · 「GF인스타그램 및 식당별 정보」(**사이트에 없는 운영자 정보**: 237 사장 본인 셀리악 응급실 경험 · 모닐이네 쌈장 튜브·인스타 일일 메뉴 공지 → 모닐이네 details 재료) · MOC 의 네이처빌 쌀국수(gf-products.json 미등재) · `매장 사진/benji 카페 (2026-04-02)` 3장(**places 에 없는 매장**) · 엑스에이크 네이버 클리핑(위키 raw 와 중복).
- 볼트 백로그 #19(법령 정정 분리 배포)는 **사실상 해소** — 9-07 분리 커밋·push·라이브 확인(9-27), 4편 9-28 전원 PASS. 홈이 닫을 수 있게 보고함.

## ▶ 다음 세션 시작점 (2026-09-27)

**9/08 배포 4건 — 전부 push·라이브:** ①`0b36eb9` 앙베어베이크 **Dedicated GF**(운영자 확인 · 전 메뉴 GF) ②`9bec9bf` 237 **미확인 → 확인된 휴업** + 제보 요청 문구(목록 노출 21) ③`ece1d7a` **`gluten-free-restaurants-seoul` 발행**(색인 6→7편, 판정 9.5/7 FAIL을 운영자 판단으로 발행) ④IG 글루닉 게시 `DdAXUWUCYBL`.

**열린 것 (볼트 열린 루프에서 이관, 9-27):**
- 🟡 **IG `DdAXUWUCYBL` 해시태그 누락 — Ki 가 앱에서.** Graph API 로는 게시 후 캡션 수정 불가.
- 🔴 **미해결 major — 방법론(별건):** `restaurants-seoul` 판사 지적 *"증거 기반이 NCGS 1인이라 '대부분 셀리악에게도 통한다'를 그 방법으로 세울 수 없다."* 채점 3회에서 major 가 이 하나로 수렴. **문장이 아니라 사이트의 검증 방법 자체**라 글 수정으로 안 닫힌다.

### ✅ 9-27 재채점 — 4 PASS / 2 FAIL (8-27은 2/4)

🔑 **아래 9-07 섹션의 "FAIL 4편 blocking은 전부 experience major"는 오독이었다.** 8-27 판정 원본을 열어보니 `phrases`·`labels`·`hidden`은 **accuracy-safety 9**로 떨어졌고 experience가 걸린 seo 축은 9.5로 통과했다 — 운영자 입력이 필요 없는, 무출처 항목들이었다. `butter`만 seo 8.5.

**1차 출처로 닫은 것:** 한식간장/양조간장 원료 = 한국소비자원 「간장 제품류 안전실태조사」(2020-12, `clik.nanet.go.kr` PDF, 식품유형 정의표 + 한식간장 "콩과 소금, 물" · 양조간장 "대두, 탈지대두, 소맥") · 당면 = 오뚜기 공식 칼럼(`otoki.com/pr/column-detail?idx=14`, 옛날당면 100% 고구마전분 · 녹두당면 감자+녹두 전분) · 포카칩 어니언 `밀` = **오리지널과 같은 오리온 페이지**에 둘 다 있다. 법령 개정 stamp·GIG 수정일(2021-02). 재롤이 새로 잡은 것도 반영: `labels` **귀리 누락**(무 글루텐 조항엔 있는데 본문엔 0회), `phrases` 빵집 **공용 오븐·집게·분진**, `butter` 변경이력을 글 끝으로(첫 107단어를 막고 있었다).
⚠️ **못 찾은 것:** 카레 루 원재료 — 오뚜기몰도 이미지로만 싣는다(minor로 둠). **쌀빵 재라벨 일화** — 메일에 쌀비 「글루텐프리 쌀식빵」 3-15·4-14 두 번 주문(이름 동일) · 담뿍빵집 4-01. **어느 판매처가 이름을 바꿨는지 기록이 말해주지 않아** 붙이지 않았다.

| 글 | 8-27 | 9-27 |
|---|---|---|
| `hidden-gluten` | 9.5 / 9 ❌ | **10 / 9.5** ✅ |
| `celiac` | 9.5 / 9.5 | **10 / 9.5** ✅ |
| `butter-tteok` | 8.5 / 9.5 ❌ | 9 → **9.5 / 9.5** ✅ (2롤) |
| `snacks` | 10 / 9.5 | 해시 일치 — 재채점 안 함 ✅ |
| `phrases` | 9.5 / 9 ❌ | 9.5 / **9** ❌ — major 0, minor 4 |
| `labels` | 9.5 / 9 ❌ | **9** / 9.5 ❌ — 축이 뒤집혔다(experience major: 쌀과자 일화에 제품·점포·월 없음) |

**▶ 남은 2편:** 롤마다 떨어지는 축이 바뀐다 = 마진 0(판사 운영지식 ⑩). 싼 것부터: `phrases` minor — 간장 자료가 6년 전임을 본문에 명시 · "로마자 시도 시 직원이 못 알아듣는다"류 일반화에 관찰 표시. `labels`의 experience major는 **쌀과자 일화**라 운영자 판단(편의점 구매라 결제 기록이 가게명만 준다 → 제품 특정 불가 → 규칙 문장화가 방침이지만 1인칭 신호가 더 줄 수 있다).
🔴 **운영자 확인 필요 — `butter-tteok` 일화와 기록이 어긋난다:** 본문 *"Every cafe we've bought this from … same counters, same trays"*·"카운터에서 산 6,000원"인데 9-05에 회수된 기록은 **배달의민족 배달 4건(2026-05~07)뿐**이다. 판사 major도 여기(카페명·동네·월). 매장 방문 구매가 실제로 있었는지 Ki 답이 먼저.

**9-28 추가 (운영자 답):** ①push ✅ `173db6e` 배포 success. ②`butter-tteok` — **매장 구매도 있었다**(Ki 확인) → "same counters, same trays" 문장은 사실, 유지. 배민 4건과 병행. ③`labels` 쌀과자 일화 — **기억 없음** → 방침대로 규칙 문장으로 교체. 이어 재롤이 잡은 **포카칩 오리지널 공유 라인 경고**(같은 브랜드가 밀 맛을 만든다 → 같은 제조시설 줄 확인) · 양조간장 카테고리에 소비자원 출처 추가. `labels` 판정 2롤 = 9.5/9 → **9/9.5** (major 0, minor만) — 여기서 멈춤. 남은 싼 것: 변경이력을 글 끝으로(butter 는 이걸로 통과) · FAQ 1 길이(~200단어) · '국제 기준' Codex 출처.

🔴 **Harness Eval 이 9-07 부터 5연속 실패였다 — HANDOFF 는 "CI 🟢"라고 적고 있었다.** `content-001`(발행글 전부 현재 해시 PASS 판정) 게이트. 9-07 해시 불일치로 시작 → 지금은 `phrases`·`labels` FAIL + **`restaurants-seoul` 이 FAIL(9.5/7)인 채 운영자 결정으로 발행**돼 있어 **두 편이 PASS 해도 계속 빨갛다.** Deploy 는 별개 워크플로라 막지 않는다(= 빨간 게 일상이 되면 진짜 회귀를 못 본다). ▶ **운영자 설계 판단:** (a)운영자 승인 발행을 게이트가 인정하는 override 기록 도입 (b)NCGS 방법론 해결 전까지 restaurants-seoul 제외 (c)그대로 둠.

### ✅ 9-28 오후 — content-001 게이트 복구 (운영자 승인 (a)안)
- **`eval/gate-overrides.json` 신설** — FAIL 판정을 운영자가 승인해 발행한 경우만, **판정 해시 = 현재 글 해시 = 예외 해시**일 때 통과. 판정 기록은 손대지 않는다(FAIL·findings 그대로). 통과 시 `OVERRIDE:` 줄이 매번 찍힌다. 음성 테스트 3종(해시 불일치·사유 공란·글 1바이트 수정) 전부 막힘 확인. DECISIONS 2026-09-28.
- 첫 적용 = `restaurants-seoul`(9.5/7, NCGS 방법론 major — 별건으로 열려 있음).
- `phrases` **9.5/9.5 PASS**(로마자 일반화에 관찰 표시 · 간장 자료 2020년 명시) · `labels` **9.5/9.5 PASS**(변경이력 글 끝으로). → **발행 7편 = 판정 PASS 6 + 운영자 예외 1.**
- ⚠️ 로컬 `freshness`는 여전히 빨갛다(8-25부터의 선재 이슈, CI에선 통과) — 이번 범위 밖.

### ✅ 9-29 — 매장 페이지 두껍게: 구조 + 샘플 1곳 (모닐이네)
- 새 필드 `visits`·`details`(+`_ko`) → "What we found" 섹션 · **발행글이 `/place/<slug>` 로 링크한 글 자동 목록**("Featured in our guides", 8곳 즉시 적용) · 잠자던 `verified:"visited"` 배지 첫 점등. DECISIONS 9-29.
- 🔑 **`details` 는 이미 발행·판정된 문장만** 옮긴다(모닐이네 6줄 = restaurants·celiac·hidden·butter 에서). 확인된 게 없는 매장은 섹션을 비운다.
- 🔑 **방문 월은 파일 날짜로 못 뽑는다** — `mdls` 생성일은 복사일이다(쿠촐로 파일 2026-03 vs 실제 2025-07). 방문 월 정본 = restaurants-seoul 글(사진첩 GPS 기준).
- 🔴 모닐이네 `note_ko` 가 "…내부에서  ." 로 잘려 라이브에 나가 있었다 → 수정(`f1dd469`). 24곳 전수 검사 1건.
- ⚠️ **x-ake·FEEKE·Vegetus 사진 5장씩은 네이버에서 내려받은 것**(`025bda0`) — 우리 사진 아님, 저작권. 운영자 판단 대기(급하지 않음).
- 📅 **10-04(일) 13:30 쿠촐로 재방문(Ki·아내)** — NGK 캘린더에 체크리스트(GF 면 재료·따로 삶는지·생선 밀가루·메뉴판/영수증 직촬). 다녀오면 사진·메모로 쿠촐로 "What we found" + restaurants 단락(재채점) + IG 초안. **메뉴판·와인셀러·프라이빗룸 사진은 네이버 것 → 직촬로 교체.** 그 전엔 쿠촐로 확장 보류.
- ▶ 다음: 방문 월 확인된 곳부터 확장 — cucciolo(2025-07) · grain(2026-01·03) · 6day(2025-11) · ssal-tongdak(월 미기록). 문장 원천 = restaurants-seoul 해당 단락.
- ⚠️ 로컬 스크린샷: `npx playwright screenshot` 은 캐시 브라우저 버전 불일치로 실패 → `chromium_headless_shell-1217` 을 `executablePath` 로 지정하면 된다.

**▶ 순서 (운영자 승인 9-27):** ①정리 ✅ → ②FAIL 4편 ✅(4→0, 9-28) → ③매장페이지 두껍게 / 베이커리 스텁. ⏸️ **고추장 레시피 = 보류**(9-28 Ki: *"너무 막막하다"*) — 다시 꺼내지 말고 Ki 가 열 때까지 둔다.

## 📌 열린 항목 (2026-10-06 아카이브에서 승계 — 원문·근거는 `docs/archive/HANDOFF-2026-07-to-09.md`)

**SEO·수익**
- 🔴 **매장 상세 24곳 = `noindex, follow` + sitemap 제외 상태**(8-18, AdSense "low value" 대응 — 색인 37p 중 24p가 템플릿 반복물이었다). **고유 콘텐츠가 충분해지면 둘 다 되돌린다**(코드 주석에 사유). 9-29 "What we found" 보강이 그 경로다 → 몇 곳이 채워지면 매장별로 index 복원을 판단.
- AdSense 재심사(8-18 신청) 결과 미기록. 재반려 시 남은 원인 = 발행 글 절대량.
- AI 노출 검증 대기(8-25 robots 개방): ChatGPT·Perplexity 직접 질의 + GA4 "AI Assistant" 추이. ⚠️ `Google-Extended` 차단이 AI Overviews 에 영향 주는지 1차 확인 실패 — Gemini 노출을 목표로 하면 이 줄부터.
- 스텁 2편: `korean-bbq-gluten-free-guide`(118w) · `gluten-free-bakeries-cafes-seoul`(126w). 보류 = 커머셜 인텐트 글 `gluten free korean pantry`(`~/.claude/plans/1-frolicking-starlight.md`).

**매장 데이터**
- 영업 점검 잔여(8-21): 인스타 없는 8곳(237·blu-seoul·benir·francois·dark-and-light·rami-scone·6day-chicken·cucciolo)은 전화 확인 → `verified: "called"`. glunic·los-dias 는 `business_discovery` 조회 실패(⚠️ 폐업 신호 아님). 매장 IG 휴면(>60일) 알림 자동화 미착수.
- sunny-bread 복원 조건 = 상수/용산 동일 매장 여부 + GF 취급 확인(방문·전화).
- ⚠️ x-ake·FEEKE·Vegetus 사진 = 네이버 다운로드(`025bda0`) — 우리 사진 아님. **8-18 IG 메모의 "X-AKE 커버 후보"도 이 네이버 사진이다** → 게시 전 판단 필요.

**콘텐츠 잔여**
- 판사 반론 미해결(8-27): 로마자 제거 → 핵심 **용어**(밀떡 등)의 검색·발화 가능성. 운영자 방침 우선이라 유지 중(memory `feedback_show_dont_pronounce`).
- butter-tteok `<!-- IMG -->` 슬롯 비어 있음(사진 대기). 글별 minor 는 `eval/judgments/<slug>.json` findings 가 정본.
- 운영자 확인 대기: Cafe Lab 통화(2025 여름) 미사용 소재.

**인스타**
- 다음 게시는 커버 큐레이션부터(절차 = 아카이브 8-18 「📸」: 전수 육안 확인 → 1080 cover → 크롭 확인 → 운영자 승인 → 게시). 캡션 도시 태그 버그는 고쳤으나 **평택 건은 서울 태그로 이미 게시됨(4/8)**.
- `DdAXUWUCYBL` 해시태그 누락 — Ki 가 앱에서.

## 현재 상태

- **마지막 업데이트:** 2026-10-06 06:46
- **작업자:** Claude Code
- **마지막 커밋:** `c373db1` chore: HANDOFF 463→131줄 아카이브 · eval-runner 실패 사유·OVERRIDE 출력
- **브랜치:** main
- **CI:** 🔴 **Harness Eval 9-07부터 연속 실패**(`content-001` — 상단 9-28 참조) · Deploy 🟢. ~~🟢 GitHub Actions 전원 success(`89cefc4`)~~ = 8-25 기록. ⚠️ 단 **로컬 `eval-runner`는 7/8** — `harness-001` freshness가 선재 이슈로 빨갛고, **CI는 임계값 5.0 회귀 판정이라 이걸 잡지 않는다**. 이전 기록 8/8 — content-001 포함 전원 녹색 (5편 PASS). baseline 갱신됨(`content-001,1,1`), 이제부터 회귀 감지가 실제로 작동한다
- **✅ 이미지 79/79 resolve** (`node scripts/check-images.mjs live`, 08-20 확인) — "알려진 이슈"에 남아 있던 **cafe-pepper 404 4건은 08-07 `c53196b`로 이미 해소된 스테일 항목**이었다(원인은 `build_places`가 `.jpg` 원본까지 스캔해 없는 Cloudinary id를 만든 것, 83→79 참조). 목록에서 제거함. "IG 토큰 만료 추정"도 08-12 재인증(2026-11-10까지)으로 해소 → 제거.
- **🔧 post-commit 훅이 두 층에서 고장나 있었다 (08-20 수정)** — ①**명령 매칭**: `grep -q "^git commit"`이 **가장 흔한 `git add … && git commit …` 형태를 통째로 놓쳤다.** 08-07 이후 훅은 사실상 거의 돌지 않았다 → 부분 일치로 완화(오탐 최대 피해 = 필드 세 줄 갱신). ②**앵커 결번**: 세 필드 중 `- **마지막 커밋:**` 라인이 문서에 아예 없어 갱신 대상이 없었다 → 라인 신설. **08-07에 "조용히 exit 0 하지 말고 stderr로 알리게" 고친 설계는 제대로 작동했다 — 실패한 건 알림을 읽는 쪽이었고, 그나마도 ①때문에 경고조차 뜨지 않았다.** ⚠️ 이 훅은 커밋 직후 문서를 고치므로 **워킹트리를 항상 한 스텝 dirty하게 남긴다**(다음 커밋에 딸려가는 것이 정상 동작).
- **⚠️ 빌드 노이즈:** `npm run build`가 `data/places.json`의 `updatedAt` 24건을 빌드 시각으로 갱신한다(내용 무변경). 커밋 전 `git checkout data/places.json`으로 걷어낼 것
- **healthcheck 잔여 경고 1건:** `Data: addressEn — 1 place` = **sunny-bread**. 🔴 이 매장은 주소만 빠진 게 아니라 **상호(우리 데이터 `Sunnyhouse` vs 실제 브랜드 써니브레드)·동네(한남 vs 후암)·영업 상태가 전부 미확인**이다. HappyCow에 `CLOSED: Sunny House`와 `Sunny Bread - Huam`이 별도로 존재 = 이전 정황. 공식 사이트는 네이버 modoo 서비스 종료(2025-06-26)로 소멸, 네이버 플레이스·HappyCow는 봇 차단 → 웹으로는 확정 불가. **237에 이은 두 번째 상태 불명 매장.** 위키에 게시 금지 표시함. ▶ 운영자 확인 필요
- **🔍 구조적 관찰:** 24개 매장의 **영업 상태를 아무도 검증하지 않는다.** healthcheck는 URL 200만 보고, 매장이 실제로 장사하는지는 안 본다. 한 세션에서 2건(237 휴업·sunny-bread 이전 의심)이 나온 걸 보면 더 있을 가능성이 높다. 24곳 일괄 점검이 필요한 시점
- **참고:** CLAUDE.md의 "next-on-pages 빌드 시 `output: 'export'` 필요" 노트는 현행 next.config.mjs와 불일치(스테일) — 실제 config엔 없음, pages:build 정상 동작 확인됨(08-13)
- **점수 진단(2026-07-24, 별도 전문가 평가):** 웹 5.3/10, PM 4.3/10 — "자산 품질은 7, 운영 규율은 3.5". 갭은 대부분 *이미 시작한 것의 완성*.

## 🎯 북극성 목표 (2026-07-30 설정) — 월 $100+ (6개월 내)

프로젝트 goal = **월 $100+ 수익** (목표 유지, ETA 정직하게 6~9개월). 여행자·집밥 균형. **병목=트래픽**(~10 PV/day). **로드맵 v2 = 3-에이전트 평가(전략·PM·적대적 회의론)로 6.5~7.0→전원 9.5/10까지 개선.** 전체: `~/.claude/plans/noble-discovering-aho.md` "💰 목표: 월 $100" 섹션. 메모리: `project_goal_100_month`.
- **핵심 전략(v2):** ① $100은 **stretch(P25~P35)**, 6개월 성공=P50 $40~70+수익 증명(이탈 방지 재정의). ② **AdSense 분리**(재반려 가정, upside only). ③ 여행 **보험(SafetyWing/Genki) 리드 채널**($10~25, 셀리악 fit) > 호텔 > eSIM. ④ 제품은 **iHerb(5~10%)+쿠팡**, **Amazon 보류**(180일 3판매 종료 규칙). ⑤ **M3 결정 게이트**(오가닉 ≥50/day·인덱싱 ≥8·클릭볼륨 → Plan B 분기). ⑥ **비-SEO 헤지**(Pinterest·이메일·IG, 콘텐츠 세션에 얹어 무추가 시간). ⑦ 커머셜 인텐트 글(best eSIM·pantry kit·GF hotels).
- ✅ **쿠팡 4개 링크 `rel="sponsored"` 추가** (07-30, M1 위생) — `app/guide/page.js`.
- ✅ **`AffiliateBox` 컴포넌트 신설 + 쿠팡 클릭 추적** (07-31, M1) — `app/components/AffiliateBox.js`(client, rel=sponsored·이중언어·고지·`trackEvent(link_type:affiliate)`). /guide 쿠팡 블록을 이 컴포넌트로 리팩터 → **기존엔 추적 0이던 제휴 클릭이 이제 GA4로 측정**(KPI 공백 해소). iHerb/SafetyWing/Airalo 링크는 이 패턴에 items만 추가하면 됨.
- **수익화 다음(제가 가능):** 이메일 opt-in(서비스 선택 필요 — Buttondown/ConvertKit 무료). **운영자 필요(가입):** SafetyWing/Genki·Airalo·iHerb → 링크/ID 주면 AffiliateBox items로 삽입. **최우선은 여전히 콘텐츠(트래픽).**

## 미완료 / 다음에 할 작업 (P1 리밸런싱 — 요리·식재료 우선)

목표 운영 모델: **주 4~6시간, 주 1회 90분 세션 = 배포된 1개 산출물.** 절대 커밋/push 없이 세션 종료 금지.

| 우선순위 | 작업 | 비고 |
|----------|------|------|
| 1 | **#2 레스토랑 초안 재프레이밍 발행** ("personally tested" 제거 → curated/티어) + **237 폐업/이전 확인 후 데이터 정리** | 초안은 `content/blog/gluten-free-restaurants-seoul.md`(현 upcoming) |
| 2 | 요리/식재료 스텁 완성 (주 1편): ~~reading-korean-food-labels~~ ✅(07-30) · ~~convenience-store-snacks~~ ✅(07-31) → **다음: gochujang(이모님 레시피 확보 후) 또는 커머셜 인텐트 글**(best eSIM·pantry kit) | 위키 `concepts/`로 write-ready |
| 3 | **`/shop` 도구 연결** (P2→승격, 반나절): CU 가이드 플래그십 + HACCP 보조, disclaimer 전면, 이미지 hotlink 처리 | 컴포넌트 이미 완성 |
| ~~4~~ | ~~이모님 수제 고추장 레시피 캡처~~ ⏸️ **보류(9-28 Ki)** — 막막하다. Ki 가 열 때까지 제안 목록에서 뺀다 | #9 |
| 5 | 포지셔닝 재구성 — 홈/nav ✅완료(07-29). **잔여: About 카피 3축 리프레이밍**, IG 토큰 갱신+백로그, 커뮤니티 시딩 | 콘텐츠 쌓인 뒤 |
| ~~6~~ | ~~배포 후 PSI 모바일 재측정~~ ✅완료(07-29): LCP 9.4→1.7s, orange→green (위 참조) | — |

## P2 (트래픽 100 PV/day 도달 후 — park)

- GF 제품검색 `/products` (11MB 데이터 슬리밍 후) — crown jewel, 지금은 커밋만 됨/미연결
- 인텐트 기반 수익화(제휴)로 AdSense 대체. AdSense는 Auto Ads 켜둔 채 KPI를 인덱싱 페이지·오가닉 세션으로.

## 알려진 이슈

- About 페이지: EN 개인 서사 있음, KO 미번역 (3편 발행 후 선별 번역 예정)
- 🔸 **`<title>` 접미사 중복** — `layout.js` 템플릿의 ` | Gluten-Free Korea`가 붙어 글 제목이 77자로 SERP 잘림 + "Gluten-Free" 중복. 사이트 전역, 발행 차단은 아님 (평가자 지적).
- 🔸 **블로그 글에 이미지 0** — 스낵/라벨 글은 실사 있으면 스니펫·신뢰도 상승 (버터떡 사진과 함께 처리)

## 컨텍스트 노트

- 매장 24개, 위키 50페이지, 인스타 9건 게시(04-21 중단)
- push = 자동 배포 (`.github/workflows/deploy.yml` → Cloudflare Pages `noglutenkorea`)
- 도메인 noglutenkorea.com (구 gluten-free-korea.pages.dev 폐기)
- 재개 전략·개선안·평가: `~/.claude/plans/noble-discovering-aho.md`
- 블로그 9편 시리즈 계획: `NoGlutenKorea/operations/블로그 시리즈 계획.md` (단어 수 목표 1,200~1,500으로 하향)
