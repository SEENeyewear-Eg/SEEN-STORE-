// GET /api/settings — site switches the page reads on load. Set in Cloudflare (and later from the dashboard):
//   SHOW_DARK_MODE = 1 shows the dark mode button; anything else hides it and the site stays light (decided 2026-11-16).
import { setEnv, env } from '../_lib/store.js';

export async function onRequestGet({ env: bindings }) {
  setEnv(bindings);
  return new Response(JSON.stringify({ darkMode: env('SHOW_DARK_MODE') === '1' }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=60' },
  });
}
