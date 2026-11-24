/* backgrounds, cinematic set: datafield · light-tunnel
   datafield    – ambient "data transfer": drifting network with packets + curved streams converging into the focal
                  element of the active page (pairs with the warp-tunnel / data-converge transitions).
   light-tunnel – endless corridor of light frames flying towards the viewer (keynote / launch).
   init(root,{intensity}) -> {destroy, boost}. DPR-aware, pauses when the tab is hidden, reduced motion = one still frame. */
(function () {
  'use strict';
  const D = window.Deck, R = D.reg.bg, h = D.h;
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, a).toFixed(3)})`;
  const rnd = (a, b) => a + Math.random() * (b - a);

  function loop(root, setup) {
    const c = h('canvas'); root.append(c);
    const x = c.getContext('2d'), S = { W: 0, H: 0, t: 0, dt: .016, boost: 1, mx: .5, my: .5 };
    let raf = 0, alive = true, last = performance.now(); const api = setup(x, S);
    const size = () => { const dpr = Math.min(devicePixelRatio || 1, 2); S.W = innerWidth; S.H = innerHeight; c.width = Math.round(S.W * dpr); c.height = Math.round(S.H * dpr); c.style.width = S.W + 'px'; c.style.height = S.H + 'px'; x.setTransform(dpr, 0, 0, dpr, 0, 0); api.resize && api.resize(); };
    const pm = e => { S.mx = e.clientX / innerWidth; S.my = e.clientY / innerHeight; };
    const frame = now => { if (!alive) return; S.dt = Math.min(.05, (now - last) / 1000); last = now;
      if (!document.hidden) { S.t += S.dt; S.boost += (1 - S.boost) * Math.min(1, S.dt * 2.4); api.step(); } raf = requestAnimationFrame(frame); };
    size(); addEventListener('resize', size); addEventListener('pointermove', pm, { passive: true });
    if (D.reduced) { S.t = 4; api.step(); } else raf = requestAnimationFrame(frame);
    return { destroy() { alive = false; cancelAnimationFrame(raf); removeEventListener('resize', size); removeEventListener('pointermove', pm); c.remove(); }, boost(v) { S.boost = v || 5; } };
  }

  // focal point of the active page ([data-focal] or first visual), sampled lazily
  function activeFocal() {
    const st = document.querySelector('.stage.is-active'); if (!st) return null;
    const t = st.querySelector('[data-focal]') || st.querySelector('.hub,.gear,figure,img,canvas,svg:not(.ico)');
    if (!t) return null; const r = t.getBoundingClientRect();
    return r.width > 24 ? [(r.left + r.width / 2) / innerWidth, (r.top + r.height / 2) / innerHeight] : null;
  }

  R.datafield = { init(root, o) {
    const I = o.intensity || 1, A = D.rgb('--accent'), B = D.rgb('--accent2'), L = A.map(v => Math.round(v + (255 - v) * .7));
    return loop(root, (x, S) => {
      let nodes = [], edges = [], packets = [], streams = [], dust = [], fx = .66, fy = .5, fxT = .66, fyT = .5, poll = 0;
      return {
        resize() {
          const n = Math.round(Math.min(70, S.W * S.H / 18000));
          nodes = Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random(), z: rnd(.35, 1), p: Math.random() * 6.28 })); edges = [];
          nodes.forEach((a, i) => nodes.map((b, j) => [j, (a.x - b.x) ** 2 + ((a.y - b.y) * S.H / S.W) ** 2]).filter(q => q[0] !== i).sort((p, q) => p[1] - q[1]).slice(0, 2)
            .forEach(([j]) => { if (!edges.some(e => (e[0] === i && e[1] === j) || (e[0] === j && e[1] === i))) edges.push([i, j]); }));
          packets = Array.from({ length: Math.round(n * 1.1) }, () => ({ e: (Math.random() * edges.length) | 0, t: Math.random(), s: rnd(.12, .35) * (Math.random() < .5 ? 1 : -1) }));
          streams = Array.from({ length: 22 }, (_, i) => ({ a: i / 22 * 6.2832 + rnd(-.1, .1), bend: rnd(-.35, .35), ps: Array.from({ length: 3 }, () => ({ t: Math.random(), s: rnd(.1, .22) })) }));
          dust = Array.from({ length: 120 }, () => ({ x: Math.random(), y: Math.random(), r: rnd(.3, 1.2), p: Math.random() * 6.28, s: rnd(.3, 1) }));
        },
        step() {
          const W = S.W, H = S.H, t = S.t, dt = S.dt, bo = S.boost;
          if ((poll += dt) > .5) { poll = 0; const f = activeFocal(); if (f) { fxT = f[0]; fyT = f[1]; } else { fxT = .5 + (S.mx - .5) * .2; fyT = .5 + (S.my - .5) * .2; } }
          fx += (fxT - fx) * Math.min(1, dt * 2.2); fy += (fyT - fy) * Math.min(1, dt * 2.2);
          const XY = n => [n.x * W + Math.sin(t * .05 + n.p) * 14 * n.z + (S.mx - .5) * 30 * (1 - n.z), n.y * H + Math.cos(t * .04 + n.p) * 10 * n.z + (S.my - .5) * 20 * (1 - n.z)];
          x.clearRect(0, 0, W, H); x.globalCompositeOperation = 'lighter';
          for (const s of dust) { x.fillStyle = rgba([190, 225, 255], .45 * I * s.s * (.55 + .45 * Math.sin(t * 1.3 * s.s + s.p))); x.beginPath(); x.arc(s.x * W, s.y * H, s.r, 0, 6.283); x.fill(); }
          x.lineWidth = 1; x.strokeStyle = rgba(A, .08 * I);
          x.beginPath(); for (const [i, j] of edges) { const P = XY(nodes[i]), Q = XY(nodes[j]); x.moveTo(P[0], P[1]); x.lineTo(Q[0], Q[1]); } x.stroke();
          for (const n of nodes) { const P = XY(n); x.fillStyle = rgba(L, .3 * I * n.z); x.beginPath(); x.arc(P[0], P[1], 1.6 * n.z + .4, 0, 6.283); x.fill(); }
          for (const p of packets) {
            p.t += p.s * dt * bo; if (p.t > 1 || p.t < 0) { p.e = (Math.random() * edges.length) | 0; p.t = p.s > 0 ? 0 : 1; }
            const e = edges[p.e]; if (!e) continue; const P = XY(nodes[e[0]]), Q = XY(nodes[e[1]]), tl = .06 * Math.sign(p.s);
            const X = P[0] + (Q[0] - P[0]) * p.t, Y = P[1] + (Q[1] - P[1]) * p.t, X2 = P[0] + (Q[0] - P[0]) * (p.t - tl), Y2 = P[1] + (Q[1] - P[1]) * (p.t - tl);
            const g = x.createLinearGradient(X2, Y2, X, Y); g.addColorStop(0, rgba(A, 0)); g.addColorStop(1, rgba(L, .75 * I));
            x.strokeStyle = g; x.lineWidth = 1.6; x.beginPath(); x.moveTo(X2, Y2); x.lineTo(X, Y); x.stroke();
          }
          const F = [fx * W, fy * H], Rr = Math.hypot(W, H) * .62;
          const pt = (st, u) => { const P0 = [F[0] + Math.cos(st.a) * Rr, F[1] + Math.sin(st.a) * Rr * .8], C = [(P0[0] + F[0]) / 2 - (F[1] - P0[1]) * st.bend, (P0[1] + F[1]) / 2 + (F[0] - P0[0]) * st.bend], iu = 1 - u;
            return [iu * iu * P0[0] + 2 * iu * u * C[0] + u * u * F[0], iu * iu * P0[1] + 2 * iu * u * C[1] + u * u * F[1]]; };
          for (const st of streams) {
            x.strokeStyle = rgba(B, .07 * I); x.lineWidth = 1; x.beginPath(); for (let k = 0; k <= 20; k++) { const P = pt(st, k / 20); k ? x.lineTo(P[0], P[1]) : x.moveTo(P[0], P[1]); } x.stroke();
            for (const q of st.ps) { q.t += q.s * dt * bo; if (q.t > 1) q.t -= 1; const P = pt(st, q.t), P2 = pt(st, Math.max(0, q.t - .07));
              const g = x.createLinearGradient(P2[0], P2[1], P[0], P[1]); g.addColorStop(0, rgba(A, 0)); g.addColorStop(1, rgba(L, .55 * I * Math.sin(Math.PI * q.t)));
              x.strokeStyle = g; x.lineWidth = 2; x.beginPath(); x.moveTo(P2[0], P2[1]); x.lineTo(P[0], P[1]); x.stroke(); }
          }
          const r = Math.min(W, H) * .2, g = x.createRadialGradient(F[0], F[1], 0, F[0], F[1], r); g.addColorStop(0, rgba(A, .1 * I)); g.addColorStop(1, rgba(A, 0));
          x.fillStyle = g; x.fillRect(F[0] - r, F[1] - r, 2 * r, 2 * r);
          x.globalCompositeOperation = 'source-over';
        }
      };
    });
  } };

  R['light-tunnel'] = { init(root, o) {
    const I = o.intensity || 1, A = D.rgb('--accent'), B = D.rgb('--accent2');
    return loop(root, (x, S) => {
      const N = 16, frames = Array.from({ length: N }, (_, i) => ({ z: (i + 1) / N, b: Math.random() < .25 }));
      return {
        step() {
          const W = S.W, H = S.H, cx = W / 2 + (S.mx - .5) * W * .08, cy = H / 2 + (S.my - .5) * H * .08, f = Math.min(W, H) * .32;
          x.clearRect(0, 0, W, H); x.globalCompositeOperation = 'lighter';
          frames.sort((a, b) => b.z - a.z);
          for (const fr of frames) {
            fr.z -= S.dt * .09 * S.boost; if (fr.z <= .04) { fr.z += 1; fr.b = Math.random() < .25; }
            const s = 1 / fr.z, w = W * .5 * s * .42, hh = H * .5 * s * .42, a = I * Math.min(1, (1 - fr.z) * 1.6) * Math.min(1, fr.z * 6), rad = Math.min(w, hh) * .12;
            x.strokeStyle = rgba(fr.b ? B : A, .5 * a); x.lineWidth = Math.min(4, .6 + s * .25);
            x.beginPath(); x.roundRect ? x.roundRect(cx - w, cy - hh, 2 * w, 2 * hh, rad) : x.rect(cx - w, cy - hh, 2 * w, 2 * hh); x.stroke();
          }
          x.strokeStyle = rgba(A, .07 * I); x.lineWidth = 1; x.beginPath();
          for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { x.moveTo(cx, cy); x.lineTo(cx + sx * W, cy + sy * H); } x.stroke();
          const g = x.createRadialGradient(cx, cy, 0, cx, cy, f); g.addColorStop(0, rgba(A, .14 * I)); g.addColorStop(1, rgba(A, 0)); x.fillStyle = g; x.fillRect(cx - f, cy - f, 2 * f, 2 * f);
          x.globalCompositeOperation = 'source-over';
        }
      };
    });
  } };
})();
