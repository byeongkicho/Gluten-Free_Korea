#!/bin/bash
#
# weekly-publish.sh — Weekly content pipeline
#
# Orchestrates: discover → add places → images → build → deploy → instagram
#
# Usage:
#   bash scripts/weekly-publish.sh              # full pipeline
#   bash scripts/weekly-publish.sh --skip-discover  # skip discovery, use existing places
#   bash scripts/weekly-publish.sh --dry-run    # preview without deploying/posting
#

set -euo pipefail
cd "$(dirname "$0")/.."

# ── Config ─────────────────────────────────────────────────

WEBSITE_TARGET=2    # places to add to website per week
INSTAGRAM_TARGET=1  # instagram posts per week
DRY_RUN=false
SKIP_DISCOVER=false

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --skip-discover) SKIP_DISCOVER=true ;;
  esac
done

# ── Helpers ────────────────────────────────────────────────

step() { echo -e "\n══ $1 ══\n"; }
ok()   { echo "  ✓ $1"; }
skip() { echo "  ⏭ $1"; }
fail() { echo "  ✗ $1"; exit 1; }

# ── Step 1: Sync Naver bookmarks ───────────────────────────

step "1/7 Sync Naver bookmarks"
npm run sync:naver 2>&1 | tail -5
ok "Bookmarks synced"

# ── Step 2: Discover new places ────────────────────────────

step "2/7 Discover new places"
if [ "$SKIP_DISCOVER" = true ]; then
  skip "Discovery skipped (--skip-discover)"
else
  if node scripts/discover-places.mjs --all-queries 2>&1; then
    ok "Discovery complete"
  else
    echo "  ⚠ Discovery failed (API key missing?). Continuing with existing data."
  fi
fi

# ── Step 3: Check what needs images ────────────────────────

step "3/7 Fetch Naver images for places without photos"
node scripts/integrate-naver-images.mjs 2>&1
ok "Image integration done"

# ── Step 4: Build & validate ──────────────────────────────

step "4/7 Build places.json"
npm run build:places 2>&1
npm run validate:places 2>&1
ok "places.json valid"

# ── Step 5: Build site ─────────────────────────────────────

step "5/7 Build website"
npm run build 2>&1
ok "Site built"

# ── Step 6: Deploy ─────────────────────────────────────────

step "6/7 Deploy"
if [ "$DRY_RUN" = true ]; then
  skip "Deploy skipped (--dry-run)"
else
  echo "Deploy to Cloudflare Pages? [y/N]"
  read -r confirm
  if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    npx wrangler pages deploy .vercel/output/static --project-name noglutenkorea 2>&1
    ok "Deployed"
  else
    skip "Deploy skipped by user"
  fi
fi

# ── Step 7: Instagram prep ─────────────────────────────────

step "7/7 Instagram preparation"

# Find places with images that haven't been posted yet
# (For now, generate captions for places with most images)
echo "Generating captions for top places..."
echo ""

# List places with images, sorted by image count
node -e "
const places = require('./data/places.json');
const fs = require('fs');
const path = require('path');

const withImages = places
  .map(p => {
    const dir = path.join('public/images/places', p.slug);
    let count = 0;
    try {
      count = fs.readdirSync(dir).filter(f => f.endsWith('.webp') && !f.startsWith('thumb_')).length;
    } catch {}
    return { ...p, imageCount: count };
  })
  .filter(p => p.imageCount > 0)
  .sort((a, b) => b.imageCount - a.imageCount);

console.log('Places with images:');
for (const p of withImages) {
  const captionExists = fs.existsSync(path.join('data/captions', p.slug + '.txt'));
  const mark = captionExists ? '📝' : '  ';
  console.log('  ' + mark + ' ' + p.slug + ' (' + p.imageCount + ' photos) — ' + p.name);
}
console.log('');
console.log('📝 = caption already generated');
" 2>&1

echo ""
echo "To generate a caption:"
echo "  npm run generate:caption <slug>"
echo ""
echo "To upload to Cloudinary + post to Instagram:"
echo "  npm run upload:cloudinary"
echo "  instagram-upload.sh --caption \"\$(cat data/captions/<slug>.txt)\" --images \"url1,url2,...\""

if [ "$DRY_RUN" = true ]; then
  echo ""
  echo "(Dry run complete — no deploy or posts made)"
fi

echo ""
echo "══ Weekly pipeline complete ══"
