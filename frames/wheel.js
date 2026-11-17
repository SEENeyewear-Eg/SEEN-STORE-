// Frame finder page (moved from the old coming-soon landing). Same dial, face shapes and fit logic as landing/landing.js.
(function () {
  'use strict';
  var C = {
    frames: [{"src":"img/frames/sun-1.webp","kind":"sun","brand":"Ray-Ban","model":"RB3025","size":"58-14-135","mm":141},{"src":"img/frames/sun-2.webp","kind":"sun","brand":"Carrera","model":"CARRERA 376/S","size":"50-21-145","mm":143.5},{"src":"img/frames/sun-4.webp","kind":"sun","brand":"Ray-Ban","model":"RB2216","size":"58-18-145","mm":144},{"src":"img/frames/sun-3.webp","kind":"sun","brand":"Carrera","model":"CA3083/S","size":"55-16-145","mm":147},{"src":"img/frames/sun-7.webp","kind":"sun","brand":"Ray-Ban","model":"RB3016","size":"51-21-145","mm":142},{"src":"img/frames/sun-5.webp","kind":"sun","brand":"Carrera","model":"CARRERA 362/S","size":"55-19-145","mm":144.5},{"src":"img/frames/sun-6.webp","kind":"sun","brand":"Polaroid","model":"PLD 2125/S","size":"66-18-125","mm":145},{"src":"img/frames/opt-1.webp","kind":"opt","brand":"Carrera","model":"CARRERA 352","size":"49-21-145","mm":140},{"src":"img/frames/opt-2.webp","kind":"opt","brand":"Polaroid","model":"PLD D555","size":"52-18-145","mm":134.5},{"src":"img/frames/opt-3.webp","kind":"opt","brand":"Ray-Ban","model":"RB5435","size":"54-19-145","mm":147},{"src":"img/frames/opt-4.webp","kind":"opt","brand":"Polaroid","model":"PLD D587","size":"54-17-145","mm":141},{"src":"img/frames/opt-5.webp","kind":"opt","brand":"Carrera","model":"CARRERA 3097","size":"54-20-140","mm":142},{"src":"img/frames/opt-6.webp","kind":"opt","brand":"Ray-Ban","model":"RB5154","size":"51-21-145","mm":143.5},{"src":"img/frames/opt-7.webp","kind":"opt","brand":"Society","model":"THE-INSTRUCTOR","size":"52-20-145","mm":144.5}],
    fit: {
      faces: { m: [152, 152, 152, 152, 152, 152, 152], w: [144, 144, 144, 144, 144, 144, 144] },
      px: { m: [83.8, 83.6, 84.3, 84.3, 83.8, 84.2, 82.4], w: [84.9, 84.5, 84.5, 83.1, 82.4, 84.6, 81.9] }
    },
    wheel: { speed: 7, friction: 2.4 }
  };
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var T = {
    en: { genderM: 'Men', genderW: 'Women', fitNote: 'Pick a frame from the left wheel to try it on.', faceNames: ['Oval', 'Round', 'Square', 'Heart', 'Oblong', 'Diamond', 'Triangle'] },
    ar: { genderM: 'رجال', genderW: 'نساء', fitNote: 'اختار إطار من العجلة اليسار عشان تجربه.', faceNames: ['بيضاوي', 'دائري', 'مربع', 'قلب', 'طويل', 'معيّن', 'مثلث'] }
  };
  var L = function () { return T[root.lang] ? root.lang : 'en'; };
  var t = function (k) { var v = T[L()][k]; return v != null ? v : T.en[k]; };
  function dial(stage, o) {
    var rot = 0, vel = 0, drag = null, moved = 0, hovI = -1, last = 0, vis = true, sp = o.spin || 0, fr = o.friction || 2.4;
    function els() { return stage.querySelectorAll('.dl'); }
    function place() {
      var W = stage.clientWidth, H = stage.clientHeight, cx = W * .5, cy = H / 2, R = H * .42, it = els(), n = it.length;
      for (var i = 0; i < n; i++) {
        var a = (rot + 360 / n * i - 90) * Math.PI / 180;
        var px = Math.cos(a) * R;
        it[i].style.left = (cx + px).toFixed(1) + 'px';
        if (o.side) {   // fade out towards the line where the two half wheels meet, instead of a hard cut
          var op = Math.max(0, Math.min(1, (px * o.side - W * .09) / (W * .11)));
          it[i].style.opacity = op.toFixed(2); it[i].style.pointerEvents = op < .35 ? 'none' : '';
        }
        it[i].style.top = (cy + Math.sin(a) * R).toFixed(1) + 'px';
      }
    }
    function ang(e) {
      var r = stage.getBoundingClientRect();
      return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width * .5)) * 180 / Math.PI;
    }
    stage.addEventListener('pointerdown', function (e) { if (e.button) return; drag = { a: ang(e), t: performance.now() }; moved = 0; vel = 0; });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var a = ang(e), d = a - drag.a; if (d > 180) d -= 360; if (d < -180) d += 360;
      var now = performance.now(), dt = Math.max(1, now - drag.t) / 1000;
      rot += d; vel = vel * .5 + (d / dt) * .5; drag.a = a; drag.t = now; moved += Math.abs(d);
      if (moved > 4) stage.classList.add('dragging');
      place();
    });
    var end = function () {
      if (!drag) return;
      if (performance.now() - drag.t > 90) vel = 0;
      vel = Math.max(-900, Math.min(900, vel)); drag = null; stage.classList.remove('dragging');
    };
    window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
    stage.addEventListener('wheel', function (e) {
      var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!d) return; e.preventDefault(); vel = Math.max(-900, Math.min(900, vel + d * 1.4));
    }, { passive: false });
    stage.addEventListener('click', function (e) {
      if (moved > 4) { moved = 0; return; }
      var b = e.target.closest && e.target.closest('.dl'); if (b && o.onPick) o.onPick(+b.dataset.i);
    });
    stage.addEventListener('pointerover', function (e) {
      if (e.pointerType !== 'mouse') return;
      var b = e.target.closest && e.target.closest('.dl'), i = b ? +b.dataset.i : -1;
      if (i !== hovI) { hovI = i; if (o.onHover) o.onHover(i); }
    });
    stage.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && hovI !== -1) { hovI = -1; if (o.onHover) o.onHover(-1); } });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; }).observe(stage);
    window.addEventListener('resize', place);
    (function loop(ts) {
      var dt = last ? Math.min(.05, (ts - last) / 1000) : 0; last = ts;
      if (vis && !drag) {
        vel *= Math.exp(-fr * dt); if (Math.abs(vel) < .5) vel = 0;
        var step = vel + (hovI >= 0 ? 0 : sp);
        if (step) { rot += step * dt; place(); }
      }
      requestAnimationFrame(loop);
    })(0);
    return function setItems(items) {
      stage.innerHTML = items.map(function (x, i) {
        return '<button type="button" class="dl' + (x.cls ? ' ' + x.cls : '') + '" data-i="' + i + '" aria-label="' + esc(x.label) + '">' + x.html + '<span class="dl-tip" aria-hidden="true">' + esc(x.label) + '</span></button>';
      }).join('');
      place();
    };
  }
  var FACE_D = [
    '<ellipse cx="150" cy="190" rx="98" ry="132"/>',
    '<circle cx="150" cy="190" r="122"/>',
    '<rect x="54" y="62" width="192" height="256" rx="70"/>',
    '<path d="M150 326C92 288 56 240 56 172C56 112 102 74 150 110C198 74 244 112 244 172C244 240 208 288 150 326Z"/>',
    '<rect x="82" y="50" width="136" height="280" rx="68"/>',
    '<path d="M150 56C200 104 240 146 240 190C240 240 200 288 150 328C100 288 60 240 60 190C60 146 100 104 150 56Z"/>',
    '<path d="M62 92C100 70 200 70 238 92C256 170 214 280 150 332C86 280 44 170 62 92Z"/>'
  ];
  var FACE_KEY = ['oval', 'round', 'square', 'heart', 'oblong', 'diamond', 'triangle'];
  function faceImg(i) { var g = fitSt.gender === 'w' ? 'w' : 'm'; return '<img class="face-img" src="img/faces/' + g + '-' + FACE_KEY[i] + '.png" alt="" draggable="false" onerror="this.style.visibility=hidden">'; }
  var headUid = 0;
  var fitSt = { face: 0, hovF: -1, frame: -1, hov: -1, gender: 'm', kind: 'sun', chosen: false }, setFrames = null, setFaces = null;
  function fitFrames() {
    var all = (C.frames || []).map(function (x) { return typeof x === 'string' ? { src: x, brand: '' } : x; });
    var some = all.filter(function (x) { return !x.kind || x.kind === fitSt.kind; });
    return some.length ? some : all;
  }
  var KIND_TXT = { en: ['Sun', 'Optical'], ar: ['شمسي', 'طبي'], de: ['Sonne', 'Optik'], ru: ['Солнце', 'Оптика'], es: ['Sol', 'Óptica'], fr: ['Soleil', 'Optique'] };
  // Frame width on the try-on photo (% of photo width) = head width in the photo * real frame mm / real face mm
  function fitFramePct(f, fc) {
    var F = C.fit || {}, g = fitSt.gender === 'w' ? 'w' : 'm';
    var faceMM = ((F.faces || {})[g] || [])[fc] || 150, px = ((F.px || {})[g] || [])[fc] || 83.5;
    return Math.round(px * (f.mm || faceMM * 0.9) / faceMM * 10) / 10;
  }
  function fitRender() {
    var fr = fitFrames(), fi = fitSt.hov >= 0 ? fitSt.hov : fitSt.frame, f = fr[fi];
    var fc = fitSt.hovF >= 0 ? fitSt.hovF : fitSt.face;
    document.getElementById('lensStage').classList.toggle('previewing', !!(fitSt.chosen || fitSt.hov >= 0 || fitSt.hovF >= 0));
    $('fitFace').innerHTML = faceImg(fc) +
      (f ? '<img class="fit-frame" src="' + esc(f.src) + '" alt="" style="width:' + fitFramePct(f, fc) + '%" onerror="this.remove()">' : '');
    var names = t('faceNames') || T.en.faceNames;
    $('fitName').textContent = names[fc] + (f && f.brand ? ' · ' + f.brand + (f.model ? ' ' + f.model : '') + (f.size ? ' · ' + f.size : '') : '');
  }
  function segRender() {
    var seg = $('genderSeg'), ks = $('kindSeg'), kt = KIND_TXT[L()] || KIND_TXT.en;
    function btns(list, cur, attr) {
      return list.map(function (g) {
        return '<button type="button" role="radio" aria-checked="' + (cur === g[0]) + '" data-' + attr + '="' + g[0] + '">' + esc(g[1]) + '</button>';
      }).join('');
    }
    if (seg) seg.innerHTML = btns([['m', t('genderM') || 'Men'], ['w', t('genderW') || 'Women']], fitSt.gender, 'g');
    if (ks) ks.innerHTML = btns([['sun', kt[0]], ['opt', kt[1]]], fitSt.kind, 'k');
  }
  function fitInit() {
    var cfg = C.wheel || {};
    var setF = dial($('frameWheel'), { side: -1, spin: reduce ? 0 : (cfg.speed == null ? 7 : cfg.speed), friction: cfg.friction || 2.4,
      onHover: function (i) { fitSt.hov = i; fitRender(); },
      onPick: function (i) { fitSt.frame = i; fitRender(); } });
    setFrames = function () {
      setF(fitFrames().map(function (x) { return { label: x.brand || 'frame', html: '<img src="' + esc(x.src) + '" alt="" draggable="false" onerror="this.parentNode.remove()">' }; }));
    };
    setFaces = dial($('faceWheel'), { side: 1, spin: reduce ? 0 : (cfg.speed == null ? 7 : cfg.speed), friction: cfg.friction || 2.4,
      onHover: function (i) { fitSt.hovF = i; fitRender(); },
      onPick: function (i) { fitSt.face = i; fitSt.chosen = true; fitRender(); } });
    $('kindSeg').addEventListener('click', function (e) {
      var k = e.target.closest('[data-k]'); if (!k) return;
      fitSt.kind = k.dataset.k; fitSt.frame = -1; fitSt.hov = -1; segRender(); setFrames(); fitRender();
    });
    $('genderSeg').addEventListener('click', function (e) {
      var b = e.target.closest('[data-g]'); if (!b) return;
      fitSt.gender = b.dataset.g; segRender(); fitSetFaces(); fitRender();
    });
    fitSetFaces(); setFrames(); fitRender();
  }
  function fitSetFaces() {
    if (!setFaces) return;
    var names = t('faceNames') || T.en.faceNames;
    setFaces(names.map(function (n, i) {
      return { label: n, cls: 'face', html: '<span class="fc">' + faceImg(i) + '</span>' };
    }));
    segRender();
  }

  fitInit();
})();
