#!/usr/bin/env node

/**
 * ⚠️ SUPERSEDED (2026-08-15) — 정본은 이제 `terraform/` 이다.
 *
 * 대시보드 JSON 자체는 여전히 정본이며 Terraform이 file()로 참조한다.
 * 반영은 `cd terraform && terraform apply` 로 한다. 이 스크립트는 참고용.
 *
 * provision-dashboard.mjs — monitoring/grafana-dashboard.json을 Grafana Cloud에 반영
 *
 * Usage:
 *   node scripts/provision-dashboard.mjs           # dry-run (기본) — 라이브와 diff만
 *   node scripts/provision-dashboard.mjs --apply   # 실제 반영
 *
 * 인증: GRAFANA_PROVISION_TOKEN (Editor 이상). 없으면 .env.local에서 읽는다.
 *
 * 파일은 export 형식(`__inputs` + `${DS_PROMETHEUS}` 템플릿)이라 사람이 UI로
 * import 할 수도 있다. API로 밀어넣을 때는 데이터소스 UID를 실제 값으로 치환한다.
 *
 * ⚠️ 라이브 대시보드를 통째로 덮는다. UI에서 손댄 것이 있으면 사라지므로,
 *    apply 전에 dry-run이 패널 수 차이를 먼저 보여준다.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GRAFANA_URL = "https://bronzedeck1580.grafana.net";
const DS_UID = "grafanacloud-prom";
const FILE = path.join(ROOT, "monitoring", "grafana-dashboard.json");
const APPLY = process.argv.includes("--apply");

function token() {
  if (process.env.GRAFANA_PROVISION_TOKEN) return process.env.GRAFANA_PROVISION_TOKEN;
  try {
    const env = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8");
    const m = env.match(/^GRAFANA_PROVISION_TOKEN=(.+)$/m);
    if (m) return m[1].trim();
  } catch {}
  console.error("GRAFANA_PROVISION_TOKEN not set (env or .env.local).");
  process.exit(78);
}
const TOKEN = token();

const raw = fs.readFileSync(FILE, "utf8");
// ${DS_PROMETHEUS} → 실제 UID. __inputs는 API 경로에서 의미가 없으므로 뺀다.
const dashboard = JSON.parse(raw.replaceAll("${DS_PROMETHEUS}", DS_UID));
delete dashboard.__inputs;
delete dashboard.__requires;
delete dashboard.id; // 새 인스턴스에서도 uid 기준으로 붙도록

const res = await fetch(`${GRAFANA_URL}/api/dashboards/uid/${dashboard.uid}`, {
  headers: { Authorization: `Bearer ${TOKEN}` },
});
const live = res.ok ? (await res.json()).dashboard : null;

console.log(`파일 패널 ${dashboard.panels.length}개 / 라이브 ${live ? live.panels.length + "개 (version " + live.version + ")" : "없음"}`);

if (live) {
  const fileIds = new Set(dashboard.panels.map((p) => p.title));
  const liveIds = new Set(live.panels.map((p) => p.title));
  for (const t of fileIds) if (!liveIds.has(t)) console.log(`  + ${t}`);
  for (const t of liveIds) if (!fileIds.has(t)) console.log(`  - ${t}   ⚠️ 라이브에만 있음 — 덮으면 사라진다`);
  if ([...fileIds].every((t) => liveIds.has(t)) && fileIds.size === liveIds.size)
    console.log("  = 차이 없음");
}

if (!APPLY) {
  console.log("\ndry-run 종료 — 반영하려면 --apply");
  process.exit(0);
}

const put = await fetch(`${GRAFANA_URL}/api/dashboards/db`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    dashboard: { ...dashboard, version: live?.version },
    overwrite: true,
    message: "provisioned from monitoring/grafana-dashboard.json",
  }),
});
const body = await put.text();
if (!put.ok) {
  console.error(`실패 ${put.status}: ${body.slice(0, 300)}`);
  process.exit(1);
}
const out = JSON.parse(body);
console.log(`\n반영 완료 — version ${out.version}  ${GRAFANA_URL}${out.url}`);
