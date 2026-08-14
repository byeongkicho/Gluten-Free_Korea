# terraform/ — 관측성 스택을 코드로 관리

noglutenkorea.com의 Grafana Cloud 관측성 스택(폴더·알림 5룰·대시보드·알림 수신처)을 Terraform으로 선언 관리한다.

**중요: 이건 새로 만든 실습 환경이 아니다.** 이미 운영 중이던 스택을 `import`로 코드에 편입한 것이고, 지금도 실제 서비스를 감시하고 있다.

```
terraform/
  providers.tf      provider·변수 (토큰은 TF_VAR로 주입, 파일에 없음)
  folder.tf         grafana_folder
  contact_point.tf  알림이 실제로 도착하는 경로
  alerts.tf         rule group 2개 = 룰 5개 (가용성·지연·staleness·SSL·IG 만료)
  dashboard.tf      ../monitoring/grafana-dashboard.json 을 참조
  imports.tf        상태 없는 환경에서 재현하기 위한 import 블록
```

## 왜 옮겼나 — 직접 만든 스크립트에서 표준 도구로

처음에는 `scripts/provision-alerts.mjs` · `scripts/provision-dashboard.mjs` 로 관리했다. JSON을 정본으로 두고 dry-run diff 후 API에 POST하는 방식이었고, 의존성이 0이라는 장점이 있었다.

**옮기면서 얻은 것**

| | 자체 스크립트 | Terraform |
|---|---|---|
| 드리프트 감지 | 알림 룰만, 그것도 `data` 필드 비교 한정 | **모든 속성**. UI에서 누가 임계값을 바꾸면 `plan`이 잡아낸다 |
| 변경 전 확인 | 자체 구현한 dry-run | `plan`이 속성 단위 diff를 표준 형식으로 |
| 실물 ↔ 코드 대조 | 매번 API를 읽어 비교 | 상태 파일이 대조 지점을 고정 |
| 인수인계 | 이 저장소를 읽어야 이해 가능 | 표준 도구라 설명이 필요 없다 |

**잃은 것**: 의존성 0이 사라졌다(provider 바이너리 + 상태 관리). 임계값을 고른 근거를 `grafana-alerts.json`의 `_thresholds` 블록에 모아뒀는데, HCL로 오면서 각 룰의 주석으로 흩어졌다.

**두 경로를 동시에 두지 않는다.** 프로비저닝 경로가 둘이면 그 자체가 드리프트 원인이다. 지금 정본은 Terraform이고, `scripts/provision-*.mjs`는 헤더에 그 사실을 명시해 참고용으로만 남겼다.

## 검증 (2026-08-15 실행 기록)

```
1) 기존 인프라 편입
   terraform plan -generate-config-out=generated.tf
   → Plan: 5 to import, 0 to add, 0 to change, 0 to destroy
   terraform apply
   → Apply complete! Resources: 5 imported, 0 added, 0 changed, 0 destroyed

2) 코드와 실물이 같은지
   terraform plan
   → No changes. Your infrastructure matches the configuration.

3) 코드로 실제 변경이 되는지 (대시보드를 알림과 같은 폴더로)
   terraform plan   → Plan: 0 to add, 1 to change, 0 to destroy
   terraform apply  → Apply complete! Resources: 0 added, 1 changed, 0 destroyed
   terraform plan   → No changes.
```

자동 생성(`-generate-config-out`)은 초안으로만 썼다. 대시보드가 이스케이프된 한 줄 JSON 문자열로 박혀 리뷰가 불가능했기 때문에, `file()` + `jsondecode` 로 바꿔 JSON을 정본으로 유지했다.

## 사용법

```bash
export TF_VAR_grafana_auth='<Editor 이상 서비스 계정 토큰>'
terraform init
terraform plan        # 드리프트 확인 — 아무것도 안 바꾼다
terraform apply
```

토큰은 저장소의 `.env.local`(gitignore)에 `GRAFANA_PROVISION_TOKEN`으로 있다.
⚠️ 토큰 생성 시 역할 기본값이 `No basic role`이라 **Editor를 명시적으로 골라야** 한다. Viewer 토큰은 읽기만 되고 쓰기는 403이다.

## 알려진 한계 (부풀리지 않기 위해 적는다)

- **관리 대상이 Grafana Cloud SaaS 리소스**다. AWS VPC·EKS 같은 클라우드 인프라를 Terraform으로 굴린 것이 아니다.
- **상태가 로컬 파일**이다. 1인 운영이라 잠금이 필요 없어서 그렇게 뒀다. 팀이 되면 원격 백엔드로 옮겨야 하고, 상태에 토큰이 평문으로 들어가므로 `.gitignore` 처리가 지금은 더 중요하다.
- **CI에서 돌리지 않는다.** 지금은 로컬에서 수동 apply다. 자동화하려면 상태 원격화가 선행돼야 한다.
- 리소스 5개짜리 소규모다. 모듈화·워크스페이스 분리 같은 건 이 규모에 불필요해서 하지 않았다.
