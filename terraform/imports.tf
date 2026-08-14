# 이 스택은 새로 만든 것이 아니라 **이미 돌고 있던 것을 코드로 가져온 것**이다.
# import 블록을 지우지 않고 남겨두는 이유: 상태 파일이 없는 환경(새 머신, CI)에서
# `terraform plan` 을 돌리면 "5 to import, 0 to change" 가 그대로 재현된다.
# 즉 이 파일이 "코드와 실제 인프라가 같다"는 주장의 재현 절차다.
#
# 최초 수행:
#   terraform plan -generate-config-out=generated.tf   # HCL 초안 자동 생성
#   terraform apply                                    # 상태로 편입 (실제 변경 0건)

import {
  to = grafana_folder.monitoring
  id = "ngk-monitoring"
}

import {
  to = grafana_contact_point.email
  id = "ngk-email"
}

import {
  to = grafana_rule_group.health
  id = "ngk-monitoring:ngk-health"
}

import {
  to = grafana_rule_group.expiry
  id = "ngk-monitoring:ngk-expiry"
}

import {
  to = grafana_dashboard.health
  id = "ngk-health"
}
