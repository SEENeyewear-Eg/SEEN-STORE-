// POST /api/checkout — validates the order against the catalogue, creates a Paymob intention
// and returns the Unified Checkout URL the shopper is sent to.
import { priceOrder, env, jsonEnv, json } from '../lib/store.mjs';

const PAYMOB = 'https://accept.paymob.com';
const BRANCHES = ['City Center Mall — Hurghada', 'El Gouna — Sheraton Miramar', 'El Kawthar — Hurghada'];

export default async req => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ error: 'Invalid request' }, 400); }

  const c = body.customer || {}, name = String(c.name || '').trim().slice(0, 80), phone = String(c.phone || '').replace(/\s/g, '');
  const email = /^\S+@\S+\.\S+$/.test(c.email || '') ? c.email.trim() : '';
  if (!name || !/^01[0125]\d{8}$/.test(phone)) return json({ error: 'Please check your name and mobile number' }, 400);
  if (body.delivery === 'home' && !(body.gov && String(body.city || '').trim() && String(body.addr || '').trim()))
    return json({ error: 'Please complete your delivery address' }, 400);

  const o = priceOrder(body);
  if (o.errors.length) return json({ error: o.errors[0] }, 400);

  const methods = jsonEnv('PAYMOB_INTEGRATIONS', {})[body.pay];
  if (!env('PAYMOB_SECRET_KEY') || !env('PAYMOB_PUBLIC_KEY') || !methods || !methods.length)
    return json({ error: 'Online payment is not connected yet. Please try again later.' }, 503);

  const site = (env('SITE_URL') || new URL(req.url).origin).replace(/\/$/, '');
  const no = 'SEEN-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
  const [first, ...rest] = name.split(/\s+/);
  const items = o.items.map(i => ({ name: (i.b + ' ' + i.n).slice(0, 50), amount: i.p * 100, quantity: i.q, description: 'Color ' + i.col }));
  if (o.fee) items.push({ name: 'Home delivery', amount: o.fee * 100, quantity: 1, description: String(body.gov) });
  // Paymob expects the item lines to add up to the amount, so with a promo discount the order is sent as a single line.
  const amount = o.total * 100;
  const payload = {
    amount, currency: 'EGP', payment_methods: methods, special_reference: no,
    items: o.discount ? [{ name: 'SEEN order ' + no, amount, quantity: 1, description: o.items.map(i => i.n + ' x' + i.q).join(', ').slice(0, 250) }] : items,
    billing_data: {
      first_name: first, last_name: rest.join(' ') || first, phone_number: '+2' + phone, email: email || 'customer@example.com',
      street: body.delivery === 'home' ? String(body.addr).slice(0, 120) : 'NA', city: body.delivery === 'home' ? String(body.city).slice(0, 60) : 'Hurghada',
      state: body.delivery === 'home' ? String(body.gov) : 'Red Sea', country: 'EG', apartment: 'NA', floor: 'NA', building: 'NA'
    },
    extras: { delivery: body.delivery === 'home' ? 'home' : 'pickup', branch: BRANCHES[+body.branch] || BRANCHES[0], pay: body.pay, promo: o.discount ? String(body.promo).toUpperCase() : '' },
    notification_url: site + '/api/paymob-webhook',
    redirection_url: site + '/?order=' + no
  };

  const r = await fetch(PAYMOB + '/v1/intention/', {
    method: 'POST', headers: { Authorization: 'Token ' + env('PAYMOB_SECRET_KEY'), 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.client_secret) {
    console.error('Paymob intention failed', r.status, JSON.stringify(d).slice(0, 500));
    return json({ error: 'Could not start the payment. Please try again.' }, 502);
  }
  return json({ order: no, total: o.total, url: PAYMOB + '/unifiedcheckout/?publicKey=' + encodeURIComponent(env('PAYMOB_PUBLIC_KEY')) + '&clientSecret=' + encodeURIComponent(d.client_secret) });
};

export const config = { path: '/api/checkout' };
