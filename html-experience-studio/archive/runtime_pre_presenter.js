/* Studio runtime · infrastructure for bespoke single-file keynotes (three.js r147, no build step).
   It does NOT design anything. It gives every project the same reliable plumbing so the project code can spend all of
   its effort on the bespoke world, the choreography and the content visuals:
     - one persistent three.js world (renderer, camera, optional bloom) that lives across all scenes
     - a camera rail: every scene is a SHOT (pos/look/fov); transitions fly along optional waypoints (a real camera move)
     - scene lifecycle hooks (setup / enter / leave / update) for choreography
     - DOM sections per scene with staged reveals ([data-in], [data-count], [data-draw])
     - 3D-anchored HTML labels, asset access that works bundled (offline) and unbundled (dev server)
     - navigation: keys, wheel, swipe, hash, overview (M), rail, fullscreen (F), reduced motion
   API: Studio.init(cfg) · Studio.go(idOrIndex) · next() · prev() · idle() · asset(path) · loadGLB(path) · texture(path)
        Studio.tween({dur, ease, update}) · Studio.anchor(el, vec3OrObject) · Studio.ease · Studio.ctx
   See references/studio-build.md for the contract and references/studio-recipes.md for techniques. */
(function () {
  'use strict';
  const S = (window.Studio = window.Studio || {});
  const $ = (q, r) => (r || document).querySelector(q), $$ = (q, r) => [...(r || document).querySelectorAll(q)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  S.reduced = reduced;

  /* ---------------- easing + tweens (driven by the main loop) ---------------- */
  const E = (S.ease = {
    linear: t => t,
    inOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
    outCubic: t => 1 - Math.pow(1 - t, 3),
    inOutCubic: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outQuart: t => 1 - Math.pow(1 - t, 4),
    inOutQuart: t => (t < .5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
    outExpo: t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inOutExpo: t => (t === 0 ? 0 : t === 1 ? 1 : t < .5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
    // cinematic: slow start, long glide, soft landing (default camera ease)
    cine: t => (t < .5 ? 16 * Math.pow(t, 5) : 1 - Math.pow(-2 * t + 2, 5) / 2) * .55 + (-(Math.cos(Math.PI * t) - 1) / 2) * .45
  });
  const tweens = new Set();
  S.tween = o => new Promise(res => {
    const tw = { t0: performance.now() + (o.delay || 0) * 1000, dur: reduced ? 1 : Math.max(1, (o.dur || 1) * 1000), ease: E[o.ease] || o.ease || E.inOutCubic, update: o.update || (() => {}), res, done: false };
    tw.cancel = () => { tw.done = true; tweens.delete(tw); res(false); };
    tweens.add(tw);
    if (o.signal) o.signal.cancel = tw.cancel;
  });
  function stepTweens(now) {
    for (const tw of tweens) {
      if (now < tw.t0) continue;
      const k = Math.min(1, (now - tw.t0) / tw.dur);
      tw.update(tw.ease(k), k);
      if (k >= 1) { tweens.delete(tw); tw.res(true); }
    }
  }
  S.wait = s => new Promise(r => setTimeout(r, reduced ? 0 : s * 1000));
  S.lerp = (a, b, t) => a + (b - a) * t;
  S.clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------------- assets (bundled: window.__ASSETS, dev: plain path) ---------------- */
  S.asset = p => (window.__ASSETS && window.__ASSETS[p]) || p;
  async function bytes(p) {
    const src = S.asset(p);
    if (src.startsWith('gz:')) {                       // bundler: gzip + base64 (GLB, big JSON)
      const bin = Uint8Array.from(atob(src.slice(3)), c => c.charCodeAt(0));
      const ds = new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip')));
      return ds.arrayBuffer();
    }
    return (await fetch(src)).arrayBuffer();
  }
  S.bytes = bytes;
  S.json = async p => JSON.parse(new TextDecoder().decode(await bytes(p)));
  S.loadGLB = async p => {
    const T = window.THREE, loader = new T.GLTFLoader();
    if (window.MeshoptDecoder) loader.setMeshoptDecoder(window.MeshoptDecoder);
    const buf = await bytes(p);
    return new Promise((res, rej) => loader.parse(buf, '', res, rej));
  };
  S.texture = (p, o) => {
    const T = window.THREE, tx = new T.TextureLoader().load(S.asset(p), o && o.onLoad);
    tx.encoding = T.sRGBEncoding; tx.anisotropy = 8;
    return tx;
  };

  /* ---------------- 3D-anchored HTML labels ---------------- */
  const anchors = new Set();
  S.anchor = (el, target, opt) => {
    const a = Object.assign({ el, target, dx: 0, dy: 0, hideBehind: true }, opt || {});
    anchors.add(a);
    return () => anchors.delete(a);
  };
  const _v = { x: 0, y: 0, z: 0 };
  function stepAnchors() {
    if (!S.ctx || !S.ctx.camera || !anchors.size) return;
    const T = window.THREE, cam = S.ctx.camera, v = (S._av = S._av || new T.Vector3());
    for (const a of anchors) {
      if (a.target.isObject3D) a.target.getWorldPosition(v); else v.set(a.target.x, a.target.y, a.target.z);
      v.project(cam);
      const vis = !(a.hideBehind && v.z > 1);
      a.el.style.transform = `translate(${((v.x + 1) / 2) * innerWidth + a.dx}px,${((1 - v.y) / 2) * innerHeight + a.dy}px)`;
      a.el.style.visibility = vis ? '' : 'hidden';
    }
  }

  /* ---------------- DOM reveals ---------------- */
  function countUp(el) {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), pre = el.dataset.pre || '', suf = el.dataset.suf || '';
    const loc = document.documentElement.lang || undefined;
    const fmt = v => pre + v.toLocaleString(loc, { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
    S.tween({ dur: +(el.dataset.dur || 2.2), ease: 'outExpo', delay: +(el.dataset.delay || .25), update: e => { el.textContent = fmt(to * e); } });
  }
  function drawIn(svg) {
    $$('path,line,polyline,circle,rect,ellipse', svg).forEach((p, i) => {
      if (!p.getTotalLength) return;
      const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
      S.tween({ dur: +(svg.dataset.dur || 1.8), ease: 'inOutCubic', delay: +(svg.dataset.delay || .3) + i * +(svg.dataset.stagger || .04),
        update: e => { p.style.strokeDashoffset = L * (1 - e); } });
    });
  }
  function reveal(sec, on) {
    sec.classList.toggle('on', on);
    if (!on) return;
    $$('[data-in]', sec).forEach(el => { el.style.transitionDelay = (reduced ? 0 : (+el.dataset.in || 0) * 0.11 + 0.05) + 's'; });
    $$('[data-count]', sec).forEach(countUp);
    $$('svg[data-draw]', sec).forEach(drawIn);
  }

  /* ---------------- core ---------------- */
  let cfg, scenes = [], cur = -1, busy = false, queued = null, idleRes = [], world = null;
  const frameFns = new Set();
  S.onFrame = fn => { frameFns.add(fn); return () => frameFns.delete(fn); };
  S.idle = () => (busy ? new Promise(r => idleRes.push(r)) : Promise.resolve());
  S.index = () => cur;
  S.scenes = () => scenes.map(s => s.id);

  function setupWorld() {
    const T = window.THREE; if (!T || cfg.three === false) return null;
    const canvas = $('#studio-gl') || document.body.insertBefore(Object.assign(document.createElement('canvas'), { id: 'studio-gl' }), document.body.firstChild);
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, cfg.maxDpr || 1.75));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = cfg.toneMapping === 'none' ? T.NoToneMapping : T.ACESFilmicToneMapping; renderer.toneMappingExposure = cfg.exposure || 1;
    const scene = new T.Scene(); scene.background = new T.Color(cfg.background || '#05070a');
    if (cfg.fog) scene.fog = new T.FogExp2(cfg.fog.color || cfg.background || '#05070a', cfg.fog.density || .02);
    const camera = new T.PerspectiveCamera(40, innerWidth / innerHeight, cfg.near || .05, cfg.far || 2000);
    let composer = null, bloom = null;
    if (cfg.bloom && T.EffectComposer) {
      composer = new T.EffectComposer(renderer);
      composer.addPass(new T.RenderPass(scene, camera));
      bloom = new T.UnrealBloomPass(new T.Vector2(innerWidth, innerHeight), cfg.bloom.strength ?? .6, cfg.bloom.radius ?? .5, cfg.bloom.threshold ?? .82);
      composer.addPass(bloom);
    }
    return { THREE: T, renderer, scene, camera, composer, bloom, look: new T.Vector3(), canvas };
  }

  /* camera rail */
  const camState = { pos: null, look: null, fov: 40, roll: 0 }; let arrived = 0, pushed = null;
  function shotOf(sc) {
    if (!sc.shot) return null;
    if (innerWidth < 760) return sc.mobile ? Object.assign({}, sc.shot, sc.mobile) : Object.assign({}, sc.shot, { fov: Math.min(75, (sc.shot.fov || 40) * (cfg.mobileFov || 1.4)) });
    return sc.shot;
  }
  function applyCam() {
    if (!world || !camState.pos) return;
    const T = world.THREE, c = world.camera, t = performance.now() / 1000;
    const drift = reduced ? 0 : (cfg.drift ?? .015), par = reduced ? 0 : (cfg.parallax ?? .06);
    let px = camState.pos.x, py = camState.pos.y, pz = camState.pos.z;
    const sc = scenes[cur], sh = sc && shotOf(sc);
    if (sh && sh.push && !busy && !reduced) {
      const k = sh.push * E.outCubic(Math.min(1, (performance.now() - arrived) / 1000 / (sh.pushDur || 18)));
      px += (camState.look.x - px) * k; py += (camState.look.y - py) * k; pz += (camState.look.z - pz) * k;
      pushed = [px, py, pz];
    }
    c.position.set(px + Math.sin(t * .23) * drift * 4 + mouse.x * par, py + Math.sin(t * .31) * drift * 2 - mouse.y * par * .6, pz + Math.cos(t * .19) * drift * 4);
    world.look.set(camState.look.x, camState.look.y, camState.look.z);
    c.lookAt(world.look);
    if (camState.roll) c.rotateZ(camState.roll);
    if (Math.abs(c.fov - camState.fov) > 1e-3) { c.fov = camState.fov; c.updateProjectionMatrix(); }
  }
  function flyTo(sc, instant) {
    const sh = shotOf(sc); if (!world || !sh) return Promise.resolve();
    const T = world.THREE, P = v => new T.Vector3(v[0], v[1], v[2]);
    const to = { pos: P(sh.pos), look: P(sh.look || [0, 0, 0]), fov: sh.fov || 40, roll: sh.roll || 0 };
    if (instant || !camState.pos) { Object.assign(camState, to); return Promise.resolve(); }
    const from = { pos: camState.pos.clone(), look: camState.look.clone(), fov: camState.fov, roll: camState.roll };
    const via = sc.via || {};
    const curve = via.path && via.path.length ? new T.CatmullRomCurve3([from.pos, ...via.path.map(P), to.pos], false, 'centripetal') : null;
    const lookCurve = via.look && via.look.length ? new T.CatmullRomCurve3([from.look, ...via.look.map(P), to.look], false, 'centripetal') : null;
    return S.tween({ dur: via.dur || sc.dur || 2.2, ease: via.ease || 'cine', update: e => {
      camState.pos = curve ? curve.getPoint(e) : from.pos.clone().lerp(to.pos, e);
      camState.look = lookCurve ? lookCurve.getPoint(e) : from.look.clone().lerp(to.look, e);
      camState.fov = S.lerp(from.fov, to.fov, via.fovPulse ? e + Math.sin(e * Math.PI) * via.fovPulse : e);
      camState.roll = S.lerp(from.roll, to.roll, e);
    } });
  }

  async function go(target, opts) {
    const i = typeof target === 'number' ? target : scenes.findIndex(s => s.id === target);
    if (i < 0 || i >= scenes.length || i === cur) return;
    if (busy) { queued = i; return; }
    busy = true;
    const prev = scenes[cur], next = scenes[i], dir = i > cur ? 1 : -1, instant = opts && opts.instant;
    const ctx = S.ctx;
    if (prev) { reveal(prev.el, false); prev.el.classList.add('out'); }
    const leaving = prev && prev.leave ? prev.leave(ctx, { to: next.id, dir }) : null;
    if (leaving && leaving.then && !next.overlap) await leaving;
    if (prev) { prev.el.classList.remove('cur', 'out'); }
    cur = i;
    document.body.dataset.scene = next.id;
    document.body.dataset.chapter = next.chapter || '';
    next.el.classList.add('cur');
    $$('#studio-rail button').forEach((b, k) => b.classList.toggle('on', k === i));
    const hudc = $('#studio-chapter'); if (hudc) hudc.textContent = next.chapter || '';
    if (!opts || !opts.noHash) history.replaceState(null, '', '#' + next.id);
    if (pushed && camState.pos) { camState.pos.set(pushed[0], pushed[1], pushed[2]); pushed = null; }
    const cam = flyTo(next, instant);
    const entering = next.enter ? next.enter(ctx, { from: prev && prev.id, dir, camera: cam }) : null;
    const revealAt = instant ? 0 : (next.revealAt ?? .55) * ((next.via && next.via.dur) || next.dur || 2.2);
    setTimeout(() => reveal(next.el, true), reduced ? 0 : revealAt * 1000);
    await Promise.all([cam, entering && entering.then ? entering : null]);
    arrived = performance.now(); busy = false;
    idleRes.splice(0).forEach(r => r());
    if (queued != null) { const q = queued; queued = null; go(q); }
  }
  S.go = go;
  S.next = () => go(Math.min(scenes.length - 1, (busy && queued != null ? queued : cur) + 1));
  S.prev = () => go(Math.max(0, (busy && queued != null ? queued : cur) - 1));

  /* ---------------- chrome: rail, overview, hint, keys, wheel, swipe ---------------- */
  const mouse = { x: 0, y: 0 };
  function chrome() {
    const rail = document.createElement('nav'); rail.id = 'studio-rail'; rail.setAttribute('aria-label', 'Scenes');
    scenes.forEach((s, k) => { const b = document.createElement('button'); b.title = s.title || s.id; b.setAttribute('aria-label', (k + 1) + ': ' + (s.title || s.id)); b.onclick = () => go(k); rail.append(b); });
    document.body.append(rail);
    const ov = document.createElement('div'); ov.id = 'studio-overview'; ov.setAttribute('role', 'dialog'); ov.hidden = true;
    ov.innerHTML = '<div class="ov-grid">' + scenes.map((s, k) => `<button data-k="${k}"><small>${String(k + 1).padStart(2, '0')}${s.chapter ? ' · ' + s.chapter : ''}</small><b>${s.title || s.id}</b></button>`).join('') + '</div>';
    ov.onclick = e => { const b = e.target.closest('button'); if (b) { overview(false); go(+b.dataset.k); } else overview(false); };
    document.body.append(ov);
    if (cfg.hint !== false) {
      const en = /^en/i.test(document.documentElement.lang);
      const h = document.createElement('div'); h.id = 'studio-hint';
      h.innerHTML = en ? '<kbd>←</kbd><kbd>→</kbd> navigate · <kbd>M</kbd> overview · <kbd>F</kbd> fullscreen' : '<kbd>←</kbd><kbd>→</kbd> navigieren · <kbd>M</kbd> Übersicht · <kbd>F</kbd> Vollbild';
      document.body.append(h); setTimeout(() => h.classList.add('fade'), 6000);
    }
  }
  function overview(on) { const ov = $('#studio-overview'); ov.hidden = !on; document.body.classList.toggle('ov-open', on); }
  S.overview = overview;
  function input() {
    addEventListener('keydown', e => {
      if (e.target.closest && e.target.closest('input,textarea,select,[contenteditable]')) return;
      const k = e.key;
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(k)) { e.preventDefault(); S.next(); }
      else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(k)) { e.preventDefault(); S.prev(); }
      else if (k === 'Home') go(0); else if (k === 'End') go(scenes.length - 1);
      else if (k === 'm' || k === 'M') overview($('#studio-overview').hidden);
      else if (k === 'Escape') overview(false);
      else if (k === 'f' || k === 'F') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}); }
      else if (/^[1-9]$/.test(k)) go(+k - 1);
    });
    let acc = 0, lock = 0;
    addEventListener('wheel', e => {
      if (document.body.classList.contains('ov-open') || (e.target.closest && e.target.closest('[data-scroll]'))) return;
      const now = performance.now(); if (now < lock) return;
      acc += e.deltaY; if (Math.abs(acc) > 70) { acc > 0 ? S.next() : S.prev(); acc = 0; lock = now + 1100; }
    }, { passive: true });
    let ty = null, tx = null;
    addEventListener('touchstart', e => { ty = e.touches[0].clientY; tx = e.touches[0].clientX; }, { passive: true });
    addEventListener('touchend', e => {
      if (ty == null) return; const dy = ty - e.changedTouches[0].clientY, dx = tx - e.changedTouches[0].clientX;
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 50) ((Math.abs(dx) > Math.abs(dy) ? dx : dy) > 0 ? S.next() : S.prev()); ty = null;
    }, { passive: true });
    addEventListener('pointermove', e => { mouse.x = e.clientX / innerWidth - .5; mouse.y = e.clientY / innerHeight - .5; }, { passive: true });
    $$('[data-go]').forEach(b => b.addEventListener('click', () => go(isNaN(+b.dataset.go) ? b.dataset.go : +b.dataset.go)));
    $$('[data-next]').forEach(b => b.addEventListener('click', S.next));
  }
  function resize() {
    if (!world) return;
    const w = innerWidth, h = innerHeight;
    world.renderer.setSize(w, h); world.camera.aspect = w / h; world.camera.updateProjectionMatrix();
    if (world.composer) world.composer.setSize(w, h);
    S.ctx.mobile = w < 760;
    if (cur >= 0 && scenes[cur].mobile) flyTo(scenes[cur], true);
    if (cfg.onResize) cfg.onResize(S.ctx);
  }

  /* ---------------- loop ---------------- */
  let last = performance.now();
  function loop(now) {
    requestAnimationFrame(loop);
    if (document.hidden) { last = now; return; }
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    stepTweens(now);
    const ctx = S.ctx; ctx.time = now / 1000; ctx.dt = dt;
    frameFns.forEach(f => f(ctx));
    scenes.forEach((s, k) => { if (s.update && (s.always || k === cur)) s.update(ctx, ctx.time, dt); });
    applyCam();
    stepAnchors();
    if (world) (world.composer || world.renderer).render(world.composer ? undefined : world.scene, world.composer ? undefined : world.camera);
  }

  /* ---------------- init ---------------- */
  S.init = async c => {
    cfg = c || {};
    scenes = (cfg.scenes || []).map(s => {
      const el = $(`.scene[data-id="${s.id}"]`);
      if (!el) console.warn('[studio] missing <section class="scene" data-id="' + s.id + '">');
      const title = s.title || (el && ($('h1,h2', el) || {}).textContent || s.id).replace(/\s+/g, ' ').trim();
      return Object.assign({}, s, { el: el || document.createElement('section'), title });
    });
    world = setupWorld();
    S.ctx = Object.assign(world || {}, { S, $, $$, cfg, mobile: innerWidth < 760, time: 0, dt: 0, reduced });
    chrome(); input();
    addEventListener('resize', resize); resize();
    if (cfg.setup) await cfg.setup(S.ctx);
    for (const s of scenes) if (s.setup) await s.setup(S.ctx);
    const start = Math.max(0, scenes.findIndex(s => s.id === location.hash.slice(1)));
    requestAnimationFrame(loop);
    document.body.classList.add('ready');
    const veil = $('#studio-veil'); if (veil) { veil.classList.add('gone'); setTimeout(() => veil.remove(), 1400); }
    flyTo(scenes[start], true);
    await go(start, { instant: true, noHash: true });
    S.ready = true;
    if (cfg.ready) cfg.ready(S.ctx);
  };
})();
