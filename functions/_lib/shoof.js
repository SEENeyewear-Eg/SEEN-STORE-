// Shoof POS (Oracle ORDS) client for Cloudflare Pages Functions: OAuth2 client credentials, or Basic auth as a fallback,
// adds the app header Shoof expects, and reads ORDS collections page by page. Ported from netlify/lib/shoof.mjs.
import { env } from './store.js';

const BASE = () => (env('SHOOF_BASE') || 'https://shoof-pos.com/ords/onelook').replace(/\/$/, '');
let TOKEN = null;

export const shoofReady = () => Boolean((env('SHOOF_CLIENT_ID') && env('SHOOF_CLIENT_SECRET')) || (env('SHOOF_USER') && env('SHOOF_PASSWORD')));

async function authHeader() {
  if (env('SHOOF_CLIENT_ID') && env('SHOOF_CLIENT_SECRET')) {
    if (TOKEN && TOKEN.until > Date.now() + 30000) return 'Bearer ' + TOKEN.value;
    const basic = btoa(env('SHOOF_CLIENT_ID') + ':' + env('SHOOF_CLIENT_SECRET'));
    const r = await fetch(BASE() + '/oauth/token', {
      method: 'POST', headers: { Authorization: 'Basic ' + basic, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials'
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.access_token) throw new Error('Shoof sign-in failed (' + r.status + ')');
    TOKEN = { value: d.access_token, until: Date.now() + (Number(d.expires_in) || 3600) * 1000 };
    return 'Bearer ' + TOKEN.value;
  }
  return 'Basic ' + btoa(env('SHOOF_USER') + ':' + env('SHOOF_PASSWORD'));
}

// One GET; `path` is relative to the base, e.g. "/masterdata/products".
export async function shoofGet(path, params = {}) {
  const u = new URL(BASE() + path);
  for (const [k, v] of Object.entries(params)) if (v != null && v !== '') u.searchParams.set(k, v);
  const headers = { Authorization: await authHeader(), Accept: 'application/json' };
  if (env('SHOOF_APP_TOKEN')) headers['X-App-Authorization'] = env('SHOOF_APP_TOKEN');
  const r = await fetch(u, { headers });
  if (!r.ok) throw new Error('Shoof ' + path + ' answered ' + r.status);
  return r.json();
}

// Shoof lists answer {count, limit, offset, items} (no hasMore), so keep paging while a page comes back full.
// Shoof allows 7 requests per 10 seconds per IP: wait 1.6 s between pages and retry once after a 429.
const pause = ms => new Promise(r => setTimeout(r, ms));
export async function shoofAll(path, params = {}, max = 20000) {
  const rows = [];
  const limit = 500;
  let offset = 0;
  for (;;) {
    let d;
    try {
      d = await shoofGet(path, { ...params, limit, offset });
    } catch (e) {
      if (!String(e.message).includes('429')) throw e;
      await pause(11000);
      d = await shoofGet(path, { ...params, limit, offset });
    }
    const items = Array.isArray(d.items) ? d.items : Array.isArray(d) ? d : [];
    rows.push(...items);
    // "count" may be the page size rather than the total, so a full page is the signal that more rows exist.
    const more = d.hasMore === true || items.length >= limit;
    if (!more || !items.length || rows.length >= max) return rows;
    offset += items.length;
    await pause(1600);
  }
}
