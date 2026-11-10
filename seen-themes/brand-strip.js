// Interactive brands strip: slow drift + drag / flick / wheel with momentum, infinite loop,
// active logo at the centre. Plain JS, no libraries. Usage:
//   SeenBrandStrip.mount(sectionElement, brands, config)
// brands: [{ name, logoUrl, link }]   config: see config.js → brandStrip
(function () {
  'use strict';

  var DEFAULTS = { baseSpeed: -20, friction: 2.2, maxVelocity: 2000, wheelBoost: 9, activeScale: 1.12, tapThreshold: 6,
    bend: 60, shrink: .25, depth: 700, pull: 160, popScale: 1.4 };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function itemHtml(b, i, clone) {
    var inner = b.logoUrl
      ? '<img src="' + esc(b.logoUrl) + '" alt="' + esc(b.name) + '" decoding="async" draggable="false" data-fb="1">'
      : '<span class="bstrip-word">' + esc(b.name) + '</span>';
    return '<button type="button" class="bstrip-item" data-k="' + i + '"' +
      (clone ? ' aria-hidden="true" tabindex="-1"' : ' aria-label="' + esc(b.name) + '"') + '>' +
      '<span class="bstrip-no" aria-hidden="true">No. ' + String(i + 1).padStart(2, '0') + '</span>' +
      '<span class="bstrip-card">' + inner + '</span>' +
      '<span class="bstrip-name" aria-hidden="true">' + esc(b.name) + '</span></button>';
  }

  function mount(section, brands, cfg) {
    cfg = Object.assign({}, DEFAULTS, cfg || {});
    if (!section || !brands || !brands.length) return null;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var friction = reduce ? 14 : cfg.friction;            // reduced motion: only a short ease, no long glide
    var base = reduce ? 0 : cfg.baseSpeed;

    // Three copies: [clone][original][clone], x wraps by the width of one copy
    var set = function (clone) { return '<div class="bstrip-set"' + (clone ? ' aria-hidden="true"' : '') + '>' + brands.map(function (b, i) { return itemHtml(b, i, clone); }).join('') + '</div>'; };
    section.classList.add('bstrip');
    section.style.setProperty('--bs-scale', cfg.activeScale);
    section.style.setProperty('--bs-pop', cfg.popScale);
    section.innerHTML = '<div class="bstrip-track">' + set(true) + set(false) + set(true) + '</div>';
    var track = section.firstChild;
    var items = Array.from(track.querySelectorAll('.bstrip-item'));
    var realItems = items.filter(function (el) { return !el.hasAttribute('aria-hidden'); });

    // Broken logo → brand name as text (keeps the strip intact)
    track.addEventListener('error', function (e) {
      var img = e.target; if (!(img instanceof HTMLImageElement) || !img.dataset.fb) return;
      var s = document.createElement('span'); s.className = 'bstrip-word'; s.textContent = img.alt; img.replaceWith(s); measure();
    }, true);
    // Logos change width when they finish loading → re-measure.
    // Also detect "badge" logos that carry their own solid background (e.g. Ray-Ban's red box):
    // those must keep their real colours in dark mode instead of being inverted.
    var badge = {};
    track.addEventListener('load', function (e) {
      var img = e.target;
      if (img instanceof HTMLImageElement) {
        var src = img.getAttribute('src');
        if (badge[src] == null) badge[src] = isBadge(img);
        if (badge[src]) img.closest('.bstrip-item').classList.add('is-badge');
      }
      measure();
    }, true);
    function isBadge(img) {
      try {
        var c = document.createElement('canvas'), w = 40, h = Math.max(1, Math.round(40 * img.naturalHeight / (img.naturalWidth || 1)));
        c.width = w; c.height = h; var g = c.getContext('2d'); g.drawImage(img, 0, 0, w, h);
        var px = [[1, 1], [w - 2, 1], [1, h - 2], [w - 2, h - 2]], solid = 0;
        px.forEach(function (p) { var d = g.getImageData(p[0], p[1], 1, 1).data; if (d[3] > 200 && (d[0] + d[1] + d[2]) < 720) solid++; });
        return solid >= 3;                                   // three opaque, non-white corners = has its own box
      } catch (er) { return false; }
    }

    var x = 0, v = base, setW = 0, centres = [], active = -1;
    var dragging = false, hovering = false, moved = false, pid = null, startX = 0, lastX = 0, samples = [];
    var spring = null;                                      // target x while centring a tapped logo
    var visible = true, raf = 0, last = 0;

    function measure() {
      var first = track.children[0];
      setW = first.getBoundingClientRect().width;
      centres = items.map(function (el) { return el.offsetLeft + el.offsetWidth / 2; });
      if (!x) x = -setW;
    }
    function wrap() {
      if (!setW) return;
      while (x > 0) { x -= setW; if (spring != null) spring -= setW; }
      while (x <= -2 * setW) { x += setW; if (spring != null) spring += setW; }
    }
    function clampV(n) { return Math.max(-cfg.maxVelocity, Math.min(cfg.maxVelocity, n)); }
    function nearest() {
      var mid = section.clientWidth / 2, best = -1, bd = Infinity;
      for (var i = 0; i < centres.length; i++) { var d = Math.abs(centres[i] + x - mid); if (d < bd) { bd = d; best = i; } }
      return best;
    }
    // Tunnel warp: the further a card is from the centre, the more it turns its outer edge away
    // (rotateY) and shrinks, so the row looks like it is being pulled into a curved hole.
    var warped = [];
    function warp() {
      var W = section.clientWidth, mid = W / 2, half = W / 2 || 1;
      for (var i = 0; i < items.length; i++) {
        var d = (centres[i] + x - mid) / half;            // -1 … 1 across the visible strip
        var ad = Math.abs(d);
        // Off-screen: fade out but stay focusable (visibility:hidden would block keyboard Tab)
        if (ad > 1.35) { if (warped[i] !== 'off') { items[i].style.opacity = '0'; items[i].style.pointerEvents = 'none'; warped[i] = 'off'; } continue; }
        var c = Math.max(-1.2, Math.min(1.2, d));
        var rot = c * cfg.bend;                              // degrees
        var s = 1 - Math.min(1, ad) * cfg.shrink;
        var z = -Math.pow(Math.min(1.2, ad), 2) * cfg.pull;  // edges sink back, as if pulled into the hole
        if (warped[i] === 'off') { items[i].style.opacity = ''; items[i].style.pointerEvents = ''; }
        items[i].style.transform = 'perspective(' + cfg.depth + 'px) translateZ(' + z.toFixed(1) + 'px) rotateY(' + rot.toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')';
        items[i].style.zIndex = String(100 - Math.round(ad * 60));
        warped[i] = 'on';
      }
    }
    function render() {
      wrap();
      track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      warp();
      var a = nearest();
      if (a !== active) {                                    // only touch classes when it changes
        if (items[active]) items[active].classList.remove('is-active');
        if (items[a]) items[a].classList.add('is-active');
        active = a;
      }
    }

    function frame(t) {
      raf = 0;
      if (!visible || document.hidden) { last = 0; return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : 0; last = t;
      if (!dragging) {
        if (spring != null) {
          var k = 1 - Math.exp(-(reduce ? 18 : 10) * dt);
          x += (spring - x) * k; v = 0;
          if (Math.abs(spring - x) < .4) { x = spring; spring = null; v = 0; }
        } else {
          var target = hovering ? 0 : base;                 // hover pauses the drift, not the push
          v += (target - v) * (1 - Math.exp(-friction * dt));
          x += v * dt;
        }
      }
      render();
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf && visible) { last = 0; raf = requestAnimationFrame(frame); } }

    // Centre a given item index with a short spring
    function centre(i) {
      var mid = section.clientWidth / 2;
      spring = mid - centres[i];
      // pick the copy of the target that is closest, so it never jumps a whole loop
      while (spring - x > setW / 2) spring -= setW;
      while (x - spring > setW / 2) spring += setW;
      start();
    }
    function openLink(i) {
      var b = brands[+items[i].dataset.k]; if (b && b.link) window.open(b.link, '_blank', 'noopener,noreferrer');
    }
    function tap(el) {
      var i = items.indexOf(el); if (i < 0) return;
      if (i === active && spring == null) openLink(i); else centre(i);
    }

    // ---- Pointer: drag follows the hand, release keeps the flick's velocity ----
    // Touch: the logo under the finger pops out (and shows its name) while it is held
    var pressed = null;
    function press(el) { if (pressed === el) return; if (pressed) pressed.classList.remove('is-pressed'); pressed = el; if (el) el.classList.add('is-pressed'); }
    section.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') press(e.target.closest('.bstrip-item'));
    });
    ['pointerup', 'pointercancel'].forEach(function (t) {
      section.addEventListener(t, function () { var p = pressed; setTimeout(function () { if (pressed === p) press(null); }, 900); });
    });
    section.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      dragging = true; moved = false; pid = e.pointerId; spring = null; v = 0;
      startX = lastX = e.clientX; samples = [{ t: performance.now(), x: e.clientX }];
      try { section.setPointerCapture(pid); } catch (er) {}
      section.classList.add('dragging');
    });
    section.addEventListener('pointermove', function (e) {
      if (!dragging || e.pointerId !== pid) return;
      var dx = e.clientX - lastX; lastX = e.clientX;
      if (Math.abs(e.clientX - startX) > cfg.tapThreshold) moved = true;
      x += dx; render();
      var now = performance.now(); samples.push({ t: now, x: e.clientX });
      while (samples.length > 2 && now - samples[0].t > 100) samples.shift();
    });
    function end(e) {
      if (!dragging || (e && e.pointerId !== pid)) return;
      dragging = false; section.classList.remove('dragging');
      try { section.releasePointerCapture(pid); } catch (er) {}
      if (moved) {
        var a = samples[0], b = samples[samples.length - 1], dt = (b.t - a.t) / 1000;
        v = dt > 0 ? clampV((b.x - a.x) / dt) : 0;
        if (reduce) v = clampV(v * .4);
      } else if (e && e.type === 'pointerup') {
        var el = document.elementFromPoint(e.clientX, e.clientY);
        el = el && el.closest('.bstrip-item');
        if (el && section.contains(el)) tap(el);
      }
      start();
    }
    section.addEventListener('pointerup', end);
    section.addEventListener('pointercancel', end);
    // Clicks are handled by the tap logic above; block the native one so a drag never "clicks"
    section.addEventListener('click', function (e) { if (e.detail !== 0) e.preventDefault(); });

    // ---- Wheel / trackpad: horizontal (or shift + vertical) pushes the strip; plain vertical scrolls the page ----
    section.addEventListener('wheel', function (e) {
      var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
      if (!d) return;
      e.preventDefault(); spring = null;
      v = clampV(v - d * cfg.wheelBoost);
      start();
    }, { passive: false });

    // ---- Hover pauses the drift ----
    section.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hovering = true; });
    section.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hovering = false; });

    // ---- Keyboard: arrows move focus to the neighbour and centre it; Enter opens the active brand ----
    section.addEventListener('keydown', function (e) {
      var el = e.target.closest && e.target.closest('.bstrip-item'); if (!el) return;
      var r = realItems.indexOf(el); if (r < 0) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        var n = realItems[(r + (e.key === 'ArrowRight' ? 1 : -1) + realItems.length) % realItems.length];
        n.focus({ preventScroll: true }); centre(items.indexOf(n));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); var i = items.indexOf(el);
        if (i === active) openLink(i); else centre(i);
      }
    });
    section.addEventListener('focusin', function (e) {
      var el = e.target.closest && e.target.closest('.bstrip-item'); if (el && !dragging) centre(items.indexOf(el));
    });

    // ---- Battery: run only while on screen and the tab is visible ----
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) start(); }, { rootMargin: '100px' }).observe(section);
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });
    window.addEventListener('resize', function () { var ratio = setW ? x / setW : -1; measure(); x = ratio * setW; render(); });
    window.addEventListener('load', function () { measure(); render(); });

    measure(); render(); start();
    return { centre: centre };
  }

  window.SeenBrandStrip = { mount: mount };
})();
