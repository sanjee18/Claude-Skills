/* page type: hotspots · interactive product stage (VEYRA principle), works with the user's own media.
   One framed image plane holds the product and its points (coordinates in % of the image, never of the screen).
   point.hover   {forward, reverse} short clips played on hover/focus (forward to the end, hold, then reverse back),
                 or {src} a still that cross-fades in (e.g. an X-ray render)
   point.detail  {src, kicker, title, text, items:[{x,y,label,text}], note}  click -> zoom/cross-fade into the cut-away,
                 component points + list toggle their explanation, Back pill or Esc returns
   point.variants [{label, color, src}]  panel below the frame (outside the product), choosing cross-fades the render
   Without src a neutral placeholder product is drawn, so the layout can be judged before the renders exist. */
(function () {
  'use strict';
  const D = window.Deck, R = D.reg.page, h = D.h, rich = D.rich, an = D.an;
  const isVid = s => /\.(mp4|webm|mov)(\?|$)|^data:video\//i.test(s || '');
  const PH = (fill) => 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1672 941"><defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${fill}"/><stop offset="1" stop-color="#8d969c"/></linearGradient><radialGradient id="s" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><ellipse cx="836" cy="760" rx="640" ry="46" fill="url(#s)"/><path d="M230 640c-6-60 20-96 70-118l170-48c60-70 150-150 270-176 140-30 330-24 470 22 70 24 150 80 210 140 90 10 160 40 196 78 24 26 30 64 26 100l-8 40c-4 18-20 30-38 30H262c-18 0-30-12-32-30z" fill="url(#b)"/><path d="M560 470c70-80 150-130 250-146 120-18 250-10 350 20 40 14 90 50 130 96z" fill="#2c3a44" opacity=".85"/><path d="M820 330l-14 140M1080 336l10 134" stroke="#c9d1d6" stroke-width="10"/><circle cx="470" cy="672" r="108" fill="#1d2328"/><circle cx="470" cy="672" r="64" fill="#9aa4ab"/><circle cx="1270" cy="672" r="108" fill="#1d2328"/><circle cx="1270" cy="672" r="64" fill="#9aa4ab"/><path d="M262 600h120M1500 590h70" stroke="#e8edf0" stroke-width="10" stroke-linecap="round"/></svg>`);

  R.hotspots = p => {
    const pts = p.points || [], base = p.src || PH(p.placeholder || '#d7dde1');
    const plane = h('div', { class: 'hs-plane', style: { '--ar': p.ratio || '1672 / 941' } });
    const baseImg = h('img', { class: 'hs-base', src: base, alt: p.alt || p.title || '' });
    const over = h('div', { class: 'hs-over' }), varImg = h('img', { class: 'hs-var', alt: '' });
    const detail = h('div', { class: 'hs-detail', 'aria-hidden': 'true' });
    const status = h('div', { class: 'sr', 'aria-live': 'polite' });
    plane.append(baseImg, varImg, over, detail);
    const frame = h('div', { class: 'hs-frame' }, plane);
    const panel = h('div', { class: 'hs-panel', role: 'dialog', 'aria-label': 'Varianten' });

    /* ---- hover playback: one settled pose, one desired target, never two clips at once ---- */
    let pose = null, want = null, busy = false, mode = 'overview', pending = null, quiet = false;
    const vids = {};
    pts.forEach((pt, k) => { if (pt.hover && pt.hover.forward) vids[k] = ['forward', 'reverse'].map(d => pt.hover[d] && Object.assign(h('video', { src: pt.hover[d], muted: true, playsinline: true, preload: 'auto' }), { muted: true })); });
    const show = el => { [...over.children].forEach(c => c !== el && c.classList.remove('on')); if (el) { if (!el.parentNode) over.append(el); el.classList.add('on'); } };
    const playTo = v => new Promise(res => { let done = false; const fin = () => { if (!done) { done = true; res(); } };
      v.currentTime = 0; v.onended = fin; v.onerror = fin; setTimeout(fin, (v.duration || 4) * 1000 + 1500);             // watchdog
      const go = () => { v.play().then(() => { const s = () => (v.currentTime > 0 ? show(v) : requestAnimationFrame(s)); s(); }, fin); };
      v.readyState > 1 ? go() : (v.oncanplay = () => { v.oncanplay = null; go(); }); });
    const mark = () => { plane.dataset.pose = pose; plane.dataset.want = want; plane.dataset.busy = busy; };   // state for QA / debugging
    async function pump() {
      mark(); if (busy || want === pose) return; busy = true;
      if (pose != null) {                                                     // return to neutral first
        const pt = pts[pose], v = vids[pose];
        if (v && v[1] && !D.reduced) await playTo(v[1]); show(null);
        if (pt.hover && pt.hover.src && !v) over.querySelectorAll('img').forEach(i => i.classList.remove('on'));
        pose = null;
      } else if (want != null) {
        const tgt = want, pt = pts[tgt], v = vids[tgt];   // the pose we actually play, even if the pointer moves on meanwhile
        if (v && v[0]) { if (D.reduced) { v[0].currentTime = Math.max(0, (v[0].duration || 1) - .05); show(v[0]); } else await playTo(v[0]); }
        else if (pt.hover && pt.hover.src) { let im = over.querySelector(`img[data-k="${tgt}"]`); if (!im) { im = h('img', { src: pt.hover.src, alt: '', 'data-k': tgt }); over.append(im); } show(im); }
        pose = tgt;
      }
      busy = false;
      if (pending != null && want === pose) { const k = pending; pending = null; openDetail(k); return; }   // click during a clip: run it once the clip settled
      pump();
    }
    const desire = k => { if (mode !== 'overview') return; want = k; pump(); };

    /* ---- detail cut-away ---- */
    function openDetail(k) {
      const pt = pts[k], d = pt.detail; if (!d || mode !== 'overview') return;
      if (busy) { pending = k; want = pts[k].hover ? k : want; return; }
      mode = 'detail'; want = null;
      detail.innerHTML = '';
      const img = h('img', { class: 'hs-dimg', src: d.src || base, alt: d.title || '' });
      const list = h('ol', { class: 'hs-list' }), info = h('p', { class: 'hs-info' });
      const pick = (j, it) => { const on = info.dataset.j === String(j); info.dataset.j = on ? '' : j; info.textContent = on ? '' : it.text || ''; detail.querySelectorAll('[data-j]').forEach(e => e.classList.toggle('on', !on && e.dataset.j === String(j))); };
      (d.items || []).forEach((it, j) => {
        if (it.x != null) detail.append(h('button', { class: 'hs-pt sm', 'data-j': j, style: { left: it.x + '%', top: it.y + '%' }, 'aria-label': it.label, onclick: () => pick(j, it) }, h('i')));
        list.append(h('li', null, h('button', { 'data-j': j, onclick: () => pick(j, it) }, h('span', null, String(j + 1).padStart(2, '0')), it.label)));
      });
      const back = h('button', { class: 'hs-back', onclick: close }, '← ', p.backLabel || 'Zurück', h('kbd', null, 'Esc'));
      detail.append(img, h('div', { class: 'hs-dtext' }, d.kicker && h('small', null, d.kicker), h('h3', { html: rich(d.title || pt.label) }), d.text && h('p', null, d.text), list, info, d.note && h('p', { class: 'hs-note' }, d.noteLabel && h('b', null, d.noteLabel), d.note)), back);
      detail.style.setProperty('--ox', pt.x + '%'); detail.style.setProperty('--oy', pt.y + '%');
      detail.classList.add('on'); detail.setAttribute('aria-hidden', 'false'); plane.classList.add('in-detail');
      an(img, [{ transform: 'scale(1.45)', opacity: 0, filter: 'blur(10px)' }, { transform: 'none', opacity: 1, filter: 'blur(0)' }], { duration: D.reduced ? 1 : 900, easing: D.EASE });
      an(detail.querySelector('.hs-dtext'), [{ opacity: 0, transform: 'translateX(20px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 350 });
      status.textContent = (d.title || pt.label) + ' geöffnet'; setTimeout(() => back.focus(), 60);
      function close() {
        if (mode !== 'detail') return; mode = 'returning';
        an(detail, [{ opacity: 1 }, { opacity: 0 }], { duration: D.reduced ? 1 : 500 }).then(() => {
          detail.classList.remove('on'); detail.setAttribute('aria-hidden', 'true'); detail.getAnimations().forEach(a => a.cancel()); plane.classList.remove('in-detail');
          show(null); pose = null; mode = 'overview'; status.textContent = 'Übersicht'; const b = plane.querySelector(`.hs-pt[data-k="${k}"]`); if (b) { quiet = true; b.focus(); quiet = false; } });
      }
      detail._close = close;
    }

    /* ---- variants panel (below the frame, never over the product) ---- */
    function openVariants(k) {
      const pt = pts[k]; if (mode !== 'overview') return;
      mode = 'config'; want = null; pump();
      panel.innerHTML = ''; panel.style.setProperty('--px', pt.x + '%');
      const cur = varImg.dataset.k === String(k) ? +varImg.dataset.v : 0;
      panel.append(h('div', { class: 'hs-ptitle' }, h('b', null, pt.label), pt.text && h('small', null, pt.text)),
        h('div', { class: 'hs-sw' }, pt.variants.map((v, j) => h('button', { class: (j === cur ? 'on' : '') + (v.color ? '' : ' txt'), style: { '--c': v.color || '#ccc' }, 'aria-label': v.label, title: v.label, onclick: e => {
          panel.querySelectorAll('.hs-sw button').forEach(b => b.classList.toggle('on', b === e.currentTarget));
          const apply = () => { if (pose != null || busy) return setTimeout(apply, 80);   // wait for the authored return to neutral
          if (v.src) { varImg.src = v.src; varImg.dataset.k = k; varImg.dataset.v = j; varImg.classList.toggle('on', j > 0 || !!v.src); }
          else if (!p.src) { baseImg.src = PH(v.color || '#d7dde1'); varImg.classList.remove('on'); }
          if (j === 0 && !v.src) varImg.classList.remove('on');
          status.textContent = pt.label + ': ' + v.label; }; apply(); } }, v.color ? h('i') : v.label))),
        h('button', { class: 'hs-x', 'aria-label': 'Schließen', onclick: closeVariants }, '×'));
      panel.classList.add('on'); plane.classList.add('in-config'); frame.parentNode && frame.parentNode.classList.add('cfg-open');
      setTimeout(() => { const b = panel.querySelector('.hs-sw .on'); b && b.focus(); }, 50);
    }
    function closeVariants() { if (mode !== 'config') return; varImg.classList.remove('on'); delete varImg.dataset.k; if (!p.src) baseImg.src = base; panel.classList.remove('on'); plane.classList.remove('in-config'); frame.parentNode && frame.parentNode.classList.remove('cfg-open'); mode = 'overview'; }

    /* ---- points ---- */
    pts.forEach((pt, k) => {
      const b = h('button', { class: 'hs-pt', 'data-k': k, style: { left: pt.x + '%', top: pt.y + '%' }, 'aria-label': pt.label + (pt.detail ? ' – Details öffnen' : pt.variants ? ' – Varianten' : '') },
        h('i'), h('span', { class: 'hs-lbl' }, pt.label));
      const enter = () => (pt.hover && !quiet ? desire(k) : null), leave = () => { if (want === k) desire(null); };
      b.addEventListener('pointerenter', enter); b.addEventListener('pointerleave', leave); b.addEventListener('focus', enter); b.addEventListener('blur', leave);
      b.addEventListener('click', () => (pt.detail ? openDetail(k) : pt.variants ? (mode === 'config' ? closeVariants() : openVariants(k)) : null));
      plane.append(b);
    });
    const esc = e => { if (e.key !== 'Escape') return; if (mode === 'detail') { e.stopPropagation(); detail._close(); } else if (mode === 'config') { e.stopPropagation(); closeVariants(); } };

    const foot = p.footer || pts.map(pt => ({ title: pt.label, text: pt.text || '' }));
    const el = h('div', { class: 'p-hotspots' },
      h('div', { class: 'hs-head' }, h('div', null, p.kicker && h('div', { class: 'kicker', 'data-tx': 'fade-up' }, p.kicker), h('h2', { class: 't t-l', 'data-tx': p.enter || D.DEF_TX, html: rich(p.title || '') })),
        p.sub && h('p', { class: 'hs-sub', 'data-tx': 'fade-up', 'data-d': 300 }, p.sub)),
      frame, panel,
      h('div', { class: 'hs-foot', 'data-stagger': '' }, foot.map(f => h('div', null, h('b', null, f.title), h('span', null, f.text)))),
      p.meta && h('div', { class: 'hs-meta' }, p.meta), status);
    return {
      el,
      enter(st) { addEventListener('keydown', esc, true); an(frame, [{ opacity: 0, transform: 'translateY(16px) scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 900, delay: 150 });
        [...plane.querySelectorAll(':scope > .hs-pt')].forEach((b, i) => an(b, [{ opacity: 0, scale: .4 }, { opacity: 1, scale: 1 }], { duration: 500, delay: 700 + i * 90, easing: 'cubic-bezier(.34,1.4,.64,1)' })); },
      leave() { removeEventListener('keydown', esc, true); if (mode === 'detail') detail._close(); closeVariants(); want = null; }
    };
  };
})();
