// Shoof POS (Oracle ORDS) client: signs in with OAuth2 client credentials, or Basic auth as a fallback,
// adds the app header Shoof expects, and reads ORDS collections page by page.
import { env } from './store.mjs';

const BASE = () => (env('SHOOF_BASE') || 'https://shoof-pos.com/ords/onelook').replace(/\/$/, '');
let TOKEN = null;

export const shoofReady = () => Boolean((env('SHOOF_CLIENT_ID') && env('SHOOF_CLIENT_SECRET')) || (env('SHOOF_USER') && env('SHOOF_PASSWORD')));

async function authHeader() {
  if (env('SHOOF_CLIENT_ID') && env('SHOOF_CLIENT_SECRET')) {
    if (TOKEN && TOKEN.until > Date.now() + 30000) return 'Bearer ' + TOKEN.value;
    const basic = Buffer.from(env('SHOOF_CLIENT_ID') + ':' + env('SHOOF_CLIENT_SECRET')).toString('base64');
    const r = await fetch(BASE() + '/oauth/token', {
      method: 'POST', headers: { Authorization: 'Basic ' + basic, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials'
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.access_token) throw new Error('Shoof sign-in failed (' + r.status + ')');
    TOKEN = { value: d.access_token, until: Date.now() + (Number(d.expires_in) || 3600) * 1000 };
    return 'Bearer ' + TOKEN.value;
  }
  return 'Basic ' + Buffer.from(env('SHOOF_USER') + ':' + env('SHOOF_PASSWORD')).toString('base64');
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

// ORDS collections answer {items, hasMore, limit, offset}; follow the pages up to `max` rows.
export async function shoofAll(path, params = {}, max = 20000) {
  const rows = [];
  let offset = 0;
  for (;;) {
    const d = await shoofGet(path, { ...params, limit: 500, offset });
    const items = Array.isArray(d.items) ? d.items : Array.isArray(d) ? d : [];
    rows.push(...items);
    if (!d.hasMore || !items.length || rows.length >= max) return rows;
    offset += items.length;
  }
}
