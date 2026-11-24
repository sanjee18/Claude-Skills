/* html-experience-studio · core: registries + helpers (no dependencies) */
(function () {
  'use strict';
  const D = (window.Deck = window.Deck || {});
  D.reg = { bg: {}, tx: {}, tr: {}, page: {} };
  D.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  D.EASE = 'cubic-bezier(.23,1,.32,1)';      // strong ease-out: entrances
  D.EASE_IO = 'cubic-bezier(.77,0,.175,1)';  // on-screen movement
  D.EASE_DR = 'cubic-bezier(.32,.72,0,1)';   // drawer / slide

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  D.$ = $; D.$$ = $$;

  function h(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') { for (const sk in v) { if (sk.slice(0, 2) === '--') e.style.setProperty(sk, v[sk]); else e.style[sk] = v[sk]; } }
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    kids.flat(2).forEach(c => { if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c)); });
    return e;
  }
  D.h = h;

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  D.esc = esc;
  // rich text: *accent* -> accent colour, \n -> <br>
  D.rich = s => esc(s == null ? '' : s).replace(/\*([^*]+)\*/g, '<span class="acc">$1</span>').replace(/\n/g, '<br>');

  // WAAPI helper: reduced-motion safe, never throws
  D.an = (el, kf, o) => {
    if (!el) return Promise.resolve();
    o = Object.assign({ fill: 'both', easing: D.EASE, duration: 600 }, o);
    if (D.reduced) { o.duration = Math.min(o.duration, 120); o.delay = 0; }
    try { return el.animate(kf, o).finished.catch(() => {}); } catch (e) { return Promise.resolve(); }
  };

  D.cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  D.rgb = (name, fb) => {
    let v = D.cssVar(name) || fb || '#5fd6ff';
    if (v[0] === '#') {
      if (v.length === 4) v = '#' + [...v.slice(1)].map(c => c + c).join('');
      const n = parseInt(v.slice(1, 7), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    const m = v.match(/[\d.]+/g);
    return m ? m.slice(0, 3).map(Number) : [95, 214, 255];
  };

  const IC = {
    bolt: 'M13 2 4 14h7l-1 8 9-12h-7z',
    shield: 'M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z',
    chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
    cloud: 'M7 18a4 4 0 0 1-.5-8 6 6 0 0 1 11.5 1.5A3.5 3.5 0 0 1 17.5 18z',
    cpu: 'M6 6h12v12H6zM9 9h6v6H9zM4 9h2M4 15h2M18 9h2M18 15h2M9 4v2M15 4v2M9 18v2M15 18v2',
    users: 'M16 20v-2a4 4 0 0 0-8 0v2M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM22 20v-1.5a3 3 0 0 0-2-2.8M17 6.3a3 3 0 0 1 0 5.4',
    globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2c3 3 3 17 0 20M12 2c-3 3-3 17 0 20',
    lock: 'M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4',
    spark: 'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z',
    layers: 'M12 3 2 8l10 5 10-5zM2 13l10 5 10-5',
    route: 'M6 20a2 2 0 1 0 0-.01M18 6a2 2 0 1 0 0-.01M8 19h7a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h7',
    target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
    arrow: 'M5 12h14M13 6l6 6-6 6'
  };
  D.icon = (n, cls) => IC[n] ? `<svg class="${cls || 'ico'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${IC[n]}"/></svg>` : '';

  D.countUp = (el, to, o) => {
    o = o || {};
    const dec = o.dec || 0, dur = D.reduced ? 1 : (o.dur || 1600), t0 = performance.now() + (o.delay || 0);
    const fmt = v => v.toLocaleString(document.documentElement.lang || undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
    el.textContent = fmt(0);
    (function tick(now) {
      const t = Math.max(0, Math.min(1, (now - t0) / dur));
      const e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      el.textContent = fmt(to * e);
      if (t < 1) requestAnimationFrame(tick);
    })(performance.now());
  };

  // staggered entrance for the children of a container. Varied, not metronomic.
  D.stagger = c => {
    [...c.children].forEach((k, i) => !k.dataset.flipped && D.an(k,
      [{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'none' }],
      { duration: 720, delay: 260 + Math.round(95 * Math.pow(i, .8)) }));
  };
})();
