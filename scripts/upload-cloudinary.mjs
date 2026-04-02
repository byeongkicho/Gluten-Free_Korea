import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const imagesBaseDir = path.join(rootDir, "public", "images", "places");

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
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET in env.");
  process.exit(1);
}

async function main() {
  let slugDirs;
  try {
    slugDirs = await fs.readdir(imagesBaseDir);
  } catch {
    console.error(`No images directory found at ${imagesBaseDir}`);
    process.exit(1);
  }

  let uploaded = 0;
  let skipped = 0;
  let errors = 0;

  for (const slug of slugDirs.sort()) {
    const slugDir = path.join(imagesBaseDir, slug);
    const stat = await fs.stat(slugDir);
    if (!stat.isDirectory()) continue;

    const files = await fs.readdir(slugDir);
    const webpFiles = files
      .filter((f) => f.endsWith(".webp") && !f.startsWith("thumb_"))
      .sort();

    for (const file of webpFiles) {
      const nameNoExt = path.basename(file, ".webp");
      const publicId = `places/${slug}/${nameNoExt}`;
      const filePath = path.join(slugDir, file);

      try {
        const result = await cloudinary.uploader.upload(filePath, {
          public_id: publicId,
          overwrite: false,
          resource_type: "image",
        });

        if (result.existing) {
          console.log(`  SKIP  ${publicId} (already exists)`);
          skipped++;
        } else {
          console.log(`  UP    ${publicId}`);
          uploaded++;
        }
      } catch (err) {
        // Cloudinary returns "already exists" differently depending on version
        if (err?.http_code === 409 || err?.message?.includes("already exists")) {
          console.log(`  SKIP  ${publicId} (already exists)`);
          skipped++;
        } else {
          console.error(`  ERR   ${publicId}: ${err.message}`);
          errors++;
        }
      }
    }
  }

  console.log(`\nDone: ${uploaded} uploaded, ${skipped} skipped, ${errors} errors.`);
  if (errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
