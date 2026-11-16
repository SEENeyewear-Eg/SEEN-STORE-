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
