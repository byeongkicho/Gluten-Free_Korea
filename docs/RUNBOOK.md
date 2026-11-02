# RUNBOOK.md

## Daily Publishing Flow
1. Save latest Naver export JSON to `data/naver_raw.json` (local only, gitignored).
2. Regenerate publish data: `npm run publish:local`.
3. Add per-`sid` content overrides in `data/overrides.json` if needed, then rerun `npm run publish:local`.
4. Verify deploy build: `npm run pages:build`.
5. Commit and push.

## Fast Pre-Deploy Command
```bash
npm run publish:local && npm run pages:build
```

## 인스타 게시 (미리보기 게이트)
2026-11-02 전수조사(13게시물·71장)에서 누운 사진 2장, 흰 여백 25~37% 4장, 같은 사진 중복 9장, 메뉴판 좌우 잘림 2장이 이미 게시돼 있었다. 모두 URL 200 만 보고 올렸다. 그래서 게시는 아래 순서로만 된다.

1. `python3 scripts/post-instagram.py --slug <slug> [--ratio 4:5] [--slides …|--skip …] --dry-run`
   - 보낼 이미지를 그대로 받아 자동 검사: 단색 여백 15% 초과(마주 보는 두 변 기준) · 같은 사진(해시 거리 ≤64 — 실제 중복 ≤46, 다른 사진 ≥90) · 장마다 크기 다름 → 하나라도 걸리면 중단
   - 통과하면 콘택트 시트 PNG 경로를 출력한다. **승인 코드는 시트 맨 위 초록 띠에만 있다**(터미널에는 안 찍는다 → 시트를 열어야만 게시할 수 있다)
2. 시트를 **열어서 본다**(세션이면 Read 로). 자동 검사가 못 잡는 것:
   - 사진이 90° 누움 (9/8 Glunic)
   - 음식·간판이 가장자리에서 잘림. 이름에 `menu` 가 없는 메뉴판은 흐린 배경이 아니라 크롭돼 잘린다
   - 빨간 테두리 = 프로필 그리드 3:4 크롭. 가게 이름이 남는지
   - 커버를 원본에서 확대해 다시 자른 경우의 중복 (해시가 못 잡는다)
3. 시트를 Ki 에게 보여 주고 승인을 받는다.
4. dry-run 이 출력한 명령에 `--approve <시트의 코드>` 를 붙여 실행한다.
   - 이미지 목록·캡션·`--allow` 가 dry-run 때와 다르면 멈춘다. 코드는 마지막 dry-run 것만 통한다
   - 승인 뒤 같은 이름으로 다른 사진이 올라가도 해시 대조로 멈춘다
   - 일부러 두는 장은 `--allow <번호>` 로만 면제한다. 면제도 승인 코드에 묶인다

메뉴판처럼 비율이 안 맞는 사진은 흰 띠 대신 같은 사진을 흐리게 깔아 채운다. Cloudinary `b_blurred` 는 영상 전용이라 사진에는 400 이 나서, 레이어로 만든다.

## Guardrails
- Treat `data/places.json` as generated output.
- Keep routes unchanged unless a dedicated planning PR says otherwise.
