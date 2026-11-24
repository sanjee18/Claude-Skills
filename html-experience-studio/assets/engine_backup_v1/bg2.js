/* backgrounds, extended library:
   flow-field · dot-wave · wave-lines · bokeh · topo · code-rain · constellation   (canvas)
   blobs · beams · orbits · gradient-shift · spotlight · noise-mesh · halftone      (CSS)
   All read --accent/--accent2/--bg, all respect prefers-reduced-motion (one still frame). */
(function () {
  'use strict';
  const D = window.Deck, R = D.reg.bg, h = D.h;
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  // cheap smooth pseudo-noise (no dependency)
  const nz = (x, y, t) => Math.sin(x * 1.7 + t) * Math.cos(y * 1.3 - t * .7) + Math.sin((x + y) * .9 + t * .4) * .5;

  function loop(root, setup) {
    const c = h('canvas'); root.append(c);
    const x = c.getContext('2d'), S = { W: 0, H: 0, dpr: 1, t: 0, boost: 1, mx: .5, my: .5 };
    let raf = 0, alive = true; const api = setup(x, S);
    const size = () => { S.dpr = Math.min(devicePixelRatio || 1, 2); S.W = c.width = Math.round(innerWidth * S.dpr); S.H = c.height = Math.round(innerHeight * S.dpr); c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px'; api.resize && api.resize(); };
    const pm = e => { S.mx = e.clientX / innerWidth; S.my = e.clientY / innerHeight; };
    const frame = () => { if (!alive) return; if (!document.hidden) { S.t += .016 * S.boost; S.boost += (1 - S.boost) * .04; api.step(); } raf = requestAnimationFrame(frame); };
    size(); addEventListener('resize', size); addEventListener('pointermove', pm, { passive: true });
    if (D.reduced) { S.t = 3; api.step(); } else frame();
    return { destroy() { alive = false; cancelAnimationFrame(raf); removeEventListener('resize', size); removeEventListener('pointermove', pm); c.remove(); }, boost(v) { S.boost = v || 5; } };
  }
  const css = (cls, n) => ({ init(root, o) { const w = h('div', { class: 'bgx ' + cls, style: { opacity: Math.min(1, .85 * (o.intensity || 1)) } }, Array.from({ length: n || 0 }, () => h('i'))); root.append(w); return { destroy() { w.remove(); } }; } });

  /* particles following a flow field, leaving soft trails */
  R['flow-field'] = { init(root, o) {
    const I = o.intensity || 1, a = D.rgb('--accent'), b = D.rgb('--accent2'), bg = D.rgb('--bg', '#000');
    return loop(root, (x, S) => { let P = [];
      return {
        resize() { P = Array.from({ length: Math.round(Math.min(900, innerWidth * innerHeight / 1800) * I) }, () => ({ x: Math.random() * S.W, y: Math.random() * S.H, l: Math.random() * 200, c: Math.random() < .7 ? a : b })); x.fillStyle = rgba(bg, 1); x.fillRect(0, 0, S.W, S.H); },
        step() {
          x.fillStyle = rgba(bg, .08); x.fillRect(0, 0, S.W, S.H); x.lineWidth = S.dpr;
          for (const p of P) {
            const ang = nz(p.x / S.W * 3, p.y / S.H * 3, S.t * .25) * 2.6, sp = 1.1 * S.dpr * S.boost;
            const nx = p.x + Math.cos(ang) * sp, ny = p.y + Math.sin(ang) * sp;
            x.strokeStyle = rgba(p.c, .35); x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(nx, ny); x.stroke();
            p.x = nx; p.y = ny; if (--p.l < 0 || nx < 0 || ny < 0 || nx > S.W || ny > S.H) { p.x = Math.random() * S.W; p.y = Math.random() * S.H; p.l = 120 + Math.random() * 200; }
          }
        }
      }; });
  } };

  /* dot grid; a wave travels through size and brightness, cursor adds a ripple */
  R['dot-wave'] = { init(root, o) {
    const I = o.intensity || 1, a = D.rgb('--accent');
    return loop(root, (x, S) => ({
      step() {
        x.clearRect(0, 0, S.W, S.H); const g = 26 * S.dpr, mx = S.mx * S.W, my = S.my * S.H;
        for (let yy = g / 2; yy < S.H; yy += g) for (let xx = g / 2; xx < S.W; xx += g) {
          const d = Math.hypot(xx - mx, yy - my) / S.dpr, w = Math.sin(xx / S.W * 6 + yy / S.H * 3 - S.t * 1.4) * .5 + .5, r = Math.max(0, Math.sin(d / 40 - S.t * 3)) * Math.max(0, 1 - d / 380);
          const k = (.15 + w * .55 + r * .6) * I; x.fillStyle = rgba(a, Math.min(.9, k * .55));
          x.beginPath(); x.arc(xx, yy, S.dpr * (.6 + k * 1.6), 0, 6.283); x.fill();
        }
      }
    }));
  } };

  /* stacked flowing sine lines (silk / sound) */
  R['wave-lines'] = { init(root, o) {
    const I = o.intensity || 1, a = D.rgb('--accent'), b = D.rgb('--accent2');
    return loop(root, (x, S) => ({
      step() {
        x.clearRect(0, 0, S.W, S.H); const n = Math.round(22 * I);
        for (let i = 0; i < n; i++) {
          const f = i / n, c = f < .5 ? a : b; x.strokeStyle = rgba(c, .08 + .22 * Math.sin(f * Math.PI)); x.lineWidth = S.dpr * 1.2; x.beginPath();
          for (let px = 0; px <= S.W; px += 8 * S.dpr) {
            const u = px / S.W, y = S.H * (.62 + (f - .5) * .32) + Math.sin(u * 5 + S.t * .8 + f * 2.2) * S.H * .06 * (1 + f) + Math.sin(u * 13 - S.t * 1.3 + f * 5) * S.H * .012;
            px ? x.lineTo(px, y) : x.moveTo(px, y);
          }
          x.stroke();
        }
      }
    }));
  } };

  /* soft out-of-focus light discs rising slowly */
  R.bokeh = { init(root, o) {
    const I = o.intensity || 1, a = D.rgb('--accent'), b = D.rgb('--accent2');
    return loop(root, (x, S) => { let P = [];
      return {
        resize() { P = Array.from({ length: Math.round(34 * I) }, () => ({ x: Math.random(), y: Math.random(), r: 20 + Math.random() * 90, v: .0004 + Math.random() * .0009, c: Math.random() < .6 ? a : b, al: .05 + Math.random() * .16, ph: Math.random() * 6 })); },
        step() {
          x.clearRect(0, 0, S.W, S.H); x.globalCompositeOperation = 'lighter';
          for (const p of P) {
            p.y -= p.v * S.boost; if (p.y < -.2) { p.y = 1.2; p.x = Math.random(); }
            const px = (p.x + Math.sin(S.t * .3 + p.ph) * .02) * S.W, py = p.y * S.H, r = p.r * S.dpr;
            const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, rgba(p.c, p.al)); g.addColorStop(.7, rgba(p.c, p.al * .6)); g.addColorStop(1, rgba(p.c, 0));
            x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 6.283); x.fill();
          }
          x.globalCompositeOperation = 'source-over';
        }
      }; });
  } };

  /* topographic contour lines slowly breathing */
  R.topo = { init(root, o) {
    const I = o.intensity || 1, a = D.rgb('--accent');
    return loop(root, (x, S) => ({
      step() {
        x.clearRect(0, 0, S.W, S.H); x.lineWidth = S.dpr; const cx = [S.W * .28, S.W * .78], cy = [S.H * .35, S.H * .7], n = Math.round(16 * I);
        for (let k = 0; k < 2; k++) for (let i = 1; i <= n; i++) {
          x.strokeStyle = rgba(a, .05 + .12 * (1 - i / n)); x.beginPath();
          for (let s = 0; s <= 72; s++) {
            const th = s / 72 * 6.283, rr = i * 26 * S.dpr * (1 + .18 * nz(Math.cos(th) * 1.4 + k, Math.sin(th) * 1.4, S.t * .15 + i * .05));
            const px = cx[k] + Math.cos(th) * rr, py = cy[k] + Math.sin(th) * rr * .8; s ? x.lineTo(px, py) : x.moveTo(px, py);
          }
          x.stroke();
        }
      }
    }));
  } };

  /* falling glyph columns, very muted (data / security / AI) */
  R['code-rain'] = { init(root, o) {
    const I = o.intensity || 1, a = D.rgb('--accent'), G = '01アカサタナハマヤラ<>/{}[]=+*#ABCDEF';
    return loop(root, (x, S) => { let cols = [], fs = 16;
      return {
        resize() { fs = 16 * S.dpr; cols = Array.from({ length: Math.ceil(S.W / fs) }, () => ({ y: Math.random() * S.H, v: (.4 + Math.random() * .9) * S.dpr, on: Math.random() < .55 * I })); },
        step() {
          x.clearRect(0, 0, S.W, S.H); x.font = `${fs}px ui-monospace,Consolas,monospace`;
          cols.forEach((c, i) => { if (!c.on) return; c.y += c.v * 1.6 * S.boost; if (c.y > S.H + 20 * fs) c.y = -Math.random() * S.H * .5;
            for (let k = 0; k < 18; k++) { const yy = c.y - k * fs; if (yy < -fs || yy > S.H) continue; x.fillStyle = rgba(a, (k ? .22 : .7) * (1 - k / 18)); x.fillText(G[(i * 7 + k * 13 + (S.t * 8 | 0)) % G.length], i * fs, yy); } });
        }
      }; });
  } };

  /* constellation: still stars, lines appear near the cursor */
  R.constellation = { init(root, o) {
    const I = o.intensity || 1, a = D.rgb('--accent');
    return loop(root, (x, S) => { let P = [];
      return {
        resize() { P = Array.from({ length: Math.round(140 * I) }, () => ({ x: Math.random() * S.W, y: Math.random() * S.H, r: Math.random() * 1.6 + .3, tw: Math.random() * 6 })); },
        step() {
          x.clearRect(0, 0, S.W, S.H); const mx = S.mx * S.W, my = S.my * S.H, L = 170 * S.dpr;
          const near = P.filter(p => Math.hypot(p.x - mx, p.y - my) < L * 1.4);
          x.lineWidth = S.dpr * .8;
          for (let i = 0; i < near.length; i++) for (let j = i + 1; j < near.length; j++) { const d = Math.hypot(near[i].x - near[j].x, near[i].y - near[j].y); if (d < L * .6) { x.strokeStyle = rgba(a, .35 * (1 - d / (L * .6))); x.beginPath(); x.moveTo(near[i].x, near[i].y); x.lineTo(near[j].x, near[j].y); x.stroke(); } }
          for (const p of P) { x.fillStyle = rgba(a, .25 + .45 * (Math.sin(S.t * 1.5 + p.tw) * .5 + .5)); x.beginPath(); x.arc(p.x, p.y, p.r * S.dpr, 0, 6.283); x.fill(); }
        }
      }; });
  } };

  /* CSS-only family (cheapest) */
  R.blobs = css('blobs', 4);              // liquid colour blobs morphing (lava-lamp, soft)
  R.beams = css('beams', 5);              // vertical light beams sweeping slowly (stage / keynote)
  R.orbits = css('orbits', 4);            // concentric rotating rings with satellites (system, ecosystem)
  R['gradient-shift'] = css('gshift', 0); // full-screen gradient slowly rotating hue position
  R['noise-mesh'] = css('nmesh', 3);      // mesh gradient + grain, editorial premium
  R.halftone = css('halftone', 1);        // print-like dot raster fading diagonally

  /* spotlight: dark scene, a soft light follows the cursor and reveals a dot grid */
  R.spotlight = { init(root, o) {
    const w = h('div', { class: 'bgx spot', style: { opacity: Math.min(1, o.intensity || 1) } }); root.append(w);
    const pm = e => { w.style.setProperty('--x', e.clientX + 'px'); w.style.setProperty('--y', e.clientY + 'px'); };
    addEventListener('pointermove', pm, { passive: true });
    return { destroy() { removeEventListener('pointermove', pm); w.remove(); } };
  } };
})();
