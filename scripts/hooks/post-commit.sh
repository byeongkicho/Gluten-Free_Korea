#!/bin/bash
# post-commit.sh — HANDOFF.md 자동 갱신
# Claude Code PostToolUse 훅에서 호출됨 (모든 Bash 호출 후)
# git commit이 아닌 경우 즉시 종료. Non-blocking.
#
# 이 훅은 실행 상태(방금 만든 커밋)를 업무 상태(HANDOFF.md)에 즉시 반영해,
# 세션이 끊겨도 인수인계 문서가 뒤처지지 않게 한다.
#
# 이전 버전은 "## 진행 중인 작업" 헤딩 앞에 표 행을 삽입했는데, HANDOFF.md가
# 개편되며 그 헤딩이 사라졌다. 훅은 계속 exit 0을 반환했고 아무 경고도 없어서
# 삽입 분기가 죽은 것을 아무도 몰랐다. 그래서 지금은 (1) 문서 구조가 아니라
# 고정 앵커 라인만 갱신하고 (2) 앵커를 못 찾으면 stderr로 알린다.

# stdin에서 훅 이벤트 JSON 읽기
INPUT=$(cat)

# git commit 명령인지 확인 — 아니면 즉시 종료.
# `^git commit`으로 앵커했더니 실제로 가장 흔한 `git add … && git commit …`
# 형태를 통째로 놓쳤다(2026-08-20 발견). 부분 일치로 완화한다 — 오탐의
# 최대 피해가 HANDOFF 필드 세 줄 갱신이라 비대칭적으로 싸다.
TOOL_INPUT=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('command',''))" 2>/dev/null || echo "")
echo "$TOOL_INPUT" | grep -q "git commit" || exit 0

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

# 앵커 → 교체될 전체 라인. 문서 구조가 바뀌어도 이 라인들만 있으면 동작한다.
fields = {
    "- **마지막 업데이트:**": f"- **마지막 업데이트:** {date}",
    "- **브랜치:**": f"- **브랜치:** {branch}",
    "- **마지막 커밋:**": f"- **마지막 커밋:** `{h}` {msg}",
}

with open(handoff) as f:
    lines = f.readlines()

seen = set()
out = []
for line in lines:
    for anchor, replacement in fields.items():
        if line.startswith(anchor):
            out.append(replacement + "\n")
            seen.add(anchor)
            break
    else:
        out.append(line)

missing = sorted(set(fields) - seen)
if missing:
    # 조용히 넘어가면 인수인계가 stale해진 것을 아무도 모른다.
    print(
        f"[post-commit] {handoff}에 앵커가 없어 갱신 못 함: {', '.join(missing)}",
        file=sys.stderr,
    )

if seen:
    with open(handoff, "w") as f:
        f.writelines(out)
PYEOF
