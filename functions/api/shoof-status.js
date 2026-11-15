// GET /api/shoof-status — whether the Shoof link works: last sync time, row counts and the field names
// Shoof returns (names only, never values). POST with header x-admin-token runs a sync now.
// Ported from netlify/functions/shoof-status.mjs. The snapshot lives in KV (binding SHOOF, key "catalog").
import { setEnv, env, json } from '../_lib/store.js';
import { shoofReady, shoofAll } from '../_lib/shoof.js';

const fields = rows => (rows && rows[0] ? Object.keys(rows[0]) : []);

// Pulls products, stores and stock from Shoof and saves one snapshot in KV.
export async function syncShoof(bindings) {
  if (!shoofReady()) return { ok: false, error: 'Shoof keys are not set yet' };
  if (!bindings.SHOOF) return { ok: false, error: 'KV binding SHOOF is not set' };
  const [products, stores] = await Promise.all([
    shoofAll('/masterdata/products'),
    shoofAll('/masterdata/stores'),
  ]);
  // Stock is optional for now: it needs company_id (SHOOF_COMPANY_ID). Products and stores are saved either way.
  // Stock is off until SHOOF_COMPANY_ID is set: the stock API refuses calls without it.
  let stock = [], stockError = null;
  if (env('SHOOF_COMPANY_ID')) {
    try {
      stock = await shoofAll('/inventory/stock', { company_id: env('SHOOF_COMPANY_ID') });
    } catch (e) {
      stockError = e.message;
    }
  }
  // Prices come from their own endpoint (current product prices). Pulled one call at a time: Shoof limits to 7 requests per 10 seconds.
  // If the prices endpoint is not available, the sync still saves products and stores (prices stay empty).
  // Try the price routes one after another and record each answer, so we can see which one Shoof accepts.
  const company = env('SHOOF_COMPANY_ID');
  const variants = [
    ['/masterdata/products/prices', company ? { company_id: company } : {}],
    ['/masterdata/products/prices', {}],
    ['/masterdata/prices', company ? { company_id: company } : {}],
    ['/masterdata/product-prices', company ? { company_id: company } : {}],
  ];
  let prices = [], pricesError = null;
  const priceAttempts = [];
  for (const [path, params] of variants) {
    try {
      const rows = await shoofAll(path, params);
      priceAttempts.push({ path, params: Object.keys(params), ok: true, rows: rows.length });
      if (rows.length && !prices.length) prices = rows;
      if (prices.length) break;
    } catch (e) {
      priceAttempts.push({ path, params: Object.keys(params), ok: false, error: e.message });
      pricesError = e.message;
    }
  }
  const snap = { at: new Date().toISOString(), products, stores, stock, prices };
  await bindings.SHOOF.put('catalog', JSON.stringify(snap));
  return { ok: true, at: snap.at, products: products.length, stores: stores.length, stock: stock.length, stockError, prices: prices.length, pricesError, priceAttempts };
}

export async function onRequest({ request, env: bindings }) {
  setEnv(bindings);
  if (request.method === 'POST') {
    if (!env('ADMIN_TOKEN') || request.headers.get('x-admin-token') !== env('ADMIN_TOKEN')) return json({ error: 'Not allowed' }, 403);
    try { return json(await syncShoof(bindings)); } catch (e) { return json({ ok: false, error: e.message }, 502); }
  }
  const snap = bindings.SHOOF ? await bindings.SHOOF.get('catalog', 'json').catch(() => null) : null;
  return json({
    keysSet: shoofReady(),
    lastSync: snap ? snap.at : null,
    counts: snap ? { products: snap.products.length, stores: snap.stores.length, stock: snap.stock.length } : null,
    fields: snap ? { products: fields(snap.products), stores: fields(snap.stores), stock: fields(snap.stock) } : null
  });
}
