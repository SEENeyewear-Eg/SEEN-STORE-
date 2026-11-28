#!/usr/bin/env python3
"""The four older pages that carry their own copy of the home page's code (visit, offers, frames, blog) keep an old Arabic dictionary
(for example "Brands" = العلامات where the home page says البراندات). This makes them agree with the home page:
for every word they share with lang/ar.json it writes the home page's wording into a marked block, <script data-ar-sync>, placed
right after the page's own dictionary. Page-only words are left alone. Safe to re-run (the block is replaced).

    python tools/build-lang-ar.py        first (rebuilds lang/ar.json from index.html)
    python tools/sync-ar-copies.py [url-base]      default http://localhost:5541  (needs the local server)"""
import json, os, re, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5541"
PAGES = ["visit", "offers", "frames", "blog"]
# Words the page deliberately words differently (the Black Friday block and its countdown on the offers page).
# Words every copy must have even if its own old dictionary never did (the footer line).
ADD = ["*Terms and Conditions apply.", "Triple 0 - 0 - 0"]
KEEP = {"offers": {"Buy one", "get the second pair", "days", "hrs", "min", "sec"}}
master = json.load(open(os.path.join(ROOT, "lang", "ar.json"), encoding="utf-8"))["d"]
MARK = re.compile(r'<script data-ar-sync>.*?</script>', re.S)
with sync_playwright() as p:
    b = p.chromium.launch()
    for name in PAGES:
        path = os.path.join(ROOT, name, "index.html")
        raw = open(path, encoding="utf-8", newline="").read(); nl = "\r\n" if "\r\n" in raw else "\n"; s = raw.replace("\r\n", "\n")
        s = MARK.sub("", s)                                    # start from the page without an earlier sync block
        open(path, "w", encoding="utf-8", newline="").write(s.replace("\n", nl))
        pg = b.new_page(); pg.goto("%s/%s/index.html" % (BASE, name), wait_until="domcontentloaded"); pg.wait_for_timeout(7000)
        own = pg.evaluate("AR"); pg.close()
        diff = {k: master[k] for k in own if k in master and own[k] != master[k] and k not in KEEP.get(name, ())}
        diff.update({k: master[k] for k in ADD if k in master and k not in own})
        if diff:
            blk = "<script data-ar-sync>Object.assign(AR," + json.dumps(diff, ensure_ascii=False, separators=(",", ":")) + ")</script>"
            anchor = s.rindex("Object.assign(AR,"); end = s.index("</script>", anchor) + len("</script>")
            s = s[:end] + blk + s[end:]
        open(path, "w", encoding="utf-8", newline="").write(s.replace("\n", nl))
        print(name, "words made equal to the home page:", len(diff))
    b.close()
