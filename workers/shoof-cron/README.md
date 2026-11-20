# Shoof hourly sync (Cloudflare Worker)

Copies Shoof products, branches and stock into the `seen-shoof` KV namespace every hour, so the site
never waits on the POS. It runs the same code as the sync button on the site (`POST /api/shoof-status`).

## Steps (done by the owner on their own machine and Cloudflare account)

1. Get the id of the `seen-shoof` KV namespace: Workers & Pages → KV → seen-shoof → copy the Namespace ID.
2. Put that id in `wrangler.toml`, in place of `REPLACE_WITH_SEEN_SHOOF_NAMESPACE_ID`.
3. Log in once: `npx wrangler login` (opens a browser, sign in with the Cloudflare account yourself).
4. Deploy from this folder: `npx wrangler deploy`.
5. Set the secrets on the Worker (never in the code), one at a time:
   `npx wrangler secret put SHOOF_CLIENT_ID`, then `SHOOF_CLIENT_SECRET`, `SHOOF_APP_TOKEN`,
   `SHOOF_COMPANY_ID` (and `SHOOF_BASE` only if it is not the default).
6. Check: Workers & Pages → seen-shoof-sync → Logs, after the next full hour. Each run writes one line: "Shoof sync {...}".

Once it has run successfully, `netlify/` can be removed (in a separate commit).
