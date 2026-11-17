// Product reviews kept on this site (not on Google).
// A customer can review a product they bought, only through a link the team issues for that order and product.
// The link carries a signature made with REVIEW_SECRET, so nobody can review an order they did not get a link for.
// New reviews stay "pending" until the owner approves them (admin token, same as shoof-status).
// Storage: KV (ORDERS, or ACCOUNTS if ORDERS is not set). Keys: rv:<product>:<id>, rvd:<order>:<product>.
import { json, env as envOf, setEnv } from '../_lib/store.js';

const enc = new TextEncoder();
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');

async function sign(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
}

const kvOf = env => env.ORDERS || env.ACCOUNTS || null;
const pkeyOf = (brand, model) => encodeURIComponent(String(brand) + '|' + String(model));
const isAdmin = (request, env) => Boolean(envOf('ADMIN_TOKEN')) && request.headers.get('x-admin-token') === envOf('ADMIN_TOKEN');

async function listAll(kv, prefix) {
  const out = [];
  let cursor;
  do {
    const r = await kv.list({ prefix, cursor });
    for (const k of r.keys) {
      const v = await kv.get(k.name, 'json').catch(() => null);
      if (v) out.push(v);
    }
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor);
  return out;
}

export async function onRequestGet({ request, env }) {
  setEnv(env);
  const url = new URL(request.url);
  const kv = kvOf(env);
  if (!kv) return json({ count: 0, avg: null, items: [] });

  if (url.searchParams.get('admin') === '1') {
    if (!isAdmin(request, env)) return json({ error: 'Not allowed' }, 403);
    const all = await listAll(kv, 'rv:');
    return json({ pending: all.filter(r => r.status === 'pending').sort((a, b) => b.date.localeCompare(a.date)) });
  }

  const p = url.searchParams.get('p');
  if (!p) return json({ error: 'Missing product' }, 400);
  const mine = (await listAll(kv, 'rv:' + p + ':')).filter(r => r.status === 'approved');
  const count = mine.length;
  const avg = count ? Math.round((mine.reduce((a, r) => a + r.rating, 0) / count) * 10) / 10 : null;
  const items = mine.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10).map(r => ({ rating: r.rating, text: r.text, name: r.name, date: r.date }));
  return new Response(JSON.stringify({ count, avg, items }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=120' } });
}

export async function onRequestPost({ request, env }) {
  setEnv(env);
  let b;
  try { b = await request.json(); } catch { return json({ error: 'Bad request' }, 400); }
  const kv = kvOf(env);
  if (!kv) return json({ error: 'Reviews are not available right now.' }, 503);

  // Owner actions: approve / reject, and issue a review link for an order.
  if (b.action === 'decide' || b.action === 'link') {
    if (!isAdmin(request, env)) return json({ error: 'Not allowed' }, 403);
    if (b.action === 'link') {
      const o = String(b.o || '').trim(), p = String(b.p || '').trim();
      if (!o || !p || !envOf('REVIEW_SECRET')) return json({ error: 'Missing order, product, or REVIEW_SECRET' }, 400);
      const t = await sign(envOf('REVIEW_SECRET'), o + '|' + p);
      return json({ url: '/review.html?o=' + encodeURIComponent(o) + '&p=' + encodeURIComponent(p) + '&t=' + t });
    }
    const r = await kv.get(String(b.id), 'json').catch(() => null);
    if (!r) return json({ error: 'Not found' }, 404);
    r.status = b.approve ? 'approved' : 'rejected';
    await kv.put(String(b.id), JSON.stringify(r));
    return json({ ok: true, status: r.status });
  }

  // Customer submits a review through a signed link.
  if (b.action !== 'submit') return json({ error: 'Unknown action' }, 400);
  if (!envOf('REVIEW_SECRET')) return json({ error: 'Reviews are not set up yet.' }, 503);
  const o = String(b.o || '').trim(), p = String(b.p || '').trim(), t = String(b.t || '');
  const expect = await sign(envOf('REVIEW_SECRET'), o + '|' + p);
  if (!o || !p || t !== expect) return json({ error: 'This review link is not valid.' }, 403);

  const rating = Math.round(Number(b.rating));
  if (!(rating >= 1 && rating <= 5)) return json({ error: 'Please choose a rating from 1 to 5.' }, 400);
  const text = String(b.text || '').trim().slice(0, 500);
  const name = String(b.name || '').trim().slice(0, 40) || 'SEEN customer';

  const order = await kv.get('order:' + o, 'json').catch(() => null);
  const dec = decodeURIComponent(p).split('|');
  const bought = order && Array.isArray(order.items) && order.items.some(i => String(i.brand) === dec[0] && String(i.model) === dec[1]);
  if (!bought) return json({ error: 'We could not find this product in that order.' }, 400);
  if (await kv.get('rvd:' + o + ':' + p)) return json({ error: 'You already reviewed this product.' }, 409);

  const id = 'rv:' + p + ':' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  const date = new Date().toISOString().slice(0, 10);
  await kv.put(id, JSON.stringify({ id, p, o, rating, text, name, status: 'pending', date }));
  await kv.put('rvd:' + o + ':' + p, '1');
  return json({ ok: true, message: 'Thank you. Your review will show after it is checked.' });
}
