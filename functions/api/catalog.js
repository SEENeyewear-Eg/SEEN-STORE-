// GET /api/catalog — the product list for the storefront, built from the Shoof snapshot in KV (binding SHOOF).
// Returns [] when there is no snapshot yet, so the page simply shows no products until a sync runs.
import { setEnv, json } from '../_lib/store.js';
import { appProducts } from '../_lib/catalog-kv.js';

export async function onRequestGet({ env: bindings }) {
  setEnv(bindings);
  const snap = bindings.SHOOF ? await bindings.SHOOF.get('catalog', 'json').catch(() => null) : null;
  const list = snap ? appProducts(snap) : [];
  return new Response(JSON.stringify(list), {
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' },
  });
}
