#!/usr/bin/env node
/**
 * Fetch thumbnail images from Naver Map for places without images.
 * Usage: node scripts/fetch-naver-thumbnails.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const placesPath = path.join(rootDir, "data", "places.json");
const outputBase = path.join(rootDir, "public", "images", "places");

const places = JSON.parse(await fs.readFile(placesPath, "utf-8"));

// Places without images that have naver map URLs
const needImages = places.filter(
  (p) => (!p.images || p.images.length === 0) && p.naverMapUrl
);

console.log(`Found ${needImages.length} places needing images:`);
needImages.forEach((p) => console.log(`  - ${p.slug} (${p.name})`));

// Extract place ID from naver map URL
function extractNaverId(url) {
  const match = url.match(/place\/(\d+)/);
  return match ? match[1] : null;
}

// Get high-res original URL from naver thumbnail URL
function getOriginalUrl(thumbUrl) {
  // Replace type parameter to get larger image
  return thumbUrl.replace(/type=w\d+_sharpen/, "type=w560_sharpen");
}

async function downloadImage(url, outputPath) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Referer: "https://pcmap.place.naver.com/",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(outputPath, buffer);
  return buffer.length;
}

// We'll use the Naver Place photo API endpoint
async function fetchPlacePhotos(placeId) {
  // Try the photo list page directly
  const url = `https://pcmap.place.naver.com/restaurant/${placeId}/photo`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Referer: "https://map.naver.com/",
    },
  });
  const html = await res.text();
  
  // Extract image URLs from the HTML/scripts
  const imgUrls = [];
  const regex = /https:\/\/[^"'\s]*ldb-phinf\.pstatic\.net[^"'\s]*/g;
  const matches = html.matchAll(regex);
  for (const match of matches) {
    let imgUrl = match[0].replace(/\\u002F/g, "/").replace(/\\/g, "");
    if (!imgUrls.includes(imgUrl)) {
      imgUrls.push(imgUrl);
    }
  }
  return imgUrls;
}

const results = {};

for (const place of needImages) {
  const placeId = extractNaverId(place.naverMapUrl);
  if (!placeId) {
    console.log(`  ⚠ Could not extract ID from ${place.naverMapUrl}`);
    continue;
  }

  console.log(`\nProcessing ${place.slug} (ID: ${placeId})...`);

  try {
    const photos = await fetchPlacePhotos(placeId);
    console.log(`  Found ${photos.length} photo URLs`);

    if (photos.length === 0) {
      console.log(`  ⚠ No photos found, skipping`);
      continue;
    }

    // Create output directory
    const outDir = path.join(outputBase, place.slug);
    await fs.mkdir(outDir, { recursive: true });

    // Download first photo as thumbnail
    const photoUrl = photos[0].includes("type=")
      ? photos[0]
      : `https://search.pstatic.net/common/?autoRotate=true&type=w560_sharpen&src=${encodeURIComponent(photos[0])}`;

    const outPath = path.join(outDir, "01.jpg");
    const size = await downloadImage(photoUrl, outPath);
    console.log(`  ✅ Downloaded 01.jpg (${(size / 1024).toFixed(1)}KB)`);

    results[place.slug] = [`/images/places/${place.slug}/01.webp`];

    // Convert to webp using sharp if available
    try {
      const sharp = (await import("sharp")).default;
      const webpPath = path.join(outDir, "01.webp");
      await sharp(outPath)
        .rotate()
        .resize({ width: 640, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(webpPath);
      // Remove the jpg
      await fs.unlink(outPath);
      console.log(`  ✅ Converted to webp`);
    } catch (e) {
      console.log(`  ⚠ sharp not available, keeping jpg`);
      results[place.slug] = [`/images/places/${place.slug}/01.jpg`];
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
  }

  // Small delay to be nice
  await new Promise((r) => setTimeout(r, 1000));
}

// Update places.json with new image paths
if (Object.keys(results).length > 0) {
  console.log("\nUpdating places.json...");
  const updated = places.map((p) => {
    if (results[p.slug]) {
      return { ...p, images: results[p.slug] };
    }
    return p;
  });
  await fs.writeFile(placesPath, JSON.stringify(updated, null, 2) + "\n");
  console.log("✅ places.json updated");
}

console.log("\nDone!");
