// SEEN landing page settings. Fill the empty values; anything left empty is hidden on the page.
window.SEEN_LANDING = {
  // Google Ads: tag id, and the conversion label for WhatsApp clicks (from Google Ads)
  ads: { id: 'AW-18461690499', waLabel: 'uYooCMnkx7YdEIOVnONE' },
  // Offer line above the hero; it hides itself after this date (inclusive)
  offer: { end: '2026-11-20' },

  // TODO: social media links (full https:// address). Empty = icon hidden.
  social: {
    instagram: 'https://www.instagram.com/seeneyewear.eg/',
    facebook: 'https://www.facebook.com/seeneyewear.eg',
    tiktok: 'https://www.tiktok.com/@seeneyewear.eg',
    youtube: '',
    x: '',
    snapchat: '',
    pinterest: '',
    linkedin: ''
  },

  // TODO: contact. whatsapp in international format without + (e.g. '201xxxxxxxxx').
  whatsapp: '201112299665', // showroom
  phone: '',          // e.g. '+20 65 000 0000'
  email: '',          // e.g. 'hello@seeneyeweareg.com'

  // Branches (names from the store). mapUrl empty = a Google Maps search for the name is used.
  // TODO: add each branch's Google Maps link, phone and opening hours if you want them shown.
  branches: [
    { en: 'City Center Mall', ar: 'سيتي سنتر مول', cityEn: 'Hurghada', cityAr: 'الغردقة', mapUrl: 'https://maps.app.goo.gl/qELR42bu6Amims959', reviewUrl: 'https://maps.app.goo.gl/qELR42bu6Amims959', phone: '', hoursEn: '', hoursAr: '' },
    { en: 'Sheraton Miramar', ar: 'شيراتون ميرامار', cityEn: 'El Gouna', cityAr: 'الجونة', mapUrl: '', phone: '', hoursEn: '', hoursAr: '' },
    { en: 'El Kawthar', ar: 'الكوثر', cityEn: 'Hurghada', cityAr: 'الغردقة', mapUrl: 'https://maps.app.goo.gl/hTF2RTVjtiixjvKc7', reviewUrl: 'https://maps.app.goo.gl/hTF2RTVjtiixjvKc7', phone: '', hoursEn: '', hoursAr: '' }
  ],

  // Rating + suggestion form. Where answers go (pending decision):
  //   send: 'whatsapp' -> opens WhatsApp with the message ready, the visitor presses send (to the number above)
  //   send: 'endpoint' -> POST JSON to our own server at 'endpoint'
  //   send: ''         -> form is shown but not connected yet
  feedback: { send: 'whatsapp', endpoint: '' },

  // Hero wheel: 7 sun + 7 optical frames from the store catalogue (front photos, background removed).
  // size = lens-bridge-temple as coded in the store. mm = front width used by the try-on, measured on each photo: (2 x lens + bridge) x photo width / lens-to-lens span.
  frames: [
    { src: 'img/frames/sun-1.webp', kind: 'sun', brand: 'Ray-Ban', model: 'RB3025', size: '58-14-135', mm: 141 },
    { src: 'img/frames/sun-2.webp', kind: 'sun', brand: 'Carrera', model: 'CARRERA 376/S', size: '50-21-145', mm: 143.5 },
    { src: 'img/frames/sun-4.webp', kind: 'sun', brand: 'Ray-Ban', model: 'RB2216', size: '58-18-145', mm: 144 },
    { src: 'img/frames/sun-3.webp', kind: 'sun', brand: 'Carrera', model: 'CA3083/S', size: '55-16-145', mm: 147 },
    { src: 'img/frames/sun-7.webp', kind: 'sun', brand: 'Ray-Ban', model: 'RB3016', size: '51-21-145', mm: 142 },
    { src: 'img/frames/sun-5.webp', kind: 'sun', brand: 'Carrera', model: 'CARRERA 362/S', size: '55-19-145', mm: 144.5 },
    { src: 'img/frames/sun-6.webp', kind: 'sun', brand: 'Polaroid', model: 'PLD 2125/S', size: '66-18-125', mm: 145 }, // wrap frame: the 66 lens is measured along the curve, so the flat front is narrower (estimate)
    { src: 'img/frames/opt-1.webp', kind: 'opt', brand: 'Carrera', model: 'CARRERA 352', size: '49-21-145', mm: 140 },
    { src: 'img/frames/opt-2.webp', kind: 'opt', brand: 'Polaroid', model: 'PLD D555', size: '52-18-145', mm: 134.5 },
    { src: 'img/frames/opt-3.webp', kind: 'opt', brand: 'Ray-Ban', model: 'RB5435', size: '54-19-145', mm: 147 },
    { src: 'img/frames/opt-4.webp', kind: 'opt', brand: 'Polaroid', model: 'PLD D587', size: '54-17-145', mm: 141 },
    { src: 'img/frames/opt-5.webp', kind: 'opt', brand: 'Carrera', model: 'CARRERA 3097', size: '54-20-140', mm: 142 },
    { src: 'img/frames/opt-6.webp', kind: 'opt', brand: 'Ray-Ban', model: 'RB5154', size: '51-21-145', mm: 143.5 },
    { src: 'img/frames/opt-7.webp', kind: 'opt', brand: 'Society', model: 'THE-INSTRUCTOR', size: '52-20-145', mm: 144.5 }
  ],
  // Try-on sizing: frame width on the photo (%) = px * frame mm / face mm.
  //   px    = how wide the head is in each face photo at the temples (% of photo width, measured from the photos)
  //   faces = head width at the temples in mm for each face (estimates; change them when real measurements exist)
  //   frame mm comes from the store size code, so a frame keeps its real size on every face.
  fit: {
    faces: {
      m: [152, 152, 152, 152, 152, 152, 152], // oval, round, square, heart, oblong, diamond, triangle (average adult head breadth)
      w: [144, 144, 144, 144, 144, 144, 144]
    },
    px: {
      m: [83.8, 83.6, 84.3, 84.3, 83.8, 84.2, 82.4],
      w: [84.9, 84.5, 84.5, 83.1, 82.4, 84.6, 81.9]
    }
  },
  // Wheel motion: auto-turn speed (degrees per second) and how fast a flick slows down
  wheel: { speed: 7, friction: 2.4 },
  brands: [
    { name: "Alexander McQueen" },
    { name: "A|X Armani Exchange", logoUrl: 'img/logos/Armani_Exchange_logo.svg' },
    { name: "BOSS" },
    { name: "Balenciaga", logoUrl: 'img/logos/Balenciaga_Logo.svg' },
    { name: "Bottega Veneta", logoUrl: 'img/logos/Logo_Bottega_Veneta.svg' },
    { name: "CALVIN KLEIN JEANS" },
    { name: "CETIZEN" },
    { name: "CLOCKS.COLOURS" },
    { name: "Calvin Klein", logoUrl: 'img/logos/Calvin_klein_logo.svg' },
    { name: "Carrera" },
    { name: "Carrera | Ducati", logoUrl: 'img/logos/Ducati_red_logo.svg' },
    { name: "Chloé" },
    { name: "Converse", logoUrl: 'img/logos/Converse_logo.svg' },
    { name: "DSQUARED2", logoUrl: 'img/logos/DSQUARED2.png' },
    { name: "David Beckham" },
    { name: "Dunhill", logoUrl: 'img/logos/Dunhill_logo.svg' },
    { name: "Escada" },
    { name: "Fila" },
    { name: "Gucci", logoUrl: 'img/logos/Gucci_logo.svg' },
    { name: "Guy Laroche" },
    { name: "HUGO" },
    { name: "HUGO BOSS" },
    { name: "KARL LAGERFELD" },
    { name: "LIU.JO" },
    { name: "Lacoste" },
    { name: "Maui Jim", logoUrl: 'img/logos/Maui_Jim_logo.svg' },
    { name: "Polaroid" },
    { name: "Police" },
    { name: "Privé Revaux" },
    { name: "Puma" },
    { name: "RETRO" },
    { name: "ROMA" },
    { name: "ROSSINI" },
    { name: "Ray-Ban", logoUrl: 'img/logos/Ray-Ban_logo.svg' },
    { name: "Saint Laurent", logoUrl: 'img/logos/Saint_Laurent_logo.svg' },
    { name: "Scuderia Ferrari" },
    { name: "Society" },
    { name: "TANGO" },
    { name: "Tommy Hilfiger", logoUrl: 'img/logos/Tommy_Hilfiger_logo.svg' },
    { name: "USPA POLO" },
    { name: "VEDETTE" },
    { name: "VEGA" },
    { name: "Valentino", logoUrl: 'img/logos/Valentino_logo.svg' },
    { name: "Vogue" },
    { name: "XPOLO" }
  ],
  brandStrip: { baseSpeed: -24, friction: 2.2, maxVelocity: 2000, wheelBoost: 9, activeScale: 1.12, popScale: 1.4, tapThreshold: 6, bend: 60, shrink: .25, depth: 700, pull: 160 }
};
