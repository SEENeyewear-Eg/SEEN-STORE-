// Header behaviour for the separate pages (frames, blog, about, 3D). The home page has its own full version.
// Menus here use fixed lists, so they do not need the product catalogue.
(function () {
  // Pages on a white background: the header text and logo turn dark grey (#2F3136).
  document.body.classList.add('light-page');
  var hd = document.getElementById('hd'), mega = document.getElementById('mega');
  if (!hd || !mega) return;
  var nb = [].slice.call(document.querySelectorAll('#nav button'));
  var LINK = {};
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
      [{ h: 'Book a visit', i: [['Hotel pick-up booking', '/#hotel']] }],
      [{ h: 'Consultation', i: [['Frame consultation', 'https://wa.me/201112299665'], ['Eye examination', 'https://wa.me/201112299665']] }],
      [{ h: 'Explore', i: [['Try on frames', '/seen-tryon-3d.html'], ['Find your face shape', '/frames/index.html'], ['Lens colour preview', '/lens/index.html'], ['Interactive 3D', '/3d.html']] }]
    ] },
    loc: { h: 'Our branches', i: [['City Center Mall · Hurghada', 'https://maps.app.goo.gl/qELR42bu6Amims959'], ['El Kawthar · Hurghada', 'https://maps.app.goo.gl/hTF2RTVjtiixjvKc7'], ['Sheraton Miramar · El Gouna', 'https://wa.me/201112299665']] },
    off: { h: 'Offers', i: [['Black Friday', '/black-friday/index.html']] }
  };
  function close() {
    mega.classList.remove('open');
    nb.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    hd.classList.remove('solid');
  }
  function colHtml(groups) {
    return '<div class="mcol">' + groups.map(function (g) {
      return '<h4>' + g.h + '</h4><ul>' + g.i.map(function (x) {
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
    ['Hotel pick-up booking', '/#hotel'], ['Eye examination', 'https://wa.me/201112299665'], ['Frame consultation', 'https://wa.me/201112299665'],
    ['Try on frames', '/seen-tryon-3d.html'], ['Find your face shape', '/frames/index.html'], ['Lens colour preview', '/lens/index.html'], ['Interactive 3D', '/3d.html'],
    ['Visit Us', '/visit/index.html'], ['Blog', '/blog/index.html'], ['Offers', '/black-friday/index.html']
  ];
  function openPanel() {
    var p = document.getElementById('navPanel');
    if (!p) {
      p = document.createElement('div');
      p.id = 'navPanel';
      p.setAttribute('role', 'dialog');
      p.setAttribute('aria-label', 'Menu');
      p.style.cssText = 'position:fixed;inset:0;z-index:90;background:#fff;overflow:auto;padding:70px 22px 40px;font-family:Jost,system-ui,sans-serif;color:#111';
      p.innerHTML = '<button type="button" id="navClose" aria-label="Close menu" style="position:absolute;top:16px;right:16px;background:none;border:0;font-size:32px;line-height:1;cursor:pointer;color:#111">&times;</button><ul style="list-style:none;margin:0;padding:0">' +
        PANEL_LINKS.map(function (x) {
          var ext = /^https?:/.test(x[1]);
          return '<li style="border-bottom:1px solid #e3e5e7"><a href="' + x[1] + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + ' style="display:block;padding:16px 4px;font-size:18px;color:#111;text-decoration:none">' + x[0] + '</a></li>';
        }).join('') + '</ul>';
      document.body.appendChild(p);
      document.getElementById('navClose').addEventListener('click', function () { p.style.display = 'none'; });
      p.addEventListener('click', function (e) { if (e.target.tagName === 'A') p.style.display = 'none'; });
    }
    p.style.display = 'block';
  }
  if (mbt) mbt.addEventListener('click', openPanel);
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
  st.textContent = '.bnav{display:none}' +
    '@media (max-width:900px){' +
    '.bnav{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:60;direction:ltr;justify-content:space-around;align-items:stretch;background:#fff;color:#111;border-top:0.5px solid #d9dee2;padding:6px 4px calc(6px + env(safe-area-inset-bottom,0px))}' +
    '.bnav button{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:0;color:#8a8f96;font:inherit;font-size:10px;font-weight:500;padding:6px 0 4px;cursor:pointer;border-radius:14px}' +
    '.bnav button.cur{color:#111}.bnav button.cur svg{stroke:#5AC8FA}' +
    '.bnav svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}' +
    'body{padding-bottom:72px}}' +
    '.dk .bnav{background:#151618;color:#fff;border-top-color:#2a2d31}.dk .bnav button.cur{color:#fff}' + '@media (max-width:900px){.ftr{display:none!important}.bnav svg{width:28px!important;height:28px!important}.bnav button{font-size:11px!important;position:relative;min-width:0;overflow:hidden}.bnav button span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.bnav button.cur::before{content:"";position:absolute;top:-6px;left:50%;transform:translateX(-50%);width:30px;height:3px;border-radius:3px;background:#5AC8FA}}';
  document.head.appendChild(st);
  var ITEMS = [
    ['home', 'Home', '/', '<path d="M4 11l8-7 8 7v9h-5v-6h-6v6H4z"/>'],
    ['shop', 'All Shop', '/shop', '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9h16v11H4z"/><path d="M9 20v-6h6v6"/>'],
    ['brands', 'Brands', '/shop', '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>'],
    ['fav', 'Favourites', '/#favourites', '<path d="M12 19.5s-7.2-4.4-7.2-9.6a4 4 0 0 1 7.2-2.4 4 4 0 0 1 7.2 2.4c0 5.2-7.2 9.6-7.2 9.6z"/>'],
    ['bag', 'Bag', '/cart', '<path d="M6 8h12l1 12H5z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>'],
    ['acc', 'Account', '/#account', '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3.2"/><path d="M6.5 18.2c1.4-2.2 3.2-3.2 5.5-3.2s4.1 1 5.5 3.2"/>']
  ];
  var path = location.pathname.replace(/\/+$/, '') || '/';
  var cur = path === '/' && !location.hash ? 'home' : path.indexOf('/shop') === 0 ? 'shop' : '';
  var nav = document.createElement('nav');
  nav.className = 'bnav'; nav.id = 'bnav'; nav.setAttribute('aria-label', 'Quick links');
  nav.innerHTML = ITEMS.map(function (x) {
    return '<button type="button" data-go="' + x[2] + '"' + (x[0] === cur ? ' class="cur"' : '') + '>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true">' + x[3] + '</svg><span>' + x[1] + '</span></button>';
  }).join('');
  nav.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-go]');
    if (b) location.href = b.getAttribute('data-go');
  });
  document.body.appendChild(nav);
  // Keep the bar on the visible bottom edge when the phone's browser toolbar moves.
  function fitBar() { var vv = window.visualViewport; if (!vv) return; var gap = Math.max(0, window.innerHeight - vv.height - vv.offsetTop); nav.style.bottom = gap + 'px'; }
  if (window.visualViewport) { visualViewport.addEventListener('resize', fitBar); visualViewport.addEventListener('scroll', fitBar); }
  addEventListener('resize', fitBar); fitBar();
})();
