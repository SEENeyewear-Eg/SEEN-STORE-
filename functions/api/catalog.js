// GET /api/catalog — the product list for the storefront, built from the Shoof snapshot in KV (binding SHOOF).
// Returns [] when there is no snapshot yet, so the page simply shows no products until a sync runs.
import { setEnv, json } from '../_lib/store.js';
import { appProducts, isAllowedItem } from '../_lib/catalog-kv.js';

export async function onRequestGet({ request, env: bindings }) {
  setEnv(bindings);
  const raw = bindings.SHOOF ? await bindings.SHOOF.get('catalog', 'json').catch(() => null) : null;
  // Copies (sunglasses/optical not ending SUN-ORG / OPT-ORG) are removed here too, so no endpoint ever shows them,
  // even from a snapshot saved before the sync started dropping them.
  const snap = raw && {
    ...raw,
    products: (raw.products || []).filter(isAllowedItem),
    stock: (raw.stock || []).filter(isAllowedItem),
    prices: (raw.prices || []).filter(isAllowedItem),
  };
  const list = snap ? appProducts(snap) : [];
  // Filter values taken from the real Shoof data: every distinct value of each attribute, with how many products have it.
  if (new URL(request.url).searchParams.get('facets') === '1') {
    const facets = {};
    for (const p of snap && Array.isArray(snap.products) ? snap.products : []) {
      // Product type (type_name) counted too, to check how products split into sunglasses, optical and others.
      const ty = facets.TYPE_NAME || (facets.TYPE_NAME = {});
      ty[p.type_name || '(none)'] = (ty[p.type_name || '(none)'] || 0) + 1;
      for (const a of Array.isArray(p.attributes) ? p.attributes : []) {
        if (!a || !a.att_canon || a.att_val == null || a.att_val === '') continue;
        const f = facets[a.att_canon] || (facets[a.att_canon] = {});
        f[a.att_val] = (f[a.att_val] || 0) + 1;
      }
    }
    return json(facets);
  }
  // Brands as the stock (balance) list writes them: per type_name, each brand with its number of stock rows and total quantity.
  // No prices. Used to build the store's brand list from the balance only.
  if (new URL(request.url).searchParams.get('stockbrands') === '1') {
    // Also grouped by the end of the item name (SUN-ORG, OPT-ORG, or other types' endings). Copies are already removed above.
    const out = {}, bySuffix = {};
    for (const s of snap && Array.isArray(snap.stock) ? snap.stock : []) {
      const t = s.type_name || '(none)', b = String(s.brand || '(none)').trim();
      const g = out[t] || (out[t] = {});
      const e = g[b] || (g[b] = { rows: 0, qty: 0 });
      e.rows++;
      e.qty += Number(s.stock) || 0;
      const parts = String(s.name || '').toUpperCase().trim().split('-');
      const suf = parts.length >= 2 ? parts.slice(-2).join('-') : '(none)';
      const h = bySuffix[suf] || (bySuffix[suf] = { rows: 0, qty: 0, brands: {} });
      h.rows++;
      h.qty += Number(s.stock) || 0;
      h.brands[b] = (h.brands[b] || 0) + (Number(s.stock) || 0);
    }
    return json({ fields: snap && snap.stock && snap.stock[0] ? Object.keys(snap.stock[0]) : [], types: out, bySuffix });
  }
  // Diagnostics (no prices, no secrets): what the snapshot holds and the first raw product's field names.
  if (new URL(request.url).searchParams.get('debug') === '1') {
    const first = snap && Array.isArray(snap.products) && snap.products[0];
    return json({
      hasSnapshot: Boolean(snap),
      rawProducts: snap && Array.isArray(snap.products) ? snap.products.length : null,
      mappedProducts: list.length,
      firstProductKeys: first ? Object.keys(first) : null,
      firstAttributeKeys: first && first.attributes ? Object.keys(first.attributes) : null,
      attributeSample: first && Array.isArray(first.attributes) ? first.attributes.map(e => [e && e.att_canon, e && e.att_name, e && e.att_val]) : null,
    });
  }
  return new Response(JSON.stringify(list), {
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' },
  });
}
