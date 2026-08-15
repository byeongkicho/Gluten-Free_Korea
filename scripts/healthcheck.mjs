#!/usr/bin/env node

/**
 * healthcheck.mjs — noglutenkorea.com 종합 헬스체크
 *
 * Usage:
 *   node scripts/healthcheck.mjs           # 전체 체크
 *   node scripts/healthcheck.mjs --quick   # HTTP 체크만
 *
 * Checks:
 *   1. HTTP status & response time (homepage, sitemap, robots.txt, ads.txt)
 *   2. Key pages load (place detail pages)
 *   3. SSL certificate expiry
 *   4. Instagram token expiry
 *   5. GA4 traffic summary (if credentials available)
 *   6. places.json data integrity
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SITE = 'https://noglutenkorea.com';
const quick = process.argv.includes('--quick');

const results = [];
let failures = 0;

function pass(check, detail) {
  results.push({ status: '✅', check, detail });
  console.log(`  ✅ ${check} — ${detail}`);
}

function fail(check, detail) {
  results.push({ status: '❌', check, detail });
  console.log(`  ❌ ${check} — ${detail}`);
  failures++;
}

function warn(check, detail) {
  results.push({ status: '⚠️', check, detail });
  console.log(`  ⚠️ ${check} — ${detail}`);
}

// ── Metrics ──────────────────────────────────────────────
// 체크 결과를 숫자로도 모은다. 콘솔 출력(✅/❌)은 사람이 읽는 용도고,
// 이쪽은 시계열로 쌓아 추세를 보기 위한 것이다.
// 측정하지 못한 값은 아예 기록하지 않는다 (0이나 -1로 채우면 그래프가 거짓말을 한다).

const metrics = [];

function metric(name, value, labels = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return;
  metrics.push({ name, value, labels });
}

const METRIC_HELP = {
  ngk_http_up: 'Endpoint reachable and returning a 2xx/3xx status (1) or not (0)',
  ngk_http_response_seconds: 'Wall-clock time to complete the request',
  ngk_http_status_code: 'HTTP status code returned by the endpoint',
  ngk_ssl_expiry_days: 'Days until the TLS certificate expires',
  ngk_instagram_token_valid: 'Long-lived Instagram token still authenticates (1) or not (0)',
  ngk_instagram_token_expiry_days: 'Days until the long-lived Instagram token expires (absent when it never expires)',
  ngk_instagram_data_access_expiry_days: 'Days until Facebook data access expires; negative means already lapsed',
  ngk_instagram_api_up: 'Instagram publishing target is reachable with the page token (1) or not (0)',
  ngk_instagram_days_since_last_post: 'Days since the most recent Instagram post; rises while the account is dormant',
  ngk_places_total: 'Number of places in places.json',
  ngk_places_missing: 'Places missing a given field',
  ngk_ga4_report_age_days: 'Age of the most recent GA4 report',
  ngk_check_total: 'Checks executed in this run',
  ngk_check_failed: 'Checks that failed in this run',
  ngk_check_warned: 'Checks that raised a warning in this run',
  ngk_healthcheck_timestamp_seconds: 'Unix timestamp of this run',
};

function renderPrometheus() {
  const byName = new Map();
  for (const m of metrics) {
    if (!byName.has(m.name)) byName.set(m.name, []);
    byName.get(m.name).push(m);
  }

  const lines = [];
  for (const [name, group] of byName) {
    if (METRIC_HELP[name]) lines.push(`# HELP ${name} ${METRIC_HELP[name]}`);
    lines.push(`# TYPE ${name} gauge`);
    for (const m of group) {
      const labels = Object.entries(m.labels)
        .map(([k, v]) => `${k}="${String(v).replace(/(["\\])/g, '\\$1')}"`)
        .join(',');
      lines.push(labels ? `${name}{${labels}} ${m.value}` : `${name} ${m.value}`);
    }
  }
  return lines.join('\n') + '\n';
}

// ── 1. HTTP checks ───────────────────────────────────────

async function checkUrl(url, label, target) {
  const start = Date.now();
  try {
    const res = await fetch(url, { redirect: 'follow' });
    const elapsed = Date.now() - start;
    if (res.ok) {
      pass(label, `HTTP ${res.status} (${elapsed}ms)`);
    } else {
      fail(label, `HTTP ${res.status} (${elapsed}ms)`);
    }
    metric('ngk_http_up', res.ok ? 1 : 0, { target });
    metric('ngk_http_status_code', res.status, { target });
    metric('ngk_http_response_seconds', elapsed / 1000, { target });
    return { status: res.status, elapsed };
  } catch (e) {
    fail(label, `UNREACHABLE — ${e.message}`);
    // 도달 자체가 안 됐으므로 up=0만 남긴다. 응답시간·상태코드는 존재하지 않는 값이다.
    metric('ngk_http_up', 0, { target });
    return { status: 0, elapsed: 0 };
  }
}

// ── 2. SSL certificate ──────────────────────────────────

function checkSSL() {
  return new Promise((resolve) => {
    const req = https.request({ hostname: 'noglutenkorea.com', port: 443, method: 'HEAD' }, (res) => {
      const cert = res.socket.getPeerCertificate();
      if (cert && cert.valid_to) {
        const expiry = new Date(cert.valid_to);
        const daysLeft = Math.floor((expiry - Date.now()) / (1000 * 60 * 60 * 24));
        metric('ngk_ssl_expiry_days', daysLeft);
        if (daysLeft > 30) {
          pass('SSL Certificate', `Expires ${cert.valid_to} (${daysLeft} days left)`);
        } else if (daysLeft > 0) {
          warn('SSL Certificate', `Expires in ${daysLeft} days! (${cert.valid_to})`);
        } else {
          fail('SSL Certificate', `EXPIRED on ${cert.valid_to}`);
        }
      }
      resolve();
    });
    req.on('error', (e) => {
      fail('SSL Certificate', e.message);
      resolve();
    });
    req.end();
  });
}

// ── 3. Instagram token ──────────────────────────────────

async function readInstagramCreds() {
  // CI에는 ~/.instagram-creds가 없다. 환경변수로도 받을 수 있어야
  // 로컬과 GitHub Actions가 같은 점검을 한다.
  const fromEnv = {
    LONG_LIVED_TOKEN: process.env.INSTAGRAM_LONG_LIVED_TOKEN,
    PAGE_TOKEN: process.env.INSTAGRAM_PAGE_TOKEN,
    IG_ACCOUNT_ID: process.env.INSTAGRAM_IG_ACCOUNT_ID,
  };
  if (fromEnv.LONG_LIVED_TOKEN) return fromEnv;

  const credsPath = path.join(process.env.HOME, '.instagram-creds');
  const raw = await fs.readFile(credsPath, 'utf8');
  const creds = {};
  raw.split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && !k.startsWith('#')) creds[k.trim()] = v.join('=').trim();
  });
  return creds;
}

async function checkInstagramToken() {
  try {
    const creds = await readInstagramCreds();

    const token = creds.LONG_LIVED_TOKEN;
    if (!token) { warn('Instagram Token', 'No token found'); return; }

    const res = await fetch(`https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${token}`);
    if (!res.ok) {
      const body = await res.json();
      fail('Instagram Token', `Invalid — ${body.error?.message || res.status}`);
      metric('ngk_instagram_token_valid', 0);
      return;
    }
    metric('ngk_instagram_token_valid', 1);

    // 토큰 유효성만으로는 부족하다. debug_token이 두 개의 다른 만료를 알려준다:
    //   expires_at            — 토큰 자체의 만료 (0이면 만료 없음)
    //   data_access_expires_at — 데이터 접근 권한 만료 (90일 주기, 별개로 흐른다)
    // 2026-08-12 실측: 이 토큰은 expires_at=0(무기한)인데 data_access는 이미 지나 있었고,
    // 그런데도 API는 정상 응답했다. 즉 두 값 다 "발행 가능"을 보장하지 않는다.
    const dbg = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${token}`
    );
    if (dbg.ok) {
      const { data } = await dbg.json();
      const day = 1000 * 60 * 60 * 24;

      if (data?.expires_at) {
        const daysLeft = Math.floor((data.expires_at * 1000 - Date.now()) / day);
        metric('ngk_instagram_token_expiry_days', daysLeft);
        if (daysLeft <= 7) warn('Instagram Token', `Expires in ${daysLeft} days — refresh needed`);
      }

      if (data?.data_access_expires_at) {
        const daysLeft = Math.floor((data.data_access_expires_at * 1000 - Date.now()) / day);
        metric('ngk_instagram_data_access_expiry_days', daysLeft);
        if (daysLeft <= 0) {
          warn('Instagram Data Access', `Expired ${-daysLeft} days ago — re-auth required to restore full scope`);
        } else if (daysLeft <= 14) {
          warn('Instagram Data Access', `Expires in ${daysLeft} days`);
        }
      }
    }

    // 진짜 물어야 할 것 — 지금 이 순간 실제로 발행할 수 있는 상태인가.
    // 토큰 메타데이터가 아니라 실제 대상 계정을 조회해서 판정한다.
    const pageToken = creds.PAGE_TOKEN;
    const igAccountId = creds.IG_ACCOUNT_ID;
    if (pageToken && igAccountId) {
      const probe = await fetch(
        `https://graph.facebook.com/v21.0/${igAccountId}?fields=username&access_token=${pageToken}`
      );
      if (probe.ok) {
        const { username } = await probe.json();
        metric('ngk_instagram_api_up', 1);
        pass('Instagram API', `Publishing target reachable (@${username})`);

        // "발행할 수 있다"와 "발행하고 있다"는 다른 질문이다. 만료만 감시하면
        // 파이프라인이 멀쩡한 채로 몇 달 조용해도 어떤 지표에도 잡히지 않는다
        // — 2026-08-15 실측: 마지막 게시가 04-21, 116일 침묵이 무증상이었다.
        const day = 1000 * 60 * 60 * 24;
        const media = await fetch(
          `https://graph.facebook.com/v21.0/${igAccountId}/media` +
          `?fields=timestamp&limit=1&access_token=${pageToken}`
        );
        if (media.ok) {
          const { data: posts } = await media.json();
          if (posts?.length) {
            const last = posts[0].timestamp;
            const days = Math.floor((Date.now() - new Date(last).getTime()) / day);
            metric('ngk_instagram_days_since_last_post', days);
            // 주 1회 리듬을 두 번 놓치면 운영이 멈춘 것으로 본다.
            if (days > 14) {
              warn('Instagram Posting', `No post for ${days} days (last: ${last.slice(0, 10)})`);
            } else {
              pass('Instagram Posting', `Last post ${days} days ago`);
            }
          } else {
            warn('Instagram Posting', 'Account has no posts');
          }
        } else {
          const body = await media.json().catch(() => ({}));
          warn('Instagram Posting', `Cannot read media — ${body.error?.message || media.status}`);
        }
      } else {
        const body = await probe.json().catch(() => ({}));
        metric('ngk_instagram_api_up', 0);
        fail('Instagram API', `Cannot reach publishing target — ${body.error?.message || probe.status}`);
      }
    } else {
      warn('Instagram API', 'PAGE_TOKEN / IG_ACCOUNT_ID missing — cannot verify publishing');
    }
  } catch (e) {
    warn('Instagram Token', `Cannot check — ${e.message}`);
  }
}

// ── 4. places.json integrity ────────────────────────────

async function checkPlacesData() {
  try {
    const places = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'places.json'), 'utf8'));
    const total = places.length;
    const noImages = places.filter(p => !p.images || p.images.length === 0).length;
    const noNote = places.filter(p => !p.note).length;
    const noLocation = places.filter(p => !p.location).length;
    const noAddressEn = places.filter(p => !p.addressEn).length;

    metric('ngk_places_total', total);
    metric('ngk_places_missing', noImages, { field: 'images' });
    metric('ngk_places_missing', noNote, { field: 'note' });
    metric('ngk_places_missing', noLocation, { field: 'location' });
    metric('ngk_places_missing', noAddressEn, { field: 'address_en' });

    pass('places.json', `${total} places loaded`);
    if (noImages > 0) warn('Data: images', `${noImages} places without images`);
    if (noNote > 0) warn('Data: notes', `${noNote} places without notes`);
    if (noAddressEn > 0) warn('Data: addressEn', `${noAddressEn} places missing English address`);
  } catch (e) {
    fail('places.json', e.message);
  }
}

// ── 5. GA4 quick check ──────────────────────────────────

async function checkGA4() {
  try {
    const reportPath = path.join(ROOT, 'data', 'ga4-report.json');
    const stat = await fs.stat(reportPath);
    const ageHours = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60);
    const ageDays = Math.floor(ageHours / 24);
    metric('ngk_ga4_report_age_days', ageDays);

    if (ageDays > 7) {
      warn('GA4 Report', `Last updated ${ageDays} days ago — run \`npm run ga4\``);
    } else {
      const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));
      const summary = report.summary || {};
      pass('GA4 Report', `${ageDays}d old | ${summary.totalUsers || '?'} users, ${summary.totalPageviews || '?'} PVs (${summary.period || '7d'})`);
    }
  } catch (e) {
    warn('GA4 Report', `No report found — run \`npm run ga4\``);
  }
}

// ── Main ────────────────────────────────────────────────

async function main() {
  console.log(`\n🏥 noglutenkorea.com Health Check\n`);
  console.log(`📅 ${new Date().toISOString().slice(0, 19)}\n`);

  // HTTP checks (always run)
  console.log('── HTTP ──');
  await checkUrl(SITE, 'Homepage', 'homepage');
  await checkUrl(`${SITE}/sitemap.xml`, 'Sitemap', 'sitemap');
  await checkUrl(`${SITE}/robots.txt`, 'robots.txt', 'robots_txt');
  await checkUrl(`${SITE}/ads.txt`, 'ads.txt', 'ads_txt');

  // Sample place pages
  const slugs = ['237-pizza', 'monil2-house', 'cafe-pepper'];
  for (const slug of slugs) {
    await checkUrl(`${SITE}/place/${slug}`, `Place: ${slug}`, `place_${slug}`);
  }

  if (!quick) {
    console.log('\n── SSL ──');
    await checkSSL();

    console.log('\n── Instagram ──');
    await checkInstagramToken();

    console.log('\n── Data ──');
    await checkPlacesData();

    console.log('\n── Analytics ──');
    await checkGA4();
  }

  // Summary
  console.log(`\n── Summary ──`);
  console.log(`  Total checks: ${results.length}`);
  console.log(`  Passed: ${results.filter(r => r.status === '✅').length}`);
  console.log(`  Warnings: ${results.filter(r => r.status === '⚠️').length}`);
  console.log(`  Failed: ${failures}`);
  console.log(`  Status: ${failures === 0 ? '🟢 HEALTHY' : '🔴 ISSUES FOUND'}\n`);

  const warnings = results.filter(r => r.status === '⚠️').length;
  metric('ngk_check_total', results.length);
  metric('ngk_check_failed', failures);
  metric('ngk_check_warned', warnings);
  metric('ngk_healthcheck_timestamp_seconds', Math.floor(Date.now() / 1000));

  // Save report
  const reportPath = path.join(ROOT, 'data', 'healthcheck.json');
  await fs.writeFile(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    status: failures === 0 ? 'healthy' : 'issues',
    results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.status === '✅').length,
      warnings,
      failed: failures,
    },
    metrics,
  }, null, 2) + '\n');
  console.log(`Report saved: data/healthcheck.json`);

  // Prometheus 텍스트 형식 — 시계열 백엔드로 보내기 위한 출력
  const metricsPath = path.join(ROOT, 'data', 'metrics.prom');
  await fs.writeFile(metricsPath, renderPrometheus());
  console.log(`Metrics saved: data/metrics.prom (${metrics.length} samples)`);

  process.exit(failures > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
