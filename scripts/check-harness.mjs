#!/usr/bin/env node
// check-harness.mjs — asserts that the harness files describe the repo as it is.
//
// The other eval tasks ask "is the data/build intact?". This one asks a
// different question: "do the rule documents still point at something real?"
//
// That gap matters because of how it fails. When CLAUDE.md or AGENTS.md cites a
// path that has moved, an agent reading the instruction just skips it. The build
// stays green, the deploy succeeds, and the rule silently stops existing. There
// is no error to notice — which is exactly why it needs a check that fails loudly.
//
// Scope note: docs/DECISIONS.md is deliberately NOT checked. It is an append-only
// log, so an old entry citing a path that has since moved is correct — that path
// is what existed when the decision was made. Rewriting it to satisfy a linter
// would destroy the record.
//
// Usage: node scripts/check-harness.mjs <refs|commands|freshness|eval-docs|forbidden>

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

// Files that state binding rules. These must describe the current repo.
// README.md is here because it is the first thing a reader sees, and a stale
// claim on the front page misleads a human the same way a stale path misleads
// an agent — it carried two dead doc links until this check started covering it.
const HARNESS_FILES = ["CLAUDE.md", "AGENTS.md", "docs/HARNESS.md", "README.md"];

const fail = (msg, details = []) => {
  console.error(`FAIL: ${msg}`);
  details.forEach((d) => console.error(`  - ${d}`));
  process.exit(1);
};

const pass = (msg) => {
  console.log(`OK: ${msg}`);
  process.exit(0);
};

const read = (p) => readFileSync(p, "utf8");

// Files matched by .gitignore are referenced as things that must NOT be
// committed, so their absence from the working tree is not a broken reference.
const isGitIgnored = (p) => {
  try {
    execFileSync("git", ["check-ignore", "-q", p], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

const lastCommitDate = (p) => {
  const out = execFileSync("git", ["log", "-1", "--format=%at", "--", p], {
    encoding: "utf8",
  }).trim();
  return out ? Number(out) : 0;
};

// ── refs ──────────────────────────────────────────────────────────────────
// Backticked paths in harness files must exist. Only paths containing a slash
// are checked: a bare `overrides.json` is prose naming a file, not a location.
function checkRefs() {
  const broken = [];
  for (const file of HARNESS_FILES) {
    if (!existsSync(file)) {
      broken.push(`${file} (harness file itself is missing)`);
      continue;
    }
    const cited = read(file).match(/`[^`\s]+\/[^`\s]+\.[a-z]{2,5}`/g) ?? [];
    for (const raw of new Set(cited)) {
      const p = raw.slice(1, -1);
      // Globs (`prompts/*.md`) name a set, not a file — nothing to resolve.
      if (p.includes("*")) continue;
      if (!existsSync(p) && !isGitIgnored(p)) broken.push(`${file} → ${p}`);
    }
  }
  if (broken.length) {
    fail(`${broken.length} harness reference(s) point at nothing`, broken);
  }
  pass(`all harness references resolve (${HARNESS_FILES.length} files)`);
}

// ── commands ──────────────────────────────────────────────────────────────
// Every `npm run X` a harness file tells an agent to run must be runnable.
function checkCommands() {
  const scripts = JSON.parse(read("package.json")).scripts ?? {};
  const missing = [];
  for (const file of HARNESS_FILES.concat("eval/README.md")) {
    if (!existsSync(file)) continue;
    const cited = read(file).match(/npm run [a-z0-9:_-]+/g) ?? [];
    for (const raw of new Set(cited)) {
      const name = raw.replace("npm run ", "");
      if (!scripts[name]) missing.push(`${file} → npm run ${name}`);
    }
  }
  if (missing.length) fail(`${missing.length} cited npm script(s) do not exist`, missing);
  pass(`all cited npm scripts exist (${Object.keys(scripts).length} defined)`);
}

// ── freshness ─────────────────────────────────────────────────────────────
// The baseline is the reference point the gate compares against. If a harness
// file changed after the baseline was recorded, the gate is measuring against a
// prompt that no longer exists.
function checkFreshness() {
  const baseline = lastCommitDate("eval/baseline.csv");
  if (!baseline) fail("eval/baseline.csv has no commit history");
  const stale = HARNESS_FILES.filter((f) => lastCommitDate(f) > baseline).map((f) => {
    const d = new Date(lastCommitDate(f) * 1000).toISOString().slice(0, 10);
    return `${f} changed ${d}, after baseline`;
  });
  if (stale.length) {
    fail("baseline is older than the harness it grades", [
      ...stale,
      `baseline recorded ${new Date(baseline * 1000).toISOString().slice(0, 10)}`,
      "fix: re-run eval/eval-runner.sh and refresh eval/baseline.csv",
    ]);
  }
  pass("baseline is at least as new as every harness file");
}

// ── eval-docs ─────────────────────────────────────────────────────────────
// eval/README.md documents this pipeline's own layout and categories. When it
// drifts, the pipeline lies about itself — the least trustworthy thing a
// verification system can do.
function checkEvalDocs() {
  const readme = read("eval/README.md");
  const problems = [];

  // Files drawn in the ``` directory tree must exist.
  for (const line of readme.split("\n")) {
    const m = line.match(/^[├└]──\s+([a-zA-Z0-9_.-]+)/);
    if (!m) continue;
    const name = m[1];
    if (!existsSync(`eval/${name}`) && !existsSync(`eval/${name.replace(/\/$/, "")}`)) {
      problems.push(`README draws eval/${name}, which does not exist`);
    }
  }

  // The category table must cover every task actually in the suite.
  const actual = new Set(
    readdirSync("eval/tasks")
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(read(`eval/tasks/${f}`)).category),
  );
  const documented = new Set(
    readme
      .split("\n")
      .filter((l) => /^\|\s*[^|]+\s*\|/.test(l))
      .map((l) => l.split("|")[1]?.trim())
      .filter(Boolean),
  );
  for (const cat of actual) {
    if (!documented.has(cat)) problems.push(`task category "${cat}" is not in the README table`);
  }

  if (problems.length) fail(`eval/README.md does not match eval/`, problems);
  pass(`eval/README.md matches the suite (${actual.size} categories)`);
}

// ── forbidden ─────────────────────────────────────────────────────────────
// CLAUDE.md forbids committing regenerable/raw data. Ignoring a file does not
// untrack it, so this verifies the rule actually held.
function checkForbidden() {
  const mustNotBeTracked = [
    "data/naver_raw.json",
    "data/gf-products.json",
    "data/note_drafts.json",
  ];
  const tracked = mustNotBeTracked.filter((p) => {
    try {
      execFileSync("git", ["ls-files", "--error-unmatch", p], { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  });
  if (tracked.length) {
    fail("forbidden files are tracked by git", tracked.map((p) => `${p} — see CLAUDE.md Forbidden`));
  }
  pass(`no forbidden data files are tracked (${mustNotBeTracked.length} checked)`);
}

// ── judgments ─────────────────────────────────────────────────────────────
// The dual-judge gate is non-deterministic and costs money, so it does not run
// in CI. What runs in CI is this: proof that the gate was run, against these
// exact bytes, under the current rubric. Editing a post after it was judged
// breaks the hash and fails here — which is what makes a recorded score a gate
// rather than a souvenir.
function checkJudgments() {
  const dir = "eval/judgments";
  if (!existsSync(dir)) {
    fail("no judgments recorded", [
      "run: node scripts/judge-post.mjs --all",
      "(requires ANTHROPIC_API_KEY; see prompts/README.md)",
    ]);
  }

  const rubricVersions = Object.fromEntries(
    readdirSync("prompts")
      .filter((f) => f.endsWith(".rubric.json"))
      .map((f) => {
        const r = JSON.parse(read(`prompts/${f}`));
        return [r.id, r.version];
      }),
  );

  const problems = [];
  const published = readdirSync("content/blog")
    .filter((f) => f.endsWith(".md"))
    .filter((f) => /^status:\s*published\s*$/m.test(read(`content/blog/${f}`)))
    .map((f) => f.replace(/\.md$/, ""));

  for (const slug of published) {
    const recordPath = `${dir}/${slug}.json`;
    if (!existsSync(recordPath)) {
      problems.push(`${slug}: published but never judged`);
      continue;
    }
    const record = JSON.parse(read(recordPath));

    const actual = createHash("sha256")
      .update(read(`content/blog/${slug}.md`), "utf8")
      .digest("hex");
    if (record.content_sha256 !== actual) {
      problems.push(`${slug}: edited since it was judged — re-run the judge`);
    }
    for (const axis of Object.values(record.axes ?? {})) {
      const current = rubricVersions[axis.rubric_id];
      if (current !== undefined && axis.rubric_version !== current) {
        problems.push(
          `${slug}: judged under ${axis.rubric_id} v${axis.rubric_version}, current is v${current}`,
        );
      }
    }
    if (record.provenance !== "runner") {
      problems.push(`${slug}: provenance is "${record.provenance}", not "runner"`);
    }
  }

  if (problems.length) fail(`${problems.length} judgment integrity problem(s)`, problems);
  pass(`all ${published.length} published post(s) have a current judgment`);
}

const CHECKS = {
  refs: checkRefs,
  commands: checkCommands,
  freshness: checkFreshness,
  "eval-docs": checkEvalDocs,
  forbidden: checkForbidden,
  judgments: checkJudgments,
};

const name = process.argv[2];
if (!CHECKS[name]) {
  console.error(`usage: node scripts/check-harness.mjs <${Object.keys(CHECKS).join("|")}>`);
  process.exit(2);
}
CHECKS[name]();
