#!/usr/bin/env node
/**
 * add-place.mjs
 *
 * Add a new place to overrides.json from a Naver Place SID or URL.
 * Fetches basic info from Naver, creates an override entry, and
 * optionally downloads images.
 *
 * Usage:
 *   node scripts/add-place.mjs 1234567890
 *   node scripts/add-place.mjs https://map.naver.com/p/entry/place/1234567890
 *   node scripts/add-place.mjs 1234567890 --with-images
 *   node scripts/add-place.mjs --manual "My Place Name"
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OVERRIDES_PATH = path.join(ROOT, 'data', 'overrides.json');

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

// ── Parse args ────────────────────────────────────────────

const args = process.argv.slice(2);
const withImages = args.includes('--with-images');
const isManual = args.includes('--manual');
const input = args.find(a => !a.startsWith('--'));

if (!input) {
  console.error('Usage: node scripts/add-place.mjs <SID or URL> [--with-images]');
  console.error('       node scripts/add-place.mjs --manual "Place Name"');
  process.exit(1);
}

// ── Extract SID ───────────────────────────────────────────

function extractSid(input) {
  // URL: https://map.naver.com/p/entry/place/1234567890
  const urlMatch = input.match(/place\/(\d+)/);
  if (urlMatch) return urlMatch[1];
  // Pure number
  if (/^\d+$/.test(input)) return input;
  return null;
}

// ── Fetch Naver Place info ────────────────────────────────

async function fetchNaverPlaceInfo(sid) {
  // Use the mobile place page to extract basic info
  const url = `https://m.place.naver.com/restaurant/${sid}/home`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);

  const html = await res.text();

  // Extract JSON-LD or meta info from the page
  const info = {};

  // Name from <title>
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/);
  if (titleMatch) {
    info.name = titleMatch[1]
      .replace(/\s*:\s*네이버.*$/, '')
      .replace(/\s*-\s*네이버.*$/, '')
      .trim();
  }

  // Address from meta
  const addrMatch = html.match(/"roadAddress"\s*:\s*"([^"]+)"/);
  if (addrMatch) info.address = addrMatch[1];
  if (!info.address) {
    const addrMatch2 = html.match(/"address"\s*:\s*"([^"]+)"/);
    if (addrMatch2) info.address = addrMatch2[1];
  }

  // Coordinates
  const latMatch = html.match(/"y"\s*:\s*"?([\d.]+)"?/);
  const lngMatch = html.match(/"x"\s*:\s*"?([\d.]+)"?/);
  if (latMatch) info.lat = parseFloat(latMatch[1]);
  if (lngMatch) info.lng = parseFloat(lngMatch[1]);

  // Category/type
  const catMatch = html.match(/"category"\s*:\s*"([^"]+)"/);
  if (catMatch) info.category = catMatch[1];

  // Phone
  const phoneMatch = html.match(/"phone"\s*:\s*"([^"]+)"/);
  if (phoneMatch) info.phone = phoneMatch[1];

  return info;
}

function guessType(category) {
  if (!category) return 'Restaurant';
  const c = category.toLowerCase();
  if (c.includes('카페') || c.includes('cafe') || c.includes('coffee')) return 'Cafe';
  if (c.includes('베이커리') || c.includes('bakery') || c.includes('빵')) return 'Bakery';
  return 'Restaurant';
}

function slugify(name) {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── Main ──────────────────────────────────────────────────

async function main() {
  const overrides = JSON.parse(await fs.readFile(OVERRIDES_PATH, 'utf8'));

  if (isManual) {
    // Manual place (no Naver SID)
    const name = input;
    const slug = slugify(name);
    const sid = `manual_${slug}`;

    if (overrides[sid]) {
      console.error(`Already exists: ${sid}`);
      process.exit(1);
    }

    overrides[sid] = {
      name,
      nameEn: '',
      type: 'Restaurant',
      address: '',
      addressEn: '',
      location: '',
      lat: null,
      lng: null,
      note: '',
      note_ko: '',
      tags: [],
      naverMapUrl: '',
      website: '',
      instagram: '',
    };

    await fs.writeFile(OVERRIDES_PATH, JSON.stringify(overrides, null, 2) + '\n');
    console.log(`Added manual place: ${sid}`);
    console.log('  Fill in the details in data/overrides.json');
    return;
  }

  // Naver place
  const sid = extractSid(input);
  if (!sid) {
    console.error(`Cannot extract SID from: ${input}`);
    process.exit(1);
  }

  if (overrides[sid]) {
    console.error(`SID ${sid} already exists in overrides.json`);
    process.exit(1);
  }

  console.log(`Fetching Naver Place info for SID ${sid}...`);
  const info = await fetchNaverPlaceInfo(sid);

  const type = guessType(info.category);
  let slug = slugify(info.name || `place-${sid}`);
  if (!slug) slug = `place-${sid}`; // fallback for Korean-only names

  const entry = {
    nameEn: '',
    slug,
    type,
    location: '',
    addressEn: '',
    note: '',
    note_ko: '',
    tags: [],
  };

  // Add optional fields if found
  if (info.lat) entry.lat = info.lat;
  if (info.lng) entry.lng = info.lng;

  overrides[sid] = entry;
  await fs.writeFile(OVERRIDES_PATH, JSON.stringify(overrides, null, 2) + '\n');

  console.log(`\nAdded to overrides.json:`);
  console.log(`  SID:      ${sid}`);
  console.log(`  Name:     ${info.name || '(not found)'}`);
  console.log(`  Slug:     ${slug}`);
  console.log(`  Type:     ${type}`);
  console.log(`  Address:  ${info.address || '(not found)'}`);
  console.log(`  Category: ${info.category || '(not found)'}`);
  console.log(`  Coords:   ${info.lat || '?'}, ${info.lng || '?'}`);

  console.log(`\nTODO: Fill in nameEn, location, addressEn, note, note_ko, tags`);

  if (withImages) {
    console.log(`\nDownloading Naver images...`);
    execSync(
      `node scripts/integrate-naver-images.mjs --slug ${slug} --augment`,
      { stdio: 'inherit' }
    );
  }

  console.log(`\nNext steps:`);
  console.log(`  1. Edit data/overrides.json — fill nameEn, note, note_ko, tags`);
  console.log(`  2. npm run build:places && npm run validate:places`);
  console.log(`  3. npm run build`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
