/* scene2.js · DOM signature scenes (no WebGL) for themes whose language is not particles.
   Same contract as scene.js: kind(cfg) -> { shot(page, i), destroy() }. Registered in Deck.sceneKinds.
   morph-ui  – one UI element that morphs into the next state on every page, driven by a cursor (product-mono)
   cards3d   – image cards floating on a curved 3D arc, the camera turns per page (generic scene kind)
   type      – giant italic serif glyphs as a kinetic backdrop, masked roll per page (editorial-archive) */
(function () {
  'use strict';
  const D = window.Deck, h = D.h, an = D.an;
  const K = (D.sceneKinds = D.sceneKinds || {});
  const SPRING = 'cubic-bezier(.34,1.22,.64,1)';   // a tiny overshoot at most
  const layer = cls => { const w = h('div', { class: 'scn ' + cls, 'aria-hidden': 'true' }); document.body.insertBefore(w, document.getElementById('app')); return w; };
  const valueOf = (page, i) => { const it = page && ((page.items && page.items[0] && page.items[0].value != null && page.items[0]) || (page.value != null && page)); return it ? (it.prefix || '') + String(it.value).replace('.', ',') + (it.suffix || '') : null; };

  /* ---------- morph-ui ---------- */
  K['morph-ui'] = cfg => {
    const w = layer('scn-morph'), el = h('div', { class: 'mo' }), cur = h('div', { class: 'mo-cur' }); w.append(el, cur);
    const STATES = cfg.states || ['button', 'loader', 'toggle', 'chart', 'island'];
    const look = {
      button: { w: 280, h: 76, r: 38, bg: 'var(--text)', html: '<span class="mo-t" style="color:var(--bg)">Loslegen <b>&rarr;</b></span>' },
      loader: { w: 104, h: 104, r: 52, bg: '#fff', html: '<i class="mo-spin"></i>' },
      toggle: { w: 176, h: 96, r: 48, bg: 'var(--accent2)', html: '<i class="mo-knob"></i>' },
      chart: { w: 440, h: 300, r: 18, bg: '#fff', html: '<div class="mo-chart">' + [38, 62, 48, 84, 70, 96].map((v, k) => `<i style="--v:${v}%;--k:${k}"></i>`).join('') + '</div>' },
      island: { w: 380, h: 72, r: 36, bg: 'var(--text)', html: '<span class="mo-t mo-isl"><i></i>Live &middot; synchron</span>' },
      number: { w: 420, h: 220, r: 22, bg: '#fff', html: '' }
    };
    let last = null;
    function shot(page, i) {
      const v = valueOf(page, i), key = v ? 'number' : STATES[i % STATES.length], L = Object.assign({}, look[key]);
      if (key === 'number') L.html = `<span class="mo-num">${v}</span><small class="mo-cap">${(page.items && page.items[0] && page.items[0].label) || ''}</small>`;
      if (last === key + (v || '')) return; last = key + (v || '');
      // the cursor travels to the element and clicks, then the element becomes the next state
      const r = el.getBoundingClientRect(), tx = r.left + r.width * .62, ty = r.top + r.height * .58;
      an(cur, [{ transform: getComputedStyle(cur).transform === 'none' ? `translate(${tx + 160}px,${ty + 120}px)` : getComputedStyle(cur).transform }, { transform: `translate(${tx}px,${ty}px)` }], { duration: 520, easing: D.EASE });
      setTimeout(() => {
        an(cur, [{ scale: 1 }, { scale: .82 }, { scale: 1 }], { duration: 220 });
        const old = el.firstElementChild; if (old) an(old, [{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(6px)' }], { duration: 180, fill: 'forwards' });
        an(el, [{ width: el.style.width || '0px', height: el.style.height || '0px', borderRadius: el.style.borderRadius || '0px', background: el.style.background || 'transparent' },
          { width: L.w + 'px', height: L.h + 'px', borderRadius: L.r + 'px', background: L.bg }], { duration: D.reduced ? 1 : 760, easing: SPRING }).then(() => {
          Object.assign(el.style, { width: L.w + 'px', height: L.h + 'px', borderRadius: L.r + 'px', background: L.bg }); el.getAnimations().forEach(a => a.cancel()); });
        setTimeout(() => { el.innerHTML = '<div class="mo-c">' + L.html + '</div>'; an(el.firstElementChild, [{ opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 320 }); }, 200);
      }, D.reduced ? 0 : 560);
    }
    return { shot, destroy() { w.remove(); } };
  };

  /* ---------- cards3d ---------- */
  K.cards3d = cfg => {
    const w = layer('scn-cards'), ring = h('div', { class: 'c3-ring' }); w.append(ring);
    const n = cfg.count || 10, imgs = cfg.images || [], cap = cfg.captions || [];
    const cards = Array.from({ length: n }, (_, k) => {
      const c = h('figure', { class: 'c3', style: { '--k': k, '--a': (k * 360 / n) + 'deg' } },
        imgs[k % (imgs.length || 1)] ? h('img', { src: imgs[k % imgs.length], alt: '' }) : h('i', { class: 'c3-ph', style: { '--h': (k * 23) % 60 } }),
        h('figcaption', null, String(k + 1).padStart(2, '0') + ' — ' + (cap[k] || 'Projekt')));
      ring.append(c); return c; });
    let rot = 0, tilt = -6, z = 0, mx = 0, my = 0, raf = 0, alive = true, tr = 0, tt = -6, tz = 0;
    const pm = e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }; addEventListener('pointermove', pm, { passive: true });
    (function loop() { if (!alive) return; raf = requestAnimationFrame(loop); const k = D.reduced ? 1 : .06;
      rot += (tr - rot) * k; tilt += (tt - tilt) * k; z += (tz - z) * k; tr -= D.reduced ? 0 : .012;
      ring.style.transform = `translateZ(${-900 + z}px) rotateX(${tilt + my * -6}deg) rotateY(${rot + mx * 10}deg)`; })();
    return { shot(page, i) { tr = -i * (360 / n) * 1.5 - 8; tt = [-6, 4, -12, 8, -2][i % 5]; tz = [0, 260, -120, 180, 60][i % 5]; },
      destroy() { alive = false; cancelAnimationFrame(raf); removeEventListener('pointermove', pm); w.remove(); } };
  };

  /* ---------- type ---------- */
  K.type = cfg => {
    const w = layer('scn-type'); let cur = null, last = '';
    return { shot(page, i) {
      const v = valueOf(page, i), word = v || (cfg.words && cfg.words[i % cfg.words.length]) || '§' + String(i + 1).padStart(2, '0');
      if (word === last) return; last = word;
      const g = h('div', { class: 'ty-g' }, h('span', null, word)); w.append(g);
      an(g.firstChild, [{ transform: 'translateY(110%) skewY(6deg)' }, { transform: 'none' }], { duration: D.reduced ? 1 : 1200, easing: D.EASE });
      if (cur) { const o = cur; an(o.firstChild, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-90%) skewY(-4deg)', opacity: 0 }], { duration: D.reduced ? 1 : 900, easing: D.EASE_IO }).then(() => o.remove()); }
      cur = g;
    }, destroy() { w.remove(); } };
  };
})();
