#!/usr/bin/env node
/**
 * fetch-naver-images.mjs
 *
 * Downloads photos from Naver Place for each restaurant/cafe in candidates.naver.json.
 * Uses the mobile web page to extract ldb-phinf image URLs (no browser needed).
 *
 * Usage: node scripts/fetch-naver-images.mjs [--force]
 *   --force: re-download even if photos already exist in manifest
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA = join(ROOT, 'data');
const IMAGES_DIR = join(DATA, 'naver-images');
const MANIFEST_PATH = join(IMAGES_DIR, 'manifest.json');
const MAX_PHOTOS = 5;
const DELAY_MS = 1500; // between places
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

const force = process.argv.includes('--force');

// ── Load data ──────────────────────────────────────────────

const candidates = JSON.parse(readFileSync(join(DATA, 'candidates.naver.json'), 'utf8'));
const places = JSON.parse(readFileSync(join(DATA, 'places.json'), 'utf8'));

// Build sid → slug map
const sidToSlug = new Map();
for (const p of places) {
  if (p.naverPlaceId) sidToSlug.set(String(p.naverPlaceId), p.slug);
}

// Load or init manifest
mkdirSync(IMAGES_DIR, { recursive: true });
let manifest = {};
if (existsSync(MANIFEST_PATH)) {
  manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
}

// ── Helpers ────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Fetch the Naver Place photo page and extract ldb-phinf image URLs.
 * "restaurant" path works for all types (restaurant, cafe, bar).
 */
async function fetchPhotoUrls(sid) {
  const url = `https://m.place.naver.com/restaurant/${sid}/photo`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);

  const html = await res.text();

  // Extract ldb-phinf URLs (appear in multiple encodings)
  const re = /ldb-phinf\.pstatic\.net(?:\\u002F|%2F|\/)[^\s"'<>)\\}]+/g;
  const raw = [];
  let m;
  while ((m = re.exec(html)) !== null) raw.push(m[0]);

  // Normalize: decode unicode escapes, deduplicate
  const seen = new Set();
  const urls = [];
  for (const r of raw) {
    let u = 'https://' + r
      .replace(/\\u002F/g, '/')
      .replace(/%2F/gi, '/');
    // Remove any trailing punctuation artefacts
    u = u.replace(/[;,]+$/, '');
    if (!seen.has(u)) {
      seen.add(u);
      urls.push(u);
    }
  }
  return urls;
}

/**
 * Download an image to a local file.
 */
async function downloadImage(url, destPath) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status} for ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destPath));
}

// ── Main ───────────────────────────────────────────────────

async function main() {
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const cand of candidates) {
    const sid = String(cand.sid);
    const slug = sidToSlug.get(sid);
    if (!slug) {
      console.warn(`⚠ No slug found for sid=${sid} (${cand.name}), skipping`);
      failed++;
      continue;
    }

    // Skip if already in manifest (unless --force)
    if (!force && manifest[slug] && manifest[slug].photos.length > 0) {
      console.log(`⏭ ${slug} — already has ${manifest[slug].photos.length} photos`);
      skipped++;
      continue;
    }

    console.log(`📸 ${slug} (sid=${sid})...`);

    try {
      const urls = await fetchPhotoUrls(sid);
      if (urls.length === 0) {
        console.log(`   ⚠ No photos found`);
        manifest[slug] = { sid, photos: [] };
        failed++;
        continue;
      }

      const placeDir = join(IMAGES_DIR, slug);
      mkdirSync(placeDir, { recursive: true });

      const photos = [];
      const toDownload = urls.slice(0, MAX_PHOTOS);

      for (let i = 0; i < toDownload.length; i++) {
        const file = `naver_${String(i + 1).padStart(2, '0')}.jpg`;
        const dest = join(placeDir, file);
        try {
          await downloadImage(toDownload[i], dest);
          photos.push({ file, sourceUrl: toDownload[i] });
          process.stdout.write(`   ✓ ${file}\n`);
        } catch (err) {
          console.warn(`   ✗ ${file}: ${err.message}`);
        }
      }

      manifest[slug] = { sid, photos };
      downloaded++;
      console.log(`   → ${photos.length}/${toDownload.length} saved`);
    } catch (err) {
      console.error(`   ✗ Error: ${err.message}`);
      manifest[slug] = { sid, photos: [] };
      failed++;
    }

    // Save manifest after each place (crash-safe)
    writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

    // Rate limit
    await sleep(DELAY_MS);
  }

  // Final save
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

  console.log('\n── Summary ──');
  console.log(`  Downloaded: ${downloaded} places`);
  console.log(`  Skipped:    ${skipped} places`);
  console.log(`  Failed:     ${failed} places`);
  console.log(`  Manifest:   ${MANIFEST_PATH}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
