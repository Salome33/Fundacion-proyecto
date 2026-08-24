#!/usr/bin/env python3
"""Extract frontend files from agent transcript Write/StrReplace operations."""
import json
import os
import re

TRANSCRIPT = r"C:\Users\JOHN JAIRO\.cursor\projects\c-Users-JOHN-JAIRO-Projects-human-scratch-three\agent-transcripts\486468d0-67fa-40aa-8a14-a766348fe3e6\486468d0-67fa-40aa-8a14-a766348fe3e6.jsonl"
FRONTEND_ROOT = r"C:\Users\JOHN JAIRO\Projects\human-scratch-three\frontend"

files: dict[str, str] = {}
write_count = 0
strreplace_count = 0
skipped = []


def norm_path(p: str) -> str | None:
    p = p.replace("/", "\\")
    m = re.search(
        r"human-scratch-three\\frontend\\(.+)$", p, re.I
    )
    if not m:
        return None
    return m.group(1).replace("\\", "/")


def apply_strreplace(content: str, old: str, new: str) -> str | None:
    if old in content:
        return content.replace(old, new, 1)
    return None


with open(TRANSCRIPT, "r", encoding="utf-8") as f:
    for line_no, line in enumerate(f, 1):
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue

        content = obj.get("message", {}).get("content", [])
        if not isinstance(content, list):
            continue

        for item in content:
            if not isinstance(item, dict) or item.get("type") != "tool_use":
                continue

            name = item.get("name", "")
            inp = item.get("input", {})
            path = inp.get("path", "")
            rel = norm_path(path)
            if not rel:
                continue

            if name == "Write":
                contents = inp.get("contents", "")
                if contents:
                    files[rel] = contents
                    write_count += 1

            elif name == "StrReplace":
                old = inp.get("old_string", "")
                new = inp.get("new_string", "")
                replace_all = inp.get("replace_all", False)
                if not old or old == new:
                    continue
                if rel not in files:
                    skipped.append((line_no, rel, "StrReplace before Write"))
                    continue
                if replace_all and old in files[rel]:
                    files[rel] = files[rel].replace(old, new)
                    strreplace_count += 1
                else:
                    updated = apply_strreplace(files[rel], old, new)
                    if updated is not None:
                        files[rel] = updated
                        strreplace_count += 1
                    else:
                        skipped.append((line_no, rel, "StrReplace old_string not found"))

restored = []
for rel, content in sorted(files.items()):
    out_path = os.path.join(FRONTEND_ROOT, rel.replace("/", os.sep))
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8", newline="\n") as out:
        out.write(content)
    restored.append(rel)

print(f"Write ops: {write_count}, StrReplace ops: {strreplace_count}")
print(f"Files written: {len(restored)}")
for r in restored:
    sz = os.path.getsize(os.path.join(FRONTEND_ROOT, r.replace("/", os.sep)))
    print(f"  {r} ({sz} bytes)")
if skipped:
    print(f"\nSkipped StrReplace ({len(skipped)}):")
    for s in skipped[-15:]:
        print(f"  line {s[0]}: {s[1]} - {s[2]}")
