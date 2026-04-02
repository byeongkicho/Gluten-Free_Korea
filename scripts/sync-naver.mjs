#!/usr/bin/env node
/**
 * sync-naver.mjs — Fetch Naver shared bookmarks and update local data.
 *
 * Usage: npm run sync:naver
 *
 * Reads NAVER_SHARE_ID from .env / .env.local, fetches the bookmarks API,
 * overwrites data/naver_raw.json, then re-derives data/candidates.naver.json
 * and prints a diff summary.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

// ── env loading (same pattern as upload-cloudinary.mjs) ──────────────────────

async function loadEnvFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

await loadEnvFile(path.join(rootDir, ".env"));
await loadEnvFile(path.join(rootDir, ".env.local"));

// ── config ───────────────────────────────────────────────────────────────────

const shareId = process.env.NAVER_SHARE_ID;
if (!shareId) {
  console.error("Missing NAVER_SHARE_ID in .env or .env.local");
  process.exit(1);
}

const API_URL = `https://pages.map.naver.com/save-pages/api/maps-bookmark/v3/shares/${shareId}/bookmarks`;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

const rawPath = path.join(rootDir, "data", "naver_raw.json");
const candidatesPath = path.join(rootDir, "data", "candidates.naver.json");

// ── import logic (inlined from import_naver.mjs) ────────────────────────────

const allowedKeys = [
  "sid", "name", "address", "mcid", "mcidName",
  "px", "py", "memo", "useTime", "lastUpdateTime",
];

function sanitizeCandidate(row) {
  return {
    sid: row?.sid == null ? "" : String(row.sid).trim(),
    name: row?.name ?? "",
    address: row?.address ?? "",
    mcid: row?.mcid ?? "",
    mcidName: row?.mcidName ?? "",
    px: row?.px ?? null,
    py: row?.py ?? null,
    memo: row?.memo ?? "",
    useTime: row?.useTime ?? "",
    lastUpdateTime: row?.lastUpdateTime ?? "",
  };
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function findBestArray(input) {
  if (Array.isArray(input)) return input;
  if (!isObject(input)) return null;

  const preferredKeys = ["items", "list", "result", "results", "data"];
  for (const key of preferredKeys) {
    const value = input[key];
    if (Array.isArray(value)) return value;
    if (isObject(value)) {
      for (const nestedKey of preferredKeys) {
        if (Array.isArray(value[nestedKey])) return value[nestedKey];
      }
    }
  }

  const queue = [input];
  const arrays = [];
  while (queue.length) {
    const node = queue.shift();
    if (!isObject(node)) continue;
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) { arrays.push(value); continue; }
      if (isObject(value)) queue.push(value);
    }
  }
  if (arrays.length === 0) return null;

  const withSid = arrays.find((arr) =>
    arr.some((row) => isObject(row) && (row.sid != null || row.naverPlaceId != null || row.id != null))
  );
  return withSid || arrays[0];
}

function enforceSanitizedShape(rows) {
  return rows.map((row) => {
    const clean = sanitizeCandidate(row);
    return Object.fromEntries(allowedKeys.map((key) => [key, clean[key]]));
  });
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Load previous candidates for diff
  let previousCandidates = [];
  try {
    const prev = await fs.readFile(candidatesPath, "utf8");
    previousCandidates = JSON.parse(prev);
  } catch {
    // first run or missing file — that's fine
  }

  const prevMap = new Map(previousCandidates.map((c) => [c.sid, c]));

  // Fetch from Naver API
  console.log(`Fetching bookmarks from Naver (shareId: ${shareId})...`);
  let response;
  try {
    response = await fetch(API_URL, {
      headers: { "User-Agent": USER_AGENT },
    });
  } catch (error) {
    console.error(`Network error: ${error.message}`);
    process.exit(1);
  }

  if (!response.ok) {
    console.error(`API returned ${response.status} ${response.statusText}`);
    process.exit(1);
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    console.error(`Invalid JSON response: ${error.message}`);
    process.exit(1);
  }

  // Save raw response
  await fs.writeFile(rawPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`Saved raw response → data/naver_raw.json`);

  // Parse into candidates
  const sourceRows = findBestArray(data);
  if (!Array.isArray(sourceRows)) {
    console.error("Could not find an array payload in API response.");
    process.exit(1);
  }

  const candidates = enforceSanitizedShape(
    sourceRows.filter(
      (row) => isObject(row) && row.sid != null && String(row.sid).trim() !== ""
    )
  );

  await fs.writeFile(
    candidatesPath,
    JSON.stringify(candidates, null, 2) + "\n",
    "utf8"
  );
  console.log(`Saved ${candidates.length} candidate(s) → data/candidates.naver.json`);

  // Build diff summary
  const newMap = new Map(candidates.map((c) => [c.sid, c]));

  const added = candidates.filter((c) => !prevMap.has(c.sid));
  const removed = previousCandidates.filter((c) => !newMap.has(c.sid));
  const changed = candidates.filter((c) => {
    const prev = prevMap.get(c.sid);
    if (!prev) return false;
    return prev.name !== c.name || prev.address !== c.address;
  });

  console.log("\n════════════════════════════════════════");
  console.log("  Naver Sync Summary");
  console.log("════════════════════════════════════════");
  console.log(`  Total places:  ${candidates.length}`);
  console.log(`  Previous:      ${previousCandidates.length}`);
  console.log(`  ＋ New:        ${added.length}`);
  console.log(`  － Removed:    ${removed.length}`);
  console.log(`  ～ Changed:    ${changed.length}`);

  if (added.length > 0) {
    console.log("\n  ✨ New places:");
    for (const p of added) {
      console.log(`     • ${p.name} (sid: ${p.sid})`);
      console.log(`       ${p.address}`);
    }
  }

  if (removed.length > 0) {
    console.log("\n  🗑  Removed places:");
    for (const p of removed) {
      console.log(`     • ${p.name} (sid: ${p.sid})`);
    }
  }

  if (changed.length > 0) {
    console.log("\n  📝 Changed places:");
    for (const c of changed) {
      const prev = prevMap.get(c.sid);
      if (prev.name !== c.name) {
        console.log(`     • Name: "${prev.name}" → "${c.name}" (sid: ${c.sid})`);
      }
      if (prev.address !== c.address) {
        console.log(`     • Addr: "${prev.address}" → "${c.address}" (sid: ${c.sid})`);
      }
    }
  }

  console.log("════════════════════════════════════════\n");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
