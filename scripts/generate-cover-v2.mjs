#!/usr/bin/env node

/**
 * Instagram 커버 v2 — 4:5(1080x1350) 세로 · 위에 훅, 아래에 배지·상호·동네
 *
 * v1(generate-cover.mjs)과 다른 점:
 *   - 정사각 → 4:5. 2025-01 프로필 격자가 3:4 로 바뀌어 정사각은 좌우가 잘리고,
 *     피드에서도 세로가 화면을 더 차지한다. Graph API 는 4:5 보다 긴 세로를 받지
 *     않는다(IG User Media 레퍼런스: "Must be within a 4:5 to 1.91:1 range").
 *   - 글자는 가운데 3:4 안전영역(폭 1012) 안에 둔다 — 격자 미리보기가 좌우를 자른다.
 *   - 위에 검색 의도 훅("Gluten-Free in Seoul"). 상호만으로는 여행자가 무슨 글인지 모른다.
 *   - 배지 색은 v1 과 같다(초록 = DEDICATED, 노랑 = FRIENDLY) — 기존 게시물과 이어지게.
 *
 * Usage:
 *   node scripts/generate-cover-v2.mjs cover <slug> <source.jpg> --hook "Gluten-Free in Seoul" \
 *        --area "Yeonnam · back for lunch, Oct 2026" [--tag 2026-10]
 *     → data/instagram-covers/<slug>-cover-v2-<tag>.jpg (업로드는 별도: places/<slug>/cover)
 *   node scripts/generate-cover-v2.mjs pad <source.jpg> <out.jpg>
 *     → 가로 사진을 잘림 없이 4:5 로(같은 사진을 흐리게 깔고 가운데에 얹는다)
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const placesPath = path.join(rootDir, "data", "places.json");
const outputDir = path.join(rootDir, "data", "instagram-covers");

const W = 1080;
const H = 1350;
const cx = W / 2;
const FONT = "Arial, Helvetica, sans-serif";

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// 뒤에 붙은 업종 단어만 뗀다("Cafe Pepper" 처럼 앞에 오는 건 둔다). v1 은 한 번만 떼서
// "Monil2 House Gluten-Free Cafe" → "Monil2 House Gluten-Free" 가 됐다 — 더 뗄 게 없을 때까지 반복한다.
function displayName(place) {
  const raw = place.nameEn || place.name;
  let name = raw.trim();
  for (let prev = ""; prev !== name; ) {
    prev = name;
    name = name.replace(/\s+(Gluten[- ]?Free|GF|Cafe|Restaurant|Bakery|Bar)$/i, "").trim();
  }
  return name || raw;
}

function overlaySvg({ hook, name, area, dedicated }) {
  const badge = dedicated ? "DEDICATED GLUTEN-FREE" : "GLUTEN-FREE FRIENDLY";
  const badgeColor = dedicated ? "#4ADE80" : "#FBBF24";
  // 좌우 여백 약 20px — v1(4월) 배지와 같은 숨통. 15+44 는 글자가 테두리에 붙었다(10-20 평가)
  const bw = badge.length * 17 + 40;
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(0,0,0,0.55)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></linearGradient>
    <linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(0,0,0,0)"/><stop offset="1" stop-color="rgba(0,0,0,0.65)"/></linearGradient>
    <radialGradient id="v" cx="50%" cy="50%" r="75%"><stop offset="0.6" stop-color="rgba(0,0,0,0)"/><stop offset="1" stop-color="rgba(0,0,0,0.35)"/></radialGradient>
    <filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.55"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#v)"/>
  <rect width="${W}" height="300" fill="url(#t)"/>
  <rect y="${H - 380}" width="${W}" height="380" fill="url(#b)"/>
  <text x="${cx}" y="150" font-family="${FONT}" font-size="84" font-weight="800" fill="#fff" text-anchor="middle" filter="url(#s)">${escapeXml(hook)}</text>
  <rect x="${cx - bw / 2}" y="${H - 300}" width="${bw}" height="50" rx="25" fill="${badgeColor}"/>
  <text x="${cx}" y="${H - 266}" font-family="${FONT}" font-size="25" font-weight="800" fill="#1a1a1a" letter-spacing="1.5" text-anchor="middle">${escapeXml(badge)}</text>
  <text x="${cx}" y="${H - 170}" font-family="${FONT}" font-size="74" font-weight="800" fill="#fff" text-anchor="middle" filter="url(#s)">${escapeXml(name)}</text>
  <text x="${cx}" y="${H - 112}" font-family="${FONT}" font-size="32" fill="rgba(255,255,255,0.88)" text-anchor="middle" filter="url(#s)">${escapeXml(area)}</text>
  <text x="${cx}" y="${H - 50}" font-family="${FONT}" font-size="22" font-weight="600" fill="rgba(255,255,255,0.6)" text-anchor="middle">noglutenkorea.com</text>
</svg>`;
}

// 가볍게만 보정한다 — 폰 사진의 탁한 기운을 덜어내는 정도. 음식 색을 바꾸지 않는다.
const TONE = { brightness: 1.04, saturation: 1.08 };

async function cover(slug, src, opts) {
  const places = JSON.parse(await fs.readFile(placesPath, "utf-8"));
  const place = places.find((p) => p.slug === slug);
  if (!place) throw new Error(`place not found: ${slug}`);
  if (!opts.hook || !opts.area) throw new Error("--hook 과 --area 가 필요하다");

  const base = await sharp(src).rotate()
    .resize(W, H, { fit: "cover", position: "centre" })
    .modulate(TONE).jpeg({ quality: 95 }).toBuffer();
  const svg = overlaySvg({
    hook: opts.hook,
    name: displayName(place),
    area: opts.area,
    dedicated: (place.tags || []).includes("Dedicated GF"),
  });

  await fs.mkdir(outputDir, { recursive: true });
  const out = path.join(outputDir, `${slug}-cover-v2-${opts.tag}.jpg`);
  await sharp(base).composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).jpeg({ quality: 92 }).toFile(out);
  console.log(`✓ ${path.relative(rootDir, out)}`);
}

// 원본에서 4:5 영역을 직접 잘라 1080x1350 으로. 웹용(1200x900)을 c_fill 로 늘리면 1.5배 확대라 흐려진다.
async function crop(src, out, region) {
  const [left, top, width, height] = region.split(",").map(Number);
  if (Math.abs(width / height - W / H) > 0.01) throw new Error(`영역 비율이 4:5 가 아니다: ${width}x${height}`);
  await sharp(src).rotate().extract({ left, top, width, height }).resize(W, H)
    .modulate(TONE).jpeg({ quality: 92 }).toFile(out);
  console.log(`✓ ${out}`);
}

// "Before you go" 정보 카드 — 저장될 만한 장. spec 파일 한 줄이 한 요소다:
//   첫 줄 = 제목 · "- " = 항목 · "> " = 직원에게 보여줄 한국어(흰 상자, 발음 표기 없음)
//   · "~ " = 바로 위 한국어의 영어 뜻(작게) · 마지막 "@" 줄 = 바닥글
// 줄바꿈은 하지 않는다 — 넘치면 spec 에서 줄을 나눌 것(폭 900 안).
async function card(bgSrc, specPath, out) {
  const lines = (await fs.readFile(specPath, "utf-8")).split(/\r?\n/).filter((l) => l.trim());
  const [title, ...rest] = lines;
  const footer = rest.at(-1)?.startsWith("@") ? rest.pop() : "";
  const KO = "Apple SD Gothic Neo, AppleSDGothicNeo-Bold, sans-serif";
  const STEP = { bullet: 88, phrase: 108, gloss: 50 };
  const kind = (l) => (l.startsWith("> ") ? "phrase" : l.startsWith("~ ") ? "gloss" : "bullet");
  const body = rest.reduce((h, l) => h + STEP[kind(l)], 0);
  // 제목 아래(240)부터 바닥글 위(H-130)까지의 가운데에 본문을 둔다
  let y = Math.round(240 + (H - 130 - 240 - body) / 2) + 50;
  const parts = [];
  for (const l of rest) {
    if (kind(l) === "phrase") {
      parts.push(`<rect x="90" y="${y - 58}" width="900" height="84" rx="18" fill="rgba(255,255,255,0.94)"/>`);
      parts.push(`<text x="${cx}" y="${y}" font-family="${KO}" font-size="44" font-weight="700" fill="#1a1a1a" text-anchor="middle">${escapeXml(l.slice(2))}</text>`);
      y += STEP.phrase;
    } else if (kind(l) === "gloss") {
      // 상자 바로 아래에 붙인다(앞 줄의 다음 칸을 당겨 쓴다)
      parts.push(`<text x="${cx}" y="${y - 52}" font-family="${FONT}" font-size="30" fill="rgba(255,255,255,0.75)" text-anchor="middle">${escapeXml(l.slice(2))}</text>`);
      y += STEP.gloss;
    } else {
      parts.push(`<text x="100" y="${y}" font-family="${FONT}, ${KO}" font-size="46" font-weight="600" fill="#fff">${escapeXml("• " + l.replace(/^- /, ""))}</text>`);
      y += STEP.bullet;
    }
  }
  if (body > H - 130 - 240) throw new Error(`카드 내용이 넘친다(${body}px) — 줄을 줄일 것`);
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <text x="${cx}" y="170" font-family="${FONT}" font-size="92" font-weight="800" fill="#fff" text-anchor="middle">${escapeXml(title)}</text>
  <rect x="${cx - 40}" y="202" width="80" height="5" rx="2.5" fill="#4ADE80"/>
  ${parts.join("\n  ")}
  <text x="${cx}" y="${H - 60}" font-family="${FONT}" font-size="28" font-weight="600" fill="rgba(255,255,255,0.75)" text-anchor="middle">${escapeXml(footer)}</text>
</svg>`;
  const bg = await sharp(bgSrc).rotate().resize(W, H, { fit: "cover" }).blur(30).modulate({ brightness: 0.45 }).toBuffer();
  await sharp(bg).composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).jpeg({ quality: 92 }).toFile(out);
  console.log(`✓ ${out}`);
}

async function pad(src, out) {
  const bg = await sharp(src).rotate().resize(W, H, { fit: "cover" }).blur(40).modulate({ brightness: 0.8 }).toBuffer();
  const fg = await sharp(src).rotate().resize({ width: W }).modulate(TONE).toBuffer();
  const { height } = await sharp(fg).metadata();
  await sharp(bg).composite([{ input: fg, top: Math.round((H - height) / 2), left: 0 }]).jpeg({ quality: 90 }).toFile(out);
  console.log(`✓ ${out}`);
}

const [cmd, ...rest] = process.argv.slice(2);
const opt = (name) => {
  const i = rest.indexOf(`--${name}`);
  return i === -1 ? undefined : rest[i + 1];
};

if (cmd === "cover" && rest.length >= 2) {
  const now = new Date();
  const tag = opt("tag") || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  await cover(rest[0], rest[1], { hook: opt("hook"), area: opt("area"), tag });
} else if (cmd === "pad" && rest.length === 2) {
  await pad(rest[0], rest[1]);
} else if (cmd === "crop" && rest.length === 3) {
  await crop(rest[0], rest[1], rest[2]);
} else if (cmd === "card" && rest.length === 3) {
  await card(rest[0], rest[1], rest[2]);
} else {
  console.log("Usage: generate-cover-v2.mjs cover <slug> <source.jpg> --hook ... --area ... [--tag YYYY-MM]");
  console.log("       generate-cover-v2.mjs pad <source.jpg> <out.jpg>");
  console.log("       generate-cover-v2.mjs crop <source.jpg> <out.jpg> <left,top,width,height>   (원본 좌표 · 4:5)");
  console.log("       generate-cover-v2.mjs card <background.jpg> <spec.txt> <out.jpg>");
  process.exit(1);
}
