// GET /api/stock?ids=12,34 — live stock from Shoof for the colours of the product a shopper just opened.
// Answers {stock: {id: qty}}. If Shoof can't be asked right now (busy or down) it answers 503 and the page keeps the last synced stock.
import { setEnv, json, catalog } from '../_lib/store.js';
import { shoofReady } from '../_lib/shoof.js';
import { liveStock } from '../_lib/live-stock.js';

export async function onRequestGet({ request, env: bindings }) {
  setEnv(bindings);
  const asked = (new URL(request.url).searchParams.get('ids') || '').split(',').filter(x => /^\d+$/.test(x)).slice(0, 100);
  if (!asked.length) return json({ error: 'ids required' }, 400);
  if (!shoofReady()) return json({ error: 'Shoof not connected' }, 503);
  // Only items the store actually sells, so the endpoint can't be used to read the rest of Shoof.
  const known = new Set();
  for (const p of (await catalog(request, bindings)).values()) for (const k of p.k) for (const id of k[5] || []) known.add(String(id));
  const ids = asked.filter(id => known.has(id));
  if (!ids.length) return json({ stock: {} });
  try {
    const m = await liveStock(ids);
    return new Response(JSON.stringify({ stock: Object.fromEntries(m) }), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  } catch (e) {
    return json({ error: 'Live stock not available right now' }, 503);
  }
}
