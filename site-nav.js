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
  addEventListener('scroll', function () { hd.classList.toggle('solid', scrollY > 40); }, { passive: true });
  hd.classList.toggle('solid', scrollY > 40);
  // Footer links that open sheets on the home page go to the home page.
  document.querySelectorAll('[data-pol],[data-hbk]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); location.href = '/'; });
  });
})();
