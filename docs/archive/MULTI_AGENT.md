# MULTI_AGENT.md — 에이전트 오케스트레이션 (SUPERSEDED)

> **⚠️ 이 문서는 `docs/HARNESS.md`로 대체되었습니다. 새 작업은 HARNESS.md를 참조하세요.**
> 아래 내용은 이력 보존 목적으로 유지합니다.

> GF Korea 프로젝트의 멀티 에이전트 역할 분담과 핸드오프 규칙.

## 아키텍처: 서브에이전트 패턴 (계층형)

```
OpenClaw (gfkorea) = 오케스트레이터
├── Claude Code = 코드 계획자 + 소규모 수정
├── Codex       = 코드 실행자 (대규모 태스크 배치)
└── OpenClaw (general) = 개인 업무 (별도 워크스페이스)
```

## 역할 분리 원칙
- **계획 (what/why):** Claude Code — 아키텍처 결정, 코드 리뷰, 소규모 수정
- **실행 (how):** Codex — CODEX_RUN.md 기반 태스크 배치 실행
- **운영 (ops):** OpenClaw (gfkorea) — Instagram, 데이터 관리, Slack 응대
- 참고: `docs/OPERATING_MODEL.md`의 역할 분리 유지

## 핸드오프 매트릭스

| 작업 유형 | 담당 에이전트 | 트리거 | 완료 조건 |
|---|---|---|---|
| 인스타 게시 | OpenClaw | Slack 요청 | 게시물 ID 확인 |
| 가게 데이터 추가 | OpenClaw | Slack 요청 | `validate:places` 통과 |
| 버그 수정 (소규모) | Claude Code | 수동 호출 | `npm run build` 통과 |
| 새 기능 개발 | Codex | CODEX_RUN.md | 모든 pre/post-flight 통과 |
| 디자인 변경 | Claude Code → Codex | 수동 | 빌드 통과 + 스크린샷 확인 |
| 배포 | OpenClaw 또는 수동 | git push | 사이트 200 OK |
| 데이터 파이프라인 | OpenClaw | Slack 요청 | `validate:places` + `build` 통과 |

## 충돌 방지 규칙
1. 동시에 2개 에이전트가 같은 파일 수정 금지.
2. Codex 작업 중 OpenClaw는 데이터 파이프라인만 실행 (코드 수정 안 함).
3. 코드 변경은 항상 PR 기반. 직접 main push 금지.
4. `data/places.json`은 생성 파일 — 어떤 에이전트도 직접 편집 금지.

## 에스컬레이션 기준 (Human-in-the-Loop)
- 동일 에러 3회 이상 재시도 실패 → Ki에게 보고
- 보안 관련 결정 (인증, 토큰, 키) → Ki 승인 필수
- 비가역적 작업 (데이터 삭제, 스키마 변경) → Ki 승인 필수
- 외부 게시 (Instagram, SNS) → Ki 미리보기 승인 필수
- 비용 발생 작업 (도메인, API 유료 호출) → Ki 승인 필수

## 비용 최적화
- 오케스트레이터 (OpenClaw): Opus — 판단/계획이 필요하므로
- 실행자 (Codex): Codex 모델 — 대량 실행에 적합
- 단순 조회/읽기: 가능하면 도구 직접 호출 (에이전트 안 거침)
