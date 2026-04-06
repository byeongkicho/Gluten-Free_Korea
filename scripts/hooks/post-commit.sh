#!/bin/bash
# post-commit.sh — HANDOFF.md 자동 갱신
# Claude Code PostToolUse 훅에서 호출됨 (모든 Bash 호출 후)
# git commit이 아닌 경우 즉시 종료. Non-blocking.

# stdin에서 훅 이벤트 JSON 읽기
INPUT=$(cat)

# git commit 명령인지 확인 — 아니면 즉시 종료
TOOL_INPUT=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('command',''))" 2>/dev/null || echo "")
echo "$TOOL_INPUT" | grep -q "^git commit" || exit 0

HANDOFF="docs/HANDOFF.md"

# HANDOFF.md가 없으면 조용히 종료
[ -f "$HANDOFF" ] || exit 0

# python3로 안전하게 HANDOFF.md 업데이트 (sed 메타문자 이슈 회피)
python3 - "$HANDOFF" <<'PYEOF'
import sys, subprocess, datetime

handoff = sys.argv[1]

try:
    h = subprocess.check_output(["git", "log", "-1", "--format=%h"], text=True).strip()
    msg = subprocess.check_output(["git", "log", "-1", "--format=%s"], text=True).strip()
    branch = subprocess.check_output(["git", "branch", "--show-current"], text=True).strip()
except Exception:
    sys.exit(0)

date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
new_row = f"| — | {msg} | `{h}` | {date} |"

with open(handoff, "r") as f:
    lines = f.readlines()

out = []
for line in lines:
    # "## 진행 중인 작업" 앞에 커밋 기록 삽입
    if line.startswith("## 진행 중인 작업"):
        out.append(new_row + "\n")
        out.append("\n")
    # 마지막 업데이트 날짜 교체
    if line.startswith("- **마지막 업데이트:**"):
        out.append(f"- **마지막 업데이트:** {date}\n")
        continue
    # 브랜치 교체
    if line.startswith("- **브랜치:**"):
        out.append(f"- **브랜치:** {branch}\n")
        continue
    out.append(line)

with open(handoff, "w") as f:
    f.writelines(out)
PYEOF
