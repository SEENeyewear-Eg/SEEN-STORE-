// Builds the catalogue from the Shoof snapshot saved in KV (binding SHOOF, key "catalog").
// Shoof field names are not confirmed yet, so each field tries a list of likely names.
// Once a real sync is seen (GET /api/shoof-status shows the names), trim these lists to the real ones.
const pick = (row, names) => {
  for (const n of names) if (row[n] != null && row[n] !== '') return row[n];
  return '';
};

const FIELDS = {
  brand: ['BRAND', 'brand', 'brand_name', 'BRAND_NAME'],
  model: ['MODEL', 'model', 'model_code', 'MODEL_CODE'],
  colour: ['MAIN COLOR', 'MAIN_COLOR', 'main_color', 'COLOR', 'color', 'colour'],
  size: ['SIZE', 'size'],
  price: ['RETAIL_PRICE', 'retail_price', 'PRICE', 'price', 'SELL_PRICE', 'sell_price'],
  optical: ['GENDER', 'gender'], // placeholder; optical/sun is not in Shoof fields yet
  itemId: ['ITEM_ID', 'item_id', 'ID', 'id'],
  storeId: ['STORE_ID', 'store_id'],
  qty: ['QTY', 'qty', 'ON_HAND', 'on_hand', 'QUANTITY', 'quantity'],
};

// Product list in the shape the storefront page uses (the same fields as the old static P list).
const SW = [['#2b2b2b', '#4a4a4a'], ['#6b4a2f', '#5b3a22'], ['#9aa0a6', '#2f6fa8'], ['#c9a45c', '#37513d']];
const SHAPES = ['rect', 'way', 'avi', 'round', 'cat', 'club', 'wrap'];
export function appProducts(snap) {
  const map = catalogFromSnapshot(snap);
  let id = 1;
  return [...map.values()].map(p => {
    let h = 0;
    for (const ch of p.n) h = (h * 31 + ch.charCodeAt(0)) % 997;
    return {
      id: id++, b: p.b, n: p.n, c: '', s: SHAPES[h % 7], p: p.p, z: p.z,
      t: [p.t[0], p.k.some(k => k[4] === '' || k[4] > 0) ? 'In stock' : 'Out of stock'],
      k: p.k.map((k, j) => [SW[j % 4][0], SW[j % 4][1], k[2], '', k[4]]),
    };
  });
}

// Returns Map keyed by "brand|model" in the same shape the checkout uses: {b, n, p, z, t, k:[[hex,hex,code,lens,stock]]}.
export function catalogFromSnapshot(snap) {
  const products = new Map();
  if (!snap || !Array.isArray(snap.products)) return products;

  // Stock per item and colour, summed over stores.
  const stock = new Map();
  for (const s of Array.isArray(snap.stock) ? snap.stock : []) {
    const key = String(pick(s, FIELDS.itemId)) + '|' + String(pick(s, FIELDS.colour));
    stock.set(key, (stock.get(key) || 0) + (Number(pick(s, FIELDS.qty)) || 0));
  }

  for (const r of snap.products) {
    const b = String(pick(r, FIELDS.brand)).trim();
    const n = String(pick(r, FIELDS.model)).trim();
    if (!b || !n) continue;
    const colour = String(pick(r, FIELDS.colour)).trim();
    const key = b + '|' + n;
    const price = Number(pick(r, FIELDS.price)) || 0;
    const itemId = String(pick(r, FIELDS.itemId));
    const left = stock.has(itemId + '|' + colour) ? stock.get(itemId + '|' + colour) : '';
    if (!products.has(key)) {
      products.set(key, { b, n, p: price, z: String(pick(r, FIELDS.size)), t: ['Sunglasses'], k: [] });
    }
    const p = products.get(key);
    if (colour && !p.k.some(k => k[2] === colour)) p.k.push(['', '', colour, '', left]);
  }
  return products;
}

