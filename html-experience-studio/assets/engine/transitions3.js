/* page transitions, cinematic set (reference level: "cockpit -> gear" data-transfer warp):
   warp-tunnel · data-converge · portal-dive · shatter · ink-goo · scan-reveal
   Same contract as transitions.js: tr[id]({from,to,dir,rect,origin,mode}) -> Promise, `.at` = ms until the text entrance starts.
   Focal points: an element with [data-focal] wins; otherwise the first visual (svg/canvas/img/figure/hub) of the page; else the centre.
   All canvas work is DPR-aware, time-based and cleaned up; prefers-reduced-motion falls back to fade-blur. */
(function () {
  'use strict';
  const D = window.Deck, R = D.reg.tr, an = D.an, E = D.EASE, IO = D.EASE_IO, h = D.h;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = v => Math.max(0, Math.min(1, v));
  const ss = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };   // smoothstep
  const eIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const eOut = t => 1 - Math.pow(1 - t, 3), eIn = t => t * t * t;
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, a).toFixed(3)})`;
  const mix = (c, k) => c.map(v => Math.round(v + (255 - v) * k));   // towards white
  const centre = () => ({ x: innerWidth / 2, y: innerHeight / 2 });
  const hideFrom = c => { if (c.from) c.from.style.visibility = 'hidden'; };
  const fallback = c => R['fade-blur'](c);

  function focalOf(el) {
    if (!el) return centre();
    const t = el.querySelector('[data-focal]') || el.querySelector('.hub,.gear,figure,img,canvas,svg:not(.ico),.visual,[class*="vis"]');
    if (t) { const r = t.getBoundingClientRect(); if (r.width > 24 && r.height > 24 && r.bottom > 0 && r.top < innerHeight) return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
    return centre();
  }
  const originOf = c => c.origin || (c.rect ? { x: (c.rect.left + c.rect.right) / 2, y: (c.rect.top + c.rect.bottom) / 2 } : focalOf(c.from));

  // own overlay canvas (does not fight with #fx used by the classic warp)
  function overlay(id, z) {
    let cv = document.getElementById(id);
    if (!cv) { cv = h('canvas', { id, style: { position: 'fixed', inset: '0', zIndex: z || 25, pointerEvents: 'none' } }); document.body.append(cv); }
    const dpr = Math.min(devicePixelRatio || 1, 2), W = innerWidth, H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px'; cv.style.display = 'block';
    const x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { cv, x, W, H, off() { x.clearRect(0, 0, W, H); cv.style.display = 'none'; } };
  }
  // run draw(t 0..1, dt seconds) for T ms
  const play = (T, draw) => new Promise(res => { const t0 = performance.now(); let last = t0;
    (function tick(now) { const t = clamp((now - t0) / T), dt = Math.min(.05, (now - last) / 1000); last = now; draw(t, dt); if (t < 1) requestAnimationFrame(tick); else res(); })(t0); });

  // curved data streams (quadratic bezier from far outside into the focal point F)
  function makeStreams(n) {
    return Array.from({ length: n }, (_, i) => ({ a: i / n * 6.2832 + rnd(-.1, .1), bend: rnd(-.35, .35), ps: Array.from({ length: 4 }, () => ({ t: Math.random(), s: rnd(.5, 1) })) }));
  }
  function streamPt(st, u, F, W, H) {
    const Rr = Math.hypot(W, H) * .62, P0x = F.x + Math.cos(st.a) * Rr, P0y = F.y + Math.sin(st.a) * Rr * .8;
    const Cx = (P0x + F.x) / 2 - (F.y - P0y) * st.bend, Cy = (P0y + F.y) / 2 + (F.x - P0x) * st.bend, iu = 1 - u;
    return [iu * iu * P0x + 2 * iu * u * Cx + u * u * F.x, iu * iu * P0y + 2 * iu * u * Cy + u * u * F.y];
  }
  function drawStreams(x, streams, F, W, H, I, speed, dt, A, L) {
    x.lineWidth = 1;
    for (const st of streams) {
      x.strokeStyle = rgba(A, .12 * I); x.beginPath();
      for (let k = 0; k <= 24; k++) { const P = streamPt(st, k / 24, F, W, H); k ? x.lineTo(P[0], P[1]) : x.moveTo(P[0], P[1]); }
      x.stroke();
      for (const q of st.ps) {
        q.t += q.s * dt * speed; if (q.t > 1) q.t -= 1;
        const P = streamPt(st, q.t, F, W, H), P2 = streamPt(st, Math.max(0, q.t - .08), F, W, H);
        const g = x.createLinearGradient(P2[0], P2[1], P[0], P[1]); g.addColorStop(0, rgba(A, 0)); g.addColorStop(1, rgba(L, .8 * I * Math.sin(Math.PI * q.t)));
        x.strokeStyle = g; x.lineWidth = 2; x.beginPath(); x.moveTo(P2[0], P2[1]); x.lineTo(P[0], P[1]); x.stroke();
      }
    }
  }
  function glow(x, F, r, col, a) {
    const g = x.createRadialGradient(F.x, F.y, 0, F.x, F.y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
    x.fillStyle = g; x.fillRect(F.x - r, F.y - r, 2 * r, 2 * r);
  }

  /* 1) DATA-TRANSFER WARP: dive into the focal element of the old page -> 3D light tunnel -> data streams converge
        into the focal element of the new page, which builds in from the depth. The signature move of a deck. */
  R['warp-tunnel'] = c => {
    if (D.reduced) return fallback(c);
    const T = 2300, o0 = originOf(c), o1 = focalOf(c.to), A = D.rgb('--accent'), B2 = D.rgb('--accent2'), L = mix(A, .75);
    const O = overlay('fx3'), { x, W, H } = O, f = Math.min(W, H) * .5, n = innerWidth < 700 ? 220 : 420;
    const P = Array.from({ length: n }, () => ({ x: rnd(-1, 1), y: rnd(-1, 1), z: Math.random(), s: rnd(.6, 1.4), w: Math.random() < .22 }));
    const streams = makeStreams(innerWidth < 700 ? 16 : 26);
    const bg = D._bg && D._bg(); if (bg && bg.boost) bg.boost(8);
    c.from && (c.from.style.transformOrigin = `${o0.x}px ${o0.y}px`);
    const anims = [
      c.from && an(c.from, [{ transform: 'scale(1)', filter: 'blur(0) brightness(1)', opacity: 1 },
        { transform: 'scale(1.7)', filter: 'blur(3px) brightness(1.15)', opacity: 1, offset: .55 },
        { transform: 'scale(3.6)', filter: 'blur(18px) brightness(1.8)', opacity: 0 }], { duration: 950, easing: 'cubic-bezier(.55,0,.9,.45)' }),
      an(c.to, [{ opacity: 0, transform: 'perspective(1200px) translateZ(-900px)', filter: 'blur(16px)' }, { opacity: 0, offset: .01 },
        { opacity: 1, transform: 'perspective(1200px) translateZ(0)', filter: 'blur(0)' }], { duration: 950, delay: 1250, easing: E })
    ];
    const run = play(T, (t, dt) => {
      x.clearRect(0, 0, W, H); x.globalCompositeOperation = 'lighter';
      const warp = ss(.1, .34, t) * (1 - ss(.56, .78, t)), conv = ss(.5, .7, t) * (1 - ss(.86, 1, t));
      const k = ss(0, .4, t), cx = o0.x + (W / 2 - o0.x) * k, cy = o0.y + (H / 2 - o0.y) * k;   // tunnel centre glides to screen centre
      // dive flash + shock ring at the dive point
      if (t < .4) { const u = ss(.12, .4, t); x.strokeStyle = rgba(L, .55 * (1 - u)); x.lineWidth = 2; x.beginPath(); x.arc(o0.x, o0.y, 20 + u * Math.hypot(W, H) * .6, 0, 6.2832); x.stroke(); glow(x, o0, 160 + 300 * u, L, .35 * Math.sin(Math.PI * u)); }
      if (warp > .004) {
        for (const p of P) {
          const z0 = p.z; p.z -= dt * .9 * p.s * (.4 + 2.4 * warp);
          if (p.z < .03) { p.z = 1; p.x = rnd(-1, 1); p.y = rnd(-1, 1); continue; }
          const X1 = cx + p.x / z0 * f * .35, Y1 = cy + p.y / z0 * f * .35, X2 = cx + p.x / p.z * f * .35, Y2 = cy + p.y / p.z * f * .35;
          x.strokeStyle = rgba(p.w ? [235, 248, 255] : (p.s > 1.2 ? B2 : A), warp * (1 - p.z) * .95); x.lineWidth = 1 + (1 - p.z) * 1.8;
          x.beginPath(); x.moveTo(X1, Y1); x.lineTo(X2, Y2); x.stroke();
        }
        glow(x, { x: cx, y: cy }, f * .9, A, .25 * warp);
      }
      if (conv > .004) { drawStreams(x, streams, o1, W, H, conv, 1 + conv * 2.4, dt, A, L); glow(x, o1, Math.min(W, H) * .24, A, .3 * conv); }
      x.globalCompositeOperation = 'source-over';
    });
    return Promise.all([...anims, run]).then(() => { O.off(); if (c.from) c.from.style.transformOrigin = ''; });
  };

  /* 2) DATA CONVERGE: streams of light packets flow from the edges into the focal point of the new page,
        which then opens as a circle out of that point. Calmer than the warp, same visual language. */
  R['data-converge'] = c => {
    if (D.reduced) return fallback(c);
    const T = 1700, F = focalOf(c.to), A = D.rgb('--accent'), L = mix(A, .7), O = overlay('fx3'), { x, W, H } = O, streams = makeStreams(innerWidth < 700 ? 14 : 24);
    const far = Math.hypot(Math.max(F.x, W - F.x), Math.max(F.y, H - F.y)) + 40;
    return Promise.all([
      c.from && an(c.from, [{ opacity: 1, filter: 'blur(0) brightness(1)' }, { opacity: 0, filter: 'blur(10px) brightness(.6)' }], { duration: 1200, easing: 'ease' }),
      an(c.to, [{ clipPath: `circle(0px at ${F.x}px ${F.y}px)` }, { clipPath: `circle(0px at ${F.x}px ${F.y}px)`, offset: .01 }, { clipPath: `circle(${far}px at ${F.x}px ${F.y}px)` }], { duration: 900, delay: 650, easing: IO }),
      play(T, (t, dt) => {
        x.clearRect(0, 0, W, H); x.globalCompositeOperation = 'lighter';
        const I = ss(0, .25, t) * (1 - ss(.7, 1, t)), pulse = Math.sin(Math.PI * ss(.3, .6, t));
        drawStreams(x, streams, F, W, H, I, 1.2 + 2.5 * ss(0, .45, t), dt, A, L);
        glow(x, F, Math.min(W, H) * (.06 + .1 * pulse), L, .35 * I + .2 * pulse); glow(x, F, Math.min(W, H) * .28, A, .12 * I);
        x.globalCompositeOperation = 'source-over';
      })
    ]).then(() => O.off());
  };

  /* 3) PORTAL DIVE: a glowing ring opens at the click/focal point, the new page shows inside it,
        then the camera flies through the ring. */
  R['portal-dive'] = c => {
    if (D.reduced) return fallback(c);
    const T = 1400, o = originOf(c), A = D.rgb('--accent'), B2 = D.rgb('--accent2'), L = mix(A, .7), O = overlay('fx3', 27), { x, W, H } = O;
    const far = Math.hypot(Math.max(o.x, W - o.x), Math.max(o.y, H - o.y)) + 60, r0 = Math.min(W, H) * .11;
    const sat = Array.from({ length: 48 }, () => ({ a: Math.random() * 6.2832, d: rnd(-.12, .12), s: rnd(.6, 1.6), w: Math.random() < .3 }));
    const to = c.to; to.style.transformOrigin = `${o.x}px ${o.y}px`;
    if (c.from) c.from.style.transformOrigin = `${o.x}px ${o.y}px`;
    return play(T, (t, dt) => {
      const open = eOut(ss(0, .3, t)), dive = eIn(ss(.32, .92, t)), r = r0 * open + (far - r0) * dive, sc = 1.35 - .35 * ss(.32, 1, t);
      to.style.clipPath = t >= 1 ? '' : `circle(${r / sc}px at ${o.x}px ${o.y}px)`;
      to.style.transform = t >= 1 ? '' : `scale(${sc})`;
      if (c.from) { const fs = 1 + .6 * dive, rf = r / fs, m = `radial-gradient(circle at ${o.x}px ${o.y}px, transparent ${rf}px, #000 ${rf + 2}px)`;
        c.from.style.transform = `scale(${fs})`; c.from.style.filter = `blur(${10 * dive}px) brightness(${1 - .4 * open})`; c.from.style.webkitMaskImage = c.from.style.maskImage = m; }
      x.clearRect(0, 0, W, H); x.globalCompositeOperation = 'lighter';
      const a = 1 - ss(.75, 1, t);
      x.shadowColor = rgba(A, .9); x.shadowBlur = 24; x.lineWidth = 3 + 6 * dive; x.strokeStyle = rgba(L, .9 * a);
      x.beginPath(); x.arc(o.x, o.y, Math.max(1, r), 0, 6.2832); x.stroke(); x.shadowBlur = 0;
      x.lineWidth = 1; x.strokeStyle = rgba(B2, .5 * a); x.beginPath(); x.arc(o.x, o.y, Math.max(1, r * 1.08 + 6), 0, 6.2832); x.stroke();
      for (const s of sat) { s.a += dt * s.s * (1.2 + 3 * dive); const rr = r * (1 + s.d); x.fillStyle = rgba(s.w ? [255, 255, 255] : A, .8 * a); x.beginPath(); x.arc(o.x + Math.cos(s.a) * rr, o.y + Math.sin(s.a) * rr, 1.2 + s.s, 0, 6.2832); x.fill(); }
      glow(x, o, r * 1.4 + 40, A, .18 * a * open);
      x.globalCompositeOperation = 'source-over';
    }).then(() => { O.off(); to.style.clipPath = ''; to.style.transform = ''; to.style.transformOrigin = '';
      if (c.from) { c.from.style.transform = ''; c.from.style.filter = ''; c.from.style.transformOrigin = ''; c.from.style.webkitMaskImage = c.from.style.maskImage = ''; } });
  };
  R['portal-dive'].at = 900;

  /* 4) SHATTER: cracks run from the impact point, the old page breaks into glass shards that fly past the camera. */
  R.shatter = async c => {
    const f = c.from; if (!f || D.reduced) return fallback(c);
    const W = innerWidth, H = innerHeight, o = originOf(c), cols = W < 700 ? 3 : 5, rows = W < 700 ? 4 : 3;
    const pt = [];   // jittered grid, edges pinned to the frame
    for (let r = 0; r <= rows; r++) for (let k = 0; k <= cols; k++) pt.push([k === 0 ? 0 : k === cols ? W : (k + rnd(-.3, .3)) * W / cols, r === 0 ? 0 : r === rows ? H : (r + rnd(-.3, .3)) * H / rows]);
    const P = (k, r) => pt[r * (cols + 1) + k], tris = [];
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
      const a = P(k, r), b = P(k + 1, r), d = P(k + 1, r + 1), e = P(k, r + 1);
      if ((k + r) % 2) tris.push([a, b, d], [a, d, e]); else tris.push([a, b, e], [b, d, e]);
    }
    // 1. cracks
    const O = overlay('fx3', 27), { x } = O, A = D.rgb('--accent'), L = mix(A, .85);
    await play(260, t => {
      x.clearRect(0, 0, W, H); x.strokeStyle = rgba(L, .9); x.lineWidth = 1.4; x.shadowColor = rgba(A, 1); x.shadowBlur = 10;
      for (const [a, b, d] of tris) { x.beginPath(); x.moveTo(o.x + (a[0] - o.x) * t, o.y + (a[1] - o.y) * t); x.lineTo(o.x + (b[0] - o.x) * t, o.y + (b[1] - o.y) * t); x.lineTo(o.x + (d[0] - o.x) * t, o.y + (d[1] - o.y) * t); x.closePath(); x.stroke(); }
      x.shadowBlur = 0; glow(x, o, 140, L, .5 * t);
    });
    // 2. shards
    const host = f.parentNode, maxD = Math.hypot(W, H), shards = tris.map(tri => {
      const k = f.cloneNode(true); k.removeAttribute('data-id'); k.removeAttribute('id');
      const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, cy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
      k.style.cssText = `display:grid;position:fixed;inset:0;z-index:3;pointer-events:none;background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 10%,var(--bg)),var(--bg));transform-origin:${cx}px ${cy}px;clip-path:polygon(${tri.map(p => p[0] + 'px ' + p[1] + 'px').join(',')})`;
      host.append(k); return { k, cx, cy };
    });
    hideFrom(c);
    an(O.cv, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).then(() => { O.off(); O.cv.style.opacity = ''; O.cv.getAnimations().forEach(a => a.cancel()); });
    return Promise.all([
      ...shards.map(({ k, cx, cy }) => { const dx = cx - o.x, dy = cy - o.y, dd = Math.hypot(dx, dy) || 1, s = 1 - dd / maxD;
        return an(k, [{ transform: 'perspective(1100px) translate3d(0,0,0) rotate3d(1,1,0,0deg)', opacity: 1, filter: 'brightness(1)' },
          { transform: `perspective(1100px) translate3d(${dx / dd * rnd(120, 420)}px,${dy / dd * rnd(120, 420) + 160}px,${rnd(200, 700) * s}px) rotate3d(${rnd(-1, 1)},${rnd(-1, 1)},${rnd(-.3, .3)},${rnd(50, 140)}deg)`, opacity: 0, filter: 'brightness(1.6)' }],
          { duration: 1000, delay: Math.round((1 - s) * 220), easing: 'cubic-bezier(.2,.6,.35,1)' }); }),
      an(c.to, [{ transform: 'scale(.92)', filter: 'brightness(.4) blur(6px)' }, { transform: 'none', filter: 'brightness(1) blur(0)' }], { duration: 1100, easing: E })
    ]).then(() => shards.forEach(s => s.k.remove()));
  };
  R.shatter.at = 520;

  /* 5) INK GOO: liquid accent ink blobs flow out of the click point, merge (SVG goo filter) and cover the screen,
        the page swaps underneath, the ink drains away to the opposite side. */
  R['ink-goo'] = async c => {
    if (D.reduced) return fallback(c);
    const W = innerWidth, H = innerHeight, o = originOf(c), NS = 'http://www.w3.org/2000/svg', n = 14;
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    Object.assign(svg.style, { position: 'fixed', inset: '0', width: '100vw', height: '100vh', zIndex: 26, pointerEvents: 'none' });
    svg.innerHTML = `<defs><filter id="goo3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${W < 700 ? 10 : 18}"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 30 -12"/></filter></defs><g filter="url(#goo3)" style="fill:var(--accent2)"></g><g filter="url(#goo3)" style="fill:var(--accent)"></g>`;
    document.body.append(svg);
    const far = Math.hypot(W, H), layers = [...svg.querySelectorAll('g')].map((g, li) => Array.from({ length: n }, (_, i) => {
      const a = rnd(0, 6.2832), d = rnd(0, .5) * far, el = document.createElementNS(NS, 'circle');
      el.setAttribute('cx', o.x + Math.cos(a) * d); el.setAttribute('cy', o.y + Math.sin(a) * d); g.append(el);
      return { el, R: far * rnd(.35, .55), del: d / far * .5 + rnd(0, .12) + li * .04 };
    }));
    const all = layers.flat();
    an(c.to, [{ opacity: 0 }, { opacity: 0 }], { duration: 760 });
    await play(760, t => all.forEach(b => b.el.setAttribute('r', b.R * eIO(clamp((t - b.del) / (1 - b.del || 1))))));
    hideFrom(c); c.to.getAnimations().forEach(a => a.cancel());
    await play(820, t => all.forEach(b => b.el.setAttribute('r', b.R * (1 - eIO(clamp((t - (.5 - b.del * .9)) / .5))))));
    svg.remove();
  };
  R['ink-goo'].at = 1000;

  /* 6) SCAN REVEAL: a bright laser line scans over the page; behind the line the new page is already there
        (X-ray / diagnosis / "now you see the truth"). */
  R['scan-reveal'] = c => {
    if (D.reduced) return fallback(c);
    const T = 1250, A = D.rgb('--accent'), L = mix(A, .8), O = overlay('fx3', 27), { x, W, H } = O, down = c.dir >= 0;
    const ticks = Array.from({ length: 60 }, () => ({ x: Math.random() * W, w: rnd(6, 60), o: rnd(-14, 14) }));
    if (c.from) an(c.from, [{ filter: 'brightness(1)' }, { filter: 'brightness(.7)' }], { duration: T });
    return play(T, t => {
      const e = eIO(t), y = down ? e * H : (1 - e) * H;
      c.to.style.clipPath = t >= 1 ? '' : (down ? `inset(0 0 ${H - y}px 0)` : `inset(${y}px 0 0 0)`);
      if (c.from) c.from.style.clipPath = down ? `inset(${y}px 0 0 0)` : `inset(0 0 ${H - y}px 0)`;
      x.clearRect(0, 0, W, H); const a = 1 - ss(.9, 1, t), sgn = down ? -1 : 1;
      const g = x.createLinearGradient(0, y, 0, y + sgn * 160); g.addColorStop(0, rgba(A, .32 * a)); g.addColorStop(1, rgba(A, 0));
      x.fillStyle = g; x.fillRect(0, Math.min(y, y + sgn * 160), W, 160);
      x.fillStyle = rgba(A, .14 * a); for (let gx = 0; gx < W; gx += 32) for (let k = 1; k < 5; k++) x.fillRect(gx, y + sgn * k * 32, 1.4, 1.4);
      x.shadowColor = rgba(A, 1); x.shadowBlur = 22; x.fillStyle = rgba(L, a); x.fillRect(0, y - 1, W, 2); x.shadowBlur = 0;
      x.fillStyle = rgba(L, .7 * a); for (const k of ticks) if (Math.random() < .5) x.fillRect(k.x, y + k.o, k.w, 1);
    }).then(() => { O.off(); c.to.style.clipPath = ''; if (c.from) c.from.style.clipPath = ''; });
  };

  Object.entries({ 'warp-tunnel': 1350, 'data-converge': 850, 'scan-reveal': 420 }).forEach(([k, v]) => { R[k].at = v; });
})();
