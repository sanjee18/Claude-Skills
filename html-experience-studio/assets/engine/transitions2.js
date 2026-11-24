/* page transitions, extended library:
   cube · flip · tiles · color-sweep · shutter · radial-wipe · card-stack · glitch-cut · band-reveal · push-up
   Same contract as transitions.js: tr[id]({from,to,dir}) -> Promise, `.at` = ms until the text entrance starts. */
(function () {
  'use strict';
  const D = window.Deck, R = D.reg.tr, an = D.an, E = D.EASE, IO = D.EASE_IO, DR = D.EASE_DR, h = D.h;
  const layer = id => { let w = document.getElementById(id); if (!w) { w = h('div', { id, class: 'trx' }); document.body.append(w); } w.innerHTML = ''; w.style.display = ''; return w; };
  const hideFrom = c => { if (c.from) c.from.style.visibility = 'hidden'; };

  // 3D cube: both faces turn around the cube centre
  R.cube = c => {
    const z = 'translateZ(-50vw)', P = 'perspective(2200px) ';
    return Promise.all([
      c.from && an(c.from, [{ transform: P + z + ' rotateY(0deg) translateZ(50vw)', filter: 'brightness(1)' }, { transform: P + z + ` rotateY(${-90 * c.dir}deg) translateZ(50vw)`, filter: 'brightness(.4)' }], { duration: 1000, easing: IO }),
      an(c.to, [{ transform: P + z + ` rotateY(${90 * c.dir}deg) translateZ(50vw)`, filter: 'brightness(.4)' }, { transform: P + z + ' rotateY(0deg) translateZ(50vw)', filter: 'brightness(1)' }], { duration: 1000, easing: IO })
    ]);
  };
  // card flip: page turns over like a card, the new page is the back side
  R.flip = async c => {
    an(c.to, [{ opacity: 0 }, { opacity: 0 }], { duration: 460 });
    if (c.from) await an(c.from, [{ transform: 'perspective(1800px) rotateY(0deg) scale(1)' }, { transform: `perspective(1800px) rotateY(${-90 * c.dir}deg) scale(.86)` }], { duration: 460, easing: 'cubic-bezier(.55,0,1,.45)' });
    hideFrom(c);
    await an(c.to, [{ opacity: 1, transform: `perspective(1800px) rotateY(${90 * c.dir}deg) scale(.86)` }, { opacity: 1, transform: 'perspective(1800px) rotateY(0deg) scale(1)' }], { duration: 560, easing: 'cubic-bezier(0,.55,.45,1)' });
  };
  // mosaic tiles cover the screen diagonally, swap, uncover
  R.tiles = async c => {
    const cols = innerWidth < 700 ? 5 : 10, rows = Math.max(3, Math.round(cols * innerHeight / innerWidth)), w = layer('tiles');
    w.style.gridTemplateColumns = `repeat(${cols},1fr)`; w.style.gridTemplateRows = `repeat(${rows},1fr)`;
    const ts = []; for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) { const t = h('i'); w.append(t); ts.push([t, (c.dir > 0 ? k : cols - k) + r]); }
    an(c.to, [{ opacity: 0 }, { opacity: 0 }], { duration: 700 });
    await Promise.all(ts.map(([t, d]) => an(t, [{ transform: 'scale(0)', borderRadius: '40%' }, { transform: 'scale(1.02)', borderRadius: '0%' }], { duration: 420, delay: d * 26, easing: E })));
    hideFrom(c); c.to.getAnimations().forEach(a => a.cancel());
    await Promise.all(ts.map(([t, d]) => an(t, [{ transform: 'scale(1.02)', borderRadius: '0%' }, { transform: 'scale(0)', borderRadius: '40%' }], { duration: 420, delay: d * 26, easing: E })));
    w.style.display = 'none';
  };
  // two accent panels sweep across, the page swaps underneath
  R['color-sweep'] = async c => {
    const w = layer('sweep'), a = h('i', { class: 's2' }), b = h('i'); w.append(a, b);
    const X = v => `translateX(${v * c.dir}%)`;
    an(c.to, [{ opacity: 0 }, { opacity: 0 }], { duration: 640 });
    await Promise.all([an(a, [{ transform: X(-100) }, { transform: X(0) }], { duration: 560, easing: IO }), an(b, [{ transform: X(-100) }, { transform: X(0) }], { duration: 560, delay: 90, easing: IO })]);
    hideFrom(c); c.to.getAnimations().forEach(x => x.cancel());
    await Promise.all([an(b, [{ transform: X(0) }, { transform: X(100) }], { duration: 600, easing: IO }), an(a, [{ transform: X(0) }, { transform: X(100) }], { duration: 600, delay: 90, easing: IO })]);
    w.style.display = 'none';
  };
  // horizontal stripes close like a camera shutter from alternating sides
  R.shutter = async c => {
    const n = 7, w = layer('shutter'), ps = Array.from({ length: n }, () => h('i')); ps.forEach(p => w.append(p));
    const o = i => (i % 2 ? '100% 50%' : '0% 50%');
    an(c.to, [{ opacity: 0 }, { opacity: 0 }], { duration: 620 });
    await Promise.all(ps.map((p, i) => an(p, [{ transform: 'scaleX(0)', transformOrigin: o(i) }, { transform: 'scaleX(1)', transformOrigin: o(i) }], { duration: 480, delay: i * 30, easing: IO })));
    hideFrom(c); c.to.getAnimations().forEach(x => x.cancel());
    await Promise.all(ps.map((p, i) => an(p, [{ transform: 'scaleX(1)', transformOrigin: o(i + 1) }, { transform: 'scaleX(0)', transformOrigin: o(i + 1) }], { duration: 480, delay: i * 30, easing: IO })));
    w.style.display = 'none';
  };
  // clock wipe around the centre
  R['radial-wipe'] = c => {
    const t0 = performance.now(), T = D.reduced ? 1 : 1000, el = c.to, W = innerWidth, H = innerHeight, cx = W / 2, cy = H / 2, r = Math.hypot(W, H);
    const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    if (c.from) an(c.from, [{ filter: 'brightness(1)' }, { filter: 'brightness(.5)' }], { duration: 1000 });
    return new Promise(res => (function tick(now) {
      const t = ease(Math.min(1, (now - t0) / T)), a = t * 6.2832, pts = [`${cx}px ${cy}px`, `${cx}px ${cy - r}px`];
      for (let s = 1; s <= 24; s++) { const ang = -Math.PI / 2 + a * s / 24 * c.dir; pts.push(`${cx + Math.cos(ang) * r}px ${cy + Math.sin(ang) * r}px`); }
      el.style.clipPath = t >= 1 ? '' : `polygon(${pts.join(',')})`;
      if (t < 1) requestAnimationFrame(tick); else res();
    })(performance.now()));
  };
  // iOS-sheet feel: old page shrinks back into a card, the new one slides up over it
  R['card-stack'] = c => Promise.all([
    c.from && an(c.from, [{ transform: 'none', borderRadius: '0px', filter: 'brightness(1)' }, { transform: 'translateY(-2%) scale(.9)', borderRadius: '28px', filter: 'brightness(.45)' }], { duration: 900, easing: DR }),
    an(c.to, [{ transform: 'translateY(102%)', borderRadius: '28px', boxShadow: '0 -30px 80px -20px #000' }, { transform: 'none', borderRadius: '0px', boxShadow: '0 0 0 0 #000' }], { duration: 900, easing: DR })
  ]);
  // short digital glitch, then a hard cut
  R['glitch-cut'] = async c => {
    const k = n => Array.from({ length: n }, (_, i) => { const t = Math.random() * 90; return { transform: `translateX(${(Math.random() - .5) * 40}px)`, clipPath: `inset(${t}% 0 ${Math.max(0, 90 - t - 12)}% 0)`, filter: `hue-rotate(${(Math.random() * 90) | 0}deg)`, offset: i / n }; });
    if (c.from) await an(c.from, [...k(6), { transform: 'none', clipPath: 'inset(0 0 0 0)', filter: 'none', offset: 1 }], { duration: 320, easing: 'steps(6,end)' });
    hideFrom(c);
    await an(c.to, [{ opacity: 0 }, ...k(4).map(f => Object.assign(f, { opacity: 1 })), { opacity: 1, transform: 'none', clipPath: 'inset(0 0 0 0)', filter: 'none', offset: 1 }], { duration: 300, easing: 'steps(4,end)' });
  };
  // a horizontal band opens from the centre line
  R['band-reveal'] = c => Promise.all([
    c.from && an(c.from, [{ transform: 'none', filter: 'brightness(1)' }, { transform: 'scale(.94)', filter: 'brightness(.4)' }], { duration: 900, easing: IO }),
    an(c.to, [{ clipPath: 'inset(50% 0 50% 0)' }, { clipPath: 'inset(42% 0 42% 0)', offset: .35 }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1000, easing: IO })
  ]);
  // vertical push (scroll-like) for decks that should feel like a scroll story
  R['push-up'] = c => Promise.all([
    c.from && an(c.from, [{ transform: 'none', opacity: 1 }, { transform: `translateY(${-30 * c.dir}%)`, opacity: .2 }], { duration: 850, easing: DR }),
    an(c.to, [{ transform: `translateY(${100 * c.dir}%)` }, { transform: 'none' }], { duration: 850, easing: DR })
  ]);

  Object.entries({ cube: 520, flip: 620, tiles: 900, 'color-sweep': 820, shutter: 820, 'radial-wipe': 450, 'card-stack': 420, 'glitch-cut': 360, 'band-reveal': 420, 'push-up': 380 }).forEach(([k, v]) => { R[k].at = v; });
})();
