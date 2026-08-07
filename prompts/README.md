# prompts/

Prompts live here as files, not as string literals in code, so that changing
one is a reviewable diff with its own history.

| File | Used by | Purpose |
|---|---|---|
| `caption.md` | `scripts/generate-caption.mjs` | Instagram caption for a place |
| `judge-seo-eeat.md` + `.rubric.json` | `scripts/judge-post.mjs` | Judge A — search performance and E-E-A-T |
| `judge-accuracy-safety.md` + `.rubric.json` | `scripts/judge-post.mjs` | Judge B — factual accuracy and reader safety |

All templates use `{{var}}` substitution.

## The dual-judge gate

A post is publishable when **both** judges score at least **9.5/10** and no
`blocking` finding is raised. The two axes exist because one grader optimising
for both search performance and factual safety trades them off against each
other silently; two graders cannot.

Three properties are worth understanding before editing anything here.

**The judges are independent by construction.** They are separate API calls
that never see each other's output. That is an architectural guarantee, not a
promise made inside a prompt.

**The model never produces the score.** It returns integer points per criterion.
The total, the 9.5 threshold, and the pass/fail decision are computed in
`judge-post.mjs`. A model asked for "a score out of 10" tends to pick the number
first and reason backwards toward it; a model asked to award points against
fixed criteria does not have that option. 9.5/10 is 19 points out of 20.

**The rubric JSON is the only place points are defined.** Three consumers read
it: the prompt (rendered as a table), the response schema (as per-criterion
`enum` ranges, so an out-of-range score is unrepresentable), and the tally (as
arithmetic). Writing the points in prose as well would let the two drift apart.

## Editing a rubric

Bump `version` in the `.rubric.json` when you change criteria or weights. This
invalidates every recorded judgment: `check-harness.mjs judgments` fails until
the affected posts are re-judged. That is deliberate — a score means nothing
without the rubric it was measured against, so **editing a prompt file here
breaks CI**, which is the sense in which these prompts are under test.

## Running it

```bash
node scripts/judge-post.mjs <slug> --dry-run   # render prompt + schema, no API key needed
node scripts/judge-post.mjs <slug>             # judge, record to eval/judgments/
node scripts/judge-post.mjs --all              # every published post
node scripts/judge-post.mjs <slug> --repeat 3  # median and spread across runs
node scripts/judge-post.mjs <slug> --ref <sha> # judge a past revision
```

Needs `ANTHROPIC_API_KEY` in the environment or in `.env` / `.env.local`.
Exit codes: `0` passed · `1` gate failed · `2` runtime error · `78` no API key.

Judging is non-deterministic. `--repeat N` reports the median, min, and max per
axis so the spread is a measured number rather than an assumption; run it when
changing a rubric version.
