# Where these scores come from

Three kinds of evidence sit in this repository, and they are not
interchangeable. Mixing them would make the strongest claim as weak as the
weakest one, so they are labelled.

## A. Machine-generated — reproducible

`eval/judgments/*.json`, written by `scripts/judge-post.mjs`. Every record
carries the model, the effort level, the rubric version, and a SHA-256 of the
exact article bytes that were graded. Any of them can be reproduced with one
command.

`provenance` is an enum with exactly two permitted values, `"runner"` and
`"claude-cli"` — one per machine path, described below. Both are written only
by the script; there is no representable way to put a hand-written score into
this format. The honesty constraint is a type, not a promise.

### A1. `"runner"` — the Messages API

The fully pinned path: model, effort, and the response schema are enforced by
the API contract, so a third party with an API key reproduces the exact call.

**Current state: empty.** Messages API calls draw on API credit, which a Claude
subscription does not include, and this environment has none. The moment credit
exists, `node scripts/judge-post.mjs --all --backend api` upgrades the records.

### A2. `"claude-cli"` — Claude Code in print mode

The same script, rubric, schema, and tally, but the model is reached through
`claude -p` (billed to a Claude subscription, which is what this environment
has). The schema is still enforced (`--json-schema`) and the effort still
requested (`--effort`), but a Claude Code release sits between the script and
the model and is not a pinned contract — so these records carry the CLI
version, and they rank below A1: reproducible in procedure, not in contract.

**Current state: this is where the recorded judgments come from** (August
2026, Claude Code 2.1.228).

## B. Historical re-judgement — reproducible, but not contemporaneous

`eval/judgments/history/*-ref-*.json`, produced by `--ref <sha>`. These grade a
past revision **with today's rubric, today**. They are not the score that
revision would have received at the time. Useful for calibration — grading a
119-word stub and its 1,705-word published version under the same rubric shows
whether the judges discriminate at all, which is the honest answer to "don't
they just always say 9.5?"

## C. Session-reported scores — **not reproducible, and not reconstructed**

`docs/HANDOFF.md` records scores from July 2026 sessions. At that time there
was no rubric, no prompt, and no runner in the repository; the evaluation was
ad-hoc inside a session. The pre-revision drafts that were graded were never
committed — `git log content/blog/korean-convenience-store-gf-snacks.md` shows
two commits, a stub and the final version, with nothing in between.

So these numbers cannot be reproduced, and they are **not** written into the
machine format. They stay here as prose:

| Post | Date | Reported | Artifact | What is still verifiable |
|---|---|---|---|---|
| `reading-korean-food-labels` | 07-30 | 9.5 / 9.5 | none | Commit body carries the "wheat only is mandatory" correction as its central argument |
| `korean-convenience-store-gf-snacks` | 07-31 | 7.5/7.0 → 9.5/9.5 | none | `82d3d1a` discloses that the CU data is a keyword match over product names, and names four misclassifications against itself |

The distinction that matters: **the scores are unverifiable, but the fixes the
evaluation produced are verifiable in the commits.** A reviewer can read
`82d3d1a` and see a piece arguing against its own method's reliability. That is
evidence of an evaluation having happened; the number attached to it is not.

Every judgment recorded from August 2026 onward is bucket A — A2 until API
credit exists, A1 after.
