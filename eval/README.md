# Eval Pipeline — Gluten-Free Korea

> EDD (Eval-Driven Development) 파이프라인.
> 하네스 변경이 품질을 저하시키지 않는지 자동 검증.

## 구조

```
eval/
├── tasks/              # 실패 기반 Eval 태스크 (JSON)
├── eval-runner.sh      # 전체 Eval 실행기
├── check-regression.sh # 기준선 대비 퇴행 감지
├── baseline.csv        # 기준선 측정 결과
└── results/            # 실행 결과
```

## 사용법

```bash
# 전체 Eval 실행
bash eval/eval-runner.sh

# 퇴행 체크 (기준선 대비 5%p 이상 하락 시 실패)
bash eval/check-regression.sh --threshold 5.0
```

## Eval 카테고리

| 카테고리 | 판정 기준 | 가중치 |
|---|---|---|
| 데이터 무결성 | `validate:places` 통과 + 필수 필드 존재 | 높음 |
| 빌드 안정성 | `npm run build` 성공 | 높음 |
| 이미지 파이프라인 | 참조된 Cloudinary public_id가 전부 응답 | 중간 |
| 배포 검증 | 사이트 200 OK + 콘텐츠 키워드 존재 | 높음 |
| 인스타 게시 | URL 빌더가 프리셋 계약을 지킴 | 중간 |
| 코드 리뷰 | Edge 호환·보안 헤더·slug 고유성·canonical | 높음 |
| 하네스 무결성 | 규칙 문서가 저장소의 현재 상태를 가리킴 | 높음 |

> 카테고리 표는 `eval/tasks/*.json`의 `category`와 일치해야 한다.
> `check-harness.mjs eval-docs`가 이 정합을 검사한다.

## 반복 개선 주기

| 주기 | 행동 | 기대 결과 |
|---|---|---|
| 일간 | 에이전트 실수 발견 시 규칙 1줄 추가 | 즉각적 오류 감소 |
| 주간 | AGENTS.md/CLAUDE.md 전체 검토, 중복/충돌 정리 | 파일 간결성 유지 |
| 월간 | Eval 재실행 + 기준선 업데이트 | 장기적 품질 추적 |
