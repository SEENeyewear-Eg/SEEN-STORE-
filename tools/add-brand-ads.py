#!/usr/bin/env python3
"""Brand page banners: one wide model photo (not clickable) at the top of every brand page.

    python tools/add-brand-ads.py <folder-with-originals>      files named <brand-slug>.<jpg|jpeg|png|webp>

* converts each original to img/brand-ads/<slug>.webp (max 1800 px wide, quality 80),
* lists the brands that have a photo in index.html (const BAD_OK, used by the app's brand view),
(There are no static brand pages any more: /brands/<slug> is the app itself, served by functions/brands/[slug].js.)
Safe to re-run. A brand without a photo shows no banner. The banner box and its look live in brand-ad.css."""
import os, re, sys, glob
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SRC = sys.argv[1] if len(sys.argv) > 1 else None
OUT = os.path.join(ROOT, "img", "brand-ads"); os.makedirs(OUT, exist_ok=True)
NAMES = {"ray-ban": "Ray-Ban"}
# Where the face/glasses are in each original (fraction of width, fraction of height), so the 2:1 crop keeps them. Default: centre, a little above the middle.
FOCUS = {"balenciaga": (.5, .32), "alexander-mcqueen": (.45, .15), "armani-exchange": (.5, .33), "prive-revaux": (.52, .25), "vogue": (.76, .38), "ray-ban": (.55, .50), "hugo": (.55, .40), "david-beckham": (.45, .35), "tommy-hilfiger": (.48, .50), "carrera": (.5, .35), "carrera-ducati": (.5, .35),
         "polaroid": (.45, .30), "calvin-klein": (.5, .35), "converse": (.5, .60), "nike": (.5, .0), "puma": (.5, .45), "maui-jim": (.5, .40),
         "clocks-colours": (.85, .5), "fila": (.35, .30), "guy-laroche": (.5, .30), "hugo-boss": (.5, .22), "dunhill": (.4, .4), "lacoste": (.5, .4)}
def nice(slug):
    return NAMES.get(slug) or " ".join(w.upper() if w in ("hugo", "boss") and False else w.capitalize() for w in slug.split("-"))
if SRC:
    for f in sorted(glob.glob(os.path.join(SRC, "*"))):
        slug, ext = os.path.splitext(os.path.basename(f))
        if ext.lower() not in (".jpg", ".jpeg", ".png", ".webp"): continue
        im = Image.open(f); im = im.convert("RGB")
        # crop to a 2:1 banner around the brand's focal point (x, y as fractions of the picture: where the face/glasses are)
        fx, fy = FOCUS.get(slug, (0.5, 0.4)); W, H = im.size
        cw, ch = (W, round(W / 2)) if W / H < 2 else (round(H * 2), H)
        x0 = min(max(round(fx * W - cw / 2), 0), W - cw); y0 = min(max(round(fy * H - ch / 2), 0), H - ch)
        im = im.crop((x0, y0, x0 + cw, y0 + ch))
        if im.width > 1800: im = im.resize((1800, 900), Image.LANCZOS)
        im.save(os.path.join(OUT, slug + ".webp"), "WEBP", quality=80, method=6)
        print(slug, im.size, os.path.getsize(os.path.join(OUT, slug + ".webp")) // 1024, "KB")
have = sorted(os.path.splitext(os.path.basename(f))[0] for f in glob.glob(os.path.join(OUT, "*.webp")))
def rw(p, fn):
    s = open(p, encoding="utf-8", newline="").read(); nl = "\r\n" if "\r\n" in s else "\n"
    t = fn(s.replace("\r\n", "\n"))
    if t is not None:
        for _ in range(12):
            try: open(p, "w", encoding="utf-8", newline="").write(t.replace("\n", nl)); break
            except OSError: import time; time.sleep(.5)
def app(s):
    return re.sub(r"const BAD_OK=new Set\(\[[^\]]*\]\);", "const BAD_OK=new Set([" + ",".join("'%s'" % x for x in have) + "]);", s, count=1)
rw(os.path.join(ROOT, "index.html"), app)
print("brands with a banner:", len(have))
