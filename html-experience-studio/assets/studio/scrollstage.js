/* ScrollStage · the scroll-driven stage (pear.no-class pattern). No dependencies, no build step.
   Idea: ONE pinned viewport (position:fixed) + a tall invisible runway. Scrolling only moves one number, p (0..1),
   smoothed with inertia. EVERYTHING (WebGL film, headline beats, hairlines, carousels, forms) is a pure function of p.
   Design is authored on a fixed ARTBOARD (e.g. 1440x900) that is uniformly scaled to the viewport (var --k), so
   type, lines and 3D offsets keep their exact proportions on every screen. Portrait gets its own artboard.

   <div class="stage"><div class="artboard"> ...absolute children in artboard pixels... </div></div>
   ScrollStage.init({ runway: 9, tau: .14, artboard: [1440, 900], portrait: [720, 1100],
                      chapters: [{ id: 'model', at: .02 }, ...], onFrame: (p, dt, st) => {} })

   ScrollStage.p        smoothed progress     .raw  target (scroll position)      .v  velocity (p / s)
   ScrollStage.range(a, b, p?, ease?)   0..1 inside [a,b]       ScrollStage.vis(p, a, b, fin, fout)   trapezoid 0..1..0
   ScrollStage.set(p)   jump (tests, ?p=0.42 in the URL does the same)    ScrollStage.to(idOrP, {dur})  eased scroll
   ScrollStage.split(el, 'chars'|'words'|'lines')  -> spans for masked / per-letter reveals (a11y label is kept)
   ScrollStage.draw(pathEl, t)   stroke-draw 0..1       ScrollStage.mix / clamp / ease.* */
(function () {
  'use strict';
  const S = (window.ScrollStage = window.ScrollStage || {});
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const E = (S.ease = {
    linear: t => t, outCubic: t => 1 - Math.pow(1 - t, 3), inOutCubic: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outQuart: t => 1 - Math.pow(1 - t, 4), inOutQuart: t => (t < .5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
    outExpo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)), inOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
    outBack: t => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2), inExpo: t => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10))
  });
  S.clamp = clamp; S.mix = (a, b, t) => a + (b - a) * t;
  S.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  S.p = 0; S.raw = 0; S.v = 0;
  const ef = e => (typeof e === 'function' ? e : E[e]);
  S.range = (a, b, p, e) => { const t = clamp(((p === undefined ? S.p : p) - a) / (b - a)); return e ? ef(e)(t) : t; };
  S.vis = (p, a, b, fin = .02, fout = .02, e = 'inOutSine') => E[e](clamp((p - a) / fin)) * E[e](clamp((b - p) / fout));
  S.draw = (el, t) => { if (!el) return; const L = el._L || (el._L = el.getTotalLength ? el.getTotalLength() : 1); el.style.strokeDasharray = L; el.style.strokeDashoffset = L * (1 - clamp(t)); };

  let cfg = {}, max = 1, last = 0, started = false; const hooks = [];
  S.onFrame = f => hooks.push(f);
  const measure = () => {
    const portrait = cfg.portrait && innerWidth / innerHeight < .9;
    const [aw, ah] = portrait ? cfg.portrait : cfg.artboard, r = document.documentElement;
    r.style.setProperty('--aw', aw + 'px'); r.style.setProperty('--ah', ah + 'px'); r.style.setProperty('--k', Math.min(innerWidth / aw, innerHeight / ah));
    r.dataset.orient = portrait ? 'portrait' : 'landscape';
    max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  };
  const scrollY = () => window.scrollY || document.documentElement.scrollTop || 0;
  S.set = p => { window.scrollTo(0, clamp(p) * max); S.raw = S.p = clamp(p); S.v = 0; tick(performance.now(), true); };
  S.to = (x, o = {}) => {
    const c = cfg.chapters.find(c => c.id === x), tp = clamp(c ? c.at : x), y0 = scrollY(), y1 = tp * max;
    if (S.reduced || o.dur === 0) return window.scrollTo(0, y1);
    const dur = (o.dur || Math.min(3.2, .8 + Math.abs(tp - S.raw) * 9)) * 1000, t0 = performance.now(); S._to = true;
    const step = n => { const t = clamp((n - t0) / dur); window.scrollTo(0, y0 + (y1 - y0) * E.inOutCubic(t)); if (t < 1 && S._to) requestAnimationFrame(step); else S._to = false; };
    requestAnimationFrame(step);
  };
  /* autoplay for previews / kiosk loops: scrolls the runway by itself, jumps back to 0 after `sec` seconds */
  S.auto = (sec, onWrap) => { let t0 = null; const f = n => { if (t0 === null) t0 = n; const u = (n - t0) / 1000 / sec;
    if (u >= 1) { t0 = n; S.set(0); if (onWrap) onWrap(); } else window.scrollTo(0, u * max); requestAnimationFrame(f); }; requestAnimationFrame(f); };
  ['wheel', 'touchstart', 'keydown'].forEach(n => addEventListener(n, () => { S._to = false; }, { passive: true }));

  function tick(now, once) {
    const dt = Math.min(.05, Math.max(.001, (now - last) / 1000)); last = now;
    S.raw = clamp(scrollY() / max);
    const prev = S.p;
    S.p = S.reduced ? S.raw : (Math.abs(S.raw - S.p) < 1e-5 ? S.raw : S.p + (S.raw - S.p) * (1 - Math.exp(-dt / (cfg.tau || .14))));
    S.v = (S.p - prev) / dt;
    const cs = cfg.chapters || []; let cur = null; cs.forEach(c => { if (S.p + .004 >= c.at) cur = c; });
    if (cur && document.documentElement.dataset.chapter !== cur.id) {
      document.documentElement.dataset.chapter = cur.id;
      document.querySelectorAll('[data-at]').forEach(a => { const on = a.getAttribute('href') === '#' + cur.id; a.classList.toggle('on', on); on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'); });
    }
    if (cfg.onFrame) cfg.onFrame(S.p, dt, S);
    hooks.forEach(f => f(S.p, dt, S));
    if (!once) requestAnimationFrame(tick);
  }

  S.init = o => {
    cfg = Object.assign({ runway: 9, tau: .14, artboard: [1440, 900], portrait: null, chapters: [] }, o);
    if (!document.querySelector('.runway')) { const r = document.createElement('div'); r.className = 'runway'; r.setAttribute('aria-hidden', 'true'); document.body.append(r); }
    document.querySelector('.runway').style.height = cfg.runway * 100 + 'vh';
    measure(); addEventListener('resize', () => { measure(); S.split.refresh(); });
    document.querySelectorAll('[data-at]').forEach(a => a.addEventListener('click', e => { const id = (a.getAttribute('href') || '').slice(1), c = cfg.chapters.find(c => c.id === id); if (c) { e.preventDefault(); S.to(c.id); } }));
    const q = new URLSearchParams(location.search + '&' + location.hash.slice(1)).get('p');
    const go = () => { measure(); if (q !== null && q !== '') S.set(parseFloat(q)); else { S.raw = S.p = clamp(scrollY() / max); } if (!started) { started = true; last = performance.now(); requestAnimationFrame(tick); } };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => { S.split.refresh(); go(); document.documentElement.classList.add('ready'); window.__stageReady = true; });
  };

  /* text split: 'chars' -> .wd > .ch[data-c]   'words' -> .wd   'lines' -> .ln > i  (measured wrapping, re-measured on resize) */
  const reg = new Set();
  S.split = (el, mode) => {
    if (!el.dataset.t) el.dataset.t = el.textContent.replace(/\s+/g, ' ').trim();
    el.dataset.mode = mode; reg.add(el); build(el); return mode === 'chars' ? [...el.querySelectorAll('.ch')] : mode === 'lines' ? [...el.querySelectorAll('.ln > i')] : [...el.querySelectorAll('.wd')];
  };
  S.split.refresh = () => reg.forEach(build);
  function build(el) {
    const words = el.dataset.t.split(' '), mode = el.dataset.mode; el.setAttribute('aria-label', el.dataset.t); el.innerHTML = '';
    const mk = w => { const s = document.createElement('span'); s.className = 'wd'; s.setAttribute('aria-hidden', 'true');
      if (mode === 'chars') [...w].forEach(c => { const k = document.createElement('span'); k.className = 'ch'; k.dataset.c = c; k.textContent = c; s.append(k); }); else s.textContent = w; return s; };
    if (mode !== 'lines') { words.forEach((w, i) => { el.append(mk(w)); if (i < words.length - 1) el.append(' '); }); return; }
    const spans = words.map(w => { const s = mk(w); el.append(s, ' '); return s; });
    const rows = []; spans.forEach(s => { const y = Math.round(s.offsetTop / 4); const r = rows[rows.length - 1]; if (r && r.y === y) r.w.push(s.textContent); else rows.push({ y, w: [s.textContent] }); });
    el.innerHTML = ''; rows.forEach(r => { const l = document.createElement('span'), i = document.createElement('i'); l.className = 'ln'; l.setAttribute('aria-hidden', 'true'); i.textContent = r.w.join(' '); l.append(i); el.append(l); });
  }
})();
