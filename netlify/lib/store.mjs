// Shared server-side helpers for checkout: the catalogue is read from index.html so prices
// are never taken from the browser, and Paymob callbacks are verified with HMAC-SHA512.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHmac, timingSafeEqual } from 'node:crypto';

let CATALOG = null;

function findIndexHtml() {
  const here = dirname(fileURLToPath(import.meta.url));
  const tries = [join(process.cwd(), 'index.html'), join(here, '..', '..', 'index.html'), join(here, 'index.html')];
  const f = tries.find(existsSync);
  if (!f) throw new Error('index.html not bundled with the function');
  return f;
}

// Products come from the featured `const P=[...]` list plus the compact `CAT` rows (brand index, optical flag,
// model, price, size, [[colour, stock]]) expanded the same way the page does; brands hidden on the site are not sold.
export function loadCatalog(html = readFileSync(findIndexHtml(), 'utf8')) {
  if (CATALOG && arguments.length === 0) return CATALOG;
  const m = html.match(/^const P=(\[.*\]);$/m), br = html.match(/const BR=(\[.*?\]);/), cr = html.match(/const CAT=(\[.*\]);$/m);
  if (!m || !br || !cr) throw new Error('Product list not found in index.html');
  const B = JSON.parse(br[1]);
  const rows = JSON.parse(cr[1]).map(r => ({ b: B[r[0]], n: r[2], p: r[3], z: r[4], t: [r[1] ? 'Optical' : 'Sunglasses'], k: r[5].map(c => ['', '', c[0], '', c[1]]) }));
  const hide = new Set((html.match(/const HIDE=new Set\(\[([^\]]*)\]\)/) || [, ''])[1].match(/'[^']*'/g)?.map(s => s.slice(1, -1)) || []);
  const list = JSON.parse(m[1]).concat(rows).filter(p => !hide.has(p.b));
  const cat = new Map(list.map(p => [p.b + '|' + p.n, p]));
  if (arguments.length === 0) CATALOG = cat;
  return cat;
}

export const env = k => (process.env[k] || '').trim();
export const jsonEnv = (k, d) => { try { return env(k) ? JSON.parse(env(k)) : d; } catch { return d; } };

// Recomputes the order from the catalogue: unit prices, stock, promo codes and delivery rules.
export function priceOrder(body, cat = loadCatalog()) {
  const errors = [];
  const items = (Array.isArray(body.items) ? body.items : []).slice(0, 20).map(x => {
    const p = cat.get(String(x.b) + '|' + String(x.n));
    const k = p && p.k.find(c => c[2] === String(x.col));
    const q = Math.max(1, Math.min(10, parseInt(x.q, 10) || 1));
    if (!p || !k) { errors.push('Item not found: ' + x.b + ' ' + x.n + ' ' + x.col); return null; }
    if (k[4] && q > k[4]) errors.push('Only ' + k[4] + ' left of ' + p.n + ' ' + k[2]);
    return { b: p.b, n: p.n, col: k[2], q, p: p.p, rx: p.t && p.t[0] === 'Optical' };
  }).filter(Boolean);
  if (!items.length) errors.push('Your bag is empty');
  const home = body.delivery === 'home';
  if (home && items.some(i => i.rx)) errors.push('Prescription frames are picked up from a branch');
  const sub = items.reduce((a, i) => a + i.p * i.q, 0);
  const rate = jsonEnv('PROMO_CODES', {})[String(body.promo || '').trim().toUpperCase()] || 0;
  const discount = Math.round(sub * rate);
  const fee = home ? (parseInt(env('DELIVERY_FEE'), 10) || 0) : 0;
  return { errors, items, sub, discount, fee, total: sub - discount + fee };
}

// Paymob "transaction processed" callback: the listed fields are concatenated in this order and signed with SHA-512.
const HMAC_KEYS = ['amount_cents', 'created_at', 'currency', 'error_occured', 'has_parent_transaction', 'id', 'integration_id',
  'is_3d_secure', 'is_auth', 'is_capture', 'is_refunded', 'is_standalone_payment', 'is_voided', 'order.id', 'owner', 'pending',
  'source_data.pan', 'source_data.sub_type', 'source_data.type', 'success'];
const pick = (o, path) => path.split('.').reduce((v, k) => (v == null ? v : v[k]), o);

export function verifyHmac(obj, hmac, secret = env('PAYMOB_HMAC_SECRET')) {
  if (!secret || !hmac || !obj) return false;
  const s = HMAC_KEYS.map(k => { const v = pick(obj, k); return v == null ? '' : String(v); }).join('');
  const mine = createHmac('sha512', secret).update(s).digest('hex');
  const a = Buffer.from(mine), b = Buffer.from(String(hmac).toLowerCase());
  return a.length === b.length && timingSafeEqual(a, b);
}

export const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
