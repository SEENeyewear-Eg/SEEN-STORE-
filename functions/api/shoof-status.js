// GET /api/shoof-status — whether the Shoof link works: last sync time, row counts and the field names
// Shoof returns (names only, never values). POST with header x-admin-token runs a sync now.
// Ported from netlify/functions/shoof-status.mjs. The snapshot lives in KV (binding SHOOF, key "catalog").
import { setEnv, env, json } from '../_lib/store.js';
import { shoofReady, shoofAll } from '../_lib/shoof.js';
import { isAllowedItem } from '../_lib/catalog-kv.js';

const fields = rows => (rows && rows[0] ? Object.keys(rows[0]) : []);

// Pulls products, stores and stock from Shoof and saves one snapshot in KV.
export async function syncShoof(bindings) {
  if (!shoofReady()) return { ok: false, error: 'Shoof keys are not set yet' };
  if (!bindings.SHOOF) return { ok: false, error: 'KV binding SHOOF is not set' };
  // Without a date, Shoof returns only products created in the last month. created_from far back = the whole catalogue.
  // One call at a time (not in parallel) to stay under Shoof's 7 requests per 10 seconds.
  const products = await shoofAll('/masterdata/products', { created_from: '2000-01-01' });
  const stores = await shoofAll('/masterdata/stores');
  // Stock is optional for now: it needs company_id (SHOOF_COMPANY_ID). Products and stores are saved either way.
  // Stock is off until SHOOF_COMPANY_ID is set: the stock API refuses calls without it.
  let stock = [], stockError = null;
  if (env('SHOOF_COMPANY_ID')) {
    try {
      // modified_from far back switches off Shoof's default date window, so every stock row comes back.
      stock = await shoofAll('/inventory/stock', { company_id: env('SHOOF_COMPANY_ID'), modified_from: '2000-01-01' });
    } catch (e) {
      stockError = e.message;
    }
  }
  // The stock list decides what the site sells, so a failed stock pull must not empty the shop:
  // keep the stock rows from the last good sync and say so in the answer.
  let stockKept = false;
  if (stockError || !stock.length) {
    const prev = await bindings.SHOOF.get('catalog', 'json').catch(() => null);
    if (prev && Array.isArray(prev.stock) && prev.stock.length) { stock = prev.stock; stockKept = true; }
  }
  // Prices come from their own endpoint (current product prices). Pulled one call at a time: Shoof limits to 7 requests per 10 seconds.
  // If the prices endpoint is not available, the sync still saves products and stores (prices stay empty).
  // Try the price routes one after another and record each answer, so we can see which one Shoof accepts.
  const company = env('SHOOF_COMPANY_ID');
  // Only the documented route (the guessed ones all answered 404). It answers 404 until Shoof publishes it.
  const variants = [
    ['/masterdata/products/prices', {}],
  ];
  let prices = [], pricesError = null;
  const priceAttempts = [];
  const pause = ms => new Promise(r => setTimeout(r, ms));
  for (const [path, params] of variants) {
    // Shoof allows 7 requests per 10 seconds per IP: wait before each price call, and retry once on 429.
    await pause(2500);
    try {
      let rows;
      try {
        rows = await shoofAll(path, params);
      } catch (e) {
        if (!String(e.message).includes('429')) throw e;
        await pause(5000);
        rows = await shoofAll(path, params);
      }
      priceAttempts.push({ path, params: Object.keys(params), ok: true, rows: rows.length });
      if (rows.length && !prices.length) prices = rows;
      if (prices.length) break;
    } catch (e) {
      priceAttempts.push({ path, params: Object.keys(params), ok: false, error: e.message });
      pricesError = e.message;
    }
  }
  // Copies are removed before anything is saved: only originals (…-SUN-ORG / …-OPT-ORG) and other types are kept.
  // The answer gives counts only, never names of removed items.
  const keptProducts = products.filter(isAllowedItem), keptStock = stock.filter(isAllowedItem), keptPrices = prices.filter(isAllowedItem);
  const removed = { products: products.length - keptProducts.length, stock: stock.length - keptStock.length };
  const snap = { at: new Date().toISOString(), products: keptProducts, stores, stock: keptStock, prices: keptPrices };
  await bindings.SHOOF.put('catalog', JSON.stringify(snap));
  return { ok: true, at: snap.at, products: keptProducts.length, stores: stores.length, stock: keptStock.length, copiesRemoved: removed, stockError, stockKept, prices: keptPrices.length, pricesError, priceAttempts };
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
