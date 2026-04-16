# HANDOFF.md — 세션 간 컨텍스트 전달 문서

> 세션이 끝나거나 컨텍스트가 차기 전에 이 파일을 업데이트합니다.
> 다음 에이전트(또는 다음 세션의 자신)가 문맥을 잃지 않고 이어갈 수 있도록.

## 현재 상태

- **마지막 업데이트:** 2026-04-16
- **작업자:** Claude Code
- **브랜치:** main

## 완료된 작업

| # | 작업 | 커밋 | 검증 |
|---|------|------|------|
| 1 | 위키 캡션 파이프라인 + 모니터링 | `e4b361e` | ✅ |
| 2 | 프론트엔드 UX 개선 (a11y, 터치, 오버레이) | `8c3619c` | ✅ |
| 3 | cafe pepper + benir 인스타 게시 | — | ✅ |
| 4 | GF 레벨 필터 + Dedicated GF 보정 | `eadc243` | ✅ |
| 5 | 3단계 검증 시스템 (Visited/Called/Unverified) | 미커밋 | ✅ 코드 완료 |
| 6 | 가이드 쇼핑 섹션 + 일러스트 2개 | 미커밋 | ✅ 코드 완료 |
| 7 | 공공API 활용 계획 (위키) | 미커밋 | ✅ |

## 미완료 / 다음에 할 작업

| 우선순위 | 작업 | 선행 조건 |
|----------|------|-----------|
| 1 | Cloudflare 배포 (프론트엔드 전체 반영) | 커밋 + 푸시 후 |
| 2 | 공공데이터포털 API 키 발급 (data.go.kr) | 가입만 하면 됨 |
| 3 | HACCP API → GF 안전 제품 목록 프로토타입 | API 키 |
| 4 | 커뮤니티 포스팅 (Reddit/Facebook) | 초안 수정 후 |
| 5 | feeke, sisemdal-atelier, x-ake, jihwaja 등 전화 확인 | 없음 |
| 6 | 쌀통닭, CUCCIOLO, 프랑스와 인스타 게시 | 사진 확보 |
| 7 | 라벨 실사 사진 추가 (편의점 제품 촬영) | 직접 촬영 |

## 알려진 이슈

- AdSense Auto Ads: 트래픽 부족으로 광고 미노출
- Instagram 토큰 만료: ~2026-05-30
- GitHub Secrets에 INSTAGRAM_TOKEN 미등록

## 컨텍스트 노트

- 매장 24개, 위키 35페이지, 인스타 8건
- HACCP API 키 발급 완료 (.env), 스크립트 작성됨 (미커밋, 보류)
- CU API 탐색: 성분표 미제공으로 보류
- 밀가루 없는 과자 리스트 ingest 완료 (sources/)
- Dedicated GF 확인: 3곳 (237-pizza, cafe-rebirths, monil2-house)
- Visited 17곳 / Unverified 7곳
- 네이버맵 위시리스트 ~84곳 (미등록)
- 공공API(HACCP) → GF 제품 검색기 계획 수립됨

## 파일 변경 요약

```
미커밋: 검증 시스템, 쇼핑 가이드, 공공API 계획, places.json verified 필드
```
