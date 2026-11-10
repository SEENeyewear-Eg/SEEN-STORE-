// Read-only data layer for seen-themes.
// The store keeps its product data inside ../index.html (no database yet; Shoof POS is not connected).
// This file downloads that page as text, cuts out only the data blocks (products, hidden brands,
// colour names, photo map) and runs them in an isolated function. Nothing is written anywhere.
(function () {
  'use strict';

  // Each block = [start marker, end marker (exclusive)]. If the store renames these, loading fails safely.
  var BLOCKS = [
    ['const P=[', '// 3D try-on model per product'],
    ['const CN={', 'const st=P.map('],
    ['const BIMG={', '// A colour maps to one photo']
  ];

  function cut(src, a, b) {
    var i = src.indexOf(a);
    if (i < 0) throw new Error('Marker not found: ' + a);
    var j = src.indexOf(b, i);
    if (j < 0) throw new Error('Marker not found: ' + b);
    return src.slice(i, j);
  }

  function toAbs(u) { return /^https?:/i.test(u) ? u : '../' + u; }

  function normalise(raw, i, BIMG) {
    var colours = (raw.k || []).map(function (k) {
      var b = BIMG[raw.b], f = b && b[2][String(raw.n || '').trim() + '|' + k[2]];
      var photos = f ? [].concat(f).map(function (x) { return toAbs(b[0] + String(x).replace(/^~/, '') + b[1]); }) : [];
      return {
        frame: k[0] || '#2b2b2b',
        lens: k[1] || '#4a4a4a',
        code: k[2] || '',
        name: k[5] || '',
        stock: +k[4] || 0,
        photos: photos
      };
    });
    var size = String(raw.z || '').split('·').map(function (s) { return s.trim(); });
    return {
      index: i,                       // position in the store list; the store opens it at #product-<index>
      id: raw.id || null,
      brand: raw.b || '',
      model: String(raw.n || '').trim(),
      shape: raw.s || 'rect',
      price: typeof raw.p === 'number' ? raw.p : null,
      oldPrice: typeof raw.o === 'number' ? raw.o : null,
      type: (raw.t && raw.t[0]) || '',
      tags: raw.t || [],
      size: { lens: size[0] || '', bridge: size[1] || '', temple: size[2] || '' },
      colours: colours,
      stock: colours.reduce(function (a, c) { return a + c.stock; }, 0),
      photo: (colours.find(function (c) { return c.photos.length; }) || { photos: [] }).photos[0] || '',
      storeUrl: '../index.html#product-' + i
    };
  }

  var cache = null;
  function load() {
    if (cache) return cache;
    cache = fetch('../index.html', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(function (src) {
        var code = BLOCKS.map(function (b) { return cut(src, b[0], b[1]); }).join('\n');
        /* eslint no-new-func: 0 */
        var out = new Function(code + '\n;return {P:P,BIMG:BIMG};')();
        var products = out.P.map(function (p, i) { return normalise(p, i, out.BIMG); });
        // Official SEEN logo, taken as-is from the store header (never redrawn here)
        var la = src.indexOf('<svg class="logo"'), lb = la >= 0 ? src.indexOf('</svg>', la) : -1;
        var logo = lb > la ? src.slice(la, lb + 6) : '';
        // Brand logo file names used by the store (img/logo/…); optional, missing = text name
        var LOGO = {};
        try { LOGO = new Function(cut(src, 'const LOGO={', '\n') + '\n;return LOGO;')(); } catch (e) { LOGO = {}; }
        var brandList = Array.from(new Set(products.map(function (p) { return p.brand; }))).sort();
        return {
          logo: logo,
          brandInfo: brandList.map(function (b) {
            return {
              name: b,
              logoUrl: LOGO[b] ? '../img/logo/' + LOGO[b].replace(/[^A-Za-z0-9_.-]/g, '_') : '',
              link: '../index.html#shop?b=' + encodeURIComponent(b),
              count: products.filter(function (p) { return p.brand === b; }).length
            };
          }),
          products: products,
          brands: Array.from(new Set(products.map(function (p) { return p.brand; }))).sort(),
          types: Array.from(new Set(products.map(function (p) { return p.type; }).filter(Boolean)))
        };
      });
    cache.catch(function () { cache = null; });
    return cache;
  }

  // Simple read helpers (list / find)
  function list(db, f) {
    f = f || {};
    var q = (f.q || '').toLowerCase().trim();
    return db.products.filter(function (p) {
      if (f.brand && p.brand !== f.brand) return false;
      if (f.type && p.type !== f.type) return false;
      if (f.photosOnly && !p.photo) return false;
      if (q && (p.brand + ' ' + p.model).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }
  function find(db, brand, model) {
    return db.products.find(function (p) { return p.brand === brand && p.model === model; }) || null;
  }
  function featured(db, wanted, count) {
    var picked = (wanted || []).map(function (s) { var x = String(s).split('|'); return find(db, x[0], x[1]); }).filter(Boolean);
    if (picked.length) return picked.slice(0, count);
    // Round-robin across brands so the mix stays varied: 1st of each brand, then 2nd of each, …
    var groups = {}, order = [];
    db.products.forEach(function (p) {
      if (!p.photo || !p.stock) return;
      if (!groups[p.brand]) { groups[p.brand] = []; order.push(p.brand); }
      groups[p.brand].push(p);
    });
    var out = [];
    for (var r = 0; out.length < count; r++) {
      var added = false;
      order.forEach(function (b) { if (out.length < count && groups[b][r]) { out.push(groups[b][r]); added = true; } });
      if (!added) break;
    }
    return out;
  }

  window.SeenData = { load: load, list: list, find: find, featured: featured };
})();
