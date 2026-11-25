#!/usr/bin/env python3
r"""
Measures every brand logo in img/logo/ (the files listed in LOGO in index.html): how much of its image box the drawn ink fills and
its aspect ratio. The brand lenses use it (const LF in index.html) to size each logo so the ink fills the lens the same way for every
brand, in every browser size. Re-run after adding or changing a logo:

    (start the local server first:  .claude\serve.ps1 -Port 5520)
    python tools/measure-logos.py [http://localhost:5520]
"""
import json, os, re, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5520"
IDX = os.path.join(ROOT, "index.html")
src = open(IDX, encoding="utf-8", newline="").read()
m = re.search(r"const LOGO=\{(.*?)\};", src, re.S)
files = sorted(set(re.findall(r":'([^']+\.(?:svg|png|webp|jpg))'", m.group(1))))

JS = """async(f)=>{const i=new Image();i.src='/img/logo/'+f;await new Promise(r=>{i.onload=i.onerror=r});if(!i.naturalWidth)return null;
const a=i.naturalWidth/i.naturalHeight,H=400,W=Math.round(H*a),c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(i,0,0,W,H);
const d=x.getImageData(0,0,W,H).data;let x0=1e9,y0=1e9,x1=-1,y1=-1;
for(let y=0;y<H;y++)for(let xx=0;xx<W;xx++){const k=(y*W+xx)*4;const al=d[k+3];const lum=0.3*d[k]+0.59*d[k+1]+0.11*d[k+2];if(al>40&&lum<235){if(xx<x0)x0=xx;if(xx>x1)x1=xx;if(y<y0)y0=y;if(y>y1)y1=y}}
return [+((x1-x0+1)/W).toFixed(4),+((y1-y0+1)/H).toFixed(4),+a.toFixed(4)]}"""
res = {}
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.goto(URL + "/hotel-pickup/index.html", wait_until="domcontentloaded")
    for f in files:
        r = pg.evaluate(JS, f)
        if r: res[f] = r
        else: print("could not read", f)
    b.close()
line = "const LF=" + json.dumps(res, separators=(",", ":")) + ";"
if re.search(r"^const LF=.*;$", src, re.M):
    src = re.sub(r"^const LF=.*;$", lambda _: line, src, count=1, flags=re.M)
else:
    k = src.index("const lgKey=")
    src = src[:k] + "// Logo fit: [ink width, ink height, aspect] of each logo file (tools/measure-logos.py), so every logo fills its lens alike.\n" + line + "\n" + src[k:]
open(IDX, "w", encoding="utf-8", newline="").write(src)
print(len(res), "logos measured")
