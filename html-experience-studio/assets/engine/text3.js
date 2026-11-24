/* text animations (studio): rise · word-rise · line-rise
   rise      – the whole block fades up 18px over 1.1s (the calm default of the reference deck)
   word-rise – each word rises 16px out of a 12px blur in .34s, one word every 60ms (end-card titles)
   line-rise – lines rise out of blur one after another (multi-line statements) */
(function () {
  'use strict';
  const D = window.Deck, R = D.reg.tx;
  const EASE = 'cubic-bezier(.22,1,.36,1)';
  R.rise = (el, o) => D.an(el, [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 1100, delay: o.delay || 0, easing: EASE });
  R['word-rise'] = (el, o) => {
    const ws = D.split(el, 'words');
    ws.forEach(w => { w.parentElement.style.overflow = 'visible'; });
    return Promise.all(ws.map((w, i) => D.an(w, [{ opacity: 0, transform: 'translateY(16px)', filter: 'blur(12px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 340 * 1.6, delay: (o.delay || 0) + i * 60, easing: EASE })));
  };
  R['line-rise'] = (el, o) => {
    if (!el.dataset.html) el.dataset.html = el.innerHTML;
    const parts = el.dataset.html.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map(p => '<span class="lr" style="display:block">' + p + '</span>').join('');
    return Promise.all([...el.querySelectorAll('.lr')].map((l, i) => D.an(l, [{ opacity: 0, transform: 'translateY(22px)', filter: 'blur(10px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 1000, delay: (o.delay || 0) + i * 140, easing: EASE })));
  };
})();
