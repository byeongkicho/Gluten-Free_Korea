#!/usr/bin/env node

/**
 * fetch-cu-gf.mjs
 *
 * CU 편의점 현재 판매 상품을 수집하고 GF 가능성을 분류.
 *
 * Usage:
 *   node scripts/fetch-cu-gf.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'data', 'cu-gf-guide.json');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── GF Classification Rules ─────────────────────────────

// 이름에 포함되면 무조건 글루텐 (밀가루 기반)
const ALWAYS_GLUTEN = [
  '빵', '샌드', '버거', '면)', '스파게', '파스타', '우동', '라면', '라멘',
  '돈까스', '돈카츠', '카레', '멘보샤', '만두', '교자', '크로와상',
  '토스트', '핫도그', '머핀', '피자', '크림빵', '모닝빵',
];

// 이름에 포함되면 글루텐 가능성 높음 (간장/고추장 양념류)
const LIKELY_GLUTEN = [
  '불고기', '갈비', '닭갈비', '떡갈비', '데리야끼', '제육', '장조림',
  '간장', '짜장', '짬뽕', '탕수', '마라', '볶음밥',
];

// 이름에 포함되면 GF 가능성 높음 (단순 재료)
const LIKELY_GF = [
  '참치마요', '명란', '계란', '새우', '연어',
];

// 카테고리(접두사) 기반 분류
const CATEGORY_PREFIX = {
  '삼)': { cat: 'triangle', catKo: '삼각김밥', catEn: 'Triangle Kimbap' },
  '빅삼)': { cat: 'triangle', catKo: '빅삼각김밥', catEn: 'Big Triangle Kimbap' },
  '주)': { cat: 'onigiri', catKo: '주먹밥', catEn: 'Rice Ball' },
  '김)': { cat: 'kimbap', catKo: '김밥', catEn: 'Kimbap' },
  '도)': { cat: 'dosirak', catKo: '도시락', catEn: 'Lunch Box' },
  '샌)': { cat: 'sandwich', catKo: '샌드위치', catEn: 'Sandwich' },
  '샐)': { cat: 'salad', catKo: '샐러드', catEn: 'Salad' },
  '햄)': { cat: 'burger', catKo: '햄버거', catEn: 'Burger' },
  '면)': { cat: 'noodle', catKo: '면류', catEn: 'Noodles' },
  '겟모닝)': { cat: 'morning', catKo: '겟모닝', catEn: 'Get Morning' },
  '즉석빵)': { cat: 'bread', catKo: '빵류', catEn: 'Bread' },
};

// 카테고리 자체가 글루텐인 것
const GLUTEN_CATEGORIES = ['sandwich', 'burger', 'noodle', 'morning', 'bread'];

function classifyProduct(name) {
  const n = name.toLowerCase();

  // 1. 카테고리 확인
  const prefixKey = Object.keys(CATEGORY_PREFIX).find(k => name.startsWith(k));
  const catInfo = prefixKey ? CATEGORY_PREFIX[prefixKey] : { cat: 'other', catKo: '기타', catEn: 'Other' };

  // 카테고리 자체가 글루텐
  if (GLUTEN_CATEGORIES.includes(catInfo.cat)) {
    return { ...catInfo, gfLevel: 'gluten', reason: 'category' };
  }

  // 2. 이름 기반
  for (const kw of ALWAYS_GLUTEN) {
    if (n.includes(kw)) return { ...catInfo, gfLevel: 'gluten', reason: kw };
  }
  for (const kw of LIKELY_GLUTEN) {
    if (n.includes(kw)) return { ...catInfo, gfLevel: 'risky', reason: kw };
  }
  for (const kw of LIKELY_GF) {
    if (n.includes(kw)) return { ...catInfo, gfLevel: 'possible', reason: kw };
  }

  // 3. 기본: 확인 필요
  return { ...catInfo, gfLevel: 'check', reason: 'unknown' };
}

// ── Fetch CU Products ────────────────────────────────────

async function fetchCUPage(page) {
  const res = await fetch('https://cu.bgfretail.com/product/productAjax.do', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0',
      'Referer': 'https://cu.bgfretail.com/product/product.do'
    },
    body: `pageIndex=${page}&listType=1&sortType=&depth1=1&depth2=4&depth3=`
  });
  const html = await res.text();
  const names = [...html.matchAll(/<p>([^<]+)<\/p>/g)].map(m => m[1].trim());
  const prices = [...html.matchAll(/<strong>([0-9,]+)<\/strong>/g)].map(m => m[1]);
  const imgs = [...html.matchAll(/src="(\/\/tqklhszfkvzk[^"]+)"/g)].map(m => 'https:' + m[1]);
  const products = [];
  for (let i = 0; i < Math.min(names.length, prices.length); i++) {
    products.push({ name: names[i], price: prices[i], image: imgs[i] || null });
  }
  return products;
}

async function main() {
  console.log('Fetching CU products...\n');

  let all = [];
  let page = 1;
  while (true) {
    const items = await fetchCUPage(page);
    if (items.length === 0) break;
    all.push(...items);
    page++;
    await sleep(200);
  }
  console.log(`CU products: ${all.length}\n`);

  // Classify
  const classified = all.map(p => {
    const cls = classifyProduct(p.name);
    return { ...p, ...cls };
  });

  const stats = { possible: 0, check: 0, risky: 0, gluten: 0 };
  classified.forEach(p => stats[p.gfLevel]++);

  console.log('── Classification ──');
  console.log(`  ✅ GF possible: ${stats.possible}`);
  console.log(`  ❓ Check label: ${stats.check}`);
  console.log(`  ⚠️ Likely gluten: ${stats.risky}`);
  console.log(`  ❌ Contains gluten: ${stats.gluten}`);
  console.log('');

  console.log('── GF Possible ──');
  classified.filter(p => p.gfLevel === 'possible').forEach(p =>
    console.log(`  ✅ ${p.name} (${p.price}원) [${p.catKo}]`)
  );

  console.log('\n── Check Label ──');
  classified.filter(p => p.gfLevel === 'check').forEach(p =>
    console.log(`  ❓ ${p.name} (${p.price}원) [${p.catKo}]`)
  );

  // Save
  const output = {
    fetchedAt: new Date().toISOString(),
    total: all.length,
    stats,
    products: classified,
  };

  await fs.writeFile(OUTPUT, JSON.stringify(output, null, 2) + '\n');
  console.log(`\nSaved: data/cu-gf-guide.json`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
