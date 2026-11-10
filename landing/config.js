// SEEN landing page settings. Fill the empty values; anything left empty is hidden on the page.
window.SEEN_LANDING = {
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

  // Hero wheel: frames with transparent backgrounds (cut out from the store's photos) and their brand
  frames: [
    { src: 'img/frames/rb-wayfarer.webp', brand: 'Ray-Ban' },
    { src: 'img/frames/vo-3.webp', brand: 'Vogue' },
    { src: 'img/frames/so-1.webp', brand: 'Society' },
    { src: 'img/frames/po-1.webp', brand: 'Polaroid' },
    { src: 'img/frames/du-1.webp', brand: 'Carrera | Ducati' },
    { src: 'img/frames/rb-round.webp', brand: 'Ray-Ban' },
    { src: 'img/frames/po-2.webp', brand: 'Polaroid' },
    { src: 'img/frames/vo-1.webp', brand: 'Vogue' },
    { src: 'img/frames/ca-1.webp', brand: 'Carrera' },
    { src: 'img/frames/so-2.webp', brand: 'Society' }
  ],
  // Wheel motion: auto-turn speed (degrees per second) and how fast a flick slows down
  wheel: { speed: 7, friction: 2.4 },
  brands: [
    { name: 'Ray-Ban', logoUrl: 'img/logos/Ray-Ban_logo.svg' },
    { name: 'Maui Jim', logoUrl: 'img/logos/Maui_Jim_logo.svg' },
    { name: 'Gucci', logoUrl: 'img/logos/Gucci_logo.svg' },
    { name: 'Saint Laurent', logoUrl: 'img/logos/Saint_Laurent_logo.svg' },
    { name: 'Balenciaga', logoUrl: 'img/logos/Balenciaga_Logo.svg' },
    { name: 'Bottega Veneta', logoUrl: 'img/logos/Logo_Bottega_Veneta.svg' },
    { name: 'Valentino', logoUrl: 'img/logos/Valentino_logo.svg' },
    { name: 'Chloé', logoUrl: 'img/logos/Chlo__logo.svg' },
    { name: 'Dunhill', logoUrl: 'img/logos/Dunhill_logo.svg' },
    { name: 'Carrera | Ducati', logoUrl: 'img/logos/Ducati_red_logo.svg' },
    { name: 'Tommy Hilfiger', logoUrl: 'img/logos/Tommy_Hilfiger_logo.svg' },
    { name: 'Calvin Klein', logoUrl: 'img/logos/Calvin_klein_logo.svg' },
    { name: 'A|X Armani Exchange', logoUrl: 'img/logos/Armani_Exchange_logo.svg' },
    { name: 'DSQUARED2', logoUrl: 'img/logos/DSQUARED2.png' },
    { name: 'Puma', logoUrl: 'img/logos/Puma-logo-_text_.svg' },
    { name: 'Converse', logoUrl: 'img/logos/Converse_logo.svg' }
  ],
  brandStrip: { baseSpeed: -24, friction: 2.2, maxVelocity: 2000, wheelBoost: 9, activeScale: 1.12, popScale: 1.4, tapThreshold: 6, bend: 60, shrink: .25, depth: 700, pull: 160 }
};
