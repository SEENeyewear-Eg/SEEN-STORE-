// One-time move: takes the flip-book photo viewer out of the landing page and puts it on /visit/.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const rd = f => fs.readFileSync(path.join(root, f), 'utf8');
const wr = (f, s) => fs.writeFileSync(path.join(root, f), s, 'utf8');

const land = rd('landing/landing.html'.replace('landing.html', 'index.html'));
const css = rd('landing/landing.css');
const js = rd('landing/landing.js');
const lang = rd('landing/lang.js');

// --- texts (English, as the landing page shows them) ---
const mbLine = lang.split('\n')[31];
const mb = JSON.parse(mbLine.match(/mb: (\[[^\]]*\])/)[1]);
const capsEn = JSON.parse(lang.split('\n')[30].match(/caps: (\[[^\]]*\])/)[1]);
const en = JSON.parse(JSON.stringify({
  kMag: 'Showroom · Issue 01', hMag: 'Inside SEEN', pMag: 'Step into our boutiques in Hurghada and El Gouna, where every frame is chosen, tried on and explained with care.',
  q: 'Every frame has a story. We help you find yours.', caps: capsEn, mb: mb, bkEnd: 'Hurghada · El Gouna · Egypt', foot: 'Hurghada · El Gouna · Egypt'
}));

// --- CSS: the flip-book rules (landing lines from "Flip-book" to the end of its reduced-motion block) ---
const cssStart = css.indexOf('/* Flip-book:');
const cssEnd = css.indexOf('/* Header photo carousel');
if (cssStart < 0 || cssEnd < 0) throw new Error('css markers');
const bookCss = css.slice(cssStart, cssEnd);

// --- JS: the flip-book functions (from its heading down to the offer banner) ---
const jsStart = js.indexOf('  /* ---------- Showroom flip-book ---------- */');
const jsEnd = js.indexOf('  /* Offer banner:');
if (jsStart < 0 || jsEnd < 0) throw new Error('js markers');
let bookJs = js.slice(jsStart, jsEnd);
bookJs = bookJs.split("'img/showroom/").join("'/img/showroom/").split('"img/showroom/').join('"/img/showroom/');
bookJs = bookJs.replace("var sr = $('showroom'); if (!sr || getComputedStyle(sr).display === 'none') return;", '');
bookJs = bookJs.replace(/var Tt = T\[L\(\)\], caps = Tt\.caps \|\| T\.en\.caps, mb = Tt\.mb \|\| T\.en\.mb;/, 'var Tt = T.en, caps = Tt.caps, mb = Tt.mb;');

// --- 1. visit page: gallery block becomes the flip-book ---
let visit = rd('visit/index.html');
const galStart = visit.indexOf('  <div class="gal">');
const galEnd = visit.indexOf('  <div class="rule"></div>', galStart);
if (galStart < 0 || galEnd < 0) throw new Error('gallery markers');
const bookHtml = `  <div class="book-wrap">
    <button class="bk-btn bk-prev" id="bkPrev" type="button" aria-label="Previous page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
    <div class="book" id="book" tabindex="0" aria-label="Showroom photo book"></div>
    <button class="bk-btn bk-next" id="bkNext" type="button" aria-label="Next page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
  </div>
  <div class="bk-count" id="bkCount" aria-live="polite"></div>
`;
visit = visit.slice(0, galStart) + bookHtml + visit.slice(galEnd);

// The flip-book CSS and the page's colour names, added to the page's own style block.
const pageVars = ':root{--highlight:#5AC8FA;--muted:#6b7278;--paper:#fff;--surface:#fff;--line:#e3e5e7;--ink:#111}\n';
const styleClose = visit.indexOf('</style>', visit.indexOf('.visit .cta:hover'));
if (styleClose < 0) throw new Error('style close');
visit = visit.slice(0, styleClose) + pageVars + bookCss + visit.slice(styleClose);

// The flip-book script, with the few helpers it needs, before </body>.
const helpers = `<script>
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function L() { return 'en'; }
  var T = { en: ${JSON.stringify(en)} };
${bookJs}
  buildBook();
  bindBook();
})();
</script>
`;
visit = visit.replace('</body>', () => helpers + '</body>');
wr('visit/index.html', visit);

// --- 2. landing: remove the section, its CSS and its script ---
let landing = land;
const secStart = landing.indexOf('  <!-- SHOWROOM (magazine) -->');
const secEnd = landing.indexOf('  <!-- BRANDS -->');
if (secStart < 0 || secEnd < 0) throw new Error('landing section markers');
landing = landing.slice(0, secStart) + landing.slice(secEnd);
wr('landing/index.html', landing);

let landCss = css.slice(0, css.indexOf('/* Showroom: magazine layout'));
landCss += css.slice(cssEnd);
landCss = landCss.replace('#showroom { display: none !important; }\n', '');
wr('landing/landing.css', landCss);

let landJs = js.slice(0, jsStart) + js.slice(jsEnd);
landJs = landJs.replace('    buildBook();\n', '').replace('  bindBook(); fitInit();', '  fitInit();');
wr('landing/landing.js', landJs);

console.log('moved');
