# Eval Pipeline — Gluten-Free Korea

> EDD (Eval-Driven Development) 파이프라인.
> 하네스 변경이 품질을 저하시키지 않는지 자동 검증.

## 구조

```
eval/
├── tasks/              # 실패 기반 Eval 태스크 (JSON)
├── eval-runner.sh      # 전체 Eval 실행기
├── grade.sh            # 개별 태스크 채점
├── check-regression.sh # 기준선 대비 퇴행 감지
├── baseline.csv        # 기준선 측정 결과
└── results/            # 실행 결과 (gitignored)
```

## 사용법

```bash
# 전체 Eval 실행
bash eval/eval-runner.sh

# 퇴행 체크 (기준선 대비 5%p 이상 하락 시 실패)
bash eval/check-regression.sh --threshold 5.0
```

## Eval 카테고리

| 카테고리 | 판정 기준 | 임계값 | 가중치 |
|---|---|---|---|
| 데이터 무결성 | `validate:places` 통과 + 필수 필드 존재 | 10/10 | 높음 |
| 빌드 안정성 | `npm run build` 성공 | 9/10 | 높음 |
| 이미지 파이프라인 | places에서 참조하는 이미지 모두 존재 | 8/10 | 중간 |
| 배포 검증 | 사이트 200 OK + 가게 수 일치 | 9/10 | 높음 |
| 인스타 게시 | Cloudinary URL 유효 + API 응답 정상 | 8/10 | 중간 |

## 반복 개선 주기

| 주기 | 행동 | 기대 결과 |
|---|---|---|
| 일간 | 에이전트 실수 발견 시 규칙 1줄 추가 | 즉각적 오류 감소 |
| 주간 | AGENTS.md/CLAUDE.md 전체 검토, 중복/충돌 정리 | 파일 간결성 유지 |
| 월간 | Eval 재실행 + 기준선 업데이트 | 장기적 품질 추적 |
