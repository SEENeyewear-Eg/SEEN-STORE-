// Copies the site header, footer and shared styles from index.html into the separate pages,
// so every page shows the same top bar and footer. Run after changing the header or footer in index.html:
//   node scripts/build-shell.js
// Each page keeps its own content and its own <title>. The shell goes around that content.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

const index = read('index.html');

// 1. Shared styles: the first <style> block of index.html.
const styleMatch = index.match(/<style>([\s\S]*?)<\/style>/);
if (!styleMatch) throw new Error('style block not found in index.html');
const SHELL_CSS = styleMatch[1];

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

const PAGES = ['frames/index.html', 'blog/index.html', 'about/index.html', '3d.html'];

for (const f of PAGES) {
  let s = read(f);
  // Remove any header or footer the page had before.
  s = s.replace(/<header[\s\S]*?<\/header>/g, '').replace(/<footer[\s\S]*?<\/footer>/g, '');
  // Shared styles go first in the head; the page's own styles follow them.
  // Pages start below the fixed header.
const PAGE_TOP = 'body>article,body>main,body>.wrap{padding-top:130px!important}';
const shellTag = '<style data-shell>' + SHELL_CSS + PAGE_TOP + '</style>';
  s = s.replace(/<style data-shell>[\s\S]*?<\/style>/, '');
  // Shell styles go before the page's own styles, so the page's styles win on its own content.
  const firstStyle = s.indexOf('<style');
  if (firstStyle < 0) s = s.replace('</head>', () => shellTag + '\n</head>');
  else s = s.slice(0, firstStyle) + shellTag + '\n' + s.slice(firstStyle);
  // Header right after <body>, footer and the nav script right before </body>.
  s = s.replace(/<body([^>]*)>/, (m, attrs) => '<body' + attrs + '>\n' + HEADER + '\n');
  const navTag = '<script src="/site-nav.js" defer></script>';
  s = s.replace('</body>', () => FOOTER + '\n' + navTag + '\n</body>');
  fs.writeFileSync(path.join(root, f), s, 'utf8');
  console.log('built', f);
}
