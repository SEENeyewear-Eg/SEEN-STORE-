// GET /api/delivery — delivery fee per governorate, so checkout can show it before payment.
// Fees live in the Cloudflare setting DELIVERY_FEES as JSON, e.g. {"Cairo":80,"Giza":80}; they can change without a push.
// Hurghada and the Red Sea are free; other governorates use DELIVERY_FEES, then DELIVERY_FEE. Answers {fees, def}.
import { setEnv, deliveryFees } from '../_lib/store.js';

export async function onRequestGet({ env: bindings }) {
  setEnv(bindings);
  return new Response(JSON.stringify(deliveryFees()), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' } });
}
