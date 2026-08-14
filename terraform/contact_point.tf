# 알림이 실제로 도착하는 경로. 룰만 있고 이게 없으면 관측은 되는데 통보가 안 된다.
resource "grafana_contact_point" "email" {
  name = "ngk-email"

  email {
    addresses               = ["byeongkicho@gmail.com"]
    disable_resolve_message = false
    single_email            = false
  }
}
