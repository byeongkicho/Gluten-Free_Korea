# 대시보드 JSON은 Terraform 안에 인라인하지 않고 monitoring/grafana-dashboard.json 을
# 그대로 참조한다. 이유:
#   - JSON이 정본으로 남아야 Grafana UI에서 내보낸 것과 diff를 뜰 수 있다
#   - HCL에 이스케이프된 한 줄 문자열로 박히면 리뷰가 불가능해진다 (terraform이
#     -generate-config-out 으로 뽑아준 초안이 실제로 그 꼴이었다)
#
# 그 파일은 사람이 UI에서 import 할 수 있는 export 형식이라 __inputs 와
# ${DS_PROMETHEUS} 템플릿을 갖고 있다. API로 밀어넣을 때는 둘 다 걷어낸다.
locals {
  dashboard_json = replace(
    file("${path.module}/../monitoring/grafana-dashboard.json"),
    "$${DS_PROMETHEUS}",
    "grafanacloud-prom"
  )

  dashboard = {
    for k, v in jsondecode(local.dashboard_json) : k => v
    if !startswith(k, "__")
  }
}

resource "grafana_dashboard" "health" {
  config_json = jsonencode(local.dashboard)

  # 알림 룰과 같은 폴더에 둔다. import 직후에는 General(폴더 없음)이었고,
  # 이 한 줄이 Terraform으로 실행한 첫 실변경이다 — plan 1 change → apply → 재plan
  # "No changes" 까지 확인했다. 코드가 인프라를 실제로 움직인다는 증거.
  folder = grafana_folder.monitoring.uid
}
