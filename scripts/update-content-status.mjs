#!/usr/bin/env node
/**
 * update-content-status.mjs
 *
 * Post-publish hook: updates wiki pages after an Instagram post.
 *
 * Usage:
 *   node scripts/update-content-status.mjs <slug> --posted
 *
 * Updates:
 *   1. operations/콘텐츠 현황.md — IG상태 → "posted YYYY-MM-DD", 캡션상태 → "done"
 *   2. entities/{name}.md — ig_status: draft → ig_status: posted
 *   3. operations/인스타그램 운영.md — 게시 이력 테이블에 행 추가
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const WIKI = path.join(ROOT, 'NoGlutenKorea');
const DATA = path.join(ROOT, 'data');

const args = process.argv.slice(2);
const slug = args.find(a => !a.startsWith('--'));
const isPosted = args.includes('--posted');

if (!slug || !isPosted) {
  console.error('Usage: node scripts/update-content-status.mjs <slug> --posted');
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);

// ── Load place data ──────────────────────────────────────

const places = JSON.parse(await fs.readFile(path.join(DATA, 'places.json'), 'utf8'));
const place = places.find(p => p.slug === slug);
if (!place) {
  console.error(`Place not found: ${slug}`);
  process.exit(1);
}

const imageCount = (place.images || []).length;
const name = place.name;

console.log(`Updating content status for: ${name} (${slug})\n`);

// ── 1. Update 콘텐츠 현황.md ─────────────────────────────

const statusPath = path.join(WIKI, 'operations', '콘텐츠 현황.md');
let statusContent = await fs.readFile(statusPath, 'utf8');

// Update matrix row: find the row with this slug and update IG상태 + 캡션상태
const rowRegex = new RegExp(`(\\| ${slug} \\|.*?\\|.*?\\|.*?\\|.*?\\|.*?\\|.*?\\|) \\w[\\w -]* \\| \\w+ \\|`);
const matrixMatch = statusContent.match(rowRegex);
if (matrixMatch) {
  statusContent = statusContent.replace(rowRegex, `$1 posted ${today} | done |`);
  console.log('  [1/3] 콘텐츠 현황.md — matrix row updated');
} else {
  // Fallback: try simpler pattern
  const simpleRegex = new RegExp(`(\\| ${slug} \\|[^\\n]*?)\\| ready \\| draft \\|`);
  if (simpleRegex.test(statusContent)) {
    statusContent = statusContent.replace(simpleRegex, `$1| posted ${today} | done |`);
    console.log('  [1/3] 콘텐츠 현황.md — matrix row updated (fallback)');
  } else {
    console.log('  [1/3] 콘텐츠 현황.md — row not found, manual update needed');
  }
}

// Update queue: remove from upload queue or mark as done
const queueRowRegex = new RegExp(`\\| \\d+ \\| ${slug} \\|[^\\n]*\\n`);
if (queueRowRegex.test(statusContent)) {
  statusContent = statusContent.replace(queueRowRegex, '');
  console.log('       — removed from upload queue');
}

// Update the updated date in frontmatter
statusContent = statusContent.replace(/updated: \d{4}-\d{2}-\d{2}/, `updated: ${today}`);

await fs.writeFile(statusPath, statusContent);

// ── 2. Update entity page ────────────────────────────────

const entityCandidates = [name, slug];
let entityUpdated = false;

for (const entityName of entityCandidates) {
  const entityPath = path.join(WIKI, 'entities', `${entityName}.md`);
  try {
    let entityContent = await fs.readFile(entityPath, 'utf8');
    if (entityContent.includes('ig_status: draft') || entityContent.includes('ig_status: ready')) {
      entityContent = entityContent.replace(/ig_status: (draft|ready)/, 'ig_status: posted');
      entityContent = entityContent.replace(/updated: \d{4}-\d{2}-\d{2}/, `updated: ${today}`);
      await fs.writeFile(entityPath, entityContent);
      console.log(`  [2/3] entities/${entityName}.md — ig_status → posted`);
      entityUpdated = true;
      break;
    }
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
}
if (!entityUpdated) {
  console.log('  [2/3] Entity page — not found or already posted');
}

// ── 3. Update 인스타그램 운영.md ─────────────────────────

const igOpsPath = path.join(WIKI, 'operations', '인스타그램 운영.md');
let igContent = await fs.readFile(igOpsPath, 'utf8');

// Count images from Cloudinary (cover + place images)
const totalImages = imageCount + 1; // +1 for cover

// Add row to 게시 이력 table (before ## 게시 대기 매장)
const historyRow = `| ${today} | ${name} (${slug}) | 캐러셀 | ${totalImages} |`;
const insertPoint = igContent.indexOf('## 게시 대기 매장');
if (insertPoint !== -1) {
  // Find the last row of the history table (line before the empty line before 대기 매장)
  const beforeWaiting = igContent.slice(0, insertPoint).trimEnd();
  igContent = beforeWaiting + '\n' + historyRow + '\n\n' + igContent.slice(insertPoint);
  console.log(`  [3/3] 인스타그램 운영.md — history row added`);
} else {
  console.log('  [3/3] 인스타그램 운영.md — insert point not found, manual update needed');
}

// Remove from 대기 매장 table
const waitRegex = new RegExp(`\\| ${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\|[^\\n]*\\n`);
if (waitRegex.test(igContent)) {
  igContent = igContent.replace(waitRegex, '');
  console.log('       — removed from waiting list');
}

igContent = igContent.replace(/updated: \d{4}-\d{2}-\d{2}/, `updated: ${today}`);
await fs.writeFile(igOpsPath, igContent);

console.log('\nDone! Review changes in Obsidian.');
