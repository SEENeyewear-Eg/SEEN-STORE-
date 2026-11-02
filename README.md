# SEEN EYEWEAR — Storefront

A premium e-commerce experience for SEEN EYEWEAR, inspired by Maui Jim’s editorial storefront approach and adapted to SEEN’s own brand identity.

## Current Prototype

- English storefront in a single page (`index.html`): home, catalog with filters, product page, bag and checkout (branch pick-up or home delivery).
- Interactive 3D section (`seen-3d-preview.html`) and a live camera try-on with face tracking (`seen-tryon-3d.html`), using the demo models `sunglasses.glb` and `seen-glasses.glb`.
- Product names, prices and stock come from the real catalogue; photos, descriptions and color names are still pending. The 3D models are generic demos, not SEEN products.
- Checkout, payments and sign-in are demo only: no real order or payment is made.

## Run in GitHub Codespaces

From the project directory, run:

```bash
python3 -m http.server 8000
```

Then open port 8000 from the Codespaces **Ports** panel.

## Implementation Roadmap

1. Apply the approved SEEN logo files, Arabic and English brand fonts, photography, and product catalogue.
2. Confirm the company accounting and inventory system, then define its API or data-export integration.
3. Select and validate the Virtual Try-On provider against a representative product set.
4. Connect WooCommerce, Egyptian payment and shipping services, branch pickup, reviews, and SEEN Rewards.
5. Review the exchange policy, accessibility, mobile experience, privacy, and launch readiness.
