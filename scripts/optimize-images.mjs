import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const ASSETS_DIR = path.join(rootDir, "public", "images", "NoGlutenSeoul_Assets");
const OUTPUT_DIR = path.join(rootDir, "public", "images", "places");

const FULL_MAX_WIDTH = 1200;
const THUMB_MAX_WIDTH = 640;
const WEBP_QUALITY = 80;

const SKIP_FILES = new Set(["Logo_noText.png", "logo_notext.png"]);

const MAPPING = {
  "237피자": "237-pizza",
  "6일닭강정": "6day-chicken",
  GrainSeoul: "grain-seoul",
  "글루닉": "glunic",
  "다크앤라이트": "dark-and-light",
  "뚜쥬르": "toujours-dolgama-village",
  "모닐이네": "monil2-house",
  "미니마이즈": "minimize-itaewon",
  "써니하우스": "sunny-bread",
  "지화자": "jihwaja",
  "카페 리벌스": "cafe-rebirths",
  "카페 페퍼": "cafe-pepper",
  "쿠촐로": "cucciolo-seoul",
  "프랑스와": "francois",
};

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png"]);

async function processImage(inputPath, outputPath, maxWidth) {
  await sharp(inputPath)
    .rotate()                              // auto-rotate based on EXIF orientation
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(outputPath);

  const stat = await fs.stat(outputPath);
  return stat.size;
}

async function main() {
  let totalInput = 0;
  let totalOutput = 0;
  let totalFiles = 0;

  for (const [folder, slug] of Object.entries(MAPPING)) {
    const srcDir = path.join(ASSETS_DIR, folder);
    const outDir = path.join(OUTPUT_DIR, slug);

    let files;
    try {
      files = await fs.readdir(srcDir);
    } catch {
      console.log(`  skip: ${folder}/ (not found)`);
      continue;
    }

    const imageFiles = files
      .filter((f) => {
        if (SKIP_FILES.has(f)) return false;
        return IMAGE_EXTS.has(path.extname(f).toLowerCase());
      })
      .sort();

    if (imageFiles.length === 0) {
      // Clean stale output if source is empty
      try { await fs.rm(outDir, { recursive: true }); } catch { /* ok */ }
      console.log(`  skip: ${folder}/ (no images)`);
      continue;
    }

    // Clean output dir first (remove stale files from previous runs)
    try {
      await fs.rm(outDir, { recursive: true });
    } catch { /* didn't exist */ }
    await fs.mkdir(outDir, { recursive: true });

    console.log(`  ${folder} → ${slug}/ (${imageFiles.length} images)`);

    for (let i = 0; i < imageFiles.length; i++) {
      const srcPath = path.join(srcDir, imageFiles[i]);
      const num = String(i + 1).padStart(2, "0");
      const fullOut = path.join(outDir, `${num}.webp`);
      const thumbOut = path.join(outDir, `thumb_${num}.webp`);

      const srcStat = await fs.stat(srcPath);
      totalInput += srcStat.size;

      const fullSize = await processImage(srcPath, fullOut, FULL_MAX_WIDTH);
      const thumbSize = await processImage(srcPath, thumbOut, THUMB_MAX_WIDTH);
      totalOutput += fullSize + thumbSize;
      totalFiles++;
    }
  }

  const mb = (b) => (b / 1024 / 1024).toFixed(1);
  console.log(
    `\nDone: ${totalFiles} files processed | ${mb(totalInput)} MB input → ${mb(totalOutput)} MB output (${((1 - totalOutput / totalInput) * 100).toFixed(0)}% reduction)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
