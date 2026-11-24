/* page transitions. tr[id]({from,to,dir,rect,origin,mode}) -> Promise.  `at` = ms until the new page's text entrance starts.
   from/to may be null (scroll mode). Never animate the .inner of `to` (the text entrance owns it). */
(function () {
  'use strict';
  const D = window.Deck, R = D.reg.tr, an = D.an, E = D.EASE, IO = D.EASE_IO, DR = D.EASE_DR;
  const inner = s => s && s.firstElementChild;
  const vw = () => innerWidth, vh = () => innerHeight;
  const inset = (r, rad) => `inset(${r.top}px ${vw() - r.right}px ${vh() - r.bottom}px ${r.left}px round ${rad}px)`;
  const org = c => (c.origin || { x: vw() / 2, y: vh() / 2 });

  function fxCanvas() {
    let c = document.getElementById('fx');
    if (!c) { c = D.h('canvas', { id: 'fx' }); document.body.append(c); }
    c.width = vw(); c.height = vh(); c.style.display = 'block';
    return c;
  }

  R['fade-blur'] = c => (R['fade-blur'].at = 250, Promise.all([
    an(inner(c.from), [{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(12px)' }], { duration: 480, easing: 'ease' }),
    an(c.to, [{ opacity: 0, filter: 'blur(14px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 700, delay: 160, easing: 'ease' })
  ]));

  R.slide = c => (R.slide.at = 260, Promise.all([
    an(inner(c.from), [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-9 * c.dir}%)` }], { duration: 560, easing: DR }),
    an(c.to, [{ opacity: 0, transform: `translateX(${9 * c.dir}%)` }, { opacity: 1, transform: 'none' }], { duration: 760, easing: DR })
  ]));

  R['push-parallax'] = c => (R['push-parallax'].at = 380, Promise.all([
    an(c.from, [{ transform: 'none', filter: 'brightness(1)' }, { transform: `translateX(${-24 * c.dir}%)`, filter: 'brightness(.5)' }], { duration: 900, easing: DR }),
    an(c.to, [{ transform: `translateX(${100 * c.dir}%)` }, { transform: 'none' }], { duration: 900, easing: DR })
  ]));

  R['zoom-through'] = c => (R['zoom-through'].at = 380, Promise.all([
    an(c.from, [{ opacity: 1, transform: 'scale(1)', filter: 'blur(0)' }, { opacity: 0, transform: 'scale(1.45)', filter: 'blur(14px)' }], { duration: 760, easing: IO }),
    an(c.to, [{ opacity: 0, transform: 'scale(.8)', filter: 'blur(10px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 900, delay: 200, easing: E })
  ]));

  R['clip-circle'] = c => {
    R['clip-circle'].at = 420; const o = org(c), far = Math.hypot(Math.max(o.x, vw() - o.x), Math.max(o.y, vh() - o.y));
    return Promise.all([
      an(inner(c.from), [{ opacity: 1 }, { opacity: 0 }], { duration: 480, delay: 120, easing: 'ease' }),
      an(c.to, [{ clipPath: `circle(0px at ${o.x}px ${o.y}px)` }, { clipPath: `circle(${far + 40}px at ${o.x}px ${o.y}px)` }], { duration: 950, easing: IO })
    ]);
  };

  R['wipe-diagonal'] = c => (R['wipe-diagonal'].at = 420, Promise.all([
    an(inner(c.from), [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-4 * c.dir}%)` }], { duration: 560, easing: 'ease' }),
    an(c.to, [{ clipPath: 'polygon(0 0,0 0,-30% 100%,-30% 100%)' }, { clipPath: 'polygon(0 0,130% 0,100% 100%,-30% 100%)' }], { duration: 900, easing: IO })
  ]));

  // hyperspace: streaks from the centre while the old page flies past the camera
  R.warp = c => {
    R.warp.at = 520;
    const cv = fxCanvas(), x = cv.getContext('2d'), col = D.rgb('--accent'), W = cv.width, H = cv.height, cx = W / 2, cy = H / 2;
    const lines = Array.from({ length: 160 }, () => ({ a: Math.random() * 6.283, s: .4 + Math.random() * .9, d: Math.random() * .3 }));
    const t0 = performance.now(), T = D.reduced ? 1 : 1000;
    let bgdone = false; const bg = window.Deck && Deck._bg && Deck._bg();
    if (bg && bg.boost) bg.boost(8);
    const done = new Promise(res => (function tick(now) {
      const t = Math.min(1, (now - t0) / T), k = Math.sin(t * Math.PI);
      x.clearRect(0, 0, W, H);
      if (!D.reduced) for (const l of lines) {
        const r0 = (t * l.s + l.d) * Math.hypot(cx, cy) * .9, r1 = r0 + k * 260 * l.s;
        x.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${.75 * k})`; x.lineWidth = 1 + l.s;
        x.beginPath(); x.moveTo(cx + Math.cos(l.a) * r0, cy + Math.sin(l.a) * r0); x.lineTo(cx + Math.cos(l.a) * r1, cy + Math.sin(l.a) * r1); x.stroke();
      }
      if (t < 1) requestAnimationFrame(tick); else { cv.style.display = 'none'; res(); }
    })(performance.now()));
    return Promise.all([
      an(c.from, [{ opacity: 1, transform: 'scale(1)', filter: 'blur(0)' }, { opacity: 0, transform: 'scale(2.2)', filter: 'blur(18px)' }], { duration: 640, easing: 'cubic-bezier(.6,0,.9,.4)' }),
      an(c.to, [{ opacity: 0, transform: 'scale(.7)', filter: 'blur(12px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 760, delay: 380, easing: E }),
      done
    ]);
  };

  // card/node -> full page, and back. rect = element rect the page grows out of.
  R['morph-open'] = c => {
    R['morph-open'].at = 300;
    if (!c.rect) return R['zoom-through'](c);
    return Promise.all([
      an(inner(c.from), [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.97)' }], { duration: 420, easing: 'ease' }),
      an(c.to, [{ clipPath: inset(c.rect, 22) }, { clipPath: inset({ top: 0, left: 0, right: vw(), bottom: vh() }, 0) }], { duration: 820, easing: IO })
    ]);
  };
  R['morph-close'] = c => {
    R['morph-close'].at = 0;
    if (!c.rect) return R['fade-blur'](c);
    return Promise.all([
      an(inner(c.from), [{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease' }),
      an(c.from, [{ clipPath: inset({ top: 0, left: 0, right: vw(), bottom: vh() }, 0) }, { clipPath: inset(c.rect, 22) }], { duration: 680, easing: IO }),
      an(c.to, [{ opacity: 0, transform: 'scale(1.03)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 120 })
    ]);
  };

  /* ---- pro transitions ---- */
  const panelsWrap = () => { let w = document.getElementById('pnl'); if (!w) { w = D.h('div', { id: 'pnl' }); document.body.append(w); } w.innerHTML = ''; w.style.display = 'flex'; return w; };

  // venetian blinds: panels cover the screen column by column, the page swaps behind them, panels uncover
  R.blinds = async c => {
    const n = innerWidth < 700 ? 5 : 9, w = panelsWrap(), dur = 520, st = 55;
    const ps = Array.from({ length: n }, () => D.h('i')); ps.forEach(p => w.append(p));
    await Promise.all(ps.map((p, i) => an(p, [{ transform: 'scaleY(0)', transformOrigin: '50% 0' }, { transform: 'scaleY(1)', transformOrigin: '50% 0' }], { duration: dur, delay: i * st, easing: IO })));
    if (c.from) c.from.style.visibility = 'hidden';
    await Promise.all(ps.map((p, i) => an(p, [{ transform: 'scaleY(1)', transformOrigin: '50% 100%' }, { transform: 'scaleY(0)', transformOrigin: '50% 100%' }], { duration: dur, delay: i * st, easing: IO })));
    w.style.display = 'none';
  };

  // two halves of the old page slide apart, the new page settles in behind
  R['curtain-split'] = c => {
    const f = c.from; if (!f) return R['fade-blur'](c);
    const mk = clip => { const k = f.cloneNode(true); k.removeAttribute('data-id'); k.style.cssText = 'display:grid;position:fixed;inset:0;z-index:3;pointer-events:none;clip-path:' + clip; f.parentNode.append(k); return k; };
    const L = mk('inset(0 50% 0 0)'), Rr = mk('inset(0 0 0 50%)'); f.style.visibility = 'hidden';
    return Promise.all([
      an(L, [{ transform: 'none' }, { transform: 'translateX(-54%)' }], { duration: 950, easing: IO }),
      an(Rr, [{ transform: 'none' }, { transform: 'translateX(54%)' }], { duration: 950, easing: IO }),
      an(c.to, [{ transform: 'scale(.9)', filter: 'brightness(.55)' }, { transform: 'none', filter: 'brightness(1)' }], { duration: 1000, easing: E })
    ]).then(() => { L.remove(); Rr.remove(); });
  };

  // camera dolly: old page recedes and turns away in 3D, new page arrives from the front
  R['depth-dolly'] = c => Promise.all([
    an(c.from, [{ opacity: 1, transform: 'perspective(1400px) translate3d(0,0,0) rotateY(0deg)' }, { opacity: 0, transform: `perspective(1400px) translate3d(${-24 * c.dir}%,0,-600px) rotateY(${22 * c.dir}deg)` }], { duration: 900, easing: IO }),
    an(c.to, [{ opacity: 0, transform: `perspective(1400px) translate3d(${30 * c.dir}%,0,320px) rotateY(${-16 * c.dir}deg)` }, { opacity: 1, transform: 'perspective(1400px) translate3d(0,0,0) rotateY(0deg)' }], { duration: 1000, delay: 120, easing: E })
  ]);

  // a blurred glass band sweeps across and the pages swap underneath it
  R['lens-sweep'] = c => {
    const b = D.h('div', { id: 'lens' }); document.body.append(b);
    return Promise.all([
      an(b, [{ transform: 'translateX(-70vw)' }, { transform: 'translateX(115vw)' }], { duration: 1100, easing: IO }),
      an(c.from, [{ opacity: 1 }, { opacity: 1, offset: .4 }, { opacity: 0 }], { duration: 1100, easing: 'linear' }),
      an(c.to, [{ opacity: 0 }, { opacity: 0, offset: .4 }, { opacity: 1 }], { duration: 1100, easing: 'linear' })
    ]).then(() => b.remove());
  };

  // ms until the incoming page's text entrance starts (read by boot before the transition runs)
  Object.entries({ 'fade-blur': 250, slide: 260, 'push-parallax': 380, 'zoom-through': 380, 'clip-circle': 420,
    'wipe-diagonal': 420, warp: 520, 'morph-open': 300, 'morph-close': 0, blinds: 950, 'curtain-split': 480, 'depth-dolly': 420, 'lens-sweep': 520 }).forEach(([k, v]) => { R[k].at = v; });
})();
