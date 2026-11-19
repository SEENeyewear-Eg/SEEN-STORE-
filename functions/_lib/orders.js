// Orders kept inside the site (Cloudflare KV), so a paid order is never lost even if an alert fails,
// and Paymob's repeated callbacks for the same payment are handled once.
// Binding: ORDERS if it is set, otherwise the ACCOUNTS namespace (keys start with "order:"). Orders are kept with no expiry.

const ns = bindings => (bindings && (bindings.ORDERS || bindings.ACCOUNTS)) || null;

export const ordersReady = bindings => Boolean(ns(bindings));

export async function getOrder(bindings, no) {
  const kv = ns(bindings);
  if (!kv || !no) return null;
  return kv.get('order:' + no, 'json').catch(() => null);
}

export async function saveOrder(bindings, order) {
  const kv = ns(bindings);
  if (!kv) throw new Error('Order storage not bound');
  order.updated = new Date().toISOString();
  await kv.put('order:' + order.no, JSON.stringify(order));
  return order;
}

// Orders are also listed under the customer's mobile number, so a signed-in customer sees them in My orders.
export async function linkOrder(bindings, phone, no) {
  const kv = ns(bindings);
  if (!kv || !phone || !no) return;
  const key = 'ordersby:' + phone;
  const list = (await kv.get(key, 'json').catch(() => null)) || [];
  if (!list.includes(no)) list.unshift(no);
  await kv.put(key, JSON.stringify(list.slice(0, 200)));
}

export async function ordersForPhone(bindings, phone) {
  const kv = ns(bindings);
  if (!kv || !phone) return [];
  const list = (await kv.get('ordersby:' + phone, 'json').catch(() => null)) || [];
  const out = [];
  for (const no of list.slice(0, 50)) {
    const o = await getOrder(bindings, no);
    if (o) out.push({ no: o.no, created: o.created, status: o.status || '', pay: o.pay || '', delivery: o.delivery || '', branch: o.branch || '',
      address: o.address || null, customer: { name: (o.customer && o.customer.name) || '', phone: (o.customer && o.customer.phone) || '', email: (o.customer && o.customer.email) || '' },
      items: (o.items || []).map(i => ({ brand: i.brand, model: i.model, colour: i.colour, qty: i.qty, price: i.price })),
      sub: o.sub || 0, discount: o.discount || 0, fee: o.fee || 0, total: o.total || 0, promo: o.promo || '' });
  }
  return out;
}
