// Shared server-side helpers for checkout and the Paymob webhook (Cloudflare Pages Functions).
// The catalogue is read from index.html so prices are never taken from the browser, and Paymob
// callbacks are verified with HMAC-SHA512 (Web Crypto, no Node modules needed).

import { catalogFromSnapshot } from './catalog-kv.js';

let ENV = {};
export const setEnv = e => { ENV = e || {}; };
export const env = k => String(ENV[k] ?? '').trim();
export const jsonEnv = (k, d) => { try { return env(k) ? JSON.parse(env(k)) : d; } catch { return d; } };

export const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

// Products come from the featured `const P=[...]` list plus the compact `CAT` rows (brand index, optical flag,
// model, price, size, [[colour, stock]]) expanded the same way the page does; brands hidden on the site are not sold.
export function parseCatalog(raw) {
  const html = raw.replace(/\r\n/g, '\n');
  const m = html.match(/^const P=(\[.*\]);$/m), br = html.match(/const BR=(\[.*?\]);/), cr = html.match(/const CAT=(\[.*\]);$/m);
  if (!m || !br || !cr) throw new Error('Product list not found in index.html');
  const B = JSON.parse(br[1]);
  const rows = JSON.parse(cr[1]).map(r => ({ b: B[r[0]], n: r[2], p: r[3], z: r[4], t: [r[1] ? 'Optical' : 'Sunglasses'], k: r[5].map(c => ['', '', c[0], '', c[1]]) }));
  const hide = new Set((html.match(/const HIDE=new Set\(\[([^\]]*)\]\)/) || [, ''])[1].match(/'[^']*'/g)?.map(s => s.slice(1, -1)) || []);
  const list = JSON.parse(m[1]).concat(rows).filter(p => !hide.has(p.b));
  return new Map(list.map(p => [p.b + '|' + p.n, p]));
}

let CATALOG = null;
// Source of truth: the Shoof snapshot in KV (binding SHOOF). If there is no snapshot yet, falls back to the
// product list in index.html (empty after the test data was removed, so checkout rejects items until a sync runs).
export async function catalog(request, bindings) {
  if (CATALOG) return CATALOG;
  if (bindings && bindings.SHOOF) {
    const snap = await bindings.SHOOF.get('catalog', 'json').catch(() => null);
    if (snap) {
      CATALOG = catalogFromSnapshot(snap);
      return CATALOG;
    }
  }
  try {
    const url = new URL('/index.html', request.url);
    const res = bindings && bindings.ASSETS ? await bindings.ASSETS.fetch(url) : await fetch(url);
    CATALOG = parseCatalog(await res.text());
  } catch (e) {
    CATALOG = new Map();
  }
  return CATALOG;
}

// Recomputes the order from the catalogue: unit prices, stock, promo codes and delivery rules.
export function priceOrder(body, cat) {
  const errors = [];
  const items = (Array.isArray(body.items) ? body.items : []).slice(0, 20).map(x => {
    const p = cat.get(String(x.b) + '|' + String(x.n));
    const k = p && p.k.find(c => c[2] === String(x.col));
    const q = Math.max(1, Math.min(10, parseInt(x.q, 10) || 1));
    if (!p || !k) { errors.push('Item not found: ' + x.b + ' ' + x.n + ' ' + x.col); return null; }
    if (!p.p) { errors.push('Price not available for ' + p.n + ' yet'); return null; }
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

async function hmacSha512Hex(secret, message) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyHmac(obj, hmac, secret = env('PAYMOB_HMAC_SECRET')) {
  if (!secret || !hmac || !obj) return false;
  const s = HMAC_KEYS.map(k => { const v = pick(obj, k); return v == null ? '' : String(v); }).join('');
  const mine = await hmacSha512Hex(secret, s);
  const theirs = String(hmac).toLowerCase();
  if (mine.length !== theirs.length) return false;
  let diff = 0;
  for (let i = 0; i < mine.length; i++) diff |= mine.charCodeAt(i) ^ theirs.charCodeAt(i);
  return diff === 0;
}
