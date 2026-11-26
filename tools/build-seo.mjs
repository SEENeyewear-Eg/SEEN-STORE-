// Generates the static SEO pages from the product catalogue.
// Run from the repo root:
//   node tools/build-seo.mjs          reads .local-api/catalog.json (the local copy of /api/catalog)
//   node tools/build-seo.mjs --live   reads the live https://www.seeneyeweareg.com/api/catalog instead
//   node tools/build-seo.mjs --listings  also rebuilds shop, brand, cart and checkout pages (off by default)
//
// Writes:
//   seo-slugs.js          Shoof id -> URL slug, and brand -> brand slug (used by the app and the redirects)
//   product/<slug>/       one English page per model (title, description, canonical, hreflang, JSON-LD)
//   ar/product/<slug>/    the same model in Arabic (RTL), linked to the English page with hreflang
//   sitemap.xml           every page above, with hreflang alternates for the product pages
//   _redirects            301 from old numeric URLs (/product/12240) to the model slug, plus the existing /shop rules
//   (with --listings)     shop/, shop/sunglasses/, shop/optical/, brands/<brand>/, cart/, checkout/
//
// A model's URL is its brand plus its model name (/product/maui-jim-mj0647sa). It is not the app id or the Shoof
// number, and the colours live inside the model page.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.seeneyeweareg.com';
const LIVE_URL = SITE + '/api/catalog';
const CATALOG_FILE = path.join(ROOT, '.local-api', 'catalog.json');
const PIXEL = fs.readFileSync(path.join(ROOT, 'tools', 'seen-pixel.html'), 'utf8');
// Google Tag Manager (container GTM-T4PS7CGW): script right after <head>, noscript right after <body> (same snippets as tools/add-gtm.py).
const GTM_HEAD = fs.readFileSync(path.join(ROOT, 'tools', 'seen-gtm-head.html'), 'utf8').trim();
const GTM_BODY = fs.readFileSync(path.join(ROOT, 'tools', 'seen-gtm-body.html'), 'utf8').trim();
const WA_CONV = fs.readFileSync(path.join(ROOT, 'tools', 'seen-wa-conversion.html'), 'utf8').trim();
const TODAY = new Date().toISOString().slice(0, 10);
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// 1. Product data: the catalogue, not index.html.
async function loadCatalog() {
  if (process.argv.includes('--live')) {
    const res = await fetch(LIVE_URL);
    if (!res.ok) throw new Error(`live catalogue returned HTTP ${res.status}: ${LIVE_URL}`);
    return { rows: await res.json(), source: LIVE_URL };
  }
  if (!fs.existsSync(CATALOG_FILE)) {
    throw new Error(`catalogue not found: ${CATALOG_FILE} (run scripts/sync-local-catalog.cjs or use --live)`);
  }
  return { rows: JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8')), source: CATALOG_FILE };
}
const catalog = await loadCatalog();
if (!Array.isArray(catalog.rows)) throw new Error('catalogue is not a list: ' + catalog.source);
const allP = catalog.rows;

// Photos still come from the BIMG map in index.html (not part of the product list).
// The BIMG map now lives in seen-cards.js (the shared card code), so it is read from there.
const cardsJs = fs.readFileSync(path.join(ROOT, 'seen-cards.js'), 'utf8');
function slice(from, to) {
  const a = cardsJs.indexOf(from);
  if (a < 0) throw new Error('marker not found: ' + from);
  const b = cardsJs.indexOf(to, a);
  if (b < 0) throw new Error('end marker not found: ' + to);
  return cardsJs.slice(a, b);
}
const BIMG = new Function(`${slice('const BIMG=', 'const bims=(p,k)')};\nreturn BIMG;`)();

// Hidden brands: the app's HIDE list. Their products must not get pages.
const hideMatch = html.match(/const HIDE=new Set\(\[([^\]]*)\]\)/);
const HIDE = new Set(hideMatch ? [...hideMatch[1].matchAll(/'([^']*)'/g)].map(m => m[1]) : []);
const P = allP.filter(p => !HIDE.has(p.b));

const ids = new Set();
for (const p of P) {
  if (!p.id) throw new Error('product without Shoof id: ' + p.b + ' ' + p.n);
  if (ids.has(p.id)) throw new Error('duplicate Shoof id ' + p.id);
  ids.add(p.id);
}

// 2. Slugs. A model slug is built from brand + model name only, so it does not depend on the id or the colours.
const norm = s => String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/\+/g, ' plus ')          // "THE-DOCTOR+" and "THE-DOCTOR" are different models
  .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const SLUG_FILE = path.join(ROOT, 'seo-slugs.js');
let frozenBrands = {};
if (fs.existsSync(SLUG_FILE)) {
  frozenBrands = new Function(fs.readFileSync(SLUG_FILE, 'utf8') + '\nreturn SEO_BRAND;')();
}
const SEO_BRAND = { ...frozenBrands };
const SEO_SLUG = {};            // Shoof id -> model slug
const slugOwner = new Map();    // model slug -> brand|model key, to catch collisions

const brands = [...new Set(P.map(p => p.b))].sort((a, b) => a.localeCompare(b));
for (const b of brands) {
  if (SEO_BRAND[b]) continue;
  let s = norm(b) || 'brand';
  if (Object.values(SEO_BRAND).includes(s)) s += '-2';
  SEO_BRAND[b] = s;
}

for (const p of P) {
  const slug = norm(p.b) + '-' + norm(p.n);
  if (!norm(p.b) || !norm(p.n)) throw new Error('empty brand or model name, id ' + p.id);
  const key = p.b + '|' + p.n;
  if (slugOwner.has(slug)) {
    throw new Error(`two catalogue rows give /product/${slug}: "${slugOwner.get(slug)}" and "${key}"`);
  }
  slugOwner.set(slug, key);
  SEO_SLUG[p.id] = slug;
}
const sortedIds = [...ids].sort((a, b) => a - b);
fs.writeFileSync(SLUG_FILE,
  '// URL slugs, generated by tools/build-seo.mjs from brand + model name.\n' +
  '// SEO_SLUG keys are Shoof item IDs (the app and the 301 redirects use them). Brand slugs are kept once set.\n' +
  'const SEO_SLUG=' + JSON.stringify(Object.fromEntries(sortedIds.map(id => [id, SEO_SLUG[id]])), null, 1) + ';\n' +
  'const SEO_BRAND=' + JSON.stringify(Object.fromEntries(brands.map(b => [b, SEO_BRAND[b]])), null, 1) + ';\n' +
  'const SEO_CAT={"sunglasses":"Sunglasses","optical":"Optical"};\n');

// 3. Text. English and Arabic copy for the page chrome and the product facts.
const T = {
  en: {
    lang: 'en', dir: 'ltr', locale: 'en_US', brand: 'SEEN Eyewear', home: 'Home', shop: 'Shop', allEyewear: 'All eyewear',
    inStock: 'In stock', outStock: 'Out of stock', open: 'Open in the store',
    delivery: 'Delivery across Egypt or pickup from SEEN branches.', colours: 'Colours', more: 'More', all: 'All',
    allSun: 'sunglasses', allOpt: 'optical frames', kindSun: 'Sunglasses', kindOpt: 'Optical Frames',
    lens: 'Lens', bridge: 'Bridge', temple: 'Temple', mm: 'mm', currency: 'EGP', sep: ', ',
    inPlace: 'at SEEN Eyewear, Hurghada, Egypt.', footer: 'Hurghada, Egypt',
  },
  ar: {
    lang: 'ar', dir: 'rtl', locale: 'ar_EG', brand: 'سين للنظارات', home: 'الرئيسية', shop: 'تسوّق', allEyewear: 'كل النظارات',
    inStock: 'متوفر', outStock: 'غير متوفر', open: 'افتح في المتجر',
    delivery: 'توصيل لكل مصر أو استلام من فروع سين.', colours: 'الألوان', more: 'المزيد من', all: 'كل',
    allSun: 'النظارات الشمسية', allOpt: 'الإطارات الطبية', kindSun: 'نظارات شمسية', kindOpt: 'إطارات طبية',
    lens: 'العدسة', bridge: 'الجسر', temple: 'المعبد', mm: 'مم', currency: 'جنيه', sep: '، ',
    inPlace: 'في سين للنظارات، الغردقة، مصر.', footer: 'الغردقة، مصر',
  },
  de: {
    lang: 'de', dir: 'ltr', locale: 'de_DE', brand: 'SEEN Eyewear', home: 'Startseite', shop: 'Shop', allEyewear: 'Alle Brillen',
    inStock: 'Auf Lager', outStock: 'Nicht verfügbar', open: 'Im Shop öffnen',
    delivery: 'Lieferung in ganz Ägypten oder Abholung in den SEEN-Filialen.', colours: 'Farben', more: 'Mehr von', all: 'Alle',
    allSun: 'Sonnenbrillen', allOpt: 'Brillenfassungen', kindSun: 'Sonnenbrille', kindOpt: 'Brillenfassung',
    lens: 'Glas', bridge: 'Steg', temple: 'Bügel', mm: 'mm', currency: 'EGP', sep: ', ',
    inPlace: 'bei SEEN Eyewear, Hurghada, Ägypten.', footer: 'Hurghada, Ägypten',
  },
  es: {
    lang: 'es', dir: 'ltr', locale: 'es_ES', brand: 'SEEN Eyewear', home: 'Inicio', shop: 'Tienda', allEyewear: 'Todas las gafas',
    inStock: 'En stock', outStock: 'Agotado', open: 'Abrir en la tienda',
    delivery: 'Envío a todo Egipto o recogida en las sucursales de SEEN.', colours: 'Colores', more: 'Más de', all: 'Todas',
    allSun: 'gafas de sol', allOpt: 'monturas ópticas', kindSun: 'Gafas de sol', kindOpt: 'Monturas ópticas',
    lens: 'Lente', bridge: 'Puente', temple: 'Varilla', mm: 'mm', currency: 'EGP', sep: ', ',
    inPlace: 'en SEEN Eyewear, Hurghada, Egipto.', footer: 'Hurghada, Egipto',
  },
  it: {
    lang: 'it', dir: 'ltr', locale: 'it_IT', brand: 'SEEN Eyewear', home: 'Home', shop: 'Shop', allEyewear: 'Tutti gli occhiali',
    inStock: 'Disponibile', outStock: 'Esaurito', open: 'Apri nello store',
    delivery: "Spedizione in tutto l'Egitto o ritiro nelle filiali SEEN.", colours: 'Colori', more: 'Altri di', all: 'Tutti',
    allSun: 'occhiali da sole', allOpt: 'montature ottiche', kindSun: 'Occhiali da sole', kindOpt: 'Montature ottiche',
    lens: 'Lente', bridge: 'Ponte', temple: 'Asta', mm: 'mm', currency: 'EGP', sep: ', ',
    inPlace: 'presso SEEN Eyewear, Hurghada, Egitto.', footer: 'Hurghada, Egitto',
  },
  fr: {
    lang: 'fr', dir: 'ltr', locale: 'fr_FR', brand: 'SEEN Eyewear', home: 'Accueil', shop: 'Boutique', allEyewear: 'Toutes les lunettes',
    inStock: 'En stock', outStock: 'Épuisé', open: 'Ouvrir dans la boutique',
    delivery: "Livraison dans toute l'Égypte ou retrait dans les boutiques SEEN.", colours: 'Couleurs', more: 'Plus de', all: 'Tous',
    allSun: 'lunettes de soleil', allOpt: 'montures optiques', kindSun: 'Lunettes de soleil', kindOpt: 'Montures optiques',
    lens: 'Verre', bridge: 'Pont', temple: 'Branche', mm: 'mm', currency: 'EGP', sep: ', ',
    inPlace: 'chez SEEN Eyewear, Hurghada, Égypte.', footer: 'Hurghada, Égypte',
  },
  ru: {
    lang: 'ru', dir: 'ltr', locale: 'ru_RU', brand: 'SEEN Eyewear', home: 'Главная', shop: 'Магазин', allEyewear: 'Все очки',
    inStock: 'В наличии', outStock: 'Нет в наличии', open: 'Открыть в магазине',
    delivery: 'Доставка по всему Египту или самовывоз из филиалов SEEN.', colours: 'Цвета', more: 'Ещё от', all: 'Все',
    allSun: 'солнцезащитные очки', allOpt: 'оправы для очков', kindSun: 'Солнцезащитные очки', kindOpt: 'Оправы для очков',
    lens: 'Линза', bridge: 'Перемычка', temple: 'Дужка', mm: 'мм', currency: 'EGP', sep: ', ',
    inPlace: 'в SEEN Eyewear, Хургада, Египет.', footer: 'Хургада, Египет',
  },
};
// Every language the site serves (lang.js and the app's language menu). Each one gets its own page and hreflang.
const LANGS = ['en', 'ar', 'de', 'es', 'it', 'fr', 'ru'];

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n, lang = 'en') => n.toLocaleString('en-US') + ' ' + T[lang].currency;
const jsonld = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const titleCase = s => String(s).toLowerCase().replace(/(^|[\s-])([a-z])/g, (m, a, c) => a + c.toUpperCase());

// Colours: only the owner's approved names (memory: colour-master-list). The sheet's Arabic names are my translation;
// the owner should check them.
const COLOUR_AR = { BEIGE: 'بيج', BLACK: 'أسود', BLUE: 'أزرق', BRONZE: 'برونزي', BROWN: 'بني', BURGUNDY: 'عنابي',
  CRYSTAL: 'كريستال', FUCHSIA: 'فوشيا', GOLD: 'ذهبي', GREEN: 'أخضر', GREY: 'رمادي', HAVANA: 'هافانا', IVORY: 'عاجي',
  'LIGHT-BLUE': 'أزرق فاتح', NUDE: 'نود', ORANGE: 'برتقالي', PINK: 'وردي', RED: 'أحمر', RUTHENIUM: 'روثينيوم',
  SILVER: 'فضي', VIOLET: 'بنفسجي', WHITE: 'أبيض', YELLOW: 'أصفر' };
const APPROVED_COLOURS = Object.keys(COLOUR_AR);
const SHAPE_EN = { round: 'Round', rect: 'Rectangle', cat: 'Cat-eye', avi: 'Aviator', way: 'Wayfarer' };
const SHAPE_AR = { round: 'دائرية', rect: 'مستطيلة', cat: 'عين قطة', avi: 'أفياتور', way: 'ويفارر' };
// Colour and shape names for the other languages (my translations; the owner should check them).
const COLOUR_L = {
  ar: COLOUR_AR,
  de: { BEIGE: 'Beige', BLACK: 'Schwarz', BLUE: 'Blau', BRONZE: 'Bronze', BROWN: 'Braun', BURGUNDY: 'Bordeaux', CRYSTAL: 'Kristall',
    FUCHSIA: 'Fuchsia', GOLD: 'Gold', GREEN: 'Grün', GREY: 'Grau', HAVANA: 'Havanna', IVORY: 'Elfenbein', 'LIGHT-BLUE': 'Hellblau',
    NUDE: 'Nude', ORANGE: 'Orange', PINK: 'Rosa', RED: 'Rot', RUTHENIUM: 'Ruthenium', SILVER: 'Silber', VIOLET: 'Violett', WHITE: 'Weiß', YELLOW: 'Gelb' },
  es: { BEIGE: 'Beige', BLACK: 'Negro', BLUE: 'Azul', BRONZE: 'Bronce', BROWN: 'Marrón', BURGUNDY: 'Burdeos', CRYSTAL: 'Cristal',
    FUCHSIA: 'Fucsia', GOLD: 'Dorado', GREEN: 'Verde', GREY: 'Gris', HAVANA: 'Havana', IVORY: 'Marfil', 'LIGHT-BLUE': 'Azul claro',
    NUDE: 'Nude', ORANGE: 'Naranja', PINK: 'Rosa', RED: 'Rojo', RUTHENIUM: 'Rutenio', SILVER: 'Plateado', VIOLET: 'Violeta', WHITE: 'Blanco', YELLOW: 'Amarillo' },
  it: { BEIGE: 'Beige', BLACK: 'Nero', BLUE: 'Blu', BRONZE: 'Bronzo', BROWN: 'Marrone', BURGUNDY: 'Bordeaux', CRYSTAL: 'Cristallo',
    FUCHSIA: 'Fucsia', GOLD: 'Oro', GREEN: 'Verde', GREY: 'Grigio', HAVANA: 'Havana', IVORY: 'Avorio', 'LIGHT-BLUE': 'Azzurro',
    NUDE: 'Nude', ORANGE: 'Arancione', PINK: 'Rosa', RED: 'Rosso', RUTHENIUM: 'Rutenio', SILVER: 'Argento', VIOLET: 'Viola', WHITE: 'Bianco', YELLOW: 'Giallo' },
  fr: { BEIGE: 'Beige', BLACK: 'Noir', BLUE: 'Bleu', BRONZE: 'Bronze', BROWN: 'Marron', BURGUNDY: 'Bordeaux', CRYSTAL: 'Cristal',
    FUCHSIA: 'Fuchsia', GOLD: 'Or', GREEN: 'Vert', GREY: 'Gris', HAVANA: 'Havane', IVORY: 'Ivoire', 'LIGHT-BLUE': 'Bleu clair',
    NUDE: 'Nude', ORANGE: 'Orange', PINK: 'Rose', RED: 'Rouge', RUTHENIUM: 'Ruthénium', SILVER: 'Argent', VIOLET: 'Violet', WHITE: 'Blanc', YELLOW: 'Jaune' },
  ru: { BEIGE: 'Бежевый', BLACK: 'Чёрный', BLUE: 'Синий', BRONZE: 'Бронзовый', BROWN: 'Коричневый', BURGUNDY: 'Бордовый', CRYSTAL: 'Прозрачный',
    FUCHSIA: 'Фуксия', GOLD: 'Золотой', GREEN: 'Зелёный', GREY: 'Серый', HAVANA: 'Гавана', IVORY: 'Слоновая кость', 'LIGHT-BLUE': 'Голубой',
    NUDE: 'Нюд', ORANGE: 'Оранжевый', PINK: 'Розовый', RED: 'Красный', RUTHENIUM: 'Рутений', SILVER: 'Серебристый', VIOLET: 'Фиолетовый', WHITE: 'Белый', YELLOW: 'Жёлтый' },
};
const SHAPE_L = {
  ar: SHAPE_AR,
  de: { round: 'Rund', rect: 'Rechteckig', cat: 'Cat-Eye', avi: 'Aviator', way: 'Wayfarer' },
  es: { round: 'Redonda', rect: 'Rectangular', cat: 'Cat-eye', avi: 'Aviador', way: 'Wayfarer' },
  it: { round: 'Rotonda', rect: 'Rettangolare', cat: 'Cat-eye', avi: 'Aviator', way: 'Wayfarer' },
  fr: { round: 'Ronde', rect: 'Rectangulaire', cat: 'Œil de chat', avi: 'Aviateur', way: 'Wayfarer' },
  ru: { round: 'Круглые', rect: 'Прямоугольные', cat: 'Кошачий глаз', avi: 'Авиаторы', way: 'Вайфареры' },
};

// Model codes stay upper case (MJ0647SA); brands use their usual spelling (Ray-Ban, McQueen, Liu Jo).
const BRAND_NAME = { 'RAY BAN': 'Ray-Ban', 'ALEXANDER MCQUEEN': 'Alexander McQueen', 'LIU.JO': 'Liu Jo',
  'CLOCKS.COLOURS': 'Clocks & Colours', 'PRIVE REVAUX': 'Privé Revaux', 'USPA POLO': 'U.S. Polo Assn.',
  'DSQUARED2': 'DSquared2', 'HUGO BOSS': 'Hugo Boss', 'CHLOE': 'Chloé', 'GUY LAROCHE': 'Guy Laroche' };
const brandName = b => BRAND_NAME[b] || titleCase(b);
const modelName = p => `${brandName(p.b)} ${p.n.replace(/-/g, ' ')}`;
const colourKey = p => p.k.map(k => String(k[5] || '').toUpperCase()).find(c => APPROVED_COLOURS.includes(c)) || '';
const colourNames = (p, lang) => [...new Set(p.k.map(k => String(k[5] || '').toUpperCase()).filter(c => APPROVED_COLOURS.includes(c)))]
  .map(c => (lang === 'en' ? titleCase(c) : COLOUR_L[lang][c]));
const shapeText = (p, lang) => (lang === 'en' ? SHAPE_EN[p.s] : SHAPE_L[lang][p.s]) || (p.s ? titleCase(p.s) : '');
const kindOf = p => (p.t[0] === 'Optical' ? 'opt' : 'sun');
const kindText = (p, lang) => T[lang][kindOf(p) === 'opt' ? 'kindOpt' : 'kindSun'];
const allKindText = (p, lang) => T[lang][kindOf(p) === 'opt' ? 'allOpt' : 'allSun'];
// Shoof size is "lens-bridge-temple" (mm). Some rows only have the temple length.
const specParts = p => {
  const parts = String(p.z).split('-').map(s => s.trim()).filter(Boolean);
  if (parts.length === 3) return [['lens', parts[0]], ['bridge', parts[1]], ['temple', parts[2]]];
  if (parts.length === 1 && /^\d+$/.test(parts[0])) return [['temple', parts[0]]];
  return [];
};
const specText = (p, lang) => specParts(p).map(([k, v]) => `${T[lang][k]} ${v} ${T[lang].mm}`).join(T[lang].sep);
const specHtml = (p, lang) => specParts(p).map(([k, v]) => `<strong>${T[lang][k]}</strong> ${esc(v)} ${T[lang].mm}`).join(' · ');
const slugOf = p => SEO_SLUG[p.id];
const productUrl = p => `/product/${slugOf(p)}`;
// English lives at /product/<slug>; every other language at /<lang>/product/<slug>.
const urlFor = (p, lang) => (lang === 'en' ? productUrl(p) : `/${lang}${productUrl(p)}`);
const catSlug = t => (t === 'Optical' ? 'optical' : 'sunglasses');
const imageOf = p => {
  // The catalogue writes MAUI JIM / VOGUE, the photo map writes Maui Jim / Vogue: match without case.
  const key = Object.keys(BIMG).find(k => k.toLowerCase() === String(p.b).toLowerCase());
  const b = key ? BIMG[key] : null;
  if (!b || !p.k[0]) return '';
  const f = b[2][p.n.trim() + '|' + p.k[0][2]];
  if (!f) return '';
  const first = [].concat(f)[0].replace(/^~/, '');
  const u = b[0] + first + b[1];
  return /^https?:/.test(u) ? u : '/' + u;
};
const inStock = p => (p.t[1] || '').toLowerCase().includes('in stock');
const typeName = p => p.t[0];
const alternatesFor = p => [
  ...LANGS.map(l => ({ hreflang: l, href: SITE + urlFor(p, l) })),
  { hreflang: 'x-default', href: SITE + urlFor(p, 'en') },
];

const CSS = `
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#111;background:#fff;line-height:1.5}
html[lang=ar] body{font-family:Tahoma,"Segoe UI",system-ui,sans-serif}
a{color:#111}header{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;background:#F6F8F9;border-bottom:1px solid #e5e8eb}
header a{text-decoration:none;font-weight:600}main{max-width:1100px;margin:0 auto;padding:20px 16px 48px}
nav.crumbs{font-size:13px;color:#555;margin:0 0 12px}nav.crumbs a{color:#555}h1{font-size:26px;margin:6px 0 10px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;list-style:none;padding:0;margin:16px 0}
.grid li{border:1px solid #e5e8eb;border-radius:10px;padding:12px}.grid a{text-decoration:none}.grid img{width:100%;height:auto;display:block;margin-bottom:8px}
.price{font-weight:600}.muted{color:#555;font-size:14px}.btn{display:inline-block;background:#5AC8FA;color:#111;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;margin:12px 0}
.pdp{display:grid;grid-template-columns:1fr;gap:20px}@media(min-width:760px){.pdp{grid-template-columns:1fr 1fr}}.pdp img{width:100%;height:auto;border-radius:12px;background:#F6F8F9}
footer{font-size:13px;color:#555;text-align:center;padding:24px 16px;border-top:1px solid #e5e8eb}
`;

function shell({ lang = 'en', title, desc, path: urlPath, robots = 'index,follow', ogType = 'website', image = '', ld = [], crumbs = [], body, noscriptHref = '/', alternates = [] }) {
  const t = T[lang];
  const crumbHtml = crumbs.length
    ? `<nav class="crumbs" aria-label="Breadcrumb">${crumbs.map(c => (c.href ? `<a href="${c.href}">${esc(c.name)}</a>` : esc(c.name))).join(' › ')}</nav>`
    : '';
  return `<!doctype html>
<html lang="${t.lang}" dir="${t.dir}"><head>
${GTM_HEAD}<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${SITE}${urlPath}">
${alternates.map(a => `<link rel="alternate" hreflang="${a.hreflang}" href="${a.href}">`).join('\n')}
<meta property="og:site_name" content="SEEN Eyewear">
<meta property="og:locale" content="${t.locale}">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE}${urlPath}">
<meta property="og:image" content="${esc(image || SITE + '/img/seen-og-share.jpg')}">
<meta name="twitter:card" content="summary_large_image">
${PIXEL}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#F6F8F9">
${ld.map(jsonld).join('\n')}
<style>${CSS}</style>
<link rel="stylesheet" href="/footer-bottom.css">
</head><body>
${GTM_BODY}
<header><a href="/">${t.brand}</a><a href="/shop">${t.allEyewear}</a></header>
<main>${crumbHtml}${body}</main>
<footer>${t.brand} · ${t.footer} · <a href="/">${t.home}</a></footer>
<noscript><p><a href="${noscriptHref}">${t.open}</a></p></noscript>
<script src="/site-nav.js" defer></script>
${WA_CONV}
</body></html>
`;
}

const openInStore = (urlPath, label = 'Open in the store') => `<a class="btn" href="/?r=${encodeURIComponent(urlPath)}">${label}</a>`;
const listItem = p => {
  const img = imageOf(p);
  return `<li><a href="${productUrl(p)}">${img ? `<img src="${esc(img)}" alt="${esc(p.b + ' ' + p.n)}" loading="lazy" width="300" height="160">` : ''}<strong>${esc(p.b)} ${esc(p.n)}</strong></a><div class="muted">${esc(typeName(p))} · ${esc(p.z)}</div><div class="price">${money(p.p)}</div></li>`;
};
const itemList = (name, list) => ({
  '@context': 'https://schema.org', '@type': 'ItemList', name,
  itemListElement: list.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE + productUrl(p), name: p.b + ' ' + p.n })),
});
const write = (rel, content) => {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
};

// 4. Clear the folders this script owns, then write them again.
// Shop, brand, cart and checkout pages are only rebuilt with --listings. Those folders are live today, so they are
// left alone until the owner decides how they should look.
const LISTINGS = process.argv.includes('--listings');
const LANG_FOLDERS = LANGS.filter(l => l !== 'en');
for (const d of LISTINGS ? ['product', ...LANG_FOLDERS, 'shop', 'brands', 'cart', 'checkout'] : ['product', ...LANG_FOLDERS]) {
  fs.rmSync(path.join(ROOT, d), { recursive: true, force: true });
}

const sunglasses = P.filter(p => typeName(p) === 'Sunglasses');
const optical = P.filter(p => typeName(p) === 'Optical');
const productPaths = [];
const otherPaths = [];

// Product pages: one English and one Arabic page per model.
for (const p of P) {
  const slug = slugOf(p);
  const urlEn = productUrl(p);
  const img = imageOf(p);
  const colours = colourNames(p, 'en');
  const alternates = alternatesFor(p);
  const product = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: `${p.b} ${p.n}`, sku: String(p.id), mpn: p.n,
    brand: { '@type': 'Brand', name: p.b },
    ...(img ? { image: [SITE + img] } : {}),
    ...(colours.length ? { color: colours } : {}),
    offers: {
      '@type': 'Offer', url: SITE + urlEn, priceCurrency: 'EGP', price: String(p.p),
      availability: inStock(p) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'SEEN Eyewear' },
    },
  };

  for (const lang of LANGS) {
    const t = T[lang];
    const urlPath = urlFor(p, lang);
    const model = modelName(p);
    const colour = colourNames(p, lang)[0] || '';
    const shape = shapeText(p, lang);
    const kind = kindText(p, lang);
    const price = money(p.p, lang);
    const stockWord = inStock(p) ? t.inStock : t.outStock;
    const spec = specText(p, lang);
    const title = [model, colour, shape, kind].filter(Boolean).join(' ') + ' | ' + t.brand;
    // English reads "Black Round sunglasses"; the other languages keep their noun capitalised.
    const desc = `${[model, colour, shape].filter(Boolean).join(' ')} ${lang === 'en' ? kind.toLowerCase() : kind}. ` +
      (spec ? spec + '. ' : '') + `${price}. ${stockWord} ${t.inPlace}`;
    const body = `<div class="pdp"><div>${img ? `<img src="${esc(img)}" alt="${esc([model, colour].filter(Boolean).join(' '))}">` : ''}</div>
<div><h1>${esc(model)}</h1>
<div class="price">${price}</div>
<p>${esc(kind)}${shape ? ' · ' + esc(shape) : ''} · ${stockWord}</p>
${spec ? `<p>${specHtml(p, lang)}</p>` : ''}
${colours.length ? `<p><strong>${t.colours}</strong> ${colourNames(p, lang).map(esc).join(t.sep)}</p>` : ''}
${openInStore(urlEn, t.open)}
<p class="muted">${t.delivery}</p>
<p><a href="/brands/${SEO_BRAND[p.b]}">${t.more} ${esc(brandName(p.b))}</a> · <a href="/shop/${catSlug(typeName(p))}">${t.all} ${esc(allKindText(p, lang))}</a></p>
</div></div>`;
    const crumbs = [{ name: t.home, href: '/' }, { name: t.shop, href: '/shop' }, { name: model }];
    write(lang === 'en' ? `product/${slug}/index.html` : `${lang}/product/${slug}/index.html`, shell({
      lang, title, desc, path: urlPath, ogType: 'product', image: img ? SITE + img : '', alternates,
      ld: [{ ...product, description: desc }, {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: t.home, item: SITE + '/' },
          { '@type': 'ListItem', position: 2, name: t.shop, item: SITE + '/shop' },
          { '@type': 'ListItem', position: 3, name: model, item: SITE + urlPath },
        ],
      }],
      crumbs, body, noscriptHref: `/?r=${encodeURIComponent(urlEn)}`,
    }));
  }
  productPaths.push(urlEn);
}

// Shop, brand, cart and checkout pages (only with --listings)
if (LISTINGS) {
const catPage = (list, name, title, desc, urlPath, crumbs) => {
  const body = `<h1>${esc(name)}</h1><p class="muted">${list.length} frames</p>${openInStore(urlPath)}
<ul class="grid">${list.map(listItem).join('')}</ul>`;
  write(urlPath.slice(1) + '/index.html', shell({
    title, desc, path: urlPath, ld: [itemList(name, list)], body, crumbs,
    noscriptHref: `/?r=${encodeURIComponent(urlPath)}`,
  }));
  otherPaths.push(urlPath);
};
catPage(P, 'All eyewear', 'Sunglasses & Optical Frames | SEEN Eyewear Egypt',
  'Authentic sunglasses and optical frames from over 40 brands, in Hurghada and online across Egypt.', '/shop',
  [{ name: 'Home', href: '/' }, { name: 'All eyewear' }]);
catPage(sunglasses, 'Sunglasses', 'Sunglasses | Authentic Brands in Egypt | SEEN Eyewear',
  'Authentic sunglasses from Ray-Ban, Maui Jim, Carrera, Polaroid and more. Delivery across Egypt or pickup in Hurghada.', '/shop/sunglasses',
  [{ name: 'Home', href: '/' }, { name: 'Shop', href: '/shop' }, { name: 'Sunglasses' }]);
catPage(optical, 'Optical frames', 'Optical Frames | Prescription Glasses in Egypt | SEEN Eyewear',
  'Authentic optical frames for prescription glasses. Delivery across Egypt or pickup in Hurghada.', '/shop/optical',
  [{ name: 'Home', href: '/' }, { name: 'Shop', href: '/shop' }, { name: 'Optical frames' }]);

// Brand pages
for (const b of brands) {
  const list = P.filter(p => p.b === b);
  const urlPath = `/brands/${SEO_BRAND[b]}`;
  const title = `${b} Sunglasses & Frames in Egypt | SEEN Eyewear`;
  const desc = `${b}: ${list.length} authentic styles at SEEN Eyewear, Hurghada. Delivery across Egypt or pickup in Hurghada.`;
  const body = `<h1>${esc(b)}</h1><p class="muted">${list.length} styles</p>${openInStore(urlPath)}
<ul class="grid">${list.map(listItem).join('')}</ul>`;
  write(urlPath.slice(1) + '/index.html', shell({
    title, desc, path: urlPath, ld: [itemList(b, list)], body, image: SITE + '/img/share/brand-' + SEO_BRAND[b] + '.png',
    crumbs: [{ name: 'Home', href: '/' }, { name: 'Shop', href: '/shop' }, { name: b }],
    noscriptHref: `/?r=${encodeURIComponent(urlPath)}`,
  }));
  otherPaths.push(urlPath);
}

// Redirect shells for the app's cart and checkout (kept out of search results)
for (const target of ['/cart', '/checkout']) {
  const enc = encodeURIComponent(target);
  write(target.slice(1) + '/index.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex">
<title>SEEN Eyewear</title><meta http-equiv="refresh" content="0; url=/?r=${enc}">
<script>location.replace('/?r=${enc}'+location.hash)</script></head>
<body><a href="/?r=${enc}">Continue to SEEN Eyewear</a></body></html>
`);
}

} // end of --listings

// 5. sitemap.xml. Product pages list both languages, each with its hreflang alternates.
const entry = (loc, priority, alts = '') =>
  `  <url><loc>${loc}</loc><lastmod>${TODAY}</lastmod><changefreq>weekly</changefreq><priority>${priority}</priority>${alts}</url>`;
const sitemapEntries = [entry(SITE + '/', '1.0')]
  .concat(otherPaths.map(u => entry(SITE + u, '0.9')))
  .concat(P.flatMap(p => {
    const alts = alternatesFor(p).map(a => `\n    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`).join('');
    return LANGS.map(l => entry(SITE + urlFor(p, l), '0.8', alts));
  }))
  .concat([`  <url><loc>${SITE}/seen-tryon-3d.html</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`]);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapEntries.join('\n')}
</urlset>
`;
write('sitemap.xml', sitemap);

// The /shop rules are the app's own routes. They must stay, or the shop pages stop loading.
const SHOP_RULES = ['/shop      /   200', '/shop/*    /   200', '/black-friday/*    /offers/   301'];
const redirects = ['# Generated by tools/build-seo.mjs.', '# Old numeric product URLs (/product/<Shoof id>) redirect to the model URL (301).', '']
  .concat(P.map(p => `/product/${p.id} ${productUrl(p)} 301`))
  .concat(['', ...SHOP_RULES]);
write('_redirects', redirects.join('\n') + '\n');

const sunCount = sunglasses.length, optCount = optical.length;
console.log(`source: ${catalog.source}`);
console.log(`products: ${P.length} (sunglasses ${sunCount}, optical ${optCount})`);
console.log(`brands: ${brands.length}`);
console.log(`product pages: ${productPaths.length} models x ${LANGS.length} languages = ${productPaths.length * LANGS.length}, shop/brand pages: ${otherPaths.length}`);
console.log(`sitemap urls: ${sitemapEntries.length}`);
