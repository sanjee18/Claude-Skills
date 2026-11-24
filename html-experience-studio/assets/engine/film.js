/* film: camera & film scenes. Every frame is computed from time t inside seek(t) – no CSS transitions,
   so scenes can be paused, scrubbed and (later) rendered frame by frame to MP4 (reel-export).
   Page types: flyover · lift-cards · end-card · device-float · particle-form · depth-stack
   Controls while a film page is active: P pause/play · R restart · ←/→ still navigate the deck. */
(function () {
  'use strict';
  const D = window.Deck, R = D.reg.page, h = D.h, rich = D.rich;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;   // cubic in-out
  const eout = t => 1 - Math.pow(1 - t, 3);
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  D.film = { clamp, lerp, sstep, eio, eout, seg };

  /* ---------- clock: rAF, pausable, loopable, seekable ---------- */
  function clock(dur, frame, o) {
    o = o || {}; let t = 0, on = false, raf = 0, last = 0;
    const tick = now => { if (on) { t += Math.min(.05, (now - last) / 1000); if (t >= dur) { if (o.loop) t = t % dur; else { t = dur; on = false; } } } last = now; frame(t); raf = requestAnimationFrame(tick); };
    const key = e => { if (e.metaKey || e.ctrlKey || e.altKey) return; if (e.key === 'p' || e.key === 'P') api.toggle(); else if (e.key === 'r' || e.key === 'R') api.restart(); };
    const api = {
      play() { on = true; last = performance.now(); },
      pause() { on = false; },
      toggle() { on ? api.pause() : api.play(); },
      restart() { t = 0; api.play(); },
      seek(x) { t = clamp(x, 0, dur); frame(t); },
      start() { cancelAnimationFrame(raf); t = 0; if (D.reduced) { t = o.still != null ? o.still : dur; frame(t); return; } api.play(); raf = requestAnimationFrame(tick); addEventListener('keydown', key); },
      stop() { on = false; cancelAnimationFrame(raf); removeEventListener('keydown', key); },
      get t() { return t; },
      get dur() { return dur; }
    };
    return api;
  }
  D.clock = clock;
  const filmPage = (cls, el, dur, frame, o) => {
    const c = clock(dur, frame, o);
    window.__films = window.__films || []; window.__films.push(c);   // reel-export hook: seek every film frame-exact
    return { el: h('div', { class: 'p-film ' + cls }, el), enter: () => c.start(), leave: () => c.stop(), clock: c };
  };
  const title = (p, cls) => p.title && h('h2', { class: 't ' + (cls || 't-l'), 'data-tx': p.enter || D.DEF_TX, html: rich(p.title) });
  const kick = p => p.kicker && h('div', { class: 'kicker', 'data-tx': 'fade-up' }, p.kicker);
  const lead = (p, d) => p.sub && h('p', { class: 'lead', 'data-tx': 'fade-up', 'data-d': d || 300 }, p.sub);
  const card = (it, extra) => h('div', { class: 'fl-card ' + (extra || '') + (it.src ? ' has-img' : '') },
    it.src && h('img', { src: it.src, alt: it.alt || '' }), it.tag && h('small', null, it.tag), it.title && h('b', { html: rich(it.title) }), it.text && h('span', null, it.text));

  /* =====================================================================================
     FLYOVER – one continuous camera over a page that lies on the floor.
     Glide (speed curve, integrated) → rise to overhead → dive into the hero → end title.
     Pieces lift and stand up toward the lens as the camera passes; per-piece depth of field.
     brief: { type:"flyover", hero:{kicker,title,sub,cta,src}, sections:[{title,sub,items:[{title,text,tag,src}]}],
              end:{badge,title,tail}, duration:14.5 }
     ===================================================================================== */
  R.flyover = p => {
    const hero = p.hero || {}, secs = p.sections || [], end = p.end || {};
    const page = h('div', { class: 'fo-page' },
      h('section', { class: 'fo-sec fo-hero' },
        h('div', { class: 'fo-hcopy' }, hero.kicker && h('div', { class: 'kicker' }, hero.kicker), h('div', { class: 'fo-h1', html: rich(hero.title || p.title || '') }), hero.sub && h('p', null, hero.sub), hero.cta && h('span', { class: 'fo-btn fl-lift', 'data-lift': '18' }, hero.cta)),
        hero.src ? h('div', { class: 'fo-hvis fl-lift', 'data-lift': '40' }, h('img', { src: hero.src, alt: '' })) : h('div', { class: 'fo-hvis fo-ph fl-lift', 'data-lift': '40' })),
      secs.map((s, i) => h('section', { class: 'fo-sec' + (s.quote ? ' fo-quote' : '') },
        s.title && h('div', { class: 'fo-h2', html: rich(s.title) }), s.sub && h('p', null, s.sub),
        s.items && h('div', { class: 'fo-grid c' + Math.min(4, s.items.length) }, s.items.map((it, k) => {
          const c = card(it, 'fl-lift'); c.dataset.lift = String(it.lift || (it.src ? 56 : 18 + (k % 2) * 10)); c.dataset.stand = String(it.stand || (it.src ? 34 : 12)); return c;
        })))),
      h('section', { class: 'fo-sec fo-foot' }, h('div', { class: 'fo-h2', html: rich(p.footer || end.title || '') })));
    const world = h('div', { class: 'fo-world' }, page);
    const cam = h('div', { class: 'fo-cam' }, world);
    const endc = h('div', { class: 'fo-end' }, end.badge && h('div', { class: 'fo-badge' }, h('i'), end.badge),
      h('div', { class: 'fo-t1', html: rich(end.title || '') }), end.tail && h('div', { class: 'fo-t2' }, end.tail));
    const root = h('div', { class: 'fo' }, cam, endc);
    const DUR = p.duration || 14.5, W = 1180;
    let L = null; // layout cache
    function measure() {
      const sec = [...page.children]; const lifts = [...page.querySelectorAll('.fl-lift')];
      const H = page.offsetHeight, heroH = sec[0].offsetHeight;
      const y0 = Math.min(heroH * .42, 340), y1 = H - sec[sec.length - 1].offsetHeight * .55;
      // speed curve as share of cruise; integrate numerically, scale so the glide ends at the footer
      const v = t => t < .6 ? lerp(0, .5, eout(t / .6)) : t < 1.25 ? .5 : t < 1.6 ? lerp(.5, 1, sstep(1.25, 1.6, t)) : t < 7.3 ? 1 + .05 * Math.sin(t * 1.1) : lerp(1, .12, eout(seg(t, 7.3, 8.3)));
      const N = 400, T = 8.2, tab = [0]; let acc = 0;
      for (let i = 1; i <= N; i++) { acc += v(T * i / N) * (T / N); tab.push(acc); }
      const pos = t => { const x = clamp(t / T, 0, 1) * N, i = Math.floor(x), f = x - i; return y0 + (y1 - y0) * (lerp(tab[i], tab[Math.min(N, i + 1)], f) / acc); };
      L = { H, heroH, y0, y1, pos, lifts: lifts.map(e => { let y = 0, n = e; while (n && n !== page) { y += n.offsetTop; n = n.offsetParent; } return { e, y: y + e.offsetHeight / 2, lift: +e.dataset.lift || 24, stand: +e.dataset.stand || 0 }; }), secs: sec,
        txt: [...page.querySelectorAll('.fo-h2,.fo-sec>p,.fo-hcopy')].map(e => { let y = 0, n = e; while (n && n !== page) { y += n.offsetTop; n = n.offsetParent; } return { e, y: y + e.offsetHeight / 2 }; }) };
    }
    function frame(t) {
      if (!L) measure();
      const vw = root.clientWidth, vh = root.clientHeight, fit = Math.min(1, vw / (W + 160));
      // --- camera state
      let tilt = 56, camY = L.pos(Math.min(t, 8.2)), dist = lerp(0, 340, eout(seg(t, 0, 8.2))), scale = fit, hide = 0, mask = 0;
      const overS = Math.min(vh * .86 / L.H, vw * .5 / W);
      if (t > 7.75) { // rise: tilt flattens, zoom out (log scale), bottom edge settles above frame bottom
        const r = eio(seg(t, 7.75, 9.25)); tilt = lerp(56, 0, sstep(8.15, 8.95, t)); dist = lerp(340, 0, r);
        scale = Math.exp(lerp(Math.log(fit), Math.log(overS), r)); camY = lerp(camY, L.H / 2, r);
      }
      if (t > 9.25) { scale *= 1 + .035 * seg(t, 9.25, 9.47); }
      if (t > 9.47) { // dive: into the hero, everything below fades
        const d = eio(seg(t, 9.47, 9.97)), heroS = Math.min(vw * .72 / W, vh * .62 / L.heroH);
        scale = Math.exp(lerp(Math.log(overS * 1.035), Math.log(heroS), d)); camY = lerp(L.H / 2, L.heroH / 2, d); hide = d; mask = d;
      }
      if (t > 9.97) { scale *= 1 + .02 * seg(t, 9.97, DUR); }
      const anchor = t > 9.47 ? lerp(.5, .62, eio(seg(t, 9.47, 9.97))) : .5;
      world.style.transform = `translate3d(${vw / 2}px,${vh * anchor}px,${-dist}px) rotateX(${tilt}deg) scale(${scale}) translate(${-W / 2}px,${-camY}px)`;
      // --- secondary sections fade out during the dive; hero card gets rounded/shadowed
      L.secs.forEach((s, i) => { if (i) s.style.opacity = String(1 - hide); });
      L.secs[0].style.borderRadius = lerp(0, 38, mask) / scale + 'px';
      page.style.setProperty('--pg', String(1 - hide));
      // --- pieces: lift + stand up as the camera passes, depth of field by distance from focus row
      const tiltK = tilt / 56;
      L.lifts.forEach(o => {
        const rel = o.y - camY;                       // >0: below focus (near the lens), <0: passed (far)
        const up = sstep(620, 60, rel) * tiltK;         // grows while approaching, stays after passing
        const z = o.lift * up * (1 - hide), a = o.stand * up * (1 - hide);
        let blur = 0;
        if (tiltK > .02) blur = rel > 0 ? Math.min(12, rel * .016) * tiltK : Math.min(4, -rel * .004) * tiltK;
        o.e.style.transform = `translateZ(${z}px) rotateX(${-a}deg)`;
        o.e.style.filter = blur > .25 ? `blur(${blur.toFixed(2)}px)` : 'none';
        o.e.style.boxShadow = `0 ${(4 + .36 * z).toFixed(1)}px ${(7 + .5 * z).toFixed(1)}px rgba(10,14,24,${(.1 + .16 * up).toFixed(3)})`;
      });
      // page-level DoF for text rows (cheap: whole section blur by distance)
      // text rows get DoF too (never filter a preserve-3d parent – that would flatten the lifted pieces)
      L.txt.forEach(o => { const rel = o.y - camY; const b = tiltK > .02 ? (rel > 0 ? Math.min(8, rel * .01) : Math.min(3, -rel * .003)) * tiltK : 0; o.e.style.filter = b > .3 ? `blur(${b.toFixed(2)}px)` : 'none'; });
      // --- end title: badge, line 1 word by word, italic tail
      const et = t - 10.02;
      endc.style.opacity = et > 0 ? '1' : '0';
      const words = endc.querySelectorAll('.fw'), badge = endc.querySelector('.fo-badge');
      if (badge) { const q = eout(seg(t, 10.02, 10.4)); badge.style.opacity = q; badge.style.transform = `translateY(${(1 - q) * 8}px)`; }
      words.forEach(w => { const s0 = +w.dataset.s, q = eout(seg(t, s0, s0 + .34)); w.style.opacity = q; w.style.transform = `translateY(${(1 - q) * 16}px)`; w.style.filter = `blur(${((1 - q) * 12).toFixed(1)}px)`; });
    }
    // split end title into timed words
    const prep = () => {
      const spl = (el, t0, step) => { if (!el) return; const html = el.innerHTML; const tmp = h('div', { html }); let i = 0; const out = [];
        (function walk(n, wrap) { [...n.childNodes].forEach(c => { if (c.nodeType === 3) c.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) { out.push(' '); return; } out.push(`<span class="fw" data-s="${(t0 + step * i++).toFixed(3)}">${wrap ? wrap.replace('$', D.esc(w)) : D.esc(w)}</span>`); }); else if (c.nodeType === 1 && c.tagName === 'BR') out.push('<br>'); else if (c.nodeType === 1) walk(c, `<span class="${c.className}">$</span>`); }); })(tmp, null);
        el.innerHTML = out.join(''); };
      spl(endc.querySelector('.fo-t1'), 10.12, .06); spl(endc.querySelector('.fo-t2'), 10.36, .05);
    };
    prep();
    const fp = filmPage('fo-film', root, DUR, frame, { still: 11 });
    const enter0 = fp.enter; fp.enter = st => { L = null; requestAnimationFrame(() => { measure(); enter0(st); }); };
    addEventListener('resize', () => { L = null; });
    return fp;
  };

  /* =====================================================================================
     LIFT-CARDS – cards lie on a tilted floor and stand up toward the lens one by one.
     brief: { type:"lift-cards", kicker,title,sub, items:[{title,text,tag,src}] }
     ===================================================================================== */
  R['lift-cards'] = p => {
    const items = p.items || [];
    const floor = h('div', { class: 'lc-floor' }, items.map(it => card(it, 'lc-card')));
    const root = h('div', { class: 'lc' }, h('div', { class: 'lc-copy' }, kick(p), title(p, 't-l'), lead(p)), h('div', { class: 'lc-cam' }, floor));
    const cards = () => [...floor.children];
    const DUR = Math.max(6, 2.2 + items.length * .45 + 3);
    return filmPage('lc-film', root, DUR, t => {
      const tilt = lerp(62, 48, eout(seg(t, 0, DUR * .6)));
      floor.style.transform = `rotateX(${tilt}deg) translateY(${lerp(40, 0, eout(seg(t, 0, 2)))}px)`;
      cards().forEach((c, i) => {
        const q = eout(seg(t, .8 + i * .45, 1.7 + i * .45)), z = 46 * q, a = (tilt - 12) * q;
        c.style.transform = `translateZ(${z}px) rotateX(${-a}deg)`;
        c.style.filter = `blur(${((1 - q) * 3).toFixed(2)}px)`;
        c.style.boxShadow = `0 ${(4 + .36 * z).toFixed(1)}px ${(7 + .5 * z).toFixed(1)}px rgba(10,14,24,${(.12 + .2 * q).toFixed(3)})`;
      });
    }, { still: 99 });
  };

  /* =====================================================================================
     END-CARD – a hero card lands under a two-line title (statement + italic tail).
     brief: { type:"end-card", badge, title, tail, src (image for the card) | html }
     ===================================================================================== */
  R['end-card'] = p => {
    const cardEl = h('div', { class: 'ec-card' }, p.src ? h('img', { src: p.src, alt: p.alt || '' }) : h('div', { class: 'ec-ph', html: p.html || '' }));
    const t1 = h('div', { class: 'ec-t1', html: rich(p.title || '') }), t2 = p.tail && h('div', { class: 'ec-t2' }, p.tail);
    const badge = p.badge && h('div', { class: 'fo-badge' }, h('i'), p.badge);
    const orbs = [0, 1, 2, 3].map(i => h('i', { class: 'ec-orb o' + i }));
    const root = h('div', { class: 'ec' }, orbs, h('div', { class: 'ec-head' }, badge, t1, t2), cardEl);
    const wordify = (el, t0, st) => { if (!el) return []; const ws = D.split(el, 'words'); ws.forEach((w, i) => { w.dataset.s = t0 + st * i; w.parentElement.style.overflow = 'visible'; }); return ws; };
    let W1 = null, W2 = null;
    const DUR = 6.5;
    const fp = filmPage('ec-film', root, DUR, t => {
      if (!W1) { W1 = wordify(t1, .55, .06); W2 = wordify(t2, .55 + .06 * (t1.textContent.split(/\s+/).length) + .1, .05); }
      const d = eio(seg(t, 0, 1.1));
      cardEl.style.transform = `perspective(1400px) translateY(${lerp(38, 0, d)}vh) rotateX(${lerp(38, 0, d)}deg) scale(${lerp(1.18, 1, d) * (1 + .02 * seg(t, 1.1, DUR))})`;
      cardEl.style.filter = `blur(${((1 - d) * 8).toFixed(2)}px)`;
      if (badge) { const q = eout(seg(t, .45, .85)); badge.style.opacity = q; badge.style.transform = `translateY(${(1 - q) * 8}px)`; }
      [...W1, ...W2].forEach(w => { const q = eout(seg(t, +w.dataset.s, +w.dataset.s + .34)); w.style.opacity = q; w.style.transform = `translateY(${(1 - q) * 16}px)`; w.style.filter = `blur(${((1 - q) * 12).toFixed(1)}px)`; });
      orbs.forEach((o, i) => { const q = eout(seg(t, .2 + i * .1, 1.4 + i * .1)); o.style.opacity = q * (i > 1 ? .55 : 1); o.style.transform = `translate(${Math.sin(t * .5 + i) * 6}px,${Math.cos(t * .4 + i) * 5 + (1 - q) * 30}px)`; });
    }, { still: DUR });
    return fp;
  };

  /* =====================================================================================
     DEVICE-FLOAT – a phone with real thickness floats up, turns gently; chips sit at depth.
     brief: { type:"device-float", kicker,title,sub, src (screen image) | html (screen markup), chips:["…"] }
     ===================================================================================== */
  R['device-float'] = p => {
    const scr = p.src ? h('img', { src: p.src, alt: p.alt || '' }) : h('div', { class: 'df-html', html: p.html || '' });
    const phone = h('div', { class: 'df-phone' }, h('div', { class: 'df-side l' }), h('div', { class: 'df-side r' }), h('div', { class: 'df-back' }), h('div', { class: 'df-front' }, h('div', { class: 'df-scr' }, scr)));
    const chips = (p.chips || []).map((c, i) => h('div', { class: 'df-chip', 'data-i': i }, c));
    const root = h('div', { class: 'df' }, h('div', { class: 'df-copy' }, kick(p), title(p, 't-l'), lead(p)), h('div', { class: 'df-cam' }, phone, chips));
    const pos = [[-1.05, -.55, 80], [1.0, -.25, 140], [-.95, .45, -60], [1.05, .6, 40], [.1, -1.05, -120]];
    return filmPage('df-film', root, 9, t => {
      const q = eout(seg(t, 0, 1.6));
      phone.style.transform = `translateY(${lerp(140, 0, q) + Math.sin(t * 1.1) * 6}px) rotateX(${lerp(42, 6, q)}deg) rotateY(${lerp(-38, 0, q) + Math.sin(t * .55) * 14}deg) rotateZ(${lerp(-8, 0, q)}deg)`;
      phone.style.filter = `blur(${((1 - q) * 6).toFixed(2)}px)`;
      chips.forEach((c, i) => {
        const [x, y, z] = pos[i % pos.length], k = eout(seg(t, .9 + i * .18, 1.8 + i * .18));
        const blur = Math.abs(z) > 90 ? Math.abs(z) / 60 : 0;
        c.style.opacity = k; c.style.transform = `translate(-50%,-50%) translate3d(${x * 210}px,${y * 230 + Math.sin(t * .9 + i) * 8 + (1 - k) * 40}px,${z}px) rotateY(${Math.sin(t * .55) * 10}deg)`;
        c.style.filter = blur ? `blur(${blur.toFixed(1)}px)` : 'none';
      });
    }, { loop: true, still: 3 });
  };

  /* =====================================================================================
     PARTICLE-FORM – thousands of points drift, then pull into a word or number, hold, scatter.
     brief: { type:"particle-form", text:"42%" , kicker,title,sub }
     ===================================================================================== */
  R['particle-form'] = p => {
    const cv = h('canvas', { class: 'pf-cv', 'aria-hidden': 'true' });
    const root = h('div', { class: 'pf' }, cv, h('div', { class: 'pf-copy' }, kick(p), title(p, 't-m'), lead(p)), h('span', { class: 'sr-only' }, p.text || ''));
    let P = null, W = 0, H = 0, dpr = 1;
    function setup() {
      dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr;
      const o = document.createElement('canvas'), s = Math.min(W * .9, H * 1.6); o.width = W; o.height = H; const g = o.getContext('2d');
      g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = `600 ${Math.round(s / Math.max(2.2, String(p.text || '').length * .62))}px ${getComputedStyle(root).getPropertyValue('--font-d') || 'sans-serif'}`;
      g.fillText(p.text || '', W / 2, H * .44);
      const d = g.getImageData(0, 0, W, H).data, tg = [], step = Math.max(3, Math.round(Math.sqrt(W * H / 22000)));
      for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (d[(y * W + x) * 4 + 3] > 128) tg.push([x, y]);
      P = tg.map(([x, y], i) => ({ tx: x, ty: y, sx: Math.random() * W, sy: Math.random() * H, ph: Math.random() * 6.28, d: Math.random() * .5 }));
    }
    const col = () => { const [r, g, b] = D.rgb('--accent'); return `rgb(${r},${g},${b})`; };
    return filmPage('pf-film', root, 8, t => {
      if (!cv.clientWidth || !cv.clientHeight) return;   // stage hidden: nothing to draw
      if (!P || cv.clientWidth !== W) setup();
      const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H); c.fillStyle = col();
      P.forEach(q => {
        const k = eio(seg(t, .6 + q.d, 2.6 + q.d)) * (1 - eio(seg(t, 6.4 + q.d * .6, 7.8)));
        const jx = Math.sin(t * 1.3 + q.ph) * 14 * (1 - k), jy = Math.cos(t * 1.1 + q.ph) * 14 * (1 - k);
        const x = lerp(q.sx + jx, q.tx, k), y = lerp(q.sy + jy, q.ty, k);
        c.globalAlpha = .3 + .7 * k; c.fillRect(x, y, 2.2, 2.2);
      });
    }, { loop: true, still: 4 });
  };

  /* =====================================================================================
     DEPTH-STACK – architecture layers float apart in 3D, labels draw in, then settle.
     brief: { type:"depth-stack", kicker,title,sub, items:[{title,text}] (3–5, top first) }
     ===================================================================================== */
  R['depth-stack'] = p => {
    const items = (p.items || []).slice(0, 5);
    const layers = items.map((it, i) => h('div', { class: 'ds-layer', style: { '--i': i } }, h('i')));
    const labels = items.map((it, i) => h('div', { class: 'ds-label' }, h('b', { html: rich(it.title || '') }), it.text && h('span', null, it.text)));
    const root = h('div', { class: 'ds' }, h('div', { class: 'ds-copy' }, kick(p), title(p, 't-l'), lead(p)),
      h('div', { class: 'ds-cam' }, h('div', { class: 'ds-stack' }, layers)), h('div', { class: 'ds-labels' }, labels));
    const n = items.length;
    return filmPage('ds-film', root, 7, t => {
      layers.forEach((l, i) => {
        const k = eout(seg(t, .3 + (n - 1 - i) * .14, 1.5 + (n - 1 - i) * .14));
        const gap = 78 * k, z = ((n - 1) / 2 - i) * gap;
        l.style.transform = `translateZ(${z + Math.sin(t * .8 + i) * 3}px)`;
        l.style.opacity = String(.25 + .75 * k);
      });
      labels.forEach((b, i) => { const k = eout(seg(t, 1.3 + i * .16, 2 + i * .16)); b.style.opacity = k; b.style.transform = `translateX(${(1 - k) * 14}px)`; });
    }, { still: 7 });
  };
})();
