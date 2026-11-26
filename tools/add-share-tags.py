"""Adds the share tags (Open Graph + Twitter card) and a canonical link to the static pages that lack them.

 * Home-style pages get the site share picture (img/seen-og-share.jpg, 1200x630).
 * Brand pages (/brands/<slug>/) get that brand's logo picture (img/share/brand-<slug>.png, see build-brand-share.py).
 * Every URL uses the www host, because that is the host that serves the site.
Only pages that are not noindex are touched, and a tag that is already there is never added twice (safe to re-run).

Run (from the repo root):   python tools/add-share-tags.py
"""
import html as H, pathlib, re, subprocess, sys, time

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = 'https://www.seeneyeweareg.com'
DEFAULT_IMG = '/img/seen-og-share.jpg'
SKIP_PREFIX = ('landing/', 'admin/', 'tools/', 'seen-themes/')
SKIP_FILES = {'review.html', 'site-chat.html', 'seen-3d-preview.html', '3d.html', 'seen-tryon-3d.html', 'index.html'}

git = r'C:\Program Files\Git\cmd\git.exe'
files = subprocess.run([git, 'ls-files', '*.html'], capture_output=True, text=True, encoding='utf-8', cwd=ROOT).stdout.split('\n')

done = skipped = 0
for rel in files:
    if not rel or rel in SKIP_FILES or rel.startswith(SKIP_PREFIX) or '/product/' in rel:
        continue
    p = ROOT / rel
    b = p.read_bytes()
    s = b.decode('utf-8')
    if 'og:image' in s or re.search(r'<meta name="robots" content="[^"]*noindex', s):
        skipped += 1
        continue
    t = re.search(r'<title>(.*?)</title>', s, re.S)
    d = re.search(r'<meta name="description" content="([^"]*)"', s)
    if not t:
        skipped += 1
        continue
    title = H.unescape(t.group(1)).strip()
    desc = H.unescape(d.group(1)).strip() if d else 'Authentic sunglasses and optical frames from 40+ brands. Delivery across Egypt or pickup from our branches.'
    url_path = '/' + rel[:-len('index.html')] if rel.endswith('/index.html') else '/' + rel
    url_path = url_path.replace('/index.html', '/')
    brand = re.match(r'brands/([^/]+)/index\.html$', rel)
    img = '/img/share/brand-' + brand.group(1) + '.png' if brand else DEFAULT_IMG
    if brand and not (ROOT / img.lstrip('/')).exists():
        img = DEFAULT_IMG
    esc = lambda v: H.escape(v, quote=True)
    nl = '\r\n' if '\r\n' in s else '\n'
    tags = [
        '<meta property="og:site_name" content="SEEN Eyewear">',
        '<meta property="og:type" content="website">',
        '<meta property="og:title" content="%s">' % esc(title),
        '<meta property="og:description" content="%s">' % esc(desc),
        '<meta property="og:url" content="%s%s">' % (SITE, url_path),
        '<meta property="og:image" content="%s%s">' % (SITE, img),
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        '<meta name="twitter:card" content="summary_large_image">',
    ]
    if 'rel="canonical"' not in s:
        tags.insert(0, '<link rel="canonical" href="%s%s">' % (SITE, url_path))
    block = nl.join(tags) + nl
    # right after </title>, so nothing else in the head moves
    s2 = s.replace('</title>', '</title>' + nl + block.rstrip('\r\n'), 1)
    for attempt in range(8):  # Windows sometimes refuses a write for a moment (antivirus / sync); try again
        try:
            p.write_bytes(s2.encode('utf-8'))
            break
        except OSError:
            time.sleep(0.4)
    else:
        raise SystemExit('could not write ' + rel)
    done += 1
print('pages updated', done, 'skipped', skipped)
