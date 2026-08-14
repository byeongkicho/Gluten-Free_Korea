terraform {
  required_version = ">= 1.5"

  required_providers {
    grafana = {
      source  = "grafana/grafana"
      version = "~> 3.0"
    }
  }

  # 상태는 로컬 파일이다(.gitignore 처리).
  # 팀이 생기면 원격 백엔드(S3+DynamoDB 등)로 옮겨야 한다 — 지금은 1인 운영이라
  # 잠금이 필요 없고, 상태에 토큰이 평문으로 들어가므로 커밋하지 않는 것이 더 중요하다.
}

variable "grafana_url" {
  type    = string
  default = "https://bronzedeck1580.grafana.net"
}

variable "grafana_auth" {
  type        = string
  sensitive   = true
  description = "Editor 이상 서비스 계정 토큰. TF_VAR_grafana_auth 로 주입한다 (파일에 쓰지 않는다)."
}

provider "grafana" {
  url  = var.grafana_url
  auth = var.grafana_auth
}
