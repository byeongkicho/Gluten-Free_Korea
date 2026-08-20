# HANDOFF.md — 세션 간 컨텍스트 전달 문서

> 운영(콘텐츠·성장·인스타) SSOT는 `NoGlutenKorea/operations/` — 특히 `현황.md`(Now 대시보드).
> 이 문서는 세션 시작 시 "지금 어디까지 됐고 다음이 뭔지"만 빠르게 전달한다.
> 재개 전략 전체: `~/.claude/plans/noble-discovering-aho.md` (2026-07-24 승인).

## ▶ 다음 세션 시작점 (2026-08-18 종료 시점)

**🟢 게이트 5/5 전원 녹색 — `check:harness judgments` OK, eval-runner 8/8, baseline `content-001` 0,1 → 1,1 갱신 완료(`c604003`).** 5편 전부 seo·정확성 양축 9.5+ 통과. ⚠️ **루브릭을 낮추지 말 것** — 이번에도 출구는 글 수정→재채점뿐이었다.

| 글 | 전 | 후 | 라운드 |
|---|---|---|---|
| labels | 8 / 5.5 | **9.5 / 10** | 3 (중간에 정확성 9→ 재하락 후 복구) |
| hidden-gluten | 7.5 / 5.5 | **10 / 9.5** | 3 |
| butter-tteok | 6 / 7 | **9.5 / 9.5** | 3 |

**▶ 남은 백로그 (게이트 불요, 다음 개정 때):**
1. **experience 축이 3편 모두 2/3에 묶여 있다 — 유일하게 남은 구조적 갭이고 전부 운영자 입력이 필요하다.** ⓐ labels: "쌀과자" 실패담의 제품명·매장·시점 ⓑ butter-tteok: 6,000원 영수증의 **카페 이름과 시점** + 밀가루 브랜드·몰드 크기·실패담 ⓒ hidden-gluten: 237 폐업 시점, 온라인 빵 재라벨 사건 날짜·판매처
2. **butter-tteok `<!-- IMG -->` 슬롯 여전히 비어 있음** — 판사가 "시각 트렌드 글에 이미지 0"을 minor로 지적. 사진 오면 삽입
3. hidden-gluten: 타마리 실제 제품명(운영자), FAQ 답변 길이(80~120단어 → rich result 잘림), 2차 목록(어묵·카레루·소시지) 출처 표시
4. snacks·celiac: MFDS 고시 번호(제2025-60호)를 이 둘에도 반영하면 일관성 완성. 단 건드리면 재채점 필요 — 지금은 PASS 상태
5. snacks 소주 출처·오리온 URL 트림, celiac 잔여 advisory(집간장 용어 본문 미등장, 오프너 4개 과다, FAQ-본문 중복)

**💰 AdSense 재심사 신청됨 (08-18, `4a1323a`) — 결과 대기:**

- **반려(Low value content) 원인은 분량이 아니라 구성이었다.** 색인 37p 중 **24p(65%)가 매장 상세**(각 225~280단어)인데 그 안의 매장 고유 정보는 Notes 3문장뿐 — 나머지는 ①EN/KO 이중 표기 반복 ②Tips·안전문구·복사용 문장이 24곳 전부 동일 ③네비·푸터. **사이트 색인의 3분의 2가 템플릿 반복물이었다.** 대조: 블로그 6편은 2,591~4,102단어 — 콘텐츠 자체는 두꺼운데 얇은 페이지에 파묻혀 있었다.
- **조치**: 매장 상세 `robots: noindex, follow`(색인에서 빼되 **follow는 유지** — 페이지는 방문자에게 유효하고 링크 가치도 남는다. 7월 스텁 8편과 같은 방식) + sitemap에서 24곳 제외 → **37p → 16p**. 디렉터리 진입점은 `/places`와 `/area/*` 3개가 맡는다. 잃는 트래픽은 GA4 기준 7일 6PV로 미미. **매장별 고유 콘텐츠가 충분해지면 둘 다 되돌린다**(코드에 사유 주석).
- **`/terms`·`/contact` 신설** — 둘 다 **404였다.** 셀리악 사이트라 의료 면책을 명시(의료 조언 아님·라벨 읽기의 한계·무통보 재조제·제휴 링크 고지·정정 정책). 푸터·sitemap 연결.
- ⚠️ **재반려 가능** — "얇은 페이지 비율"은 해소했지만 **"콘텐츠 절대량"(발행 6편)**이 남았고, 해법은 글 수를 늘리는 것뿐이다. 다음 후보 = `gluten free korean pantry`(아래 "보류된 원래 작업" 참조). 단 신규 발행은 이제 판사 게이트를 실제로 통과해야 한다.

**📸 인스타: 휴면 감시 신설(유효) + 🔴 오배포 사고(08-15 게시 → 08-16 삭제):**

- **감시는 유효**: IG 지표 4종이 전부 "발행할 수 있는가"만 물어서, 토큰·데이터접근·API 전부 녹색인 채 4개월 침묵이 아무 데도 안 잡혔다(8/14에 메운 "만료형 알림만 있어 사이트가 죽어도 조용하다"와 같은 계열). → `ngk_instagram_days_since_last_post` + 알림 `ngk-ig-dormant`(>30일, **새 그룹 `ngk-operations`** = 사람이 안 해서 나빠지는 축) 신설, `--apply` 반영.
- 🔴 **사고**: Vegetus를 게시했다가 삭제했다. 첫 장이 **"Christmas 2024 Special Dinner" 세로 배너**였고 1080 정사각으로 잘려 나갔다 — 8월에 2년 전 크리스마스 홍보물이 썸네일. Graph API `DELETE /{media-id}` 동작함(`success:true`), 계정 04-21로 원복.
- 🔴 **원인은 "버그 수정"이었다**: `post-instagram.py`가 cover를 존재 확인 없이 첫 장에 넣던 것을 **"없으면 건너뛴다"로 고친 것**. cover 부재는 결손이 아니라 **"게시 큐레이션 미완" 신호**였고, 안전장치를 제거한 셈이 됐다. **방증**: 게시 9곳 중 8곳 cover 보유 / **미게시 15곳 전무**.
- **교훈**: 이미지 HTTP 200만 보고 **내용을 열어보지 않았다.** 200은 "파일이 있다"이지 "적절한 사진이다"가 아니다. → cover 없으면 **exit 1로 게시 중단**하도록 재수정.
- ✅ **08-18 정상 재개**: FEEKE 캐러셀 4장([`DcKsjcRnZ1N`](https://www.instagram.com/p/DcKsjcRnZ1N/)). 확립된 절차 = ①후보 사진 **전수 육안 확인**(입간판·행사배너·스티커 컷 제거) ②대표 사진 1080×1080 → `places/{slug}/cover` 업로드 ③크롭 결과 확인 ④캐러셀+캡션 미리보기로 **운영자 승인** ⑤게시. `--skip`으로 커버 원본·중복 컷 제외.
- 🔴 **캡션 도시 태그 버그 수정(`52614f9`)**: `generate-caption.mjs`가 `#glutenfreeseoul`을 하드코딩해 **모든 매장에 서울 태그**를 붙이고 있었다. FEEKE(창원)·Cafe Rebirths(평택)도 서울로 나갔다 — **평택 건은 이미 그 상태로 게시됨(4/8)**. 이제 location/주소에서 도시를 뽑는다.
- ▶ **다음 게시는 커버 큐레이션부터.** cover 보유 9곳은 전부 게시 완료, 미게시 14곳은 전무. 후보 = X-AKE(02 딸기초코 단면·01 6조각이 커버감) · Francois(어두운 실내라 피드 톤 어긋남) · Rami Scone(3장 중 **03은 입간판 — 커버 불가**). 상세 = 위키 `operations/인스타그램 운영.md`.

**📊 GA4 128일 만에 갱신 (08-15):** 최근 7일 = 사용자 17·세션 19·PV 38·체류 85초. 오가닉 10 / 다이렉트 7 / **AI Assistant 2**(신규 유입원). 해외 위주(한국 1명), 모바일 13:데스크톱 4. **M3 게이트(오가닉 ≥50/day)와 갭이 크다.** `npm run ga4`는 `.env` 필요, 리포트는 gitignored.

**🏪 237 Pizza = 영업 상태 미확인 (운영자 확인, 08-15):** 마지막 방문 **2026년 여름**에 리모델링 휴업, 재개 미확인. 공식 사이트 `237pizza.com`도 **HTTP 500 무응답**(08-15 확인), 웹 검색으로도 재개 정보 없음. 조치 = celiac 가이드(매장 섹션 경고 블록·FAQ 2곳·요약 불릿·시제 과거화) + `overrides.json` note/note_ko 경고(매장 상세에 노출) + hidden-gluten 시제. **`website` 필드는 유지**(500이 일시적일 수 있음) — 영구 사망 확인되면 그때 제거. ▶ 다음 방문 때 재개 여부 + GFCO 인증서 실물을 **같이** 확인하면 두 항목이 한 번에 닫힌다.

**🔴 이번에 정정한 실오류 3건 (판사가 잡음 — 전부 배포본에 있던 것):**
- **`같은 제조시설` 문구를 "자율"이라 쓴 것 = 틀림.** 식품등의 표시기준은 지정 알레르기 유발물질의 불가피한 혼입 가능성이 있으면 주의문구를 **"표시하여야 한다"**(의무). 정정 후가 더 정확하고 유용 — 인쇄된 경고는 의무라 실질 정보, 빈칸이 약한 근거인 이유는 ①의무 대상이 밀뿐(보리·호밀 제외) ②"불가피" 판단이 제조사 몫. labels 3곳 + butter-tteok
- **밀떡 — 발행 5편 중 4편에 퍼져 있었다.** hidden-gluten(**blocking**, 4곳) · butter-tteok(글 전체 전제) · celiac(**major**, 떡볶이 항목) · labels/snacks는 무관. 떡볶이 떡에 밀떡이 있고 슈퍼·노점에서 주류다. ⚠️ **celiac은 8/13에 9.5/9.5로 통과했던 글이고, 같은 루브릭·같은 모델이 이번 라운드에 같은 문장을 major로 잡았다** — 게이트 통과는 "결함이 없다"가 아니라 "그 라운드에 걸리지 않았다"는 뜻. 한 글에서 결함을 찾으면 **나머지 글에 같은 패턴이 있는지 grep부터 할 것**(이번엔 그렇게 해서 celiac을 잡았다)
- **No Brand 프리믹스 철회** — 웹 재검증 실패(개별 재료·2봉지 세트만 확인). 237 GFCO와 같은 규율로 투명 철회 + 복원 경로 명시

**🆕 이번에 확보한 출처 (재사용할 것):**
- **MFDS 고시 번호 = 「식품등의 표시기준」 고시 제2025-60호(2025-08-29)**, 공식 페이지 `https://www.mfds.go.kr/brd/m_211/view.do?seq=14917`. 판사는 "조회일"이 아니라 **"어느 버전을 읽었는지"**를 요구한다
- **샘표 양조간장 501 영문 공식** `https://en.sempio.com/product/soysauce/view/598` — 원재료 wheat + 알레르기 "wheat, soybeans". 양조간장=밀 주장의 최상급 앵커
- **GIG 찹쌀 FAQ** `https://gluten.org/faq/is-it-safe-to-include-glutinous-rice-in-a-gluten-free-diet-what-exactly-is-it/` — "glutinous rice is gluten-free despite its name"
- ❌ **못 잡은 것:** ①고추장 제조사 성분 페이지(chungjungone.com `ECONNREFUSED`, CJ더마켓·컬리는 "상세설명 참조") → 단정 대신 "밀 유입 3경로(소맥분·밀쌀·양조간장)를 라벨에서 찾아라"로 우회 ②**한국 무글루텐 표시 기준 20ppm** — 2차 출처 다수 일치하나 법제처가 프레임이라 1차 확인 실패. 잡으면 "저글루텐 vs 무글루텐"을 훨씬 강하게 쓸 수 있는 재료

**판사 운영 지식 (08-15 추가 — 3편 × 3라운드 실측):** ⑦ **시소는 축을 넘나든다.** hidden-gluten은 1R에서 SEO 7.5→10 오르는 동안 정확성이 blocking에 걸렸고, 2R에서 정확성 통과하자 SEO가 10→9로 내려갔다(**1R에서 만점 준 것과 똑같은 description에**). labels도 SEO 9.5 통과 라운드에 정확성이 9.5→9로 떨어졌다. 재롤 노이즈지만 **지적 자체는 대개 타당하므로 고치는 쪽이 이긴다.** ⑧ **판사가 사실관계로 나를 반박하면 웹으로 검증하라** — "같은 제조시설 문구는 의무" 지적이 맞았고, 이미 PASS·배포된 글의 오류였다. ⑨ **정확성을 위한 철회는 SEO expertise를 깎는다**(No Brand 철회 → "소싱 섹션에 제품이 없다" major). 철회할 땐 **검증 가능한 대체 구체성**을 같이 넣을 것. ⑩ 마진 0(19/20)으로 통과한 글은 다음 재롤에서 떨어질 수 있다 — 여유를 만들려면 experience 축이 유일한 남은 레버이고 그건 운영자 입력이다.

**판사 운영 지식 (08-13 실측, celiac 4라운드로 확장):** ① **양 축 모두 재롤** — celiac은 SEO 9→10 오르는 동안 정확성 9.5→9→8.5 시소. minor까지 다 잡고 돌려도 새 눈이 새 걸 잡는다 — 4라운드까지는 정상 범위. ② **수정이 major를 만들 수 있다** — SEO 보호용으로 넣은 Tier 1 "nothing to interrogate" 문장이 정확성 major(절대 안전 보증)로 돌아옴. **안전 프레이밍 문장은 항상 "관찰한 것+관찰자+한계" 형태로.** ③ **판사 실행 중 글 수정 금지**(해시 기록). ④ 발행일 이후 인용 날짜는 "Updated August 2026" 본문 라인으로 해소. ⑤ 오리온처럼 제조사 페이지가 맛별 알레르기를 한 페이지에 명시하면 flavor trap 최상급 출처. ⑥ ⚠️ **루브릭 스테일**: `prompts/judge-seo-eeat.rubric.json:18`이 옛 접미사 ` | Gluten-Free Korea`(+20자)를 하드코딩 — 실제는 +18자. 고치려면 버전 bump가 필요하고 그러면 기존 PASS 기록 2건이 "v1로 채점됨" 빨강이 됨 → **당분간 제목을 40자 이하로 잡으면 양쪽 다 만족**(스테일 가정이 보수적 마진일 뿐). 다음 루브릭 개정 사유가 생기면 그때 배치로 정정+전체 재채점.

**운영자 액션 (다음 방문·확인 때):** ① **237 Pizza GFCO 인증** — 웹 재검증 실패로 글에서 주장 철회함(철회 사실도 글에 투명 기록). 매장에서 인증서 실물 확인되면 사진 찍어 복원 가능. ② hidden-gluten용 **실사용 GF 간장·고추장 제품명**, butter-tteok용 **No Brand 프리믹스** 확인. ③ Cafe Lab 통화(2025 여름, 해외판 GF·한국판 미확인)는 아직 어느 글에도 안 실림 — 쓸 곳 생기면 사용.

수정 후 재채점: `npm run judge -- <slug>` — 크레딧 없으면 **자동으로 claude CLI 백엔드**(구독 과금, `--backend` 플래그 참조). 글을 고치면 해시 불일치로 content-001이 알아서 빨개지므로 재채점 전까지 게이트가 거짓말하지 않는다.

**보류된 원래 작업:** 커머셜 인텐트 글 #1(`~/.claude/plans/1-frolicking-starlight.md`). 키워드 게이트에서 멈춰 있고, 리서치 결과 계획서의 두 후보가 모두 SERP상 부적합했다(`where to buy…`는 확립 도메인 지배, `gluten free soy sauce korea`는 상위 10 중 8개가 상품 페이지). 제3 후보 `gluten free korean pantry`가 유망 — 상위가 전부 "해외 H마트" 관점이라 **한국 현지·한국어 라벨 각도가 비어 있다.** 단, 신규 발행은 이제 게이트를 실제로 통과해야 한다.

## 완료 (2026-08-14) — 알림 3룰 추가 · SLO 문서 · 프로비저닝 스크립트화

> ⚠️ 이 작업은 **career 세션**이 했다(엘리스 인프라 직군 지원 준비로 관측성 요건을 채우는 과정). 콘텐츠·판사 게이트 쪽은 건드리지 않았다.

- 🔴 **구멍이었던 것**: 기존 알림 2룰이 **둘 다 "만료 임박"형**(SSL·인스타)이라 **사이트가 죽어도 알림이 오지 않았다.** 관측은 되는데 통보가 없던 상태.
- **신규 3룰** (`ngk-health` 그룹, 평가주기 300s):
  - `ngk-http-down` — `ngk_http_up < 1`, 엔드포인트별 개별 인스턴스
  - `ngk-http-slow` — 응답 > 1s (관측 최대 558ms의 약 2배)
  - `ngk-healthcheck-stale` — 마지막 수집 후 > 6h. **이 룰만 `noDataState: Alerting`**
- **설계 원칙**: "서비스가 죽은 것"과 "지표가 안 오는 것"을 다른 룰로 분리. 앞의 둘은 `noDataState: OK`(러너 지연을 장애로 오인하면 오탐만 쌓임), staleness만 Alerting(데이터 없음이 곧 감시 대상). 사이트가 실제로 죽으면 healthcheck가 `ngk_http_up 0`을 **보고**하므로 NoData가 아니라 값 0으로 잡힌다.
- 🔬 **발화 테스트 완료** — 임계 임시 하향(1→0.01) → 7 엔드포인트 전부 firing → 원복 → 전 룰 inactive 복귀. 메일 수신 경로(`ngk-email`) 정상 확인.
- 🆕 `docs/SLO.md` — 30일 가용성 **99.5%**(버짓 3h36m). **한계 명시**: 시간당 수집 + 러너 지연으로 24h에 19~20샘플만 도착 → 1시간 미만 장애는 놓치고, 99.9%는 판정 자체가 불가능. 첫 버짓 판정 ≈9/12.
- 🆕 대시보드 **에러버짓 잔량(30d) 패널** 추가 → version 2.
- 🆕 **프로비저닝 스크립트 2종** — `scripts/provision-alerts.mjs`, `scripts/provision-dashboard.mjs`. 둘 다 **dry-run이 기본**, `--apply`로 반영. 파일이 정본이고 인스턴스에만 있는 룰·패널은 **자동 삭제하지 않고 경고만** 한다. 임계값 근거는 `grafana-alerts.json`의 `_thresholds` 블록에 함께 기록(숫자만 남으면 6개월 뒤 아무도 이유를 모른다).
- 🔑 **`.env.local`에 `GRAFANA_PROVISION_TOKEN` 추가됨**(Editor). 기존 `GRAFANA_QUERY_TOKEN`은 Viewer라 쓰기가 403이다. ⚠️ 토큰 생성 시 역할 기본값이 `No basic role`이라 **Editor를 명시 선택**해야 한다.
- **남은 것**: 로그축(Loki) 미도입 — 현재 메트릭·알림 2축.

## 완료 (2026-08-13) — 관측성 24h 확인 + 다운샘플 날짜 경계 버그 수정

- **24h 연속성 ✅**: 매시간 healthcheck 야간 무중단(전부 success — GitHub cron 지연으로 새벽 1회 스킵은 정상 범위), Grafana push 34 샘플 정상.
- **버그 발견·수정(`9a07936`)**: 23:50 KST 다운샘플 cron이 50분 밀려 00:40 KST에 실행 → "지금 기준 오늘"로 날짜를 정하던 로직이 8/12 요약을 8/13 행으로 흘림. 행 날짜를 **report.timestamp − 6h의 KST 날짜**로 변경(00~06시 관측 = 전날 밤 지연분 → 전날 귀속). CSV 복구: 조기 8/13 행을 fold 규칙 그대로 8/12에 병합(runs 7→8).
- 다음: SLO 문서+장애회고(career 9/14 게이트 — IG -44일 사례 + 이 경계 버그가 둘 다 소재), daily-summary의 Grafana 24h 집계 전환, **11월 초 IG 재인증**.
- **🆕 Grafana 직접 조회 가능 (08-13 오후, `4005ca2`)**: `node scripts/grafana-query.mjs status|continuity|slo|--expr` — Viewer service account 토큰(`.env.local`의 `GRAFANA_QUERY_TOKEN`, gitignored). 연속성 확인이 gh run list 추정에서 실측으로 바뀜(첫 실측: 24h 샘플 20/24, cron 지연 탓·가용률 100%). slo 프리셋이 9/14 SLO 문서의 데이터 소스. ⚠️ 토큰 role 기본값 "No basic role" 함정 — Viewer 명시 선택. 무료 플랜 전제 유지(트라이얼 Pro 기능 위에 아무것도 안 만듦).

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

- **마지막 업데이트:** 2026-08-20 11:22
- **작업자:** Claude Code
- **마지막 커밋:** `f820cf5` fix(hooks): post-commit이 `git add && git commit`을 놓치고 있었다
- **브랜치:** main
- **CI:** 🟢 **eval-runner 8/8** — content-001 포함 전원 녹색 (5편 PASS). baseline 갱신됨(`content-001,1,1`), 이제부터 회귀 감지가 실제로 작동한다
- **✅ 이미지 79/79 resolve** (`node scripts/check-images.mjs live`, 08-20 확인) — "알려진 이슈"에 남아 있던 **cafe-pepper 404 4건은 08-07 `c53196b`로 이미 해소된 스테일 항목**이었다(원인은 `build_places`가 `.jpg` 원본까지 스캔해 없는 Cloudinary id를 만든 것, 83→79 참조). 목록에서 제거함. "IG 토큰 만료 추정"도 08-12 재인증(2026-11-10까지)으로 해소 → 제거.
- **🔧 post-commit 훅이 두 층에서 고장나 있었다 (08-20 수정)** — ①**명령 매칭**: `grep -q "^git commit"`이 **가장 흔한 `git add … && git commit …` 형태를 통째로 놓쳤다.** 08-07 이후 훅은 사실상 거의 돌지 않았다 → 부분 일치로 완화(오탐 최대 피해 = 필드 세 줄 갱신). ②**앵커 결번**: 세 필드 중 `- **마지막 커밋:**` 라인이 문서에 아예 없어 갱신 대상이 없었다 → 라인 신설. **08-07에 "조용히 exit 0 하지 말고 stderr로 알리게" 고친 설계는 제대로 작동했다 — 실패한 건 알림을 읽는 쪽이었고, 그나마도 ①때문에 경고조차 뜨지 않았다.** ⚠️ 이 훅은 커밋 직후 문서를 고치므로 **워킹트리를 항상 한 스텝 dirty하게 남긴다**(다음 커밋에 딸려가는 것이 정상 동작).
- **⚠️ 빌드 노이즈:** `npm run build`가 `data/places.json`의 `updatedAt` 24건을 빌드 시각으로 갱신한다(내용 무변경). 커밋 전 `git checkout data/places.json`으로 걷어낼 것
- **healthcheck 잔여 경고 1건:** `Data: addressEn — 1 place` = **sunny-bread**. 🔴 이 매장은 주소만 빠진 게 아니라 **상호(우리 데이터 `Sunnyhouse` vs 실제 브랜드 써니브레드)·동네(한남 vs 후암)·영업 상태가 전부 미확인**이다. HappyCow에 `CLOSED: Sunny House`와 `Sunny Bread - Huam`이 별도로 존재 = 이전 정황. 공식 사이트는 네이버 modoo 서비스 종료(2025-06-26)로 소멸, 네이버 플레이스·HappyCow는 봇 차단 → 웹으로는 확정 불가. **237에 이은 두 번째 상태 불명 매장.** 위키에 게시 금지 표시함. ▶ 운영자 확인 필요
- **🔍 구조적 관찰:** 24개 매장의 **영업 상태를 아무도 검증하지 않는다.** healthcheck는 URL 200만 보고, 매장이 실제로 장사하는지는 안 본다. 한 세션에서 2건(237 휴업·sunny-bread 이전 의심)이 나온 걸 보면 더 있을 가능성이 높다. 24곳 일괄 점검이 필요한 시점
- **참고:** CLAUDE.md의 "next-on-pages 빌드 시 `output: 'export'` 필요" 노트는 현행 next.config.mjs와 불일치(스테일) — 실제 config엔 없음, pages:build 정상 동작 확인됨(08-13)
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

- About 페이지: EN 개인 서사 있음, KO 미번역 (3편 발행 후 선별 번역 예정)
- 🔸 **`<title>` 접미사 중복** — `layout.js` 템플릿의 ` | Gluten-Free Korea`가 붙어 글 제목이 77자로 SERP 잘림 + "Gluten-Free" 중복. 사이트 전역, 발행 차단은 아님 (평가자 지적).
- 🔸 **블로그 글에 이미지 0** — 스낵/라벨 글은 실사 있으면 스니펫·신뢰도 상승 (버터떡 사진과 함께 처리)

## 컨텍스트 노트

- 매장 24개, 위키 50페이지, 인스타 9건 게시(04-21 중단)
- push = 자동 배포 (`.github/workflows/deploy.yml` → Cloudflare Pages `noglutenkorea`)
- 도메인 noglutenkorea.com (구 gluten-free-korea.pages.dev 폐기)
- 재개 전략·개선안·평가: `~/.claude/plans/noble-discovering-aho.md`
- 블로그 9편 시리즈 계획: `NoGlutenKorea/operations/블로그 시리즈 계획.md` (단어 수 목표 1,200~1,500으로 하향)
