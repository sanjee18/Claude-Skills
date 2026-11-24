/* page types: hero statement stats chart cards split timeline steps hub quote media cta html
   renderer(p) -> { el, enter?(stage), leave?(stage) }.  Text with data-tx / data-stagger is animated by boot. */
(function () {
  'use strict';
  const D = window.Deck, R = D.reg.page, h = D.h, rich = D.rich, an = D.an, $$ = D.$$;
  const NS = 'http://www.w3.org/2000/svg';
  const s = (tag, a, ...k) => { const e = document.createElementNS(NS, tag); for (const n in a || {}) e.setAttribute(n, a[n]); k.flat().forEach(c => c && e.append(c)); return e; };

  const head = (p, size) => {
    const f = document.createDocumentFragment();
    if (p.kicker) f.append(h('div', { class: 'kicker', 'data-tx': 'fade-up' }, p.kicker));
    if (p.title) f.append(h('h2', { class: 't t-' + (size || 'l'), 'data-tx': p.enter || 'mask-words', 'data-d': 60, 'data-shared': p.shared, html: rich(p.title) }));
    if (p.sub) f.append(h('p', { class: 'lead', 'data-tx': 'fade-up', 'data-d': 300 }, p.sub));
    return f;
  };
  const cta = (c, cls) => c && h('button', { class: 'btn ' + (cls || ''), 'data-d': 480, 'data-tx': 'fade-up', 'data-go': c.to || '', 'data-open': c.open || '' }, c.label, h('span', { html: D.icon('arrow', 'ico sm') }));

  /* ---------- hero / statement ---------- */
  R.hero = p => ({
    el: h('div', { class: 'p-hero ' + (p.align === 'center' ? 'center' : '') },
      p.kicker && h('div', { class: 'kicker', 'data-tx': 'fade-up' }, p.kicker),
      h('h1', { class: 't t-xl', 'data-tx': p.enter || 'mask-words', 'data-d': 80, 'data-shared': p.shared, html: rich(p.title) }),
      p.sub && h('p', { class: 'lead', 'data-tx': 'fade-up', 'data-d': 420 }, p.sub),
      cta(p.cta),
      p.meta && h('div', { class: 'hero-meta', 'data-tx': 'fade-up', 'data-d': 650 }, p.meta))
  });
  R.statement = p => ({
    el: h('div', { class: 'p-statement' }, p.kicker && h('div', { class: 'kicker', 'data-tx': 'fade-up' }, p.kicker),
      h('h2', { class: 't t-xl', 'data-tx': p.enter || 'mask-words', 'data-d': 60, 'data-shared': p.shared, html: rich(p.title) }),
      p.sub && h('p', { class: 'lead', 'data-tx': 'fade-up', 'data-d': 420 }, p.sub), cta(p.cta))
  });

  /* ---------- stats (count-up) ---------- */
  R.stats = p => {
    const el = h('div', { class: 'p-stats' }, head(p, 'm'),
      h('div', { class: 'stats', 'data-stagger': '', style: { '--n': (p.items || []).length } }, (p.items || []).map(it =>
        h('div', { class: 'stat', 'data-shared': it.shared },
          h('div', { class: 'num' }, it.prefix && h('span', { class: 'pre' }, it.prefix),
            h('b', { 'data-count': it.value, 'data-dec': it.decimals || 0 }, '0'), it.suffix && h('span', { class: 'suf' }, it.suffix)),
          h('div', { class: 'lbl' }, it.label), it.note && h('div', { class: 'note' }, it.note)))));
    return { el, enter() { $$('[data-count]', el).forEach((b, i) => D.countUp(b, +b.dataset.count, { delay: 380 + i * 140, dec: +b.dataset.dec })); } };
  };

  /* ---------- chart (bars | line | morph = bars become a line) ---------- */
  function chart(c) {
    const W = 640, H = 340, pad = { l: 44, r: 16, t: 28, b: 46 }, data = c.data || [], n = data.length || 1;
    const max = c.max || Math.max(...data.map(d => d.value), 1) * 1.15, iw = W - pad.l - pad.r, ih = H - pad.t - pad.b, bw = iw / n;
    const X = i => pad.l + bw * i + bw / 2, Y = v => pad.t + ih - (v / max) * ih, fmt = v => (c.unit === '%' || c.unit === undefined ? '' : '') + v.toLocaleString(document.documentElement.lang || undefined);
    const mode = c.mode || 'bars';
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img', 'aria-label': c.label || 'Chart' });
    for (let g = 0; g <= 3; g++) { const y = pad.t + ih * g / 3; svg.append(s('line', { x1: pad.l, x2: W - pad.r, y1: y, y2: y, class: 'grid' })); }
    const bars = data.map((d, i) => s('rect', { x: X(i) - bw * .3, width: bw * .6, y: Y(d.value), height: pad.t + ih - Y(d.value), rx: 7, class: 'bar', style: 'transform-box:fill-box;transform-origin:50% 100%;transform:scaleY(0)' }));
    const vals = data.map((d, i) => { const t = s('text', { x: X(i), y: Y(d.value) - 9, class: 'val', 'text-anchor': 'middle', style: 'opacity:0' }); t.textContent = fmt(d.value) + (c.unit && c.unit !== '%' ? ' ' + c.unit : c.unit || ''); return t; });
    const labs = data.map((d, i) => { const t = s('text', { x: X(i), y: H - 16, class: 'lab', 'text-anchor': 'middle' }); t.textContent = d.label; return t; });
    const pts = data.map((d, i) => X(i) + ' ' + Y(d.value));
    const line = s('path', { d: 'M' + pts.join('L'), class: 'ln', pathLength: 1, style: 'stroke-dasharray:1;stroke-dashoffset:1' });
    const area = s('path', { d: 'M' + pts.join('L') + `L${X(n - 1)} ${pad.t + ih}L${X(0)} ${pad.t + ih}Z`, class: 'area', style: 'opacity:0' });
    const dots = data.map((d, i) => s('circle', { cx: X(i), cy: Y(d.value), r: 5.5, class: 'dot', style: 'transform-box:fill-box;transform-origin:center;transform:scale(0)' }));
    svg.append(...(mode === 'line' ? [] : bars), area, line, ...dots, ...(mode === 'line' ? [] : vals), ...labs);
    let timers = [], asLine = mode === 'line';
    const growBars = () => bars.forEach((b, i) => an(b, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 900, delay: 300 + i * 80 }));
    const showVals = () => vals.forEach((v, i) => an(v, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 900 + i * 80 }));
    const drawLine = d0 => {
      an(line, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 1200, delay: d0, easing: D.EASE_IO });
      an(area, [{ opacity: 0 }, { opacity: .16 }], { duration: 900, delay: d0 + 500 });
      dots.forEach((d, i) => an(d, [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 500, delay: d0 + 250 + i * (900 / n) }));
    };
    function toLine() {
      asLine = true; bars.forEach(b => an(b, [{ opacity: 1 }, { opacity: 0 }], { duration: 600 })); vals.forEach(v => an(v, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 })); drawLine(250);
    }
    function toBars() {
      asLine = false; [line, area, ...dots].forEach(e => e.getAnimations().forEach(a => a.cancel()));
      bars.forEach((b, i) => { b.getAnimations().forEach(a => a.cancel()); an(b, [{ opacity: 0, transform: 'scaleY(0)' }, { opacity: 1, transform: 'scaleY(1)' }], { duration: 800, delay: i * 60 }); });
      vals.forEach((v, i) => { v.getAnimations().forEach(a => a.cancel()); an(v, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 600 + i * 60 }); });
    }
    if (mode === 'morph') svg.addEventListener('click', () => (asLine ? toBars() : toLine()));
    return {
      el: svg,
      enter() {
        timers.forEach(clearTimeout); timers = []; asLine = mode === 'line';
        if (mode === 'line') drawLine(300); else { growBars(); showVals(); }
        if (mode === 'morph') timers.push(setTimeout(toLine, D.reduced ? 0 : 3200));
      },
      leave() { timers.forEach(clearTimeout); timers = []; }
    };
  }
  R.chart = p => {
    const ch = chart(p);
    return { el: h('div', { class: 'p-chart' }, h('div', { class: 'col-text' }, head(p, 'm'), p.note && h('p', { class: 'note', 'data-tx': 'fade-up', 'data-d': 420 }, p.note),
      p.mode === 'morph' && h('p', { class: 'hint', 'data-tx': 'fade-up', 'data-d': 520 }, p.hint || 'Klick: Balken ⇄ Linie')), h('div', { class: 'col-vis card-flat' }, ch.el)), enter: ch.enter, leave: ch.leave };
  };

  /* ---------- cards (grid, spotlight hover, optional link to sub page) ---------- */
  R.cards = p => {
    const cols = p.columns || Math.min(Math.max((p.items || []).length, 2), 4);
    const grid = h('div', { class: 'cards' + (p.variant === 'numbered' ? ' numbered' : ''), 'data-stagger': '', style: { '--cols': cols } },
      (p.items || []).map((it, i) => h(it.to ? 'button' : 'div', { class: 'card', 'data-open': it.to || '' },
        p.variant === 'numbered' ? h('div', { class: 'no' }, String(i + 1).padStart(2, '0')) : (it.icon && h('div', { class: 'ico-wrap', html: D.icon(it.icon) })),
        it.tag && h('div', { class: 'tag' }, it.tag), h('h3', null, it.title), it.text && h('p', null, it.text),
        it.to && h('span', { class: 'more', html: (p.moreLabel || 'Mehr') + D.icon('arrow', 'ico sm') }))));
    grid.addEventListener('pointermove', e => { const c = e.target.closest('.card'); if (c) { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px'); } });
    return { el: h('div', { class: 'p-cards' }, head(p, 'm'), grid) };
  };

  /* ---------- split: text + visual (ring | flow | image | chart) ---------- */
  function visual(v) {
    if (!v) return { el: h('div') };
    if (v.type === 'chart') return chart(v);
    if (v.type === 'image') return { el: h('div', { class: 'vis-img' }, h('img', { src: v.src, alt: v.alt || '' })) };
    if (v.type === 'ring') {
      const C = 2 * Math.PI * 44, val = Math.max(0, Math.min(100, v.value || 0));
      const arc = s('circle', { cx: 60, cy: 60, r: 44, class: 'arc', style: `stroke-dasharray:${C};stroke-dashoffset:${C}` });
      const num = h('b', { 'data-count': val }, '0');
      const el = h('div', { class: 'vis-ring' }, s('svg', { viewBox: '0 0 120 120' }, s('circle', { cx: 60, cy: 60, r: 44, class: 'trk' }), arc),
        h('div', { class: 'mid' }, h('span', null, num, h('i', null, v.suffix || '%')), h('small', null, v.label || '')));
      return { el, enter() { an(arc, [{ strokeDashoffset: C }, { strokeDashoffset: C * (1 - val / 100) }], { duration: 1500, delay: 350, easing: D.EASE_IO }); D.countUp(num, val, { delay: 350, dur: 1500 }); } };
    }
    if (v.type === 'flow') {
      const el = h('div', { class: 'vis-flow' }, (v.nodes || []).flatMap((n, i, a) => [h('div', { class: 'fnode' }, n), i < a.length - 1 && h('div', { class: 'fline' }, h('i'))]));
      return { el, enter() { [...el.children].forEach((c, i) => an(c, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 300 + i * 160 })); } };
    }

    if (v.type === 'device') {
      const phone = v.frame === 'phone', screen = h('div', { class: 'dscreen' });
      let im = null, sk = null;
      if (v.src) { im = h('img', { src: v.src, alt: v.alt || '' }); screen.append(im); }
      else {
        sk = h('div', { class: 'skel' }, h('i', { class: 'sh' }), h('div', { class: 'sg' }, h('i'), h('i'), h('i')), h('i', { class: 'sl' }), h('i', { class: 'sl s2' }), h('div', { class: 'sg g2' }, h('i'), h('i')));
        screen.append(sk);
      }
      const el = h('div', { class: 'device ' + (phone ? 'phone' : 'browser') }, phone ? h('span', { class: 'notch' }) : h('div', { class: 'dbar' }, h('i'), h('i'), h('i'), h('span', null, v.url || '')), screen);
      return {
        el, enter() {
          an(el, [{ opacity: 0, transform: 'translateY(30px) rotateX(8deg) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 1000, delay: 250 });
          if (sk) [...sk.querySelectorAll('i')].forEach((b, i) => an(b, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 700 + i * 90 }));
          if (im && !D.reduced) setTimeout(() => { const dy = im.clientHeight - screen.clientHeight; if (dy > 8) im.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-dy}px)` }], { duration: 9000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }); }, 1200);
        }
      };
    }
    if (v.type === 'compare') {
      const lay = (x, cls) => h('div', { class: 'cmp-l ' + cls }, x.src ? h('img', { src: x.src, alt: x.alt || '' }) : h('div', { class: 'cmp-ph' }, x.label || ''), x.src && x.label ? h('span', { class: 'cmp-tag' }, x.label) : null);
      const rng = h('input', { type: 'range', min: 0, max: 100, value: 50, class: 'cmp-r', 'aria-label': v.aria || 'Vorher / Nachher' });
      const el = h('div', { class: 'cmp', style: { '--p': '50%' } }, lay(v.a || { label: 'Vorher' }, 'a'), lay(v.b || { label: 'Nachher' }, 'b'), h('i', { class: 'cmp-h' }), rng);
      const set = x => el.style.setProperty('--p', x + '%');
      rng.addEventListener('input', () => set(rng.value));
      return {
        el, enter() {
          const t0 = performance.now() + 600, dur = D.reduced ? 1 : 1900;
          (function tick(now) { const t = Math.max(0, Math.min(1, (now - t0) / dur)), k = t < .5 ? 100 - 85 * (t / .5) : 15 + 35 * ((t - .5) / .5), e = t === 1 ? 50 : k; set(e); rng.value = e; if (t < 1) requestAnimationFrame(tick); })(performance.now());
        }
      };
    }
    return { el: h('div') };
  }
  R.split = p => {
    const v = visual(p.visual);
    const el = h('div', { class: 'p-split' + (p.flip ? ' flip' : '') },
      h('div', { class: 'col-text' }, head(p, 'm'), p.bullets && h('ul', { class: 'bul', 'data-stagger': '' }, p.bullets.map(b => h('li', null, b))), cta(p.cta, 'ghost')),
      h('div', { class: 'col-vis' }, v.el));
    return { el, enter: v.enter, leave: v.leave };
  };

  /* ---------- timeline (line draws, nodes pop) ---------- */
  R.timeline = p => {
    const items = p.items || [], line = h('i', { class: 'tl-line' });
    const el = h('div', { class: 'p-timeline' }, head(p, 'm'),
      h('div', { class: 'tl', style: { '--n': items.length } }, line, items.map(it => h('div', { class: 'tl-item' }, h('span', { class: 'dot' }), h('div', { class: 'when' }, it.label), h('h3', null, it.title), it.text && h('p', null, it.text)))));
    return {
      el, enter() {
        an(line, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 1400, delay: 300, easing: D.EASE_IO });
        $$('.tl-item', el).forEach((t, i) => an(t, [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 650, delay: 380 + (items.length > 1 ? i / (items.length - 1) : 0) * 1000 }));
      }
    };
  };

  /* ---------- steps (tabs: Problem / Lösung / Mehrwert …) ---------- */
  R.steps = p => {
    const items = p.items || [], list = h('div', { class: 'st-list', role: 'tablist', 'data-stagger': '' }), panel = h('div', { class: 'st-panel', role: 'tabpanel' });
    function show(i, animate) {
      [...list.children].forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', k === i); });
      const it = items[i]; panel.innerHTML = '';
      panel.append(h('div', { class: 'st-no' }, String(i + 1).padStart(2, '0')), h('h3', null, it.title), it.text && h('p', null, it.text), it.bullets && h('ul', { class: 'bul' }, it.bullets.map(b => h('li', null, b))));
      if (animate) an(panel, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 380 });
    }
    items.forEach((it, i) => list.append(h('button', { class: 'st-tab', role: 'tab', onclick: () => show(i, true) }, h('span', null, String(i + 1).padStart(2, '0')), it.label || it.title)));
    show(0, false);
    return { el: h('div', { class: 'p-steps' }, head(p, 'm'), h('div', { class: 'st' }, list, panel)), leave() { show(0, false); } };
  };

  /* ---------- hub: gear/radial portfolio, nodes open sub pages ---------- */
  function gearPath(teeth, rIn, rOut) {
    const st = 2 * Math.PI / teeth; let d = '';
    for (let t = 0; t < teeth; t++) {
      const a = t * st, P = [[rIn, a], [rOut, a + .12 * st], [rOut, a + .38 * st], [rIn, a + .5 * st]];
      P.forEach(([r, an_], k) => { d += (t === 0 && k === 0 ? 'M' : 'L') + (r * Math.cos(an_)).toFixed(2) + ' ' + (r * Math.sin(an_)).toFixed(2); });
    }
    return d + 'Z';
  }
  R.hub = p => {
    const items = p.items || [], n = items.length || 1, RR = 41;
    const pos = i => { const a = -Math.PI / 2 + 2 * Math.PI * i / n; return [Math.cos(a), Math.sin(a)]; };
    // style: orbit (default, neutral rings) · gear (cog, engineering/automotive) · radial (spokes only) · constellation (nodes linked as a ring)
    const sty = p.style || 'orbit';
    const core = sty === 'gear' ? s('g', { class: 'spin' }, s('path', { d: gearPath(28, 24, 27.5), class: 'teeth' }), s('circle', { r: 20, class: 'hole' }))
      : sty === 'orbit' ? s('g', null, s('g', { class: 'spin' }, s('circle', { r: 27, class: 'ring2' }), s('circle', { r: 1.4, cx: 27, cy: 0, class: 'sat' })), s('g', { class: 'spin rev' }, s('circle', { r: 33.5, class: 'ring3' }), s('circle', { r: 1, cx: 0, cy: 33.5, class: 'sat' })), s('circle', { r: 20, class: 'hole' }))
      : sty === 'constellation' ? s('g', null, items.map((it, i) => { const [a, b] = pos(i), [c2, d2] = pos((i + 1) % n); return s('line', { x1: a * RR, y1: b * RR, x2: c2 * RR, y2: d2 * RR, class: 'link' }); }), s('circle', { r: 20, class: 'hole soft' }))
      : s('circle', { r: 20, class: 'hole' });
    const svg = s('svg', { viewBox: '-50 -50 100 100', class: 'gear hub-' + sty },
      sty !== 'radial' && sty !== 'constellation' && s('circle', { r: RR, class: 'orbit' }),
      sty !== 'constellation' && items.map((it, i) => { const [cx, cy] = pos(i); return s('line', { x1: 0, y1: 0, x2: cx * RR, y2: cy * RR, class: 'spoke', 'data-i': i }); }),
      core);
    const mid = h('div', { class: 'hub-mid' }, h('b', null, p.core || ''), h('small', null, p.coreHint || ''));
    const nodes = items.map((it, i) => {
      const [cx, cy] = pos(i);
      return h('button', { class: 'node', 'data-open': it.to || '', 'data-i': i, style: { left: 50 + cx * RR + '%', top: 50 + cy * RR + '%', '--c': it.color || 'var(--accent)' } },
        h('span', { class: 'nd' }), h('span', { class: 'nl' }, it.title));
    });
    const box = h('div', { class: 'hub-box' }, svg, mid, nodes);
    const base = { b: p.core || '', s: p.coreHint || '' };
    box.addEventListener('pointerover', e => { const nd = e.target.closest('.node'); if (!nd) return; const it = items[+nd.dataset.i]; mid.innerHTML = `<b>${D.esc(it.title)}</b><small>${D.esc(it.text || '')}</small>`; box.querySelectorAll('.spoke').forEach(l => l.classList.toggle('on', l.dataset.i === nd.dataset.i)); });
    box.addEventListener('pointerout', e => { if (e.target.closest('.node') && !e.relatedTarget?.closest('.node')) { mid.innerHTML = `<b>${D.esc(base.b)}</b><small>${D.esc(base.s)}</small>`; box.querySelectorAll('.spoke').forEach(l => l.classList.remove('on')); } });
    return {
      el: h('div', { class: 'p-hub' }, h('div', { class: 'col-text' }, head(p, 'm'), p.hint !== false && h('p', { class: 'hint', 'data-tx': 'fade-up', 'data-d': 520 }, p.hint || 'Klicke auf einen Bereich')), box),
      enter() { an(svg, [{ opacity: 0, transform: 'scale(.82) rotate(-25deg)' }, { opacity: 1, transform: 'none' }], { duration: 1200, delay: 150 }); nodes.forEach((nd, i) => an(nd, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.6)' }, { opacity: 1, transform: 'translate(-50%,-50%)' }], { duration: 600, delay: 550 + i * 110 })); }
    };
  };


  /* ---------- bento: asymmetric tile grid that assembles ---------- */
  R.bento = p => {
    const extras = [];
    const tiles = (p.items || []).map(it => {
      const k = it.kind || 'text';
      let inner;
      if (k === 'stat') inner = [h('div', { class: 'num' }, it.prefix && h('span', { class: 'pre' }, it.prefix), h('b', { 'data-count': it.value, 'data-dec': it.decimals || 0 }, '0'), it.suffix && h('span', { class: 'suf' }, it.suffix)), h('p', null, it.label)];
      else if (k === 'image') inner = [h('img', { src: it.src, alt: it.alt || '' }), it.title && h('div', { class: 'cap' }, it.title)];
      else if (k === 'chart') { const ch = chart(Object.assign({ mode: 'line' }, it)); extras.push(ch); inner = [h('h3', null, it.title || ''), ch.el]; }
      else if (k === 'quote') inner = [h('blockquote', null, it.text || it.title), it.author && h('small', null, it.author)];
      else inner = [it.icon && h('div', { class: 'ico-wrap', html: D.icon(it.icon) }), it.tag && h('div', { class: 'tag' }, it.tag), h('h3', null, it.title), it.text && h('p', null, it.text)];
      return h('div', { class: 'tile k-' + k + ' s-' + (it.size || 'm') }, inner);
    });
    const grid = h('div', { class: 'bento' }, tiles);
    grid.addEventListener('pointermove', e => { const c = e.target.closest('.tile'); if (c) { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px'); } });
    return {
      el: h('div', { class: 'p-bento' }, head(p, 'm'), grid),
      enter(st) {
        const cx = innerWidth / 2, cy = innerHeight / 2;
        $$('.tile', grid).forEach(t => {
          const r = t.getBoundingClientRect(), dx = r.left + r.width / 2 - cx, dy = r.top + r.height / 2 - cy, d = Math.hypot(dx, dy) || 1;
          an(t, [{ opacity: 0, transform: `translate(${dx / d * 46}px,${dy / d * 46}px) scale(.93)`, filter: 'blur(8px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 900, delay: 280 + (d / Math.hypot(cx, cy)) * 520 });
        });
        $$('[data-count]', grid).forEach((b, i) => D.countUp(b, +b.dataset.count, { delay: 700 + i * 140, dec: +b.dataset.dec }));
        extras.forEach(x => x.enter && x.enter(st));
      },
      leave() { extras.forEach(x => x.leave && x.leave()); }
    };
  };

  /* ---------- marquee: two counter-running rows of keywords/names ---------- */
  R.marquee = p => {
    const rows = p.rows || [p.items || []];
    return {
      el: h('div', { class: 'p-marquee' }, head(p, 'm'), h('div', { class: 'mq', 'data-tx': 'fade-up', 'data-d': 350 }, rows.map((r, i) =>
        h('div', { class: 'mq-row' }, h('div', { class: 'mq-track', style: { '--d': (46 + i * 9) + 's', animationDirection: i % 2 ? 'reverse' : 'normal' } },
          [...r, ...r].map(t => h('span', { class: 'chip' }, typeof t === 'string' ? t : t.label)))))))
    };
  };

  /* ---------- quote / media / cta / html ---------- */
  R.quote = p => ({ el: h('div', { class: 'p-quote' }, h('blockquote', { class: 't t-l', 'data-tx': p.enter || 'blur-words', html: rich(p.title || p.text) }), p.author && h('div', { class: 'by', 'data-tx': 'fade-up', 'data-d': 600 }, h('b', null, p.author), p.role && h('span', null, p.role))) });
  R.media = p => ({
    el: h('div', { class: 'p-media' }, h('div', { class: 'media-bg' }, p.video ? h('video', { src: p.video, autoplay: '', muted: '', loop: '', playsinline: '' }) : h('img', { src: p.src, alt: p.alt || '' })),
      h('div', { class: 'media-copy' }, head(p, 'l')))
  });
  R.cta = p => ({
    el: h('div', { class: 'p-cta' }, head(p, 'xl'), cta(p.cta), p.contacts && h('div', { class: 'contacts', 'data-stagger': '' }, p.contacts.map(c => h('div', null, h('small', null, c.label), h('b', null, c.value)))))
  });
  R.html = p => ({ el: h('div', { class: 'p-html', html: p.html || '' }) });
})();
