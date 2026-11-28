#!/usr/bin/env python3
"""Translation coverage check. Opens every page of the site in English, collects every text (and placeholder / aria-label / title / alt),
then reports the ones that the shared dictionary (lang/<code>.json, the Arabic one is generated from index.html) does not translate.

    python tools/check-translations.py            (needs the local server: .claude/serve.ps1 -Port 5541, and Playwright)
    python tools/check-translations.py http://localhost:5541

Run it after adding or editing any text on any page: an empty list for every language means everything is covered.
Brand names (kept in Latin letters, see brand-names.json), e-mail / phone examples and the copyright line are not translated on purpose."""
import json, os, re, sys, glob
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5541"
LANGS = ["ar", "de", "es", "fr", "it", "ru"]
# every page that is a page of its own (the language product pages are written in their language already)
SKIP = ("landing/", "seen-themes/", "cart/", "checkout/", "ar/", "de/", "es/", "fr/", "it/", "ru/", "product/", "brands/", ".claude", "node_modules", "tools/", "landing/_", "functions/", "img/", "fonts/", "lang/")
pages = []
for f in sorted(glob.glob(os.path.join(ROOT, "**", "index.html"), recursive=True)):
    rel = os.path.relpath(f, ROOT).replace(os.sep, "/")
    if rel.startswith(SKIP): continue
    pages.append("/" + rel)
for extra in ("/3d.html",):
    if os.path.exists(os.path.join(ROOT, extra.strip("/"))): pages.append(extra)
JS = r"""(()=>{const out=[];const add=t=>{t=(t||'').trim();if(t&&/[A-Za-z]{2,}/.test(t))out.push(t)};
const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const p=n.parentNode;if(/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(p.nodeName))continue;if(p.closest('svg,[data-nt],.logo,script'))continue;add(n.nodeValue)}
document.querySelectorAll('[placeholder],[aria-label],[title],[alt]').forEach(e=>{['placeholder','aria-label','title','alt'].forEach(k=>add(e.getAttribute(k)))});return out})()"""
BRANDS = set(json.load(open(os.path.join(ROOT, "brand-names.json"), encoding="utf-8")).values()) | {"Alexander Mcqueen", "Armani Exchange", "Calvin Klein Jeans", "Carrera Ducati", "Chloe", "Clocks Colours", "Dsquared2", "Hugo Boss", "Liu Jo", "Prive Revaux", "Ray Ban", "Scuderia Ferrari", "Uspa Polo", "Ray-Ban RB3025", "Valu", "SEEN Eyewear", "Boss", "Bottega Veneta", "Balenciaga", "Carrera", "Converse", "David Beckham", "Dunhill", "Escada", "Fila", "Gucci", "Guy Laroche", "Hugo", "Karl Lagerfeld", "Lacoste", "Maui Jim", "Nike", "Polaroid", "Police", "Puma", "Saint Laurent", "Society", "Tommy Hilfiger", "Valentino", "Vogue", "Calvin Klein", "Ray-Ban", "Color 4", "/shop"}
OK = re.compile(r"^[A-Z0-9 .&\-+@:/,'()]+$|^©|@example|^[+\dx ]+$|^[\d .,:/+-]+$")   # brand names in capitals, examples, numbers
strs = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for u in pages:
        ctx = b.new_context(viewport={"width": 390, "height": 800}, is_mobile=True); pg = ctx.new_page()
        pg.add_init_script("try{localStorage.seenLang='en'}catch(e){}")
        try:
            pg.goto(BASE + u, wait_until="domcontentloaded", timeout=20000); pg.wait_for_timeout(3500)
            try: pg.evaluate("(document.getElementById('mbt')||{click(){}}).click()"); pg.wait_for_timeout(500)
            except Exception: pass
            for s in pg.evaluate(JS): strs.setdefault(s, set()).add(u)
        except Exception as e:
            print("could not open", u, str(e)[:60])
        ctx.close()
    b.close()
print("pages checked:", len(pages), "| distinct texts:", len(strs))
bad = 0
for l in LANGS:
    j = json.load(open(os.path.join(ROOT, "lang", l + ".json"), encoding="utf-8")); d = j["d"]; x = [re.compile(a[0]) for a in j.get("x", [])]
    miss = sorted(s for s in strs if s not in d and not any(r.search(s) for r in x) and not OK.search(s) and s not in BRANDS)
    bad += len(miss)
    print("\n== %s: %d not translated" % (l, len(miss)))
    for s in miss[:60]: print("   ", repr(s), "<-", sorted(strs[s])[:2])
sys.exit(1 if bad else 0)
