#!/usr/bin/env node
// 인스타에 보낼 최종 이미지를 그대로 받아 검사하고 콘택트 시트 1장을 만든다.
// post-instagram.py 가 dry-run 과 실제 게시 직전에 부른다. 직접 돌려도 된다.
//
//   node scripts/ig-preview.mjs --out <dir> [--stamp <승인 코드>] <url1> <url2> ...
//
// stdout 에는 JSON 한 덩어리만 쓴다:
//   { slides: [{n, w, h, pad, dhash}], problems: [{n, kind, detail}], sheet }
// --stamp 는 시트 그림 맨 위에만 그린다(stdout 에는 안 나간다 → 시트를 열어야 승인 코드를 안다).
//
// 2026-11-02 전수조사(13게시물·71장)에서 나온 결함 중 기계가 잡을 수 있는 것을 막는다.
//   pad  — 단색 여백이 화면의 15% 초과 (흰 띠를 붙인 메뉴판 4장: 25~37%)
//   dup  — 한 게시물에 같은 사진 두 장 (커버 = 사진 + 제목 쌍: 거리 11~46 · 다른 사진 4042쌍 최솟값 90)
//   size — 장마다 크기가 다름 (인스타는 첫 장 비율로 나머지를 자른다)
// 사진이 90° 누운 것(9/8 Glunic)은 기계로 못 잡는다 → 시트를 사람이 본다.

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PAD_MAX = 15;      // %
const DUP_MAX = 64;      // dHash 256bit 해밍 거리 (실제 중복 ≤46 · 다른 사진 ≥90 의 가운데)
const TOL = 16;          // 여백 판정: 채널 차이 허용 (JPEG 잡음)
const ROW_OK = 0.985;    // 한 줄의 98.5% 가 기준색이면 여백 줄로 본다
const TILE_H = 360;
const LABEL_H = 30;
const SHEET_MAX_W = 1900;

function parseArgs(argv) {
  const out = { dir: null, stamp: "", urls: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--out") out.dir = argv[++i];
    else if (argv[i] === "--stamp") out.stamp = argv[++i];
    else out.urls.push(argv[i]);
  }
  if (!out.dir || out.urls.length === 0) {
    process.stderr.write("usage: node scripts/ig-preview.mjs --out <dir> <url>...\n");
    process.exit(2);
  }
  return out;
}

// 변마다 그 변 가운데 픽셀을 기준색으로 두고, 안쪽으로 같은 색 줄이 몇 줄 이어지나 센다.
async function measurePad(buf) {
  const { data, info } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;
  const px = (x, y) => { const i = (y * w + x) * ch; return [data[i], data[i + 1], data[i + 2]]; };
  const near = (a, b) => Math.abs(a[0] - b[0]) <= TOL && Math.abs(a[1] - b[1]) <= TOL && Math.abs(a[2] - b[2]) <= TOL;
  function scan(side) {
    const horiz = side === "top" || side === "bottom";
    const ref = side === "top" ? px(w >> 1, 0) : side === "bottom" ? px(w >> 1, h - 1)
      : side === "left" ? px(0, h >> 1) : px(w - 1, h >> 1);
    const limit = horiz ? h >> 1 : w >> 1;
    let n = 0;
    for (; n < limit; n++) {
      let ok = 0, tot = 0;
      if (horiz) {
        const y = side === "top" ? n : h - 1 - n;
        for (let x = 0; x < w; x += 2) { tot++; if (near(px(x, y), ref)) ok++; }
      } else {
        const x = side === "left" ? n : w - 1 - n;
        for (let y = 0; y < h; y += 2) { tot++; if (near(px(x, y), ref)) ok++; }
      }
      if (ok / tot < ROW_OK) break;
    }
    return n < 3 ? 0 : n; // 2줄 이하는 JPEG 테두리 잡음
  }
  const T = scan("top"), B = scan("bottom"), L = scan("left"), R = scan("right");
  // 마주 보는 두 변의 작은 쪽만 센다. 패딩(c_pad)은 양쪽에 같이 붙고, 한쪽만 단색인 건
  // 대개 사진 속 배경이다(회색 배경 케이크 x-ake/04 가 19.8% 로 막혔다 → 0%).
  const pad = 1 - ((w - 2 * Math.min(L, R)) * (h - 2 * Math.min(T, B))) / (w * h);
  return { w, h, pad: Math.round(pad * 1000) / 10 };
}

async function dhash(buf) {
  const { data } = await sharp(buf).greyscale().resize(17, 16, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  let bits = "";
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) bits += data[y * 17 + x] > data[y * 17 + x + 1] ? "1" : "0";
  let hex = "";
  for (let i = 0; i < 256; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  return hex;
}

function hamming(a, b) {
  let d = 0;
  for (let i = 0; i < a.length; i++) {
    let x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (x) { d += x & 1; x >>= 1; }
  }
  return d;
}

const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

async function tile(buf, label, bad, frame) {
  const img = await sharp(buf).resize({ height: TILE_H }).toBuffer();
  const { width } = await sharp(img).metadata();
  const svg = `<svg width="${width}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${bad ? "#b3261e" : "#1f1f1f"}"/>
    <text x="8" y="20" font-family="Helvetica, Arial, sans-serif" font-size="16" fill="#fff">${esc(label)}</text></svg>`;
  const parts = [{ input: img, left: 0, top: 0 }, { input: Buffer.from(svg), left: 0, top: TILE_H }];
  if (frame) {
    const f = `<svg width="${width}" height="${TILE_H}" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="${width - 6}" height="${TILE_H - 6}" fill="none" stroke="#e53935" stroke-width="6"/></svg>`;
    parts.push({ input: Buffer.from(f), left: 0, top: 0 });
  }
  const out = await sharp({ create: { width, height: TILE_H + LABEL_H, channels: 3, background: "#fff" } })
    .composite(parts).png().toBuffer();
  return { buf: out, width };
}

async function main() {
  const { dir, stamp, urls } = parseArgs(process.argv.slice(2));
  await fs.mkdir(dir, { recursive: true });

  const slides = [];
  const problems = [];
  const bufs = [];
  for (let i = 0; i < urls.length; i++) {
    const n = i + 1;
    let buf = null;
    try {
      const res = await fetch(urls[i], { signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.headers.get("x-cld-error") || ""}`.trim());
      buf = Buffer.from(await res.arrayBuffer());
      await fs.writeFile(path.join(dir, `${String(n).padStart(2, "0")}.img`), buf);
    } catch (e) {
      problems.push({ n, kind: "fetch", detail: String(e.message || e) });
      bufs.push(null);
      slides.push({ n, w: 0, h: 0, pad: 0, dhash: null });
      continue;
    }
    const m = await measurePad(buf);
    slides.push({ n, ...m, dhash: await dhash(buf) });
    bufs.push(buf);
    if (m.pad > PAD_MAX) problems.push({ n, kind: "pad", detail: `단색 여백 ${m.pad}% (기준 ${PAD_MAX}% 이하)` });
  }

  const first = slides.find((s) => s.w);
  for (const s of slides) {
    if (!s.w || !first) continue;
    if (s.w !== 1080 || s.w !== first.w || s.h !== first.h) {
      problems.push({ n: s.n, kind: "size", detail: `${s.w}x${s.h} — 1번 장은 ${first.w}x${first.h}` });
    }
  }
  for (let i = 0; i < slides.length; i++) {
    for (let j = i + 1; j < slides.length; j++) {
      if (!slides[i].dhash || !slides[j].dhash) continue;
      const d = hamming(slides[i].dhash, slides[j].dhash);
      if (d <= DUP_MAX) problems.push({ n: slides[j].n, kind: "dup", detail: `${slides[i].n}번 장과 같은 사진 (해시 거리 ${d})` });
    }
  }

  // 콘택트 시트: 1번 장 뒤에 프로필 그리드(3:4) 가운데 크롭을 붙인다.
  const tiles = [];
  for (let i = 0; i < bufs.length; i++) {
    if (!bufs[i]) continue;
    const s = slides[i];
    const bad = problems.some((p) => p.n === s.n);
    tiles.push(await tile(bufs[i], `${s.n}  ${s.w}x${s.h}  pad ${s.pad}%${bad ? "  ✗" : ""}`, bad, false));
    if (s.n === 1) {
      const gw = Math.min(s.w, Math.round((s.h * 3) / 4));
      const gh = Math.min(s.h, Math.round((gw * 4) / 3));
      const grid = await sharp(bufs[i])
        .extract({ left: Math.round((s.w - gw) / 2), top: Math.round((s.h - gh) / 2), width: gw, height: gh })
        .toBuffer();
      tiles.push(await tile(grid, `GRID 3:4 (sides -${Math.round(((s.w - gw) / s.w) * 100)}%)`, false, true));
    }
  }
  const GAP = 12;
  const rows = [[]];
  let x = 0;
  for (const t of tiles) {
    if (x > 0 && x + t.width > SHEET_MAX_W) { rows.push([]); x = 0; }
    rows[rows.length - 1].push({ ...t, left: x });
    x += t.width + GAP;
  }
  const sheetW = Math.max(...rows.map((r) => r.reduce((a, t) => Math.max(a, t.left + t.width), 0)), 640);
  const rowH = TILE_H + LABEL_H + GAP;
  const HEAD_H = stamp ? 56 : 0;
  const composite = rows.flatMap((r, ri) => r.map((t) => ({ input: t.buf, left: t.left, top: HEAD_H + ri * rowH })));
  if (stamp) {
    const head = `<svg width="${sheetW}" height="${HEAD_H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1b5e20"/>
      <text x="12" y="38" font-family="Menlo, Courier, monospace" font-size="28" fill="#fff">APPROVE CODE: ${esc(stamp)}</text></svg>`;
    composite.push({ input: Buffer.from(head), left: 0, top: 0 });
  }
  const sheet = path.join(dir, "sheet.png");
  await sharp({ create: { width: sheetW, height: Math.max(HEAD_H + rows.length * rowH - GAP, 1), channels: 3, background: "#e8e8e8" } })
    .composite(composite).png().toFile(sheet);

  process.stdout.write(JSON.stringify({ slides, problems, sheet }) + "\n");
}

main().catch((e) => {
  process.stderr.write(`ig-preview 실패: ${e.stack || e}\n`);
  process.exit(2);
});
