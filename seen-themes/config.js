// Settings for the seen-themes page. Change these freely; nothing here touches the store's data.
window.SEEN_THEMES_CONFIG = {
  // Theme list shown to visitors. "href" themes open another page; the others restyle this page.
  // To add a theme: add an entry here and a matching :root[data-skin="<id>"] block in brand.css.
  themes: [
    { id: 'classic', href: '../index.html', en: 'Classic store', ar: 'المتجر الكلاسيكي' },
    { id: 'white', en: 'Bold — White', ar: 'جريء — أبيض' },
    { id: 'sky', en: 'Bold — Sky', ar: 'جريء — سماوي' }
  ],
  defaultTheme: 'white',

  // Featured frames on the home section. Empty = picked automatically
  // (one per brand, models that have photos and stock). Or list "Brand|Model", e.g. 'Ray-Ban|RB3025'.
  featured: [],
  featuredCount: 6,
  // Brands strip (see brand-strip.js). brands: [] = every brand in the store, with the store's logos.
  // Or list your own: { name: 'Ray-Ban', logoUrl: '../img/logo/Ray-Ban_logo.svg', link: '../index.html#shop?b=Ray-Ban' }
  brandStrip: {
    brands: [],
    baseSpeed: -20,      // px per second the strip drifts on its own (negative = to the left, 0 = still)
    friction: 2.2,       // how fast a flick slows back to the drift (higher = stops sooner)
    maxVelocity: 2000,   // px per second, cap for hard flicks
    wheelBoost: 9,       // how much one wheel / trackpad step pushes the strip
    activeScale: 1.12,   // size of the logo nearest the centre
    popScale: 1.4,       // size of the logo you point at / touch (its name shows only then)
    tapThreshold: 6,     // px of movement before a press counts as a drag, not a tap
    bend: 60,            // degrees the edge logos turn away ("black hole" curve); 0 = flat row
    shrink: .25,         // how much smaller the edge logos get (0.25 = 25%)
    depth: 700,          // perspective in px; lower = stronger 3D
    pull: 160            // how far the edge logos sink back, in px
  },

  // How many frames sit on the half-circle in the hero (picked the same way, photos only).
  heroCount: 18,

  // TODO: the store's WhatsApp number in international format without + (e.g. '201xxxxxxxxx').
  // Not found anywhere in the project. While empty, the button opens the store's home page instead.
  whatsapp: '',

  // TODO: founding year for the hero line ("Est. ____"). Leave empty to hide it.
  established: ''
};
