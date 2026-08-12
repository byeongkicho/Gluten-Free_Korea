#!/usr/bin/env node

/**
 * daily-summary.mjs — 헬스체크 결과를 하루 한 줄로 접어서 영구 보관
 *
 * Usage:
 *   node scripts/daily-summary.mjs        # healthcheck.json을 오늘 행에 접어 넣기
 *
 * 왜 필요한가:
 *   시계열 백엔드(Grafana Cloud 무료 티어)는 보존이 14일이다. 그 뒤 원시 데이터는
 *   사라지므로 "몇 달에 걸친 추세"를 볼 수 없다. 그래서 하루치를 한 줄로 접어
 *   저장소에 남긴다. 하루 1행이면 3년이 1,000줄로, 용량은 사실상 0이다.
 *   (관측성에서 말하는 다운샘플링 — 해상도를 버리고 기간을 산다.)
 *
 * 호출 시점:
 *   헬스체크가 돌 때마다 뒤이어 실행한다. 하루에 여러 번 실행돼도 같은 날짜 행에
 *   누적되며(runs가 증가), 평균·최댓값이 갱신된다.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPORT = path.join(ROOT, 'data', 'healthcheck.json');
const CSV = path.join(ROOT, 'data', 'daily-summary.csv');

// 행의 날짜는 KST 기준. 사이트도 사용자도 한국에 있으므로 UTC로 자르면
// 하루가 9시간 어긋나 "어제 장애"가 오늘 행에 섞인다.
const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());

const COLUMNS = [
  'date',
  'runs',
  'availability_pct',
  'resp_ms_avg',
  'resp_ms_max',
  'ssl_days',
  'ig_data_access_days',
  'ig_api_up',
  'places_total',
  'places_missing_address_en',
  'ga4_age_days',
  'checks_failed',
  'checks_warned',
];

// 누적되는 값과 최신값으로 덮는 값을 구분한다.
const SUMMED = new Set(['checks_failed', 'checks_warned']);
const AVERAGED = new Set(['availability_pct', 'resp_ms_avg']);
const MAXED = new Set(['resp_ms_max']);
// 나머지(ssl_days 등)는 천천히 변하는 상태값이라 최신값으로 덮는다.

function round(n, digits = 1) {
  return Number.isFinite(n) ? Number(n.toFixed(digits)) : '';
}

/** healthcheck.json의 metrics 배열에서 오늘 한 번의 관측치를 뽑는다. */
function readSample(report) {
  const metrics = report.metrics || [];
  const all = (name) => metrics.filter((m) => m.name === name).map((m) => m.value);
  const one = (name, labels = {}) => {
    const hit = metrics.find(
      (m) => m.name === name && Object.entries(labels).every(([k, v]) => m.labels?.[k] === v)
    );
    return hit ? hit.value : undefined;
  };

  const up = all('ngk_http_up');
  const respSeconds = all('ngk_http_response_seconds');
  const respMs = respSeconds.map((s) => s * 1000);

  return {
    availability_pct: up.length ? (up.reduce((a, b) => a + b, 0) / up.length) * 100 : undefined,
    resp_ms_avg: respMs.length ? respMs.reduce((a, b) => a + b, 0) / respMs.length : undefined,
    resp_ms_max: respMs.length ? Math.max(...respMs) : undefined,
    ssl_days: one('ngk_ssl_expiry_days'),
    ig_data_access_days: one('ngk_instagram_data_access_expiry_days'),
    ig_api_up: one('ngk_instagram_api_up'),
    places_total: one('ngk_places_total'),
    places_missing_address_en: one('ngk_places_missing', { field: 'address_en' }),
    ga4_age_days: one('ngk_ga4_report_age_days'),
    checks_failed: one('ngk_check_failed'),
    checks_warned: one('ngk_check_warned'),
  };
}

async function readCsv() {
  try {
    const raw = await fs.readFile(CSV, 'utf8');
    const lines = raw.trim().split('\n');
    const header = lines[0].split(',');
    const rows = lines.slice(1).map((line) => {
      const cells = line.split(',');
      return Object.fromEntries(header.map((h, i) => [h, cells[i] ?? '']));
    });
    return rows;
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

function fold(prev, sample) {
  const prevRuns = prev ? Number(prev.runs) || 0 : 0;
  const runs = prevRuns + 1;
  const row = { date: today, runs };

  for (const col of COLUMNS) {
    if (col === 'date' || col === 'runs') continue;
    const cur = sample[col];
    const before = prev && prev[col] !== '' ? Number(prev[col]) : undefined;

    if (cur === undefined) {
      // 이번 실행에서 측정되지 않은 값은 이전 값을 그대로 둔다.
      // 없는 값을 0으로 채우면 그래프가 "장애"처럼 보인다.
      row[col] = prev ? prev[col] : '';
      continue;
    }

    if (SUMMED.has(col)) {
      row[col] = (before ?? 0) + cur;
    } else if (AVERAGED.has(col)) {
      row[col] = round(before === undefined ? cur : (before * prevRuns + cur) / runs);
    } else if (MAXED.has(col)) {
      row[col] = round(before === undefined ? cur : Math.max(before, cur));
    } else {
      row[col] = cur;
    }
  }
  return row;
}

async function main() {
  let report;
  try {
    report = JSON.parse(await fs.readFile(REPORT, 'utf8'));
  } catch {
    console.error(`No healthcheck report at ${path.relative(ROOT, REPORT)} — run healthcheck.mjs first.`);
    process.exit(1);
  }

  if (!report.metrics?.length) {
    console.error('Report has no metrics — is healthcheck.mjs up to date?');
    process.exit(1);
  }

  const sample = readSample(report);
  const rows = await readCsv();
  const idx = rows.findIndex((r) => r.date === today);
  const merged = fold(idx >= 0 ? rows[idx] : null, sample);

  if (idx >= 0) rows[idx] = merged;
  else rows.push(merged);

  rows.sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const out = [COLUMNS.join(','), ...rows.map((r) => COLUMNS.map((c) => r[c] ?? '').join(','))].join('\n');
  await fs.writeFile(CSV, out + '\n');

  console.log(`${today} → run #${merged.runs}`);
  console.log(
    `  availability ${merged.availability_pct}% | resp avg ${merged.resp_ms_avg}ms max ${merged.resp_ms_max}ms | ` +
      `ssl ${merged.ssl_days}d | failed ${merged.checks_failed}`
  );
  console.log(`Saved: data/daily-summary.csv (${rows.length} days)`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
