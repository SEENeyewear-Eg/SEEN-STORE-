// Copies the site header, footer and shared styles from index.html into the separate pages,
// so every page shows the same top bar and footer. Run after changing the header or footer in index.html:
//   node scripts/build-shell.js
// Each page keeps its own content and its own <title>. The shell goes around that content.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

const index = read('index.html');

// 1. Shared styles: every <style> block of index.html, in order.
const styleBlocks = [...index.matchAll(/<style>([\s\S]*?)<\/style>/g)];
if (!styleBlocks.length) throw new Error('style blocks not found in index.html');
const SHELL_CSS = styleBlocks.map(m => m[1]).join('\n');

// 2. Icons: the IC map from index.html (one line starting with "IC={").
const icStart = index.indexOf('IC={');
if (icStart < 0) throw new Error('icon map not found');
const icEnd = index.indexOf('};', icStart) + 1;
const IC = new Function('return ' + index.slice(icStart + 3, icEnd) + ';')();
const icon = name => '<svg class="i" viewBox="0 0 24 24">' + (IC[name] || '') + '</svg>';

// 3. Header and footer from index.html.
const headerMatch = index.match(/<header id="hd">[\s\S]*?<\/header>/);
const footerMatch = index.match(/<footer class="ftr">[\s\S]*?<\/footer>/);
if (!headerMatch || !footerMatch) throw new Error('header or footer not found');
const HEADER = headerMatch[0].replace(/<i data-i="([a-z]+)"><\/i>/g, (_, n) => icon(n));
const FOOTER = footerMatch[0];
// The chat button is only on the home page and the shop/product pages (inside index.html), not on the separate pages.
const CHAT = '';

const PAGES = ['frames/index.html', 'blog/index.html', 'about/index.html', '3d.html', 'visit/index.html', 'black-friday/index.html', 'feedback/index.html'];

for (const f of PAGES) {
  let s = read(f);
  // Remove any header or footer the page had before.
  s = s.replace(/<header[\s\S]*?<\/header>/g, '').replace(/<footer[\s\S]*?<\/footer>/g, '');
  // Remove earlier copies of the nav script (otherwise each build adds another one and the menus open and close at once).
  s = s.replace(/<script src="\/site-nav.js" defer><\/script>\n?/g, '');
  // Remove an earlier copy of the chat widget from the page.
  s = s.replace(/<style data-sc>[\s\S]*?<\/script>\n?/g, '');
  // Shared styles go first in the head; the page's own styles follow them.
  // Pages start below the fixed header.
const PAGE_TOP = 'body>article,body>main,body>.wrap{padding-top:130px!important}' + 'body.light-page #hd:not(.solid){color:#2F3136;--ew-now:#2F3136}' + 'body.light-page #hd:not(.solid) .pill{background:rgba(255,255,255,.6);border-color:rgba(47,49,54,.18)}' + 'body.light-page #hd:not(.solid) .ib:hover{opacity:.6}' + 'body.light-page #hd:not(.solid) nav button,body.light-page #hd:not(.solid) nav a,body.light-page #hd:not(.solid) .ib{color:#2F3136}' + 'body.light-page #hd:not(.solid) nav button:hover,body.light-page #hd:not(.solid) nav a:hover{background:#2F3136;color:#fff}';
const shellTag = '<style data-shell>' + SHELL_CSS + PAGE_TOP + '</style>';
  s = s.replace(/<style data-shell>[\s\S]*?<\/style>/, '');
  // Shell styles go before the page's own styles, so the page's styles win on its own content.
  const firstStyle = s.indexOf('<style');
  if (firstStyle < 0) s = s.replace('</head>', () => shellTag + '\n</head>');
  else s = s.slice(0, firstStyle) + shellTag + '\n' + s.slice(firstStyle);
  // The page's own styles must not restyle the shared header or footer (for example a page-level "header{...}" rule).
  // Repeated, so that rules next to each other are all removed.
  for (let k = 0; k < 5; k++) {
    s = s.replace(/<style>([\s\S]*?)<\/style>/g, (m, css) => '<style>' + css.replace(/(^|\})(\s*)(header|footer)\b[^{]*\{[^}]*\}/g, (x, a) => a) + '</style>');
  }
  // Header right after <body>, footer and the nav script right before </body>.
  s = s.replace(/<body([^>]*)>/, (m, attrs) => '<body class="light-page"' + attrs + '>\n' + HEADER + '\n');
  const navTag = '<script src="/site-nav.js" defer></script>';
  s = s.replace('</body>', () => FOOTER + '\n' + CHAT + '\n' + navTag + '\n</body>');
  fs.writeFileSync(path.join(root, f), s, 'utf8');
  console.log('built', f);
}
