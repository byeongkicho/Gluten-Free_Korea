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

    cover_url = f"https://res.cloudinary.com/{CLOUD_NAME}/image/upload/c_fill,w_1080,h_1080,q_90/places/{args.slug}/cover"
    urls = [cover_url] + [
        f"https://res.cloudinary.com/{CLOUD_NAME}/image/upload/c_fill,w_1080,h_1080,q_90/{img}"
        for img in images
    ]

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
