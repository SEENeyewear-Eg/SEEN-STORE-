// POST /api/newsletter
//   {email, lang}                       subscribe: kept in KV (ORDERS, or ACCOUNTS) under "nl:<email in lower case>", once per address.
//   {action:'unsubscribe', email, token} unsubscribe: removes the address. Every subscriber gets a private token;
//   each newsletter e-mail must carry the link  https://www.seeneyeweareg.com/unsubscribe/?e=<email>&t=<token>
import { json } from '../_lib/store.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const token = () => [...crypto.getRandomValues(new Uint8Array(12))].map(b => b.toString(16).padStart(2, '0')).join('');

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: 'Bad request' }, 400); }
  const email = String(b.email ?? '').trim().toLowerCase().slice(0, 120);
  if (!EMAIL.test(email)) return json({ ok: false, error: 'Please enter a valid email address.' }, 400);
  const kv = env.ORDERS || env.ACCOUNTS;
  if (!kv) return json({ ok: false, error: 'Not available right now. Please try again later.' }, 503);
  const key = 'nl:' + email;

  if (b.action === 'unsubscribe') {
    const rec = await kv.get(key, { type: 'json' });
    if (!rec) return json({ ok: true, gone: true });
    if (!rec.token || String(b.token || '') !== rec.token) return json({ ok: false, error: 'Invalid link' }, 400);
    await kv.delete(key);
    return json({ ok: true });
  }

  if (await kv.get(key)) return json({ ok: true, already: true });
  await kv.put(key, JSON.stringify({ email, token: token(), lang: String(b.lang || 'en').slice(0, 5), created: new Date().toISOString(), source: 'website footer' }));
  return json({ ok: true });
}
