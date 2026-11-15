// Builds the catalogue from the Shoof snapshot saved in KV (binding SHOOF, key "catalog").
// Shoof field names are not confirmed yet, so each field tries a list of likely names.
// Once a real sync is seen (GET /api/shoof-status shows the names), trim these lists to the real ones.
const pick = (row, names) => {
  for (const n of names) if (row[n] != null && row[n] !== '') return row[n];
  return '';
};

// Shoof keeps brand, size, colour and price inside row.attributes (keys seen in the Shoof grid: Brand, Size_C, Main Color…).
// Keys are matched without case, so "Brand" / "BRAND" / "brand" all work.
// Shoof attributes are a list of { att_val, att_name, att_name_en, att_canon } (att_canon is e.g. BRAND, COLOR).
const norm = s => String(s || '').toLowerCase().replace(/[\s_-]/g, '');
const attr = (row, names) => {
  const list = Array.isArray(row.attributes) ? row.attributes : [];
  for (const want of names) {
    const w = norm(want);
    const hit = list.find(e => e && (norm(e.att_canon) === w || norm(e.att_name) === w || norm(e.att_name_en) === w));
    if (hit && hit.att_val != null && hit.att_val !== '') return String(hit.att_val);
  }
  return '';
};

// Any attribute whose name or canon contains "price" and holds a number (e.g. "Price", "Sales Price", "PRICE").
const priceAttr = row => {
  const list = Array.isArray(row.attributes) ? row.attributes : [];
  for (const e of list) {
    if (!e) continue;
    const label = norm(e.att_canon) + ' ' + norm(e.att_name) + ' ' + norm(e.att_name_en);
    const v = Number(String(e.att_val ?? '').replace(/,/g, ''));
    if (label.includes('price') && v > 0) return v;
  }
  return 0;
};

// Splits a Shoof name like "S6637-C1-55-16-139-SUN-ORG" into model, colour code and size.
const fromName = name => {
  const parts = String(name || '').split('-');
  const model = parts[0] || '';
  const colour = parts[1] || '';
  const size = parts.length >= 5 ? parts.slice(2, 5).join('-') : '';
  return { model, colour, size };
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
// Base colour name from a Shoof MAIN COLOR, e.g. "MATTE BLACK - RED MIRROR" -> "Black", "HAVANA-HAVANA-TRANSPARENT" -> "Havana".
const baseColour = v => {
  const first = String(v || '').split(/\s-\s|-/)[0].replace(/\b(MATTE|SATIN|SHINY|TRANSPARENT|CLEAR)\b/gi, ' ').trim().split(/\s+/)[0] || '';
  return first ? first.charAt(0).toUpperCase() + first.slice(1).toLowerCase() : '';
};

// Shoof SHAPE values -> the shape keys the storefront filters use (rect, round, cat, avi, wrap, club, way).
const SHAPE_KEY = v => {
  const s = String(v || '').toUpperCase().replace(/\s+/g, ' ').trim();
  if (s.includes('CAT')) return 'cat';
  if (s.includes('ROUND') || s.includes('OVAL') || s.includes('PANTHO')) return 'round';
  if (s.includes('NAVIGATOR') || s.includes('AVIATOR')) return 'avi';
  if (s.includes('WRAP')) return 'wrap';
  if (s.includes('CLUB')) return 'club';
  if (s.includes('GEOMETRIC')) return 'way';
  if (s.includes('RECTANG') || s.includes('SQUARE')) return 'rect';
  return 'rect';
};

export function appProducts(snap) {
  const map = catalogFromSnapshot(snap);
  let id = 1;
  return [...map.values()].map(p => {
    let h = 0;
    for (const ch of p.n) h = (h * 31 + ch.charCodeAt(0)) % 997;
    return {
      id: id++, b: p.b, n: p.n, c: '', s: SHAPE_KEY(p.shape) || SHAPES[h % 7], p: p.p, z: p.z,
      t: [p.t[0], p.k.some(k => k[4] === '' || k[4] > 0) ? 'In stock' : 'Out of stock'],
      k: p.k.map((k, j) => [SW[j % 4][0], SW[j % 4][1], k[2], '', k[4], baseColour(k[2])]),
    };
  });
}

// Returns Map keyed by "brand|model" in the same shape the checkout uses: {b, n, p, z, t, k:[[hex,hex,code,lens,stock]]}.
export function catalogFromSnapshot(snap) {
  const products = new Map();
  if (!snap || !Array.isArray(snap.products)) return products;

  // Current price per product id, from the prices endpoint.
  const priceById = new Map();
  for (const pr of Array.isArray(snap.prices) ? snap.prices : []) {
    const id = String(pick(pr, ['product_id', 'PRODUCT_ID', 'item_id', 'ITEM_ID', 'id', 'ID']));
    // Shoof's price rows: store_price (per store) and company_price (company level). The store price wins when set.
    const v = Number(pick(pr, ['store_price', 'company_price', 'PRICE', 'price', 'RETAIL_PRICE', 'retail_price'])) || 0;
    if (id && v) priceById.set(id, v);
  }

  // Stock per item and colour, summed over stores.
  const stock = new Map();
  for (const s of Array.isArray(snap.stock) ? snap.stock : []) {
    const key = String(pick(s, FIELDS.itemId)) + '|' + String(pick(s, FIELDS.colour));
    stock.set(key, (stock.get(key) || 0) + (Number(pick(s, FIELDS.qty)) || 0));
  }

  for (const r of snap.products) {
    const nm = fromName(r.name);
    const b = attr(r, ['Brand']).trim();
    const n = (attr(r, ['Model']) || nm.model).trim();
    if (!b || !n) continue;
    const colour = (attr(r, ['Main Color', 'MainColor', 'Color']) || nm.colour).trim();
    const key = b + '|' + n;
    // Price comes from the sales price. A product without a price is not sold, so it is left out.
    const itemId = String(r.id ?? pick(r, FIELDS.itemId));
    const price = priceById.get(itemId) || priceAttr(r) || 0;
    const left = stock.has(itemId + '|' + colour) ? stock.get(itemId + '|' + colour) : '';
    if (!products.has(key)) {
      products.set(key, { b, n, p: price, z: attr(r, ['Size_C', 'Size']) || nm.size, t: ['Sunglasses'], k: [], shape: attr(r, ['SHAPE']) });
    }
    const p = products.get(key);
    if (colour && !p.k.some(k => k[2] === colour)) p.k.push(['', '', colour, '', left]);
  }
  return products;
}

