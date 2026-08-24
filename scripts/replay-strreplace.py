#!/usr/bin/env python3
"""Replay StrReplace ops for one file, skipping empty old_string."""
import json
import sys

TRANSCRIPT = r"C:\Users\JOHN JAIRO\.cursor\projects\c-Users-JOHN-JAIRO-Projects-human-scratch-three\agent-transcripts\486468d0-67fa-40aa-8a14-a766348fe3e6\486468d0-67fa-40aa-8a14-a766348fe3e6.jsonl"
TARGET = sys.argv[1]
OUT = sys.argv[2]

content = None
applied = 0
skipped = 0
failed = []

with open(TRANSCRIPT, "r", encoding="utf-8") as f:
    for line_no, line in enumerate(f, 1):
        try:
            obj = json.loads(line.strip())
        except json.JSONDecodeError:
            continue
        items = obj.get("message", {}).get("content", [])
        if not isinstance(items, list):
            continue
        for item in items:
            if not isinstance(item, dict) or item.get("type") != "tool_use":
                continue
            inp = item.get("input", {})
            path = inp.get("path", "").replace("\\", "/")
            if not path.endswith(TARGET):
                continue
            name = item.get("name")
            if name == "Write":
                content = inp.get("contents", "")
            elif name == "StrReplace" and content is not None:
                old = inp.get("old_string", "")
                new = inp.get("new_string", "")
                if not old:
                    skipped += 1
                    continue
                if old == new:
                    skipped += 1
                    continue
                if inp.get("replace_all"):
                    if old in content:
                        content = content.replace(old, new)
                        applied += 1
                    else:
                        failed.append((line_no, "replace_all"))
                elif old in content:
                    content = content.replace(old, new, 1)
                    applied += 1
                else:
                    failed.append((line_no, old[:80]))

with open(OUT, "w", encoding="utf-8", newline="\n") as f:
    f.write(content or "")

print(f"Wrote {OUT}: {len(content or '')} bytes, applied={applied}, skipped={skipped}, failed={len(failed)}")
for ln, msg in failed:
    print(f"  fail {ln}: {msg}")
