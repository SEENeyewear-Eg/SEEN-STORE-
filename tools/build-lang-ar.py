#!/usr/bin/env python3
"""Writes lang/ar.json from the Arabic dictionary that lives in index.html (AR and ARX, plus every Object.assign(AR, …) added later),
so the static pages (site-nav.js) read the SAME Arabic words as the home page, in the same file format as lang/de.json etc.

    python tools/build-lang-ar.py [url-of-index.html]      (default http://localhost:5541/index.html: start .claude/serve.ps1 first)

Run it again whenever Arabic words change in index.html, then commit lang/ar.json together with index.html."""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5541/index.html"
JS = "()=>({d:AR,x:ARX.map(a=>{if(a[0].flags)throw new Error('regex flags not supported: '+a[0]);return [a[0].source,a[1]]})})"
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    pg.goto(URL, wait_until="domcontentloaded"); pg.wait_for_timeout(8000)
    data = pg.evaluate(JS); b.close()
assert len(data["d"]) > 500 and len(data["x"]) > 5, (len(data["d"]), len(data["x"]))
out = os.path.join(ROOT, "lang", "ar.json")
open(out, "w", encoding="utf-8", newline="\n").write(json.dumps(data, ensure_ascii=False, indent=1) + "\n")
print("lang/ar.json:", len(data["d"]), "words,", len(data["x"]), "patterns")
