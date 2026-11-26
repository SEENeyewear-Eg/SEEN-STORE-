// Builds share-images.json: for every product slug, the photo that a shared link should show.
//
// Why a file: the product page function (functions/product/[slug].js) runs on Cloudflare Workers, which do not allow
// running code from text, so it cannot read the photo map (BIMG in seen-cards.js) itself. This script reads the map the
// same way the browser does (it loads seen-cards.js, so the rules are never copied) and writes slug -> absolute photo URL.
// Models without any photo are left out; the page then falls back to the site share picture.
//
// Run (from the repo root) after the catalogue or the photos change:   node tools/build-share-images.mjs
// Uses the saved catalogue in .local-api/catalog.json (refresh it with scripts/sync-local-catalog.cjs), or the live one with --live.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.seeneyeweareg.com';
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// Load the shared card code exactly as a browser page would.
const sandbox = { window: {}, localStorage: { getItem: () => null }, document: {}, console };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(read('seen-cards.js'), sandbox);
const C = sandbox.SEEN_CARDS;
const SEO_SLUG = vm.runInNewContext(read('seo-slugs.js') + '\nSEO_SLUG');

const rows = process.argv.includes('--live')
  ? await (await fetch(SITE + '/api/catalog')).json()
  : JSON.parse(read('.local-api/catalog.json'));
C.decorate(rows);

const out = {};
for (const p of rows) {
  const slug = SEO_SLUG[p.id];
  if (!slug) continue;
  // First colour that has stock, then the other colours, so a model with any photo gets one.
  const order = [...p.k].sort((a, b) => (+b[4] > 0) - (+a[4] > 0));
  for (const k of order) {
    // pimg() is what the product cards use to pick the photo; its first <img src> is the photo a card shows.
    const u = ((C.pimg(p, k, '').match(/ src="([^"]+)"/) || [])[1] || '').replace(/&amp;/g, '&');
    if (u) { out[slug] = /^https?:/.test(u) ? u : SITE + u; break; }
  }
}
const keys = Object.keys(out).sort();
fs.writeFileSync(path.join(ROOT, 'share-images.json'), JSON.stringify(Object.fromEntries(keys.map(k => [k, out[k]]))) + '\n');
console.log('products', rows.length, 'with a share photo', keys.length);
