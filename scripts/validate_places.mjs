import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const placesPath = path.resolve(__dirname, "..", "data", "places.json");

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(message) {
  throw new Error(message);
}

async function main() {
  const raw = await fs.readFile(placesPath, "utf8");
  let places;

  try {
    places = JSON.parse(raw);
  } catch (error) {
    fail(`places.json is not valid JSON: ${error.message}`);
  }

  if (!Array.isArray(places)) {
    fail("places.json must be a top-level array");
  }

  const seenSlugs = new Set();
  const seenSids = new Set();

  places.forEach((place, index) => {
    if (!place || typeof place !== "object") {
      fail(`places[${index}] must be an object`);
    }

    const slug = typeof place.slug === "string" ? place.slug.trim() : "";
    const name = typeof place.name === "string" ? place.name.trim() : "";

    if (!slug) fail(`places[${index}].slug is required`);
    if (!name) fail(`places[${index}].name is required`);
    if (!slugPattern.test(slug)) {
      fail(`places[${index}].slug has invalid format: ${slug}`);
    }

    if (seenSlugs.has(slug)) {
      fail(`duplicate slug found: ${slug}`);
    }
    seenSlugs.add(slug);

    const sidRaw = place.naverPlaceId ?? place.sid;
    if (sidRaw !== undefined && sidRaw !== null && String(sidRaw).trim() !== "") {
      const sid = String(sidRaw).trim();
      if (seenSids.has(sid)) {
        fail(`duplicate sid found: ${sid}`);
      }
      seenSids.add(sid);
    }
  });

  console.log(`places.json is valid (${places.length} place(s))`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
