# HANDOFF.md — 세션 간 컨텍스트 전달 문서

> 세션이 끝나거나 컨텍스트가 차기 전에 이 파일을 업데이트합니다.
> 다음 에이전트(또는 다음 세션의 자신)가 문맥을 잃지 않고 이어갈 수 있도록.

## 현재 상태

- **마지막 업데이트:** 2026-04-15 (2)
- **작업자:** Claude Code
- **브랜치:** main

## 완료된 작업

| # | 작업 | 커밋 | 검증 |
|---|------|------|------|
| 1 | 위키 캡션 파이프라인 + 콘텐츠 대시보드 + 모니터링 | `e4b361e` | ✅ |
| 2 | 프론트엔드 UX 개선 (a11y, 터치 타겟, 다크모드, 오버레이) | `8c3619c` | ✅ 유저 확인 완료 |
| 3 | cafe pepper 인스타 게시 (@cafe_pepper_, 캐러셀 5장) | `e4b361e` | ✅ |
| 4 | GitHub Actions 주간 헬스체크 | `e4b361e` | ✅ |
| 5 | 커뮤니티 포스팅 초안 (Reddit/Facebook 6개) | 위키 | ✅ |
| 6 | benir 인스타 게시 (@cafe_benir, 캐러셀 8장) | — | ✅ |
| 7 | GF 레벨 필터 추가 (Dedicated / Friendly) | — | ✅ |
| 8 | Dedicated GF 보정: feeke, sisemdal, x-ake 미확인 → 태그 제거 | — | ✅ |

## 진행 중인 작업

| # | 작업 | 상태 | 막힌 점 |
|---|------|------|---------|
| — | — | — | — |

## 미완료 / 다음에 할 작업

| 우선순위 | 작업 | 선행 조건 |
|----------|------|-----------|
| 1 | Reddit/Facebook 커뮤니티 포스팅 | 초안 완료, 수정 후 업로드 |
| 2 | feeke, sisemdal-atelier, x-ake 전화 확인 → Dedicated GF 재분류 | 전화 |
| 3 | 쌀통닭 인스타 게시 | 캡션 ready, 사진 확인 필요 |
| 4 | CUCCIOLO SEOUL 인스타 게시 | 와이프 폰 음식 사진 받기 |
| 5 | 프랑스와 인스타 게시 | 직촬 10장 보유, 캡션 draft |
| 5 | 블로그 콘텐츠 (/blog/gluten-free-guide-seoul) | 없음 |
| 6 | PlaceFilter 컴포넌트 분할 (615줄) | 별도 세션 |
| 7 | Cloudflare 배포 (프론트엔드 변경 반영) | 빌드 확인 완료 |

## 알려진 이슈

- AdSense Auto Ads: 트래픽 부족으로 광고 미노출 (일 ~10 PV)
- Instagram 토큰 만료: ~2026-05-30
- GitHub Secrets에 INSTAGRAM_TOKEN 미등록 (헬스체크 IG 체크 스킵)

## 컨텍스트 노트

- 매장 24개, 위키 32페이지, 인스타 8건 게시 완료
- Dedicated GF 확인된 매장: 3곳 (237-pizza, cafe-rebirths, monil2-house)
- 위키 캡션 파이프라인 가동: Obsidian 편집 → --from-wiki → 게시 → 자동 훅
- 히어로 이미지 오버레이 추가됨 (매장명 + GF 배지)
- 커뮤니티 포스팅 초안 작성 완료 (operations/커뮤니티 포스팅 초안.md)

## 파일 변경 요약

```
e4b361e: 위키 캡션 파이프라인 + 모니터링 (17 files)
8c3619c: 프론트엔드 UX 개선 (6 files)
```
