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

// ── 1. HTTP checks ───────────────────────────────────────

async function checkUrl(url, label) {
  const start = Date.now();
  try {
    const res = await fetch(url, { redirect: 'follow' });
    const elapsed = Date.now() - start;
    if (res.ok) {
      pass(label, `HTTP ${res.status} (${elapsed}ms)`);
    } else {
      fail(label, `HTTP ${res.status} (${elapsed}ms)`);
    }
    return { status: res.status, elapsed };
  } catch (e) {
    fail(label, `UNREACHABLE — ${e.message}`);
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

async function checkInstagramToken() {
  try {
    const credsPath = path.join(process.env.HOME, '.instagram-creds');
    const raw = await fs.readFile(credsPath, 'utf8');
    const creds = {};
    raw.split('\n').forEach(l => {
      const [k, ...v] = l.split('=');
      if (k && !k.startsWith('#')) creds[k.trim()] = v.join('=').trim();
    });

    const token = creds.LONG_LIVED_TOKEN;
    if (!token) { warn('Instagram Token', 'No token found'); return; }

    const res = await fetch(`https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${token}`);
    if (res.ok) {
      // Token works — estimate expiry (~60 days from last refresh)
      pass('Instagram Token', 'Valid (API responded OK)');
    } else {
      const body = await res.json();
      fail('Instagram Token', `Invalid — ${body.error?.message || res.status}`);
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
  await checkUrl(SITE, 'Homepage');
  await checkUrl(`${SITE}/sitemap.xml`, 'Sitemap');
  await checkUrl(`${SITE}/robots.txt`, 'robots.txt');
  await checkUrl(`${SITE}/ads.txt`, 'ads.txt');

  // Sample place pages
  const slugs = ['237-pizza', 'monil2-house', 'cafe-pepper'];
  for (const slug of slugs) {
    await checkUrl(`${SITE}/place/${slug}`, `Place: ${slug}`);
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

  // Save report
  const reportPath = path.join(ROOT, 'data', 'healthcheck.json');
  await fs.writeFile(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    status: failures === 0 ? 'healthy' : 'issues',
    results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.status === '✅').length,
      warnings: results.filter(r => r.status === '⚠️').length,
      failed: failures,
    },
  }, null, 2) + '\n');
  console.log(`Report saved: data/healthcheck.json`);

  process.exit(failures > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
