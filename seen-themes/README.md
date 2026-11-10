# seen-themes

Interactive "Bold" version of the SEEN store (from `seen-eyewear-v2.html`) with a theme list for visitors.
Open: `/seen-themes/index.html`. Nothing outside this folder was changed.

| File | What it does |
|---|---|
| `index.html` | The page: hero with a 3D card stack, brand marquee, featured frames, full shop with search and filters, story, WhatsApp button. AR/EN, light (default) and dark, theme menu. |
| `brand.css` | The only place colours and fonts live (CSS variables in `:root`), plus one block per theme. |
| `config.js` | Theme list, featured frames, WhatsApp number, founding year. |
| `data.js` | Read-only data layer. Downloads `../index.html` as text, takes the product, colour-name and photo-map blocks, and returns clean product objects. Writes nothing. |

| `brand-strip.js` / `brand-strip.css` | Interactive brands strip: slow drift, drag / flick / wheel with momentum, infinite loop, centre logo enlarged in full colour. |

## Brands strip — tuning (config.js → brandStrip)
- `baseSpeed`: drift in px/s. -20 = slow to the left, 20 = to the right, 0 = still.
- `friction`: how fast a flick settles back to the drift. 1 = long glide, 4 = short.
- `maxVelocity`: cap for hard flicks (px/s).
- `wheelBoost`: push per trackpad / shift+wheel step.
- `activeScale`: size of the centre logo (1.25 = 25% bigger).
- `tapThreshold`: px of movement before a press is a drag instead of a tap.
- Adding brands: leave `brands: []` to use every brand in the store (logos from `img/logo/`, missing logo = name in text),
  or list `{ name, logoUrl, link }` yourself. A click on the centre logo opens `link` in a new tab
  (default: that brand's frames in the store).

## Adding a theme
1. Add `{ id: 'myid', en: 'Name', ar: 'الاسم' }` to `themes` in `config.js`.
2. Add `:root[data-skin="myid"] { --paper: …; --accent: …; }` in `brand.css` (and a dark variant if needed).

## Open TODOs
- `config.js → whatsapp`: the store's WhatsApp number (not in the project). Until then the button opens the main store.
- `config.js → established`: founding year (optional).
- `brand.css`: values are taken from the live store; replace them if an official brand book exists.
- Buying happens on the main store: "View & buy" opens `../index.html#product-<n>`.
