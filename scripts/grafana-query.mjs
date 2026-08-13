#!/usr/bin/env node

/**
 * grafana-query.mjs — Grafana Cloud 지표 직접 조회 (읽기 전용)
 *
 * Usage:
 *   node scripts/grafana-query.mjs status       # 현재 상태 (up·ssl·ig·검사 실패)
 *   node scripts/grafana-query.mjs continuity   # 지난 24h 샘플 연속성 (기대 ~24)
 *   node scripts/grafana-query.mjs slo          # SLO 문서용 24h 집계 (가용률·응답시간)
 *   node scripts/grafana-query.mjs --expr '<promql>'   # 임의 instant 질의
 *
 * 인증: GRAFANA_QUERY_TOKEN (Viewer service account 토큰).
 *   env에 없으면 .env.local에서 읽는다. 토큰 생성 시 role 기본값이
 *   "No basic role"이므로 Viewer를 명시적으로 골라야 한다 (2026-08-12 실측 함정).
 *
 * 왜 필요한가: 시계열 백엔드에 직접 묻는 것이 CI 실행 기록으로 추정하는 것보다
 * 정확하다 — 다운샘플 CSV는 하루 1샘플 스냅샷이지만 여기서는 진짜 24h 집계가 나온다.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GRAFANA_URL = "https://bronzedeck1580.grafana.net";
const DATASOURCE_UID = "grafanacloud-prom"; // monitoring/grafana-alerts.json과 동일

function token() {
  if (process.env.GRAFANA_QUERY_TOKEN) return process.env.GRAFANA_QUERY_TOKEN;
  try {
    const env = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8");
    const m = env.match(/^GRAFANA_QUERY_TOKEN=(.+)$/m);
    if (m) return m[1].trim();
  } catch {}
  console.error("GRAFANA_QUERY_TOKEN not set (env or .env.local).");
  process.exit(78);
}

const PRESETS = {
  status: [
    ["up", "last_over_time(ngk_http_up[2h])"],
    ["checks_failed", "last_over_time(ngk_check_failed[2h])"],
    ["checks_warned", "last_over_time(ngk_check_warned[2h])"],
    ["ssl_days", "last_over_time(ngk_ssl_expiry_days[2h])"],
    ["ig_days", "last_over_time(ngk_instagram_data_access_expiry_days[2h])"],
  ],
  continuity: [
    ["samples_24h", "count_over_time(ngk_check_failed[24h])"],
    ["samples_7d_daily", "count_over_time(ngk_check_failed[7d]) / 7"],
  ],
  slo: [
    ["availability_pct_24h", "avg(avg_over_time(ngk_http_up[24h])) * 100"],
    ["resp_ms_avg_24h", "avg(avg_over_time(ngk_http_response_seconds[24h])) * 1000"],
    ["resp_ms_max_24h", "max(max_over_time(ngk_http_response_seconds[24h])) * 1000"],
    ["failed_checks_24h", "sum(sum_over_time(ngk_check_failed[24h]))"],
  ],
};

async function query(pairs) {
  const res = await fetch(`${GRAFANA_URL}/api/ds/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "now-1h",
      to: "now",
      queries: pairs.map(([refId, expr]) => ({
        refId,
        datasource: { uid: DATASOURCE_UID },
        expr,
        instant: true,
        maxDataPoints: 1,
      })),
    }),
  });
  if (!res.ok) {
    console.error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
    process.exit(1);
  }
  return res.json();
}

function print(results) {
  for (const [refId, r] of Object.entries(results)) {
    if (r.error) {
      console.log(`${refId}: ERROR ${r.error}`);
      continue;
    }
    for (const frame of r.frames ?? []) {
      const valueField = frame.schema.fields[1];
      const labels = valueField?.labels ?? {};
      const series = labels.target ?? labels.field ?? labels.__name__ ?? "";
      const values = frame.data.values;
      const v = values.length > 1 && values[1].length ? values[1].at(-1) : null;
      const num = typeof v === "number" ? Math.round(v * 100) / 100 : v;
      console.log(`${refId.padEnd(22)} ${String(series).padEnd(42)} ${num}`);
    }
  }
}

const arg = process.argv[2];
let pairs;
if (arg === "--expr" && process.argv[3]) pairs = [["q", process.argv[3]]];
else pairs = PRESETS[arg];
if (!pairs) {
  console.error("Usage: grafana-query.mjs status|continuity|slo|--expr '<promql>'");
  process.exit(2);
}

const data = await query(pairs);
print(data.results ?? {});
