// Adds og:image (the product photo, or the site share picture when the model has no photo) and the Twitter card tag
// to the generated product pages that lack them: /<lang>/product/<slug>/index.html (the English /product/<slug> page
// is served by functions/product/[slug].js, which sets the same tags per request).
// Run (from the repo root, after node tools/build-share-images.mjs):  node tools/add-product-share-images.mjs
// Safe to re-run: a page that already has og:image is left alone.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.seeneyeweareg.com';
const DEFAULT_IMG = SITE + '/img/seen-og-share.jpg';
// slug -> photo URL, built by tools/build-share-images.mjs (run it first).
const images = JSON.parse(fs.readFileSync(path.join(ROOT, 'share-images.json'), 'utf8'));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

let updated = 0, withPhoto = 0, fallback = 0, skipped = 0;
for (const lang of fs.readdirSync(ROOT)) {
  const dir = path.join(ROOT, lang, 'product');
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue;
  for (const slug of fs.readdirSync(dir)) {
    const f = path.join(dir, slug, 'index.html');
    if (!fs.existsSync(f)) continue;
    const html = fs.readFileSync(f, 'utf8');
    const photo = images[slug] || '';
    const img = photo || DEFAULT_IMG;
    const has = html.match(/<meta property="og:image" content="([^"]*)">/);
    if (has) {
      // Already has one: only swap the site's default picture for the model's own photo.
      if (has[1] !== DEFAULT_IMG || !photo) { skipped++; continue; }
      const swapped = html.replace(has[0], `<meta property="og:image" content="${esc(photo)}">`);
      for (let a = 0; ; a++) { try { fs.writeFileSync(f, swapped); break; } catch (e) { if (a >= 10) throw e; Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 300); } }
      updated++; withPhoto++; continue;
    }
    const nl = html.includes('\r\n') ? '\r\n' : '\n';
    const tags = `<meta property="og:image" content="${esc(img)}">` + nl + '<meta name="twitter:card" content="summary_large_image">';
    const re = /(<meta property="og:url" content="[^"]*">)/;
    if (!re.test(html)) { skipped++; continue; }
    const out = html.replace(re, '$1' + nl + tags);
    for (let a = 0; ; a++) {  // Windows sometimes refuses a write for a moment (antivirus / sync): wait and try again
      try { fs.writeFileSync(f, out); break; } catch (e) { if (a >= 10) throw e; Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 300); }
    }
    updated++; photo ? withPhoto++ : fallback++;
  }
}
console.log({ updated, withPhoto, fallback, skipped });
