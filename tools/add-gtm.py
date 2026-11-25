#!/usr/bin/env python3
"""
Puts Google Tag Manager (container GTM-T4PS7CGW) into every page: the script right after <head> (before the Meta Pixel) and the
noscript right after <body>. Also adds the Meta Pixel (tools/seen-pixel.html) to the few pages that lack it. Safe to re-run: a page
that already has the container is left alone. The SEO page generator (tools/build-seo.mjs) uses the same two snippet files.

    python tools/add-gtm.py [root-folder]        (default: the repository folder)
"""
import os, re, subprocess, sys
ROOT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
T = os.path.join(os.path.dirname(os.path.abspath(__file__)))
HEAD = open(os.path.join(T, "seen-gtm-head.html"), encoding="utf-8", newline="").read().strip("\r\n")
BODY = open(os.path.join(T, "seen-gtm-body.html"), encoding="utf-8", newline="").read().strip("\r\n")
PIXEL = open(os.path.join(T, "seen-pixel.html"), encoding="utf-8", newline="").read().strip("\r\n")
SKIP_PREFIX = ("admin/", "landing/", "tools/", "seen-themes/", ".claude/", "docs/", "node_modules/")
SKIP_FILES = {"site-chat.html", "seen-3d-preview.html"}
ID = "GTM-T4PS7CGW"
if len(sys.argv) > 2 and sys.argv[2] == "--files":
    rels = sys.argv[3:]
else:
    out = subprocess.check_output(["git", "-C", ROOT, "ls-files", "*.html"], text=True, encoding="utf-8")
    rels = [x for x in out.split("\n") if x.strip()]
stat = {"gtm": 0, "pixel": 0, "had": 0, "skipped": 0, "stub": 0}
for rel in rels:
    if rel.startswith(SKIP_PREFIX) or rel in SKIP_FILES or rel.startswith("."):
        stat["skipped"] += 1; continue
    p = os.path.join(ROOT, rel)
    t = open(p, encoding="utf-8", newline="").read()
    if "Continue to SEEN Eyewear" in t and len(t) < 600:
        stat["stub"] += 1; continue
    if ID in t:
        stat["had"] += 1; continue
    nl = "\r\n" if "\r\n" in t else "\n"
    mh = re.search(r"<head(?:\s[^>]*)?>", t, re.I)
    ch = re.search(r"</head\s*>", t, re.I)
    if not mh or not ch or mh.end() > ch.start():
        print("NO HEAD", rel); stat["skipped"] += 1; continue
    mb = re.compile(r"<body(?:\s[^>]*)?>", re.I).search(t, ch.end())
    if not mb:
        print("NO BODY", rel); stat["skipped"] += 1; continue
    # build from the end so earlier offsets stay valid
    t = t[:mb.end()] + nl + BODY.replace("\n", nl) + t[mb.end():]
    if "fbq(" not in t:
        t = t[:ch.start()] + PIXEL.replace("\n", nl) + nl + t[ch.start():]
        stat["pixel"] += 1
    t = t[:mh.end()] + nl + HEAD.replace("\n", nl) + t[mh.end():]
    open(p, "w", encoding="utf-8", newline="").write(t)
    stat["gtm"] += 1
print(stat)
