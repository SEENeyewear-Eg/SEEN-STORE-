// POST /api/paymob-webhook — Paymob's "transaction processed" callback. After the HMAC checks out, the order saved at
// checkout is marked paid (or failed). A payment is handled once: Paymob may send the same callback again, and a repeat
// of an already-paid order does nothing. The first time an order is paid, it goes to ORDER_WEBHOOK_URL
// (the orders sheet + emails script), which alerts the team and the customer.
import { setEnv, env, json, verifyHmac } from '../_lib/store.js';
import { getOrder, saveOrder } from '../_lib/orders.js';

export async function onRequestPost({ request, env: bindings }) {
  setEnv(bindings);
  const hmac = new URL(request.url).searchParams.get('hmac');
  const body = await request.json().catch(() => null);
  const t = body && body.obj;
  if (!t || !(await verifyHmac(t, hmac))) return json({ error: 'Invalid signature' }, 401);

  const paid = t.success === true && t.pending === false;
  const no = String(t.order?.merchant_order_id || t.payment_key_claims?.extra?.special_reference || '');
  const pay = {
    paymobTransaction: t.id, paymobOrder: t.order?.id, amount: (t.amount_cents || 0) / 100, currency: t.currency,
    method: t.source_data?.type + (t.source_data?.sub_type ? ' / ' + t.source_data.sub_type : ''), at: t.created_at,
  };

  const order = await getOrder(bindings, no);
  if (!order) {
    // Paid but no saved order (should not happen): log it so it can be found, and still alert the team.
    console.error('Paymob callback for unknown order', no, JSON.stringify(pay));
    if (paid) await alert({ no, status: 'paid', unknown: true, payment: pay });
    return json({ ok: true });
  }
  if (order.status === 'paid') return json({ ok: true, repeat: true });

  if (!paid) {
    order.status = 'failed';
    order.lastFailure = pay;
    await saveOrder(bindings, order);
    return json({ ok: true });
  }

  order.status = 'paid';
  order.paidAt = new Date().toISOString();
  order.payment = pay;
  // The amount paid must match the order total worked out at checkout; a mismatch is flagged for the team.
  if (Math.round(pay.amount * 100) !== Math.round(order.total * 100)) order.amountMismatch = true;
  await saveOrder(bindings, order);
  await alert(order);
  return json({ ok: true });
}

async function alert(order) {
  if (!env('ORDER_WEBHOOK_URL')) return;
  try {
    await fetch(env('ORDER_WEBHOOK_URL'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env('ORDER_WEBHOOK_SECRET'), order }),
    });
  } catch (e) { console.error('Order alert failed', order.no, e); }
}
