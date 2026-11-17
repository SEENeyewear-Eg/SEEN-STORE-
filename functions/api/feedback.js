// POST /api/feedback: a rating of the website and a suggestion from a visitor.
// Stored in KV (ORDERS, or ACCOUNTS if ORDERS is not set) under keys "fb:<time>-<random>", no expiry.
import { json } from '../_lib/store.js';

const clean = (v, n) => String(v ?? '').trim().slice(0, n);
const EMAIL = /^\S+@\S+\.\S+$/;
const PHONE = /^\+?\d{7,15}$/;

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: 'Bad request' }, 400); }

  const d = {
    rating: Math.round(Number(b.rating)),
    name: clean(b.name, 80),
    email: clean(b.email, 120),
    phone: clean(b.phone, 20).replace(/[\s-]/g, ''),
    msg: clean(b.msg, 1000),
  };
  if (!(d.rating >= 1 && d.rating <= 5) || d.name.length < 2 || !EMAIL.test(d.email) || !PHONE.test(d.phone)) {
    return json({ ok: false, error: 'Please check the rating, name, email and phone.' }, 400);
  }

  const kv = env.ORDERS || env.ACCOUNTS;
  if (!kv) return json({ ok: false, error: 'Not available right now. Please message us on WhatsApp.' }, 503);

  const id = 'fb:' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  await kv.put(id, JSON.stringify({ ...d, created: new Date().toISOString(), source: 'website' }));
  return json({ ok: true });
}
