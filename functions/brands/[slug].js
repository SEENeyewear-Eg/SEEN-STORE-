// GET /brands/<slug> — serves the site's own index.html (the real app, with the brand's products and filters) with this brand's
// title, description, canonical and share picture filled in. There is no separate brand page: the link opens the products directly.
// Only the <head> tags change; the app reads the brand from the address itself.
import { setMeta } from '../product/[slug].js';

const SITE = 'https://www.seeneyeweareg.com';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export function brandHtml(html, slug, name) {
  const title = name + ' sunglasses and optical frames | SEEN Eyewear';
  const desc = 'Authentic ' + name + ' sunglasses and optical frames at SEEN Eyewear in Hurghada and online across Egypt. Try them on with your camera, or visit our branches.';
  const url = SITE + '/brands/' + slug;
  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>/, () => '<title>' + esc(title) + '</title>');
  out = setMeta(out, 'description', desc);
  out = setMeta(out, 'og:title', title);
  out = setMeta(out, 'og:description', desc);
  out = setMeta(out, 'og:url', url);
  out = setMeta(out, 'og:image', SITE + '/img/share/brand-' + slug + '.png');
  out = out.replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="' + url + '">');
  return out;
}

export async function onRequestGet({ request, env, params }) {
  const url = new URL(request.url);
  const get = p => env.ASSETS ? env.ASSETS.fetch(new URL(p, url)) : fetch(new URL(p, url));
  const html = await (await get('/index.html')).text();
  const slug = decodeURIComponent(String(params.slug || '')).toLowerCase().replace(/\/+$/, '');
  let names = {};
  try { const r = await get('/brand-names.json'); if (r.ok) names = await r.json(); } catch (e) { /* no name list: page stays as is */ }
  const headers = { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' };
  // Unknown brand: the normal page, unchanged, so the app shows its own result.
  if (!names[slug]) return new Response(html, { headers });
  return new Response(brandHtml(html, slug, names[slug]), { headers });
}
