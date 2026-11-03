#!/usr/bin/env python3
"""
Post a carousel to Instagram via Graph API.
Handles caption encoding properly (avoids shell escaping issues).

Usage:
  python3 scripts/post-instagram.py --slug blu-seoul --dry-run        # 검사 + 시트 + 승인 코드
  python3 scripts/post-instagram.py --slug blu-seoul --approve 1a2b3c4d  # 시트를 보고 승인한 뒤에만

게시는 dry-run 이 만든 콘택트 시트를 사람이 본 뒤에만 된다(docs/RUNBOOK.md「인스타 게시」).
"""

import argparse
import hashlib
import json
import os
import secrets
import shlex
import subprocess
import tempfile
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


def run_preview(root, urls, out_dir, stamp=""):
    """scripts/ig-preview.mjs 로 보낼 이미지를 그대로 받아 검사하고 시트를 만든다.
    검사를 못 돌리면 게시하지 않는다. stamp 는 시트 그림 안에만 그려진다."""
    cmd = ["node", os.path.join(root, "scripts", "ig-preview.mjs"), "--out", out_dir]
    if stamp:
        cmd += ["--stamp", stamp]
    proc = subprocess.run(cmd + list(urls), capture_output=True, text=True, cwd=root)
    if proc.returncode != 0:
        print(proc.stderr.strip())
        print("\n중단: 미리보기 검사를 돌리지 못했습니다. 검사 없이는 게시하지 않습니다.")
        raise SystemExit(1)
    return json.loads(proc.stdout)


def hamming_hex(a, b):
    return bin(int(a, 16) ^ int(b, 16)).count("1")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--slug", required=True)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--skip", default="",
                        help="캐러셀에서 뺄 이미지 번호(쉼표). cover로 쓴 원본이나 "
                             "음식이 아닌 컷을 제외할 때. 예: --skip 04,05")
    parser.add_argument("--slides", default="",
                        help="cover 뒤에 올 이미지를 직접 지정(places/<slug>/ 아래 이름, 쉼표, 순서대로). "
                             "주면 places.json 의 images 와 --skip 대신 쓴다. 예: --slides panini-2026-10,churros-2026-10")
    parser.add_argument("--ratio", choices=["1:1", "4:5"], default="1:1",
                        help="캐러셀 비율. 4:5 는 cover 도 1080x1350 이어야 한다(generate-cover-v2.mjs). "
                             "API 는 4:5 보다 긴 세로를 받지 않는다")
    parser.add_argument("--approve", default="",
                        help="dry-run 이 출력한 승인 코드. 시트를 보고 Ki 가 승인한 뒤에만 넣는다")
    parser.add_argument("--allow", default="",
                        help="자동 검사(여백·중복·크기)를 면제할 장 번호(쉼표). 시트를 보고 일부러 둔 장만. "
                             "승인 코드에 함께 묶인다. 예: --allow 3")
    # 한 매장에 게시물이 둘 이상이면(재방문·재게시) 커버와 캡션이 게시물마다 다르다.
    # 2026-11-02 재게시: 모닐이네·쿠촐로는 places/<slug>/cover 와 data/captions/<slug>.txt 가 이미 10월 게시물 것이다.
    parser.add_argument("--cover", default="cover",
                        help="커버로 쓸 places/<slug>/ 아래 이름. 예: --cover cover-2611-p02")
    parser.add_argument("--caption", default="",
                        help="캡션 파일(저장소 기준 경로). 기본 data/captions/<slug>.txt. "
                             "예: --caption data/instagram-covers/repost-2611/captions/p02.txt")
    args = parser.parse_args()
    h = 1350 if args.ratio == "4:5" else 1080
    # 4:5 로 자를 때는 가로 사진이 많아 가운데 고정 크롭이 음식을 자른다 → g_auto.
    # f_jpg: API 문서의 형식은 JPEG 다(webp 원본이 그대로 나가도 지금까지는 받아 줬다).
    fill = f"c_fill,g_auto,w_1080,h_{h},f_jpg" if args.ratio == "4:5" else "c_fill,w_1080,h_1080"

    # Load places.json to get image count
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    with open(os.path.join(root, "data", "places.json")) as f:
        places = json.load(f)

    place = next((p for p in places if p["slug"] == args.slug), None)
    if not place:
        print(f"Place not found: {args.slug}")
        return

    # Load caption
    caption_path = os.path.join(root, args.caption) if args.caption else os.path.join(root, "data", "captions", f"{args.slug}.txt")
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
    cover_url = f"https://res.cloudinary.com/{CLOUD_NAME}/image/upload/{fill},q_90/v{cache_bust}/places/{args.slug}/{args.cover}"

    # cover는 "있으면 좋은 것"이 아니라 게시 준비가 끝났다는 표시다. 수동으로
    # 고른 정사각(--ratio 4:5 면 1080x1350) 대표 이미지이고, 자동 생성 경로가 없다. 게시된 9곳 중 8곳이
    # 보유, 미게시 15곳은 전무 — 즉 cover 유무가 큐레이션 여부를 가른다.
    #
    # 2026-08-15 사고: 이 자리에서 cover를 그냥 건너뛰도록 고쳤더니, 큐레이션되지
    # 않은 vegetus가 게시돼 버렸다. 첫 장이 "Christmas 2024 Special Dinner"
    # 세로 배너였고 1080 정사각으로 잘려 나갔다(8월에 2년 전 크리스마스 홍보물).
    # 게시물은 삭제했다. cover가 없으면 건너뛰는 게 아니라 멈춰야 한다.
    if not url_exists(cover_url):
        print(f"\n중단: places/{args.slug}/{args.cover} 가 Cloudinary에 없습니다.")
        print("  cover = 수동으로 고른 정사각 대표 이미지 = 게시 준비 완료 표시.")
        print("  이게 없으면 캐러셀 1번이 무엇이 될지 통제되지 않습니다")
        print("  (세로 배너·철 지난 프로모션·메뉴판이 첫 장이 될 수 있음).")
        print(f"\n  해야 할 일: {args.slug}의 대표 사진을 골라 1080x1080으로")
        print(f"  Cloudinary에 'places/{args.slug}/{args.cover}'로 업로드한 뒤 다시 실행하세요.")
        raise SystemExit(1)

    urls = [cover_url]
    skip = {s.strip() for s in args.skip.split(",") if s.strip()}
    slides = [s.strip() for s in args.slides.split(",") if s.strip()]
    if slides:
        images = [f"places/{args.slug}/{s}" for s in slides]
        skip = set()
    for img in images:
        if skip and img.rsplit("/", 1)[-1] in skip:
            print(f"  제외: {img}")
            continue
        # Menu images: never crop (글자가 끊긴다) or stretch. 비율이 안 맞는 빈 곳은 같은 사진을
        # 흐리게 깔아 채운다. 2026-11-02 전수조사: 흰 띠(c_pad,b_white)를 붙인 장이 여백 25~37%로
        # 보기 나빴다. b_blurred 는 영상 전용이라 사진에는 400(Invalid color name) → 레이어로 만든다.
        # v{cache_bust}: cover 와 같은 이유. 같은 이름으로 다시 올린 사진은 CDN 이 옛 변환본을
        # 계속 준다(2026-10-20 실측: 덮어쓰기 + invalidate 뒤에도 크기가 그대로였다).
        if "menu" in img:
            layer = img.replace("/", ":")
            urls.append(f"https://res.cloudinary.com/{CLOUD_NAME}/image/upload/"
                        f"c_fill,w_1080,h_{h}/e_blur:2000/e_brightness:-10/"
                        f"l_{layer},c_fit,w_1080,h_{h}/fl_layer_apply,q_90,f_jpg/v{cache_bust}/{img}")
        else:
            urls.append(f"https://res.cloudinary.com/{CLOUD_NAME}/image/upload/{fill},q_90/v{cache_bust}/{img}")

    print(f"Place: {place['name']} ({args.slug})")
    print(f"Images: {len(urls)}")
    print(f"Caption ({len(caption)} chars):")
    print("─" * 40)
    print(caption)
    print("─" * 40)
    print()

    # ── 미리보기 게이트 ───────────────────────────────────────────
    # 2026-11-02 전수조사: 누운 사진(9/8 Glunic)·흰 여백 4장·같은 사진 중복 9장이 게시돼 있었다.
    # 전부 URL 이 200 이었고, 아무도 보낼 이미지를 열어 보지 않았다. 그래서
    #   dry-run  : 보낼 이미지를 그대로 받아 자동 검사 → 콘택트 시트 → 승인 코드(시트 그림 안에만)
    #   실제 게시: 승인 코드가 맞고, 내용이 dry-run 때와 같고, 이미지가 승인 때와 같을 때만
    # 승인 코드는 무작위 값이고 터미널에 찍지 않는다 → 시트를 열어야만 게시할 수 있다.
    # 내용 대조는 v{cache_bust} 를 뺀 URL·캡션·--allow 로 한다(cache_bust 는 실행마다 바뀐다).
    allow = sorted({int(x) for x in args.allow.split(",") if x.strip()})
    stable = [u.replace(f"/v{cache_bust}/", "/") for u in urls]
    content = hashlib.sha256(json.dumps({"urls": stable, "caption": caption, "allow": allow},
                                        ensure_ascii=False).encode()).hexdigest()
    sha = lambda s: hashlib.sha256(s.encode()).hexdigest()
    # 같은 매장의 다른 게시물 승인 기록을 덮지 않게 커버 이름으로 나눈다
    out_dir = os.path.join(tempfile.gettempdir(), "ig-preview",
                           args.slug if args.cover == "cover" else f"{args.slug}--{args.cover}")
    manifest_path = os.path.join(out_dir, "manifest.json")

    manifest = None
    if not args.dry_run:
        if not args.approve:
            print("중단: 승인 코드가 없습니다. 먼저 --dry-run 으로 시트를 만들어 보고, 승인되면 --approve <코드>.")
            raise SystemExit(1)
        try:
            with open(manifest_path) as f:
                manifest = json.load(f)
        except (OSError, ValueError):
            manifest = None
        if not manifest:
            print(f"중단: 승인 기록({manifest_path})이 없습니다. --dry-run 을 다시 돌리세요.")
            raise SystemExit(1)
        if manifest.get("content") != content:
            print("중단: 지금 게시 내용(이미지 목록·캡션·--allow)이 dry-run 때와 다릅니다.")
            print("  승인 뒤에 무언가 바뀌었습니다. --dry-run 을 다시 돌려 시트를 다시 보세요.")
            raise SystemExit(1)
        if sha(args.approve.strip().lower()) != manifest.get("token_sha"):
            print("중단: 승인 코드가 맞지 않습니다. 코드는 마지막 dry-run 시트 맨 위에 있습니다.")
            raise SystemExit(1)

    token = secrets.token_hex(4) if args.dry_run else ""
    print("미리보기 검사: 보낼 이미지를 받아 여백·중복·크기를 잽니다...")
    preview = run_preview(root, urls, out_dir if args.dry_run else os.path.join(out_dir, "verify"), token)
    blocking, waived = [], []
    for p in preview["problems"]:
        (waived if p["n"] in allow and p["kind"] != "fetch" else blocking).append(p)
    for p in waived:
        print(f"  면제(--allow): {p['n']}번 장 — {p['detail']}")
    if blocking:
        print("\n중단: 자동 검사에 걸렸습니다.")
        for p in blocking:
            print(f"  ✗ {p['n']}번 장 [{p['kind']}] {p['detail']}")
        print(f"\n  시트: {preview['sheet']}")
        print("  그 장을 빼거나(--skip/--slides) 고친 뒤 다시 돌리세요. 일부러 두는 장이면 --allow <번호>.")
        raise SystemExit(1)

    if args.dry_run:
        os.makedirs(out_dir, exist_ok=True)
        with open(manifest_path, "w") as f:
            json.dump({"content": content, "token_sha": sha(token), "urls": stable,
                       "dhash": [s["dhash"] for s in preview["slides"]],
                       "at": time.strftime("%Y-%m-%d %H:%M:%S")}, f, ensure_ascii=False, indent=1)
        print("\nDRY RUN — 게시하지 않음")
        for i, url in enumerate(urls, 1):
            print(f"  {i}. {url}")
        print(f"\n자동 검사 통과. 시트: {preview['sheet']}")
        print("  시트를 열어 사진이 누웠거나 잘렸거나 커버 3:4(빨간 테두리)에서 이름이 잘리지 않았는지 본다.")
        print("  승인 코드는 시트 맨 위 초록 띠(APPROVE CODE)에만 있다. 터미널에는 찍지 않는다.")
        parts = ["python3", "scripts/post-instagram.py", "--slug", args.slug]
        if args.ratio != "1:1":
            parts += ["--ratio", args.ratio]
        cover_arg = args.cover if args.cover != "cover" else ""
        for flag, val in (("--skip", args.skip), ("--slides", args.slides), ("--allow", args.allow),
                          ("--cover", cover_arg), ("--caption", args.caption)):
            if val:
                parts += [flag, val]
        print("  Ki 가 승인하면: " + " ".join(shlex.quote(p) for p in parts) + " --approve <시트의 코드>")
        return

    # 승인한 뒤 같은 이름으로 다른 사진이 올라갔으면 URL 은 같아도 이미지가 다르다 → 해시로 대조.
    approved = manifest.get("dhash", [])
    now = [s["dhash"] for s in preview["slides"]]
    if len(approved) != len(now):
        print("중단: 승인 때와 장 수가 다릅니다. --dry-run 을 다시 돌리세요.")
        raise SystemExit(1)
    for n, (a, b) in enumerate(zip(approved, now), 1):
        if not a or not b or hamming_hex(a, b) > 10:
            print(f"중단: {n}번 장이 승인 때 본 이미지와 다릅니다. --dry-run 을 다시 돌리세요.")
            raise SystemExit(1)
    print("승인 확인: 코드 일치 · 내용 일치 · 이미지가 시트와 같음")

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
