// GET /api/catalog — the product list for the storefront, built from the Shoof snapshot in KV (binding SHOOF).
// Returns [] when there is no snapshot yet, so the page simply shows no products until a sync runs.
import { setEnv, json } from '../_lib/store.js';
import { appProducts } from '../_lib/catalog-kv.js';

export async function onRequestGet({ request, env: bindings }) {
  setEnv(bindings);
  const snap = bindings.SHOOF ? await bindings.SHOOF.get('catalog', 'json').catch(() => null) : null;
  const list = snap ? appProducts(snap) : [];
  // Diagnostics (no prices, no secrets): what the snapshot holds and the first raw product's field names.
  if (new URL(request.url).searchParams.get('debug') === '1') {
    const first = snap && Array.isArray(snap.products) && snap.products[0];
    return json({
      hasSnapshot: Boolean(snap),
      rawProducts: snap && Array.isArray(snap.products) ? snap.products.length : null,
      mappedProducts: list.length,
      firstProductKeys: first ? Object.keys(first) : null,
      firstAttributeKeys: first && first.attributes ? Object.keys(first.attributes) : null,
    });
  }
  return new Response(JSON.stringify(list), {
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' },
  });
}
