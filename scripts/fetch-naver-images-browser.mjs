#!/usr/bin/env node
/**
 * Reads places.json, outputs the naver place IDs that need images.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const placesPath = path.join(rootDir, "data", "places.json");

const places = JSON.parse(await fs.readFile(placesPath, "utf-8"));

const needImages = places.filter(
  (p) => (!p.images || p.images.length === 0) && p.naverMapUrl
);

for (const p of needImages) {
  const match = p.naverMapUrl.match(/place\/(\d+)/);
  const id = match ? match[1] : "?";
  console.log(JSON.stringify({ slug: p.slug, name: p.name, naverId: id, naverMapUrl: p.naverMapUrl }));
}
