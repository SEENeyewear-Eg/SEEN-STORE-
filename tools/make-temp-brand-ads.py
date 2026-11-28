#!/usr/bin/env python3
"""TEMPORARY brand banners for brands that have no model photo yet: brand name on a soft light background (1800x900 WebP).
Replace a file with the real campaign photo (tools/add-brand-ads.py) as soon as one is available."""
import os, sys
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
BRANDS = {"police": "POLICE", "saint-laurent": "SAINT LAURENT", "escada": "ESCADA", "uspa-polo": "U.S. POLO ASSN.", "society": "SOCIETY"}
HTML = """<html><body style="margin:0;width:1800px;height:900px;display:flex;align-items:center;justify-content:center;flex-direction:column;
background:linear-gradient(135deg,#ffffff 0%%,#eef5f8 45%%,#d6eefb 100%%);font-family:Jost,sans-serif;color:#0b0b0b;position:relative;overflow:hidden">
<svg style="position:absolute;right:-120px;top:-120px" width="760" height="760" viewBox="0 0 760 760" fill="none" stroke="#5AC8FA" stroke-opacity=".45"><circle cx="380" cy="380" r="370"/><circle cx="380" cy="380" r="290"/><circle cx="380" cy="380" r="210"/></svg>
<svg style="position:absolute;left:-160px;bottom:-200px" width="620" height="620" viewBox="0 0 620 620" fill="none" stroke="#5AC8FA" stroke-opacity=".3"><circle cx="310" cy="310" r="300"/><circle cx="310" cy="310" r="220"/></svg>
<div style="font-weight:300;font-size:%dpx;letter-spacing:18px;padding-left:18px;position:relative">%s</div>
<div style="margin-top:34px;font-weight:400;font-size:30px;letter-spacing:10px;color:#606060;position:relative">SUNGLASSES &amp; OPTICAL FRAMES</div></body></html>"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1800, "height": 900})
    for slug, name in BRANDS.items():
        size = 150 if len(name) < 10 else 120 if len(name) < 14 else 96
        pg.set_content('<link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400&display=swap" rel="stylesheet">' + HTML % (size, name.replace("&", "&amp;")))
        pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(1500)
        tmp = os.path.join(ROOT, "img", "brand-ads", slug + ".png"); pg.screenshot(path=tmp)
        Image.open(tmp).convert("RGB").save(os.path.join(ROOT, "img", "brand-ads", slug + ".webp"), "WEBP", quality=82, method=6); os.remove(tmp)
        print(slug)
    b.close()
