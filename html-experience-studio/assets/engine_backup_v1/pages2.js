/* page types, extended library: kinetic · big-list · number · team · gallery */
(function () {
  'use strict';
  const D = window.Deck, R = D.reg.page, h = D.h, rich = D.rich, an = D.an, $$ = D.$$;
  const kick = p => p.kicker && h('div', { class: 'kicker', 'data-tx': 'fade-up' }, p.kicker);

  // kinetic typography: huge words run across the screen in opposite directions, one line stays still
  R.kinetic = p => {
    const rows = p.rows || [[p.title || '']];
    return {
      el: h('div', { class: 'p-kinetic' }, rows.map((r, i) => h('div', { class: 'kn-row' + (i % 2 ? ' alt' : '') }, h('div', { class: 'kn-track', style: { '--d': (p.speed || 28) + i * 6 + 's', animationDirection: i % 2 ? 'reverse' : 'normal' } },
        [...r, ...r, ...r].map((t, k) => h('span', { class: k % 2 ? 'o' : '' }, t))))),
        p.sub && h('p', { class: 'lead kn-sub', 'data-tx': 'fade-up', 'data-d': 500 }, p.sub)),
      enter(st) { $$('.kn-row', st).forEach((r, i) => an(r, [{ opacity: 0, transform: `translateX(${i % 2 ? -8 : 8}%)` }, { opacity: 1, transform: 'none' }], { duration: 1200, delay: 120 + i * 140 })); }
    };
  };

  // big list: large lines, the active one lights up in sequence (Apple-style emphasis)
  R['big-list'] = p => {
    const items = p.items || [], list = h('ol', { class: 'bl' }, items.map(t => h('li', { html: rich(typeof t === 'string' ? t : t.title) })));
    let tm = 0;
    return {
      el: h('div', { class: 'p-biglist' }, kick(p), p.title && h('h2', { class: 't t-s', 'data-tx': p.enter || 'fade-up', html: rich(p.title) }), list),
      enter() {
        const lis = [...list.children]; lis.forEach((li, i) => an(li, [{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: 250 + i * 120 }));
        let k = 0; const step = () => { lis.forEach((li, i) => li.classList.toggle('on', i === k)); k = (k + 1) % lis.length; tm = setTimeout(step, D.reduced ? 99999 : 1900); };
        tm = setTimeout(step, 900);
      },
      leave() { clearTimeout(tm); }
    };
  };

  // one giant number that counts up, with a caption (a single proof point)
  R.number = p => {
    const b = h('b', { 'data-count': p.value, 'data-dec': p.decimals || 0 }, '0');
    return {
      el: h('div', { class: 'p-number' }, kick(p), h('div', { class: 'big-num' }, p.prefix && h('span', { class: 'pre' }, p.prefix), b, p.suffix && h('span', { class: 'suf' }, p.suffix)),
        p.title && h('h2', { class: 't t-m', 'data-tx': p.enter || 'blur-words', 'data-d': 500, html: rich(p.title) }), p.sub && h('p', { class: 'lead', 'data-tx': 'fade-up', 'data-d': 800 }, p.sub)),
      enter(st) { an(st.querySelector('.big-num'), [{ opacity: 0, transform: 'scale(.86)', filter: 'blur(14px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 1100, delay: 100 }); D.countUp(b, +p.value || 0, { delay: 200, dur: 2000, dec: p.decimals || 0 }); }
    };
  };

  // team / experts: photo or initials, name, role, optional contact
  R.team = p => {
    const ini = n => String(n || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return {
      el: h('div', { class: 'p-team' }, kick(p), p.title && h('h2', { class: 't t-m', 'data-tx': p.enter || 'mask-words', html: rich(p.title) }), p.sub && h('p', { class: 'lead', 'data-tx': 'fade-up', 'data-d': 300 }, p.sub),
        h('div', { class: 'team', 'data-stagger': '' }, (p.items || []).map(m => h('div', { class: 'member card' }, m.src ? h('img', { src: m.src, alt: m.name || '' }) : h('div', { class: 'avatar' }, ini(m.name)), h('b', null, m.name || '[TBD]'), m.role && h('small', null, m.role), m.contact && h('span', { class: 'mc' }, m.contact)))))
    };
  };

  // image gallery: masonry-ish grid, images reveal with a clip wipe
  R.gallery = p => ({
    el: h('div', { class: 'p-gallery' }, kick(p), p.title && h('h2', { class: 't t-m', 'data-tx': p.enter || 'mask-words', html: rich(p.title) }),
      h('div', { class: 'gal' }, (p.items || []).map((it, i) => h('figure', { class: 'gi' + (i % 3 === 0 ? ' tall' : '') }, it.src ? h('img', { src: it.src, alt: it.alt || '' }) : h('div', { class: 'ph' }, it.label || 'Bild ' + (i + 1)), it.caption && h('figcaption', null, it.caption))))),
    enter(st) { $$('.gi', st).forEach((g, i) => an(g, [{ clipPath: 'inset(100% 0 0 0)', transform: 'translateY(24px)' }, { clipPath: 'inset(0 0 0 0)', transform: 'none' }], { duration: 1000, delay: 250 + i * 110, easing: D.EASE_IO })); }
  });
})();
