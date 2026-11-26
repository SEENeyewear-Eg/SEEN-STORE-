// GET /product/<slug> — serves the site's index.html with this product's share tags filled in
// (title, description, URL and the product photo), so a shared product link shows the product.
// The page itself still runs the normal app: only the <head> meta tags change.
import { catalog } from '../_lib/store.js';

const SITE = 'https://www.seeneyeweareg.com';

// Same rule as the generator: "Maui Jim MJ0647SA" -> "maui-jim-mj0647sa".
export const slugify = s => String(s || '')
  .normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Photo of the model, as the site's product cards show it. share-images.json (slug -> photo URL) is built by
// tools/build-share-images.mjs; it is a file because Cloudflare Workers cannot run the photo map's code from text.
// Empty when the model has no photo.
export const imageFor = (images, slug) => (images && images[slug]) || '';

// Replaces the content of one <meta> tag (matched by property or name). Keeps the tag if it is missing.
export function setMeta(html, key, value) {
  const re = new RegExp('<meta (property|name)="' + key.replace(/[.:]/g, m => '\\' + m) + '" content="[^"]*">');
  return re.test(html) ? html.replace(re, (_, attr) => '<meta ' + attr + '="' + key + '" content="' + esc(value) + '">') : html;
}

// Removes one <meta> tag (used for the width/height of a generic image, which do not apply to a product photo).
export function dropMeta(html, key) {
  return html.replace(new RegExp('\\s*<meta property="' + key + '" content="[^"]*">'), '');
}

export function shareHtml(html, slug, product, images) {
  const colour = product.k && product.k[0] ? product.k[0][2] : '';
  const model = product.n;
  const title = [product.b, model, colour].filter(Boolean).join(' ') + ' | SEEN Eyewear';
  const desc = [product.b, model, colour, 'Authentic eyewear from SEEN Eyewear, Egypt. Delivery across Egypt or pickup from our branches.'].filter(Boolean).join(' · ');
  const image = imageFor(images, slug);
  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>/, () => '<title>' + esc(title) + '</title>');
  out = setMeta(out, 'description', desc);
  out = setMeta(out, 'og:title', title);
  out = setMeta(out, 'og:description', desc);
  out = setMeta(out, 'og:url', SITE + '/product/' + slug);
  out = setMeta(out, 'og:type', 'website');
  // The shared page's canonical is the product's own address (the app shell's canonical is the home page).
  out = out.replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="' + SITE + '/product/' + slug + '">');
  if (image) {
    out = setMeta(out, 'og:image', image);
    out = dropMeta(out, 'og:image:width');
    out = dropMeta(out, 'og:image:height');
  }
  return out;
}

// Finds the product whose brand + model gives this slug (same rule as the generator).
export function findProduct(products, slug) {
  for (const p of products) if (slugify(p.b + ' ' + p.n) === slug) return p;
  return null;
}

export async function onRequestGet({ request, env, params }) {
  const url = new URL(request.url);
  const page = env.ASSETS ? await env.ASSETS.fetch(new URL('/index.html', url)) : await fetch(new URL('/index.html', url));
  const html = await page.text();
  let images = {};
  try {
    const res = env.ASSETS ? await env.ASSETS.fetch(new URL('/share-images.json', url)) : await fetch(new URL('/share-images.json', url));
    if (res.ok) images = await res.json();
  } catch (e) { /* no photo map: the page keeps the site share picture */ }
  const slug = decodeURIComponent(String(params.slug || '')).toLowerCase();
  const cat = await catalog(request, env);
  const product = findProduct([...cat.values()], slug);
  // Unknown slug: serve the normal page unchanged, so the app's own 404 handling still runs.
  if (!product) return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  return new Response(shareHtml(html, slug, product, images), {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' },
  });
}
