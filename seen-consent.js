/* Cookie consent. Until the visitor chooses, Google (GTM, Analytics, Ads) runs in "denied" mode and the Meta Pixel is revoked:
   every page sets that default in its <head> before the tags load (see tools/seen-consent-head.html), this file shows the banner
   and turns them on only for what the visitor allows. The choice is kept in localStorage "seenConsent" = {a: analytics, m: marketing, t: date, v: 1}.
   Anyone can reopen the settings: window.SEEN_CONSENT_OPEN(), any element with [data-cookie-settings], or the cookie policy page. */
(function () {
  if (window.__seenConsentUI) return; window.__seenConsentUI = 1;
  var KEY = 'seenConsent', V = 1;
  function read() { try { var c = JSON.parse(localStorage.getItem(KEY) || 'null'); return c && c.v === V ? c : null; } catch (e) { return null; } }
  function apply(c) {
    var a = c && c.a ? 'granted' : 'denied', m = c && c.m ? 'granted' : 'denied';
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== 'function') window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'update', { analytics_storage: a, ad_storage: m, ad_user_data: m, ad_personalization: m });
    if (typeof window.fbq === 'function') window.fbq('consent', c && c.m ? 'grant' : 'revoke');
    window.dataLayer.push({ event: 'seen_consent', consent_analytics: a, consent_marketing: m });
  }
  function save(a, m) { var c = { a: !!a, m: !!m, t: new Date().toISOString(), v: V }; try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} window.__seenConsent = c; apply(c); close(); }

  // words come from the page's translator (home page) or the shared dictionary (other pages): written in English here
  var CSS = '#ckb{position:fixed;left:12px;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 76px);z-index:9500;max-width:560px;margin:0 auto;background:#1d1d1f;color:#fff;border-radius:16px;padding:16px 18px;box-shadow:0 10px 40px rgba(0,0,0,.25);font:inherit;font-size:14px;line-height:1.5;box-sizing:border-box}' +
    '@media (min-width:901px){#ckb{bottom:24px;left:24px;right:auto;width:440px;margin:0}}' +
    '#ckb h2{font-size:16px;font-weight:600;margin:0 0 4px;color:#fff}#ckb p{margin:0 0 12px;color:#c9cdd1}#ckb p a{color:#5AC8FA;text-decoration:underline}' +
    '#ckb .ckb-b{display:flex;flex-wrap:wrap;gap:8px}#ckb button{font:inherit;font-size:14px;font-weight:500;border-radius:999px;padding:9px 16px;cursor:pointer;border:1px solid #5a5f66;background:transparent;color:#fff}' +
    '#ckb button.ok{background:#5AC8FA;border-color:#5AC8FA;color:#0b0b0b}#ckb button:focus-visible{outline:2px solid #5AC8FA;outline-offset:2px}' +
    '#ckb .ckb-s{display:none;margin:4px 0 12px;border-top:1px solid #3a3d42;padding-top:10px}#ckb.set .ckb-s{display:block}#ckb.set .ckb-main{display:none}' +
    '#ckb .ckb-r{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid #2d3034}#ckb .ckb-r b{font-weight:500;color:#fff;display:block}#ckb .ckb-r small{color:#9aa0a6;font-size:12px}' +
    '#ckb .ckb-r em{font-style:normal;color:#9aa0a6;font-size:13px;white-space:nowrap}' +
    '#ckb input[type=checkbox]{appearance:none;-webkit-appearance:none;width:42px;height:24px;border-radius:999px;background:#5a5f66;position:relative;cursor:pointer;flex:none;margin:0;transition:background .2s}' +
    '#ckb input[type=checkbox]::after{content:"";position:absolute;top:3px;inset-inline-start:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .2s}' +
    '#ckb input[type=checkbox]:checked{background:#5AC8FA}#ckb input[type=checkbox]:checked::after{transform:translateX(18px)}html[dir=rtl] #ckb input[type=checkbox]:checked::after{transform:translateX(-18px)}';
  var el = null;
  function build() {
    if (el) return el;
    var st = document.createElement('style'); st.id = 'ckb-css'; st.textContent = CSS; document.head.appendChild(st);
    el = document.createElement('div'); el.id = 'ckb'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-live', 'polite'); el.setAttribute('aria-label', 'Cookie settings');
    el.innerHTML = '<div class="ckb-main"><h2>We use cookies</h2><p><span>Choose what you allow. You can change it any time.</span> <a href="/cookies/">Cookie policy</a></p>' +
      '<div class="ckb-b"><button type="button" class="ok" data-ck="all">Accept all</button><button type="button" data-ck="none">Reject all</button><button type="button" data-ck="set">Settings</button></div></div>' +
      '<div class="ckb-s"><h2>Cookie settings</h2>' +
      '<div class="ckb-r"><div><b>Essential</b><small>Needed for the bag, the account and the site to work.</small></div><em>Always on</em></div>' +
      '<div class="ckb-r"><div><b>Analytics</b><small>Helps us understand which pages people use.</small></div><input type="checkbox" id="ckA" aria-label="Analytics"></div>' +
      '<div class="ckb-r"><div><b>Marketing</b><small>Lets us measure and show our ads on Google and Meta.</small></div><input type="checkbox" id="ckM" aria-label="Marketing"></div>' +
      '<div class="ckb-b" style="margin-top:12px"><button type="button" class="ok" data-ck="save">Save my choices</button><button type="button" data-ck="all">Accept all</button></div></div>';
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ck]'); if (!b) return;
      var k = b.getAttribute('data-ck');
      if (k === 'all') save(true, true); else if (k === 'none') save(false, false);
      else if (k === 'set') openSettings();
      else if (k === 'save') save(el.querySelector('#ckA').checked, el.querySelector('#ckM').checked);
    });
    document.body.appendChild(el);
    if (window.SEEN_TR && !window.AR) window.SEEN_TR.apply(el, false);   // pages without their own translator (e.g. the language product pages)
    return el;
  }
  function open() { build(); el.classList.remove('set'); el.hidden = false; }
  function openSettings() { build(); var c = read(); el.querySelector('#ckA').checked = !!(c && c.a); el.querySelector('#ckM').checked = !!(c && c.m); el.classList.add('set'); el.hidden = false; }
  function close() { if (el) el.hidden = true; }
  window.SEEN_CONSENT_OPEN = openSettings;
  document.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('[data-cookie-settings]'); if (t) { e.preventDefault(); openSettings(); } });
  function start() { var c = read(); if (c) apply(c); else open(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
