#!/usr/bin/env python3
"""Adds the Google Ads WhatsApp-click conversion script (tools/seen-wa-conversion.html) before </body> of every page that has the
GTM container. Safe to re-run. The SEO generator (tools/build-seo.mjs) uses the same snippet file."""
import os, re, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SNIP = open(os.path.join(ROOT, "tools", "seen-wa-conversion.html"), encoding="utf-8", newline="").read().strip("\r\n")
MARK = "AW-18461690499/uYooCMnkx7YdEIOVnONE"
out = subprocess.check_output(["git", "-C", ROOT, "ls-files", "*.html"], text=True, encoding="utf-8")
st = {"added": 0, "had": 0, "skipped": 0}
for rel in [x.strip() for x in out.split("\n") if x.strip()]:
    p = os.path.join(ROOT, rel)
    t = open(p, encoding="utf-8", newline="").read()
    if "GTM-T4PS7CGW" not in t: st["skipped"] += 1; continue
    if MARK in t: st["had"] += 1; continue
    ms = list(re.finditer(r"</body\s*>", t, re.I))
    if not ms: print("NO BODY", rel); st["skipped"] += 1; continue
    nl = "\r\n" if "\r\n" in t else "\n"
    i = ms[-1].start()
    t = t[:i] + SNIP.replace("\n", nl) + nl + t[i:]
    for _ in range(12):
        try: open(p, "w", encoding="utf-8", newline="").write(t); break
        except OSError: import time; time.sleep(.5)
    st["added"] += 1
print(st)
