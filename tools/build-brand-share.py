"""Builds one share picture (1200x630 PNG) per brand page: the brand's logo on the site's light grey.

Social apps (WhatsApp, Facebook, Telegram, X) do not draw SVG logos as share pictures, so each brand gets a PNG
in img/share/brand-<slug>.png. The logo file is the same one the home brand grid uses (the LOGO map in index.html).

Run (from the repo root, Playwright installed):   python tools/build-brand-share.py
"""
import re, sys, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
html = (ROOT / 'index.html').read_text(encoding='utf-8')
m = re.search(r'const LOGO=\{([^}]*)\}', html)
LOGO = dict(re.findall(r"(\w+):'([^']+)'", m.group(1)))
# LF: measured ink of each logo file [inkWidth, inkHeight, aspect] (see tools/measure-logos.py), so small logos are scaled up to fill the picture.
import json
LF = json.loads(re.search(r'const LF=(\{.*?\});', html, re.S).group(1))
OUT = ROOT / 'img' / 'share'
OUT.mkdir(parents=True, exist_ok=True)

page_tpl = """<!doctype html><meta charset=utf-8><style>
html,body{margin:0;width:1200px;height:630px;background:#F6F8F9;font-family:'Segoe UI',Arial,sans-serif}
.box{position:absolute;left:230px;top:150px;width:740px;height:270px;display:flex;align-items:center;justify-content:center}
.box img{flex:none;width:@@W@@px;height:auto}
.cap{position:absolute;left:0;right:0;bottom:70px;text-align:center;font-size:26px;letter-spacing:.42em;color:#5d6670;font-weight:300}
.cap b{color:#5AC8FA;font-weight:400}
</style><div class=box><img src="@@LOGO@@"></div><div class=cap>SEEN <b>EYEWEAR</b></div>"""

made, missing = [], []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1200, 'height': 630})
    for d in sorted((ROOT / 'brands').iterdir()):
        if not d.is_dir():
            continue
        key = re.sub(r'[^A-Z0-9]', '', d.name.upper())
        f = LOGO.get(key)
        if not f:
            missing.append(d.name)
            continue
        tmp = OUT / '_tmp.html'
        lf = LF.get(f)
        w = min(740 / lf[0], 270 * lf[2] / lf[1], 2600) if lf else 600
        tmp.write_text(page_tpl.replace("@@LOGO@@", (ROOT / "img" / "logo" / f).as_uri()).replace("@@W@@", str(round(w))), encoding='utf-8')
        pg.goto(tmp.as_uri())
        pg.wait_for_function("document.images[0].complete && document.images[0].naturalWidth>0", timeout=15000)
        pg.screenshot(path=str(OUT / ('brand-' + d.name + '.png')))
        made.append(d.name)
    b.close()
(OUT / '_tmp.html').unlink(missing_ok=True)
print('made', len(made), 'missing logo for', missing)
