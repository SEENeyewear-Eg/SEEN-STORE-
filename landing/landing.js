// SEEN landing page behaviour: text (EN/AR), light/dark, animations, sections built from config.js.
(function () {
  'use strict';
  var C = window.SEEN_LANDING || {};
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var save = function (k, v) { try { localStorage[k] = v; } catch (e) {} };

  /* ---------- Text ---------- */
  var T = window.SEEN_TEXT || { en: {} };
  var LANGS = window.SEEN_LANGS || [{ code: 'en', name: 'English', short: 'EN' }];
  var L = function () { return T[root.lang] ? root.lang : 'en'; };
  var t = function (k) { var v = T[L()][k]; return v != null ? v : T.en[k]; };

  /* ---------- Icons ---------- */
  var ICON = {
    bag: '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    cam: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
    truck: '<path d="M3 6h11v10H3z"/><path d="M14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    store: '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9h16v2a3 3 0 0 1-5.3 1.9A3 3 0 0 1 12 14a3 3 0 0 1-2.7-1.1A3 3 0 0 1 4 11z"/><path d="M5.5 13.5V20h13v-6.5"/>',
    eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
  };
  var SOC = {
    instagram: ['Instagram', '<path d="M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM21.9 8c-.1-1.5-.4-2.9-1.5-4s-2.5-1.4-4-1.5C14.8 2.4 9.2 2.4 7.6 2.5c-1.5.1-2.9.4-4 1.5S2.2 6.5 2.1 8c-.1 1.6-.1 6.4 0 8 .1 1.5.4 2.9 1.5 4s2.5 1.4 4 1.5c1.6.1 7.2.1 8.8 0 1.5-.1 2.9-.4 4-1.5s1.4-2.5 1.5-4c.1-1.6.1-6.4 0-8zm-2.2 9.9a3 3 0 0 1-1.7 1.7c-1.2.5-4 .4-5.9.4s-4.7.1-5.9-.4a3 3 0 0 1-1.7-1.7c-.5-1.2-.4-4-.4-5.9s-.1-4.7.4-5.9A3 3 0 0 1 6.2 4.4c1.2-.5 4-.4 5.9-.4s4.7-.1 5.9.4a3 3 0 0 1 1.7 1.7c.5 1.2.4 4 .4 5.9s.1 4.7-.4 5.9z"/>'],
    facebook: ['Facebook', '<path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v1.9H8v3.2h2.6V22h3.4v-10.3h2.7l.4-3.2H14z"/>'],
    tiktok: ['TikTok', '<path d="M16.6 2h-3.3v13.3a2.9 2.9 0 1 1-2-2.8V9.1a6.3 6.3 0 1 0 5.3 6.2V8.6a7.9 7.9 0 0 0 4.6 1.5V6.8a4.6 4.6 0 0 1-4.6-4.8z"/>'],
    youtube: ['YouTube', '<path d="M22.5 7.2a2.8 2.8 0 0 0-2-2C18.8 4.7 12 4.7 12 4.7s-6.8 0-8.5.5a2.8 2.8 0 0 0-2 2C1 8.9 1 12 1 12s0 3.1.5 4.8a2.8 2.8 0 0 0 2 2c1.7.5 8.5.5 8.5.5s6.8 0 8.5-.5a2.8 2.8 0 0 0 2-2c.5-1.7.5-4.8.5-4.8s0-3.1-.5-4.8zM9.8 15.1V8.9l5.7 3.1-5.7 3.1z"/>'],
    x: ['X', '<path d="M17.8 2.5h3.3l-7.2 8.2 8.5 10.8h-6.6l-5.2-6.6-6 6.6H1.3l7.7-8.8L.9 2.5h6.8l4.7 6.1 5.4-6.1zm-1.2 17.1h1.8L6.8 4.3H4.9z"/>'],
    snapchat: ['Snapchat', '<path d="M12.1 2c2.6 0 5 1.9 5.1 5.2v2.3c.4.2 1 .2 1.5 0 .4-.1.8.2.7.6-.2.7-1.4 1-2 1.3.4 1.6 2.1 3.3 3.7 3.8.4.1.4.6.1.8-.7.5-1.8.5-2.3.8-.3.4-.1 1.1-.6 1.3-.6.2-1.5-.2-2.4.1-1 .3-1.9 1.8-3.9 1.8s-2.9-1.5-3.9-1.8c-.9-.3-1.8.1-2.4-.1-.5-.2-.3-.9-.6-1.3-.5-.3-1.6-.3-2.3-.8-.3-.2-.3-.7.1-.8 1.6-.5 3.3-2.2 3.7-3.8-.6-.3-1.8-.6-2-1.3-.1-.4.3-.7.7-.6.5.2 1.1.2 1.5 0V7.2C7.1 3.9 9.5 2 12.1 2z"/>'],
    pinterest: ['Pinterest', '<path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.5 1.8-2.5.9 0 1.3.6 1.3 1.4 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.9 1.6 1.9 1.9 0 3.3-2 3.3-4.9 0-2.6-1.8-4.4-4.5-4.4-3 0-4.8 2.3-4.8 4.6 0 .9.4 1.9.8 2.4.1.1.1.2.1.3l-.3 1.2c0 .2-.2.3-.4.2-1.4-.7-2.2-2.7-2.2-4.3 0-3.5 2.6-6.8 7.4-6.8 3.9 0 6.9 2.8 6.9 6.5 0 3.9-2.4 7-5.8 7-1.1 0-2.2-.6-2.6-1.3l-.7 2.7c-.3 1-1 2.2-1.4 3A10 10 0 1 0 12 2z"/>'],
    linkedin: ['LinkedIn', '<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4v11H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6v5.4h-4v-4.8c0-1.2 0-2.6-1.6-2.6s-1.9 1.3-1.9 2.5v4.9h-4z"/>'],
    google: ['Google', '<path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3zM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22zM6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9zM12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5L6.4 10C7.2 7.8 9.4 6 12 6z"/>'],
    whatsapp: ['WhatsApp', '<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.5-.3z"/>']
  };

  /* ---------- Build sections ---------- */
  var twToken = 0;
  var LOGO_SVG = "<svg class=\"logo-mark\" role=\"img\" aria-label=\"SEEN\" viewBox=\"102.5 92.15 515 78\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M134.4,164.23c-13.63,0-23.35-3.4-27.9-6.59l2.21-3.15c4.07,2.85,12.95,5.89,25.69,5.89,15.41,0,26.18-5.64,26.18-13.71,0-3.85-1.92-9.45-18.56-13.61l-11.4-2.85c-14.82-3.76-23.4-7.76-23.4-17.04s10.92-15.02,28.49-15.02c9.46,0,18.6,1.45,26.43,4.19l-1.27,3.63c-7.43-2.6-16.13-3.97-25.16-3.97-14.97,0-24.64,4.38-24.64,11.17,0,6.06,5.17,9.41,20.49,13.3l11.39,2.85c9.22,2.31,21.48,6.61,21.48,17.34s-12.35,17.56-30.03,17.56Z\"/><path fill=\"currentColor\" d=\"M260.06,164.23h-51.59c-1.06,0-1.93-.86-1.93-1.93v-63.53h53.52v3.85h-49.67v26.95h41.2v3.85h-41.2v26.95h49.67v3.85Z\"/><path fill=\"currentColor\" d=\"M305.88,102.63v26.95h43.51v3.85h-43.51v26.95h51.21v3.85h-53.13c-1.06,0-1.93-.86-1.93-1.93v-63.53h55.06v3.85h-51.21Z\"/><path fill=\"currentColor\" d=\"M462.58,164.23c-.5,0-.99-.19-1.35-.56l-59.09-58.36v56.99h-3.85v-61.6c0-.78.47-1.48,1.18-1.78.72-.3,1.54-.14,2.09.41l59.09,58.36v-56.99h3.85v61.6c0,.78-.47,1.48-1.18,1.78-.24.1-.49.15-.74.15Z\"/><g class=\"ck\"><path fill=\"#5AC8FA\" d=\"M518.02,156.15c-.06,0-.12,0-.18,0-1.03-.05-1.99-.51-2.68-1.27l-13.86-15.4c-1.42-1.58-1.29-4.01.29-5.44,1.58-1.42,4.01-1.29,5.44.29l11.25,12.5,37.18-34.32c1.56-1.44,4-1.34,5.44.22,1.44,1.56,1.35,4-.22,5.44l-40.04,36.96c-.71.66-1.65,1.02-2.61,1.02Z\"/><path fill=\"#5AC8FA\" d=\"M568.84,156.15c-.99,0-1.97-.38-2.72-1.13l-15.4-15.4c-1.5-1.5-1.5-3.94,0-5.44,1.5-1.5,3.94-1.5,5.44,0l12.81,12.81,38.09-34.5c1.58-1.43,4.01-1.31,5.44.27,1.43,1.58,1.31,4.01-.27,5.44l-40.81,36.96c-.74.67-1.66,1-2.58,1Z\"/></g><defs><linearGradient id=\"ewg1\" gradientUnits=\"userSpaceOnUse\" x1=\"147.06\" y1=\"0\" x2=\"572.94\" y2=\"0\"><stop offset=\"0\" style=\"stop-color:var(--ew-from,#606060)\"/><stop offset=\"1\" style=\"stop-color:var(--ew-to,#5AC8FA)\"/></linearGradient></defs><g class=\"ew\" fill=\"url(#ewg1)\"><path transform=\"translate(-118.4 -9.81)\" d=\"M265.47,230.56v-30.52h17.04v1.78h-15.12v12.54h14.2v1.78h-14.2v12.64h15.46v1.78h-17.39Z\"/><path transform=\"translate(-78.25 -9.81)\" d=\"M298.61,230.56v-13.81l-11.51-16.71h2.27l6.94,10.08c.57.85,1.13,1.68,1.66,2.51.53.83,1.07,1.7,1.6,2.63.53-.94,1.07-1.83,1.6-2.65.53-.83,1.09-1.66,1.66-2.49l6.9-10.08h2.27l-11.47,16.71v13.81h-1.93Z\"/><path transform=\"translate(-39.11 -9.81)\" d=\"M317.28,230.56v-30.52h17.04v1.78h-15.12v12.54h14.2v1.78h-14.2v12.64h15.46v1.78h-17.39Z\"/><path transform=\"translate(0.82 -9.81)\" d=\"M347.67,230.56l-8.54-30.52h1.99l6,21.77c.33,1.17.64,2.35.93,3.52.29,1.17.58,2.37.85,3.58.27-1.22.56-2.41.85-3.58.29-1.17.6-2.35.91-3.52l5.88-21.77h2.44l5.86,21.77c.31,1.16.62,2.33.91,3.5s.58,2.36.85,3.56c.27-1.2.56-2.39.86-3.56.3-1.17.61-2.34.92-3.5l6-21.77h1.99l-8.54,30.52h-2.46l-5.86-21.53c-.3-1.12-.6-2.27-.9-3.44-.3-1.17-.59-2.41-.86-3.71-.27,1.26-.56,2.47-.85,3.64-.29,1.17-.6,2.34-.91,3.51l-5.84,21.53h-2.48Z\"/><path transform=\"translate(39.74 -9.81)\" d=\"M381.87,230.56v-30.52h17.04v1.78h-15.12v12.54h14.2v1.78h-14.2v12.64h15.46v1.78h-17.39Z\"/><path transform=\"translate(79.89 -9.81)\" d=\"M403.5,230.56l11.31-30.52h2.36l11.37,30.52h-2.03l-3.56-9.61h-13.87l-3.52,9.61h-2.05ZM409.71,219.19h12.58l-3.85-10.43c-.37-1.01-.75-2.1-1.16-3.27-.4-1.17-.84-2.46-1.3-3.88-.46,1.43-.9,2.74-1.3,3.91-.4,1.17-.79,2.25-1.16,3.24l-3.81,10.43Z\"/><path transform=\"translate(118.4 -9.81)\" d=\"M434.44,230.56v-30.52h9.46c1.93,0,3.58.38,4.97,1.14,1.39.76,2.45,1.81,3.2,3.15.74,1.34,1.12,2.9,1.12,4.66,0,2.06-.51,3.82-1.53,5.28-1.02,1.46-2.44,2.49-4.27,3.07l7.15,13.21h-2.21l-6.9-12.8c-.49.05-1,.08-1.52.08h-7.54v12.72h-1.93ZM436.36,216.05h7.48c2.32,0,4.14-.64,5.45-1.93s1.97-3,1.97-5.14-.66-3.9-1.97-5.21c-1.31-1.32-3.13-1.98-5.47-1.98h-7.46v14.26Z\"/></g></svg>";
  var OL_SVG = "<svg class=\"ol\" viewBox=\"-10 -780 2870 800\" aria-hidden=\"true\"><defs><mask id=\"olg\" maskUnits=\"userSpaceOnUse\" x=\"-10\" y=\"-780\" width=\"2870\" height=\"800\"><rect class=\"ol-gm\" x=\"-10\" y=\"-780\" width=\"2870\" height=\"800\" fill=\"#fff\"/></mask><mask id=\"olb\" maskUnits=\"userSpaceOnUse\" x=\"-10\" y=\"-780\" width=\"2870\" height=\"800\"><rect class=\"ol-bm\" x=\"-10\" y=\"-780\" width=\"2870\" height=\"800\" fill=\"#fff\"/></mask></defs><path class=\"ol-grey\" mask=\"url(#olg)\" d=\"M40.0 -350.0Q40.0 -427.0 66.5 -492.5Q93.0 -558.0 141.0 -606.5Q189.0 -655.0 254.0 -682.5Q319.0 -710.0 395.0 -710.0Q472.0 -710.0 536.5 -682.5Q601.0 -655.0 649.0 -606.5Q697.0 -558.0 723.5 -492.5Q750.0 -427.0 750.0 -350.0Q750.0 -274.0 723.5 -208.0Q697.0 -142.0 649.0 -93.5Q601.0 -45.0 536.5 -17.5Q472.0 10.0 395.0 10.0Q319.0 10.0 254.0 -17.5Q189.0 -45.0 141.0 -93.5Q93.0 -142.0 66.5 -208.0Q40.0 -274.0 40.0 -350.0ZM130.0 -350.0Q130.0 -271.0 164.5 -209.0Q199.0 -147.0 259.0 -111.0Q319.0 -75.0 395.0 -75.0Q472.0 -75.0 531.5 -111.0Q591.0 -147.0 625.5 -209.0Q660.0 -271.0 660.0 -350.0Q660.0 -429.0 625.5 -491.0Q591.0 -553.0 531.5 -589.0Q472.0 -625.0 395.0 -625.0Q319.0 -625.0 259.0 -589.0Q199.0 -553.0 164.5 -491.0Q130.0 -429.0 130.0 -350.0Z M1160.0 -280.0Q1160.0 -337.0 1135.0 -366.0Q1110.0 -395.0 1062.0 -395.0Q1027.0 -395.0 1000.5 -380.5Q974.0 -366.0 959.5 -340.0Q945.0 -314.0 945.0 -280.0V0.0H865.0V-460.0H945.0V-388.0Q968.0 -430.0 1002.5 -450.0Q1037.0 -470.0 1082.0 -470.0Q1155.0 -470.0 1197.5 -421.5Q1240.0 -373.0 1240.0 -290.0V0.0H1160.0Z M1390.0 -780.0H1470.0V0.0H1390.0Z M1635.0 -460.0H1715.0V0.0H1635.0ZM1620.0 -650.0Q1620.0 -673.0 1636.5 -689.0Q1653.0 -705.0 1675.0 -705.0Q1698.0 -705.0 1714.0 -689.0Q1730.0 -673.0 1730.0 -650.0Q1730.0 -628.0 1714.0 -611.5Q1698.0 -595.0 1675.0 -595.0Q1653.0 -595.0 1636.5 -611.5Q1620.0 -628.0 1620.0 -650.0Z M2175.0 -280.0Q2175.0 -337.0 2150.0 -366.0Q2125.0 -395.0 2077.0 -395.0Q2042.0 -395.0 2015.5 -380.5Q1989.0 -366.0 1974.5 -340.0Q1960.0 -314.0 1960.0 -280.0V0.0H1880.0V-460.0H1960.0V-388.0Q1983.0 -430.0 2017.5 -450.0Q2052.0 -470.0 2097.0 -470.0Q2170.0 -470.0 2212.5 -421.5Q2255.0 -373.0 2255.0 -290.0V0.0H2175.0Z M2583.0 10.0Q2519.0 10.0 2469.5 -20.5Q2420.0 -51.0 2392.5 -105.0Q2365.0 -159.0 2365.0 -230.0Q2365.0 -302.0 2393.5 -356.0Q2422.0 -410.0 2473.5 -440.0Q2525.0 -470.0 2593.0 -470.0Q2661.0 -470.0 2709.5 -441.5Q2758.0 -413.0 2784.0 -360.0Q2810.0 -307.0 2810.0 -234.0Q2810.0 -227.0 2809.5 -219.5Q2809.0 -212.0 2809.0 -210.0H2446.979248046875Q2450.080078125 -171.87962341308594 2463.0 -143.0Q2480.0 -105.0 2513.0 -85.0Q2546.0 -65.0 2593.0 -65.0Q2640.0 -65.0 2676.0 -85.5Q2712.0 -106.0 2737.0 -148.0L2802.0 -107.0Q2766.0 -49.0 2711.5 -19.5Q2657.0 10.0 2583.0 10.0ZM2449.994384765625 -278.0H2722.566650390625Q2720.325927734375 -310.8617858886719 2706.5 -336.0Q2690.0 -366.0 2661.0 -383.0Q2632.0 -400.0 2593.0 -400.0Q2547.0 -400.0 2514.5 -380.5Q2482.0 -361.0 2464.5 -324.5Q2454.61474609375 -303.88232421875 2449.994384765625 -278.0Z\"/><path class=\"ol-blue\" mask=\"url(#olb)\" d=\"M40.0 -350.0Q40.0 -427.0 66.5 -492.5Q93.0 -558.0 141.0 -606.5Q189.0 -655.0 254.0 -682.5Q319.0 -710.0 395.0 -710.0Q472.0 -710.0 536.5 -682.5Q601.0 -655.0 649.0 -606.5Q697.0 -558.0 723.5 -492.5Q750.0 -427.0 750.0 -350.0Q750.0 -274.0 723.5 -208.0Q697.0 -142.0 649.0 -93.5Q601.0 -45.0 536.5 -17.5Q472.0 10.0 395.0 10.0Q319.0 10.0 254.0 -17.5Q189.0 -45.0 141.0 -93.5Q93.0 -142.0 66.5 -208.0Q40.0 -274.0 40.0 -350.0ZM130.0 -350.0Q130.0 -271.0 164.5 -209.0Q199.0 -147.0 259.0 -111.0Q319.0 -75.0 395.0 -75.0Q472.0 -75.0 531.5 -111.0Q591.0 -147.0 625.5 -209.0Q660.0 -271.0 660.0 -350.0Q660.0 -429.0 625.5 -491.0Q591.0 -553.0 531.5 -589.0Q472.0 -625.0 395.0 -625.0Q319.0 -625.0 259.0 -589.0Q199.0 -553.0 164.5 -491.0Q130.0 -429.0 130.0 -350.0Z M1160.0 -280.0Q1160.0 -337.0 1135.0 -366.0Q1110.0 -395.0 1062.0 -395.0Q1027.0 -395.0 1000.5 -380.5Q974.0 -366.0 959.5 -340.0Q945.0 -314.0 945.0 -280.0V0.0H865.0V-460.0H945.0V-388.0Q968.0 -430.0 1002.5 -450.0Q1037.0 -470.0 1082.0 -470.0Q1155.0 -470.0 1197.5 -421.5Q1240.0 -373.0 1240.0 -290.0V0.0H1160.0Z M1390.0 -780.0H1470.0V0.0H1390.0Z M1635.0 -460.0H1715.0V0.0H1635.0ZM1620.0 -650.0Q1620.0 -673.0 1636.5 -689.0Q1653.0 -705.0 1675.0 -705.0Q1698.0 -705.0 1714.0 -689.0Q1730.0 -673.0 1730.0 -650.0Q1730.0 -628.0 1714.0 -611.5Q1698.0 -595.0 1675.0 -595.0Q1653.0 -595.0 1636.5 -611.5Q1620.0 -628.0 1620.0 -650.0Z M2175.0 -280.0Q2175.0 -337.0 2150.0 -366.0Q2125.0 -395.0 2077.0 -395.0Q2042.0 -395.0 2015.5 -380.5Q1989.0 -366.0 1974.5 -340.0Q1960.0 -314.0 1960.0 -280.0V0.0H1880.0V-460.0H1960.0V-388.0Q1983.0 -430.0 2017.5 -450.0Q2052.0 -470.0 2097.0 -470.0Q2170.0 -470.0 2212.5 -421.5Q2255.0 -373.0 2255.0 -290.0V0.0H2175.0Z M2583.0 10.0Q2519.0 10.0 2469.5 -20.5Q2420.0 -51.0 2392.5 -105.0Q2365.0 -159.0 2365.0 -230.0Q2365.0 -302.0 2393.5 -356.0Q2422.0 -410.0 2473.5 -440.0Q2525.0 -470.0 2593.0 -470.0Q2661.0 -470.0 2709.5 -441.5Q2758.0 -413.0 2784.0 -360.0Q2810.0 -307.0 2810.0 -234.0Q2810.0 -227.0 2809.5 -219.5Q2809.0 -212.0 2809.0 -210.0H2446.979248046875Q2450.080078125 -171.87962341308594 2463.0 -143.0Q2480.0 -105.0 2513.0 -85.0Q2546.0 -65.0 2593.0 -65.0Q2640.0 -65.0 2676.0 -85.5Q2712.0 -106.0 2737.0 -148.0L2802.0 -107.0Q2766.0 -49.0 2711.5 -19.5Q2657.0 10.0 2583.0 10.0ZM2449.994384765625 -278.0H2722.566650390625Q2720.325927734375 -310.8617858886719 2706.5 -336.0Q2690.0 -366.0 2661.0 -383.0Q2632.0 -400.0 2593.0 -400.0Q2547.0 -400.0 2514.5 -380.5Q2482.0 -361.0 2464.5 -324.5Q2454.61474609375 -303.88232421875 2449.994384765625 -278.0Z\"/><path class=\"ol-l ol-l0\" pathLength=\"100\" d=\"M40.0 -350.0Q40.0 -427.0 66.5 -492.5Q93.0 -558.0 141.0 -606.5Q189.0 -655.0 254.0 -682.5Q319.0 -710.0 395.0 -710.0Q472.0 -710.0 536.5 -682.5Q601.0 -655.0 649.0 -606.5Q697.0 -558.0 723.5 -492.5Q750.0 -427.0 750.0 -350.0Q750.0 -274.0 723.5 -208.0Q697.0 -142.0 649.0 -93.5Q601.0 -45.0 536.5 -17.5Q472.0 10.0 395.0 10.0Q319.0 10.0 254.0 -17.5Q189.0 -45.0 141.0 -93.5Q93.0 -142.0 66.5 -208.0Q40.0 -274.0 40.0 -350.0ZM130.0 -350.0Q130.0 -271.0 164.5 -209.0Q199.0 -147.0 259.0 -111.0Q319.0 -75.0 395.0 -75.0Q472.0 -75.0 531.5 -111.0Q591.0 -147.0 625.5 -209.0Q660.0 -271.0 660.0 -350.0Q660.0 -429.0 625.5 -491.0Q591.0 -553.0 531.5 -589.0Q472.0 -625.0 395.0 -625.0Q319.0 -625.0 259.0 -589.0Q199.0 -553.0 164.5 -491.0Q130.0 -429.0 130.0 -350.0Z\"/><path class=\"ol-l ol-l1\" pathLength=\"100\" d=\"M1160.0 -280.0Q1160.0 -337.0 1135.0 -366.0Q1110.0 -395.0 1062.0 -395.0Q1027.0 -395.0 1000.5 -380.5Q974.0 -366.0 959.5 -340.0Q945.0 -314.0 945.0 -280.0V0.0H865.0V-460.0H945.0V-388.0Q968.0 -430.0 1002.5 -450.0Q1037.0 -470.0 1082.0 -470.0Q1155.0 -470.0 1197.5 -421.5Q1240.0 -373.0 1240.0 -290.0V0.0H1160.0Z\"/><path class=\"ol-l ol-l2\" pathLength=\"100\" d=\"M1390 -780V0H1470V-780Z\"/><path class=\"ol-l ol-l3\" pathLength=\"100\" d=\"M1620 -650Q1620 -628 1636.5 -611.5Q1653 -595 1675 -595Q1698 -595 1714.0 -611.5Q1730 -628 1730 -650Q1730 -673 1714.0 -689.0Q1698 -705 1675 -705Q1653 -705 1636.5 -689.0Q1620 -673 1620 -650ZM1635 -460V0H1715V-460Z\"/><path class=\"ol-l ol-l4\" pathLength=\"100\" d=\"M2175.0 -280.0Q2175.0 -337.0 2150.0 -366.0Q2125.0 -395.0 2077.0 -395.0Q2042.0 -395.0 2015.5 -380.5Q1989.0 -366.0 1974.5 -340.0Q1960.0 -314.0 1960.0 -280.0V0.0H1880.0V-460.0H1960.0V-388.0Q1983.0 -430.0 2017.5 -450.0Q2052.0 -470.0 2097.0 -470.0Q2170.0 -470.0 2212.5 -421.5Q2255.0 -373.0 2255.0 -290.0V0.0H2175.0Z\"/><path class=\"ol-l ol-l5\" pathLength=\"100\" d=\"M2583.0 10.0Q2519.0 10.0 2469.5 -20.5Q2420.0 -51.0 2392.5 -105.0Q2365.0 -159.0 2365.0 -230.0Q2365.0 -302.0 2393.5 -356.0Q2422.0 -410.0 2473.5 -440.0Q2525.0 -470.0 2593.0 -470.0Q2661.0 -470.0 2709.5 -441.5Q2758.0 -413.0 2784.0 -360.0Q2810.0 -307.0 2810.0 -234.0Q2810.0 -227.0 2809.5 -219.5Q2809.0 -212.0 2809.0 -210.0H2446.979248046875Q2450.080078125 -171.87962341308594 2463.0 -143.0Q2480.0 -105.0 2513.0 -85.0Q2546.0 -65.0 2593.0 -65.0Q2640.0 -65.0 2676.0 -85.5Q2712.0 -106.0 2737.0 -148.0L2802.0 -107.0Q2766.0 -49.0 2711.5 -19.5Q2657.0 10.0 2583.0 10.0ZM2449.994384765625 -278.0H2722.566650390625Q2720.325927734375 -310.8617858886719 2706.5 -336.0Q2690.0 -366.0 2661.0 -383.0Q2632.0 -400.0 2593.0 -400.0Q2547.0 -400.0 2514.5 -380.5Q2482.0 -361.0 2464.5 -324.5Q2454.61474609375 -303.88232421875 2449.994384765625 -278.0Z\"/></svg>";
  function hero() {
    var lines = t('h1').map(function (x) { var logo = x === 'LOGO'; return { logo: logo, em: /^<em>/.test(x), text: logo ? '' : x.replace(/<\/?em>/g, '') }; });
    var el = $('h1'); el.setAttribute('aria-label', lines.map(function (l) { return l.text; }).join(' '));
    el.innerHTML = lines.map(function (l) {
      var w = l.em ? ['<em>', '</em>'] : ['', ''];
      return '<span class="ln" aria-hidden="true"><span class="ghost">' + w[0] + (l.logo ? LOGO_SVG : esc(l.text)) + w[1] + '</span><span class="tw">' + w[0] + '<span class="tx"></span>' + w[1] + '</span></span>';
    }).join('');
    var tx = el.querySelectorAll('.tx'), caret = document.createElement('i'); caret.className = 'caret';
    var my = ++twToken;
    function paint(l, i, n) { if (l.logo) { tx[i].innerHTML = '<span class="wd logo-wd" style="--i:0">' + LOGO_SVG + '</span>'; return; } var c = Array.from(l.text).slice(0, n); var h = Math.min(l.hl, c.length); tx[i].innerHTML = (h ? '<b class="ob">' + esc(c.slice(0, h).join('')) + '</b>' : '') + esc(c.slice(h).join('')); }
    if (reduce) { lines.forEach(function (l, i) { paint(l, i, Infinity); }); return; }
    // Words rise in one after another (replaces the letter-by-letter typing)
    var wi = 0;
    lines.forEach(function (l, i) {
      if (l.logo) { paint(l, i, Infinity); return; }
      if (i === 1 && l.text === 'Online') { tx[i].innerHTML = '<span class="wd hook" style="--i:0">' + OL_SVG + '</span>'; return; }
      var pos = 0;
      tx[i].innerHTML = l.text.split(' ').map(function (w) {
        var start = pos; pos += w.length + 1;
        var inner = (start < l.hl) ? '<b class="ob">' + esc(w) + '</b>' : esc(w);
        var extra = ';--d:' + (1000 + wi * 150) + 'ms';
        var hook = (i === 1 && start === 0) ? ' hook' : (i >= 2 ? ' still' : '');
        return '<span class="wd' + hook + '" style="--i:' + (wi++) + extra + '">' + inner + '</span>';
      }).join(' ');
    });
    el.classList.add('typed');
    return;
    (function step() {
      if (my !== twToken) return;
      if (li >= lines.length) { el.classList.add('typed'); return; }
      tx[li].after(caret);
      var chars = Array.from(lines[li].text);
      if (ci < chars.length) { ci++; paint(lines[li], li, ci); setTimeout(step, chars[ci - 1] === ' ' ? 40 : 75); }
      else if (li < lines.length - 1) { li++; ci = 0; setTimeout(step, 280); }
      else { li++; step(); }
    })();
  }
  function services() {
    $('svc').innerHTML = t('svc').map(function (s, i) {
      return '<article class="spin reveal" style="--d:' + (i * 0.07).toFixed(2) + 's"><div class="card"><span class="soon">' + esc(t('soon')) + '</span>' +
        '<div class="ic"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[s[0]] + '</svg></div>' +
        '<h3>' + esc(s[1]) + '</h3><p>' + esc(s[2]) + '</p></div></article>';
    }).join('');
  }
  var PIN = '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var GSTAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/></svg>';
  function branches() {
    var ar = L() === 'ar';
    var list = C.branches || [];
    $('locs').innerHTML = list.map(function (b, i) {
      var name = ar ? b.ar : b.en, city = ar ? b.cityAr : b.cityEn, hours = ar ? b.hoursAr : b.hoursEn;
      var map = b.mapUrl || ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('SEEN Eyewear ' + b.en + ' ' + b.cityEn));
      return '<div class="loc reveal" style="--d:' + (i * 0.08) + 's">' +
        '<span class="pin" aria-hidden="true">' + PIN + '</span><h3>' + esc(name) + '</h3><span class="city">' + esc(city) + '</span>' +
        (hours ? '<span class="meta">' + esc(hours) + '</span>' : '') + (b.phone ? '<a class="meta" dir="ltr" href="tel:' + esc(b.phone.replace(/[^+0-9]/g, '')) + '">' + esc(b.phone) + '</a>' : '') +
        '<span class="loc-links"><a class="go" href="' + esc(map) + '" target="_blank" rel="noopener noreferrer">' + esc(t('directions')) + ARROW + '</a>' +
        (b.reviewUrl ? '<a class="rev" href="' + esc(b.reviewUrl) + '" target="_blank" rel="noopener noreferrer">' + GSTAR + esc(t('review')) + '</a>' : '') + '</span></div>';
    }).join('');
    $('gLinks').innerHTML = list.filter(function (b) { return b.reviewUrl; }).map(function (b) {
      return '<a class="btn" href="' + esc(b.reviewUrl) + '" target="_blank" rel="noopener noreferrer">' + GSTAR + '<span>' + esc(ar ? b.ar : b.en) + '</span></a>';
    }).join('');
  }
  function social() {
    var s = C.social || {}, always = ['instagram', 'facebook', 'tiktok', 'whatsapp'];
    var wa = C.whatsapp ? 'https://wa.me/' + encodeURIComponent(C.whatsapp) : '';
    var items = Object.keys(SOC).map(function (k) { return [k, k === 'whatsapp' ? wa : k === 'google' ? '#rate' : s[k]]; })
      .filter(function (it) { return it[1] || always.indexOf(it[0]) > -1; });
    $('social').innerHTML = items.map(function (it) {
      var d = SOC[it[0]], ic = '<svg viewBox="0 0 24 24" aria-hidden="true">' + d[1] + '</svg>';
      if (!it[1]) return '<span class="soc off" data-k="' + it[0] + '" role="img" aria-label="' + d[0] + ' · ' + esc(t('soon')) + '">' + ic + '<span class="tip">' + d[0] + ' · ' + esc(t('soon')) + '</span></span>';
      var ext = it[1].charAt(0) !== '#', lbl = it[0] === 'google' ? t('googleTip') : d[0];
      return '<a class="soc" data-k="' + it[0] + '" href="' + esc(it[1]) + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + ' aria-label="' + esc(lbl) + '">' + ic + '<span class="tip">' + esc(lbl) + '</span></a>';
    }).join('');
    $('social').hidden = !items.length;
    var c = [];
    if (C.phone) c.push('<a href="tel:' + esc(C.phone.replace(/[^+0-9]/g, '')) + '" dir="ltr">' + esc(C.phone) + '</a>');
    if (C.email) c.push('<a href="mailto:' + esc(C.email) + '">' + esc(C.email) + '</a>');
    $('contact').innerHTML = c.join(''); $('contact').hidden = !c.length;
    var w = $('ctaWa'); w.hidden = false; w.href = '#booking'; w.removeAttribute('target'); w.removeAttribute('rel');
  }
  /* ---------- Find your frame: a dial is a half-circle; its centre sits on the edge of the half it shows ---------- */
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

  var FI = {
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-4.5"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 21l5-2.5L17 21l-1.5-7"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    eye: ICON.eye
  };
  var FI_ORDER = ['shield', 'award', 'pin', 'eye'];
  function aboutFeat() {
    var f = T[L()].feat || T.en.feat;
    $('aboutFeat').innerHTML = f.map(function (x, i) {
      return '<div class="feat-item reveal tilt" style="--d:' + (i * 0.1).toFixed(2) + 's"><span class="fi" aria-hidden="true"><svg viewBox="0 0 24 24">' +
        FI[FI_ORDER[i]] + '</svg></span><h3>' + esc(x[0]) + '</h3><p>' + esc(x[1]) + '</p></div>';
    }).join('');
  }
  /* Splits text into words (never letters, so Arabic keeps its joins). Each word gets --i for stagger. */
  function split(node, st) {
    Array.prototype.slice.call(node.childNodes).forEach(function (c) {
      if (c.nodeType === 3) {
        var frag = document.createDocumentFragment();
        c.nodeValue.split(/(\s+)/).forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
          var s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', st.n++); s.textContent = p; frag.appendChild(s);
        });
        c.parentNode.replaceChild(frag, c);
      } else if (c.nodeType === 1) split(c, st);
    });
  }
  function wordify() {
    document.querySelectorAll('.kicker, .sec .wrap h2, .band h2, #about p.big, #aboutFeat h3').forEach(function (el) { split(el, { n: 0 }); });
  }

  /* Offer banner: two frames (1 + 1), headline, live countdown to the end date, button to the booking form */
  function offerRender() {
    var el = $('offer'); if (!el) return;
    var note = t('offerNote') || '';
    var u = t('offerUnits') || T.en.offerUnits;
    var G = '<svg viewBox="0 0 120 48" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="10" width="44" height="30" rx="13" fill="rgba(255,255,255,.35)"/><rect x="70" y="10" width="44" height="30" rx="13" fill="rgba(255,255,255,.35)"/><path d="M50 22q10-8 20 0M6 20L1 15M114 20l5-5"/></svg>';
    el.innerHTML =
      '<span class="of-art" aria-hidden="true"><span class="of-g of-g1">' + G + '</span><span class="of-g of-g2">' + G + '</span><span class="of-plus">+</span><span class="of-s of-s1"></span><span class="of-s of-s2"></span></span>' +
      '<span class="of-txt"><span class="of-kick"><i></i>' + esc(t('offerKick')) + '</span>' +
      '<span class="of-h" role="heading" aria-level="2"><span class="of-l"><span>' + esc(t('offerA')) + '</span></span>' +
      '<span class="of-l of-l2"><span>' + esc(t('offerB')) + ' <em class="of-free">' + esc(t('offerFree')) + '</em></span></span></span>' +
      (note ? '<span class="of-note">' + esc(note) + '</span>' : '') + '</span>' +
      '<span class="of-side"><span class="of-cd">' + [0, 1, 2, 3].map(function (i) {
        return '<span class="of-u"><b data-u="' + i + '"><span>00</span></b><small>' + esc(u[i]) + '</small></span>';
      }).join('') + '</span><span class="of-until">' + esc(t('offerUntil')) + '</span>' +
      '<a class="of-cta" href="#booking"><span>' + esc(t('ctaWa')) + '</span><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></span>';
    offerTick(true);
  }
  function offerTick(first) {
    var el = $('offer'); if (!el || !C.offer || !C.offer.end) return;
    var ms = new Date(C.offer.end + 'T23:59:59') - new Date();
    if (ms <= 0) { el.hidden = true; return; }
    var s = Math.floor(ms / 1000), v = [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60];
    el.querySelectorAll('[data-u]').forEach(function (bx, i) {
      var n = (v[i] < 10 ? '0' : '') + v[i], sp = bx.firstChild;
      if (sp.textContent === n) return;
      sp.textContent = n;
      if (!first && !reduce) { bx.classList.remove('tick'); void bx.offsetWidth; bx.classList.add('tick'); }
    });
  }
  setInterval(function () { offerTick(false); }, 1000);
  (function offerMotion() {
    var el = $('offer'); if (!el || !fine || reduce) return;
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg'); el.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
      el.style.setProperty('--gx', ((x + .5) * 100).toFixed(1) + '%');
    });
    el.addEventListener('pointerleave', function () { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  })();

  /* Hotel pick-up: shown in every language except Arabic */
  var HOTEL_IC = [
    '<path d="M5 16l1.6-5h10.8L19 16M4 16h16v3H4zM7 19v1.6M17 19v1.6"/>',
    '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'
  ];
  function hotel() {
    var s = $('hotel'); if (!s) return;
    var show = L() !== 'ar' && !!C.whatsapp; // every language except Arabic
    s.hidden = !show; if (!show) return;
    $('hotelK').textContent = t('hotelK') || '';
    $('hotelT').textContent = t('hotelT');
    $('hotelL').innerHTML = t('hotelL').map(function (x, i) {
      return '<li><span class="hi" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + HOTEL_IC[i] + '</svg></span><span>' + esc(x) + '</span></li>';
    }).join('');
    $('hotelBtnT').textContent = t('hotelBtn');
    $('hotelBtn').href = 'https://wa.me/' + encodeURIComponent(C.whatsapp) + '?text=' + encodeURIComponent(t('hotelMsg'));
  }

  function applyText() {
    offerRender(); hotel();
    fitSetFaces(); fitRender();
    bookForm(); waFloatSet();
    document.querySelectorAll('[data-t]').forEach(function (el) { var v = t(el.dataset.t); if (typeof v === 'string') el.textContent = v; });
    document.querySelectorAll('[data-t-html]').forEach(function (el) { el.innerHTML = t(el.dataset.tHtml); });
    document.querySelectorAll('[data-t-label]').forEach(function (el) { el.setAttribute('aria-label', t(el.dataset.tLabel)); });
    var cur = LANGS.filter(function (x) { return x.code === L(); })[0] || LANGS[0];
    $('langCode').textContent = cur.short; $('lang').setAttribute('aria-label', t('langLabel') + ': ' + cur.name);
    $('langMenu').innerHTML = LANGS.map(function (x) {
      return '<button type="button" role="menuitemradio" aria-checked="' + (x.code === cur.code) + '" data-l="' + x.code + '" lang="' + x.code + '"' + (x.dir === 'rtl' ? ' dir="rtl"' : '') + '>' +
        '<span class="lc">' + esc(x.short) + '</span><span class="ln2">' + esc(x.name) + '</span></button>';
    }).join('');
    hero(); services(); branches(); social(); stars(); aboutFeat(); wordify(); observe();
  }

  /* ---------- Language / mode ---------- */
  function setLang(code) {
    var x = LANGS.filter(function (l) { return l.code === code; })[0]; if (!x) return;
    root.lang = x.code; root.dir = x.dir === 'rtl' ? 'rtl' : 'ltr'; save('seenLpLang', x.code); applyText();
  }
  function menu(open) {
    var m = $('langMenu'), b = $('lang'); open = open == null ? m.hidden : open;
    m.hidden = !open; b.setAttribute('aria-expanded', String(open));
    if (open) { var c = m.querySelector('[aria-checked="true"]') || m.querySelector('button'); if (c) c.focus(); }
  }
  $('lang').addEventListener('click', function (e) { e.stopPropagation(); menu(); });
  $('langMenu').addEventListener('click', function (e) {
    var b = e.target.closest('[data-l]'); if (!b) return; menu(false); setLang(b.dataset.l); $('lang').focus();
  });
  $('langMenu').addEventListener('keydown', function (e) {
    var it = Array.prototype.slice.call(this.querySelectorAll('button')), i = it.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); it[(i + 1) % it.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); it[(i - 1 + it.length) % it.length].focus(); }
    else if (e.key === 'Escape') { menu(false); $('lang').focus(); }
  });
  document.addEventListener('click', function (e) { if (!$('langMenu').hidden && !e.target.closest('.lang-wrap')) menu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('langMenu').hidden) { menu(false); $('lang').focus(); } });
  /* ---------- Header capsule on scroll ---------- */
  var hd = $('hd');
  function onScroll() { hd.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Reveal + counters ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (en) {
    en.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in'); io.unobserve(e.target);
      e.target.querySelectorAll('[data-count]').forEach(count);
    });
  }, { threshold: .15 }) : null;
  function observe() { document.querySelectorAll('.reveal:not(.in)').forEach(function (el) { if (io) io.observe(el); else { el.classList.add('in'); el.querySelectorAll('[data-count]').forEach(count); } }); }
  document.addEventListener('pointerenter', function (e) {
    var s = e.target.closest && e.target.closest('.stat.in'); if (!s || s.dataset.run || s.classList.contains('stat-auth')) return;
    s.querySelectorAll('[data-count]').forEach(count);
  }, true);
  var auth = document.querySelector('.stat-auth');
  if (auth && 'IntersectionObserver' in window) {
    var authSeen = false;
    new IntersectionObserver(function (en) {
      var b = auth.querySelector('[data-count]');
      if (en[0].isIntersecting) { if (authSeen && auth.classList.contains('in')) count(b); authSeen = true; }
      else if (auth.classList.contains('in') && !auth.dataset.run) b.textContent = '100%'; // stays 100% while away
    }, { threshold: 0 }).observe(auth);
  }
  function count(el) {
    var card = el.closest('.stat'); if (card) { if (card.dataset.run) return; card.dataset.run = 1; }
    var end = +el.dataset.count, suf = el.dataset.suffix || '', fmt = function (n) { return n.toLocaleString('en-US') + suf; };
    if (reduce) { el.textContent = fmt(end); if (card) delete card.dataset.run; return; }
    var t0 = null;
    requestAnimationFrame(function step(ts) {
      if (t0 == null) t0 = ts; var p = Math.min(1, (ts - t0) / (card && card.classList.contains("stat-auth") ? 900 : 1600)), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(end * e)); if (p < 1) requestAnimationFrame(step); else if (card) delete card.dataset.run;
    });
  }

  /* ---------- Pointer effects (mouse only, not with reduced motion) ---------- */
  if (fine && !reduce) {
    var cur = $('cursor'), cx = 0, cy = 0, tx = -100, ty = -100;
    window.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); }, { passive: true });
    document.addEventListener('mouseleave', function () { cur.classList.remove('on'); });
    (function loop() { cx += (tx - cx) * .2; cy += (ty - cy) * .2; cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px)'; requestAnimationFrame(loop); })();
    document.addEventListener('mouseover', function (e) { cur.classList.toggle('big', !!e.target.closest('a, button, .card, .stat, .soc, .bstrip-item')); });

    // Hero: glow + lens follow the mouse
    var heroEl = $('hero'), lens = $('lens');
    heroEl.addEventListener('mousemove', function (e) {
      var r = heroEl.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      $('glow').style.setProperty('--mx', (e.clientX - r.left) + 'px'); $('glow').style.setProperty('--my', (e.clientY - r.top) + 'px');
      y = e.clientY / window.innerHeight - .5;   // the hero is taller than the screen now: tilt by the mouse's place on screen
      lens.style.setProperty('--lx', (x * 30) + 'px'); lens.style.setProperty('--ly', (y * 30) + 'px');
      lens.style.setProperty('--rx', (-y * 14) + 'deg'); lens.style.setProperty('--ry', (x * 14) + 'deg');
    });
    // Cards: 3D tilt + light that follows the mouse
    document.addEventListener('mousemove', function (e) {
      var c = e.target.closest('.tilt'); if (!c) return;
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.transform = 'perspective(900px) rotateX(' + (.5 - y) * 8 + 'deg) rotateY(' + (x - .5) * 10 + 'deg) translateY(-4px)';
      c.style.setProperty('--gx', x * 100 + '%'); c.style.setProperty('--gy', y * 100 + '%');
    });
    document.addEventListener('mouseout', function (e) { var c = e.target.closest('.tilt'); if (c && !c.contains(e.relatedTarget)) c.style.transform = ''; });
    // Magnetic buttons
    document.addEventListener('mousemove', function (e) {
      var b = e.target.closest('.btn, .soc'); if (!b) return; var r = b.getBoundingClientRect();
      b.style.translate = ((e.clientX - r.left - r.width / 2) * .18) + 'px ' + ((e.clientY - r.top - r.height / 2) * .25) + 'px';
    });
    document.addEventListener('mouseout', function (e) { var b = e.target.closest('.btn, .soc'); if (b && !b.contains(e.relatedTarget)) b.style.translate = ''; });
  }

  /* ---------- Logo: one full 360° turn on hover or touch ---------- */
  if (!reduce) document.querySelectorAll('.brand, .lens .mark').forEach(function (b) {
    var lg = b.querySelector('.logo'); if (!lg) return;
    var go = function () { if (!lg.classList.contains('spin')) lg.classList.add('spin'); };
    b.addEventListener('mouseenter', go);
    b.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') go(); });
    lg.addEventListener('animationend', function (e) { if (e.animationName === 'logospin') lg.classList.remove('spin'); });
  });

  /* ---------- Rating + suggestion form ---------- */
  var rating = 0;
  function stars() {
    var box = $('stars'), lab = t('star');
    box.innerHTML = [1, 2, 3, 4, 5].map(function (n) {
      return '<button type="button" role="radio" aria-checked="' + (n === rating) + '" aria-label="' + n + ' · ' + esc(lab[n - 1]) + '" data-n="' + n + '">' + GSTAR + '</button>';
    }).join('') + '<span class="star-lbl">' + (rating ? esc(lab[rating - 1]) : '') + '</span>';
    paint(rating);
  }
  function paint(n) { $('stars').querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', +b.dataset.n <= n); }); }
  $('stars').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; rating = +b.dataset.n; stars(); $('stars').querySelector('[data-n="' + rating + '"]').focus(); });
  $('stars').addEventListener('mouseover', function (e) { var b = e.target.closest('button'); if (b) paint(+b.dataset.n); });
  $('stars').addEventListener('mouseleave', function () { paint(rating); });
  $('fb').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, st = $('fbStatus'), v = {
      name: f.name.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim(), msg: f.msg.value.trim(), rating: rating
    };
    var bad = function (field, key) { st.className = 'fb-status err'; st.textContent = t(key); if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); } return false; };
    f.querySelectorAll('[aria-invalid]').forEach(function (x) { x.removeAttribute('aria-invalid'); });
    if (!v.rating) return bad($('stars').querySelector('button'), 'eRate');
    if (v.name.length < 2) return bad(f.name, 'eName');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) return bad(f.email, 'eEmail');
    var digits = v.phone.replace(/[^0-9]/g, ''); if (digits.length < 8 || digits.length > 15 || /[^0-9+\s()-]/.test(v.phone)) return bad(f.phone, 'ePhone');
    var fbc = C.feedback || {};
    var done = function (key) { st.className = 'fb-status ok'; st.textContent = t(key); if (key !== 'fbOff') { f.reset(); rating = 0; stars(); } };
    if (fbc.send === 'whatsapp' && C.whatsapp) {
      var text = 'SEEN website feedback\nRating: ' + v.rating + '/5\nName: ' + v.name + '\nEmail: ' + v.email + '\nPhone: ' + v.phone + (v.msg ? '\nSuggestion: ' + v.msg : '');
      window.open('https://wa.me/' + encodeURIComponent(C.whatsapp) + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      waConversion();
      return done('fbWa');
    }
    if (fbc.send === 'endpoint' && fbc.endpoint) {
      fetch(fbc.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) })
        .then(function (r) { if (!r.ok) throw r; done('fbOk'); }).catch(function () { bad(null, 'fbErr'); });
      return;
    }
    done('fbOff');
  });

  /* ---------- Booking: sends the booking to the shop's WhatsApp ---------- */
  function bookForm() {
    var f = $('bkForm'); if (!f) return;
    var keep = { branch: f.branch.value, service: f.service.value };
    var ar = L() === 'ar';
    f.branch.innerHTML = '<option value="">' + esc(t('bkBranchPick')) + '</option>' + (C.branches || []).map(function (b, i) {
      return '<option value="' + i + '">' + esc(ar ? b.ar : b.en) + ' · ' + esc(ar ? b.cityAr : b.cityEn) + '</option>';
    }).join('');
    f.service.innerHTML = '<option value="">' + esc(t('bkServicePick')) + '</option>' + t('bkSvc').map(function (s, i) {
      return '<option value="' + i + '">' + esc(s) + '</option>';
    }).join('');
    f.branch.value = keep.branch; f.service.value = keep.service;
    var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    f.date.min = d.toISOString().slice(0, 10);
  }
  function waFloatSet() {
    var w = $('waFloat'); if (!w || !C.whatsapp) return;
    w.href = 'https://wa.me/' + encodeURIComponent(C.whatsapp) + '?text=' + encodeURIComponent(t('waHello'));
  }
  $('bkForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, st = $('bkStatus');
    var v = { name: f.name.value.trim(), phone: f.phone.value.trim(), branch: f.branch.value, service: f.service.value, date: f.date.value, time: f.time.value, note: f.note.value.trim() };
    var bad = function (field, key) { st.className = 'fb-status err'; st.textContent = t(key); if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); } return false; };
    f.querySelectorAll('[aria-invalid]').forEach(function (x) { x.removeAttribute('aria-invalid'); });
    if (v.name.length < 2) return bad(f.name, 'eBkName');
    var digits = v.phone.replace(/[^0-9]/g, ''); if (digits.length < 8 || digits.length > 15 || /[^0-9+\s()-]/.test(v.phone)) return bad(f.phone, 'eBkPhone');
    if (v.branch === '') return bad(f.branch, 'eBkBranch');
    if (v.service === '') return bad(f.service, 'eBkService');
    if (!v.date) return bad(f.date, 'eBkDate');
    if (!v.time) return bad(f.time, 'eBkTime');
    if (!C.whatsapp) return bad(null, 'eBkPhone');
    var b = C.branches[+v.branch], svc = T.ar.bkSvc[+v.service];
    // The shop team reads the booking in Arabic, whatever language the visitor uses
    var text = 'حجز جديد من موقع SEEN\nالاسم: ' + v.name + '\nالواتساب: ' + v.phone + '\nالفرع: ' + b.ar + ' - ' + b.cityAr +
      '\nالخدمة: ' + svc + '\nالتاريخ: ' + v.date + '\nالوقت: ' + v.time + (v.note ? '\nملاحظات: ' + v.note : '');
    window.open('https://wa.me/' + encodeURIComponent(C.whatsapp) + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    waConversion();
    st.className = 'fb-status ok'; st.textContent = t('bkOk');
    f.reset(); bookForm();
  });

  /* ---------- Header: full-width photo carousel, changes by itself, swipe or arrows to move ---------- */
  function rotator() {
    var box = $('rot'); if (!box) return;
    var SRCS = ['https://images.unsplash.com/photo-1577803645773-f96470509666?w=2400&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=2400&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=2400&q=80&auto=format&fit=crop', 'https://images.pexels.com/photos/731070/pexels-photo-731070.jpeg?auto=compress&cs=tinysrgb&w=1600', 'https://images.pexels.com/photos/34091932/pexels-photo-34091932.jpeg?auto=compress&cs=tinysrgb&w=1600', 'https://images.pexels.com/photos/17626089/pexels-photo-17626089.jpeg?auto=compress&cs=tinysrgb&w=1600', 'https://images.pexels.com/photos/19431255/pexels-photo-19431255.jpeg?auto=compress&cs=tinysrgb&w=1600'], ORDER = SRCS.map(function (_, i) { return i; }), N = SRCS.length, chev = function (d) { return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="' + (d < 0 ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6') + '"/></svg>'; };

    var slides = '', dots = '';
    for (var k = 0; k < N; k++) {
      var src = SRCS[k];
      slides += '<figure class="rot-slide' + (k === 0 ? ' on' : '') + '"><img src="' + src + '" alt="" decoding="async"' + (k > 2 ? ' loading="lazy"' : '') + ' onerror="this.style.display=\'none\'"></figure>';
      dots += '<button type="button" class="rot-dot' + (k === 0 ? ' on' : '') + '" data-i="' + k + '" aria-label="' + (k + 1) + '/' + N + '"></button>';
    }
    box.innerHTML = slides +
      '<button type="button" class="rot-nav rot-prev" aria-label="Previous">' + chev(-1) + '</button>' +
      '<button type="button" class="rot-nav rot-next" aria-label="Next">' + chev(1) + '</button>' +
      '<div class="rot-dots">' + dots + '</div>';
    var items = box.querySelectorAll('.rot-slide'), dl = box.querySelectorAll('.rot-dot'), n = 0, timer = null, drag = null;
    function show(i) {
      items[n].classList.remove('on'); dl[n].classList.remove('on');
      n = (i + items.length) % items.length;
      items[n].classList.add('on'); dl[n].classList.add('on');
    }
    function start() { if (!reduce && !timer) timer = setInterval(function () { show(n + 1); }, 5000); }
    function stop() { clearInterval(timer); timer = null; }
    function again() { stop(); start(); }
    box.querySelector('.rot-prev').addEventListener('click', function () { show(n - 1); again(); });
    box.querySelector('.rot-next').addEventListener('click', function () { show(n + 1); again(); });
    box.querySelector('.rot-dots').addEventListener('click', function (e) {
      var d = e.target.closest('.rot-dot'); if (d) { show(+d.dataset.i); again(); }
    });
    box.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; drag = { x: e.clientX }; stop(); });
    var end = function (e) {
      if (!drag) return; var dx = e.clientX - drag.x; drag = null;
      if (Math.abs(dx) > 40) show(dx < 0 ? n + 1 : n - 1);
      start();
    };
    box.addEventListener('pointerup', end);
    box.addEventListener('pointercancel', function () { drag = null; start(); });
    box.addEventListener('mouseenter', stop); box.addEventListener('mouseleave', function () { if (!drag) start(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    start();
  }

  /* ---------- Google Ads: conversion when a WhatsApp link is clicked (not on page load) ---------- */
  function waConversion() {
    if (typeof window.gtag !== 'function' || !C.ads) return;
    window.gtag('event', 'conversion', { send_to: C.ads.waLabel ? C.ads.id + '/' + C.ads.waLabel : C.ads.id, value: 1.0, currency: 'EGP' });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"], a[href*="whatsapp://"], #waFloat');
    if (a) waConversion();
  });

  /* ---------- Offer line: shown until its end date, then hidden ---------- */
  if (C.offer && C.offer.end) {
    var endDay = new Date(C.offer.end + 'T23:59:59');
    if (new Date() > endDay && $('offer')) $('offer').hidden = true;
  }

  /* ---------- Start ---------- */
  $('yr').textContent = new Date().getFullYear();
  fitInit(); rotator(); applyText(); onScroll();
  if (window.SeenBrandStrip && C.brands) SeenBrandStrip.mount($('brands'), C.brands, C.brandStrip);
})();

/* Mobile menu button: opens and closes the section links; closes after a link is chosen */
(function () {
  var b = document.getElementById('burger'), n = document.getElementById('hdNav');
  if (!b || !n) return;
  b.addEventListener('click', function () { var o = n.classList.toggle('open'); b.setAttribute('aria-expanded', o ? 'true' : 'false'); });
  n.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) { n.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); } });
})();
