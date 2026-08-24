#!/usr/bin/env python3
import json

TRANSCRIPT = r"C:\Users\JOHN JAIRO\.cursor\projects\c-Users-JOHN-JAIRO-Projects-human-scratch-three\agent-transcripts\486468d0-67fa-40aa-8a14-a766348fe3e6\486468d0-67fa-40aa-8a14-a766348fe3e6.jsonl"
TARGET = "clinical-intake.component.html"

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
            if name == "StrReplace":
                old = inp.get("old_string", "")
                new = inp.get("new_string", "")
                print(f"\n=== Line {line_no} StrReplace (old {len(old)} -> new {len(new)}) ===")
                if len(old) < 200:
                    print("OLD:", repr(old))
                else:
                    print("OLD start:", repr(old[:100]))
                if "intake-scroll-shell" in new or "intake-scroll-shell" in old:
                    print("*** CONTAINS intake-scroll-shell ***")
                if len(new) < 300:
                    print("NEW:", repr(new[:300]))
                else:
                    print("NEW start:", repr(new[:150]))
