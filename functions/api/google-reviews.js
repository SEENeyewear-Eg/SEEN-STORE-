// GET /api/google-reviews — the store's Google rating and its latest reviews, read from the Google Places API.
// Needs two Cloudflare environment variables set by the owner (never written in the code):
//   GOOGLE_PLACES_KEY  — the API key from Google Cloud (Places API (New) enabled)
//   GOOGLE_PLACE_ID    — the Place ID of the SEEN listing on Google
// Without them the endpoint answers { enabled: false } and the page shows only the "Read and write reviews" link.
import { json, setEnv, env } from '../_lib/store.js';

export async function onRequestGet({ env: bindings }) {
  setEnv(bindings);
  const key = env('GOOGLE_PLACES_KEY'), id = env('GOOGLE_PLACE_ID');
  if (!key || !id) return json({ enabled: false });

  const r = await fetch('https://places.googleapis.com/v1/places/' + encodeURIComponent(id) + '?languageCode=en', {
    headers: {
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'displayName,rating,userRatingCount,googleMapsUri,reviews',
    },
  }).catch(() => null);
  if (!r || !r.ok) return json({ enabled: false, error: 'Google reviews are not available right now.' });

  const d = await r.json();
  const reviews = (d.reviews || [])
    .slice(0, 3)
    .map(x => ({
      name: (x.authorAttribution && x.authorAttribution.displayName) || 'Google user',
      photo: (x.authorAttribution && x.authorAttribution.photoUri) || '',
      rating: x.rating || 0,
      text: (x.text && x.text.text) || '',
      when: x.relativePublishTimeDescription || '',
      url: x.googleMapsUri || d.googleMapsUri || '',
    }));
  return new Response(JSON.stringify({
    enabled: true,
    rating: d.rating || null,
    count: d.userRatingCount || 0,
    url: d.googleMapsUri || '',
    reviews,
  }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=21600' } });
}
