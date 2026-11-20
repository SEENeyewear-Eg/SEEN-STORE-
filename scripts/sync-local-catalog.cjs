// Saves the live storefront product list (/api/catalog) into .local-api/catalog.json,
// so the local preview shows the same Shoof data as the live site.
// Usage:
//   node scripts/sync-local-catalog.cjs                 (downloads from the live site)
//   node scripts/sync-local-catalog.cjs --from <file>   (uses a JSON file saved from the browser)
// Set SITE_URL to change the site (default: https://seeneyeweareg.com).
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', '.local-api', 'catalog.json');
const SITE = process.env.SITE_URL || 'https://seeneyeweareg.com';

async function load() {
  const i = process.argv.indexOf('--from');
  if (i > -1) return fs.readFileSync(process.argv[i + 1], 'utf8');
  const res = await fetch(SITE.replace(/\/$/, '') + '/api/catalog', { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error('HTTP ' + res.status + ' from ' + SITE + ' (the site may still be Private: save the file from the browser and use --from)');
  return res.text();
}

(async () => {
  const text = await load();
  let data;
  try { data = JSON.parse(text); } catch (e) { throw new Error('Response is not JSON'); }
  if (!Array.isArray(data)) throw new Error('Expected a product list (array), got ' + typeof data);
  if (data.length === 0) throw new Error('The product list is empty. Not overwriting the local file.');
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(data));
  console.log('Saved ' + data.length + ' products to ' + OUT);
})().catch(e => { console.error('Sync failed: ' + e.message); process.exit(1); });
