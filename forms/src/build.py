#!/usr/bin/env python3
"""Inline the arms image into template.html -> index.html."""
import base64, os
root = os.path.dirname(os.path.abspath(__file__))
arms = base64.b64encode(open(os.path.join(root, "arms.png"), "rb").read()).decode()
t = open(os.path.join(root, "template.html"), encoding="utf-8").read()
assert "{{ARMS}}" in t and "{{PRESETS}}" in t
pre = open(os.path.join(root, "presets.json"), encoding="utf-8").read().replace("</", "<\\/")
open(os.path.join(root, "index.html"), "w", encoding="utf-8").write(t.replace("{{ARMS}}", arms).replace("{{PRESETS}}", pre))
print("index.html", os.path.getsize(os.path.join(root, "index.html")) // 1024, "KB")
