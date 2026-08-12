#!/usr/bin/env node

/**
 * push-metrics.mjs — 헬스체크 지표를 Grafana Cloud로 전송
 *
 * Usage:
 *   node scripts/push-metrics.mjs          # data/healthcheck.json의 metrics를 전송
 *
 * 왜 influx line protocol인가:
 *   Grafana Cloud의 Prometheus 스택은 remote_write(protobuf+snappy) 외에
 *   influx line protocol push 엔드포인트를 함께 제공한다. 후자는 평문 POST라
 *   의존성 0으로 끝난다. 같은 클러스터 번호의 influx-* 호스트가 짝이므로
 *   prometheus-* remote write URL을 받으면 여기서 유도한다.
 *
 * env (셋 다 필요, 없으면 skip — 로컬·포크에서 이 스크립트 때문에 깨질 일은 없다):
 *   GRAFANA_PUSH_URL   influx write 엔드포인트, 또는 prometheus remote write URL
 *   GRAFANA_PUSH_USER  스택의 숫자 인스턴스 ID
 *   GRAFANA_PUSH_KEY   MetricsPublisher 권한 API 토큰
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const { GRAFANA_PUSH_URL, GRAFANA_PUSH_USER, GRAFANA_PUSH_KEY } = process.env;

if (!GRAFANA_PUSH_URL || !GRAFANA_PUSH_USER || !GRAFANA_PUSH_KEY) {
  console.log('skipped (no GRAFANA_PUSH_* credentials)');
  process.exit(0);
}

// prometheus-prod-49-prod-ap-northeast-0.grafana.net/api/prom/push
//   → influx-prod-49-prod-ap-northeast-0.grafana.net/api/v1/push/influx/write
function resolveEndpoint(url) {
  if (url.includes('/api/v1/push/influx/write')) return url;
  const m = url.match(/^https:\/\/prometheus-([^/]+)\.grafana\.net/);
  if (m) return `https://influx-${m[1]}.grafana.net/api/v1/push/influx/write`;
  throw new Error(`GRAFANA_PUSH_URL not recognised as influx or prometheus endpoint: ${url}`);
}

// influx line protocol의 measurement/태그 이스케이프: 콤마·공백·등호.
const esc = (s) => String(s).replace(/([,= ])/g, '\\$1');

function toLines(metrics, timestampNs) {
  // ngk_http_up{target="homepage"} 1
  //   → ngk_http_up,target=homepage value=1 <ns>
  // Grafana Cloud는 이걸 ngk_http_up{target="homepage"}로 되돌린다
  // (필드명 value는 메트릭 이름에 접미되지 않는 기본 필드).
  return metrics.map((m) => {
    const tags = Object.entries(m.labels ?? {})
      .map(([k, v]) => `,${esc(k)}=${esc(v)}`)
      .join('');
    return `${esc(m.name)}${tags} value=${m.value} ${timestampNs}`;
  });
}

async function main() {
  const report = JSON.parse(
    await fs.readFile(path.join(ROOT, 'data', 'healthcheck.json'), 'utf8'),
  );
  const metrics = report.metrics ?? [];
  if (!metrics.length) {
    console.log('nothing to push (healthcheck.json has no metrics)');
    process.exit(0);
  }

  // 전송 시각이 아니라 관측 시각을 싣는다 — 재시도·지연이 그래프를 왜곡하지 않게.
  const observedMs = Date.parse(report.timestamp);
  const timestampNs = BigInt(Number.isFinite(observedMs) ? observedMs : Date.now()) * 1_000_000n;

  const body = toLines(metrics, timestampNs).join('\n');
  const endpoint = resolveEndpoint(GRAFANA_PUSH_URL);

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      Authorization: `Bearer ${GRAFANA_PUSH_USER}:${GRAFANA_PUSH_KEY}`,
    },
    body,
  });

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    throw new Error(`push failed — HTTP ${res.status}: ${detail}`);
  }
  console.log(`pushed ${metrics.length} samples to ${new URL(endpoint).hostname}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
