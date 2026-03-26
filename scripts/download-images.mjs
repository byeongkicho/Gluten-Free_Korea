import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/ki/workspace/Gluten-Free_Korea";
const OUTPUT = path.join(ROOT, "public", "images", "places");

const images = [
  { slug: "ssal-tongdak-rice-fried-chicken-dangsan", url: "https://ldb-phinf.pstatic.net/20251013_53/1760329080038CqT4i_JPEG/%BD%D2%C5%EB%B4%DF_%B0%A3%C0%E5.jpg" },
  { slug: "minimize-itaewon", url: "https://ldb-phinf.pstatic.net/20260325_135/1774405232400vidsm_JPEG/KakaoTalk_20260325_111512419_02.jpg" },
  { slug: "glunic", url: "https://ldb-phinf.pstatic.net/20250628_65/1751090990665u3RWW_JPEG/IMG_3498.JPG" },
  { slug: "toujours-dolgama-village", url: "https://ldb-phinf.pstatic.net/20151104_285/1446623917652EPcMc_JPEG/167054568853849_0.jpg" },
  { slug: "cafe-pepper", url: "https://ldb-phinf.pstatic.net/20251113_222/1763018071743EWggs_JPEG/6DEC9AB2-9425-470C-80EE-1F9D219E69EB.jpeg" },
  { slug: "sunny-bread", url: "https://ldb-phinf.pstatic.net/20260128_38/1769577052723V63NL_JPEG/1769576863435.jpg" },
  { slug: "los-dias-cafe", url: "https://ldb-phinf.pstatic.net/20251001_120/17592935966282Nfjx_JPEG/IMG_6695.jpeg" },
  { slug: "sisemdal-atelier", url: "https://ldb-phinf.pstatic.net/20240406_215/1712335492012Ad6Ah_JPEG/KakaoTalk_20240406_004101676.jpg" },
  { slug: "ang-bear-bake", url: "https://ldb-phinf.pstatic.net/20250507_154/1746544686279xght0_JPEG/1000033738.jpg" },
];

for (const { slug, url } of images) {
  try {
    const proxyUrl = `https://search.pstatic.net/common/?autoRotate=true&type=w560_sharpen&src=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Referer": "https://pcmap.place.naver.com/",
      },
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const buffer = Buffer.from(await res.arrayBuffer());
    const dir = path.join(OUTPUT, slug);
    await fs.mkdir(dir, { recursive: true });
    
    const webpPath = path.join(dir, "01.webp");
    await sharp(buffer)
      .rotate()
      .resize({ width: 640, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(webpPath);
    
    const stat = await fs.stat(webpPath);
    console.log(`✅ ${slug}: ${(stat.size / 1024).toFixed(1)}KB`);
  } catch (err) {
    console.log(`❌ ${slug}: ${err.message}`);
  }
}

// Update places.json
const placesPath = path.join(ROOT, "data", "places.json");
const places = JSON.parse(await fs.readFile(placesPath, "utf-8"));
const updated = places.map(p => {
  const match = images.find(i => i.slug === p.slug);
  if (match && (!p.images || p.images.length === 0)) {
    return { ...p, images: [`/images/places/${p.slug}/01.webp`] };
  }
  return p;
});
await fs.writeFile(placesPath, JSON.stringify(updated, null, 2) + "\n");
console.log("\n✅ places.json updated with new image paths");
