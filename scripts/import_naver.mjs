import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const rawPath = path.join(rootDir, "data", "naver_raw.json");
const outputPath = path.join(rootDir, "data", "candidates.naver.json");

const allowedKeys = [
  "sid",
  "name",
  "address",
  "mcid",
  "mcidName",
  "px",
  "py",
  "memo",
  "useTime",
  "lastUpdateTime",
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
      if (Array.isArray(value)) {
        arrays.push(value);
        continue;
      }
      if (isObject(value)) {
        queue.push(value);
      }
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

async function main() {
  let rawText;

  try {
    rawText = await fs.readFile(rawPath, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") {
      throw new Error(
        "Missing data/naver_raw.json. Save Naver export JSON to data/naver_raw.json and run `npm run import:naver` again."
      );
    }
    throw error;
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (error) {
    throw new Error(`Invalid JSON in data/naver_raw.json: ${error.message}`);
  }

  const sourceRows = findBestArray(parsed);
  if (!Array.isArray(sourceRows)) {
    throw new Error(
      "Could not find an array payload in data/naver_raw.json. Expected an array or an object containing items/list/result/results/data array."
    );
  }

  const candidates = enforceSanitizedShape(
    sourceRows.filter((row) => isObject(row) && row.sid != null && String(row.sid).trim() !== "")
  );

  await fs.writeFile(outputPath, `${JSON.stringify(candidates, null, 2)}\n`, "utf8");
  console.log(`Imported ${candidates.length} candidate(s) -> data/candidates.naver.json`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
