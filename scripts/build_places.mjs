import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const candidatesPath = path.join(rootDir, "data", "candidates.naver.json");
const generatedOverridesPath = path.join(rootDir, "data", "overrides.generated.json");
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

function mergeOverrideLayers(base = {}, generated = {}, manual = {}) {
  const merged = { ...base, ...generated, ...manual };

  for (const key of ["linkConfidence", "linkSources"]) {
    merged[key] = {
      ...(generated?.[key] && typeof generated[key] === "object" ? generated[key] : {}),
      ...(manual?.[key] && typeof manual[key] === "object" ? manual[key] : {}),
    };
    if (Object.keys(merged[key]).length === 0) delete merged[key];
  }

  for (const key of ["tags", "sources"]) {
    if (Array.isArray(manual?.[key])) {
      merged[key] = manual[key];
    } else if (Array.isArray(generated?.[key])) {
      merged[key] = generated[key];
    }
  }

  return merged;
}

async function readJson(filePath, fallback = undefined) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT" && fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Failed to parse JSON at ${filePath}: ${error.message}`);
  }
}

async function main() {
  const todayIso = new Date().toISOString().slice(0, 10);
  const [candidatesRaw, generatedOverridesRaw, overridesRaw] = await Promise.all([
    readJson(candidatesPath),
    readJson(generatedOverridesPath, {}),
    readJson(overridesPath),
  ]);

  const generatedOverridesBySid = sanitizeOverridesBySid(generatedOverridesRaw);
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

    const generatedOverrides = generatedOverridesBySid[sid] || {};
    const overrides = overridesBySid[sid] || {};
    const layeredOverrides = mergeOverrideLayers({}, generatedOverrides, overrides);
    const baseName = typeof candidate.name === "string" ? candidate.name.trim() : "";

    let slug;
    if (layeredOverrides.slug && typeof layeredOverrides.slug === "string") {
      slug = ensureUniqueSlug(layeredOverrides.slug.trim(), usedSlugs);
    } else {
      const nameForSlug = layeredOverrides.nameEn || baseName;
      const slugRoot = asciiSlug(nameForSlug) || "place";
      slug = ensureUniqueSlug(slugRoot, usedSlugs);
    }

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
      instagram: "",
      sources: [],
      naverPlaceId: sid,
      lat: parseNumber(candidate.py),
      lng: parseNumber(candidate.px),
    };

    const merged = mergeOverrideLayers(basePlace, generatedOverrides, overrides);

    merged.type = normalizeType(merged.type);

    if (!Array.isArray(merged.tags)) merged.tags = [];
    if (!Array.isArray(merged.sources)) merged.sources = [];
    if (merged.rating === undefined) merged.rating = null;
    merged.updatedAt = todayIso;

    places.push(merged);
  }

  // Process override-only entries (manual places not in candidates)
  const processedSids = new Set(dedupedCandidatesBySid.keys());
  for (const [sid, overrides] of Object.entries(overridesBySid)) {
    if (processedSids.has(sid)) continue;

    const layeredOverrides = mergeOverrideLayers({}, generatedOverridesBySid[sid] || {}, overrides);
    const baseName = layeredOverrides.name || "";

    let slug;
    if (layeredOverrides.slug && typeof layeredOverrides.slug === "string") {
      slug = ensureUniqueSlug(layeredOverrides.slug.trim(), usedSlugs);
    } else {
      const nameForSlug = layeredOverrides.nameEn || baseName;
      const slugRoot = asciiSlug(nameForSlug) || "place";
      slug = ensureUniqueSlug(slugRoot, usedSlugs);
    }

    const basePlace = {
      slug,
      name: baseName || `Place ${sid}`,
      type: "Place",
      address: "",
      note: "",
      tags: [],
      rating: null,
      naverMapUrl: "",
      website: "",
      instagram: "",
      sources: [],
      naverPlaceId: sid,
      lat: null,
      lng: null,
    };

    const merged = mergeOverrideLayers(basePlace, generatedOverridesBySid[sid] || {}, overrides);
    merged.type = normalizeType(merged.type);
    if (!Array.isArray(merged.tags)) merged.tags = [];
    if (!Array.isArray(merged.sources)) merged.sources = [];
    if (merged.rating === undefined) merged.rating = null;
    merged.updatedAt = todayIso;

    places.push(merged);
  }

  // Scan for place images in public/images/places/{slug}/
  const imagesBaseDir = path.join(rootDir, "public", "images", "places");
  const imageExtensions = new Set([".webp", ".jpg", ".jpeg", ".png"]);
  let imagesFound = 0;

  for (const place of places) {
    const placeImgDir = path.join(imagesBaseDir, place.slug);
    try {
      const files = await fs.readdir(placeImgDir);
      const imageFiles = files
        .filter((f) => imageExtensions.has(path.extname(f).toLowerCase()) && !f.startsWith("thumb_"))
        .sort();
      if (imageFiles.length > 0) {
        // If coverImage is set, move it to the front of the array
        if (place.coverImage) {
          const coverIdx = imageFiles.indexOf(place.coverImage);
          if (coverIdx > 0) {
            imageFiles.splice(coverIdx, 1);
            imageFiles.unshift(place.coverImage);
          }
        }
        // Store Cloudinary public_ids (no extension, no leading slash)
        place.images = imageFiles.map((f) => {
          const nameNoExt = f.replace(/\.[^.]+$/, "");
          return `places/${place.slug}/${nameNoExt}`;
        });
        imagesFound += imageFiles.length;
      }
    } catch {
      // No image folder for this place — skip
    }
    // Remove coverImage from output (internal-only field)
    delete place.coverImage;
  }

  await fs.writeFile(outputPath, `${JSON.stringify(places, null, 2)}\n`, "utf8");
  console.log(`Generated ${places.length} place(s) -> data/places.json (${imagesFound} image(s) linked)`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
