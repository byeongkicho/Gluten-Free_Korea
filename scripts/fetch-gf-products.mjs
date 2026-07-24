#!/usr/bin/env node

/**
 * fetch-gf-products.mjs
 *
 * HACCP API에서 "밀" 미포함 제품을 수집하여 GF 안전 제품 목록 생성.
 *
 * Usage:
 *   node scripts/fetch-gf-products.mjs                # 전체 수집 (시간 걸림)
 *   node scripts/fetch-gf-products.mjs --pages 10     # 10페이지만
 *   node scripts/fetch-gf-products.mjs --category 과자 # 특정 카테고리만
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'data', 'gf-products.json');

// Load .env
const envRaw = await fs.readFile(path.join(ROOT, '.env'), 'utf8');
const env = {};
envRaw.split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && !k.startsWith('#')) env[k.trim()] = v.join('=').trim();
});

const API_KEY = env.HACCP_API_KEY;
if (!API_KEY) { console.error('HACCP_API_KEY not found in .env'); process.exit(1); }

const BASE = 'https://apis.data.go.kr/B553748/CertImgListServiceV3/getCertImgListServiceV3';
const ROWS_PER_PAGE = 100;
const GLUTEN_KEYWORDS = ['밀', '밀가루', '보리', '호밀'];

const args = process.argv.slice(2);
const maxPagesIdx = args.indexOf('--pages');
const maxPages = maxPagesIdx !== -1 ? Number(args[maxPagesIdx + 1]) : null;
const catIdx = args.indexOf('--category');
const categoryFilter = catIdx !== -1 ? args[catIdx + 1] : null;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Hidden gluten: ingredients that contain gluten but may not be listed as 밀 allergen
const HIDDEN_GLUTEN_RAW = ['소맥', '보리', '호밀', '맥아', '맥주', '간장', '고추장', '된장', '쌈장'];

function containsGluten(allergy, rawmtrl) {
  if (!allergy && !rawmtrl) return true; // No data = can't confirm safe
  const allergyStr = (allergy || '').toLowerCase();
  const rawStr = (rawmtrl || '').toLowerCase();

  // "없음" means no allergens
  if (allergyStr === '없음' && !rawStr) return false;

  // Check allergen field
  for (const kw of GLUTEN_KEYWORDS) {
    if (allergyStr.includes(kw)) return true;
  }
  // Check raw materials for wheat flour
  if (rawStr.includes('밀가루') || rawStr.includes('소맥분')) return true;
  // Check for standalone 밀 in raw materials (e.g. "(밀)", ",밀,", ",밀)")
  if (/[,(]\s*밀\s*[,)]/.test(rawStr) || rawStr.endsWith('밀)') || rawStr.endsWith(',밀')) return true;
  // Check for hidden gluten in raw materials
  for (const kw of HIDDEN_GLUTEN_RAW) {
    if (rawStr.includes(kw)) return true;
  }
  return false;
}


async function fetchPage(pageNo, category) {
  const params = new URLSearchParams({
    ServiceKey: API_KEY,
    returnType: 'json',
    numOfRows: String(ROWS_PER_PAGE),
    pageNo: String(pageNo),
  });
  if (category) params.set('prdkind', category);

  const url = `${BASE}?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  if (data.header?.resultCode !== 'OK') {
    throw new Error(`API error: ${data.header?.resultMessage}`);
  }

  const totalCount = Number(data.body?.totalCount || 0);
  const items = (data.body?.items || []).map(i => i.item);
  return { items, totalCount };
}

async function main() {
  console.log('Fetching GF-safe products from HACCP API...\n');

  // First fetch to get total count
  const first = await fetchPage(1, categoryFilter);
  const totalCount = first.totalCount;
  const totalPages = Math.ceil(totalCount / ROWS_PER_PAGE);
  const pagesToFetch = maxPages ? Math.min(maxPages, totalPages) : totalPages;

  console.log(`Total products: ${totalCount}`);
  console.log(`Pages: ${pagesToFetch}/${totalPages} (${ROWS_PER_PAGE}/page)`);
  if (categoryFilter) console.log(`Category: ${categoryFilter}`);
  console.log('');

  const gfProducts = [];
  let scanned = 0;
  let glutenCount = 0;

  for (let page = 1; page <= pagesToFetch; page++) {
    try {
      const { items } = page === 1 ? first : await fetchPage(page, categoryFilter);

      for (const item of items) {
        scanned++;
        if (!containsGluten(item.allergy, item.rawmtrl)) {
          gfProducts.push({
            name: item.prdlstNm,
            category: item.prdkind,
            manufacturer: item.manufacture,
            seller: item.seller || null,
            allergens: item.allergy || '없음',
            rawMaterials: item.rawmtrl || null,
            barcode: item.barcode || null,
            image: item.imgurl1 || null,
            reportNo: item.prdlstReportNo,
          });
        } else {
          glutenCount++;
        }
      }

      process.stdout.write(`\r  Page ${page}/${pagesToFetch} | Scanned: ${scanned} | GF: ${gfProducts.length} | Gluten: ${glutenCount}`);
    } catch (e) {
      console.error(`\n  Page ${page} error: ${e.message}`);
    }

    // Rate limit: 100ms between requests
    if (page < pagesToFetch) await sleep(100);
  }

  console.log('\n');

  // Categorize
  const categories = {};
  for (const p of gfProducts) {
    const cat = p.category || '기타';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(p);
  }

  // Sort categories by count
  const sortedCategories = Object.entries(categories)
    .sort((a, b) => b[1].length - a[1].length);

  console.log('── GF Products by Category ──');
  for (const [cat, items] of sortedCategories) {
    console.log(`  ${cat}: ${items.length}개`);
  }

  // Save
  const output = {
    fetchedAt: new Date().toISOString(),
    totalScanned: scanned,
    totalGF: gfProducts.length,
    totalGluten: glutenCount,
    categories: Object.fromEntries(sortedCategories),
    products: gfProducts,
  };

  await fs.writeFile(OUTPUT, JSON.stringify(output, null, 2) + '\n');
  console.log(`\nSaved: data/gf-products.json (${gfProducts.length} products)`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
