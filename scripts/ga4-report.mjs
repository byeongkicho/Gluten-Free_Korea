#!/usr/bin/env node

/**
 * GA4 트래픽 리포트 생성
 *
 * Usage:
 *   npm run ga4              # 최근 7일
 *   npm run ga4 -- --days 30 # 최근 30일
 *
 * Env:
 *   GA4_PROPERTY_ID          — GA4 속성 ID (숫자, e.g. 123456789)
 *   GA4_CREDENTIALS_PATH     — 서비스 계정 JSON 키 경로
 */

import { BetaAnalyticsDataClient } from "@google-analytics/data";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outputPath = path.join(rootDir, "data", "ga4-report.json");

// ── Config ──────────────────────────────────────────────
const args = process.argv.slice(2);
const daysIdx = args.indexOf("--days");
const days = daysIdx !== -1 ? Number(args[daysIdx + 1]) : 7;

const propertyId = process.env.GA4_PROPERTY_ID;
const credentialsPath =
  process.env.GA4_CREDENTIALS_PATH ||
  path.join(rootDir, "ga4-credentials.json");

if (!propertyId) {
  console.error("Missing GA4_PROPERTY_ID. Set it in .env");
  process.exit(1);
}

const client = new BetaAnalyticsDataClient({
  keyFilename: credentialsPath,
});

const property = `properties/${propertyId}`;
const dateRange = { startDate: `${days}daysAgo`, endDate: "today" };

// ── Helpers ─────────────────────────────────────────────
async function runReport(metrics, dimensions = []) {
  const [response] = await client.runReport({
    property,
    dateRanges: [dateRange],
    metrics: metrics.map((m) => ({ name: m })),
    dimensions: dimensions.map((d) => ({ name: d })),
    orderBys: dimensions.length
      ? [{ metric: { metricName: metrics[0] }, desc: true }]
      : undefined,
    limit: dimensions.length ? 10 : undefined,
  });
  return response;
}

function parseRows(response, dimNames, metricNames) {
  if (!response.rows) return [];
  return response.rows.map((row) => {
    const obj = {};
    dimNames.forEach((name, i) => {
      const val = row.dimensionValues[i].value;
      obj[name] = val === "(not set)" || val === "" ? "Unknown" : val;
    });
    metricNames.forEach((name, i) => {
      obj[name] = Number(row.metricValues[i].value);
    });
    return obj;
  });
}

// ── Reports ─────────────────────────────────────────────

// 1) 트래픽 개요
async function getOverview() {
  const metrics = [
    "sessions",
    "totalUsers",
    "screenPageViews",
    "averageSessionDuration",
    "bounceRate",
    "newUsers",
  ];
  const response = await runReport(metrics);
  const row = response.rows?.[0];
  if (!row) return null;
  const result = {};
  metrics.forEach((m, i) => {
    result[m] = Number(row.metricValues[i].value);
  });
  result.averageSessionDuration = Math.round(result.averageSessionDuration);
  result.bounceRate = Math.round(result.bounceRate * 100) / 100;
  return result;
}

// 2) 인기 페이지 Top 10
async function getTopPages() {
  const metrics = ["screenPageViews", "totalUsers"];
  const dims = ["pagePath"];
  const response = await runReport(metrics, dims);
  return parseRows(response, dims, metrics);
}

// 3) 유입 경로
async function getTrafficSources() {
  const metrics = ["sessions", "totalUsers"];
  const dims = ["sessionDefaultChannelGroup"];
  const response = await runReport(metrics, dims);
  return parseRows(response, dims, metrics);
}

// 4) 국가별 방문자
async function getCountries() {
  const metrics = ["totalUsers", "sessions"];
  const dims = ["country"];
  const response = await runReport(metrics, dims);
  return parseRows(response, dims, metrics);
}

// 5) 기기 비율
async function getDevices() {
  const metrics = ["totalUsers", "sessions"];
  const dims = ["deviceCategory"];
  const response = await runReport(metrics, dims);
  return parseRows(response, dims, metrics);
}

// ── Main ────────────────────────────────────────────────
async function main() {
  console.log(`\n📊 GA4 Report — 최근 ${days}일\n`);

  const [overview, topPages, sources, countries, devices] = await Promise.all([
    getOverview(),
    getTopPages(),
    getTrafficSources(),
    getCountries(),
    getDevices(),
  ]);

  const report = {
    generatedAt: new Date().toISOString(),
    period: { days, startDate: `${days}daysAgo`, endDate: "today" },
    overview,
    topPages,
    trafficSources: sources,
    countries,
    devices,
  };

  // Save JSON
  await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
  console.log(`💾 저장: ${path.relative(rootDir, outputPath)}\n`);

  // Print summary
  if (overview) {
    console.log("── 개요 ──");
    console.log(`  사용자: ${overview.totalUsers} (신규: ${overview.newUsers})`);
    console.log(`  세션: ${overview.sessions}`);
    console.log(`  페이지뷰: ${overview.screenPageViews}`);
    console.log(`  평균 체류: ${overview.averageSessionDuration}초`);
    console.log(`  이탈률: ${overview.bounceRate}%`);
  }

  if (topPages.length) {
    console.log("\n── 인기 페이지 Top 10 ──");
    topPages.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.pagePath} — ${p.screenPageViews} PV, ${p.totalUsers} users`);
    });
  }

  if (sources.length) {
    console.log("\n── 유입 경로 ──");
    sources.forEach((s) => {
      console.log(`  ${s.sessionDefaultChannelGroup}: ${s.sessions} sessions, ${s.totalUsers} users`);
    });
  }

  if (countries.length) {
    console.log("\n── 국가별 방문자 ──");
    countries.forEach((c) => {
      console.log(`  ${c.country}: ${c.totalUsers} users`);
    });
  }

  if (devices.length) {
    console.log("\n── 기기 ──");
    devices.forEach((d) => {
      console.log(`  ${d.deviceCategory}: ${d.totalUsers} users`);
    });
  }

  console.log("");
}

main().catch((err) => {
  console.error("GA4 report failed:", err.message);
  process.exit(1);
});
