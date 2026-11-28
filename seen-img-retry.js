/* Image retry: a photo that fails to load (weak mobile network, many requests at once) is retried up to 3 times
   (1.5 s, 4 s, 9 s) before the page's own onerror (hide / remove / show the name) is allowed to run.
   Broken photos are also retried when the connection comes back or the tab is shown again. */
(function () {
  if (window.__imgRetry) return; window.__imgRetry = 1;
  var DELAY = [1500, 4000, 9000];
  function base(u) { return u.replace(/([?&])_r=\d+&?/, '$1').replace(/[?&]$/, ''); }
  function bust(u, n) { return base(u) + (u.indexOf('?') < 0 ? '?' : '&') + '_r=' + n; }
  function retry(img, n) {
    var u = img.getAttribute('src'); if (!u || /^data:/.test(u)) return false;
    var k = +img.__rt || 0; if (k >= DELAY.length) return false;
    img.__rt = k + 1; clearTimeout(img.__rtT);
    img.__rtT = setTimeout(function () { if (img.isConnected) img.src = bust(u, k + 1); }, n == null ? DELAY[k] : n);
    return true;
  }
  document.addEventListener('error', function (e) {
    var t = e.target; if (!t || t.nodeName !== 'IMG') return;
    if (retry(t)) e.stopPropagation();   // keep the page's onerror (which would remove the picture) for the last failure only
  }, true);
  function sweep() {
    var l = document.images;
    for (var i = 0; i < l.length; i++) { var im = l[i]; if (im.complete && im.naturalWidth === 0 && im.getAttribute('src')) { im.__rt = 0; retry(im, 50 + i * 30); } }
  }
  window.addEventListener('online', sweep);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) sweep(); });
  window.__imgSweep = sweep;
})();
