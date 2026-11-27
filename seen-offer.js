/* SEEN temporary offer: Buy 1 Get 1 Free, on every product, until 30 Nov 2026 23:59 Cairo time (UTC+2).
   The bag is split into single frames and sorted from the highest price to the lowest. The 1st frame is paid, the 2nd is free,
   the 3rd is paid, the 4th is free, and so on. So 2 frames = 1 free, 3 frames = 1 free (the middle one), 4 frames = 2 free.
   One file for everything: the website (bag, cart, checkout) and the server (functions/_lib/store.js, which prices the real order).
   To end the offer early or to remove it for good, change END or delete this file and its <script> / import lines. */
(function (g) {
  var END = Date.parse('2026-11-30T23:59:59+02:00');
  g.SEEN_OFFER = {
    end: END,
    active: function (now) { return (now == null ? Date.now() : now) <= END; },
    // lines: [{p: unit price, q: quantity}] -> {save: total EGP off, free: [free frames in each line]}
    calc: function (lines) {
      var units = [], free = [], save = 0, i, k;
      for (i = 0; i < lines.length; i++) { free.push(0); for (k = 0; k < (+lines[i].q || 0); k++) units.push({ i: i, p: +lines[i].p || 0 }); }
      units.sort(function (a, b) { return b.p - a.p; });
      for (i = 1; i < units.length; i += 2) { free[units[i].i]++; save += units[i].p; }
      return { save: save, free: free };
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
