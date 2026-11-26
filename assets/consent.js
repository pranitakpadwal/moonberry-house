/* Cookie notice. Analytics (Google Tag Manager) loads ONLY after the visitor accepts. */
(function () {
  'use strict';
  var KEY = 'mb_consent', GTM = 'GTM-5N4XFPW4';
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { if (v === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, v); } catch (e) {} }
  var MARATHI_ENABLED = false; /* Marathi switched off for now */
  function lang() { if (!MARATHI_ENABLED) return 'en'; try { return localStorage.getItem('mb_lang') === 'mr' ? 'mr' : 'en'; } catch (e) { return 'en'; } }

  function loadGTM() {
    if (window.__mbGtm) return;
    window.__mbGtm = true;
    (function (w, d, s, l, i) {
      w[l] = w[l] || []; w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true; j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', GTM);
  }

  var TXT = {
    en: {
      title: 'Cookies, kept simple',
      body: 'We would like to use analytics cookies to see which pages are useful. They are optional, we never use them for ads, and the site works fully if you say no.',
      yes: 'Accept analytics', no: 'No thanks', more: 'Read our privacy policy'
    },
    mr: {
      title: 'कुकीज, सोप्या शब्दांत',
      body: 'कोणती पानं उपयोगी आहेत हे समजण्यासाठी आम्हाला विश्लेषण कुकीज वापरायच्या आहेत. त्या ऐच्छिक आहेत, जाहिरातींसाठी आम्ही त्या कधीच वापरत नाही, आणि तुम्ही नाही म्हटलंत तरी साइट पूर्ण चालते.',
      yes: 'विश्लेषण स्वीकारा', no: 'नको, धन्यवाद', more: 'आमचं गोपनीयता धोरण वाचा'
    }
  };

  function injectCss() {
    if (document.getElementById('mb-consent-css')) return;
    var st = document.createElement('style'); st.id = 'mb-consent-css';
    st.textContent =
      '#mb-consent{position:fixed;left:1rem;right:1rem;bottom:1rem;z-index:90;max-width:560px;background:#241B4E;color:#FFF6E0;border:2px solid #FFE9B8;border-radius:20px;padding:1.1rem 1.3rem;box-shadow:0 12px 32px rgba(0,0,0,.35);font:400 1rem/1.5 Mukta,system-ui,sans-serif}' +
      '#mb-consent h2{font:800 1.15rem Baloo,sans-serif;margin:0 0 .3rem;color:#FFE9B8}' +
      '#mb-consent p{margin:0 0 .8rem}' +
      '#mb-consent a{color:#FFE9B8}' +
      '#mb-consent .row{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center}' +
      '#mb-consent button{min-height:44px;padding:.4rem 1.2rem;border-radius:999px;border:2px solid #FFE9B8;font:700 1rem Mukta,sans-serif;cursor:pointer}' +
      '#mb-consent .yes{background:#FF6F91;border-color:#FF6F91;color:#3A1020}' +
      '#mb-consent .no{background:transparent;color:#FFF6E0}' +
      '#mb-consent button:focus-visible,#mb-consent a:focus-visible{outline:3px solid #FFC857;outline-offset:3px}';
    document.head.appendChild(st);
  }

  function close() { var el = document.getElementById('mb-consent'); if (el) el.remove(); }

  function show() {
    close(); injectCss();
    var t = TXT[lang()];
    var el = document.createElement('div');
    el.id = 'mb-consent'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-labelledby', 'mb-consent-t');
    if (lang() === 'mr') el.lang = 'mr';
    el.innerHTML = '<h2 id="mb-consent-t"></h2><p></p><div class="row"><button type="button" class="yes"></button><button type="button" class="no"></button><a href="/privacy/"></a></div>';
    el.querySelector('h2').textContent = t.title;
    el.querySelector('p').textContent = t.body;
    el.querySelector('.yes').textContent = t.yes;
    el.querySelector('.no').textContent = t.no;
    el.querySelector('a').textContent = t.more;
    el.querySelector('.yes').addEventListener('click', function () { set('granted'); close(); loadGTM(); });
    el.querySelector('.no').addEventListener('click', function () {
      var was = get(); set('denied'); close();
      if (was === 'granted') location.reload(); /* stop any analytics that already started */
    });
    document.body.appendChild(el);
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-cookie-settings]');
    if (a) { e.preventDefault(); show(); }
  });

  function init() {
    var c = get();
    if (c === 'granted') loadGTM();
    else if (c !== 'denied') show();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
