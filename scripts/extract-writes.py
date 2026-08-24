#!/usr/bin/env python3
"""Extract specific Write contents from transcript line."""
import json
import sys

TRANSCRIPT = r"C:\Users\JOHN JAIRO\.cursor\projects\c-Users-JOHN-JAIRO-Projects-human-scratch-three\agent-transcripts\486468d0-67fa-40aa-8a14-a766348fe3e6\486468d0-67fa-40aa-8a14-a766348fe3e6.jsonl"
TARGET_SUFFIX = sys.argv[1] if len(sys.argv) > 1 else "clinical-intake.component.html"

with open(TRANSCRIPT, "r", encoding="utf-8") as f:
    for line_no, line in enumerate(f, 1):
        try:
            obj = json.loads(line.strip())
        except json.JSONDecodeError:
            continue
        content = obj.get("message", {}).get("content", [])
        if not isinstance(content, list):
            continue
        for item in content:
            if not isinstance(item, dict) or item.get("type") != "tool_use":
                continue
            if item.get("name") != "Write":
                continue
            inp = item.get("input", {})
            path = inp.get("path", "").replace("\\", "/")
            if path.endswith(TARGET_SUFFIX):
                print(f"Line {line_no}: {len(inp.get('contents',''))} chars")
                out = r"C:\Users\JOHN JAIRO\Projects\human-scratch-three\frontend\src\app\clinical\_restore_" + TARGET_SUFFIX.replace("/", "_")
                with open(out, "w", encoding="utf-8", newline="\n") as outf:
                    outf.write(inp["contents"])
