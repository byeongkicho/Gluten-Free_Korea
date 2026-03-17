import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const candidatesPath = path.join(rootDir, "data", "candidates.naver.json");
const overridesPath = path.join(rootDir, "data", "overrides.json");
const outputPath = path.join(rootDir, "data", "places.json");

function toArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

function parseNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function normalizeType(value) {
  const normalized = {
    "음식점": "Restaurant",
    "카페": "Cafe",
    "베이커리": "Bakery",
    "제과,베이커리": "Bakery",
    Dining: "Restaurant",
    Bakery: "Bakery",
    Cafe: "Cafe",
    Restaurant: "Restaurant",
  };

  return normalized[value] || value;
}

function asciiSlug(value) {
  if (!value || typeof value !== "string") return "";
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ensureUniqueSlug(baseSlug, usedSlugs) {
  if (!usedSlugs.has(baseSlug)) {
    usedSlugs.add(baseSlug);
    return baseSlug;
  }

  let idx = 2;
  while (usedSlugs.has(`${baseSlug}-${idx}`)) idx += 1;
  const unique = `${baseSlug}-${idx}`;
  usedSlugs.add(unique);
  return unique;
}

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

function sanitizeOverridesBySid(overridesRaw) {
  if (!overridesRaw || typeof overridesRaw !== "object" || Array.isArray(overridesRaw)) {
    return {};
  }

  const entries = Object.entries(overridesRaw)
    .map(([sid, value]) => [String(sid).trim(), value])
    .filter(([sid, value]) => sid && value && typeof value === "object" && !Array.isArray(value));

  return Object.fromEntries(entries);
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Failed to parse JSON at ${filePath}: ${error.message}`);
  }
}

async function main() {
  const todayIso = new Date().toISOString().slice(0, 10);
  const [candidatesRaw, overridesRaw] = await Promise.all([
    readJson(candidatesPath),
    readJson(overridesPath),
  ]);

  const overridesBySid = sanitizeOverridesBySid(overridesRaw);
  const sanitizedCandidates = toArray(candidatesRaw).map(sanitizeCandidate);

  const dedupedCandidatesBySid = new Map();
  for (const candidate of sanitizedCandidates) {
    if (!candidate.sid) continue;
    if (!dedupedCandidatesBySid.has(candidate.sid)) {
      dedupedCandidatesBySid.set(candidate.sid, candidate);
    }
  }

  const usedSlugs = new Set();
  const places = [];

  for (const candidate of dedupedCandidatesBySid.values()) {
    const sid = candidate.sid;

    const baseName = typeof candidate.name === "string" ? candidate.name.trim() : "";
    const slugRoot = asciiSlug(baseName) || "place";
    const slug = ensureUniqueSlug(`${slugRoot}-${sid}`, usedSlugs);

    const basePlace = {
      slug,
      name: baseName || `Place ${sid}`,
      type: (candidate.mcidName || candidate.mcid || "Place").toString(),
      address: typeof candidate.address === "string" ? candidate.address.trim() : "",
      note: typeof candidate.memo === "string" ? candidate.memo.trim() : "",
      tags: [],
      rating: null,
      naverMapUrl: `https://map.naver.com/p/entry/place/${sid}`,
      website: "",
      sources: [],
      naverPlaceId: sid,
      lat: parseNumber(candidate.py),
      lng: parseNumber(candidate.px),
    };

    const merged = {
      ...basePlace,
      ...(overridesBySid[sid] || {}),
    };

    merged.type = normalizeType(merged.type);

    if (!Array.isArray(merged.tags)) merged.tags = [];
    if (!Array.isArray(merged.sources)) merged.sources = [];
    if (merged.rating === undefined) merged.rating = null;
    merged.updatedAt = todayIso;

    places.push(merged);
  }

  await fs.writeFile(outputPath, `${JSON.stringify(places, null, 2)}\n`, "utf8");
  console.log(`Generated ${places.length} place(s) -> data/places.json`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
