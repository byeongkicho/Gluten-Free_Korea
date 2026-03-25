import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const placesPath = path.join(rootDir, "data", "places.json");
const overridesPath = path.join(rootDir, "data", "overrides.json");
const generatedPath = path.join(rootDir, "data", "overrides.generated.json");

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function extractApolloState(html) {
  const marker = "window.__APOLLO_STATE__ = ";
  const start = html.indexOf(marker);
  if (start === -1) return null;

  let i = start + marker.length;
  while (i < html.length && html[i] !== "{") i += 1;
  if (i >= html.length) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  const begin = i;

  for (; i < html.length; i += 1) {
    const ch = html[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        const jsonText = html.slice(begin, i + 1);
        return JSON.parse(jsonText);
      }
    }
  }

  return null;
}

function normalizeUrl(url) {
  if (!url || typeof url !== "string") return "";
  try {
    const normalized = new URL(url.trim());
    normalized.hash = "";
    return normalized.toString();
  } catch {
    return "";
  }
}

function pickLinksFromHomepageNode(homepages) {
  const urls = [];
  if (!isObject(homepages)) return urls;

  const repr = homepages.repr;
  if (isObject(repr) && repr.url) urls.push({ url: repr.url, type: repr.type || "repr", isRep: true });

  const etc = Array.isArray(homepages.etc) ? homepages.etc : [];
  for (const item of etc) {
    if (isObject(item) && item.url) {
      urls.push({ url: item.url, type: item.type || "etc", isRep: false });
    }
  }

  const subLinks = Array.isArray(homepages.subLinks) ? homepages.subLinks : [];
  for (const item of subLinks) {
    if (isObject(item) && item.url) {
      urls.push({ url: item.url, type: item.type || "sub", isRep: false });
    }
  }

  return urls;
}

function classifyLink(url) {
  const normalized = normalizeUrl(url);
  if (!normalized) return null;

  const lowered = normalized.toLowerCase();
  if (lowered.includes("instagram.com")) return { kind: "instagram", url: normalized };
  if (lowered.includes("blog.naver.com")) return { kind: "naverBlog", url: normalized };
  if (lowered.includes("youtube.com") || lowered.includes("youtu.be")) return null;
  return { kind: "website", url: normalized };
}

async function fetchNaverLinks(placeId) {
  const url = `https://pcmap.place.naver.com/place/${placeId}`;
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; GlutenFreeKoreaBot/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Naver Place ${placeId}: ${response.status}`);
  }

  const html = await response.text();
  const apollo = extractApolloState(html);
  if (!apollo || !isObject(apollo.ROOT_QUERY)) return [];

  const root = apollo.ROOT_QUERY;
  const buckets = [];

  if (isObject(root.homepages)) {
    buckets.push(...pickLinksFromHomepageNode(root.homepages));
  }

  const placeDetailRef = root[Object.keys(root).find((key) => key.startsWith("placeDetail("))];
  if (isObject(placeDetailRef)) {
    if (isObject(placeDetailRef.homepages)) {
      buckets.push(...pickLinksFromHomepageNode(placeDetailRef.homepages));
    }

    const shopWindow = placeDetailRef.shopWindow;
    if (isObject(shopWindow) && isObject(shopWindow.homepages)) {
      buckets.push(...pickLinksFromHomepageNode(shopWindow.homepages));
    }
  }

  return buckets
    .map((item) => ({ ...item, classified: classifyLink(item.url) }))
    .filter((item) => item.classified);
}

function mergeGeneratedEntry(existing, patch) {
  const merged = { ...(isObject(existing) ? existing : {}) };

  for (const [key, value] of Object.entries(patch)) {
    if (isObject(value) && isObject(merged[key])) {
      merged[key] = { ...merged[key], ...value };
    } else {
      merged[key] = value;
    }
  }

  return merged;
}

async function main() {
  const [placesRaw, overridesRaw, generatedRaw] = await Promise.all([
    readJson(placesPath, []),
    readJson(overridesPath, {}),
    readJson(generatedPath, {}),
  ]);

  const places = Array.isArray(placesRaw) ? placesRaw : [];
  const manual = isObject(overridesRaw) ? overridesRaw : {};
  const generated = isObject(generatedRaw) ? generatedRaw : {};

  let updated = 0;

  for (const place of places) {
    const sid = String(place?.naverPlaceId || "").trim();
    if (!sid) continue;

    const manualEntry = isObject(manual[sid]) ? manual[sid] : {};
    const generatedEntry = isObject(generated[sid]) ? generated[sid] : {};

    const alreadyHasWebsite = Boolean(manualEntry.website || generatedEntry.website || place.website);
    const alreadyHasInstagram = Boolean(manualEntry.instagram || generatedEntry.instagram || place.instagram);
    if (alreadyHasWebsite && alreadyHasInstagram) continue;

    let links;
    try {
      links = await fetchNaverLinks(sid);
    } catch (error) {
      console.warn(`[warn] ${sid} ${place.name}: ${error.message}`);
      continue;
    }

    if (!links.length) continue;

    const website = links.find((item) => item.classified.kind === "website")?.classified.url || "";
    const instagram = links.find((item) => item.classified.kind === "instagram")?.classified.url || "";
    const naverBlog = links.find((item) => item.classified.kind === "naverBlog")?.classified.url || "";

    const patch = {};
    if (!alreadyHasWebsite && website) patch.website = website;
    if (!alreadyHasInstagram && instagram) patch.instagram = instagram;

    const sourceFacts = [];
    if (website) sourceFacts.push("naver-place-homepage");
    if (instagram) sourceFacts.push("naver-place-instagram");
    if (naverBlog) sourceFacts.push("naver-place-blog");

    if (Object.keys(patch).length === 0) continue;

    patch.linkConfidence = {
      ...(isObject(generatedEntry.linkConfidence) ? generatedEntry.linkConfidence : {}),
      ...(patch.website ? { website: "high" } : {}),
      ...(patch.instagram ? { instagram: "high" } : {}),
    };

    patch.linkSources = {
      ...(isObject(generatedEntry.linkSources) ? generatedEntry.linkSources : {}),
      ...(patch.website ? { website: ["naver-place-homepage"] } : {}),
      ...(patch.instagram ? { instagram: ["naver-place-instagram"] } : {}),
    };

    if (naverBlog && !generatedEntry.naverBlog && !manualEntry.naverBlog) {
      patch.naverBlog = naverBlog;
    }

    patch.sources = Array.from(
      new Set([
        ...(Array.isArray(generatedEntry.sources) ? generatedEntry.sources : []),
        ...sourceFacts,
      ]),
    );

    generated[sid] = mergeGeneratedEntry(generatedEntry, patch);
    updated += 1;
    console.log(`[updated] ${sid} ${place.name}`);
  }

  await writeJson(generatedPath, generated);
  console.log(`Saved generated link enrichments for ${updated} place(s) -> data/overrides.generated.json`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
