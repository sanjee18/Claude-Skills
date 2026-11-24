/* text animations: mask-words · blur-words · chars · fade-up · scramble · typewriter · none
   tx[id](el,{delay}) – el is hidden by CSS until its stage is "entered" */
(function () {
  'use strict';
  const D = window.Deck, R = D.reg.tx, h = D.h;

  function split(el, mode) {
    if (!el.dataset.html) el.dataset.html = el.innerHTML;
    el.innerHTML = el.dataset.html;
    const out = [];
    (function walk(n) {
      [...n.childNodes].forEach(c => {
        if (c.nodeType === 3) {
          const f = document.createDocumentFragment();
          c.textContent.split(mode === 'chars' ? /(\s+)/ : /(\s+)/).forEach(t => {
            if (!t) return;
            if (/^\s+$/.test(t)) { f.append(' '); return; }
            if (mode === 'chars') {
              const word = h('span', { class: 'cw' });
              [...t].forEach(ch => { const i = h('span', { class: 'ci' }, ch); word.append(i); out.push(i); });
              f.append(word);
            } else {
              const w = h('span', { class: 'w' }, h('span', { class: 'wi' }, t)); f.append(w); out.push(w.firstChild);
            }
          });
          c.replaceWith(f);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(el);
    return out;
  }
  D.split = split;
  const all = ps => Promise.all(ps);

  R['mask-words'] = (el, o) => {
    const ws = split(el, 'words');
    return all(ws.map((w, i) => D.an(w, [{ transform: 'translateY(112%)' }, { transform: 'none' }], { duration: 900, delay: (o.delay || 0) + i * 55 })));
  };
  R['blur-words'] = (el, o) => {
    const ws = split(el, 'words');
    return all(ws.map((w, i) => D.an(w, [{ opacity: 0, filter: 'blur(10px)', transform: 'translateY(14px)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }], { duration: 800, delay: (o.delay || 0) + i * 45 })));
  };
  R.chars = (el, o) => {
    const cs = split(el, 'chars'), step = Math.min(34, 900 / Math.max(cs.length, 1));
    return all(cs.map((c, i) => D.an(c, [{ opacity: 0, transform: 'translateY(40%)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: (o.delay || 0) + i * step })));
  };
  R['fade-up'] = (el, o) => D.an(el, [{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: o.delay || 0 });
  R.none = () => Promise.resolve();

  R.scramble = (el, o) => {
    if (!el.dataset.html) el.dataset.html = el.innerHTML;
    const target = el.textContent, glyphs = '█▓▒░<>/\\[]{}—=+*^?#', t0 = performance.now() + (o.delay || 0), dur = D.reduced ? 1 : 1100;
    return new Promise(res => (function tick(now) {
      const p = Math.max(0, Math.min(1, (now - t0) / dur));
      el.textContent = [...target].map((ch, i) => ch === ' ' || i < p * target.length ? ch : glyphs[(Math.random() * glyphs.length) | 0]).join('');
      if (p < 1) requestAnimationFrame(tick); else { el.innerHTML = el.dataset.html; res(); }
    })(performance.now()));
  };
  R.typewriter = (el, o) => {
    if (!el.dataset.html) el.dataset.html = el.innerHTML;
    const target = el.textContent, t0 = performance.now() + (o.delay || 0), dur = D.reduced ? 1 : Math.min(2200, target.length * 38);
    return new Promise(res => (function tick(now) {
      const p = Math.max(0, Math.min(1, (now - t0) / dur));
      el.textContent = target.slice(0, Math.ceil(p * target.length)) + (p < 1 ? '▍' : '');
      if (p < 1) requestAnimationFrame(tick); else { el.innerHTML = el.dataset.html; res(); }
    })(performance.now()));
  };
})();
