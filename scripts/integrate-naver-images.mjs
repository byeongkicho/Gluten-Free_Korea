#!/usr/bin/env node
/**
 * integrate-naver-images.mjs
 *
 * Downloads photos from Naver Place and converts them to WebP
 * directly into public/images/places/{slug}/.
 *
 * Bridges the gap between fetch-naver-images (raw download) and
 * optimize-images (manual asset conversion).
 *
 * Usage:
 *   node scripts/integrate-naver-images.mjs              # all places missing images
 *   node scripts/integrate-naver-images.mjs --slug cafe-rebirths  # specific place
 *   node scripts/integrate-naver-images.mjs --force       # re-download all
 *   node scripts/integrate-naver-images.mjs --max-photos 3  # limit per place
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA = join(ROOT, 'data');
const PLACES_IMG_DIR = join(ROOT, 'public', 'images', 'places');
const TMP_DIR = join(ROOT, '.tmp-naver-images');

const FULL_MAX_WIDTH = 1200;
const THUMB_MAX_WIDTH = 640;
const WEBP_QUALITY = 80;
const DEFAULT_MAX_PHOTOS = 5;
const DELAY_MS = 1500;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

// ── Parse args ────────────────────────────────────────────

const args = process.argv.slice(2);
const force = args.includes('--force');
const augment = args.includes('--augment'); // add more photos to places that already have some
const slugFilter = args.includes('--slug') ? args[args.indexOf('--slug') + 1] : null;
const maxPhotos = args.includes('--max-photos')
  ? parseInt(args[args.indexOf('--max-photos') + 1], 10)
  : DEFAULT_MAX_PHOTOS;

// ── Load data ─────────────────────────────────────────────

const places = JSON.parse(readFileSync(join(DATA, 'places.json'), 'utf8'));

// ── Helpers ───────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchPhotoUrls(sid) {
  const url = `https://m.place.naver.com/restaurant/${sid}/photo`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);

  const html = await res.text();
  const re = /ldb-phinf\.pstatic\.net(?:\\u002F|%2F|\/)[^\s"'<>)\\}]+/g;
  const raw = [];
  let m;
  while ((m = re.exec(html)) !== null) raw.push(m[0]);

  const seen = new Set();
  const urls = [];
  for (const r of raw) {
    let u = 'https://' + r
      .replace(/\\u002F/g, '/')
      .replace(/%2F/gi, '/');
    u = u.replace(/[;,]+$/, '');
    if (!seen.has(u)) {
      seen.add(u);
      urls.push(u);
    }
  }
  return urls;
}

async function downloadToTmp(url, destPath) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destPath));
}

async function convertToWebp(inputPath, outputPath, maxWidth) {
  await sharp(inputPath)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(outputPath);
}

function placeHasImages(slug) {
  const dir = join(PLACES_IMG_DIR, slug);
  if (!existsSync(dir)) return false;
  const files = readdirSync(dir);
  return files.some(f => extname(f) === '.webp' && !f.startsWith('thumb_'));
}

// ── Main ──────────────────────────────────────────────────

async function main() {
  // Filter places that need images
  let targets = places.filter(p => {
    if (!p.naverPlaceId) return false;
    if (slugFilter && p.slug !== slugFilter) return false;
    if (!force && !augment && placeHasImages(p.slug)) return false;
    return true;
  });

  if (targets.length === 0) {
    console.log('No places need Naver images.');
    if (slugFilter) console.log(`  (slug "${slugFilter}" either has images or was not found)`);
    return;
  }

  console.log(`\nProcessing ${targets.length} place(s)...\n`);

  mkdirSync(TMP_DIR, { recursive: true });

  let success = 0;
  let failed = 0;

  for (const place of targets) {
    const { slug, naverPlaceId: sid, name } = place;
    console.log(`${name} (${slug}, sid=${sid})`);

    try {
      const urls = await fetchPhotoUrls(sid);
      if (urls.length === 0) {
        console.log(`  No photos found on Naver\n`);
        failed++;
        continue;
      }

      const toDownload = urls.slice(0, maxPhotos);
      const outDir = join(PLACES_IMG_DIR, slug);
      mkdirSync(outDir, { recursive: true });

      // Find existing max number to avoid overwriting
      let startNum = 1;
      if (force) {
        // When forcing, start from 1 (will overwrite)
      } else if (existsSync(outDir)) {
        const existing = readdirSync(outDir)
          .filter(f => /^\d+\.webp$/.test(f))
          .map(f => parseInt(f, 10));
        if (existing.length > 0) startNum = Math.max(...existing) + 1;
      }

      let count = 0;
      for (let i = 0; i < toDownload.length; i++) {
        const num = String(startNum + i).padStart(2, '0');
        const tmpPath = join(TMP_DIR, `${slug}_${num}.jpg`);
        const fullPath = join(outDir, `${num}.webp`);
        const thumbPath = join(outDir, `thumb_${num}.webp`);

        try {
          await downloadToTmp(toDownload[i], tmpPath);
          await convertToWebp(tmpPath, fullPath, FULL_MAX_WIDTH);
          await convertToWebp(tmpPath, thumbPath, THUMB_MAX_WIDTH);
          console.log(`  ${num}.webp + thumb`);
          count++;
        } catch (err) {
          console.warn(`  Failed ${num}: ${err.message}`);
        }
      }

      console.log(`  ${count}/${toDownload.length} images ready\n`);
      if (count > 0) success++;
      else failed++;

    } catch (err) {
      console.error(`  Error: ${err.message}\n`);
      failed++;
    }

    await sleep(DELAY_MS);
  }

  // Cleanup tmp
  try {
    const { rm } = await import('node:fs/promises');
    await rm(TMP_DIR, { recursive: true });
  } catch { /* ok */ }

  console.log('── Summary ──');
  console.log(`  Success: ${success}`);
  console.log(`  Failed:  ${failed}`);
  console.log(`  Output:  public/images/places/{slug}/`);
  console.log('\nNext steps:');
  console.log('  npm run build:places    # rebuild places.json with new images');
  console.log('  npm run build           # rebuild site');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
