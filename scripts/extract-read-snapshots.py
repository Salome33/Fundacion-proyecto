#!/usr/bin/env python3
"""Extract Read tool snapshots from transcript for frontend files."""
import json
import re

TRANSCRIPT = r"C:\Users\JOHN JAIRO\.cursor\projects\c-Users-JOHN-JAIRO-Projects-human-scratch-three\agent-transcripts\486468d0-67fa-40aa-8a14-a766348fe3e6\486468d0-67fa-40aa-8a14-a766348fe3e6.jsonl"
TARGET = "clinical-intake.component.html"

pending = None
snapshots = []

with open(TRANSCRIPT, "r", encoding="utf-8") as f:
    for line_no, line in enumerate(f, 1):
        try:
            obj = json.loads(line.strip())
        except json.JSONDecodeError:
            continue

        content = obj.get("message", {}).get("content", [])
        if isinstance(content, list):
            for item in content:
                if isinstance(item, dict) and item.get("type") == "tool_use" and item.get("name") == "Read":
                    inp = item.get("input", {})
                    path = inp.get("path", "")
                    if TARGET in path.replace("\\", "/"):
                        pending = {
                            "line": line_no,
                            "path": path,
                            "offset": inp.get("offset", 1),
                            "limit": inp.get("limit"),
                        }

        if obj.get("role") == "user" and pending:
            msg = obj.get("message", {})
            content = msg.get("content", []) if isinstance(msg, dict) else []
            for item in content:
                if not isinstance(item, dict):
                    continue
                if item.get("type") != "tool_result":
                    continue
                text = item.get("content", "")
                if isinstance(text, list):
                    text = "\n".join(
                        b.get("text", "") if isinstance(b, dict) else str(b) for b in text
                    )
                if not text or "L|" not in text and "|" not in text[:200]:
                    continue
                lines = []
                for ln in text.split("\n"):
                    m = re.match(r"^\s*\d+\|(.*)$", ln)
                    if m:
                        lines.append(m.group(1))
                if lines:
                    snapshots.append({**pending, "lines": len(lines), "content": "\n".join(lines)})
                pending = None

print(f"Found {len(snapshots)} Read snapshots for {TARGET}")
for s in snapshots:
    print(f"  line {s['line']}: offset={s.get('offset')} limit={s.get('limit')} lines={s['lines']}")

if snapshots:
    # pick largest snapshot
    best = max(snapshots, key=lambda s: s["lines"])
    out = r"C:\Users\JOHN JAIRO\Projects\human-scratch-three\frontend\src\app\clinical\clinical-intake.component.html.from-read"
    with open(out, "w", encoding="utf-8", newline="\n") as f:
        f.write(best["content"])
    print(f"\nWrote best snapshot ({best['lines']} lines) from line {best['line']}")
