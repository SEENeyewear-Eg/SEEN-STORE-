// Header behaviour for the separate pages (frames, blog, about, 3D). The home page has its own full version.
// Menus here use fixed lists, so they do not need the product catalogue.
(function () {
  // Pages on a white background: the header text and logo turn dark grey (#2F3136).
  document.body.classList.add('light-page');
  var hd = document.getElementById('hd'), mega = document.getElementById('mega');
  if (!hd || !mega) return;
  var nb = [].slice.call(document.querySelectorAll('#nav button'));
  var LINK = {};
  var SOONT={en:'Coming soon',ar:'قريباً',de:'Demnächst',es:'Próximamente',fr:'Bientôt disponible',it:'In arrivo',ru:'Скоро'};
  var SL='en'; try{SL=localStorage.seenLang||'en'}catch(e){}
  var SOON=SOONT[SL]||SOONT.en;
  var MENU = {
    sun: { cols: [
      [{ h: 'Shop by category', i: [['Men', '/shop/sunglasses?a=MAN'], ['Women', '/shop/sunglasses?a=WOMAN'], ['All sunglasses', '/shop/sunglasses']] }],
      [{ h: 'Shop by shape', i: [['Round / Oval', '/shop/sunglasses'], ['Rectangular', '/shop/sunglasses'], ['Cat eye', '/shop/sunglasses'], ['Pilot', '/shop/sunglasses']] }],
      [{ h: 'Top brands', i: [['Ray-Ban', '/shop'], ['Maui Jim', '/shop'], ['Polaroid', '/shop'], ['Carrera', '/shop'], ['Gucci', '/shop']] }]
    ] },
    opt: { cols: [
      [{ h: 'Shop by category', i: [['Men', '/shop/optical?a=MAN'], ['Women', '/shop/optical?a=WOMAN'], ['All optical frames', '/shop/optical']] }],
      [{ h: 'Top brands', i: [['Ray-Ban', '/shop'], ['Vogue', '/shop'], ['Carrera', '/shop'], ['Polaroid', '/shop'], ['Society', '/shop']] }]
    ] },
    brd: { cols: [
      [{ h: 'Brands', i: [['Alexander McQueen', '/shop'], ['Armani Exchange', '/shop'], ['Balenciaga', '/shop'], ['Bottega Veneta', '/shop'], ['Calvin Klein', '/shop'], ['Carrera', '/shop'], ['Chloé', '/shop'], ['Converse', '/shop'], ['Dsquared2', '/shop'], ['Dunhill', '/shop']] }],
      [{ h: 'Brands', i: [['Escada', '/shop'], ['Fila', '/shop'], ['Gucci', '/shop'], ['Guy Laroche', '/shop'], ['Hugo Boss', '/shop'], ['Lacoste', '/shop'], ['Liu Jo', '/shop'], ['Maui Jim', '/shop'], ['Nike', '/shop'], ['Police', '/shop']] }],
      [{ h: 'Brands', i: [['Polaroid', '/shop'], ['Prive Revaux', '/shop'], ['Puma', '/shop'], ['Ray-Ban', '/shop'], ['Saint Laurent', '/shop'], ['Society', '/shop'], ['Tommy Hilfiger', '/shop'], ['Valentino', '/shop'], ['Vogue', '/shop']] }]
    ] },
    svc: { cols: [
      [{ h: 'Book a visit', i: [['Hotel pick-up booking', '/hotel-pickup/index.html']] }],
      [{ h: 'Explore', i: [['Find your face shape', '/frames/index.html'], ['Lens colour preview', '/lens/index.html'], ['Interactive 3D', '/3d.html'], ['Try on frames', '/try-on-frames/index.html']] }]
    ] },
    loc: { h: 'Our branches', i: [['City Center Mall · Hurghada', 'https://maps.app.goo.gl/qELR42bu6Amims959'], ['El Kawthar · Hurghada', 'https://maps.app.goo.gl/hTF2RTVjtiixjvKc7'], ['Sheraton Miramar · El Gouna', 'https://wa.me/201112299665']] },
    off: { h: 'Offers', i: [['Black Friday', '/offers/index.html']] }
  };
  function close() {
    mega.classList.remove('open');
    nb.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    hd.classList.remove('solid');
  }
  function colHtml(groups) {
    return '<div class="mcol">' + groups.map(function (g) {
      return '<h4>' + g.h + '</h4><ul>' + g.i.map(function (x) {
        if (x[2] === 'soon') return '<li><span>' + x[0] + '</span> <small>' + SOON + '</small></li>';
        var ext = /^https?:/.test(x[1]);
        return '<li><a href="' + x[1] + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + x[0] + '</a></li>';
      }).join('') + '</ul>';
    }).join('') + '</div>';
  }
  function open(k) {
    var m = MENU[k];
    var cols = m.cols ? m.cols : [[{ h: m.h, i: m.i }]];
    mega.innerHTML = '<div class="mg2">' + cols.map(colHtml).join('') + '</div>';
    mega.classList.add('open');
    nb.forEach(function (b) { b.setAttribute('aria-expanded', String(b.dataset.m === k)); });
    hd.classList.add('solid');
  }
  nb.forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.dataset.m;
      if (LINK[k]) { location.href = LINK[k]; return; }
      if (mega.classList.contains('open') && b.getAttribute('aria-expanded') === 'true') close();
      else open(k);
    });
  });
  // Hover opens the menus, as on the home page (click still works for touch and keyboard).
  var hoverT = null, closeT = null;
  nb.forEach(function (b) {
    b.addEventListener('mouseenter', function () {
      clearTimeout(closeT); clearTimeout(hoverT);
      var k = b.dataset.m;
      if (LINK[k]) return;
      hoverT = setTimeout(function () { open(k); }, 90);
    });
  });
  document.querySelectorAll('#nav a').forEach(function (a) {
    a.addEventListener('mouseenter', function () { clearTimeout(hoverT); if (mega.classList.contains('open')) close(); });
  });
  hd.addEventListener('mouseenter', function () { clearTimeout(closeT); });
  hd.addEventListener('mouseleave', function () { clearTimeout(hoverT); closeT = setTimeout(close, 160); });
  // Header buttons that need the home page go there.
  ['bs', 'ba', 'bb', 'bfv'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', function () { location.href = '/'; });
  });
  var mbt = document.getElementById('mbt');
  // Phone menu: the header links are hidden on small screens, so the menu button opens them in a panel.
  var PANEL_LINKS = [
    ['Home', '/'], ['Sunglasses', '/shop/sunglasses'], ['Optical', '/shop/optical'], ['Brands', '/shop'],
    ['Hotel pick-up booking', '/hotel-pickup/index.html'],     ['Find your face shape', '/frames/index.html'], ['Lens colour preview', '/lens/index.html'], ['Interactive 3D', '/3d.html'],
    ['Try on frames', '/try-on-frames/index.html'], ['Visit Us', '/visit/index.html'], ['Blog', '/blog/index.html'], ['Offers', '/offers/index.html']
  ];
  function openPanel() {
    var p = document.getElementById('navPanel');
    if (!p) {
      p = document.createElement('div');
      p.id = 'navPanel';
      p.setAttribute('role', 'dialog');
      p.setAttribute('aria-label', 'Menu');
      p.style.cssText = 'position:fixed;inset:0;z-index:90;background:#fff;overflow:auto;padding:16px 22px 20px;font-family:Jost,system-ui,sans-serif;color:#111';
      p.innerHTML = '<button type="button" id="navClose" aria-label="Close menu" style="position:absolute;top:16px;right:16px;background:none;border:0;font-size:32px;line-height:1;cursor:pointer;color:#111">&times;</button><ul style="list-style:none;margin:0;padding:0">' +
        PANEL_LINKS.map(function (x) {
          if (x[2] === 'soon') return '<li style="border-bottom:1px solid #e3e5e7"><span style="display:block;padding:8px 4px;font-size:16px;color:#111">' + x[0] + ' <small style="color:#8a8f96">' + SOON + '</small></span></li>';
          var ext = /^https?:/.test(x[1]);
          return '<li style="border-bottom:1px solid #e3e5e7"><a href="' + x[1] + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + ' style="display:block;padding:8px 4px;font-size:16px;color:#111;text-decoration:none">' + x[0] + '</a></li>';
        }).join('') + '</ul>';
      document.body.appendChild(p);
      document.getElementById('navClose').addEventListener('click', function () { p.style.display = 'none'; });
      p.addEventListener('click', function (e) { if (e.target.tagName === 'A') p.style.display = 'none'; });
    }
    p.style.display = 'block';
  }

  // Phone menu: the same menu as the home page (sections that open, translated labels).
  var MM_HTML = "<a class=\"ms\" href=\"/\">Home</a><a class=\"ms\" href=\"/shop\">All Shop</a><details><summary>Sunglasses</summary><b class=\"mh\">Shop by category</b><ul><li><a href=\"/shop/sunglasses?a=MAN\">Men</a></li><li><a href=\"/shop/sunglasses?a=WOMAN\">Women</a></li></ul><b class=\"mh\">Shop by collection</b><ul><li><a href=\"/shop/sunglasses\">Luxury Eyewear</a></li><li><a href=\"/shop/sunglasses\">Casual Eyewear</a></li></ul><b class=\"mh\">Trending brands</b><ul><li><a href=\"/brands/gucci\">GUCCI</a></li><li><a href=\"/brands/maui-jim\">MAUI JIM</a></li><li><a href=\"/brands/polaroid\">POLAROID</a></li></ul><b class=\"mh\">Shop by activity</b><ul><li><a href=\"/shop?ac=DRIVING\">Driving</a></li><li><a href=\"/shop?ac=BEACH\">Beach</a></li><li><a href=\"/shop?ac=DIVING\">Diving</a></li><li><a href=\"/shop?ac=RUNNING\">Running</a></li><li><a href=\"/shop?ac=TENNIS\">Tennis</a></li><li><a href=\"/shop?ac=GOLF\">Golf</a></li><li><a href=\"/shop?ac=HIKING\">Hiking</a></li><li><a href=\"/shop?ac=FISHING\">Fishing</a></li></ul></details><details><summary>Optical</summary><b class=\"mh\">Shop by category</b><ul><li><a href=\"/shop/optical?a=WOMAN\">Women</a></li><li><a href=\"/shop/optical?a=MAN\">Men</a></li><li><a href=\"/shop/optical\">Ready Readers</a></li></ul><b class=\"mh\">Shop by collection</b><ul><li><a href=\"/shop/optical\">Luxury Eyewear</a></li><li><a href=\"/shop/optical\">Casual Eyewear</a></li><li><a href=\"/shop/optical\">Best Sellers</a></li><li><a href=\"/shop/optical\">Blue Light Filter</a></li></ul></details><details><summary>Brands</summary><b class=\"mh\">Brands</b><ul><li><a href=\"/brands/alexander-mcqueen\">ALEXANDER MCQUEEN</a></li><li><a href=\"/brands/armani-exchange\">ARMANI EXCHANGE</a></li><li><a href=\"/brands/balenciaga\">BALENCIAGA</a></li><li><a href=\"/brands/boss\">BOSS</a></li><li><a href=\"/brands/bottega-veneta\">BOTTEGA VENETA</a></li><li><a href=\"/brands/calvin-klein\">CALVIN KLEIN</a></li><li><a href=\"/brands/calvin-klein-jeans\">CALVIN KLEIN JEANS</a></li><li><a href=\"/brands/carrera\">CARRERA</a></li><li><a href=\"/brands/carrera-ducati\">CARRERA DUCATI</a></li><li><a href=\"/brands/chloe\">CHLOE</a></li><li><a href=\"/brands/clocks-colours\">CLOCKS.COLOURS</a></li><li><a href=\"/brands/converse\">CONVERSE</a></li><li><a href=\"/brands/david-beckham\">DAVID BECKHAM</a></li><li><a href=\"/brands/dsquared2\">DSQUARED2</a></li><li><a href=\"/brands/dunhill\">DUNHILL</a></li><li><a href=\"/brands/escada\">ESCADA</a></li><li><a href=\"/brands/fila\">FILA</a></li><li><a href=\"/brands/gucci\">GUCCI</a></li><li><a href=\"/brands/guy-laroche\">GUY LAROCHE</a></li><li><a href=\"/brands/hugo\">HUGO</a></li><li><a href=\"/brands/hugo-boss\">HUGO BOSS</a></li><li><a href=\"/brands/karl-lagerfeld\">KARL LAGERFELD</a></li><li><a href=\"/brands/lacoste\">LACOSTE</a></li><li><a href=\"/brands/liu-jo\">LIU.JO</a></li><li><a href=\"/brands/maui-jim\">MAUI JIM</a></li><li><a href=\"/brands/nike\">NIKE</a></li><li><a href=\"/brands/polaroid\">POLAROID</a></li><li><a href=\"/brands/police\">POLICE</a></li><li><a href=\"/brands/prive-revaux\">PRIVE REVAUX</a></li><li><a href=\"/brands/puma\">PUMA</a></li><li><a href=\"/brands/ray-ban\">RAY BAN</a></li><li><a href=\"/brands/saint-laurent\">SAINT LAURENT</a></li><li><a href=\"/brands/scuderia-ferrari\">SCUDERIA FERRARI</a></li><li><a href=\"/brands/society\">SOCIETY</a></li><li><a href=\"/brands/tommy-hilfiger\">TOMMY HILFIGER</a></li><li><a href=\"/brands/uspa-polo\">USPA POLO</a></li><li><a href=\"/brands/valentino\">VALENTINO</a></li><li><a href=\"/brands/vogue\">VOGUE</a></li></ul></details><details><summary>Services</summary><b class=\"mh\">Book a visit</b><ul><li><a href=\"/hotel-pickup/index.html\">Hotel pick-up booking</a></li></ul><b class=\"mh\">Explore</b><ul><li><a href=\"/frames/index.html\">Find your face shape</a></li><li><a href=\"/lens/index.html\">Lens colour preview</a></li><li><a href=\"/3d.html\">Interactive 3D</a></li><li><a href=\"/try-on-frames/index.html\">Try on frames</a></li></ul></details><a class=\"ms\" href=\"/blog/index.html\">Blog</a><a class=\"ms\" href=\"/offers\">Offers<sup style=\"color:#d62828;font-weight:600;margin-inline-start:4px\">%</sup></a>";
  var MM_I18N = {"ar":{"Home":"الرئيسية","All Shop":"كل المتجر","Sunglasses":"شمسية","Shop by category":"تسوق حسب الفئة","Men":"رجالي","Women":"حريمي","Shop by collection":"تسوق حسب المجموعة","Luxury Eyewear":"نظارات فاخرة","Casual Eyewear":"نظارات كاجوال","Trending brands":"أشهر البراندات","Shop by activity":"تسوّق حسب النشاط","Driving":"القيادة","Beach":"البحر","Diving":"الغوص","Running":"الجري","Tennis":"التنس","Golf":"الجولف","Hiking":"المشي الجبلي","Fishing":"الصيد","Optical":"طبية","Ready Readers":"نظارات قراءة جاهزة","Best Sellers":"الأكثر مبيعاً","Blue Light Filter":"فلتر الضوء الأزرق","Brands":"البراندات","Services":"الخدمات","Book a visit":"احجز زيارة","Hotel pick-up booking":"حجز استلام من الفندق","Explore":"اكتشف","Find your face shape":"اكتشف شكل وجهك","Lens colour preview":"معاينة ألوان العدسات","Interactive 3D":"عرض ثلاثي الأبعاد","Try on frames":"تجربة الإطارات","Blog":"المدونة","Offers":"تخفيضات"},"de":{"Home":"Startseite","All Shop":"Alle Brillen","Sunglasses":"Sonnenbrillen","Shop by category":"Nach Kategorie einkaufen","Men":"Herren","Women":"Damen","Shop by collection":"Nach Kollektion einkaufen","Luxury Eyewear":"Luxusbrillen","Casual Eyewear":"Freizeitbrillen","Trending brands":"Beliebte Marken","Shop by activity":"Nach Aktivität einkaufen","Driving":"Autofahren","Beach":"Strand","Diving":"Tauchen","Running":"Laufen","Tennis":"Tennis","Golf":"Golf","Hiking":"Wandern","Fishing":"Angeln","Optical":"Brillen","Ready Readers":"Lesebrillen","Best Sellers":"Bestseller","Blue Light Filter":"Blaulichtfilter","Brands":"Marken","Services":"Services","Book a visit":"Besuch buchen","Hotel pick-up booking":"Hotel-Abholung buchen","Explore":"Entdecken","Find your face shape":"Gesichtsform finden","Lens colour preview":"Linsenfarben-Vorschau","Interactive 3D":"Interaktives 3D","Try on frames":"Fassungen anprobieren","Blog":"Blog","Offers":"Angebote"},"es":{"Home":"Inicio","All Shop":"Todas las gafas","Sunglasses":"Gafas de sol","Shop by category":"Comprar por categoría","Men":"Hombre","Women":"Mujer","Shop by collection":"Comprar por colección","Luxury Eyewear":"Gafas de lujo","Casual Eyewear":"Gafas casual","Trending brands":"Marcas populares","Shop by activity":"Compra por actividad","Driving":"Conducir","Beach":"Playa","Diving":"Buceo","Running":"Running","Tennis":"Tenis","Golf":"Golf","Hiking":"Senderismo","Fishing":"Pesca","Optical":"Ópticas","Ready Readers":"Gafas de lectura","Best Sellers":"Más vendidos","Blue Light Filter":"Filtro de luz azul","Brands":"Marcas","Services":"Servicios","Book a visit":"Reserva una visita","Hotel pick-up booking":"Reserva de recogida en hotel","Explore":"Explorar","Find your face shape":"Encuentra la forma de tu cara","Lens colour preview":"Vista previa de colores de lentes","Interactive 3D":"3D interactivo","Try on frames":"Pruébate monturas","Blog":"Blog","Offers":"Ofertas"},"fr":{"Home":"Accueil","All Shop":"Toutes les lunettes","Sunglasses":"Lunettes de soleil","Shop by category":"Acheter par catégorie","Men":"Homme","Women":"Femme","Shop by collection":"Acheter par collection","Luxury Eyewear":"Lunettes de luxe","Casual Eyewear":"Lunettes décontractées","Trending brands":"Marques tendance","Shop by activity":"Acheter par activité","Driving":"Conduite","Beach":"Plage","Diving":"Plongée","Running":"Course à pied","Tennis":"Tennis","Golf":"Golf","Hiking":"Randonnée","Fishing":"Pêche","Optical":"Optique","Ready Readers":"Lunettes de lecture","Best Sellers":"Meilleures ventes","Blue Light Filter":"Filtre lumière bleue","Brands":"Marques","Services":"Services","Book a visit":"Réserver une visite","Hotel pick-up booking":"Réservation de retrait à l’hôtel","Explore":"Explorer","Find your face shape":"Trouvez la forme de votre visage","Lens colour preview":"Aperçu des couleurs de verres","Interactive 3D":"3D interactive","Try on frames":"Essayer des montures","Blog":"Blog","Offers":"Offres"},"it":{"Home":"Home","All Shop":"Tutti gli occhiali","Sunglasses":"Occhiali da sole","Shop by category":"Acquista per categoria","Men":"Uomo","Women":"Donna","Shop by collection":"Acquista per collezione","Luxury Eyewear":"Occhiali di lusso","Casual Eyewear":"Occhiali casual","Trending brands":"Marchi di tendenza","Shop by activity":"Acquista per attività","Driving":"Guida","Beach":"Spiaggia","Diving":"Immersioni","Running":"Corsa","Tennis":"Tennis","Golf":"Golf","Hiking":"Escursionismo","Fishing":"Pesca","Optical":"Ottica","Ready Readers":"Occhiali da lettura","Best Sellers":"Più venduti","Blue Light Filter":"Filtro luce blu","Brands":"Marchi","Services":"Servizi","Book a visit":"Prenota una visita","Hotel pick-up booking":"Prenotazione ritiro in hotel","Explore":"Esplora","Find your face shape":"Trova la forma del tuo viso","Lens colour preview":"Anteprima colori lenti","Interactive 3D":"3D interattivo","Try on frames":"Prova le montature","Blog":"Blog","Offers":"Offerte"},"ru":{"Home":"Главная","All Shop":"Все очки","Sunglasses":"Солнцезащитные очки","Shop by category":"Покупки по категориям","Men":"Мужские","Women":"Женские","Shop by collection":"Покупки по коллекциям","Luxury Eyewear":"Роскошные очки","Casual Eyewear":"Повседневные очки","Trending brands":"Популярные бренды","Shop by activity":"Покупки по занятию","Driving":"Вождение","Beach":"Пляж","Diving":"Дайвинг","Running":"Бег","Tennis":"Теннис","Golf":"Гольф","Hiking":"Походы","Fishing":"Рыбалка","Optical":"Оптика","Ready Readers":"Очки для чтения","Best Sellers":"Хиты продаж","Blue Light Filter":"Фильтр синего света","Brands":"Бренды","Services":"Услуги","Book a visit":"Записаться на визит","Hotel pick-up booking":"Бронирование получения в отеле","Explore":"Раздел","Find your face shape":"Определите форму лица","Lens colour preview":"Предпросмотр цвета линз","Interactive 3D":"Интерактивный 3D","Try on frames":"Примерка оправ","Blog":"Блог","Offers":"Акции"}};
  var MM_CSS = '#mm{position:fixed;top:0;bottom:0;left:0;right:auto;width:50vw;max-width:50vw;background:#fff;color:#0b0b0b;z-index:9000;padding:24px;display:flex;flex-direction:column;transform:translateX(-100%);transition:transform .4s cubic-bezier(.2,.7,.2,1);font-family:Jost,system-ui,sans-serif}' +
    '#mm.on{transform:none}' + '#mm{width:50vw!important;max-width:50vw!important}' + '#mm #xm{font-size:34px;line-height:1;padding:0 4px}' +
    '[dir="rtl"] #mm{left:auto;right:0;transform:translateX(100%)}[dir="rtl"] #mm.on{transform:none}' +
    '#mm h3{margin:0 0 16px;font-size:26px;font-weight:300;display:flex;justify-content:space-between;align-items:center}' +
    '#mm h3 span{font-size:22px}' +
    '#mm #xm{background:none;border:0;cursor:pointer;padding:4px;color:#0b0b0b}' +
    '#mm #mml{flex:1;overflow:auto}' +
    '#mm details{border-bottom:1px solid #e3e5e7}' +
    '#mm summary{list-style:none;cursor:pointer;padding:16px 0;font-size:20px;display:flex;justify-content:space-between}' +
    '#mm summary::-webkit-details-marker{display:none}' +
    '#mm summary::after{content:"+";font-weight:300}' +
    '#mm details[open] summary::after{content:"–"}' +
    '#mm ul{list-style:none;margin:0 0 14px;padding:0}' +
    '#mm li a{display:block;padding:9px 0;font-size:16px;color:inherit;text-decoration:none}' +
    '#mm .ms{display:block;font-size:20px;padding:16px 0;border-bottom:1px solid #e3e5e7;color:inherit;text-decoration:none}' +
    '#mm .mh{display:block;font-weight:500;margin:14px 0 6px;font-size:13px;color:#8a8f96}' +
    '#mm a:hover,#mm a:active{color:#5AC8FA}' +
    'html[lang="ar"] #mm *{font-family:"IBM Plex Sans Arabic",Jost,sans-serif!important}';
  function openMM() {
    var m = document.getElementById('mm');
    if (!m) {
      var st = document.createElement('style'); st.id = 'mmCss'; st.textContent = MM_CSS; document.head.appendChild(st);
      m = document.createElement('aside');
      m.id = 'mm'; m.className = 'mm'; m.setAttribute('aria-label', 'Menu');
      m.innerHTML = '<h3><span>Menu</span><button type="button" id="xm" aria-label="Close">&times;</button></h3><div id="mml">' + MM_HTML + '</div>';
      document.body.appendChild(m);
      m.querySelector('#xm').addEventListener('click', function () { m.classList.remove('on'); });
      m.querySelector('#mml').addEventListener('click', function (e) { if (e.target.closest('a')) m.classList.remove('on'); });
      var lg = 'en'; try { lg = localStorage.seenLang || 'en'; } catch (e) {}
      var map = MM_I18N[lg];
      if (map) {
        var walker = document.createTreeWalker(m.querySelector('#mml'), NodeFilter.SHOW_TEXT, null);
        var n; while ((n = walker.nextNode())) { var t = n.nodeValue.trim(); if (t && map[t]) n.nodeValue = n.nodeValue.replace(t, map[t]); }
        var mt = m.querySelector('h3 span'); if (mt && map['Menu']) mt.textContent = map['Menu'];
      }
      if (lg === 'ar') document.documentElement.setAttribute('lang', 'ar');
    }
    m.classList.add('on');
  }
  if (mbt) mbt.addEventListener('click', openMM);

  // Swipe left closes the phone menu.
  document.addEventListener('touchstart', function (e) { window.__nsx = e.touches[0].clientX; window.__nsy = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', function (e) { var p = document.getElementById('navPanel'); if (!p || p.style.display !== 'block') return; var t = e.changedTouches[0]; var dx = t.clientX - window.__nsx, dy = t.clientY - window.__nsy; if (dx < -60 && Math.abs(dy) < 80) p.style.display = 'none'; }, { passive: true });
  addEventListener('scroll', function () { hd.classList.toggle('solid', scrollY > 40); }, { passive: true });
  hd.classList.toggle('solid', scrollY > 40);
  // Footer links that open sheets on the home page go to the home page.
  document.querySelectorAll('[data-pol],[data-hbk]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); location.href = '/'; });
  });
})();

// Mobile bottom bar (Home, All Shop, Brands, Favourites, Bag, Account) on the separate pages, same as the home page.
// On the home page the bar is already in the page, so this does nothing there.
(function () {
  if (document.getElementById('bnav')) return;
  var st = document.createElement('style');
  st.textContent = '.bnav{display:none}.bnav{box-sizing:border-box;width:100%;max-width:100vw}.bnav button{min-width:0;flex:1 1 0;overflow:hidden}' +
    '@media (max-width:900px){' +
    '.bnav{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:60;direction:inherit;justify-content:space-around;align-items:stretch;background:#fff;color:#111;border-top:0.5px solid #d9dee2;padding:6px 4px calc(6px + env(safe-area-inset-bottom,0px))}' +
    '.bnav button{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:0;color:#8a8f96;font:inherit;font-size:10px;font-weight:500;padding:6px 0 4px;cursor:pointer;border-radius:14px}' +
    '.bnav button.cur{color:#5AC8FA!important}.bnav button.cur svg{stroke:#5AC8FA}.bnav,.bnav button,.bnav span{line-height:normal!important}.bnav span{padding:0!important;margin:0!important}.bnav{height:59px!important;box-sizing:border-box!important;align-items:stretch!important}.bnav button{height:46px!important;min-height:0!important;max-height:46px!important;padding:6px 0 4px!important;overflow:hidden!important;justify-content:center!important}' +
    '.bnav svg{width:28px;height:28px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}' +
    'body{padding-bottom:72px}}' +
    '.dk .bnav{background:#151618;color:#fff;border-top-color:#2a2d31}.dk .bnav button.cur{color:#fff}' + '.ftr-g{display:none!important}.ftr{display:block!important;padding:14px 16px 18px!important;border-top:1px solid #e3e5e7;margin-top:24px}.ftr .ftr-b{display:flex!important;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px 18px}@media (max-width:900px){input,select,textarea{font-size:16px!important}.bnav svg{width:28px!important;height:28px!important}.bnav button{font-size:11px!important;position:relative;min-width:0;overflow:hidden}.bnav button span{white-space:nowrap;overflow:visible;line-height:1.6;padding-bottom:2px;max-width:100%}.bnav button.cur::before{content:"";position:absolute;top:-6px;left:50%;transform:translateX(-50%);width:30px;height:3px;border-radius:3px;background:#5AC8FA}}';
  document.head.appendChild(st);
  var ITEMS = [
    ['home', 'Home', '/', '<path d="M4 11l8-7 8 7v9h-5v-6h-6v6H4z"/>'],
    ['shop', 'All Shop', '/shop', '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9h16v11H4z"/><path d="M9 20v-6h6v6"/>'],
    ['brands', 'Brands', '/shop', '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>'],
    ['fav', 'Favourites', '/?open=fav', '<path d="M12 19.5s-7.2-4.4-7.2-9.6a4 4 0 0 1 7.2-2.4 4 4 0 0 1 7.2 2.4c0 5.2-7.2 9.6-7.2 9.6z"/>'],
    ['bag', 'Bag', '/?open=bag', '<path d="M6 8h12l1 12H5z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>'],
    ['acc', 'Account', '/?open=acc', '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3.2"/><path d="M6.5 18.2c1.4-2.2 3.2-3.2 5.5-3.2s4.1 1 5.5 3.2"/>']
  ];
  var path = location.pathname.replace(/\/+$/, '') || '/';
  var cur = path === '/' && !location.hash ? 'home' : path.indexOf('/shop') === 0 ? 'shop' : '';
  var OVER = { acc: '/#account', fav: '/#account/saved', bag: '/#cart' };
  function openPanel(src, pct) {
    var W = pct || 50;
    if (document.getElementById('bpanel')) return;
    var w = document.createElement('div'); w.id = 'bpanel';
    w.style.cssText = 'position:fixed;inset:0;z-index:95;background:rgba(0,0,0,.45);display:flex;justify-content:flex-end';
    var f = document.createElement('iframe'); f.src = src.replace('/#', '/?panel=1#');
    f.style.cssText = 'width:' + W + 'vw;height:100%;border:0;background:#fff;animation:bpIn .4s cubic-bezier(.2,.7,.2,1)';
    if (!document.getElementById('bpanelCss')) { var kf = document.createElement('style'); kf.id = 'bpanelCss'; kf.textContent = '@keyframes bpIn{from{transform:translateX(100%)}to{transform:none}}'; document.head.appendChild(kf); }
    var x = document.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.textContent = '×';
    x.style.cssText = 'position:absolute;top:10px;left:calc(' + W + 'vw + 10px);z-index:2;width:40px;height:40px;border-radius:50%;border:0;background:#fff;font-size:26px;line-height:1;cursor:pointer';
    var close = function () { w.remove(); };
    x.addEventListener('click', close);
    w.addEventListener('click', function (e) { if (e.target === w) close(); });
    w.appendChild(f); document.body.appendChild(w);
  }
  var nav = document.createElement('nav');
  var BT={ar:['الرئيسية','كل المتجر','البراندات','المفضلة','الحقيبة','الحساب'],de:['Startseite','Alle Brillen','Marken','Favoriten','Tasche','Konto'],es:['Inicio','Todas las gafas','Marcas','Favoritos','Bolsa','Cuenta'],fr:['Accueil','Toutes les lunettes','Marques','Favoris','Panier','Compte'],it:['Home','Tutti gli occhiali','Marchi','Preferiti','Borsa','Account'],ru:['Главная','Все очки','Бренды','Избранное','Сумка','Аккаунт']};var LG='en';try{LG=localStorage.seenLang||'en'}catch(e){}var BL=BT[LG]||null;
  nav.className = 'bnav'; nav.id = 'bnav'; nav.setAttribute('aria-label', 'Quick links');
  nav.innerHTML = ITEMS.map(function (x) {
    return '<button type="button" data-k="' + x[0] + '" data-go="' + x[2] + '"' + (x[0] === cur ? ' class="cur"' : '') + '>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true">' + x[3] + '</svg><span>' + (BL ? BL[ITEMS.indexOf(x)] : x[1]) + '</span></button>';
  }).join('');
  nav.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-go]');
    if (b) { var k = b.getAttribute('data-k'); if (!document.getElementById('home') && OVER[k]) openPanel(OVER[k], 80); else location.href = b.getAttribute('data-go'); }
  });
  document.body.appendChild(nav);
  // Keep the bar on the visible bottom edge when the phone's browser toolbar moves.
  function fitBar() { var vv = window.visualViewport; if (!vv) return; var gap = Math.max(0, window.innerHeight - vv.height - vv.offsetTop); nav.style.bottom = gap + 'px'; }
  if (window.visualViewport) { visualViewport.addEventListener('resize', fitBar); visualViewport.addEventListener('scroll', fitBar); }
  addEventListener('resize', fitBar); fitBar();
})();
