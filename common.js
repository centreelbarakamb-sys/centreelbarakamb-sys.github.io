// Shared helpers for all pages
(function () {
  const B = window.BARAKA || {};

  B.api = async function (action, params) {
    if (!B.API_URL || B.API_URL.indexOf('PASTE_') === 0) throw new Error('setup');
    const q = new URLSearchParams(Object.assign({ action: action, _: Date.now() }, params || {}));
    const res = await fetch(B.API_URL + '?' + q.toString(), { method: 'GET', redirect: 'follow' });
    if (!res.ok) throw new Error('http ' + res.status);
    return res.json();
  };

  B.store = {
    get: function (k) { try { return localStorage.getItem('baraka_' + k) || ''; } catch (e) { return ''; } },
    set: function (k, v) { try { localStorage.setItem('baraka_' + k, v); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem('baraka_' + k); } catch (e) {} }
  };

  B.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  const DAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  B.dayLabel = function (iso) {
    const p = iso.split('-').map(Number);
    const w = new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay();
    return DAYS_AR[w] + ' ' + p[2] + '/' + p[1];
  };

  B.errorText = function (err) {
    if (err && err.message === 'setup') return 'الموقع لم يُربط بالشيت بعد (config.js) · Site non configuré';
    return 'لا يوجد اتصال بالإنترنت — حاول مرة أخرى · Pas de connexion, réessayez';
  };

  // Children saved on this parent's phone: [{c: parentCode, n: name}]
  B.kids = {
    list: function () { try { return JSON.parse(B.store.get('kids') || '[]'); } catch (e) { return []; } },
    add: function (c, n) {
      const l = B.kids.list().filter(function (k) { return k.c !== c; });
      l.push({ c: c, n: n || '' });
      B.store.set('kids', JSON.stringify(l.slice(-10)));
    },
    remove: function (c) { B.store.set('kids', JSON.stringify(B.kids.list().filter(function (k) { return k.c !== c; }))); }
  };

  B.qrSvg = function (text) {
    try { const q = qrcode(0, 'M'); q.addData(text); q.make(); return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); }
    catch (e) { return ''; }
  };

  // Logo in every page header + browser icon
  function addLogo() {
    const brand = document.querySelector('header .brand');
    if (brand && !brand.querySelector('.logo')) {
      const wrap = document.createElement('div');
      while (brand.firstChild) wrap.appendChild(brand.firstChild);
      const img = document.createElement('img');
      img.src = 'logo.jpg'; img.alt = 'El Baraka'; img.className = 'logo';
      brand.appendChild(img); brand.appendChild(wrap);
    }
    if (!document.querySelector('link[rel="icon"]')) {
      const l = document.createElement('link'); l.rel = 'icon'; l.href = 'icon.png'; document.head.appendChild(l);
      const a = document.createElement('link'); a.rel = 'apple-touch-icon'; a.href = 'icon.png'; document.head.appendChild(a);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addLogo); else addLogo();

  window.BARAKA = B;
})();
