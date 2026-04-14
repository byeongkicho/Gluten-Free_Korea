#!/usr/bin/env node

/**
 * Instagram 커버 이미지 생성
 *
 * 첫 번째 사진에 하단 그라데이션 + 매장 정보 텍스트 오버레이
 *
 * Usage:
 *   node scripts/generate-cover.mjs vegetus
 *   node scripts/generate-cover.mjs vegetus feeke x-ake
 *   node scripts/generate-cover.mjs --all
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const placesPath = path.join(rootDir, "data", "places.json");
const imagesDir = path.join(rootDir, "public", "images", "places");
const outputDir = path.join(rootDir, "data", "instagram-covers");

const SIZE = 1080;

const TYPE_LABEL = {
  Restaurant: "Restaurant",
  Cafe: "Cafe",
  Bakery: "Bakery",
  Bar: "Bar",
};

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createOverlaySvg(place) {
  // Strip trailing type words only (preserve leading brand names like "Cafe Pepper")
  const rawName = place.nameEn || place.name;
  const name = escapeXml(
    rawName.replace(/\s+(Gluten[- ]?Free|GF|Cafe|Restaurant|Bakery|Bar)$/gi, "").trim()
    || rawName
  );
  const cx = SIZE / 2; // center x

  const isDedicated =
    DEDICATED_SLUGS.has(place.slug) ||
    place.note?.toLowerCase().includes("dedicated") ||
    place.note?.toLowerCase().includes("100%");
  const badge = isDedicated ? "DEDICATED GLUTEN-FREE" : "GLUTEN-FREE FRIENDLY";
  const badgeColor = isDedicated ? "#4ADE80" : "#FBBF24";
  const badgeWidth = badge.length * 15 + 40;

  return `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(0,0,0,0.15)" />
      <stop offset="35%" stop-color="rgba(0,0,0,0.4)" />
      <stop offset="65%" stop-color="rgba(0,0,0,0.4)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.15)" />
    </linearGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#grad)" />

  <!-- Decorative line above badge -->
  <rect x="${cx - 40}" y="${cx - 120}" width="80" height="3" rx="1.5" fill="${badgeColor}" opacity="0.8" />

  <!-- Badge pill -->
  <rect x="${cx - badgeWidth / 2}" y="${cx - 95}" width="${badgeWidth}" height="48" rx="24" fill="${badgeColor}" />
  <text x="${cx}" y="${cx - 64}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="800" fill="#1a1a1a" letter-spacing="1.5" text-anchor="middle">${escapeXml(badge)}</text>

  <!-- Place name — generous spacing below badge -->
  <text x="${cx}" y="${cx + 40}" font-family="Arial, Helvetica, sans-serif" font-size="88" font-weight="800" fill="white" text-anchor="middle" letter-spacing="1">${name}</text>

  <!-- Decorative line between name and location -->
  <rect x="${cx - 40}" y="${cx + 62}" width="80" height="3" rx="1.5" fill="rgba(255,255,255,0.4)" />

  <!-- Location — below divider -->
  <text x="${cx}" y="${cx + 100}" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="rgba(255,255,255,0.75)" text-anchor="middle">${escapeXml(place.location || "")}</text>

  <!-- Brand — top right -->
  <text x="${SIZE - 44}" y="50" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="600" fill="rgba(255,255,255,0.5)" text-anchor="end">noglutenkorea.com</text>
</svg>`;
}

// Slugs that should always show "DEDICATED GLUTEN-FREE"
const DEDICATED_SLUGS = new Set([
  "sisemdal-atelier",
  "237-pizza",
  "cafe-rebirths",
  "monil2-house",
  "feeke",
  "x-ake",
]);

async function generateCover(place) {
  const srcImage = path.join(imagesDir, place.slug, "01.webp");

  try {
    await fs.access(srcImage);
  } catch {
    console.log(`  ⏭ ${place.slug} — no source image`);
    return null;
  }

  const outputPath = path.join(outputDir, `${place.slug}-cover.jpg`);

  // 1) Resize + center crop to 1080x1080
  const base = await sharp(srcImage)
    .resize(SIZE, SIZE, { fit: "cover", position: "centre" })
    .jpeg({ quality: 95 })
    .toBuffer();

  // 2) Create SVG overlay
  const svg = createOverlaySvg(place);
  const overlay = Buffer.from(svg);

  // 3) Composite
  await sharp(base)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .jpeg({ quality: 92 })
    .toFile(outputPath);

  const stat = await fs.stat(outputPath);
  console.log(`  ✓ ${place.slug} — ${(stat.size / 1024).toFixed(0)}KB → ${path.relative(rootDir, outputPath)}`);
  return outputPath;
}

async function main() {
  const args = process.argv.slice(2);
  const places = JSON.parse(await fs.readFile(placesPath, "utf-8"));

  await fs.mkdir(outputDir, { recursive: true });

  let targets;
  if (args.includes("--all")) {
    targets = places.filter((p) => p.images?.length > 0);
  } else if (args.length > 0) {
    targets = args
      .map((slug) => places.find((p) => p.slug === slug))
      .filter(Boolean);
    const missing = args.filter((s) => !places.find((p) => p.slug === s));
    if (missing.length) console.log(`  ⚠ Not found: ${missing.join(", ")}`);
  } else {
    console.log("Usage: node scripts/generate-cover.mjs <slug...> | --all");
    process.exit(1);
  }

  console.log(`\n🎨 Generating Instagram covers (${targets.length} places)\n`);

  for (const place of targets) {
    await generateCover(place);
  }

  console.log("\nDone!\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
