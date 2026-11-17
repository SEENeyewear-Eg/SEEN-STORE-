// Header behaviour for the separate pages (frames, blog, about, 3D). The home page has its own full version.
// Menus here use fixed lists, so they do not need the product catalogue.
(function () {
  // Pages on a white background: the header text and logo turn dark grey (#2F3136).
  document.body.classList.add('light-page');
  var hd = document.getElementById('hd'), mega = document.getElementById('mega');
  if (!hd || !mega) return;
  var nb = [].slice.call(document.querySelectorAll('#nav button'));
  var LINK = { sun: '/shop/sunglasses', opt: '/shop/optical', brd: '/shop' };
  var MENU = {
    svc: { h: 'Services', i: [['Hotel pick-up booking', '/#hotel'], ['Eye examination', 'https://wa.me/201112299665'], ['Visit our branch', '/visit/index.html'], ['Try on frames', '/seen-tryon-3d.html'], ['Frame consultation', 'https://wa.me/201112299665'], ['Find your face shape', '/frames/index.html'], ['Lens colour preview', '/#lenses'], ['Interactive 3D', '/3d.html']] },
    loc: { h: 'Our branches', i: [['City Center Mall · Hurghada', 'https://maps.app.goo.gl/qELR42bu6Amims959'], ['El Kawthar · Hurghada', 'https://maps.app.goo.gl/hTF2RTVjtiixjvKc7'], ['Sheraton Miramar · El Gouna', 'https://wa.me/201112299665']] },
    off: { h: 'Offers', i: [['Black Friday', '/black-friday/index.html']] }
  };
  function close() {
    mega.classList.remove('open');
    nb.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    hd.classList.remove('solid');
  }
  function open(k) {
    var m = MENU[k];
    mega.innerHTML = '<div class="mg2"><div class="mcol"><h4>' + m.h + '</h4><ul>' +
      m.i.map(function (x) {
        var ext = /^https?:/.test(x[1]);
        return '<li><a href="' + x[1] + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + x[0] + '</a></li>';
      }).join('') + '</ul></div></div>';
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
  hd.addEventListener('mouseleave', close);
  // Header buttons that need the home page go there.
  ['bs', 'ba', 'bb', 'bfv'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', function () { location.href = '/'; });
  });
  var mbt = document.getElementById('mbt');
  if (mbt) mbt.addEventListener('click', function () { location.href = '/'; });
  addEventListener('scroll', function () { hd.classList.toggle('solid', scrollY > 40); }, { passive: true });
  hd.classList.toggle('solid', scrollY > 40);
  // Footer links that open sheets on the home page go to the home page.
  document.querySelectorAll('[data-pol],[data-hbk]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); location.href = '/'; });
  });
})();
