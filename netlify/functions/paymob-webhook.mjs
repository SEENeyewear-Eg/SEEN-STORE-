// POST /api/paymob-webhook — Paymob's "transaction processed" callback. After the HMAC checks out,
// a paid order is forwarded to ORDER_WEBHOOK_URL (Google Sheets script, Zapier/Make, Slack…) if one is set.
import { verifyHmac, env, json } from '../lib/store.mjs';

export default async req => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const hmac = new URL(req.url).searchParams.get('hmac');
  const body = await req.json().catch(() => null);
  const t = body && body.obj;
  if (!t || !verifyHmac(t, hmac)) return json({ error: 'Invalid signature' }, 401);

  const paid = t.success === true && t.pending === false;
  const claims = t.payment_key_claims || {}, bill = claims.billing_data || t.order?.shipping_data || {};
  const order = {
    order: t.order?.merchant_order_id || '', paid, paymob_transaction: t.id, paymob_order: t.order?.id,
    amount: (t.amount_cents || 0) / 100, currency: t.currency, method: t.source_data?.type + (t.source_data?.sub_type ? ' / ' + t.source_data.sub_type : ''),
    customer: [bill.first_name, bill.last_name].filter(Boolean).join(' '), phone: bill.phone_number, email: bill.email,
    delivery: claims.extra?.delivery, branch: claims.extra?.branch, address: [bill.street, bill.city, bill.state].filter(x => x && x !== 'NA').join(', '),
    items: (t.order?.items || []).map(i => i.name + ' · ' + (i.description || '') + ' × ' + i.quantity).join(' | '),
    time: t.created_at
  };
  console.log('Paymob transaction', JSON.stringify(order));

  if (paid && env('ORDER_WEBHOOK_URL')) {
    try {
      await fetch(env('ORDER_WEBHOOK_URL'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) });
    } catch (e) { console.error('Order forward failed', e); }
  }
  return json({ ok: true });
};

export const config = { path: '/api/paymob-webhook' };
