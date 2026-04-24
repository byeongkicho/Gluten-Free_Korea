# HANDOFF.md — 세션 간 컨텍스트 전달 문서

## 현재 상태

- **마지막 업데이트:** 2026-04-24
- **작업자:** Claude Code
- **브랜치:** main

## 완료된 작업 (2026-04-23 ~ 04-24 세션)

| # | 작업 | 검증 |
|---|------|------|
| 1 | 블로그 드래프트 v3 확정 (celiac→NCGS 정정, 한글 주석 영문화, frontmatter 갱신) | ✅ |
| 2 | Wiki Phase 1: 드래프트 → 위키 분산 (신설 5 + 보강 2 + index/log/overview) | ✅ 40 pages |
| 3 | 9편 블로그 시리즈 계획 확정 + operations/블로그 시리즈 계획.md 작성 | ✅ |
| 4 | Google Calendar 이벤트 10개 (NGK 전용 캘린더에 등록, 4/24 ~ 5/26) | ✅ |
| 5 | 상위/위키 CLAUDE.md 규칙 완화 (블로그 교차 작업은 상위 세션 OK) | ✅ |
| 6 | About 페이지 E-E-A-T 보강 (EN) — Ki 실명·NCGS 배경 서사 추가 | ✅ build 통과 |
| 7 | Google Calendar 스타일 가이드 (`~/.claude/calendar-format.md`) — 5개 캘린더 공통 포맷 | ✅ |
| 8 | 캘린더 audit + prefix 적용 ([NGK]/[KIS]/[Career], Family·primary 제외) | ✅ 20 events migrated |

## 미완료 / 다음에 할 작업

| 우선순위 | 작업 | 선행 조건 |
|----------|------|-----------|
| 1 | **블로그 #1 (pillar) 발행 — celiac-travel-korea-guide** | 2026-04-24 10시 캘린더 알림 |
| 2 | 블로그 #2 ~ #9 순차 발행 (주 2회 pace, ~5/24 완성) | #1 발행 후 |
| 3 | AdSense 재심사 제출 | 9편 완성 + sitemap·GSC 확인 (2026-05-26) |
| 4 | 전화 확인 7곳 | 없음 |
| 5 | 인스타 계속 (쌀통닭, CUCCIOLO, 프랑스와) | 사진 확보 |
| 6 | 커뮤니티 포스팅 (Reddit/Facebook) | 블로그 3편 이상 발행 후 |

## 컨텍스트 노트

- 매장 24개, 위키 40페이지 (이번 세션 5 신설), 인스타 8건
- HACCP API 키 발급됨 (.env), 검색기 보류 (데이터 신뢰도)
- push = 자동 배포 (deploy.yml)
- 블로그 드래프트 v3: `raw/blog/gluten-free-guide-seoul-draft.md` (NoGlutenKorea/)
- 9편 시리즈 계획·체크리스트: `operations/블로그 시리즈 계획.md` (NoGlutenKorea/)
- 캘린더 스타일 가이드: `~/.claude/calendar-format.md` (전 5개 캘린더 공통)
- About 페이지: EN 개인 서사 추가됨, KO는 아직 미번역 (3편 발행 후 선별 번역 예정)

## 다음 세션 바로 진입 경로

블로그 #1 pillar 작성 시 재료 조립:
- `NoGlutenKorea/raw/blog/gluten-free-guide-seoul-draft.md` (원형)
- `NoGlutenKorea/concepts/글루텐프리 개요.md`
- `NoGlutenKorea/concepts/한국 외식 가이드.md`
- `NoGlutenKorea/sources/개인 에피소드.md`
