// Builds black-friday/index.html from the landing page's offer styles and script (copied once, then kept here).
const fs = require('fs');
const path = require('path');
const T = process.env.TEMP;
const root = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(T, 'offer.css'), 'utf8');
let render = fs.readFileSync(path.join(T, 'render.js'), 'utf8');
render = render.split("'#booking'").join("'/shop'").split('"#booking"').join('"/shop"');
const tilt = fs.readFileSync(path.join(T, 'tilt.js'), 'utf8');

const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Limited offer at SEEN: buy one pair of sunglasses or optical frames and get the second pair free, until 20 November 2026.">
<title>Black Friday offer | SEEN Eyewear</title>
<style>
:root{--ease:cubic-bezier(.2,.7,.2,1);--highlight:#5AC8FA;--ink:#0b0b0b;--muted:#606060;--surface:#f2f2f2;--paper:#fff;--line:#e3e5e7}
.bf-wrap{max-width:1180px;margin:0 auto;padding:0 16px 88px;text-align:center}
.bf-k{letter-spacing:.22em;text-transform:uppercase;font-size:12px;color:#6b7278;margin:0}
.bf-h{font-weight:300;font-size:clamp(38px,5.6vw,64px);line-height:1.1;margin:14px 0 16px;letter-spacing:-.01em}
.bf-lead{max-width:600px;margin:0 auto;font-size:17px;line-height:1.7;color:#3a3f44}
.bf-wrap .offer{margin:44px auto 0;text-align:start}
.bf-note{margin:26px 0 0;font-size:14px;line-height:1.6;color:#666}
.bf-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:28px}
.bf-btn{display:inline-block;padding:14px 26px;border-radius:999px;border:1px solid #5AC8FA;background:#F6F8F9;color:#0b0b0b;text-decoration:none;font-size:15px}
.bf-btn.dark{background:#F6F8F9;border-color:#5AC8FA;color:#0b0b0b}
.bf-btn:hover{opacity:.85}
.bf-wrap{perspective:900px}
.bf-h{display:inline-block;transform-origin:50% 50%;animation:bfSpin 8s infinite,bfColor 8s infinite}
@keyframes bfSpin{
  0%{transform:rotateY(0deg) scale(1);animation-timing-function:ease-in-out}
  30%{transform:rotateY(360deg) scale(1)}
  34%{transform:rotateY(360deg) scale(1.16)}
  38%{transform:rotateY(360deg) scale(.9)}
  42%{transform:rotateY(360deg) scale(1)}
  100%{transform:rotateY(360deg) scale(1)}
}
@keyframes bfColor{
  0%,30%{color:#2F3136;text-shadow:none}
  36%{color:#5AC8FA;text-shadow:0 0 18px rgba(90,200,250,.6)}
  44%{color:#2F3136;text-shadow:none}
  52%{color:#E8B04B;text-shadow:0 0 18px rgba(232,176,75,.6)}
  60%{color:#5AC8FA;text-shadow:0 0 18px rgba(90,200,250,.6)}
  68%,100%{color:#2F3136;text-shadow:none}
}
@media (prefers-reduced-motion: reduce){.bf-h{animation:none}}
`;

const body = `</style>
</head>
<body>
<main class="bf-wrap">
  <p class="bf-k">Limited offer</p>
  <h1 class="bf-h">Black Friday at SEEN</h1>
  <p class="bf-lead">Two pairs, one calm decision. Choose your favourite sunglasses or optical frames and let the second pair be on us.</p>

  <div class="offer" id="offer"></div>

  <p class="bf-note">Sunglasses and optical frames. Prescription lenses are excluded.</p>

  <div class="bf-btns">
    <a class="bf-btn dark" href="/shop/sunglasses">Shop sunglasses</a>
    <a class="bf-btn" href="/shop/optical">Shop optical frames</a>
  </div>
</main>
<script>
(function(){
  var C = { offer: { end: '2026-11-20' } };
  var fine = window.matchMedia('(pointer: fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var T = { en: {
    offerNote: 'Sunglasses and optical frames. Prescription lenses excluded.',
    offerKick: 'Limited offer', offerA: 'Buy one', offerB: 'get the second pair', offerFree: 'FREE',
    offerUntil: 'Until 20 November', offerUnits: ['days', 'hrs', 'min', 'sec'], ctaWa: 'Shop Now'
  } };
  function t(k) { return T.en[k]; }
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
`;

const tail = `
  offerRender();
  ${tilt}
})();
</script>
</body>
</html>
`;

const page = head + css + '\n' + body + render + '\n' + tail;
fs.writeFileSync(path.join(root, 'black-friday', 'index.html'), page, 'utf8');
console.log('black-friday page written', page.length);
