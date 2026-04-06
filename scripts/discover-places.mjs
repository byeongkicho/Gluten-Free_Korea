#!/usr/bin/env node
/**
 * discover-places.mjs
 *
 * Search for gluten-free places via Naver Search API (Local)
 * and output candidates not already in our dataset.
 *
 * Requires: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET in .env
 * (Get from https://developers.naver.com → 지역검색 API)
 *
 * Usage:
 *   node scripts/discover-places.mjs                      # default queries
 *   node scripts/discover-places.mjs "글루텐프리 베이커리"
 *   node scripts/discover-places.mjs --all-queries         # run all preset queries
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');

// ── Load env ──────────────────────────────────────────────

async function loadEnvFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

await loadEnvFile(path.join(ROOT, '.env'));
await loadEnvFile(path.join(ROOT, '.env.local'));

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
  console.error('Missing NAVER_CLIENT_ID or NAVER_CLIENT_SECRET in .env');
  console.error('');
  console.error('Setup:');
  console.error('  1. Go to https://developers.naver.com/apps/#/register');
  console.error('  2. Create app → enable "검색" API');
  console.error('  3. Add to .env:');
  console.error('     NAVER_CLIENT_ID=your_client_id');
  console.error('     NAVER_CLIENT_SECRET=your_client_secret');
  process.exit(1);
}

// ── Config ────────────────────────────────────────────────

const PRESET_QUERIES = [
  '서울 글루텐프리',
  '서울 글루텐프리 빵',
  '서울 글루텐프리 베이커리',
  '서울 글루텐프리 케이크',
  '서울 글루텐프리 피자',
  '서울 셀리악',
  '서울 gluten free',
];

// ── Parse args ────────────────────────────────────────────

const args = process.argv.slice(2);
const allQueries = args.includes('--all-queries');
const customQuery = args.find(a => !a.startsWith('--'));

// ── Load existing SIDs ────────────────────────────────────

async function loadExistingSids() {
  const sids = new Set();

  try {
    const places = JSON.parse(await fs.readFile(path.join(DATA, 'places.json'), 'utf8'));
    for (const p of places) {
      if (p.naverPlaceId) sids.add(String(p.naverPlaceId));
    }
  } catch { /* ok */ }

  try {
    const overrides = JSON.parse(await fs.readFile(path.join(DATA, 'overrides.json'), 'utf8'));
    for (const sid of Object.keys(overrides)) sids.add(sid);
  } catch { /* ok */ }

  try {
    const candidates = JSON.parse(await fs.readFile(path.join(DATA, 'candidates.naver.json'), 'utf8'));
    for (const c of candidates) {
      if (c.sid) sids.add(String(c.sid));
    }
  } catch { /* ok */ }

  return sids;
}

// ── Naver Local Search API ────────────────────────────────

async function searchNaverLocal(query, start = 1) {
  const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5&start=${start}&sort=random`;

  const res = await fetch(url, {
    headers: {
      'X-Naver-Client-Id': NAVER_CLIENT_ID,
      'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Naver API ${res.status}: ${body.slice(0, 200)}`);
  }

  return res.json();
}

function extractSidFromLink(link) {
  // Naver local search returns links like:
  // https://map.naver.com/p/entry/place/1234567890
  // or older format with naver.me redirects
  const match = link.match(/place\/(\d+)/);
  return match ? match[1] : null;
}

function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '');
}

// ── Main ──────────────────────────────────────────────────

async function main() {
  const existingSids = await loadExistingSids();
  console.log(`Existing places: ${existingSids.size}\n`);

  const queries = allQueries ? PRESET_QUERIES : [customQuery || '서울 글루텐프리'];
  const allFound = new Map();

  for (const query of queries) {
    console.log(`Searching: "${query}"...`);

    try {
      const data = await searchNaverLocal(query);
      const items = data.items || [];

      let newCount = 0;
      for (const item of items) {
        // Try to extract SID from link
        const sid = extractSidFromLink(item.link || '');
        const name = stripHtml(item.title);

        const entry = {
          sid: sid || '',
          name,
          address: item.roadAddress || item.address || '',
          category: item.category || '',
          link: item.link || '',
          tel: item.telephone || '',
          mapx: item.mapx || '',
          mapy: item.mapy || '',
        };

        const key = sid || name; // use name as key if no SID
        if (sid && existingSids.has(sid)) continue;
        if (!allFound.has(key)) {
          allFound.set(key, { ...entry, foundBy: query });
          newCount++;
        }
      }

      console.log(`  ${items.length} results, ${newCount} new`);
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 500));
  }

  const newPlaces = [...allFound.values()];

  if (newPlaces.length === 0) {
    console.log('\nNo new places found.');
    return;
  }

  console.log('\n══════════════════════════════════════════');
  console.log(`  ${newPlaces.length} New Place(s) Found`);
  console.log('══════════════════════════════════════════\n');

  for (const p of newPlaces) {
    console.log(`  ${p.name}`);
    console.log(`    SID:      ${p.sid || '(need to resolve from link)'}`);
    console.log(`    Address:  ${p.address}`);
    console.log(`    Category: ${p.category}`);
    console.log(`    Link:     ${p.link}`);
    console.log(`    Found by: "${p.foundBy}"`);
    console.log();
  }

  // Save to file
  const outPath = path.join(DATA, 'discovered-places.json');
  const existing = await loadDiscoveredPlaces(outPath);
  const merged = mergeDiscovered(existing, newPlaces);
  await fs.writeFile(outPath, JSON.stringify(merged, null, 2) + '\n');
  console.log(`Saved ${merged.length} total candidates → data/discovered-places.json`);

  console.log('\nTo add a place:');
  console.log('  node scripts/add-place.mjs <SID> --with-images');
}

async function loadDiscoveredPlaces(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch {
    return [];
  }
}

function mergeDiscovered(existing, newPlaces) {
  const byKey = new Map(existing.map(p => [p.sid || p.name, p]));
  for (const p of newPlaces) {
    const key = p.sid || p.name;
    if (!byKey.has(key)) {
      byKey.set(key, { ...p, discoveredAt: new Date().toISOString().slice(0, 10) });
    }
  }
  return [...byKey.values()];
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
