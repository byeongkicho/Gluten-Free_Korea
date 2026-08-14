#!/usr/bin/env node

/**
 * provision-alerts.mjs — monitoring/grafana-alerts.json을 Grafana Cloud에 반영
 *
 * Usage:
 *   node scripts/provision-alerts.mjs              # dry-run (기본) — 무엇이 바뀔지만 출력
 *   node scripts/provision-alerts.mjs --apply      # 실제 반영
 *   node scripts/provision-alerts.mjs --apply --interval 300   # 그룹 평가 주기도 함께 설정
 *
 * 인증: GRAFANA_PROVISION_TOKEN — **Editor 이상** 서비스 계정 토큰.
 *   읽기용 GRAFANA_QUERY_TOKEN(Viewer)으로는 쓰기가 403이다.
 *   env에 없으면 .env.local에서 읽는다.
 *
 * 왜 스크립트인가: UI에서 만든 룰은 재현이 안 된다. 파일을 정본으로 두고
 * 여기서 밀어넣으면 룰이 리뷰 가능한 diff가 되고, 인스턴스가 날아가도 복구된다.
 * (임계값을 고른 근거는 JSON의 _thresholds에 함께 적어둔다 — 숫자만 남으면
 *  6개월 뒤에 왜 그 값인지 아무도 모른다.)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GRAFANA_URL = "https://bronzedeck1580.grafana.net";
const RULES_FILE = path.join(ROOT, "monitoring", "grafana-alerts.json");

const APPLY = process.argv.includes("--apply");
const intervalArg = process.argv.indexOf("--interval");
const INTERVAL = intervalArg > -1 ? Number(process.argv[intervalArg + 1]) : null;

function token() {
  for (const key of ["GRAFANA_PROVISION_TOKEN", "GRAFANA_QUERY_TOKEN"]) {
    if (process.env[key]) return { value: process.env[key], key };
  }
  try {
    const env = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8");
    for (const key of ["GRAFANA_PROVISION_TOKEN", "GRAFANA_QUERY_TOKEN"]) {
      const m = env.match(new RegExp(`^${key}=(.+)$`, "m"));
      if (m) return { value: m[1].trim(), key };
    }
  } catch {}
  console.error("GRAFANA_PROVISION_TOKEN not set (env or .env.local).");
  process.exit(78);
}

const { value: TOKEN, key: TOKEN_KEY } = token();

async function api(method, endpoint, body) {
  const res = await fetch(`${GRAFANA_URL}/api/v1/provisioning${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      // 이 헤더가 없으면 룰이 provenance=api로 잠겨 UI에서 손댈 수 없게 된다.
      "X-Disable-Provenance": "true",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${endpoint} → ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

const file = JSON.parse(fs.readFileSync(RULES_FILE, "utf8"));
const desired = file.rules;

const live = await api("GET", "/alert-rules");
const liveByUid = new Map(live.map((r) => [r.uid, r]));

console.log(`토큰: ${TOKEN_KEY}${APPLY ? "" : "  (dry-run — 반영하려면 --apply)"}`);
console.log(`정본 ${desired.length}룰 / 인스턴스 ${live.length}룰\n`);

let created = 0;
let updated = 0;

for (const rule of desired) {
  const existing = liveByUid.get(rule.uid);
  const action = existing ? "UPDATE" : "CREATE";
  const changed =
    existing && JSON.stringify(existing.data) !== JSON.stringify(rule.data);

  if (existing && !changed) {
    console.log(`  =  ${rule.uid.padEnd(26)} ${rule.title}`);
    continue;
  }

  console.log(`  ${action === "CREATE" ? "+" : "~"}  ${rule.uid.padEnd(26)} ${rule.title}`);
  if (!APPLY) continue;

  if (existing) {
    await api("PUT", `/alert-rules/${rule.uid}`, rule);
    updated++;
  } else {
    await api("POST", "/alert-rules", rule);
    created++;
  }
}

// 시간당 수집되는 지표를 1분마다 평가할 이유가 없다. 그룹 주기를 명시하면
// 불필요한 평가와 노이즈가 함께 줄어든다.
if (APPLY && INTERVAL) {
  const groups = [...new Set(desired.map((r) => r.ruleGroup))];
  for (const g of groups) {
    const folder = desired.find((r) => r.ruleGroup === g).folderUID;
    await api("PUT", `/folder/${folder}/rule-groups/${g}`, {
      title: g,
      folderUid: folder,
      interval: INTERVAL,
    });
    console.log(`  interval ${g} → ${INTERVAL}s`);
  }
}

// 인스턴스에만 있고 파일에 없는 룰 — 자동 삭제하지 않는다. 파일이 정본이라도
// 지우는 것은 사람이 판단할 일이다.
const orphans = live.filter((r) => !desired.some((d) => d.uid === r.uid));
if (orphans.length) {
  console.log(`\n⚠️ 파일에 없는 인스턴스 룰 ${orphans.length}건 (자동 삭제 안 함):`);
  for (const o of orphans) console.log(`   - ${o.uid} ${o.title}`);
}

console.log(APPLY ? `\n완료: 생성 ${created} · 갱신 ${updated}` : "\ndry-run 종료 — 반영하려면 --apply");
