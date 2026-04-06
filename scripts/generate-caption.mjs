#!/usr/bin/env node
/**
 * generate-caption.mjs
 *
 * Generate an Instagram caption for a place.
 * Uses Anthropic API if ANTHROPIC_API_KEY is set, otherwise falls back to template.
 *
 * Usage:
 *   node scripts/generate-caption.mjs monil2-house
 *   node scripts/generate-caption.mjs monil2-house --template   # force template mode
 *   node scripts/generate-caption.mjs monil2-house --ko         # Korean only
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

// ── Parse args ────────────────────────────────────────────

const args = process.argv.slice(2);
const forceTemplate = args.includes('--template');
const koOnly = args.includes('--ko');
const slug = args.find(a => !a.startsWith('--'));

if (!slug) {
  console.error('Usage: node scripts/generate-caption.mjs <slug> [--template] [--ko]');
  process.exit(1);
}

// ── Load place ────────────────────────────────────────────

const places = JSON.parse(await fs.readFile(path.join(DATA, 'places.json'), 'utf8'));
const place = places.find(p => p.slug === slug);

if (!place) {
  console.error(`Place not found: ${slug}`);
  console.error('Available slugs:');
  for (const p of places) console.error(`  ${p.slug} — ${p.name}`);
  process.exit(1);
}

// ── Template caption ──────────────────────────────────────

function generateTemplate(place) {
  const tags = (place.tags || []).map(t => `#${t.replace(/\s+/g, '')}`).join(' ');
  const area = place.location || '';

  const lines_en = [
    place.nameEn || place.name,
    '',
    place.note || '',
    '',
    `${place.type === 'Bakery' ? '🍞' : place.type === 'Cafe' ? '☕' : '🍽️'} ${place.type}`,
    area ? `📍 ${area}` : '',
    place.addressEn || '',
    '',
    '---',
    '',
  ];

  const lines_ko = [
    `${place.name}`,
    '',
    place.note_ko || place.note || '',
    '',
    `${place.type === 'Bakery' ? '🍞' : place.type === 'Cafe' ? '☕' : '🍽️'} ${place.type}`,
    area ? `📍 ${area}` : '',
    place.address ? `${place.address}` : '',
    '',
  ];

  const hashtags = [
    '#glutenfree #glutenfreekorea #glutenfreeseoul',
    '#셀리악 #글루텐프리 #글루텐프리서울',
    tags,
    '#noglutenkorea',
  ].filter(Boolean).join('\n');

  if (koOnly) {
    return [...lines_ko, hashtags].filter(l => l !== undefined).join('\n');
  }

  return [...lines_en, ...lines_ko, hashtags].filter(l => l !== undefined).join('\n');
}

// ── LLM caption ───────────────────────────────────────────

async function generateWithLLM(place) {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic();

  const prompt = `Generate an Instagram caption for this gluten-free restaurant/cafe in Seoul, Korea.

Place data:
- Name: ${place.name} (${place.nameEn || ''})
- Type: ${place.type}
- Location: ${place.location || place.address}
- Note (KO): ${place.note_ko || ''}
- Note (EN): ${place.note || ''}
- Tags: ${(place.tags || []).join(', ')}

Requirements:
- Bilingual: English first, then Korean (target audience is foreigners in Korea)
- English section: 2-3 lines, informative and helpful for expats/tourists
- Korean section: 2-3 lines, warm and inviting tone
- Include relevant emojis (not excessive)
- End with hashtags: #glutenfree #glutenfreekorea #글루텐프리 #셀리악 #noglutenkorea + relevant tags
- Keep total under 2200 characters (Instagram limit)
- Do NOT include image descriptions
- Do NOT use markdown formatting`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].text;
}

// ── Main ──────────────────────────────────────────────────

async function main() {
  console.log(`Generating caption for: ${place.name} (${slug})\n`);

  let caption;
  const useApi = !forceTemplate && process.env.ANTHROPIC_API_KEY;

  if (useApi) {
    console.log('Mode: LLM (Anthropic API)\n');
    caption = await generateWithLLM(place);
  } else {
    if (!forceTemplate && !process.env.ANTHROPIC_API_KEY) {
      console.log('Mode: Template (set ANTHROPIC_API_KEY for LLM generation)\n');
    } else {
      console.log('Mode: Template\n');
    }
    caption = generateTemplate(place);
  }

  console.log('════════════════════════════════════════');
  console.log(caption);
  console.log('════════════════════════════════════════');
  console.log(`\nCharacters: ${caption.length}/2200`);

  // Save to file
  const outDir = path.join(ROOT, 'data', 'captions');
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `${slug}.txt`);
  await fs.writeFile(outPath, caption);
  console.log(`Saved: data/captions/${slug}.txt`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
