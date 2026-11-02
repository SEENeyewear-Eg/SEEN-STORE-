# SEEN EYEWEAR — Storefront

A premium e-commerce experience for SEEN EYEWEAR, inspired by Maui Jim’s editorial storefront approach and adapted to SEEN’s own brand identity.

## Current Prototype

- Arabic-first, right-to-left storefront with an English-ready layout.
- Product discovery, product details, cart, branch pickup, customer reviews, and loyalty messaging.
- Virtual Try-On is a required launch feature. The current interface shows the intended entry points; a production camera experience requires a dedicated AR Try-On provider and prepared 3D assets.
- Sample product information and prices are placeholders until the approved catalogue is connected.

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
