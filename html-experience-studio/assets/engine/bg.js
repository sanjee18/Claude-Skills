/* backgrounds: network · stars · aurora · grid · none.  init(root,{intensity}) -> {destroy, boost?} */
(function () {
  'use strict';
  const D = window.Deck, R = D.reg.bg, h = D.h;
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  function canvasLoop(root, setup) {
    const c = h('canvas'); root.append(c);
    const x = c.getContext('2d');
    const S = { W: 0, H: 0, dpr: 1, boost: 1 };
    let raf = 0, alive = true;
    const api = setup(x, S, c);
    function size() {
      S.dpr = Math.min(devicePixelRatio || 1, 2);
      S.W = c.width = Math.round(innerWidth * S.dpr); S.H = c.height = Math.round(innerHeight * S.dpr);
      c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
      api.resize && api.resize();
    }
    function frame() { if (!alive) return; api.step(); raf = requestAnimationFrame(frame); }
    size(); addEventListener('resize', size);
    if (D.reduced) api.step(); else frame();
    return {
      destroy() { alive = false; cancelAnimationFrame(raf); removeEventListener('resize', size); c.remove(); },
      boost(v) { S.boost = v || 6; }
    };
  }

  R.none = { init() { return { destroy() {} }; } };

  // drifting data network with light packets travelling along links
  R.network = {
    init(root, o) {
      const I = o.intensity || 1, col = D.rgb('--accent'), col2 = D.rgb('--accent2', '#2f7bff');
      return canvasLoop(root, (x, S) => {
        let nodes = [], pk = [];
        return {
          resize() {
            const n = Math.round(Math.min(90, innerWidth * innerHeight / 16000) * I);
            nodes = Array.from({ length: n }, () => ({
              x: Math.random() * S.W, y: Math.random() * S.H,
              vx: (Math.random() - .5) * .28 * S.dpr, vy: (Math.random() - .5) * .28 * S.dpr, r: (1 + Math.random() * 1.4) * S.dpr
            }));
          },
          step() {
            x.clearRect(0, 0, S.W, S.H);
            S.boost += (1 - S.boost) * .04;
            for (const n of nodes) {
              n.x += n.vx * S.boost; n.y += n.vy * S.boost;
              if (n.x < 0 || n.x > S.W) n.vx *= -1;
              if (n.y < 0 || n.y > S.H) n.vy *= -1;
            }
            const L = (150 * S.dpr) ** 2;
            x.lineWidth = S.dpr;
            for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
              const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, d = dx * dx + dy * dy;
              if (d < L) {
                x.strokeStyle = rgba(col, (1 - d / L) * .22 * I);
                x.beginPath(); x.moveTo(nodes[i].x, nodes[i].y); x.lineTo(nodes[j].x, nodes[j].y); x.stroke();
                if (!D.reduced && pk.length < 22 && Math.random() < .0006 * I) pk.push({ a: nodes[i], b: nodes[j], t: 0 });
              }
            }
            x.fillStyle = rgba(col, .55);
            for (const n of nodes) { x.beginPath(); x.arc(n.x, n.y, n.r, 0, 6.283); x.fill(); }
            pk = pk.filter(p => (p.t += .012 * S.boost) < 1);
            for (const p of pk) {
              const px = p.a.x + (p.b.x - p.a.x) * p.t, py = p.a.y + (p.b.y - p.a.y) * p.t;
              const g = x.createRadialGradient(px, py, 0, px, py, 9 * S.dpr);
              g.addColorStop(0, rgba(col2, .9)); g.addColorStop(1, rgba(col2, 0));
              x.fillStyle = g; x.beginPath(); x.arc(px, py, 9 * S.dpr, 0, 6.283); x.fill();
            }
          }
        };
      });
    }
  };

  // star field flying towards the viewer; boost() = hyperspace
  R.stars = {
    init(root, o) {
      const I = o.intensity || 1, col = D.rgb('--accent');
      return canvasLoop(root, (x, S) => {
        let st = [];
        return {
          resize() { st = Array.from({ length: Math.round(260 * I) }, () => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() })); },
          step() {
            x.clearRect(0, 0, S.W, S.H);
            S.boost += (1 - S.boost) * .035;
            const cx = S.W / 2, cy = S.H / 2, k = Math.max(S.W, S.H) * .55;
            x.lineCap = 'round';
            for (const s of st) {
              const pz = s.z; s.z -= .0022 * S.boost; if (s.z <= .02) { s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; s.z = 1; continue; }
              const sx = cx + s.x / s.z * k * .5, sy = cy + s.y / s.z * k * .5, a = Math.min(1, (1 - s.z) * 1.6) * .8;
              x.strokeStyle = rgba(col, a); x.fillStyle = rgba(col, a);
              if (S.boost > 1.6) {
                const px = cx + s.x / pz * k * .5, py = cy + s.y / pz * k * .5;
                x.lineWidth = S.dpr * (1 + (1 - s.z) * 1.6); x.beginPath(); x.moveTo(px, py); x.lineTo(sx, sy); x.stroke();
              } else { x.beginPath(); x.arc(sx, sy, S.dpr * (.5 + (1 - s.z) * 1.4), 0, 6.283); x.fill(); }
            }
          }
        };
      });
    }
  };

  // soft drifting colour fields (CSS only, cheapest)
  R.aurora = {
    init(root, o) {
      const w = h('div', { class: 'aurora', style: { opacity: Math.min(1, .75 * (o.intensity || 1)) } }, h('i'), h('i'), h('i'));
      root.append(w);
      return { destroy() { w.remove(); } };
    }
  };

  // perspective grid floor (retro-tech, CSS only)
  R.grid = {
    init(root, o) {
      const w = h('div', { class: 'gridfloor', style: { opacity: Math.min(1, .8 * (o.intensity || 1)) } }, h('div', { class: 'glow' }), h('i'));
      root.append(w);
      return { destroy() { w.remove(); } };
    }
  };
})();
