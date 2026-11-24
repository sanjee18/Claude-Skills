/* transitions4.js · light and depth for every transition.
   Why: a transition between two quiet text pages has almost nothing to look at, so it read as "a fade with extra steps".
   Reference-level transitions carry their own LIGHT (flare, glass sweep, bokeh dust, speed streaks) and move pages in
   DEPTH (perspective, falling brightness, rack-focus blur, shadow on the incoming edge).
   1) D.tx.play(kind, {delay, dur, ...}) draws additive light on one overlay canvas (#fx2): bloom · sweep · dust · streak · ring
   2) The flat 2D transitions that are used most are re-authored in 3D with depth cues.
   3) Every registered transition is wrapped with a light recipe (FX table). Reduced motion: no light, short moves. */
(function () {
  'use strict';
  const D = window.Deck, R = D.reg.tr, an = D.an, h = D.h;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const pk = t => Math.pow(Math.sin(Math.PI * clamp(t)), 1.35), eio = t => (t < .5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);
  const EO = 'cubic-bezier(.16,1,.3,1)', EI = 'cubic-bezier(.55,.05,.9,.35)', DR = 'cubic-bezier(.32,.72,0,1)';
  const inner = s => s && s.firstElementChild;
  const vw = () => innerWidth, vh = () => innerHeight;

  /* ---------------- light layer ---------------- */
  let cv = null, ctx = null, live = [], raf = 0, dust = null;
  const col = n => D.rgb(n);
  function ensure() {
    if (!cv) { cv = h('canvas', { id: 'fx2', 'aria-hidden': 'true' }); document.body.append(cv); ctx = cv.getContext('2d'); }
    const dpr = Math.min(devicePixelRatio || 1, 1.5), w = Math.round(vw() * dpr), hh = Math.round(vh() * dpr);
    if (cv.width !== w || cv.height !== hh) { cv.width = w; cv.height = hh; }
    cv.dpr = dpr; cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:27;pointer-events:none;mix-blend-mode:screen;display:block';
  }
  const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${Math.max(0, a).toFixed(3)})`;

  const DRAW = {
    // lens flare: soft core, anamorphic streak, ghosts along the line through the screen centre
    bloom(x, W, H, t, o, dpr) {
      const k = pk(t) * (o.str == null ? 1 : o.str), a = o.col, b = o.col2, cx = (o.x == null ? .5 + .22 * (o.dir || 1) : o.x) * W, cy = (o.y == null ? .38 : o.y) * H;
      let g = x.createRadialGradient(cx, cy, 0, cx, cy, H * (.2 + .6 * k));
      g.addColorStop(0, `rgba(255,246,232,${.55 * k})`); g.addColorStop(.25, rgba(a, .3 * k)); g.addColorStop(1, rgba(a, 0)); x.fillStyle = g; x.fillRect(0, 0, W, H);
      const L = W * (.35 + .6 * k); g = x.createLinearGradient(cx - L / 2, 0, cx + L / 2, 0);
      g.addColorStop(0, rgba(a, 0)); g.addColorStop(.5, rgba(a, .6 * k)); g.addColorStop(1, rgba(a, 0)); x.fillStyle = g; x.fillRect(cx - L / 2, cy - 2.2 * dpr, L, 4.4 * dpr);
      g = x.createLinearGradient(cx - L / 3, 0, cx + L / 3, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, `rgba(255,255,255,${.7 * k})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(cx - L / 3, cy - .8 * dpr, L * 2 / 3, 1.6 * dpr);
      let vx = W / 2 - cx, vy = H / 2 - cy; if (Math.hypot(vx, vy) < W * .03) { vx = W * .2; vy = -H * .09; }   // source in the centre: ghosts still need a direction
      for (let i = 1; i <= 5; i++) {                                           // ghosts: reflections inside the lens, mirrored through the centre
        const p = i * .42 - .3, gx = cx + vx * p * 2, gy = cy + vy * p * 2, r = (18 + i * 15) * dpr * (.6 + k), c = i % 2 ? a : b;
        const gg = x.createRadialGradient(gx, gy, r * .1, gx, gy, r); gg.addColorStop(0, rgba(c, 0)); gg.addColorStop(.78, rgba(c, .05 * k)); gg.addColorStop(.92, rgba(c, .22 * k)); gg.addColorStop(1, rgba(c, 0));
        x.fillStyle = gg; x.beginPath(); x.arc(gx, gy, r, 0, 6.283); x.fill();
      }
    },
    // diagonal glass highlight with chromatic edges
    sweep(x, W, H, t, o, dpr) {
      const dir = o.dir || 1, p = eio(t), s = o.s == null ? 1 : o.s, bw = W * .2, x0 = dir > 0 ? -.3 * W + p * 1.7 * W : 1.3 * W - p * 1.7 * W, f = pk(t) * s;
      x.save(); x.transform(1, 0, -.34 * dir, 1, H * .17 * dir, 0);
      const g = x.createLinearGradient(x0 - bw, 0, x0 + bw, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.4, `rgba(255,255,255,${.07 * f})`); g.addColorStop(.5, `rgba(255,255,255,${.3 * f})`);
      g.addColorStop(.6, `rgba(255,255,255,${.07 * f})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(x0 - bw, -H * .2, bw * 2, H * 1.4);
      [['255,70,90', -5], ['70,255,150', 0], ['80,140,255', 5]].forEach(([c, d]) => { x.fillStyle = `rgba(${c},${.35 * f})`; x.fillRect(x0 + d * dpr - 1 * dpr, -H * .2, 2 * dpr, H * 1.4); });
      x.restore();
    },
    // bokeh dust at different depths: near discs are big, fast and soft; far ones small and slow (parallax = depth)
    dust(x, W, H, t, o, dpr) {
      if (!dust) dust = Array.from({ length: 56 }, (_, i) => ({ x: Math.random(), y: Math.random(), z: Math.pow(Math.random(), 1.6), c: i % 4 }));
      const dir = o.dir || 1, f = pk(t) * (o.s == null ? 1 : o.s), vert = o.vertical;
      dust.slice(0, o.n || 56).forEach(d => {
        const sp = (.25 + 2.1 * d.z * d.z) * (t - .5), px = vert ? d.x : ((d.x + dir * sp + 2) % 1), py = vert ? ((d.y + dir * sp + 2) % 1) : d.y;
        const r = (3 + 44 * d.z * d.z) * dpr, c = d.c === 0 || d.c === 3 ? o.col : d.c === 1 ? o.col2 : [235, 240, 255], a = (.05 + .16 * d.z) * f, X = px * W, Y = py * H;
        const g = x.createRadialGradient(X, Y, 0, X, Y, r); g.addColorStop(0, rgba(c, a * .5)); g.addColorStop(.72, rgba(c, a * .8)); g.addColorStop(.9, rgba(c, a * 1.7)); g.addColorStop(1, rgba(c, 0));
        x.fillStyle = g; x.beginPath(); x.arc(X, Y, r, 0, 6.283); x.fill();
      });
    },
    // radial speed lines for a dolly into the page
    streak(x, W, H, t, o, dpr) {
      if (!DRAW._s) DRAW._s = Array.from({ length: 110 }, () => ({ a: Math.random() * 6.283, r: .12 + Math.random() * .6, w: .4 + Math.random() * 1.4, l: .1 + Math.random() * .35 }));
      const f = pk(t), cx = W / 2, cy = H / 2, v = t * t * (3 - 2 * t), m = Math.hypot(W, H) / 2;
      DRAW._s.forEach(s => {
        const r0 = m * (s.r + v * 1.1), r1 = r0 + m * s.l * (.3 + 1.4 * f), g = x.createLinearGradient(cx + Math.cos(s.a) * r0, cy + Math.sin(s.a) * r0, cx + Math.cos(s.a) * r1, cy + Math.sin(s.a) * r1);
        g.addColorStop(0, rgba(o.col, 0)); g.addColorStop(1, rgba(o.col, .55 * f)); x.strokeStyle = g; x.lineWidth = s.w * dpr;
        x.beginPath(); x.moveTo(cx + Math.cos(s.a) * r0, cy + Math.sin(s.a) * r0); x.lineTo(cx + Math.cos(s.a) * r1, cy + Math.sin(s.a) * r1); x.stroke();
      });
    },
    // glowing edge of a growing circle (pairs with clip-path: circle())
    ring(x, W, H, t, o, dpr) {
      const cx = (o.x == null ? .5 : o.x) * W, cy = (o.y == null ? .5 : o.y) * H, far = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) + 40 * dpr, r = far * eio(t), f = 1 - clamp((t - .75) / .25);
      const g = x.createRadialGradient(cx, cy, Math.max(0, r - 60 * dpr), cx, cy, r + 14 * dpr);
      g.addColorStop(0, rgba(o.col, 0)); g.addColorStop(.8, rgba(o.col, .18 * f)); g.addColorStop(.97, `rgba(255,255,255,${.5 * f})`); g.addColorStop(1, rgba(o.col, 0)); x.fillStyle = g; x.fillRect(0, 0, W, H);
    }
  };

  function frame(now) {
    raf = 0; if (!live.length) { cv.style.display = 'none'; return; }
    ensure(); const x = ctx, W = cv.width, H = cv.height; x.clearRect(0, 0, W, H); x.globalCompositeOperation = 'lighter';
    live = live.filter(e => { const t = (now - e.t0) / e.dur; if (t >= 1) return false; if (t >= 0) { x.save(); DRAW[e.kind](x, W, H, t, e.o, cv.dpr); x.restore(); } return true; });
    raf = requestAnimationFrame(frame);
  }
  const tx = (D.tx = {
    play(kind, o) {
      if (D.reduced || !DRAW[kind]) return; o = Object.assign({ delay: 0, dur: 900, col: col('--accent'), col2: col('--accent2') }, o);
      ensure(); live.push({ kind, o, t0: performance.now() + o.delay, dur: o.dur }); if (!raf) raf = requestAnimationFrame(frame);
    }
  });

  /* ---------------- depth: the flat 2D transitions used most, re-authored ---------------- */
  const P = 'perspective(1700px) ';
  // rack focus: the old page drifts toward the lens and defocuses (and blooms), the new one pulls into focus from behind
  R['fade-blur'] = c => (R['fade-blur'].at = 260, Promise.all([
    an(inner(c.from), [{ opacity: 1, filter: 'blur(0px) brightness(1)', transform: 'scale(1)' }, { opacity: .7, filter: 'blur(5px) brightness(1.18)', transform: 'scale(1.015)', offset: .4 }, { opacity: 0, filter: 'blur(18px) brightness(1.35)', transform: 'scale(1.045) translateY(-1.2%)' }], { duration: 640, easing: 'cubic-bezier(.4,0,.2,1)' }),
    an(c.to, [{ opacity: 0, filter: 'blur(22px) brightness(1.3)', transform: 'scale(.965) translateY(1.6%)' }, { opacity: .8, filter: 'blur(6px) brightness(1.1)', transform: 'scale(.992)', offset: .55 }, { opacity: 1, filter: 'blur(0px) brightness(1)', transform: 'none' }], { duration: 950, delay: 170, easing: EO })
  ]));
  R.slide = c => (R.slide.at = 280, Promise.all([
    an(c.from, [{ opacity: 1, filter: 'blur(0) brightness(1)', transform: P + 'translate3d(0,0,0) rotateY(0deg)' }, { opacity: 0, filter: 'blur(7px) brightness(.55)', transform: P + `translate3d(${-16 * c.dir}%,0,-340px) rotateY(${15 * c.dir}deg)` }], { duration: 760, easing: DR }),
    an(c.to, [{ opacity: 0, filter: 'blur(8px) brightness(1.3)', transform: P + `translate3d(${24 * c.dir}%,0,180px) rotateY(${-11 * c.dir}deg)` }, { opacity: 1, filter: 'blur(0) brightness(1)', transform: P + 'translate3d(0,0,0) rotateY(0deg)' }], { duration: 900, easing: DR })
  ]));
  R['push-parallax'] = c => (R['push-parallax'].at = 400, Promise.all([
    an(c.from, [{ transform: P + 'translate3d(0,0,0) scale(1)', filter: 'brightness(1) blur(0)' }, { transform: P + `translate3d(${-26 * c.dir}%,0,-260px) scale(.94)`, filter: 'brightness(.42) blur(5px)' }], { duration: 950, easing: DR }),
    an(c.to, [{ transform: `translateX(${100 * c.dir}%)`, boxShadow: `${-60 * c.dir}px 0 140px rgba(0,0,0,.75)` }, { transform: 'none', boxShadow: `${-6 * c.dir}px 0 40px rgba(0,0,0,0)` }], { duration: 950, easing: DR })
  ]));
  // camera pushes through the page: accelerates in, blooms, the new page is already waiting behind the light
  R['zoom-through'] = c => (R['zoom-through'].at = 420, Promise.all([
    an(c.from, [{ opacity: 1, transform: 'scale(1)', filter: 'blur(0) brightness(1)' }, { opacity: .9, transform: 'scale(1.5)', filter: 'blur(7px) brightness(1.3)', offset: .6 }, { opacity: 0, transform: 'scale(2.6)', filter: 'blur(22px) brightness(1.8)' }], { duration: 820, easing: EI }),
    an(c.to, [{ opacity: 0, transform: 'scale(.62)', filter: 'blur(20px) brightness(1.7)' }, { opacity: 1, transform: 'none', filter: 'blur(0) brightness(1)' }], { duration: 1050, delay: 300, easing: EO })
  ]));
  R['depth-dolly'] = c => (R['depth-dolly'].at = 420, Promise.all([
    an(c.from, [{ opacity: 1, filter: 'brightness(1) blur(0)', transform: P + 'translate3d(0,0,0) rotateY(0deg)' }, { opacity: 0, filter: 'brightness(.35) blur(10px)', transform: P + `translate3d(${-26 * c.dir}%,0,-760px) rotateY(${24 * c.dir}deg)` }], { duration: 960, easing: 'cubic-bezier(.65,0,.35,1)' }),
    an(c.to, [{ opacity: 0, filter: 'brightness(1.4) blur(12px)', transform: P + `translate3d(${32 * c.dir}%,0,380px) rotateY(${-17 * c.dir}deg)` }, { opacity: 1, filter: 'brightness(1) blur(0)', transform: P + 'translate3d(0,0,0) rotateY(0deg)' }], { duration: 1050, delay: 130, easing: EO })
  ]));
  R['lens-sweep'] = c => {
    const b = h('div', { id: 'lens' }); document.body.append(b); R['lens-sweep'].at = 520;
    return Promise.all([
      an(b, [{ transform: 'translateX(-70vw)' }, { transform: 'translateX(115vw)' }], { duration: 1150, easing: 'cubic-bezier(.65,0,.35,1)' }),
      an(c.from, [{ opacity: 1, transform: 'scale(1)', filter: 'blur(0)' }, { opacity: 1, transform: 'scale(1.03)', filter: 'blur(2px)', offset: .42 }, { opacity: 0, transform: 'scale(1.06)', filter: 'blur(6px)' }], { duration: 1150, easing: 'linear' }),
      an(c.to, [{ opacity: 0, transform: 'scale(.95)', filter: 'blur(6px)' }, { opacity: 0, offset: .42, transform: 'scale(.97)', filter: 'blur(3px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 1150, easing: 'linear' })
    ]).then(() => b.remove());
  };
  (o => { R['clip-circle'] = c => {
    R['clip-circle'].at = 420; const og = c.origin || { x: vw() / 2, y: vh() / 2 }, far = Math.hypot(Math.max(og.x, vw() - og.x), Math.max(og.y, vh() - og.y));
    tx.play('ring', { dur: 950, x: og.x / vw(), y: og.y / vh() });
    return Promise.all([
      an(inner(c.from), [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.96)' }], { duration: 520, delay: 160, easing: 'ease' }),
      an(c.to, [{ clipPath: `circle(0px at ${og.x}px ${og.y}px)`, transform: 'scale(1.14)' }, { clipPath: `circle(${far + 40}px at ${og.x}px ${og.y}px)`, transform: 'none' }], { duration: 950, easing: 'cubic-bezier(.77,0,.175,1)' })
    ]);
  }; })();

  /* ---------------- light recipes for ALL transitions ---------------- */
  // [kind, delay ms, dur ms, options]. Anything not listed gets a quiet glass sweep.
  const FX = {
    'fade-blur': [['bloom', 80, 900, { str: .32 }]],
    slide: [['dust', 0, 1000, { n: 30, s: .8 }], ['sweep', 60, 900, { s: .55 }]],
    'push-parallax': [['dust', 0, 1000, { n: 36 }], ['sweep', 80, 900, { s: .5 }]],
    'push-up': [['dust', 0, 900, { n: 30, vertical: true }], ['sweep', 0, 800, { s: .4 }]],
    'zoom-through': [['streak', 0, 900, {}], ['bloom', 220, 900, { str: .8, x: .5, y: .5 }]],
    'depth-dolly': [['dust', 0, 1100, { n: 56 }], ['sweep', 140, 900, { s: .5 }]],
    'lens-sweep': [['sweep', 0, 1150, { s: 1.1 }]],
    'wipe-diagonal': [['sweep', 0, 900, { s: 1 }]], 'clip-circle': [],
    'card-stack': [['dust', 0, 1000, { n: 28 }], ['sweep', 100, 900, { s: .5 }]],
    cube: [['sweep', 0, 1100, { s: .7 }]], flip: [['sweep', 100, 1000, { s: .8 }]],
    'curtain-split': [['bloom', 150, 900, { str: .6, x: .5, y: .5 }]],
    warp: [['bloom', 300, 900, { str: .7, x: .5, y: .5 }]], 'warp-tunnel': [['bloom', 900, 1200, { str: .9, x: .5, y: .5 }]],
    'portal-dive': [['bloom', 450, 1000, { str: .8, x: .5, y: .5 }]], 'data-converge': [['bloom', 500, 900, { str: .7, x: .5, y: .5 }]],
    'morph-open': [['bloom', 250, 900, { str: .5 }]], 'morph-close': [['bloom', 150, 800, { str: .4 }]],
    shatter: [['bloom', 0, 900, { str: .6, x: .5, y: .45 }]], 'scan-reveal': [['sweep', 0, 1000, { s: .7 }]],
    blinds: [['sweep', 0, 900, { s: .4 }]], shutter: [['bloom', 200, 800, { str: .5, x: .5, y: .5 }]], 'radial-wipe': [['ring', 0, 1000, {}]],
    'band-reveal': [['sweep', 0, 900, { s: .6 }]], tiles: [['sweep', 0, 900, { s: .4 }]], 'color-sweep': [], 'glitch-cut': [], 'ink-goo': [], shared: []
  };
  Object.keys(R).forEach(id => {
    const f = R[id]; if (typeof f !== 'function' || f._lit) return;
    const w = c => { (FX[id] || [['sweep', 0, 900, { s: .35 }]]).forEach(([k, d, u, o]) => tx.play(k, Object.assign({ delay: d, dur: u, dir: c.dir || 1 }, o))); return f(c); };
    w._lit = true; Object.defineProperty(w, 'at', { get: () => f.at, set: v => { f.at = v; }, configurable: true }); R[id] = w;
  });
})();
