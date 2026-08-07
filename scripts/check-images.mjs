#!/usr/bin/env node
// check-images.mjs — verifies the image layer against what actually ships.
//
// Why this is a script and not an inline `node -e` inside the task JSON:
// these checks need app/lib/cloudinary.js, which is ESM. `require()` of an ESM
// module is only enabled by default on Node 22.12+, and CI pins Node 20 — so the
// inline version passed on this laptop and would have thrown ERR_REQUIRE_ESM the
// first time CI actually ran it. A .mjs file can `import` it on any supported
// Node. (That mismatch went unnoticed because the eval workflow had never run.)
//
// Usage:
//   node scripts/check-images.mjs urls   — URL builder contract (offline)
//   node scripts/check-images.mjs live   — every referenced image resolves (network)

import { readFile } from "node:fs/promises";
import { cloudinaryUrl } from "../app/lib/cloudinary.js";

const CONCURRENCY = 8;

const places = async () =>
  JSON.parse(await readFile(new URL("../data/places.json", import.meta.url), "utf8"));

const fail = (msg, details = []) => {
  console.error(`FAIL: ${msg}`);
  details.forEach((d) => console.error(`  - ${d}`));
  process.exit(1);
};

// ── urls ──────────────────────────────────────────────────────────────────
// The builder must produce a delivery URL for every preset, and must reject an
// unknown preset loudly rather than emitting a URL that 404s at request time.
function checkUrls() {
  const presets = ["webThumb", "webFull", "instaFeed", "instaStory", "ogImage"];
  const problems = [];

  for (const preset of presets) {
    const url = cloudinaryUrl("places/cafe-rebirths/01", preset);
    if (!url.startsWith("https://res.cloudinary.com/")) {
      problems.push(`${preset} produced a non-Cloudinary URL: ${url}`);
    }
    if (url.endsWith("/places/cafe-rebirths/01") === false) {
      problems.push(`${preset} did not append the public ID: ${url}`);
    }
  }

  try {
    cloudinaryUrl("places/x/01", "definitelyNotAPreset");
    problems.push("unknown preset did not throw — a typo would ship a broken URL");
  } catch {
    // expected
  }

  if (problems.length) fail("Cloudinary URL builder contract broken", problems);
  console.log(`OK: URL builder honours ${presets.length} presets and rejects unknown ones`);
}

// ── live ──────────────────────────────────────────────────────────────────
// Every public ID in places.json must actually resolve. Checking local .webp
// files instead would be wrong in both directions: curated `images` overrides
// intentionally have no local counterpart, and a local file proves nothing about
// whether it was ever uploaded.
async function checkLive() {
  const all = (await places()).flatMap((p) =>
    (p.images ?? []).map((id) => ({ slug: p.slug, id })),
  );

  const broken = [];
  const queue = [...all];

  const worker = async () => {
    for (let item = queue.shift(); item; item = queue.shift()) {
      const url = cloudinaryUrl(item.id, "webThumb");
      try {
        const res = await fetch(url, { method: "HEAD" });
        if (!res.ok) broken.push(`${item.slug} → ${item.id} (HTTP ${res.status})`);
      } catch (err) {
        broken.push(`${item.slug} → ${item.id} (${err.message})`);
      }
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  if (broken.length) {
    fail(`${broken.length}/${all.length} referenced image(s) do not resolve`, broken.sort());
  }
  console.log(`OK: all ${all.length} referenced images resolve on Cloudinary`);
}

const CHECKS = { urls: checkUrls, live: checkLive };
const name = process.argv[2];

if (!CHECKS[name]) {
  console.error(`usage: node scripts/check-images.mjs <${Object.keys(CHECKS).join("|")}>`);
  process.exit(2);
}

await CHECKS[name]();
