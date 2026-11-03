// GET /api/shoof-status — whether the Shoof link works: last sync time, row counts and the field names
// Shoof returns (names only, never values). POST with header x-admin-token runs a sync now.
import { getStore } from '@netlify/blobs';
import { env, json } from '../lib/store.mjs';
import { shoofReady } from '../lib/shoof.mjs';
import { syncShoof } from './shoof-sync.mjs';

const fields = rows => (rows && rows[0] ? Object.keys(rows[0]) : []);

export default async req => {
  if (req.method === 'POST') {
    if (!env('ADMIN_TOKEN') || req.headers.get('x-admin-token') !== env('ADMIN_TOKEN')) return json({ error: 'Not allowed' }, 403);
    try { return json(await syncShoof()); } catch (e) { return json({ ok: false, error: e.message }, 502); }
  }
  const snap = await getStore({ name: 'shoof', consistency: 'strong' }).get('catalog', { type: 'json' }).catch(() => null);
  return json({
    keysSet: shoofReady(),
    lastSync: snap ? snap.at : null,
    counts: snap ? { products: snap.products.length, stores: snap.stores.length, stock: snap.stock.length } : null,
    fields: snap ? { products: fields(snap.products), stores: fields(snap.stores), stock: fields(snap.stock) } : null
  });
};

export const config = { path: '/api/shoof-status' };
