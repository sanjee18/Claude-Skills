/* finish & interaction layer (theme.fx list).
   CSS-only: grain · glass · gradient · vignette · scanlines · outline-cards   (body class fx-<id>)
   JS:       tilt · magnetic · cursor-glow · parallax · click-ripple           (init() -> destroy)
   Pointer effects only run on devices with a fine pointer and never under reduced motion. */
(function () {
  'use strict';
  const D = window.Deck, h = D.h, R = (D.reg.fx = D.reg.fx || {});
  const fine = () => matchMedia('(hover:hover) and (pointer:fine)').matches && !D.reduced;
  const listen = (t, ev, fn) => { t.addEventListener(ev, fn, { passive: true }); return () => t.removeEventListener(ev, fn); };
  const TILT = '.card,.tile,.node,.device,.stat,.st-panel,.card-flat';

  // cards lean towards the cursor (max 7°), with a moving highlight
  R.tilt = () => {
    if (!fine()) return () => {};
    let last = null;
    const off = listen(document, 'pointermove', e => {
      const c = e.target.closest && e.target.closest(TILT);
      if (last && last !== c) { last.style.transform = ''; last.classList.remove('tilting'); }
      last = c; if (!c) return;
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.classList.add('tilting'); c.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateZ(0)`;
      c.style.setProperty('--gx', (x + .5) * 100 + '%'); c.style.setProperty('--gy', (y + .5) * 100 + '%');
    });
    return () => { off(); if (last) last.style.transform = ''; };
  };
  // buttons and hub nodes are pulled slightly towards the cursor
  R.magnetic = () => {
    if (!fine()) return () => {};
    let last = null;
    const off = listen(document, 'pointermove', e => {
      const b = e.target.closest && e.target.closest('.btn,.node,.st-tab');
      if (last && last !== b) last.style.translate = '';
      last = b; if (!b) return;
      const r = b.getBoundingClientRect(); b.style.translate = `${(e.clientX - r.left - r.width / 2) * .25}px ${(e.clientY - r.top - r.height / 2) * .3}px`;
    });
    return () => { off(); if (last) last.style.translate = ''; };
  };
  // a soft accent light follows the cursor across the whole page
  R['cursor-glow'] = () => {
    if (!fine()) return () => {};
    const g = h('div', { class: 'fx-glow' }); document.body.append(g);
    let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty, raf = 0, alive = true;
    const off = listen(window, 'pointermove', e => { tx = e.clientX; ty = e.clientY; });
    (function f() { if (!alive) return; x += (tx - x) * .12; y += (ty - y) * .12; g.style.transform = `translate(${x}px,${y}px)`; raf = requestAnimationFrame(f); })();
    return () => { alive = false; cancelAnimationFrame(raf); off(); g.remove(); };
  };
  // content layers drift against the pointer: title more, the rest less (depth)
  R.parallax = () => {
    if (!fine()) return () => {};
    const off = listen(window, 'pointermove', e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5, st = document.querySelector('.stage.is-active:not([aria-hidden="true"]) .inner') || document.querySelector('.stage.is-active .inner');
      document.documentElement.style.setProperty('--px', x.toFixed(3)); document.documentElement.style.setProperty('--py', y.toFixed(3));
      if (st) st.classList.add('plx');
    });
    return () => { off(); document.querySelectorAll('.plx').forEach(e => e.classList.remove('plx')); };
  };
  // ink ripple from every click on interactive elements
  R['click-ripple'] = () => {
    const off = listen(document, 'pointerdown', e => {
      const t = e.target.closest && e.target.closest('button,.card,.tile'); if (!t || D.reduced) return;
      const r = t.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2, s = h('span', { class: 'fx-ripple', style: { left: e.clientX - r.left - d / 2 + 'px', top: e.clientY - r.top - d / 2 + 'px', width: d + 'px', height: d + 'px' } });
      if (getComputedStyle(t).position === 'static') t.style.position = 'relative';
      t.append(s); D.an(s, [{ transform: 'scale(0)', opacity: .35 }, { transform: 'scale(1)', opacity: 0 }], { duration: 700, easing: 'ease-out', fill: 'none' }).then(() => s.remove());
    });
    return off;
  };

  const CSS_ONLY = ['grain', 'glass', 'gradient', 'vignette', 'scanlines', 'outline-cards'];
  D.FX = CSS_ONLY.concat(Object.keys(R));
  let live = [];
  D.applyFx = list => {
    live.forEach(f => f()); live = [];
    D.FX.forEach(k => document.body.classList.toggle('fx-' + k, list.includes(k)));
    list.forEach(k => { if (R[k]) live.push(R[k]()); });
  };
})();
