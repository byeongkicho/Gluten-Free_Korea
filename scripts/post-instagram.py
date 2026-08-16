#!/usr/bin/env python3
"""
Post a carousel to Instagram via Graph API.
Handles caption encoding properly (avoids shell escaping issues).

Usage:
  python3 scripts/post-instagram.py --slug blu-seoul
  python3 scripts/post-instagram.py --slug blu-seoul --dry-run
"""

import argparse
import json
import os
import time
import urllib.request
import urllib.parse

# Load credentials
creds = {}
with open(os.path.expanduser("~/.instagram-creds")) as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        key, _, value = line.partition("=")
        creds[key.strip()] = value.strip()

IG_ID = creds["IG_ACCOUNT_ID"]
TOKEN = creds["LONG_LIVED_TOKEN"]
API_BASE = "https://graph.facebook.com/v21.0"
CLOUD_NAME = "dbbreghct"


def url_exists(url, timeout=10):
    """Cloudinary 리소스가 실제로 응답하는지 확인. 게시 전에 깨진 URL을 걸러낸다."""
    req = urllib.request.Request(url, method="HEAD")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status == 200
    except Exception:
        return False


def api_post(endpoint, data, retries=3):
    data["access_token"] = TOKEN
    encoded = urllib.parse.urlencode(data).encode()
    for attempt in range(retries):
        try:
            req = urllib.request.Request(f"{API_BASE}/{endpoint}", data=encoded, method="POST")
            with urllib.request.urlopen(req) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as e:
            if attempt < retries - 1 and e.code >= 500:
                wait = (attempt + 1) * 5
                print(f"  (retry in {wait}s — HTTP {e.code})", flush=True)
                time.sleep(wait)
            else:
                body = e.read().decode() if hasattr(e, 'read') else str(e)
                raise Exception(f"HTTP {e.code}: {body}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--slug", required=True)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    # Load places.json to get image count
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    with open(os.path.join(root, "data", "places.json")) as f:
        places = json.load(f)

    place = next((p for p in places if p["slug"] == args.slug), None)
    if not place:
        print(f"Place not found: {args.slug}")
        return

    # Load caption
    caption_path = os.path.join(root, "data", "captions", f"{args.slug}.txt")
    with open(caption_path) as f:
        caption = f.read().strip()

    # Build image URLs — cover first if it exists on Cloudinary
    images = place.get("images", [])
    if not images:
        print("No images found for this place")
        return

    # Add cache-busting timestamp to cover URL to avoid CDN serving stale images
    import time as _time
    cache_bust = int(_time.time())
    cover_url = f"https://res.cloudinary.com/{CLOUD_NAME}/image/upload/c_fill,w_1080,h_1080,q_90/v{cache_bust}/places/{args.slug}/cover"

    # cover는 "있으면 좋은 것"이 아니라 게시 준비가 끝났다는 표시다. 수동으로
    # 고른 정사각 대표 이미지이고, 자동 생성 경로가 없다. 게시된 9곳 중 8곳이
    # 보유, 미게시 15곳은 전무 — 즉 cover 유무가 큐레이션 여부를 가른다.
    #
    # 2026-08-15 사고: 이 자리에서 cover를 그냥 건너뛰도록 고쳤더니, 큐레이션되지
    # 않은 vegetus가 게시돼 버렸다. 첫 장이 "Christmas 2024 Special Dinner"
    # 세로 배너였고 1080 정사각으로 잘려 나갔다(8월에 2년 전 크리스마스 홍보물).
    # 게시물은 삭제했다. cover가 없으면 건너뛰는 게 아니라 멈춰야 한다.
    if not url_exists(cover_url):
        print(f"\n중단: places/{args.slug}/cover 가 Cloudinary에 없습니다.")
        print("  cover = 수동으로 고른 정사각 대표 이미지 = 게시 준비 완료 표시.")
        print("  이게 없으면 캐러셀 1번이 무엇이 될지 통제되지 않습니다")
        print("  (세로 배너·철 지난 프로모션·메뉴판이 첫 장이 될 수 있음).")
        print(f"\n  해야 할 일: {args.slug}의 대표 사진을 골라 1080x1080으로")
        print(f"  Cloudinary에 'places/{args.slug}/cover'로 업로드한 뒤 다시 실행하세요.")
        raise SystemExit(1)

    urls = [cover_url]
    for img in images:
        # Menu images (pre-padded to 1080x1080) — no crop transformation
        if "menu" in img:
            urls.append(f"https://res.cloudinary.com/{CLOUD_NAME}/image/upload/w_1080,h_1080,q_90/{img}")
        else:
            urls.append(f"https://res.cloudinary.com/{CLOUD_NAME}/image/upload/c_fill,w_1080,h_1080,q_90/{img}")

    print(f"Place: {place['name']} ({args.slug})")
    print(f"Images: {len(urls)}")
    print(f"Caption ({len(caption)} chars):")
    print("─" * 40)
    print(caption)
    print("─" * 40)
    print()

    if args.dry_run:
        print("DRY RUN — not posting")
        for i, url in enumerate(urls, 1):
            print(f"  {i}. {url}")
        return

    # Create carousel item containers
    print(f"Creating {len(urls)} media containers...")
    children_ids = []
    for i, url in enumerate(urls, 1):
        print(f"  {i}/{len(urls)}: ", end="", flush=True)
        resp = api_post(f"{IG_ID}/media", {
            "image_url": url,
            "is_carousel_item": "true",
        })
        cid = resp["id"]
        children_ids.append(cid)
        print(f"OK ({cid})")
        time.sleep(1)

    # Create carousel
    print("\nCreating carousel...")
    resp = api_post(f"{IG_ID}/media", {
        "media_type": "CAROUSEL",
        "caption": caption,
        "children": ",".join(children_ids),
    })
    carousel_id = resp["id"]
    print(f"  Carousel ID: {carousel_id}")

    # Wait for processing
    print("\nWaiting for processing...")
    time.sleep(5)

    # Publish
    print("Publishing...")
    resp = api_post(f"{IG_ID}/media_publish", {
        "creation_id": carousel_id,
    })
    media_id = resp["id"]

    print(f"\n  Published! Media ID: {media_id}")
    print(f"  https://www.instagram.com/noglutenkorea/")


if __name__ == "__main__":
    main()
