# Where these scores come from

Three kinds of evidence sit in this repository, and they are not
interchangeable. Mixing them would make the strongest claim as weak as the
weakest one, so they are labelled.

## A. Machine-generated — reproducible

`eval/judgments/*.json`, written by `scripts/judge-post.mjs`. Every record
carries the model, the effort level, the rubric version, and a SHA-256 of the
exact article bytes that were graded. Any of them can be reproduced with one
command.

`provenance` is an enum with exactly one permitted value, `"runner"`. There is
no representable way to put a hand-written score into this format — the
honesty constraint is a type, not a promise.

**Current state: empty.** The runner and rubrics exist and are verified by
`--dry-run`, but no post has been judged yet because the environment has no
`ANTHROPIC_API_KEY`. Until that runs, this repository contains a working gate
with nothing behind it, and saying otherwise would be the exact failure this
file exists to prevent.

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

Every judgment recorded from August 2026 onward is bucket A.
