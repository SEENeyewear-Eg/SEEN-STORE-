// /api/account/{signup,login,logout,me} — customer accounts kept in Netlify Blobs (one record per mobile number).
// Passwords are stored as scrypt hashes; the session is an HttpOnly cookie signed with SESSION_SECRET.
// Points and order history come from the store system once it is connected.
import { getStore } from '@netlify/blobs';
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'node:crypto';
import { env, json } from '../lib/store.mjs';

const DAY = 864e5, LOCK = 15 * 60e3, MAX_FAILS = 5, COOKIE = 'seen_s';
const PHONE = /^01[0125]\d{8}$/, EMAIL = /^\S+@\S+\.\S+$/;

const hash = (pw, salt) => scryptSync(pw, salt, 64).toString('hex');
const sign = v => createHmac('sha256', env('SESSION_SECRET')).update(v).digest('hex');
const pub = u => ({ name: u.name, phone: u.phone, email: u.email || '', points: u.points || 0 });

function session(phone) {
  const v = phone + '.' + (Date.now() + 30 * DAY);
  return COOKIE + '=' + v + '.' + sign(v) + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=' + 30 * 86400;
}
function readSession(req) {
  const m = (req.headers.get('cookie') || '').match(new RegExp('(?:^|; )' + COOKIE + '=([^;]+)'));
  if (!m) return null;
  const [phone, exp, sig] = m[1].split('.');
  const want = sign(phone + '.' + exp);
  if (!sig || sig.length !== want.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(want)) || +exp < Date.now()) return null;
  return phone;
}
const withCookie = (data, cookie, status = 200) => {
  const r = json(data, status); r.headers.set('set-cookie', cookie); return r;
};

export default async req => {
  if (!env('SESSION_SECRET')) return json({ error: 'Accounts are not connected yet. Please try again later.' }, 503);
  const action = new URL(req.url).pathname.split('/').pop();
  const store = getStore({ name: 'accounts', consistency: 'strong' });

  if (action === 'me') {
    const phone = readSession(req), u = phone && await store.get(phone, { type: 'json' });
    return u ? json(pub(u)) : json({ error: 'Not signed in' }, 401);
  }
  if (action === 'logout') return withCookie({ ok: true }, COOKIE + '=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const b = await req.json().catch(() => ({}));
  const phone = String(b.phone || '').replace(/\s/g, ''), pw = String(b.password || '');
  if (!PHONE.test(phone)) return json({ error: 'Enter a valid Egyptian mobile number' }, 400);

  if (action === 'signup') {
    const name = String(b.name || '').trim().slice(0, 80), email = String(b.email || '').trim().slice(0, 120);
    if (!name) return json({ error: 'Enter your name' }, 400);
    if (email && !EMAIL.test(email)) return json({ error: 'Enter a valid email' }, 400);
    if (pw.length < 8) return json({ error: 'Use at least 8 characters for your password' }, 400);
    if (await store.get(phone)) return json({ error: 'An account with this mobile number already exists. Sign in instead.' }, 409);
    const salt = randomBytes(16).toString('hex');
    const u = { name, phone, email, salt, hash: hash(pw, salt), points: 0, created: new Date().toISOString(), fails: 0, until: 0 };
    await store.setJSON(phone, u);
    return withCookie(pub(u), session(phone), 201);
  }

  if (action === 'login') {
    const u = await store.get(phone, { type: 'json' });
    if (u && u.until > Date.now()) return json({ error: 'Too many attempts. Try again in a few minutes.' }, 429);
    const ok = u && timingSafeEqual(Buffer.from(hash(pw, u.salt)), Buffer.from(u.hash));
    if (!ok) {
      if (u) { u.fails = (u.fails || 0) + 1; if (u.fails >= MAX_FAILS) { u.until = Date.now() + LOCK; u.fails = 0; } await store.setJSON(phone, u); }
      return json({ error: 'Wrong mobile number or password' }, 401);
    }
    if (u.fails || u.until) { u.fails = 0; u.until = 0; await store.setJSON(phone, u); }
    return withCookie(pub(u), session(phone));
  }
  return json({ error: 'Not found' }, 404);
};

export const config = { path: ['/api/account/signup', '/api/account/login', '/api/account/logout', '/api/account/me'] };
