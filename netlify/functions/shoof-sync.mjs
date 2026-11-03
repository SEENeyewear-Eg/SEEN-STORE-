// Hourly copy of Shoof POS products, branches and stock into the site's store, so pages never wait on the POS.
import { getStore } from '@netlify/blobs';
import { shoofReady, shoofAll } from '../lib/shoof.mjs';

export async function syncShoof() {
  if (!shoofReady()) return { ok: false, error: 'Shoof keys are not set in Netlify yet' };
  const [products, stores, stock] = await Promise.all([
    shoofAll('/masterdata/products', { is_active: 'Y' }),
    shoofAll('/masterdata/stores'),
    shoofAll('/inventory/stock')
  ]);
  const snap = { at: new Date().toISOString(), products, stores, stock };
  await getStore({ name: 'shoof', consistency: 'strong' }).setJSON('catalog', snap);
  return { ok: true, at: snap.at, products: products.length, stores: stores.length, stock: stock.length };
}

export default async () => {
  try { console.log('Shoof sync', JSON.stringify(await syncShoof())); }
  catch (e) { console.error('Shoof sync failed', e.message); }
};

export const config = { schedule: '@hourly' };
