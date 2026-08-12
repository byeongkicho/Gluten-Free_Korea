#!/usr/bin/env node
// judge-post.mjs — dual LLM-as-judge gate for published posts.
//
// The site's publishing rule has been "two judges, both at 9.5/10" since July,
// but it lived only as prose in docs/HANDOFF.md: no prompt, no rubric, no
// runner, no recorded score. A gate nobody can re-run is a claim, not a gate.
// This is that rule as something executable.
//
// Design notes worth knowing before editing:
//
//   The judges never see each other. They are separate API calls, so their
//   independence is structural rather than a promise made in a prompt.
//
//   The model returns per-criterion integers and nothing else. The total, the
//   9.5 threshold, and the pass/fail are computed here in JS. Asking a model
//   for "a score out of 10" invites it to pick the number first and justify it
//   backwards; asking for points against a fixed rubric does not.
//
//   The rubric JSON is the single source of truth, read by three consumers:
//   the prompt (as a rendered table), the response schema (as enums), and the
//   tally (as arithmetic). Stating the points anywhere else would let them drift.
//
// Usage:
//   node scripts/judge-post.mjs <slug>              judge and record
//   node scripts/judge-post.mjs --all               every published post
//   node scripts/judge-post.mjs <slug> --ref <sha>  judge a past revision
//   node scripts/judge-post.mjs <slug> --repeat 3   measure run-to-run spread
//   node scripts/judge-post.mjs <slug> --dry-run    render prompt + schema, no API
//   node scripts/judge-post.mjs <slug> --no-write   print, don't record
//   --backend auto|api|claude-cli                   auto: api if credentialed,
//                                                   else Claude Code in print mode
//
// Exit codes: 0 gate passed · 1 gate failed · 2 runtime error · 78 no way to
// reach a model (no API credentials and no claude CLI on PATH).

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { readdirSync } from "node:fs";
import { homedir } from "node:os";
import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { getPostBySlug, getPublishedPosts } from "../app/lib/blog.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AXES = ["seo-eeat", "accuracy-safety"];
const RECORD_SCHEMA = 1;

// ── env ───────────────────────────────────────────────────────────────────
// Same .env/.env.local convention as generate-caption.mjs. Not `--env-file`:
// CI pins Node 20, where --env-file-if-exists is not available on every minor.
async function loadEnv(file) {
  try {
    const raw = await readFile(path.join(ROOT, file), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (/^(".*"|'.*')$/s.test(value)) value = value.slice(1, -1);
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}

// An unset ANTHROPIC_API_KEY does not mean there are no credentials: `ant auth
// login` writes an OAuth profile that also authenticates the API. Newer SDKs
// read that profile from a zero-arg client, but 0.78.0 does not — it throws
// "Could not resolve authentication method" — so the short-lived token is
// fetched here and handed over as ANTHROPIC_AUTH_TOKEN.
//
// Worth knowing before going down this road: an OAuth profile grants the
// `user:inference` scope, which is permission, not balance. A Claude
// subscription pays for claude.ai and Claude Code; Messages API calls draw on
// the organisation's separate API credit. With none, this authenticates
// successfully and then returns 400 "credit balance is too low".
function hasCredentials() {
  if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) return true;

  const dir = path.join(homedir(), ".config", "anthropic", "credentials");
  try {
    if (!readdirSync(dir).some((f) => f.endsWith(".json"))) return false;
  } catch {
    return false;
  }

  try {
    const token = execFileSync("ant", ["auth", "print-credentials", "--access-token"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (!token) return false;
    process.env.ANTHROPIC_AUTH_TOKEN = token;
    return true;
  } catch {
    return false;
  }
}

// The other way to a model: Claude Code itself, in print mode. This bills the
// Claude subscription instead of API credit — the constraint that kept bucket A
// empty for a week (see PROVENANCE.md). `--json-schema` gives the same
// structured-output enforcement as the API's format parameter, `--effort` pins
// the effort level, and `--tools ""` leaves the model nothing to do but judge.
// What it cannot pin: the claude-code version in the middle, which is why these
// records carry provenance "claude-cli" and the CLI version, not "runner".
function claudeCliVersion() {
  try {
    const v = execFileSync("claude", ["--version"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return v || null;
  } catch {
    return null;
  }
}

function runClaude(args, input) {
  return new Promise((resolve, reject) => {
    const child = spawn("claude", args, { stdio: ["pipe", "pipe", "pipe"] });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(out);
      else reject(new Error(err.trim() || `claude exited ${code}`));
    });
    child.stdin.end(input);
  });
}

async function callClaudeCli({ axis, system, schema, payload, model, effort }) {
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    let wrapper;
    try {
      const out = await runClaude(
        [
          "-p",
          "--model", model,
          "--effort", effort,
          "--tools", "",
          "--system-prompt", system,
          "--output-format", "json",
          "--json-schema", JSON.stringify(schema),
        ],
        payload,
      );
      wrapper = JSON.parse(out);
    } catch (err) {
      lastErr = new Error(`[${axis}] claude CLI attempt ${attempt}: ${err.message}`);
      continue;
    }
    if (wrapper.is_error || !wrapper.structured_output) {
      lastErr = new Error(
        `[${axis}] claude CLI attempt ${attempt}: ${
          wrapper.is_error ? "returned an error" : "no structured output"
        } (subtype: ${wrapper.subtype ?? "?"})`,
      );
      continue;
    }
    return { output: wrapper.structured_output, usage: wrapper.usage };
  }
  throw lastErr;
}

// ── pure ──────────────────────────────────────────────────────────────────

export const renderPrompt = (template, vars) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");

export const contentHash = (raw) => createHash("sha256").update(raw, "utf8").digest("hex");

export function rubricToMarkdown(rubric) {
  // Guidance text may legitimately contain a pipe (the site's title suffix is
  // " | Gluten-Free Korea"), which would otherwise split the table cell.
  const cell = (s) => String(s).replace(/\|/g, "\\|");
  const rows = rubric.criteria.map(
    (c) => `| \`${c.id}\` | ${c.max} | ${cell(c.label)} | ${cell(c.guidance)} |`,
  );
  return [
    `**${rubric.axis_label}** — ${rubric.max_points} points total.`,
    "",
    "| id | max | criterion | how to score it |",
    "|---|---|---|---|",
    ...rows,
  ].join("\n");
}

// One object property per criterion, each with its own `points` enum. An array
// of {id, points} could not constrain the range per criterion — every item
// would share one schema — so a wrong-range score would only be caught after
// the fact. As an object, 4 points on a 3-point criterion is unrepresentable.
export function rubricToSchema(rubric) {
  const scores = {};
  for (const c of rubric.criteria) {
    scores[c.id] = {
      type: "object",
      properties: {
        points: {
          type: "integer",
          enum: Array.from({ length: c.max + 1 }, (_, i) => i),
          description: `Points for ${c.id}, 0..${c.max}.`,
        },
        note: { type: "string", description: "One sentence on why this score." },
        evidence_quote: {
          type: "string",
          description:
            "Exact span from the article justifying any withheld point. Empty string if full marks.",
        },
      },
      required: ["points", "note", "evidence_quote"],
      additionalProperties: false,
    };
  }

  const severities = rubric.blocking_allowed
    ? ["blocking", "major", "minor"]
    : ["major", "minor"];

  return {
    type: "object",
    properties: {
      scores: {
        type: "object",
        properties: scores,
        required: rubric.criteria.map((c) => c.id),
        additionalProperties: false,
      },
      findings: {
        type: "array",
        description: "Problems worth acting on. Empty array if none.",
        items: {
          type: "object",
          properties: {
            criterion: { type: "string", enum: rubric.criteria.map((c) => c.id) },
            severity: { type: "string", enum: severities },
            quote: { type: "string" },
            why: { type: "string" },
            fix: { type: "string" },
          },
          required: ["criterion", "severity", "quote", "why", "fix"],
          additionalProperties: false,
        },
      },
    },
    required: ["scores", "findings"],
    additionalProperties: false,
  };
}

// The model reports points; the score is arithmetic done here. Range is
// re-checked because the enum is a request-side constraint, not a guarantee we
// can verify from this side.
export function tallyAxis(rubric, parsed) {
  const criteria = rubric.criteria.map((c) => {
    const got = parsed.scores?.[c.id];
    if (!got || typeof got.points !== "number") {
      throw new Error(`[${rubric.id}] missing score for "${c.id}"`);
    }
    if (!Number.isInteger(got.points) || got.points < 0 || got.points > c.max) {
      throw new Error(
        `[${rubric.id}] "${c.id}" scored ${got.points}, outside 0..${c.max}`,
      );
    }
    return { id: c.id, points: got.points, max: c.max, note: got.note ?? "", evidence_quote: got.evidence_quote ?? "" };
  });

  const points = criteria.reduce((sum, c) => sum + c.points, 0);
  const score = Math.round((points / rubric.max_points) * 1000) / 100;
  const findings = parsed.findings ?? [];

  return {
    rubric_id: rubric.id,
    rubric_version: rubric.version,
    points,
    max_points: rubric.max_points,
    score,
    pass_at: rubric.pass_at,
    passed: score >= rubric.pass_at,
    criteria,
    findings,
  };
}

export function gateFrom(axes) {
  const values = Object.values(axes);
  const short = values.filter((a) => !a.passed);
  if (short.length) {
    const detail = short.map((a) => `${a.rubric_id} ${a.score}/${a.pass_at}`).join(", ");
    return { passed: false, reason: `below threshold: ${detail}` };
  }
  const blocking = values.flatMap((a) => a.findings.filter((f) => f.severity === "blocking"));
  if (blocking.length) {
    return { passed: false, reason: `${blocking.length} blocking finding(s)` };
  }
  return { passed: true, reason: null };
}

export function postToPayload(post) {
  const faq = (post.faq ?? [])
    .map((item, i) => `${i + 1}. Q: ${item.q}\n   A: ${item.a}`)
    .join("\n");
  return [
    `slug: ${post.slug}`,
    `title: ${post.title}`,
    `description: ${post.description ?? ""}`,
    `keyword: ${post.keyword ?? ""}`,
    `date: ${post.date ?? ""}`,
    faq ? `\nFAQ (frontmatter):\n${faq}` : "\nFAQ (frontmatter): none",
    "\n--- body ---\n",
    post.content,
  ].join("\n");
}

// ── I/O ───────────────────────────────────────────────────────────────────

const loadRubric = async (axis) =>
  JSON.parse(await readFile(path.join(ROOT, "prompts", `judge-${axis}.rubric.json`), "utf8"));

const loadTemplate = (axis) =>
  readFile(path.join(ROOT, "prompts", `judge-${axis}.md`), "utf8");

// Working tree goes through app/lib/blog.js — the judge grades exactly what the
// build ships, and assertPostSchema runs as a free precondition. A --ref goes
// around it, since past revisions may be `upcoming` and thus filtered out.
async function loadPost(slug, ref) {
  if (!ref) {
    const post = getPostBySlug(slug);
    if (!post) throw new Error(`no post with slug "${slug}"`);
    const raw = await readFile(path.join(ROOT, "content", "blog", `${slug}.md`), "utf8");
    return { post, raw, source_ref: "working-tree" };
  }
  const raw = execFileSync("git", ["show", `${ref}:content/blog/${slug}.md`], {
    encoding: "utf8",
    cwd: ROOT,
  });
  const { data, content } = matter(raw);
  return { post: { ...data, slug, content }, raw, source_ref: ref };
}

async function callApi({ client, axis, system, schema, payload, model, effort }) {
  const res = await client.messages.parse({
    model,
    max_tokens: 16000,
    system,
    messages: [{ role: "user", content: payload }],
    // The schema is passed as-is rather than through jsonSchemaOutputFormat():
    // that helper rewrites `enum` into a `description` string, which would turn
    // the per-criterion point ranges from a constraint into a suggestion.
    output_config: { effort, format: { type: "json_schema", schema } },
  });

  if (res.stop_reason === "refusal") {
    throw new Error(`[${axis}] model refused (${res.stop_details?.category ?? "unknown"})`);
  }
  if (res.stop_reason === "max_tokens") {
    throw new Error(`[${axis}] response truncated — raise max_tokens`);
  }
  if (!res.parsed_output) {
    throw new Error(`[${axis}] no parsed output (stop_reason: ${res.stop_reason})`);
  }

  return { output: res.parsed_output, usage: res.usage };
}

async function judgeAxis(backend, axis, post, { effort, model }) {
  const [rubric, template] = await Promise.all([loadRubric(axis), loadTemplate(axis)]);
  const call = {
    axis,
    system: renderPrompt(template, { rubric: rubricToMarkdown(rubric), post: "" }),
    schema: rubricToSchema(rubric),
    payload: postToPayload(post),
    model,
    effort,
  };
  const res =
    backend.kind === "api"
      ? await callApi({ client: backend.client, ...call })
      : await callClaudeCli(call);
  return { ...tallyAxis(rubric, res.output), usage: res.usage };
}

async function judgeOnce(backend, post, opts) {
  const settled = await Promise.allSettled(
    AXES.map((axis) => judgeAxis(backend, axis, post, opts)),
  );
  const failed = settled.filter((s) => s.status === "rejected");
  // A half-finished judgement must not be recorded: one axis passing tells you
  // nothing about a gate defined as both axes passing.
  if (failed.length) throw new Error(failed.map((f) => f.reason.message).join(" | "));
  return Object.fromEntries(
    AXES.map((axis, i) => [axis.replace("-", "_"), settled[i].value]),
  );
}

const median = (nums) => {
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

async function writeRecord(record, stamp) {
  const dir = path.join(ROOT, "eval", "judgments");
  await mkdir(path.join(dir, "history"), { recursive: true });
  const body = `${JSON.stringify(record, null, 2)}\n`;
  const suffix = record.source_ref === "working-tree" ? "" : `-ref-${record.source_ref}`;
  await writeFile(path.join(dir, `${record.slug}${suffix}.json`), body, "utf8");
  await writeFile(path.join(dir, "history", `${record.slug}${suffix}-${stamp}.json`), body, "utf8");
}

// ── main ──────────────────────────────────────────────────────────────────

async function main() {
  await loadEnv(".env");
  await loadEnv(".env.local");

  const argv = process.argv.slice(2);
  const flag = (name) => argv.includes(`--${name}`);
  const value = (name, fallback) => {
    const i = argv.indexOf(`--${name}`);
    return i === -1 ? fallback : argv[i + 1];
  };

  const opts = {
    model: process.env.ANTHROPIC_MODEL || "claude-opus-5",
    effort: value("effort", "high"),
  };
  const ref = value("ref", null);
  const repeat = Number(value("repeat", 1));
  const dryRun = flag("dry-run");
  const write = !flag("no-write");
  const backendFlag = value("backend", "auto");

  const VALUED = new Set(["ref", "repeat", "effort", "backend"]);
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      if (VALUED.has(argv[i].slice(2))) i++;
      continue;
    }
    positional.push(argv[i]);
  }
  const slugs = flag("all") ? getPublishedPosts().map((p) => p.slug) : positional;

  if (!slugs.length) {
    console.error("usage: node scripts/judge-post.mjs <slug> | --all  [--ref <sha>] [--repeat N] [--dry-run] [--no-write]");
    process.exit(2);
  }

  if (dryRun) {
    for (const axis of AXES) {
      const rubric = await loadRubric(axis);
      const template = await loadTemplate(axis);
      const { post } = await loadPost(slugs[0], ref);
      console.log(`\n${"=".repeat(70)}\n${axis} — rendered system prompt\n${"=".repeat(70)}`);
      console.log(renderPrompt(template, { rubric: rubricToMarkdown(rubric), post: "" }));
      console.log(`\n--- response schema (${rubric.criteria.length} criteria, ${rubric.max_points} pts) ---`);
      console.log(JSON.stringify(rubricToSchema(rubric), null, 1));
      console.log(`\n--- payload preview (${postToPayload(post).length} chars) ---`);
      console.log(`${postToPayload(post).slice(0, 400)}…`);
    }
    process.exit(0);
  }

  // Backend resolution. `auto` prefers the API — its records are the ones the
  // pinned contract fully backs — and falls back to the claude CLI, which a
  // Claude subscription covers without API credit.
  //
  // In auto mode an ant OAuth profile alone is not enough to pick the API: the
  // profile proves scope, not balance, and a zero-credit org authenticates and
  // then 400s on every call. So auto requires an explicitly provided key or
  // token; the profile-only route stays reachable via --backend api.
  let backend = null;
  const explicitKey = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
  if (backendFlag === "api" || (backendFlag === "auto" && explicitKey)) {
    if (hasCredentials()) {
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      backend = { kind: "api", client: new Anthropic() };
    } else if (backendFlag === "api") {
      console.error(
        [
          "No Anthropic credentials found. Either:",
          "  export ANTHROPIC_API_KEY=…   (or put it in .env.local)",
          "  ant auth login               (authenticates, but needs API credit)",
          "  --backend claude-cli         (bills the Claude subscription instead)",
          "Use --dry-run to render the prompt and schema without calling a model.",
        ].join("\n"),
      );
      process.exit(78);
    }
  }
  if (!backend && backendFlag !== "api") {
    if (backendFlag !== "auto" && backendFlag !== "claude-cli") {
      console.error(`unknown --backend "${backendFlag}" (auto|api|claude-cli)`);
      process.exit(2);
    }
    const version = claudeCliVersion();
    if (version) backend = { kind: "claude-cli", version };
  }
  if (!backend) {
    if (flag("skip-without-key")) {
      console.log("skipped (no credentials, no claude CLI)");
      process.exit(0);
    }
    console.error(
      [
        "No way to reach a model. Either:",
        "  export ANTHROPIC_API_KEY=…   (or put it in .env.local)",
        "  install the claude CLI       (a Claude subscription covers it)",
        "Use --dry-run to render the prompt and schema without calling a model.",
      ].join("\n"),
    );
    process.exit(78);
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  let failures = 0;

  for (const slug of slugs) {
    const { post, raw, source_ref } = await loadPost(slug, ref);
    const runs = [];
    for (let i = 0; i < repeat; i++) runs.push(await judgeOnce(backend, post, opts));

    const axes = runs[0];
    const gate = gateFrom(axes);
    const spread =
      repeat > 1
        ? Object.fromEntries(
            Object.keys(axes).map((k) => {
              const scores = runs.map((r) => r[k].score);
              return [k, { median: median(scores), min: Math.min(...scores), max: Math.max(...scores) }];
            }),
          )
        : null;

    const record = {
      schema: RECORD_SCHEMA,
      slug,
      source_ref,
      content_sha256: contentHash(raw),
      judged_at: new Date().toISOString(),
      model: opts.model,
      effort: opts.effort,
      // One value per machine path, and no third: both are written only by this
      // script, so a hand-written score has no representable provenance. The
      // difference between the two is what stays pinned — see
      // eval/judgments/PROVENANCE.md.
      provenance: backend.kind === "api" ? "runner" : "claude-cli",
      ...(backend.kind === "claude-cli" ? { claude_version: backend.version } : {}),
      runs: repeat,
      axes,
      spread,
      gate,
    };

    const line = Object.values(axes)
      .map((a) => `${a.rubric_id} ${a.score}/${a.pass_at}`)
      .join("  ");
    console.log(`${gate.passed ? "PASS" : "FAIL"}  ${slug}  ${line}${gate.reason ? `  — ${gate.reason}` : ""}`);
    for (const f of Object.values(axes).flatMap((a) => a.findings)) {
      console.log(`      [${f.severity}] ${f.criterion}: ${f.why}`);
    }

    if (write) await writeRecord(record, stamp);
    if (!gate.passed) failures++;
  }

  process.exit(failures ? 1 : 0);
}

// Only run when invoked directly. Importing this file (to test the scoring
// functions, or to reuse them from another script) must not start a judging run.
const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(2);
  });
}
