#!/usr/bin/env python3
"""
Builds img-map.json, gl-map.json (the home page's frame drawing for items without a photo) and brand-map.json (brand names with style counts and Arabic names, for the search box): for every catalog product and colour, the first photo URL that the home
page itself would show (it calls the page's own pimg() so both always agree).

NOTE: img-map.json and gl-map.json are no longer used (the drawers now use seen-cards.js); only brand-map.json (search box) is still needed and is committed.

Used by seen-drawers (bag / favourites drawers on the static pages), which cannot run the home
page's long image logic. Re-run whenever the catalog or the product photos change:

    python tools/build-img-map.py            (serves nothing; needs the local server running)
    BASE=http://localhost:5520 python tools/build-img-map.py

Output keys:  "BRAND|MODEL|COLOUR"  and  "BRAND|MODEL"  (first colour that has a photo).
"""
import json
import os
import re
import sys

from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE", "http://localhost:5520")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "img-map.json")

JS = r"""() => {
  const out = {}, gl = {ids: {}, svg: {}, m: {}, n: 0};
  const src = h => { const m = /src="([^"]+)"/.exec(String(h || '')); return m ? m[1] : ''; };
  for (const p of P) {
    for (const k of p.k) {
      let u = '';
      try { u = src(pimg(p, [k[0], k[1], k[2]], '')); } catch (e) {}
      if (!u) {
        // No photo: keep the same drawing the home page shows (frame style + master colour), shared by id.
        try {
          const nm = String(k[5] || '').toUpperCase(), c = (nm && CN[nm]) || '#c8ccd0', key = p.s + '|' + c;
          if (!(key in gl.ids)) { gl.ids[key] = gl.n++; gl.svg[gl.ids[key]] = glc(p, k); }
          gl.m[p.b + '|' + p.n + '|' + k[2]] = gl.ids[key];
          if (!(p.b + '|' + p.n in gl.m)) gl.m[p.b + '|' + p.n] = gl.ids[key];
        } catch (e) {}
        continue;
      }
      out[p.b + '|' + p.n + '|' + k[2]] = u;
      if (!out[p.b + '|' + p.n]) out[p.b + '|' + p.n] = u;
    }
  }
  const brands = {};
  for (const b of Object.keys(BC)) brands[b] = {n: BC[b], ar: (typeof barOf === 'function' ? barOf(b) : '') || ''};
  return {map: out, products: P.length, brands: brands, gl: {svg: gl.svg, m: gl.m}};
}"""


def main():
    with sync_playwright() as pw:
        b = pw.chromium.launch(headless=True)
        pg = b.new_page()
        pg.goto(BASE + "/", wait_until="domcontentloaded", timeout=30000)
        pg.wait_for_function("typeof P !== 'undefined' && P.length > 0 && typeof pimg === 'function'", timeout=30000)
        r = pg.evaluate(JS)
        b.close()
    m = r["map"]
    gpath = os.path.join(os.path.dirname(OUT), "gl-map.json")
    with open(gpath, "w", encoding="utf-8") as f:
        json.dump(r["gl"], f, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    print(f"drawings: {len(r['gl']['svg'])}  products without photo: {len(r['gl']['m'])}  bytes: {os.path.getsize(gpath)}")
    bpath = os.path.join(os.path.dirname(OUT), "brand-map.json")
    with open(bpath, "w", encoding="utf-8") as f:
        json.dump(r["brands"], f, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    print(f"brands: {len(r['brands'])}  file: {os.path.abspath(bpath)}")
    if len(m) < 100:
        sys.exit(f"STOP: only {len(m)} entries; the page did not produce a usable map")
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(m, f, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    print(f"products: {r['products']}  entries: {len(m)}  file: {os.path.abspath(OUT)}  bytes: {os.path.getsize(OUT)}")


if __name__ == "__main__":
    main()
