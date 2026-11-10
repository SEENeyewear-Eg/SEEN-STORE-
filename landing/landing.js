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
  var T = {
    en: {
      navAbout: 'About', navServices: 'E-shop', navBranches: 'Branches', navFollow: 'Follow us', mode: 'Light / dark',
      eyebrow: 'The SEEN e-shop · Launching soon',
      h1: ['Our online', 'store is', '<em>coming soon.</em>'],
      lead: 'Authentic sunglasses, optical frames and contact lenses from 40+ international brands. Soon you can browse, try on and order online.',
      ctaVisit: 'Visit a branch', ctaWa: 'Message us on WhatsApp', ctaFollow: 'Follow us on social media', launch: 'Building the online store',
      kAbout: 'About <b class="seen-w">SEEN</b>',
      about: '<b class="seen-w">SEEN</b> is a leading name on the Red Sea coast, <mark>presenting more than 40 international brands, 100% authentic,</mark> across Egypt and the Middle East — 12 years of expertise in optical services, and soon, our online store at your fingertips.',
      sBrands: 'International brands', sAuth: 'Authentic', sFrames: 'Frames in our collection', sBranches: 'Branches',
      kSvc: 'What the e-shop brings', hSvc: 'Everything SEEN, online', pSvc: 'Here is what you will be able to do on seeneyeweareg.com from launch day.',
      soon: 'Soon',
      svc: [
        ['bag', 'Shop 40+ brands', 'Ray-Ban, Maui Jim, Gucci, Carrera, Polaroid and more — every frame 100% authentic.'],
        ['cam', 'Try on with your camera', 'See any frame on your face live, before you decide.'],
        ['cube', 'See frames in 3D', 'Turn a frame around and look at every angle up close.'],
        ['truck', 'Delivery across Egypt', 'Order online and get your frames delivered to your door.'],
        ['store', 'Order online, pick up in store', 'Reserve online and collect from City Center, El Gouna or El Kawthar.'],
        ['eye', 'Save your prescription', 'Keep your eyesight prescription in your account for optical orders.']
      ],
      kBrands: 'Our brands', hBrands: 'The names you love',
      kLoc: 'Visit us', hLoc: 'Our branches', pLoc: 'Come try any frame in person. Every piece is 100% authentic.',
      directions: 'Get directions', call: 'Call',
      kFollow: 'Stay close', hFollow: 'Follow SEEN on social media', pFollow: 'New arrivals, offers and the opening day of the online store, first on our pages.',
      hBand: 'An experience worth seeing is on its way to you.', pBand: 'Until then, we look forward to welcoming you at our boutiques, where our specialists will help you select your next frame and the contact lenses best suited to you.',
      foot: 'Hurghada · El Gouna · Egypt',
      review: 'Rate us on Google', googleTip: 'Google reviews',
      kRate: 'Your opinion matters', hRate: 'Rate your SEEN experience', pRate: 'Tell us how we did and how we can serve you better.',
      gTitle: 'Review us on Google', gText: 'A few words from you on Google help others find their perfect frame.',
      fbTitle: 'Rate the website & suggest an improvement', fbRate: 'Your rating', fbName: 'Full name *', fbEmail: 'Email *', fbPhone: 'Phone number *', fbMsg: 'Your suggestion',
      fbNote: 'We use your details only to reply to your suggestion.', fbSend: 'Send',
      star: ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'],
      eRate: 'Please choose a rating.', eName: 'Please enter your full name.', eEmail: 'Please enter a valid email.', ePhone: 'Please enter a valid phone number.',
      fbOk: 'Thank you! We received your feedback.', fbWa: 'WhatsApp is opening with your message ready — just press send.', fbOff: 'This form will be activated very soon. Thank you for your patience.', fbErr: 'Something went wrong. Please try again or message us on WhatsApp.'
    },
    ar: {
      navAbout: 'عن SEEN', navServices: 'المتجر الأونلاين', navBranches: 'الفروع', navFollow: 'تابعنا', mode: 'فاتح / داكن',
      eyebrow: 'متجر SEEN الإلكتروني · قريباً',
      h1: ['متجرنا', 'الإلكتروني', '<em>قريباً جداً.</em>'],
      lead: 'نظارات شمسية وطبية وعدسات لاصقة أصلية من أكثر من 40 علامة عالمية. قريباً يمكنكم التصفح والتجربة والطلب عبر متجرنا الإلكتروني.',
      ctaVisit: 'زور فرع', ctaWa: 'كلّمنا واتساب', ctaFollow: 'تابعنا على منصات التواصل', launch: 'بنجهّز المتجر الأونلاين',
      kAbout: 'عن <b class="seen-w">SEEN</b>',
      about: '<b class="seen-w">SEEN</b> علامة رائدة على ساحل البحر الأحمر، <mark>تقدّم لكم أكثر من 40 علامة من البراندات العالمية الأصلية 100%</mark> في مصر والشرق الأوسط — خبرة 12 عام بتقديم خدمات البصريات، وقريباً بين أيديكم المتجر الإلكتروني.',
      sBrands: 'براند عالمي', sAuth: 'أصلي', sFrames: 'فريم في مجموعتنا', sBranches: 'فروع',
      kSvc: 'المتجر الأونلاين هيقدّم', hSvc: 'كل SEEN، أونلاين', pSvc: 'ده اللي هتقدر تعمله على seeneyeweareg.com من أول يوم.',
      soon: 'قريباً',
      svc: [
        ['bag', 'تسوّق أكتر من 40 براند', 'Ray-Ban وMaui Jim وGucci وCarrera وPolaroid وغيرهم — كل فريم أصلي 100%.'],
        ['cam', 'جرّب بالكاميرا', 'شوف أي فريم على وشك لايف قبل ما تقرر.'],
        ['cube', 'شوف الفريم 3D', 'لِف الفريم وشوفه من كل زاوية عن قرب.'],
        ['truck', 'توصيل لكل مصر', 'اطلب أونلاين ويوصلك لحد باب البيت.'],
        ['store', 'اطلب أونلاين واستلم من الفرع', 'احجز أونلاين واستلم من سيتي سنتر أو الجونة أو الكوثر.'],
        ['eye', 'احفظ مقاس نظرك', 'خلّي مقاس النظر محفوظ في حسابك للطلبات الطبية.']
      ],
      kBrands: 'البراندات بتاعتنا', hBrands: 'الأسامي اللي بتحبها',
      kLoc: 'زورنا', hLoc: 'فروعنا', pLoc: 'تعالى جرّب أي فريم بنفسك. كل قطعة أصلية 100%.',
      directions: 'الاتجاهات', call: 'اتصل',
      kFollow: 'خليك قريب', hFollow: 'تابعوا SEEN على منصات التواصل', pFollow: 'الموديلات الجديدة والعروض ويوم افتتاح المتجر الأونلاين، أول حاجة على صفحاتنا.',
      hBand: 'تجربة تستحق أن تُرى… في طريقها إليكم.', pBand: 'وإلى ذلك الحين، يسعدنا استقبالكم في فروعنا، حيث يرافقكم خبراؤنا في اختيار إطاركم القادم والعدسات اللاصقة الأنسب لكم.',
      foot: 'الغردقة · الجونة · مصر',
      review: 'قيّمنا على جوجل', googleTip: 'تقييمات جوجل',
      kRate: 'رأيكم يهمنا', hRate: 'قيّموا تجربتكم مع SEEN', pRate: 'شاركونا رأيكم، وكيف يمكننا أن نخدمكم بصورة أفضل.',
      gTitle: 'قيّمونا على جوجل', gText: 'كلماتكم على جوجل تساعد غيركم في العثور على إطارهم المثالي.',
      fbTitle: 'قيّموا الموقع واقترحوا تحسيناً للخدمة', fbRate: 'تقييمكم', fbName: 'الاسم بالكامل *', fbEmail: 'البريد الإلكتروني *', fbPhone: 'رقم الهاتف *', fbMsg: 'اقتراحكم',
      fbNote: 'نستخدم بياناتكم فقط للرد على اقتراحكم.', fbSend: 'إرسال',
      star: ['ضعيف', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'],
      eRate: 'برجاء اختيار التقييم.', eName: 'برجاء إدخال الاسم بالكامل.', eEmail: 'برجاء إدخال بريد إلكتروني صحيح.', ePhone: 'برجاء إدخال رقم هاتف صحيح.',
      fbOk: 'شكراً لكم! تم استلام رأيكم.', fbWa: 'جاري فتح واتساب ورسالتكم جاهزة — اضغطوا إرسال فقط.', fbOff: 'سيتم تفعيل هذا النموذج قريباً جداً. شكراً لتفهمكم.', fbErr: 'حدث خطأ، برجاء المحاولة مرة أخرى أو التواصل معنا عبر واتساب.'
    }
  };
  var L = function () { return root.lang === 'ar' ? 'ar' : 'en'; };
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
  function hero() {
    var lines = t('h1').map(function (x) { return { em: /^<em>/.test(x), text: x.replace(/<\/?em>/g, '') }; });
    var el = $('h1'); el.setAttribute('aria-label', lines.map(function (l) { return l.text; }).join(' '));
    el.innerHTML = lines.map(function (l) {
      var w = l.em ? ['<em>', '</em>'] : ['', ''];
      return '<span class="ln" aria-hidden="true"><span class="ghost">' + w[0] + esc(l.text) + w[1] + '</span><span class="tw">' + w[0] + '<span class="tx"></span>' + w[1] + '</span></span>';
    }).join('');
    var tx = el.querySelectorAll('.tx'), caret = document.createElement('i'); caret.className = 'caret';
    var my = ++twToken;
    if (reduce) { lines.forEach(function (l, i) { tx[i].textContent = l.text; }); tx[tx.length - 1].after(caret); return; }
    var li = 0, ci = 0;
    (function step() {
      if (my !== twToken) return;
      if (li >= lines.length) { el.classList.add('typed'); return; }
      tx[li].after(caret);
      var chars = Array.from(lines[li].text);
      if (ci < chars.length) { ci++; tx[li].textContent = chars.slice(0, ci).join(''); setTimeout(step, chars[ci - 1] === ' ' ? 40 : 75); }
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
    if (C.whatsapp) { var w = $('ctaWa'); w.hidden = false; w.href = 'https://wa.me/' + encodeURIComponent(C.whatsapp); w.target = '_blank'; w.rel = 'noopener noreferrer'; }
  }
  function orbit() {
    var f = (C.frames || []).map(function (x) { return typeof x === 'string' ? { src: x } : x; });
    $('orbit').innerHTML = f.map(function (x) {
      return '<span class="fr"><img src="' + esc(x.src) + '" alt="" decoding="async" draggable="false" onerror="this.parentNode.remove()">' +
        (x.brand ? '<span class="bn">' + esc(x.brand) + '</span>' : '') + '</span>';
    }).join('');
  }
  /* Wheel: turns slowly by itself; drag, flick or the mouse wheel turn it; hovering or tapping a frame enlarges it */
  function wheel() {
    var stage = $('lensStage'), cfg = C.wheel || {}, fr = cfg.friction || 2.4;
    var speed = reduce ? 0 : (cfg.speed == null ? 7 : cfg.speed);
    var rot = 0, vel = 0, drag = null, hover = null, last = 0, visible = true;
    function items() { return stage.querySelectorAll('.fr'); }
    function place() {
      var it = items(), n = it.length, R = stage.clientWidth * .45;
      for (var i = 0; i < n; i++) {
        var a = (rot + 360 / n * i - 90) * Math.PI / 180;
        it[i].style.setProperty('--x', (Math.cos(a) * R).toFixed(1) + 'px');
        it[i].style.setProperty('--y', (Math.sin(a) * R).toFixed(1) + 'px');
      }
    }
    function angle(e) {
      var r = stage.getBoundingClientRect();
      return Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2) * 180 / Math.PI;
    }
    function setOn(el) { if (hover === el) return; if (hover) hover.classList.remove('on'); hover = el; if (el) el.classList.add('on'); }
    stage.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      drag = { a: angle(e), t: performance.now(), moved: 0, el: e.target.closest('.fr'), type: e.pointerType };
      vel = 0; stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', function (e) {
      if (!drag) { if (e.pointerType === 'mouse') setOn(e.target.closest('.fr')); return; }
      var a = angle(e), d = a - drag.a; if (d > 180) d -= 360; if (d < -180) d += 360;
      var now = performance.now(), dt = Math.max(1, now - drag.t) / 1000;
      rot += d; vel = vel * .5 + (d / dt) * .5; drag.a = a; drag.t = now; drag.moved += Math.abs(d);
      if (drag.moved > 3) { stage.classList.add('dragging'); setOn(null); }
      place();
    });
    function end() {
      if (!drag) return;
      if (drag.moved <= 3 && drag.el) setOn(hover === drag.el && drag.type !== 'mouse' ? null : drag.el); // tap toggles the zoom
      if (performance.now() - drag.t > 90) vel = 0; // held still before letting go: no flick
      vel = Math.max(-900, Math.min(900, vel)); drag = null; stage.classList.remove('dragging');
    }
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
    stage.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && !drag) setOn(null); });
    stage.addEventListener('wheel', function (e) {
      var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!d) return; e.preventDefault(); vel = Math.max(-900, Math.min(900, vel + d * 1.4));
    }, { passive: false });
    document.addEventListener('pointerdown', function (e) { if (!stage.contains(e.target)) setOn(null); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(stage);
    window.addEventListener('resize', place);
    place();
    (function loop(ts) {
      var dt = last ? Math.min(.05, (ts - last) / 1000) : 0; last = ts;
      if (visible && !drag) {
        vel *= Math.exp(-fr * dt); if (Math.abs(vel) < .5) vel = 0;
        var step = vel + (hover ? 0 : speed);
        if (step) { rot += step * dt; place(); }
      }
      requestAnimationFrame(loop);
    })(0);
  }
  function applyText() {
    document.querySelectorAll('[data-t]').forEach(function (el) { var v = t(el.dataset.t); if (typeof v === 'string') el.textContent = v; });
    document.querySelectorAll('[data-t-html]').forEach(function (el) { el.innerHTML = t(el.dataset.tHtml); });
    document.querySelectorAll('[data-t-label]').forEach(function (el) { el.setAttribute('aria-label', t(el.dataset.tLabel)); });
    var lb = $('lang'); lb.textContent = L() === 'ar' ? 'EN' : 'ع'; lb.setAttribute('aria-label', L() === 'ar' ? 'English' : 'العربية');
    hero(); services(); branches(); social(); stars(); observe();
  }

  /* ---------- Language / mode ---------- */
  $('lang').addEventListener('click', function () {
    var ar = L() !== 'ar'; root.lang = ar ? 'ar' : 'en'; root.dir = ar ? 'rtl' : 'ltr'; save('seenLpLang', root.lang); applyText();
  });
  function syncMode() { $('mode').setAttribute('aria-pressed', String(root.getAttribute('data-mode') === 'dark')); }
  $('mode').addEventListener('click', function () {
    var d = root.getAttribute('data-mode') !== 'dark';
    if (d) root.setAttribute('data-mode', 'dark'); else root.removeAttribute('data-mode');
    save('seenLpMode', d ? 'dark' : 'light'); syncMode();
  });

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
      return done('fbWa');
    }
    if (fbc.send === 'endpoint' && fbc.endpoint) {
      fetch(fbc.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) })
        .then(function (r) { if (!r.ok) throw r; done('fbOk'); }).catch(function () { bad(null, 'fbErr'); });
      return;
    }
    done('fbOff');
  });

  /* ---------- Start ---------- */
  $('yr').textContent = new Date().getFullYear();
  orbit(); wheel(); applyText(); syncMode(); onScroll();
  if (window.SeenBrandStrip && C.brands) SeenBrandStrip.mount($('brands'), C.brands, C.brandStrip);
})();
