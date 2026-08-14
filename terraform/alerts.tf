# 알림 규칙 — 임계값 근거는 각 룰의 annotation과 docs/SLO.md에 있다.
#
# disable_provenance = true 인 이유: false면 Grafana가 이 룰을 "API가 소유"로 잠가
# UI에서 열어볼 수만 있고 손댈 수 없게 된다. 코드가 정본이되 긴급 시 UI로
# 만질 여지는 남겨둔다(대신 다음 apply에서 되돌아온다 — 그게 드리프트 감지다).

resource "grafana_rule_group" "health" {
  disable_provenance = true
  folder_uid         = "ngk-monitoring"
  interval_seconds   = 300
  name               = "ngk-health"
  rule {
    annotations = {
      summary = "{{ $labels.target }} is DOWN (ngk_http_up={{ $values.B }}). 헬스체크가 실제로 실패를 보고한 것이므로 수집 결손이 아니다 — 사이트/엔드포인트를 확인할 것."
    }
    condition       = "C"
    exec_err_state  = "OK"
    for             = "0s"
    is_paused       = false
    keep_firing_for = null
    labels = {
      service  = "noglutenkorea"
      severity = "critical"
    }
    missing_series_evals_to_resolve = 0
    name                            = "Endpoint is down"
    no_data_state                   = "OK"
    uid                             = "ngk-http-down"
    data {
      datasource_uid = "grafanacloud-prom"
      model          = "{\"expr\":\"last_over_time(ngk_http_up[3h])\",\"instant\":true,\"range\":false,\"refId\":\"A\"}"
      query_type     = null
      ref_id         = "A"
      relative_time_range {
        from = 10800
        to   = 0
      }
    }
    data {
      datasource_uid = "__expr__"
      model          = "{\"expression\":\"A\",\"reducer\":\"last\",\"refId\":\"B\",\"type\":\"reduce\"}"
      query_type     = null
      ref_id         = "B"
      relative_time_range {
        from = 0
        to   = 0
      }
    }
    data {
      datasource_uid = "__expr__"
      model          = "{\"conditions\":[{\"evaluator\":{\"params\":[1],\"type\":\"lt\"}}],\"expression\":\"B\",\"refId\":\"C\",\"type\":\"threshold\"}"
      query_type     = null
      ref_id         = "C"
      relative_time_range {
        from = 0
        to   = 0
      }
    }
  }
  rule {
    annotations = {
      summary = "{{ $labels.target }} 응답 {{ $values.B }}s (임계 1s, 평시 avg 126ms). 캐시 미스·오리진 지연·Cloudflare 이슈 순으로 확인."
    }
    condition       = "C"
    exec_err_state  = "OK"
    for             = "0s"
    is_paused       = false
    keep_firing_for = null
    labels = {
      service  = "noglutenkorea"
      severity = "warning"
    }
    missing_series_evals_to_resolve = 0
    name                            = "Endpoint response time > 1s"
    no_data_state                   = "OK"
    uid                             = "ngk-http-slow"
    data {
      datasource_uid = "grafanacloud-prom"
      model          = "{\"expr\":\"last_over_time(ngk_http_response_seconds[3h])\",\"instant\":true,\"range\":false,\"refId\":\"A\"}"
      query_type     = null
      ref_id         = "A"
      relative_time_range {
        from = 10800
        to   = 0
      }
    }
    data {
      datasource_uid = "__expr__"
      model          = "{\"expression\":\"A\",\"reducer\":\"last\",\"refId\":\"B\",\"type\":\"reduce\"}"
      query_type     = null
      ref_id         = "B"
      relative_time_range {
        from = 0
        to   = 0
      }
    }
    data {
      datasource_uid = "__expr__"
      model          = "{\"conditions\":[{\"evaluator\":{\"params\":[1],\"type\":\"gt\"}}],\"expression\":\"B\",\"refId\":\"C\",\"type\":\"threshold\"}"
      query_type     = null
      ref_id         = "C"
      relative_time_range {
        from = 0
        to   = 0
      }
    }
  }
  rule {
    annotations = {
      summary = "헬스체크 지표가 {{ $values.B }}초째 갱신되지 않았다 (임계 6h). 사이트 장애가 아니라 관측 파이프라인 고장 — GitHub Actions healthcheck 워크플로와 GRAFANA_PUSH_* 시크릿을 확인할 것. 이 룰만 noDataState=Alerting인 이유: '데이터 없음'이 바로 이 룰이 감시하는 대상이다."
    }
    condition       = "C"
    exec_err_state  = "Alerting"
    for             = "0s"
    is_paused       = false
    keep_firing_for = null
    labels = {
      scope    = "pipeline"
      service  = "noglutenkorea"
      severity = "critical"
    }
    missing_series_evals_to_resolve = 0
    name                            = "Healthcheck pipeline stale (>6h)"
    no_data_state                   = "Alerting"
    uid                             = "ngk-healthcheck-stale"
    data {
      datasource_uid = "grafanacloud-prom"
      model          = "{\"expr\":\"time() - max(last_over_time(ngk_healthcheck_timestamp_seconds[24h]))\",\"instant\":true,\"range\":false,\"refId\":\"A\"}"
      query_type     = null
      ref_id         = "A"
      relative_time_range {
        from = 86400
        to   = 0
      }
    }
    data {
      datasource_uid = "__expr__"
      model          = "{\"expression\":\"A\",\"reducer\":\"last\",\"refId\":\"B\",\"type\":\"reduce\"}"
      query_type     = null
      ref_id         = "B"
      relative_time_range {
        from = 0
        to   = 0
      }
    }
    data {
      datasource_uid = "__expr__"
      model          = "{\"conditions\":[{\"evaluator\":{\"params\":[21600],\"type\":\"gt\"}}],\"expression\":\"B\",\"refId\":\"C\",\"type\":\"threshold\"}"
      query_type     = null
      ref_id         = "C"
      relative_time_range {
        from = 0
        to   = 0
      }
    }
  }
}

resource "grafana_rule_group" "expiry" {
  disable_provenance = true
  folder_uid         = "ngk-monitoring"
  interval_seconds   = 300
  name               = "ngk-expiry"
  rule {
    annotations = {
      summary = "noglutenkorea.com TLS cert has {{ $values.B }} days left — Cloudflare should auto-renew; if this fires, it has not."
    }
    condition       = "C"
    exec_err_state  = "OK"
    for             = "0s"
    is_paused       = false
    keep_firing_for = null
    labels = {
      service = "noglutenkorea"
    }
    missing_series_evals_to_resolve = 0
    name                            = "SSL certificate expires in <30 days"
    no_data_state                   = "OK"
    uid                             = "ngk-ssl-expiry"
    data {
      datasource_uid = "grafanacloud-prom"
      model          = "{\"expr\":\"last_over_time(ngk_ssl_expiry_days[24h])\",\"instant\":true,\"range\":false,\"refId\":\"A\"}"
      query_type     = null
      ref_id         = "A"
      relative_time_range {
        from = 600
        to   = 0
      }
    }
    data {
      datasource_uid = "__expr__"
      model          = "{\"expression\":\"A\",\"reducer\":\"last\",\"refId\":\"B\",\"type\":\"reduce\"}"
      query_type     = null
      ref_id         = "B"
      relative_time_range {
        from = 0
        to   = 0
      }
    }
    data {
      datasource_uid = "__expr__"
      model          = "{\"conditions\":[{\"evaluator\":{\"params\":[30],\"type\":\"lt\"}}],\"expression\":\"B\",\"refId\":\"C\",\"type\":\"threshold\"}"
      query_type     = null
      ref_id         = "C"
      relative_time_range {
        from = 0
        to   = 0
      }
    }
  }
  rule {
    annotations = {
      summary = "Instagram data access window: {{ $values.B }} days (negative = already lapsed). Re-authenticate the Facebook app."
    }
    condition       = "C"
    exec_err_state  = "OK"
    for             = "0s"
    is_paused       = false
    keep_firing_for = null
    labels = {
      service = "noglutenkorea"
    }
    missing_series_evals_to_resolve = 0
    name                            = "Instagram data access expires in <7 days"
    no_data_state                   = "OK"
    uid                             = "ngk-ig-data-access"
    data {
      datasource_uid = "grafanacloud-prom"
      model          = "{\"expr\":\"last_over_time(ngk_instagram_data_access_expiry_days[7d])\",\"instant\":true,\"range\":false,\"refId\":\"A\"}"
      query_type     = null
      ref_id         = "A"
      relative_time_range {
        from = 600
        to   = 0
      }
    }
    data {
      datasource_uid = "__expr__"
      model          = "{\"expression\":\"A\",\"reducer\":\"last\",\"refId\":\"B\",\"type\":\"reduce\"}"
      query_type     = null
      ref_id         = "B"
      relative_time_range {
        from = 0
        to   = 0
      }
    }
    data {
      datasource_uid = "__expr__"
      model          = "{\"conditions\":[{\"evaluator\":{\"params\":[7],\"type\":\"lt\"}}],\"expression\":\"B\",\"refId\":\"C\",\"type\":\"threshold\"}"
      query_type     = null
      ref_id         = "C"
      relative_time_range {
        from = 0
        to   = 0
      }
    }
  }
}