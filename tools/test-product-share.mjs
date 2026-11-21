// Test for functions/product/[slug].js (share tags for a product link).
// Run: node tools/test-product-share.mjs
// Uses the local catalogue (.local-api/catalog.json) and the photo map in index.html.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { onRequestGet, slugify, readBimg, imageFor, findProduct, shareHtml } from '../functions/product/[slug].js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const bimg = readBimg(html);
const rows = JSON.parse(fs.readFileSync(path.join(ROOT, '.local-api', 'catalog.json'), 'utf8'));
const products = Array.isArray(rows) ? rows : [];

let failed = 0;
const check = (name, ok, extra = '') => {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? '  ' + extra : ''));
  if (!ok) failed++;
};
const meta = (body, key) => (body.match(new RegExp('<meta property="' + key + '" content="([^"]*)"')) || [])[1];

// 1. slugify follows the generator's rule.
check('slugify basic', slugify('MAUI JIM MJ0647SA') === 'maui-jim-mj0647sa', slugify('MAUI JIM MJ0647SA'));
check('slugify accents and ampersand', slugify('Saint Laurent & Co') === 'saint-laurent-and-co');

// 2. A real product with a photo gets its own tags.
const withPhoto = products.find(p => imageFor(bimg, p));
check('catalogue has products with photos', !!withPhoto, withPhoto ? withPhoto.b + ' ' + withPhoto.n : '');
if (withPhoto) {
  const slug = slugify(withPhoto.b + ' ' + withPhoto.n);
  const found = findProduct(products, slug);
  check('findProduct finds it by slug', !!found && found.n === withPhoto.n);
  const body = shareHtml(html, slug, withPhoto, bimg);
  const ogImage = meta(body, 'og:image');
  check('og:title names the model', (meta(body, 'og:title') || '').includes(withPhoto.n), meta(body, 'og:title'));
  check('og:url is the product URL', meta(body, 'og:url') === 'https://seeneyeweareg.com/product/' + slug, meta(body, 'og:url'));
  check('og:image is the product photo', ogImage === imageFor(bimg, withPhoto), ogImage);
  check('og:image is absolute https', /^https:\/\//.test(ogImage || ''));
  check('generic image size tags removed', !/og:image:width/.test(body) && !/og:image:height/.test(body));
  check('<title> updated to the product', body.includes('<title>') && body.includes(withPhoto.n));
  check('app script still present', body.includes('<script>'));
}

// 3. A product without a photo keeps the site's default image.
const noPhoto = products.find(p => !imageFor(bimg, p));
if (noPhoto) {
  const body = shareHtml(html, slugify(noPhoto.b + ' ' + noPhoto.n), noPhoto, bimg);
  check('no-photo product keeps default og:image', meta(body, 'og:image') === 'https://seeneyeweareg.com/img/og.jpg', meta(body, 'og:image'));
}

// 4. The handler: unknown slug serves the normal page unchanged (no catalogue binding in tests).
{
  const env = { ASSETS: { fetch: async () => new Response(html) } };
  const req = new Request('https://seeneyeweareg.com/product/no-such-product-xyz');
  const res = await onRequestGet({ request: req, env, params: { slug: 'no-such-product-xyz' } });
  const body = await res.text();
  check('handler: unknown slug returns the site page', res.status === 200 && body === html);
}

console.log(failed ? '\n' + failed + ' check(s) failed' : '\nall checks passed');
process.exit(failed ? 1 : 0);
