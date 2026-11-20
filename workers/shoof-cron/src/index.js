// Scheduled Worker: copies Shoof products, branches and stock into the SHOOF KV namespace every hour.
// It runs the same sync as POST /api/shoof-status (functions/api/shoof-status.js), so the Pages site and the
// hourly job always write the same snapshot under the key "catalog".
// Secrets (SHOOF_CLIENT_ID, SHOOF_CLIENT_SECRET, SHOOF_APP_TOKEN, SHOOF_COMPANY_ID) are set on this Worker in Cloudflare,
// never in this file.
import { setEnv } from '../../../functions/_lib/store.js';
import { syncShoof } from '../../../functions/api/shoof-status.js';

async function run(env) {
  setEnv(env);
  try {
    const result = await syncShoof(env);
    console.log('Shoof sync', JSON.stringify(result));
  } catch (e) {
    console.error('Shoof sync failed', e.message);
  }
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(run(env));
  },
  // Nothing is served from this Worker; it only exists to run the schedule.
  async fetch() {
    return new Response('Not found', { status: 404 });
  },
};
