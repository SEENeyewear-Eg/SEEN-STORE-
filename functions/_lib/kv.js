// Thin wrapper over a Cloudflare KV namespace binding, with the same get/setJSON shape the accounts code used on Netlify Blobs.
// KV is eventually consistent (a write can take up to about a minute to show everywhere), so keep that in mind for counters.
export const kvStore = ns => {
  if (!ns) throw new Error('KV namespace not bound');
  return {
    get: async (key, opts) => ns.get(key, opts && opts.type === 'json' ? 'json' : 'text'),
    setJSON: (key, value) => ns.put(key, JSON.stringify(value)),
  };
};
