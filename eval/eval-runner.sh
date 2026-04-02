#!/bin/bash
# eval-runner.sh — GF Korea Eval 파이프라인 실행기
# Usage: bash eval/eval-runner.sh

set -euo pipefail

TASKS_DIR="eval/tasks"
RESULTS_DIR="eval/results/$(date +%Y%m%d-%H%M%S)"
PASS_COUNT=0
FAIL_COUNT=0
TOTAL=0

mkdir -p "$RESULTS_DIR"

echo "🔍 GF Korea Eval Pipeline"
echo "========================="
echo ""

for task_file in "$TASKS_DIR"/*.json; do
  task_name=$(python3 -c "import json; print(json.load(open('$task_file'))['name'])")
  task_id=$(python3 -c "import json; print(json.load(open('$task_file'))['id'])")
  category=$(python3 -c "import json; print(json.load(open('$task_file'))['category'])")
  
  echo "▶ [$task_id] $task_name ($category)"
  
  steps=$(python3 -c "import json; d=json.load(open('$task_file')); print(len(d['steps']))")
  step_pass=0
  step_total=0
  
  for i in $(seq 0 $((steps - 1))); do
    cmd=$(python3 -c "import json; print(json.load(open('$task_file'))['steps'][$i]['command'])")
    desc=$(python3 -c "import json; print(json.load(open('$task_file'))['steps'][$i]['desc'])")
    step_total=$((step_total + 1))
    
    if eval "$cmd" > /tmp/eval-step-out.txt 2>&1; then
      echo "  ✅ $desc"
      step_pass=$((step_pass + 1))
    else
      echo "  ❌ $desc"
    fi
  done
  
  if [ $step_pass -eq $step_total ]; then
    echo "  → PASS ($step_pass/$step_total)"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo "  → FAIL ($step_pass/$step_total)"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
  
  TOTAL=$((TOTAL + 1))
  echo "$task_id,$task_name,$category,$step_pass,$step_total" >> "$RESULTS_DIR/summary.csv"
  echo ""
done

echo "========================="
echo "📊 Results: $PASS_COUNT/$TOTAL passed, $FAIL_COUNT failed"
echo "📁 Saved to: $RESULTS_DIR/summary.csv"

# Copy as latest for regression check
cp "$RESULTS_DIR/summary.csv" "eval/results/latest.csv" 2>/dev/null || true

if [ $FAIL_COUNT -gt 0 ]; then
  exit 1
fi
