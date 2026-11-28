#!/usr/bin/env python3
r"""
Builds seen-cards.css: EXACTLY the styles that apply to the home page's favourites drawer (the drawer, its product cards and
everything inside), scoped under #sd, so the same drawer on every other page looks and behaves the same as on the home page.
It opens the home page in a browser, opens the drawer with a mix of products (in stock, sold out, many colours) and keeps every
stylesheet rule whose selector matches an element in it. Re-run after the home page's card or drawer styles change:

    (start the local server first:  .claude\serve.ps1 -Port 5520)
    python tools/build-card-css.py [http://localhost:5520]
"""
import json, os, re, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5520"

JS = r"""
() => {
  openFav();
  document.querySelectorAll('#drf .pim img').forEach(i => i.classList.add('on'));
  document.querySelectorAll('#drf .pc').forEach((c, n) => { if (n == 0) c.classList.add('tch'); });
  const scope = document.getElementById('drf');
  const els = [...scope.querySelectorAll('*'), scope, document.body, document.documentElement];
  const strip = s => s.replace(/::?(hover|focus-visible|focus-within|focus|active|before|after|placeholder|disabled|checked|first-line|first-letter|selection)\b/g, '');
  const hit = sel => { let s = strip(sel).trim(); if (!s) return false; try { return els.some(e => e.matches(s)); } catch (e) { return false; } };
  const parts = sel => { const out = []; let d = 0, cur = ''; for (const ch of sel) { if (ch === '(' || ch === '[') d++; if (ch === ')' || ch === ']') d--; if (ch === ',' && !d) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out.map(x => x.trim()).filter(Boolean); };
  const res = [], keyframes = {};
  const walk = (rules, wrap) => {
    for (const r of rules) {
      if (r.type === 1) {
        const ok = parts(r.selectorText).filter(hit);
        if (ok.length) res.push({ wrap, sel: ok, css: r.style.cssText });
      } else if (r.type === 4) walk(r.cssRules, (wrap ? wrap + ' and ' : '') + r.conditionText.replace(/^@media\s*/, '') && '@media ' + r.conditionText);
      else if (r.type === 12) walk(r.cssRules, '@supports ' + r.conditionText);
      else if (r.type === 7) keyframes[r.name] = r.cssText;
    }
  };
  for (const ss of document.styleSheets) { try { walk(ss.cssRules, ''); } catch (e) {} }
  return { res, keyframes };
}
"""

ids = ["MAUI JIM|MJ0688SA", "MAUI JIM|MJ0897S", "RAY BAN|0RB3025", "CARRERA|CA3083/S/US"]
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1280, "height": 900})
    pg.goto(URL + "/", wait_until="domcontentloaded", timeout=90000)
    pg.wait_for_timeout(6000)
    # wish the first 12 products plus the first sold-out ones, so every card state is present
    pg.evaluate("""() => { const o = P.map((p,i)=>i).filter(i=>!P[i].k.some(k=>+k[4]>0)).slice(0,3); const m = P.map((p,i)=>i).filter(i=>P[i].k.length>3).slice(0,3); [0,1,2,...o,...m].forEach(i=>wish.add(i)); }""")
    data = pg.evaluate(JS)
    # the same drawer in Arabic (right-to-left): rules keyed to [dir=rtl] / lang=ar only match then
    pg.evaluate("() => { document.documentElement.setAttribute('dir','rtl'); document.documentElement.lang='ar'; }")
    data2 = pg.evaluate(JS)
    data["res"] += data2["res"]; data["keyframes"].update(data2["keyframes"])
    b.close()

def rewrite(sel):
    s = re.sub(r"^(html\s+body\s+|html\s+|body\s+)", "", sel.strip())
    m = re.match(r"^(?:html)?\[(dir|lang)=[\"']?([\w-]+)[\"']?\]\s+(.*)$", s)
    if m: return "#sd[dir=rtl] " + m.group(3) if (m.group(1) == "dir" and m.group(2) == "rtl") else "#sd[lang=" + m.group(2) + "] " + m.group(3)
    if s in ("html", "body", ""): return None
    if s.startswith(":root"): return s
    return "#sd " + s

rules = []
for r in data["res"]:
    sels = [x for x in (rewrite(s) for s in r["sel"]) if x]
    if not sels: continue
    body = "".join(c for c in [",".join(sels), "{", r["css"], "}"])
    rules.append((r["wrap"], body))
# a repeated rule keeps its LAST copy, as the cascade does; media blocks stay grouped by their condition in order
out, seen = [], set()
for w, b in reversed(rules):
    k = (w, b)
    if k in seen: continue
    seen.add(k); out.append((w, b))
out.reverse()
css = '#sd{font-family:Jost,"IBM Plex Sans Arabic",sans-serif;font-weight:300}'
i = 0
while i < len(out):
    w = out[i][0]; j = i
    chunk = []
    while j < len(out) and out[j][0] == w: chunk.append(out[j][1]); j += 1
    css += ("".join(chunk)) if not w else (w + "{" + "".join(chunk) + "}")
    i = j
used = set(re.findall(r"animation(?:-name)?:[^;}]*?([A-Za-z][\w-]*)", css))
for name, text in data["keyframes"].items():
    if name in used: css += text
open(os.path.join(ROOT, "seen-cards.css"), "w", encoding="utf-8", newline="").write(css)
print("seen-cards.css", len(css), "bytes,", len(out), "rules")
