#!/bin/bash
# check-regression.sh — 기준선 대비 퇴행 감지
# Usage: bash eval/check-regression.sh [--threshold 5.0]

set -euo pipefail

THRESHOLD=${2:-5.0}
BASELINE="eval/baseline.csv"
LATEST="eval/results/latest.csv"

if [ ! -f "$BASELINE" ]; then
  echo "⚠️  기준선 없음. 현재 결과를 기준선으로 저장합니다."
  cp "$LATEST" "$BASELINE"
  echo "✅ 기준선 저장: $BASELINE"
  exit 0
fi

if [ ! -f "$LATEST" ]; then
  echo "❌ 최신 결과 없음. eval-runner.sh를 먼저 실행하세요."
  exit 1
fi

echo "🔍 Regression Check (threshold: ${THRESHOLD}%)"
echo ""

REGRESSIONS=0

while IFS=, read -r id name category pass total; do
  baseline_line=$(grep "^$id," "$BASELINE" 2>/dev/null || echo "")
  if [ -z "$baseline_line" ]; then
    echo "  ℹ️  [$id] 기준선에 없음 (새 태스크)"
    continue
  fi
  
  baseline_pass=$(echo "$baseline_line" | cut -d, -f4)
  baseline_total=$(echo "$baseline_line" | cut -d, -f5)
  
  if [ "$total" -eq 0 ] || [ "$baseline_total" -eq 0 ]; then
    continue
  fi
  
  current_rate=$(echo "scale=1; $pass * 100 / $total" | bc)
  baseline_rate=$(echo "scale=1; $baseline_pass * 100 / $baseline_total" | bc)
  diff=$(echo "scale=1; $baseline_rate - $current_rate" | bc)
  
  is_regression=$(echo "$diff > $THRESHOLD" | bc)
  if [ "$is_regression" -eq 1 ]; then
    echo "  ❌ [$id] $name: ${baseline_rate}% → ${current_rate}% (▼${diff}%)"
    REGRESSIONS=$((REGRESSIONS + 1))
  else
    echo "  ✅ [$id] $name: ${baseline_rate}% → ${current_rate}%"
  fi
done < "$LATEST"

echo ""
if [ $REGRESSIONS -gt 0 ]; then
  echo "❌ $REGRESSIONS regression(s) detected!"
  exit 1
else
  echo "✅ No regressions. All clear."
fi
