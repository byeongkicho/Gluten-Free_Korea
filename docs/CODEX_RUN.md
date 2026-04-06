# CODEX_RUN.md — Master Orchestration Prompt (SUPERSEDED)

> **⚠️ 이 문서는 `docs/HARNESS.md` + `docs/TASKS.md`로 대체되었습니다.**
> - 3-agent 루프 (Planner→Generator→Evaluator): `docs/HARNESS.md`
> - 작업 백로그 + 실행 순서: `docs/TASKS.md`
> - 아래 pre/post-flight 체크는 이력 참조용으로 보존합니다.
> - 14개 태스크 중 13개 완료. TASK-12만 미완 → TASKS.md로 이관됨.

---

## [ARCHIVE] Original orchestration rules

1. **Read before touch.** Before modifying any file, read it completely.
2. **Pre-flight before execute.** Run every pre-flight check for a task before changing anything.
3. **Post-flight before commit.** Verify every "Done when" criterion before committing.
4. **One commit per task.** Never batch multiple tasks in one commit.
5. **Minimal diff.** Only change what each task explicitly specifies.

## [ARCHIVE] Execution order (all completed except TASK-12)

```
TASK-00 ✓ → TASK-02 ✓ → TASK-03 ✓ → TASK-01 ✓ → TASK-05 ✓ → TASK-04 ✓ → TASK-06 ✓ → TASK-07 ✓ → TASK-08 ✓ → TASK-09 ✓ → TASK-10 ✓ → TASK-11 ✓ → TASK-12 ✗ → TASK-13 ✓
```

---

## Pre-flight & post-flight checks per task

For each task below, run **ALL** listed checks in order.
A check fails if the stated condition is not met.

---

### TASK-00: GitHub Actions deploy workflow

**Pre-flight:**
```
CHECK-00-A: .github/workflows/deploy.yml does NOT exist.
  → Read path: .github/workflows/deploy.yml
  → If it exists: STOP. Reason: workflow already present, manual review required.

CHECK-00-B: wrangler.toml exists and contains "gluten-free-korea".
  → Read path: wrangler.toml
  → If missing or project name differs: STOP.

CHECK-00-C: package.json contains a "pages:build" script.
  → Read path: package.json
  → If "pages:build" key is absent: STOP.
```

**Execute:** Follow the Codex prompt in TASKS.md for TASK-00.

**Post-flight:**
```
CHECK-00-D: .github/workflows/deploy.yml exists.
CHECK-00-E: File contains "push:" and "branches:" and "[main]".
CHECK-00-F: File contains "CLOUDFLARE_API_TOKEN" and "CLOUDFLARE_ACCOUNT_ID".
CHECK-00-G: File contains "secrets.CLOUDFLARE_API_TOKEN" (not hardcoded value).
CHECK-00-H: File contains "npm run pages:build".
CHECK-00-I: File contains "npx wrangler pages deploy".
```

**Commit message:** `feat: add GitHub Actions CD to Cloudflare Pages`

---

### TASK-02: Remove dead Tailwind v3 config

**Pre-flight:**
```
CHECK-02-A: tailwind.config.js exists.
  → If it does not exist: skip task (already done), move to TASK-03.

CHECK-02-B: app/globals.css contains "@import \"tailwindcss\"".
  → Read path: app/globals.css
  → If missing: STOP. Tailwind v4 setup broken — do not delete config until fixed.

CHECK-02-C: app/globals.css contains "@variant dark".
  → If missing: STOP. Dark mode variant not configured — do not delete config.

CHECK-02-D: No .js/.mjs/.ts file outside node_modules imports tailwind.config.
  → Search for: require.*tailwind.config or import.*tailwind.config in app/ and scripts/
  → If any match: STOP. Something is importing the config — review before deleting.
```

**Execute:** Delete `tailwind.config.js`.

**Post-flight:**
```
CHECK-02-E: tailwind.config.js does NOT exist.
CHECK-02-F: app/globals.css still contains "@import \"tailwindcss\"".
CHECK-02-G: app/globals.css still contains "@variant dark".
```

**Commit message:** `chore: remove dead Tailwind v3 config (v4 uses globals.css)`

---

### TASK-03: Set server-side lang attribute on html element

**Pre-flight:**
```
CHECK-03-A: app/layout.js exists.

CHECK-03-B: app/layout.js contains "<html" (has an html element to modify).

CHECK-03-C: app/layout.js contains "suppressHydrationWarning".
  → If missing: STOP. InitScript relies on this — do not add lang without it.

CHECK-03-D: app/layout.js <html tag does NOT already contain lang=".
  → Search for: <html[^>]*lang= in app/layout.js
  → If found: skip task (already done), move to TASK-01.
```

**Execute:** Follow the Codex prompt in TASKS.md for TASK-03.

**Post-flight:**
```
CHECK-03-E: app/layout.js contains lang="en" on the <html element.
CHECK-03-F: app/layout.js still contains "suppressHydrationWarning".
```

**Commit message:** `fix: set server-side lang="en" on html element for crawlers`

---

### TASK-01: Fix sitemap lastModified dates

**Pre-flight:**
```
CHECK-01-A: data/places.json exists and is a valid JSON array.
  → Read path: data/places.json
  → Confirm top-level structure is an array.

CHECK-01-B: scripts/build_places.mjs exists.

CHECK-01-C: app/sitemap.js contains "new Date()" (problem exists, task is needed).
  → If no "new Date()" found in sitemap.js: skip task (already fixed), move to TASK-05.

CHECK-01-D: data/places.json does NOT already contain "updatedAt" on all entries.
  → If all 11 places already have updatedAt: skip task, move to TASK-05.
```

**Execute:** Follow the Codex prompt in TASKS.md for TASK-01.

**Post-flight (run after executing):**
```
CHECK-01-E: Run: node scripts/build_places.mjs
  → Must complete without errors.

CHECK-01-F: Run: node scripts/validate_places.mjs
  → Must exit 0 (pass).

CHECK-01-G: data/places.json — every object in the array has an "updatedAt" field
  matching pattern YYYY-MM-DD.

CHECK-01-H: app/sitemap.js does NOT contain "lastModified: new Date()" anywhere.

CHECK-01-I: app/sitemap.js contains "place.updatedAt".

CHECK-01-J: app/sitemap.js contains a hardcoded ISO date string like '2026-03-' for static routes.
```

**Commit message:** `fix: use per-place updatedAt for sitemap lastModified`
**Note:** Stage both `scripts/build_places.mjs`, `app/sitemap.js`, AND `data/places.json` in this commit.

---

### TASK-05: Extract shared place utilities to lib/places.js

**Pre-flight:**
```
CHECK-05-A: app/page.js contains "TYPE_MAP" as a local definition (const TYPE_MAP = ...).
  → If not found: STOP. The symbol to extract doesn't exist where expected.

CHECK-05-B: app/page.js contains "TAG_PRIORITY" as a local definition.

CHECK-05-C: app/lib/places.js does NOT exist.
  → If it exists: STOP. File already present — review before overwriting.

CHECK-05-D: app/lib/ directory may or may not exist — that's fine. No check needed.
```

**Execute:** Follow the Codex prompt in TASKS.md for TASK-05.

**Post-flight:**
```
CHECK-05-E: app/lib/places.js exists.
CHECK-05-F: app/lib/places.js contains "export" for TYPE_MAP, TAG_PRIORITY, and sortTags.
CHECK-05-G: app/page.js does NOT contain "const TYPE_MAP" or "const TAG_PRIORITY" as local definitions.
CHECK-05-H: app/page.js contains "import" and "app/lib/places".
CHECK-05-I: app/place/[slug]/page.js does NOT contain a local re-definition of TYPE_MAP (if it had one).
```

**Commit message:** `refactor: extract TYPE_MAP/TAG_PRIORITY/sortTags to app/lib/places.js`

---

### TASK-04: Add aria-label to toggle buttons

**Pre-flight:**
```
CHECK-04-A: app/components/ThemeToggle.js exists.
CHECK-04-B: app/components/LanguageToggle.js exists.

CHECK-04-C: ThemeToggle.js does NOT already contain "aria-label".
  → If found: skip ThemeToggle part.

CHECK-04-D: LanguageToggle.js does NOT already contain "aria-label".
  → If found: skip LanguageToggle part.

CHECK-04-E: At least one of the two files is missing aria-label — otherwise skip entire task.
```

**Execute:** Follow the Codex prompt in TASKS.md for TASK-04.

**Post-flight:**
```
CHECK-04-F: ThemeToggle.js contains "aria-label" on the button element.
CHECK-04-G: LanguageToggle.js contains "aria-label" on the button element.
CHECK-04-H: ThemeToggle.js aria-label value references "light mode" or "dark mode".
CHECK-04-I: LanguageToggle.js aria-label value references both English and Korean variants.
```

**Commit message:** `fix: add aria-label to ThemeToggle and LanguageToggle buttons`

---

### TASK-06: Remove OG/Twitter client-side meta updates

**Pre-flight:**
```
CHECK-06-A: app/components/MetadataLocaleSync.js exists.

CHECK-06-B: MetadataLocaleSync.js contains "og:" (the problem exists).
  → Search for querySelector.*og: or property.*og: in the file.
  → If not found: skip task (already cleaned), move to TASK-07.

CHECK-06-C: MetadataLocaleSync.js contains "document.title" (title update must be preserved).
  → If not found: STOP. The file structure is unexpected — do not proceed.
```

**Execute:** Follow the Codex prompt in TASKS.md for TASK-06.

**Post-flight:**
```
CHECK-06-D: MetadataLocaleSync.js does NOT contain "og:title".
CHECK-06-E: MetadataLocaleSync.js does NOT contain "og:description".
CHECK-06-F: MetadataLocaleSync.js does NOT contain "og:locale".
CHECK-06-G: MetadataLocaleSync.js does NOT contain "twitter:title".
CHECK-06-H: MetadataLocaleSync.js does NOT contain "twitter:description".
CHECK-06-I: MetadataLocaleSync.js still contains "document.title".
CHECK-06-J: MetadataLocaleSync.js still contains "description" (the plain meta description update).
```

**Commit message:** `fix: remove ineffective client-side OG meta updates from MetadataLocaleSync`

---

### TASK-07: Add canonical URLs to metadata

**Pre-flight:**
```
CHECK-07-A: app/layout.js exists and contains "export const metadata".
CHECK-07-B: app/guide/page.js exists and contains "export const metadata".
CHECK-07-C: app/place/[slug]/page.js exists and contains "generateMetadata".

CHECK-07-D: app/layout.js metadata does NOT already contain "alternates".
  → If found: STOP. Canonical already set — review before overwriting.

CHECK-07-E: app/layout.js metadata contains "metadataBase".
  → If missing: STOP. Canonical URLs require metadataBase to resolve correctly.
```

**Execute:** Follow the Codex prompt in TASKS.md for TASK-07.

**Post-flight:**
```
CHECK-07-F: app/layout.js metadata contains "alternates" and "canonical".
CHECK-07-G: app/guide/page.js metadata contains "alternates" and "canonical".
CHECK-07-H: app/place/[slug]/page.js generateMetadata return contains "alternates" and "canonical".
CHECK-07-I: The canonical value in [slug]/page.js references place.slug dynamically.
```

**Commit message:** `seo: add canonical URLs to all page metadata`

---

### TASK-08: Add custom 404 page

**Pre-flight:**
```
CHECK-08-A: app/not-found.js does NOT exist.
  → If it exists: skip task (already done), move to TASK-09.

CHECK-08-B: app/place/[slug]/page.js exists (to reference its back-link styling).
CHECK-08-C: app/globals.css contains "lang-en" and "lang-ko" (CSS class pattern in use).
```

**Execute:** Follow the Codex prompt in TASKS.md for TASK-08.

**Post-flight:**
```
CHECK-08-D: app/not-found.js exists.
CHECK-08-E: app/not-found.js contains "lang-en".
CHECK-08-F: app/not-found.js contains "lang-ko".
CHECK-08-G: app/not-found.js contains "Page not found" (English text).
CHECK-08-H: app/not-found.js contains "페이지를 찾을 수 없습니다" (Korean text).
CHECK-08-I: app/not-found.js contains a link href="/".
CHECK-08-J: app/not-found.js line count is under 45 lines.
```

**Commit message:** `feat: add bilingual custom 404 page`

---

### TASK-09: Add security headers

**Pre-flight:**
```
CHECK-09-A: next.config.mjs exists.

CHECK-09-B: next.config.mjs does NOT already contain "X-Frame-Options".
  → If found: skip task (already done), move to TASK-10.

CHECK-09-C: next.config.mjs does NOT contain "Content-Security-Policy".
  → This is expected — we are NOT adding CSP in this task. Check is informational.
```

**Execute:** Follow the Codex prompt in TASKS.md for TASK-09.

**Post-flight:**
```
CHECK-09-D: next.config.mjs contains "headers" as an exported or nested async function.
CHECK-09-E: next.config.mjs contains "X-Frame-Options".
CHECK-09-F: next.config.mjs contains "X-Content-Type-Options".
CHECK-09-G: next.config.mjs contains "Referrer-Policy".
CHECK-09-H: next.config.mjs contains "Permissions-Policy".
CHECK-09-I: next.config.mjs does NOT contain "Content-Security-Policy".
```

**Commit message:** `security: add X-Frame-Options, XCTO, Referrer-Policy, Permissions-Policy headers`

---

### TASK-10: Hardcode footer year

**Pre-flight:**
```
CHECK-10-A: app/components/Footer.js exists.

CHECK-10-B: Footer.js contains "getFullYear".
  → If not found: skip task (already done).
```

**Execute:** Follow the Codex prompt in TASKS.md for TASK-10.

**Post-flight:**
```
CHECK-10-C: Footer.js does NOT contain "getFullYear".
CHECK-10-D: Footer.js contains "2026".
```

**Commit message:** `chore: hardcode 2026 in footer (static site, build-time value)`

---

### TASK-11: 검색 + 지역 필터

**Pre-flight:**
```
CHECK-11-A: app/components/PlaceFilter.js exists.
CHECK-11-B: PlaceFilter.js does NOT contain "query" state or "extractDistrict".
  → If found: skip task (already done), move to TASK-12.
CHECK-11-C: PlaceFilter.js contains "use client" on line 1.
```

**Execute:** Follow the Codex prompt in TASKS.md for TASK-11.

**Post-flight:**
```
CHECK-11-D: PlaceFilter.js contains "query" and "setQuery".
CHECK-11-E: PlaceFilter.js contains "district" and "setDistrict".
CHECK-11-F: PlaceFilter.js contains "extractDistrict".
CHECK-11-G: PlaceFilter.js contains "afterSearch" and "afterDistrict".
CHECK-11-H: PlaceFilter.js contains "No places match" (empty state).
CHECK-11-I: npm run build exits 0 with no errors.
```

**Commit message:** `feat: add text search and district filter to PlaceFilter`

---

### TASK-12: 이름/주소 복사 버튼

**Pre-flight:**
```
CHECK-12-A: app/components/PlaceFilter.js exists.
CHECK-12-B: PlaceFilter.js does NOT contain "CopyButton".
  → If found: skip task (already done).
CHECK-12-C: PlaceFilter.js contains "mt-auto pt-5" (card bottom section exists).
```

**Execute:** Follow the Codex prompt in TASKS.md for TASK-12.

**Post-flight:**
```
CHECK-12-D: PlaceFilter.js contains "CopyButton".
CHECK-12-E: PlaceFilter.js contains "navigator.clipboard".
CHECK-12-F: PlaceFilter.js contains "e.preventDefault()".
CHECK-12-G: PlaceFilter.js contains "복사됨 ✓".
CHECK-12-H: npm run build exits 0 with no errors.
```

**Commit message:** `feat: add copy name/address button to place cards`

---

### TASK-13: 가이드 — 쌀빵 경고 섹션

**Pre-flight:**
```
CHECK-13-A: app/guide/page.js exists.
CHECK-13-B: guide/page.js does NOT contain "쌀빵 = 글루텐프리가 아닙니다".
  → If found: skip task (already done).
CHECK-13-C: guide/page.js contains "Useful Korean Phrases" (insertion point exists).
```

**Execute:** Follow the Codex prompt in TASKS.md for TASK-13.

**Post-flight:**
```
CHECK-13-D: guide/page.js contains "쌀빵 = 글루텐프리가 아닙니다".
CHECK-13-E: guide/page.js contains "Rice Bread".
CHECK-13-F: guide/page.js contains "border-amber-200" on the new section.
CHECK-13-G: New section appears BEFORE the "Useful Korean Phrases" section in the file.
CHECK-13-H: npm run build exits 0 with no errors.
```

**Commit message:** `feat: add rice bread gluten warning section to guide`

---

## After all tasks complete

1. Run `git log --oneline -15` and confirm each task has its own commit.
2. Report a summary table:

```
TASK-00  [✓/✗]  GitHub Actions deploy workflow
TASK-02  [✓/✗]  Remove dead Tailwind config
TASK-03  [✓/✗]  html lang attribute
TASK-01  [✓/✗]  Sitemap lastModified dates
TASK-05  [✓/✗]  Extract shared utils to lib/places.js
TASK-04  [✓/✗]  aria-label on toggle buttons
TASK-06  [✓/✗]  Remove OG client-side meta updates
TASK-07  [✓/✗]  Canonical URLs
TASK-08  [✓/✗]  Custom 404 page
TASK-09  [✓/✗]  Security headers
TASK-10  [✓/✗]  Hardcode footer year
TASK-11  [✓/✗]  Search + district filter
TASK-12  [✓/✗]  Copy name/address button
TASK-13  [✓/✗]  Rice bread warning in guide
```

3. If any task stopped early, list the failed check ID and the exact file/line that caused it.
4. Do NOT push to remote. Leave pushing to the human.
