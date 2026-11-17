// POST /api/contact: a message from the Contact us form.
// Stored in KV (ORDERS, or ACCOUNTS if ORDERS is not set) under keys "ct:<time>-<random>", no expiry.
import { json } from '../_lib/store.js';

const clean = (v, n) => String(v ?? '').trim().slice(0, n);
const EMAIL = /^\S+@\S+\.\S+$/;
const PHONE = /^\+\d{7,16}$/;
const INQUIRY = [
  'General question',
  'Book an eye examination',
  'Book a visit or hotel pick-up',
  'Frame advice and face shape',
  'Prescription lenses',
  'Order status',
  'Warranty or exchange',
  'Complaint',
  'Suggestion',
  'Other',
];

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: 'Bad request' }, 400); }

  const d = {
    first: clean(b.first, 60),
    last: clean(b.last, 60),
    email: clean(b.email, 120),
    phone: clean(b.phone, 20).replace(/[\s-]/g, ''),
    inquiry: clean(b.inquiry, 80),
    country: clean(b.country, 60),
    msg: clean(b.msg, 2000),
  };
  if (d.first.length < 2 || !EMAIL.test(d.email) || !PHONE.test(d.phone) || !(INQUIRY.includes(d.inquiry) || /^Other: .{2,80}$/.test(d.inquiry)) || d.msg.length < 5) {
    return json({ ok: false, error: 'Please check the form.' }, 400);
  }

  const kv = env.ORDERS || env.ACCOUNTS;
  if (!kv) return json({ ok: false, error: 'Not available right now. Please message us on WhatsApp.' }, 503);

  const id = 'ct:' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  await kv.put(id, JSON.stringify({ ...d, created: new Date().toISOString(), source: 'website' }));
  return json({ ok: true });
}
