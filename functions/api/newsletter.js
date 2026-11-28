// POST /api/newsletter: an e-mail address from the newsletter box in the home page footer.
// Stored in KV (ORDERS, or ACCOUNTS if ORDERS is not set) under "nl:<email in lower case>", so one address is kept once. No expiry.
import { json } from '../_lib/store.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: 'Bad request' }, 400); }
  const email = String(b.email ?? '').trim().toLowerCase().slice(0, 120);
  if (!EMAIL.test(email)) return json({ ok: false, error: 'Please enter a valid email address.' }, 400);

  const kv = env.ORDERS || env.ACCOUNTS;
  if (!kv) return json({ ok: false, error: 'Not available right now. Please try again later.' }, 503);

  const key = 'nl:' + email;
  if (await kv.get(key)) return json({ ok: true, already: true });
  await kv.put(key, JSON.stringify({ email, lang: String(b.lang || 'en').slice(0, 5), created: new Date().toISOString(), source: 'website footer' }));
  return json({ ok: true });
}
