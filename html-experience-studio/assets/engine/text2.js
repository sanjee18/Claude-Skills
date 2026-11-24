/* text animations, extended library:
   split-lines · rotate-words · zoom-words · flip-chars · slot-chars · blur-chars · wave-chars · tracking-in ·
   shine · marker · outline-fill · glitch · underline-draw
   Same contract as text.js: tx[id](el,{delay}) -> Promise. Reduced motion handled by D.an. */
(function () {
  'use strict';
  const D = window.Deck, R = D.reg.tx, an = D.an, split = D.split;
  const all = ps => Promise.all(ps);
  const SPRING = 'cubic-bezier(.34,1.56,.64,1)';

  // words grouped into visual lines; lines rise one after another out of a mask
  R['split-lines'] = (el, o) => {
    const ws = split(el, 'words'), tops = [...new Set(ws.map(w => w.parentNode.offsetTop))].sort((a, b) => a - b);
    return all(ws.map(w => an(w, [{ transform: 'translateY(115%) rotate(3deg)' }, { transform: 'none' }], { duration: 1000, delay: (o.delay || 0) + tops.indexOf(w.parentNode.offsetTop) * 130, easing: D.EASE })));
  };
  R['rotate-words'] = (el, o) => {
    const ws = split(el, 'words'); ws.forEach(w => { w.parentNode.style.perspective = '600px'; });
    return all(ws.map((w, i) => an(w, [{ opacity: 0, transform: 'rotateX(-85deg)', transformOrigin: '50% 100%' }, { opacity: 1, transform: 'none', transformOrigin: '50% 100%' }], { duration: 900, delay: (o.delay || 0) + i * 70 })));
  };
  R['zoom-words'] = (el, o) => {
    const ws = split(el, 'words'); ws.forEach(w => { w.parentNode.style.overflow = 'visible'; });
    return all(ws.map((w, i) => an(w, [{ opacity: 0, transform: 'scale(2.2)', filter: 'blur(12px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 950, delay: (o.delay || 0) + i * 90 })));
  };
  R['flip-chars'] = (el, o) => {
    const cs = split(el, 'chars'), st = Math.min(32, 800 / Math.max(cs.length, 1)); cs.forEach(c => { c.parentNode.style.perspective = '500px'; });
    return all(cs.map((c, i) => an(c, [{ opacity: 0, transform: 'rotateY(-90deg)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: (o.delay || 0) + i * st })));
  };
  R['slot-chars'] = (el, o) => {
    const cs = split(el, 'chars'); cs.forEach(c => { const p = c.parentNode; p.style.overflow = 'hidden'; p.style.verticalAlign = 'top'; p.style.paddingBottom = '.12em'; });
    return all(cs.map((c, i) => an(c, [{ transform: 'translateY(-120%)' }, { transform: 'translateY(12%)', offset: .75 }, { transform: 'none' }], { duration: 700 + (i % 3) * 140, delay: (o.delay || 0) + ((i * 37) % 11) * 45, easing: 'cubic-bezier(.2,.7,.3,1)' })));
  };
  R['blur-chars'] = (el, o) => {
    const cs = split(el, 'chars');
    return all(cs.map((c, i) => an(c, [{ opacity: 0, filter: 'blur(8px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 650, delay: (o.delay || 0) + ((i * 29) % 17) * 40, easing: 'ease-out' })));
  };
  R['wave-chars'] = (el, o) => {
    const cs = split(el, 'chars'), st = Math.min(30, 800 / Math.max(cs.length, 1));
    return all(cs.map((c, i) => an(c, [{ opacity: 0, transform: 'translateY(60%) scale(.6)' }, { opacity: 1, transform: 'none' }], { duration: 760, delay: (o.delay || 0) + i * st, easing: SPRING })));
  };
  R['tracking-in'] = (el, o) => an(el, [{ opacity: 0, letterSpacing: '.45em', filter: 'blur(10px)' }, { opacity: 1, letterSpacing: getComputedStyle(el).letterSpacing === 'normal' ? '0em' : getComputedStyle(el).letterSpacing, filter: 'blur(0)' }], { duration: 1200, delay: o.delay || 0 }).then(() => { el.getAnimations().forEach(a => a.cancel()); });

  // a light band runs across the glyphs once
  R.shine = (el, o) => {
    el.classList.add('tx-shine');
    return all([an(el, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: o.delay || 0 }),
      an(el, [{ backgroundPosition: '120% 0' }, { backgroundPosition: '-20% 0' }], { duration: 1600, delay: (o.delay || 0) + 350, easing: 'ease-in-out', fill: 'none' })])
      .then(() => el.classList.remove('tx-shine'));
  };
  // highlighter: *accent* words (or the whole title) get a marker stroke drawn behind them
  R.marker = (el, o) => {
    if (!el.dataset.html) el.dataset.html = el.innerHTML; el.innerHTML = el.dataset.html;
    const p = R['fade-up'](el, o); let ts = [...el.querySelectorAll('.acc')]; if (!ts.length) { el.innerHTML = '<span class="mk">' + el.innerHTML + '</span>'; ts = [el.firstChild]; }
    ts.forEach(t => t.classList.add('mk'));
    return all([p, ...ts.map((t, i) => an(t, [{ backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%' }], { duration: 800, delay: (o.delay || 0) + 550 + i * 200, easing: D.EASE_IO }))]);
  };
  // drawn as an outline first, then filled
  R['outline-fill'] = (el, o) => {
    el.classList.add('tx-outline');
    const p = R['mask-words'](el, o);
    setTimeout(() => el.classList.add('tx-fill'), D.reduced ? 0 : (o.delay || 0) + 1100);
    return p.then(() => new Promise(r => setTimeout(r, 900))).then(() => el.classList.remove('tx-outline', 'tx-fill'));
  };
  // RGB-split jitter that settles (use once, tech / security)
  R.glitch = (el, o) => {
    const k = [];
    for (let i = 0; i < 9; i++) { const dx = (Math.random() - .5) * 14, top = Math.random() * 80; k.push({ opacity: i ? 1 : 0, transform: `translateX(${dx}px)`, clipPath: `inset(${top}% 0 ${Math.max(0, 80 - top - 20)}% 0)`, textShadow: `${-dx / 2}px 0 var(--accent),${dx / 2}px 0 var(--accent2)` }); }
    k.push({ opacity: 1, transform: 'none', clipPath: 'inset(0 0 0 0)', textShadow: 'none' });
    return an(el, k, { duration: 650, delay: o.delay || 0, easing: 'steps(10,end)' });
  };
  // title fades in, then an accent line draws underneath
  R['underline-draw'] = (el, o) => {
    el.classList.add('tx-ul');
    return all([R['blur-words'](el, o), an(el, [{ backgroundSize: '0% 3px' }, { backgroundSize: '100% 3px' }], { duration: 900, delay: (o.delay || 0) + 600, easing: D.EASE_IO })]);
  };
})();
