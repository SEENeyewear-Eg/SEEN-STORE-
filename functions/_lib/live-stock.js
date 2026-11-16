// Live stock from Shoof for a few items, asked only when there is a reason: a shopper opens a product, or places an order.
// Nothing runs on a timer. Shoof allows 7 requests per 10 seconds per IP (the sync shares that), so product-page answers
// are kept 15 seconds and at most 4 product-page calls go out per 10 seconds; checkout always asks Shoof fresh.
import { shoofGet } from './shoof.js';
import { env } from './store.js';

const CACHE = new Map();
let window0 = 0, calls = 0;

// ids: Shoof item ids. Returns Map id -> quantity summed over all stores (0 when Shoof has no stock row for it).
export async function liveStock(ids, { fresh = false } = {}) {
  ids = [...new Set(ids.map(String).filter(x => /^\d+$/.test(x)))].slice(0, 100);
  const out = new Map(ids.map(id => [id, 0]));
  if (!ids.length) return out;
  const key = ids.slice().sort().join(',');
  const hit = CACHE.get(key);
  if (!fresh && hit && hit.until > Date.now()) return hit.data;
  if (!fresh) {
    if (Date.now() - window0 > 10000) { window0 = Date.now(); calls = 0; }
    if (++calls > 4) throw new Error('busy');
  }
  const d = await shoofGet('/inventory/stock', {
    company_id: env('SHOOF_COMPANY_ID'), item_id: ids.join(','), modified_from: '2000-01-01', limit: 500,
  });
  for (const s of Array.isArray(d.items) ? d.items : []) {
    const id = String(s.item_id);
    if (out.has(id)) out.set(id, out.get(id) + (Number(s.stock) || 0));
  }
  if (CACHE.size > 1000) CACHE.clear();
  CACHE.set(key, { until: Date.now() + 15000, data: out });
  return out;
}
