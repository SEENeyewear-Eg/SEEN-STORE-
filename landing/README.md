# SEEN landing page ("online store coming soon")

A self-contained static page for Google Ads campaigns. No build step, no packages, no database,
and it collects no visitor data. Upload the whole `landing/` folder to any web server.

## Files
| File | What it does |
|---|---|
| `index.html` | The page (EN/AR, light/dark). The official SEEN logo is inlined from the store header. |
| `landing.css` | Design and animations. Brand colours/fonts are the CSS variables at the top. |
| `landing.js` | Text in both languages, animations, builds services / branches / social icons. |
| `config.js` | **Fill this in:** social links, WhatsApp, phone, email, Google Maps links, opening hours. Empty values are hidden. |
| `brand-strip.js/.css` | Interactive brands strip (same as seen-themes). |
| `img/` | Logo, favicon, 16 brand logos, 6 product photos (copied from the store). |

## Put it online (any server)
1. Fill `config.js`.
2. Upload the folder contents to the site root (e.g. `public_html/`) or a sub-folder (e.g. `public_html/lp/`).
3. The server must serve it over **https** and without a password, or Google Ads rejects it.
4. Use the page address (e.g. `https://seeneyeweareg.com/` or `/lp/`) as the ad's final URL.

## Google Ads checklist
- Page opens for everyone (no login, no 401/403), on https, fast on mobile.
- Business name, locations and contact visible (branches section + footer + contact line).
- No collection of personal data on this page (so no privacy-policy form is required by the page itself;
  add a privacy page link in the footer if the ads account asks for one).
