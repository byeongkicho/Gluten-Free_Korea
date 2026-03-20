# TASKS.md

Codex-executable improvement backlog.

## Format rules
- Tasks are ordered by priority (P0 → P3).
- Each task has a **Codex prompt** — paste it directly into `codex` CLI.
- **Done when** is the acceptance criteria (verifiable without running the app).
- Do not reorder tasks; mark completed tasks with `[x]` in the checkbox.
- Append new tasks at the bottom; never edit completed entries.

---

## Deployment Automation

### [x] TASK-00: GitHub Actions auto-deploy to Cloudflare Pages

**Priority:** P0 (blocks all other automation)
**Files to create:** `.github/workflows/deploy.yml`
**Secrets required (set in GitHub repo settings):**
- `CLOUDFLARE_API_TOKEN` — Cloudflare API token with "Cloudflare Pages:Edit" permission
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account ID

**Codex prompt:**
```
Create .github/workflows/deploy.yml that:
1. Triggers on push to main branch only.
2. Uses Node.js 20 (actions/setup-node@v4).
3. Runs: npm ci
4. Runs: npm run pages:build   (this already runs build:places + next build + next-on-pages)
5. Deploys using: npx wrangler pages deploy .vercel/output/static --project-name gluten-free-korea
   - Pass CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID from GitHub Secrets as env vars.
6. Cache node_modules using actions/cache@v4 keyed on package-lock.json hash.
7. Do not add any test or lint steps.
```

**Done when:**
- `.github/workflows/deploy.yml` exists
- Workflow triggers only on `push: branches: [main]`
- Deploy step uses `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from `${{ secrets.* }}`

---

## P0 — Fix Now

### [x] TASK-01: Fix sitemap lastModified to use per-place dates

**Priority:** P0 — incorrect dates cause Google to distrust the sitemap
**Files:** `app/sitemap.js`, `data/overrides.json`, `scripts/build_places.mjs`

**Codex prompt:**
```
1. In scripts/build_places.mjs: when merging a place, write today's ISO date string
   (new Date().toISOString().slice(0, 10)) into a new field `updatedAt` on each place object
   IF the override for that SID has changed (compare by JSON.stringify of the override object).
   For now, add `updatedAt` to all places using today's date as a one-time seed.

2. In data/overrides.json: do NOT change anything — updatedAt is generated, not authored.

3. In app/sitemap.js: change each place route's lastModified from `new Date()` to
   `place.updatedAt ? new Date(place.updatedAt) : new Date('2026-03-10')`.

Keep the static routes (/, /guide) using a fixed date '2026-03-10', not new Date().
```

**Done when:**
- `places.json` contains `"updatedAt": "YYYY-MM-DD"` on all 11 places
- `sitemap.js` uses `place.updatedAt` for place routes
- Static routes use a fixed ISO date string, not `new Date()`

---

### [x] TASK-02: Remove dead Tailwind v3 config

**Priority:** P0 — dead config causes confusion; content paths reference non-existent `./pages/`
**Files:** `tailwind.config.js`

**Codex prompt:**
```
Delete tailwind.config.js entirely.
Tailwind v4 is configured exclusively via @import "tailwindcss" in app/globals.css
and the @tailwindcss/postcss plugin in postcss.config.mjs.
The darkMode: "class" and content path settings in tailwind.config.js are v3 options
that Tailwind v4 ignores, but their presence is misleading.
After deleting, confirm that app/globals.css already contains:
  @import "tailwindcss";
  @variant dark (&:where(.dark, .dark *));
No other changes needed.
```

**Done when:**
- `tailwind.config.js` does not exist
- `app/globals.css` still has `@import "tailwindcss"` and the `@variant dark` line

---

### [x] TASK-03: Set server-side `lang` attribute on `<html>`

**Priority:** P0 — screen readers and crawlers read `lang` before JS runs
**Files:** `app/layout.js`

**Codex prompt:**
```
In app/layout.js, find the RootLayout function that returns the <html> element.
Add lang="en" as a static attribute to <html>:
  <html lang="en" suppressHydrationWarning className="">

The InitScript already overrides the lang attribute client-side based on localStorage.
suppressHydrationWarning is already present — it suppresses the mismatch between
server "en" and client-restored language class. No other changes needed.
```

**Done when:**
- `app/layout.js` `<html>` tag has `lang="en"` as a static prop
- `suppressHydrationWarning` is still present on the same tag

---

## P1 — Quality & Accessibility

### [x] TASK-04: Add `aria-label` to ThemeToggle and LanguageToggle

**Priority:** P1
**Files:** `app/components/ThemeToggle.js`, `app/components/LanguageToggle.js`

**Codex prompt:**
```
1. In app/components/ThemeToggle.js:
   The toggle button shows ☾ (light mode) or ☀︎ (dark mode).
   Add a dynamic aria-label to the button:
   - When isDark is true: aria-label="Switch to light mode"
   - When isDark is false: aria-label="Switch to dark mode"

2. In app/components/LanguageToggle.js:
   The toggle button shows "한글" or "EN".
   Add a dynamic aria-label:
   - When lang is 'en' (showing "한글" button): aria-label="한국어로 전환"
   - When lang is 'ko' (showing "EN" button): aria-label="Switch to English"
```

**Done when:**
- Both buttons have `aria-label` props that reflect the action (what will happen on click), not the current state

---

### [x] TASK-05: Extract shared place utilities to `lib/places.js`

**Priority:** P1
**Files:** `app/page.js`, `app/place/[slug]/page.js`, `lib/places.js` (new)

**Codex prompt:**
```
1. Create app/lib/places.js (new file) and move the following from app/page.js into it,
   exporting each:
   - TYPE_MAP object (Korean type → English type mapping)
   - TAG_PRIORITY array
   - sortTags(tags) function

2. In app/page.js: remove the moved definitions and add:
   import { TYPE_MAP, sortTags } from '@/app/lib/places'

3. In app/place/[slug]/page.js: if TYPE_MAP or sortTags are duplicated there,
   replace them with the same import.

Do not change any logic, only move and re-export.
```

**Done when:**
- `app/lib/places.js` exists and exports `TYPE_MAP`, `TAG_PRIORITY`, `sortTags`
- Neither `app/page.js` nor `app/place/[slug]/page.js` define these locally
- Both files import from `@/app/lib/places`

---

### [x] TASK-06: Remove client-side OG meta tag updates from MetadataLocaleSync

**Priority:** P1 — SNS crawlers don't run JS; these updates have no effect and add complexity
**Files:** `app/components/MetadataLocaleSync.js`

**Codex prompt:**
```
In app/components/MetadataLocaleSync.js, remove all lines that query and update
og:* and twitter:* meta tags. Specifically, remove any querySelector calls for:
  - og:title, og:description, og:locale
  - twitter:title, twitter:description

Keep the document.title update (this helps real users in browser tab).
Keep the meta[name="description"] update.
Keep the event listener setup and route change detection logic.
The goal: MetadataLocaleSync should only update document.title and <meta name="description">,
not og:* or twitter:* tags.
```

**Done when:**
- `MetadataLocaleSync.js` contains no references to `og:` or `twitter:` meta selectors
- `document.title` update logic is still present

---

## P2 — SEO & Production Polish

### [x] TASK-07: Add canonical URLs to page metadata

**Priority:** P2
**Files:** `app/layout.js`, `app/place/[slug]/page.js`, `app/guide/page.js`

**Codex prompt:**
```
Add alternates.canonical to the metadata exports in each page.

1. app/layout.js (base metadata):
   alternates: { canonical: '/' }

2. app/guide/page.js:
   alternates: { canonical: '/guide' }

3. app/place/[slug]/page.js — in the generateMetadata function:
   alternates: { canonical: `/place/${place.slug}` }

The metadataBase in layout.js already sets the base URL, so these paths will be
resolved to absolute URLs automatically by Next.js.
Do not change any other metadata fields.
```

**Done when:**
- All three files have `alternates: { canonical: '...' }` in their metadata

---

### [x] TASK-08: Add custom 404 page

**Priority:** P2
**Files:** `app/not-found.js` (new)

**Codex prompt:**
```
Create app/not-found.js — Next.js App Router custom 404 page.

Requirements:
- Match the visual style of the existing site (same Tailwind utility class patterns as app/page.js)
- Show bilingual message using the lang-en / lang-ko span pattern from existing pages
  - English: "Page not found"
  - Korean: "페이지를 찾을 수 없습니다"
- Include a link back to / using the same styling as the back link in app/place/[slug]/page.js
- Export metadata with title "Not Found | Gluten-Free Korea"
- Keep it under 40 lines
```

**Done when:**
- `app/not-found.js` exists
- Uses `lang-en` / `lang-ko` span pattern for bilingual text
- Has a link to `/`

---

### [x] TASK-09: Add security headers in next.config.mjs

**Priority:** P2
**Files:** `next.config.mjs`

**Codex prompt:**
```
In next.config.mjs, add a headers() async function that applies to all routes ('/(.*)')
with the following headers:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

Do NOT add Content-Security-Policy yet (it requires tuning for Google Fonts + Cloudflare).
Do not change anything else in next.config.mjs.
```

**Done when:**
- `next.config.mjs` exports a `headers()` function
- The 4 listed headers are present for all routes
- No CSP header is added

---

## P3 — Nice to Have

### [x] TASK-10: Replace `new Date().getFullYear()` in Footer with static year

**Priority:** P3 — static site; year will be baked at build time anyway; make it explicit
**Files:** `app/components/Footer.js`

**Codex prompt:**
```
In app/components/Footer.js, replace new Date().getFullYear() with the literal 2026.
This is a static site; the year will be fixed at build time.
Making it explicit avoids confusion about whether this is a runtime or build-time value.
```

**Done when:**
- `Footer.js` contains `2026` as a literal, not `new Date().getFullYear()`

---

## P2 — UX Features

### [x] TASK-11: 검색 + 지역 필터

**Priority:** P2
**Files:** `app/components/PlaceFilter.js`

**Codex prompt:**
```
Project: Next.js 15 App Router, Tailwind CSS v4, React 19.
File: app/components/PlaceFilter.js (existing "use client" component)

Current state: PlaceFilter accepts { places }, has [active, setActive] for type filter,
and renders a type-filter button row + card grid.

Add two new filter mechanisms. Do NOT change any existing card markup, Naver Map link,
lang-en/lang-ko spans, or type-filter button row.

--- CHANGE 1: Text search input ---
Add state: const [query, setQuery] = useState("")

Add a search input ABOVE the existing type-filter button row:
  <input
    type="search"
    value={query}
    onChange={e => setQuery(e.target.value)}
    placeholder="Search places…"
    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
  />

Search logic (case-insensitive, applied BEFORE type filter):
  const q = query.trim().toLowerCase()
  Match if q is empty OR any of these fields contain q:
    place.name, place.nameEn, place.address, place.addressEn, place.location

--- CHANGE 2: District filter buttons ---
Add state: const [district, setDistrict] = useState("All")

Add this helper function inside the component, above the return:
  function extractDistrict(location) {
    if (!location) return null
    const after = location.indexOf(",")
    if (after === -1) return null
    const part = location.slice(after + 1).trim()
    const paren = part.indexOf("(")
    return paren === -1 ? part.trim() : part.slice(0, paren).trim()
  }

Derive unique districts from ALL places (not filtered):
  const districts = [...new Set(places.map(p => extractDistrict(p.location)).filter(Boolean))].sort()

Add a district button row BETWEEN the search input and the type-filter row:
  Buttons: "All" first, then each district string.
  "All" button label:
    <span className="lang-en">All Areas</span><span className="lang-ko">전체 지역</span>
  District button label: show district string as-is for both lang spans.
  Active/inactive button classes: same as existing type-filter buttons.
  Button row className: flex flex-wrap gap-2 mb-3

--- Combined filter logic ---
Apply filters in this order:
  1. query filter (text search)
  2. district filter
  3. type filter (existing active state)

const afterSearch = q
  ? places.filter(p => [p.name, p.nameEn, p.address, p.addressEn, p.location]
      .some(f => f && f.toLowerCase().includes(q)))
  : places
const afterDistrict = district === "All"
  ? afterSearch
  : afterSearch.filter(p => extractDistrict(p.location) === district)
const visiblePlaces = active === "All"
  ? afterDistrict
  : afterDistrict.filter(p => p.type === active)

Add empty state below the grid (when visiblePlaces.length === 0):
  <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
    <span className="lang-en">No places match your filters.</span>
    <span className="lang-ko">조건에 맞는 장소가 없습니다.</span>
  </p>

Do not add new files. Do not change routing or card markup.
```

**Done when:**
- `PlaceFilter.js` contains `query`, `district`, `extractDistrict`, `afterSearch`, `afterDistrict`
- Search input is rendered above district buttons, district buttons above type buttons
- Empty state renders when `visiblePlaces.length === 0`

---

### [x] TASK-12: 이름/주소 복사 버튼

**Priority:** P2
**Files:** `app/components/PlaceFilter.js`

**Codex prompt:**
```
Project: Next.js 15 App Router, Tailwind CSS v4, React 19.
File: app/components/PlaceFilter.js (existing "use client" component)

Add a copy button to each place card.
Copy content: "${place.name}  ${place.address}" (two spaces between name and address)

Add a CopyButton sub-component at the top of the file (before the main export):

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <button
      type="button"
      onClick={e => { e.preventDefault(); handleCopy() }}
      className="relative z-10 inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 transition hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
      aria-label="Copy name and address"
    >
      {copied ? (
        <span className="text-emerald-600 dark:text-emerald-400">복사됨 ✓</span>
      ) : (
        <>
          <span className="lang-en">Copy</span>
          <span className="lang-ko">복사</span>
        </>
      )}
    </button>
  )
}

In each card, inside the <div className="relative z-10 mt-auto pt-5"> block,
wrap the Naver Map <a> and the new CopyButton in:
  <div className="flex flex-wrap items-center gap-2">
    {place.naverMapUrl ? <a ...>Naver Map</a> : null}
    <CopyButton text={`${place.name}  ${place.address}`} />
  </div>

The "View details →" <p> stays below this button row, unchanged.
Do not change any other card markup. Do not add new files.
```

**Done when:**
- `PlaceFilter.js` contains `CopyButton` function
- `PlaceFilter.js` contains `navigator.clipboard`
- `PlaceFilter.js` contains `e.preventDefault()` in the copy handler
- `PlaceFilter.js` contains `복사됨 ✓`

---

### [x] TASK-13: 가이드 — 쌀빵 경고 섹션 추가

**Priority:** P2
**Files:** `app/guide/page.js`

**Codex prompt:**
```
Project: Next.js 15 App Router, Tailwind CSS v4.
File: app/guide/page.js

The guide page currently has 4 sections in this order:
  1. Safety checklist (ul, no heading)
  2. Hidden Gluten in Korean Food (section with h2)
  3. Useful Korean Phrases (section with h2)
  4. Amber disclaimer box (section)

Add a new section between section 2 and section 3 (after Hidden Gluten, before Useful Korean Phrases).

--- New section: Rice Bread Warning ---
Use the same card styling as sections 2 and 3:
  className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-900/20 sm:p-6"
(amber tint to signal it is a warning, not a neutral info card)

Section heading (h2, same styling as other h2s but amber color):
  className="text-lg font-semibold text-amber-900 dark:text-amber-100"
  lang-en: "⚠️ Rice Bread ≠ Gluten-Free"
  lang-ko: "⚠️ 쌀빵 = 글루텐프리가 아닙니다"

Body paragraph (mt-3 text-sm leading-relaxed):
  className="mt-3 text-sm leading-relaxed text-amber-900 dark:text-amber-200"
  lang-en: "In Korea, products sold as 'rice bread' (쌀빵) are not always gluten-free. Some use a mix of rice flour and wheat flour (e.g. 90% rice, 10% wheat). Always check the label or ask staff directly before purchasing."
  lang-ko: "한국에서 '쌀빵'으로 판매되는 제품이 항상 글루텐프리인 것은 아닙니다. 쌀가루와 밀가루를 혼합해 만드는 경우가 있습니다 (예: 쌀가루 90% + 밀가루 10%). 구매 전 반드시 라벨을 확인하거나 직원에게 밀가루 포함 여부를 직접 물어보세요."

Do not change any other section. Do not add new files.
```

**Done when:**
- `app/guide/page.js` contains `쌀빵 = 글루텐프리가 아닙니다`
- `app/guide/page.js` contains `Rice Bread` warning text
- Amber border/background classes are used on the new section
- All other sections are unchanged

---

## Execution order for Codex

Run tasks in this order for cleanest diffs:

```
TASK-00  # CI/CD first — all subsequent changes auto-deploy
TASK-02  # Delete dead config — no logic change, clean slate
TASK-03  # html lang — 1-line change
TASK-01  # sitemap dates — touches build script + sitemap
TASK-05  # extract shared utils — refactor before touching components
TASK-04  # aria-labels — small component changes
TASK-06  # remove OG client updates — MetadataLocaleSync cleanup
TASK-07  # canonical URLs — metadata only
TASK-08  # 404 page — new file
TASK-09  # security headers — config only
TASK-10  # footer year — trivial
TASK-11  # search + district filter — PlaceFilter.js
TASK-12  # copy button — PlaceFilter.js
TASK-13  # rice bread warning section — guide/page.js
```

## Codex usage tips for this repo

- Always run `npm run build:places` after touching `data/overrides.json`
- Always run `npm run validate:places` after touching `scripts/build_places.mjs`
- After TASK-00 lands, push to `main` to verify the Actions workflow triggers
- TASK-01 and TASK-05 touch generated files — commit `data/places.json` after TASK-01
- Do not run `next build` locally to verify TASK-09 headers — headers() only works in
  Node.js mode; Cloudflare Pages serves static files with its own cache headers.
  Verify TASK-09 via `npx wrangler pages dev .vercel/output/static` instead.

---

## Next Session Notes

Current UI state already implemented:
- Homepage: text search + district/type filters + nearby sorting using browser geolocation
- Homepage cards: explicit `View details` button only (card-wide click removed)
- Place detail: separate copy buttons for place name, Korean address, English address

Recommended next actions:
1. Refine nearby UX
   - Add a clearer recovery path after location permission is denied
   - Consider a small "Retry" / "Open browser settings" style hint
   - Add radius filtering such as `Within 1km` / `Within 3km`
2. Map view MVP
   - Add `List / Map` toggle on `/`
   - Reuse current filtered place set
   - Keep `Naver Map` as the primary external map action
3. Share / utility polish
   - Add share button on place detail
   - Consider `Open in Google Maps` as a secondary helper link, not the primary CTA

Context from latest session:
- Nearby sorting uses existing `lat` / `lng` in `data/places.json`; no new runtime data source added
- Local geolocation can show "Location permission was denied" if the browser has previously blocked `localhost` / `127.0.0.1`
- Nearby controls were simplified to:
  - `Recommended`
  - `Turn on location`
  - `Nearest` (only appears after location is available)
