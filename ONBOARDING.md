# Onboarding Guide

## 1) What this repository does
`kis-autobot` is a local automation pipeline that turns strategy signals into **intent files** and then executes KR stock orders through KIS (optionally gated by approval). Default operation is safety-first pilot mode with strict risk controls and low trade frequency.

At a high level:
1. Signal generator decides if a new intent should be created.
2. Intent JSON is written under `signal_intents/`.
3. Go executor reads the latest intent, validates guardrails, requests approval if needed, and places orders.
4. State files under `goexec/state/` prevent duplicates/overtrading and preserve workflow state.

## 2) Repository structure
- `goexec/`: main production runtime (Go).
  - `main.go`: entrypoint and runtime orchestration.
  - `signalgen.go`: evaluation-window logic, cooldown, intent creation.
  - `kis*.go`: KIS API integration and response handling.
  - `state/` (runtime-generated, gitignored): approval/processed/open-position metadata.
- `python/`: helper scripts for local bootstrapping and simple intent generation.
- `signal_intents/`: file-based queue watched by executor.
- `universe/`: KR ticker universe, holiday files, fundamentals/classification artifacts.
- `scripts/`: one-off ops/build scripts (e.g., `build_goexec.sh`, universe generation).
- `STATUS.md`: single source of truth (SSOT) for current pilot policy and operational status.

## 3) Operational model you must understand first
- **Eval window is narrow**: entries are generated only during a small KST window (default 09:10~09:12).
- **Risk-first pilot policy**:
  - entry orders require approval,
  - event liquidations (`EVENT_STOPLOSS`, `EVENT_TIMEEXIT`) can auto-execute under hard guardrails,
  - `max_qty=1` globally.
- **Intent expiry + dedupe** are core safety controls.
- **Session awareness** matters: KR market-open checks, holiday file gating, and message/alert integrations are part of normal flow.

## 4) Files a new engineer should read in order
1. `README.md` (quick run/config basics)
2. `STATUS.md` (current policy, fixed constraints, roadmap)
3. `goexec/main.go` (runtime lifecycle, approval path, monitor/signalgen modes)
4. `goexec/signalgen.go` (when/why intents are generated)
5. KIS integration files (`goexec/kis.go`, `goexec/kisresp.go`, `goexec/kis_order_inquiry.go`, `goexec/kis_daily_ccld.go`)
6. Position/risk state files (`goexec/positions.go`, `goexec/orders_state.go`, `goexec/reconcile.go`, `goexec/killswitch.go`)

## 5) Local development checklist
- Put secrets in `config/.env` (never commit).
- Rebuild Go binary after runtime changes: `./scripts/build_goexec.sh`.
- Test first in `DRY_RUN` mode and verify files/state transitions before `LIVE`.
- Validate no stale pending approval or expired intents before test runs.

## 6) Suggested learning path (next topics)
1. **Order lifecycle reliability (highest priority):** implement/understand order-status polling + cancel/replace retries for liquidation paths.
2. **Calendar robustness:** migrate weekday-only assumptions to full KR holiday/trading-calendar handling for T+3 logic.
3. **State reconciliation:** deepen understanding of fill/position reconciliation to avoid drift.
4. **Observability:** standardize logs/alerts around intent drop reasons, expiry, and broker rejection classes.
5. **Policy evolution:** after stability, discuss controlled relaxation from pilot constraints.

## 7) Practical tips
- Treat `STATUS.md` as policy authority; if code and docs differ, policy updates should be explicit.
- Avoid “just one quick LIVE test” without verifying approval and market-session guards.
- Most production incidents in this style of bot come from state drift, duplicate processing, and session/calendar mistakes.
