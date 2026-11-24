/* Experience runtime · Bauart "Erlebnis-Hub" (Intro → Story → Hub → Unterseiten → Outro), one offline file, no build step.
   Plumbing only: the PROJECT designs every page, every visual and its own transitions. This file gives:
     - a page graph built from <section class="scene" data-id data-role="intro|story|hub|sub|outro|backup" [data-item]>
       sub pages belong to a hub item via data-item="<itemId>" (several pages per item = a chain, in DOM order)
     - guided order: next() walks intro → story → hub → next unvisited item → back to hub → … → outro
     - visited state + progress (events, [data-x-progress-text|bar|next] bindings), "next lever" highlight
     - a transition REGISTRY per page pair: cfg.transitions['a>b' | 'a>*' | '*>b' | 'hub>sub' | role pairs] = name | async fn(ctx)
       built-ins: fade push rise portal return converge lift wipe curtain dissolve (see references/transitions.md)
     - staged reveals ([data-in="n"] → --i, .x-ln masks) fired by the transition, 'exp:reveal' event per page
     - HUD (brand, chapter chip, hub button, overview), rail (story dots + item dots), hint line, overview menu (M),
       speaker window (P) with <aside class="notes">, blank (B), fullscreen (F), hub (H), deep links (#id), swipe
     - gear builder hub element of the USER'S choice: Exp.parts(root) binds any SVG/HTML parts [data-item]; three.js via
       Exp.openItem/Exp.origin; ready-made only on request: Exp.gear, Exp.pyramid; Exp.mini = small clone for sub pages
     - a Studio shim (Studio.ready/scenes/go/idle) so scripts/studio_frames.cjs shoots stills and motion strips
   API: Exp.init(cfg) · go(id, {origin, instant}) · next() · prev() · hub() · skip() · idle() · progress()
        Exp.anim(el, keyframes, opts) · Exp.sleep(ms) · Exp.frame() · Exp.reveal(section) · Exp.gear(host, opts)
        Exp.parts(root,{hover,state}) · Exp.openItem(id, origin) · Exp.origin(id, el|{x,y}|fn) · Exp.mini(host, activeItemId)
        Exp.gear(host, opts) · Exp.pyramid(host, opts) · Exp.on(id, {before, enter, leave})                                      */
(function () {
  'use strict';
  const X = (window.Exp = window.Exp || {});
  const $ = (q, r) => (r || document).querySelector(q), $$ = (q, r) => [...(r || document).querySelectorAll(q)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  X.reduced = reduced;
  const EASE = 'cubic-bezier(.22,1,.36,1)', EIO = 'cubic-bezier(.65,0,.35,1)', EXPO = 'cubic-bezier(.16,1,.3,1)';
  X.ease = { out: EASE, inOut: EIO, expo: EXPO };

  /* ---------- timing helpers (skippable) ---------- */
  const pend = new Set();
  const sleep = ms => (reduced || ms <= 0 ? Promise.resolve() : new Promise(r => {
    const f = () => { clearTimeout(t); pend.delete(f); r(); }; const t = setTimeout(f, ms); pend.add(f); }));
  const frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const anim = (el, kf, o) => {
    if (!el || reduced) return Promise.resolve();
    const a = el.animate(kf, Object.assign({ duration: 600, easing: EASE, fill: 'both' }, o));
    return a.finished.then(() => a, () => a);
  };
  const clean = (...els) => els.forEach(e => e && e.getAnimations().forEach(a => a.cancel()));
  Object.assign(X, { sleep, frame, anim, clean });

  /* ---------- state ---------- */
  let cfg = {}, L = {}, scenes = {}, ids = [], cur = null, busy = false, queued = null, items = [];
  let intro, hubId, outroId, story = [], backups = [];
  const pagesOf = {}, visited = new Set(), hooks = {}, origins = {};
  X.origins = origins;
  const role = id => (scenes[id] ? scenes[id].dataset.role : null);
  const itemOf = id => (scenes[id] ? scenes[id].dataset.item || null : null);
  const navIndex = id => ids.indexOf(id);
  const itemById = id => items.find(i => i.id === id);
  const fmt = (s, o) => String(s).replace(/\{(\w+)\}/g, (_, k) => (o[k] != null ? o[k] : ''));
  const emit = (el, name, detail) => el && el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
  X.on = (id, h) => { hooks[id] = Object.assign(hooks[id] || {}, h); };

  /* ---------- reveals ---------- */
  function show(B) { B.classList.add('active'); B.removeAttribute('inert'); B.setAttribute('aria-hidden', 'false'); }
  function hide(A) { A.classList.remove('active', 'shown'); A.setAttribute('inert', ''); A.setAttribute('aria-hidden', 'true'); }
  async function reveal(B, delay = 60) { await frame(); await sleep(delay); B.classList.add('shown'); emit(B, 'exp:reveal', { id: B.dataset.id }); }
  X.reveal = reveal; X.show = show; X.hide = hide;

  /* ---------- origin of a hub item (gear segment, card, …) ---------- */
  function originEl(from, to) {
    const it = role(to) === 'sub' ? itemOf(to) : role(from) === 'sub' ? itemOf(from) : null;
    if (!it) return null;
    return origins[it] || $(`[data-origin="${it}"]`) || $(`[data-go-item="${it}"]`);
  }
  function centre(el) {
    if (typeof el === 'function') el = el();
    if (!el) return [innerWidth / 2, innerHeight / 2];
    if (el.x != null && !el.getBoundingClientRect) return [el.x, el.y];
    const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2];
  }
  X.centre = centre;

  /* ---------- built-in transitions (each: async ctx => void; must end with B active + shown, A hidden) ---------- */
  const T = (X.transitions = {
    async fade(c) {
      c.A.classList.remove('shown');
      await anim(c.A, [{ opacity: 1 }, { opacity: 0 }], { duration: 420 });
      hide(c.A); clean(c.A); show(c.B); await reveal(c.B, 40);
    },
    async push(c) {                       // story → story: page slides off with blur, next one follows on the same axis
      const d = c.dir; c.A.classList.remove('shown');
      const out = anim(c.A, [{ transform: 'none', filter: 'blur(0px)', opacity: 1 },
        { transform: `translate3d(${-7 * d}vw,0,0) scale(.97)`, filter: 'blur(12px)', opacity: 0 }], { duration: 700, easing: EIO });
      await sleep(240); show(c.B);
      const inn = anim(c.B, [{ transform: `translate3d(${7 * d}vw,0,0)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 900 });
      reveal(c.B, 160); await out; hide(c.A); clean(c.A); await inn; clean(c.B);
    },
    async rise(c) {                       // intro → first page: the title world pushes through the camera
      c.A.classList.remove('shown');
      await anim(c.A, [{ transform: 'scale(1)', filter: 'blur(0px)', opacity: 1 },
        { transform: 'scale(1.08)', filter: 'blur(18px)', opacity: 0 }], { duration: 1000, easing: EIO });
      hide(c.A); clean(c.A); show(c.B);
      await anim(c.B, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 }); clean(c.B); await reveal(c.B, 60);
    },
    async portal(c) {                     // hub → sub: the page opens out of the clicked segment
      const [x, y] = centre(c.origin), R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      c.A.classList.remove('shown'); c.B.style.zIndex = 8; c.B.classList.add('x-solid'); show(c.B); c.A.style.transformOrigin = `${x}px ${y}px`;
      anim(c.A, [{ transform: 'scale(1)', opacity: 1, filter: 'blur(0px)' }, { transform: 'scale(1.18)', opacity: 0, filter: 'blur(10px)' }],
        { duration: 900, easing: EIO });
      const ring = flash(x, y); reveal(c.B, 260);
      await anim(c.B, [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${R}px at ${x}px ${y}px)` }], { duration: 950, easing: EIO });
      ring.remove(); hide(c.A); clean(c.A, c.B); c.A.style.transformOrigin = ''; c.B.style.zIndex = ''; c.B.classList.remove('x-solid');
    },
    async return(c) {                     // sub → hub: the page collapses back into its segment
      const [x, y] = centre(c.origin);
      const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      c.A.classList.add('x-solid'); c.A.style.zIndex = 8; show(c.B); c.B.style.transformOrigin = `${x}px ${y}px`;
      const back = anim(c.B, [{ transform: 'scale(1.16)', opacity: .1 }, { transform: 'scale(1)', opacity: 1 }], { duration: 1000, easing: EASE });
      await anim(c.A, [{ clipPath: `circle(${R}px at ${x}px ${y}px)` }, { clipPath: `circle(0px at ${x}px ${y}px)` }], { duration: 800, easing: EIO });
      hide(c.A); clean(c.A); c.A.style.zIndex = ''; c.A.classList.remove('x-solid'); reveal(c.B, 0); await back; clean(c.B); c.B.style.transformOrigin = '';
    },
    async converge(c) {                   // story → hub: everything pulls into the centre, the hub condenses out of it
      c.A.classList.remove('shown');
      const out = anim(c.A, [{ transform: 'scale(1)', filter: 'blur(0px)', opacity: 1 }, { transform: 'scale(.84)', filter: 'blur(14px)', opacity: 0 }], { duration: 800, easing: EIO });
      await sleep(380); show(c.B);
      const inn = anim(c.B, [{ transform: 'scale(1.22)', filter: 'blur(16px)', opacity: 0 }, { transform: 'scale(1)', filter: 'blur(0px)', opacity: 1 }], { duration: 1100 });
      reveal(c.B, 200); await out; hide(c.A); clean(c.A); await inn; clean(c.B);
    },
    async lift(c) {                       // sub → sub inside one item: vertical, quieter
      const d = c.dir; c.A.classList.remove('shown');
      const out = anim(c.A, [{ transform: 'none', opacity: 1 }, { transform: `translate3d(0,${-6 * d}vh,0)`, opacity: 0, filter: 'blur(8px)' }], { duration: 560, easing: EIO });
      await sleep(200); show(c.B);
      const inn = anim(c.B, [{ transform: `translate3d(0,${6 * d}vh,0)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 760 });
      reveal(c.B, 120); await out; hide(c.A); clean(c.A); await inn; clean(c.B);
    },
    async wipe(c) {                       // chapter change: hard edge with a light line riding it
      const d = c.dir; c.A.classList.remove('shown'); c.B.style.zIndex = 8; c.B.classList.add('x-solid'); show(c.B); reveal(c.B, 300);
      const line = document.createElement('i'); line.className = 'x-sweep'; document.body.appendChild(line);
      const from = d > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
      const lineKf = d > 0 ? [{ transform: 'translateX(100vw)' }, { transform: 'translateX(0)' }] : [{ transform: 'translateX(0)' }, { transform: 'translateX(100vw)' }];
      anim(line, lineKf, { duration: 900, easing: EIO });
      await anim(c.B, [{ clipPath: from }, { clipPath: 'inset(0 0 0 0)' }], { duration: 900, easing: EIO });
      line.remove(); hide(c.A); clean(c.A, c.B); c.B.style.zIndex = ''; c.B.classList.remove('x-solid');
    },
    async curtain(c) {                    // loop back to the start: an accent panel crosses the screen
      const p = document.createElement('i'); p.className = 'x-curtain'; document.body.appendChild(p);
      c.A.classList.remove('shown');
      await anim(p, [{ transform: 'translateX(-101%)' }, { transform: 'translateX(0)' }], { duration: 650, easing: EIO });
      hide(c.A); clean(c.A); show(c.B);
      await anim(p, [{ transform: 'translateX(0)' }, { transform: 'translateX(101%)' }], { duration: 750, easing: EIO });
      p.remove(); await reveal(c.B, 0);
    },
    async dissolve(c) {                   // into the outro: slow, soft, nothing moves sideways
      c.A.classList.remove('shown');
      await anim(c.A, [{ opacity: 1, filter: 'blur(0px)', transform: 'scale(1)' }, { opacity: 0, filter: 'blur(22px)', transform: 'scale(.97)' }], { duration: 1000, easing: EIO });
      hide(c.A); clean(c.A); show(c.B);
      await anim(c.B, [{ opacity: 0, filter: 'blur(16px)' }, { opacity: 1, filter: 'blur(0px)' }], { duration: 900 }); clean(c.B); await reveal(c.B, 0);
    }
  });
  function flash(x, y) {
    const f = document.createElement('i'); f.className = 'x-flash'; f.style.left = x + 'px'; f.style.top = y + 'px';
    document.body.appendChild(f); anim(f, [{ transform: 'translate(-50%,-50%) scale(.2)', opacity: .9 }, { transform: 'translate(-50%,-50%) scale(6)', opacity: 0 }], { duration: 900 });
    return f;
  }
  const DEFAULTS = { 'intro>story': 'rise', 'intro>hub': 'rise', 'story>story': 'push', 'story>hub': 'converge', 'hub>story': 'push',
    'hub>sub': 'portal', 'sub>sub': 'lift', 'sub>hub': 'return', 'hub>outro': 'dissolve', 'sub>outro': 'dissolve', 'outro>intro': 'curtain',
    'outro>hub': 'converge', 'story>intro': 'fade' };
  function resolve(from, to) {
    const t = cfg.transitions || {}, rf = role(from), rt = role(to);
    return t[`${from}>${to}`] || t[`${from}>*`] || t[`*>${to}`] || t[`${rf}>${rt}`] || t['*'] || DEFAULTS[`${rf}>${rt}`] || 'fade';
  }

  /* ---------- navigation ---------- */
  async function go(id, opts) {
    opts = opts || {};
    if (typeof id === 'number') id = ids[id];
    if (!scenes[id]) return;
    if (busy) { queued = [id, opts]; skip(); return; }
    if (id === cur) return;
    menu(false);
    const from = cur, A = scenes[from], B = scenes[id];
    busy = true; cur = id; document.body.classList.add('x-busy');
    if (itemOf(id)) visited.add(itemOf(id));
    chrome();
    const ctx = { from, to: id, A, B, X, dir: opts.dir || (from && navIndex(id) < navIndex(from) ? -1 : 1), origin: opts.origin || originEl(from, id) };
    try {
      if (from && hooks[from] && hooks[from].leave) hooks[from].leave(ctx);
      if (hooks[id] && hooks[id].before) await hooks[id].before(ctx);
      emit(B, 'exp:before', ctx);
      if (!A || opts.instant || reduced) {
        if (A) hide(A); show(B); B.classList.add('shown'); emit(B, 'exp:reveal', { id });
      } else {
        const t = resolve(from, id);
        await (typeof t === 'function' ? t(ctx) : (T[t] || T.fade)(ctx));
      }
      if (hooks[id] && hooks[id].enter) hooks[id].enter(ctx);
      emit(B, 'exp:enter', ctx);
    } catch (e) { console.error(e); if (A) hide(A); show(B); B.classList.add('shown'); }
    finally {
      busy = false; document.body.classList.remove('x-busy');
      if (!opts.noHash) history.replaceState(null, '', '#' + id);
      notes();
      if (queued) { const q = queued; queued = null; go(q[0], q[1]); }
    }
  }
  function skip() { pend.forEach(f => f()); document.getAnimations().forEach(a => { try { if (a.playState === 'running' && a.effect.getComputedTiming().iterations !== Infinity) a.finish(); } catch (e) {} }); }
  const nextUnvisited = () => items.find(i => !visited.has(i.id) && pagesOf[i.id] && pagesOf[i.id].length);
  function next() {
    if (menuOpen) return;
    if (busy) return skip();
    const r = role(cur);
    if (r === 'intro') return go(story[0] || hubId);
    if (r === 'story') { const i = story.indexOf(cur); return go(story[i + 1] || hubId || outroId); }
    if (r === 'hub') { const n = nextUnvisited(); return go(n ? pagesOf[n.id][0] : outroId); }
    if (r === 'sub') { const ch = pagesOf[itemOf(cur)] || [], i = ch.indexOf(cur); return go(ch[i + 1] || hubId); }
    if (r === 'outro') return go(intro);
    if (r === 'backup') return go(hubId || intro);
  }
  function prev() {
    if (menuOpen) return;
    if (busy) return skip();
    const r = role(cur);
    if (r === 'story') { const i = story.indexOf(cur); return go(i > 0 ? story[i - 1] : intro, { dir: -1 }); }
    if (r === 'hub') return go(story[story.length - 1] || intro, { dir: -1 });
    if (r === 'sub') { const ch = pagesOf[itemOf(cur)] || [], i = ch.indexOf(cur); return go(i > 0 ? ch[i - 1] : hubId, { dir: -1 }); }
    if (r === 'outro') return go(hubId || story[story.length - 1], { dir: -1 });
    if (r === 'backup') return go(hubId || intro, { dir: -1 });
  }
  const progress = () => ({ seen: items.filter(i => visited.has(i.id)).length, total: items.length, next: nextUnvisited() || null, visited: [...visited] });
  Object.assign(X, { go, next, prev, skip, progress, hub: () => hubId && go(hubId), current: () => cur, pages: () => ids.slice(),
    idle: () => new Promise(r => { const w = () => (busy ? setTimeout(w, 50) : r()); w(); }) });

  /* ---------- chrome: HUD, rail, hint, progress bindings ---------- */
  const ICON = { hub: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v5M12 15v5M4 12h5M15 12h5"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h9"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' };
  X.icon = ICON;
  function buildHud() {
    const h = document.createElement('div'); h.className = 'x-chrome';
    h.innerHTML = `<div class="x-hud x-tl">${cfg.brand || ''}${cfg.title ? `<span class="x-sep"></span><span class="x-ttl">${cfg.title}</span>` : ''}</div>
      <div class="x-hud x-tr"><span class="x-chip x-label" id="xChapter"></span>
        ${hubId ? `<button class="x-chip" data-x="hub" title="${L.hub} (H)">${ICON.hub}${L.hub}</button>` : ''}
        <button class="x-chip" data-x="menu" title="${L.menu} (M)">${ICON.menu}${L.menu}</button></div>
      <div class="x-rail" id="xRail"></div><div class="x-hint" id="xHint"></div>
      <div class="x-menu" id="xMenu" role="dialog" aria-modal="true" aria-label="${L.menu}"></div><div class="x-blank" id="xBlank"></div>`;
    document.body.appendChild(h);
    const rail = $('#xRail'), lin = [intro, ...story, hubId, outroId].filter(Boolean);
    rail.innerHTML = `<span class="x-rl">${lin.map(id => `<button class="d" data-id="${id}" title="${title(id)}"></button>`).join('')}</span>` +
      (items.length ? `<span class="x-ri">${items.filter(i => pagesOf[i.id]).map(i => `<button class="o" data-item="${i.id}" style="--c:${i.color || 'var(--x-accent)'}" title="${i.label}"></button>`).join('')}</span>` : '');
    rail.onclick = e => { const b = e.target.closest('button'); if (!b) return; b.dataset.id ? go(b.dataset.id) : go(pagesOf[b.dataset.item][0], { origin: origins[b.dataset.item] }); };
    buildMenu();
  }
  function title(id) { const s = scenes[id]; return (s && (s.dataset.title || s.dataset.chapter || ($('h1,h2', s) || {}).textContent || id) || id).trim().replace(/\s+/g, ' '); }
  function buildMenu() {
    const m = $('#xMenu'); if (!m) return;
    const btn = id => `<button data-go="${id}"><b>${String(navIndex(id) + 1).padStart(2, '0')}</b>${title(id)}</button>`;
    let html = `<div class="x-menu-in"><div class="x-mcol"><div class="x-mk">${L.story}</div>${[intro, ...story].filter(Boolean).map(btn).join('')}</div>`;
    if (hubId) html += `<div class="x-mcol"><div class="x-mk">${title(hubId)}</div>${btn(hubId)}${items.filter(i => pagesOf[i.id]).map(i =>
      `<div class="x-mg" style="--c:${i.color || 'var(--x-accent)'}"><i></i>${i.label}</div>${pagesOf[i.id].map(btn).join('')}`).join('')}</div>`;
    html += `<div class="x-mcol"><div class="x-mk">${L.end}</div>${outroId ? btn(outroId) : ''}${backups.length ? `<div class="x-mk x-mk2">${L.backup}</div>${backups.map(btn).join('')}` : ''}</div></div>`;
    m.innerHTML = html;
    m.onclick = e => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); else if (e.target === m) menu(false); };
  }
  let menuOpen = false;
  function menu(force) { menuOpen = typeof force === 'boolean' ? force : !menuOpen; const m = $('#xMenu'); if (m) m.classList.toggle('open', menuOpen); }
  X.menu = menu;
  function chrome() {
    const r = role(cur), it = itemById(itemOf(cur));
    document.body.dataset.role = r || '';
    document.body.classList.toggle('x-on-intro', r === 'intro');
    const chip = $('#xChapter'); if (chip) chip.textContent = it ? (it.group || it.label) : (r === 'hub' ? '' : scenes[cur].dataset.chapter || '');
    $$('#xRail .d').forEach(b => { b.classList.toggle('now', b.dataset.id === cur); });
    $$('#xRail .o').forEach(b => { b.classList.toggle('now', b.dataset.item === itemOf(cur)); b.classList.toggle('seen', visited.has(b.dataset.item)); });
    const P = progress(), n = P.next, k = '<kbd>→</kbd>';
    let h = '';
    if (r === 'intro') h = '';
    else if (r === 'story') h = `${k} ${L.next}`;
    else if (r === 'hub') h = n ? `${L.choose} ${k} ${n.label}` : L.allSeen;
    else if (r === 'sub') { const ch = pagesOf[itemOf(cur)] || [], i = ch.indexOf(cur); h = i < ch.length - 1 ? `${k} ${title(ch[i + 1])}` : `${k} ${L.backHub}`; }
    else if (r === 'outro') h = `${k} ${L.restart}`;
    const hint = $('#xHint'); if (hint) hint.innerHTML = h;
    $$('[data-x-progress-text]').forEach(e => { e.textContent = fmt(L.explored, { n: P.seen, t: P.total }); });
    $$('[data-x-progress-bar]').forEach(e => { e.style.width = (P.total ? P.seen / P.total * 100 : 0) + '%'; });
    $$('[data-x-next]').forEach(e => { e.innerHTML = (n ? fmt(P.seen ? L.nextUp : L.startWith, { x: n.label }) : (outroId ? title(outroId) : L.restart)) + ' ' + ICON.arrow;
      e.onclick = () => (n ? go(pagesOf[n.id][0], { origin: origins[n.id] }) : go(outroId || intro)); });
    document.dispatchEvent(new CustomEvent('exp:progress', { detail: Object.assign(P, { current: cur, item: itemOf(cur) }) }));
  }

  /* ---------- presenter: notes window, blank, keys, swipe ---------- */
  let notesWin = null, t0 = 0;
  function notes() {
    if (!notesWin || notesWin.closed) return;
    const s = scenes[cur], n = $('aside.notes', s), nx = (() => { const r = role(cur); if (r === 'hub') { const u = nextUnvisited(); return u ? pagesOf[u.id][0] : outroId; } return null; })();
    notesWin.document.body.innerHTML = `<div style="font:14px/1.5 system-ui;padding:24px;color:#e8ecf2;background:#0b0e14;min-height:100vh">
      <div style="opacity:.5;font-size:12px;letter-spacing:.12em;text-transform:uppercase">${navIndex(cur) + 1}/${ids.length} · ${title(cur)}</div>
      <div style="font-size:20px;margin:14px 0 22px;white-space:pre-wrap">${n ? n.innerHTML : '–'}</div>
      <div style="opacity:.6">${nx ? 'Next: ' + title(nx) : ''}</div><div id="tm" style="font:600 28px ui-monospace;margin-top:18px"></div></div>`;
  }
  function presenter() {
    notesWin = window.open('', 'xnotes', 'width=560,height=640'); if (!notesWin) return;
    notesWin.document.title = 'Notes'; t0 = t0 || Date.now(); notes();
    setInterval(() => { if (notesWin && !notesWin.closed) { const e = notesWin.document.getElementById('tm'); const s = ((Date.now() - t0) / 1000) | 0; if (e) e.textContent = `${String(s / 60 | 0).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; } }, 1000);
  }
  function keys(e) {
    if (e.target.closest && e.target.closest('input,textarea,select,[contenteditable]')) return;
    const k = e.key;
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev(); }
    else if (k === 'Escape') { if (menuOpen) menu(false); else if (role(cur) === 'sub') go(hubId); }
    else if (k === 'h' || k === 'H') X.hub();
    else if (k === 'm' || k === 'M') menu();
    else if (k === 'p' || k === 'P') presenter();
    else if (k === 'b' || k === 'B' || k === '.') { const b = $('#xBlank'); if (b) b.classList.toggle('on'); }
    else if (k === 'f' || k === 'F') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}); }
    else if (k === 'Home') go(intro); else if (k === 'End') go(outroId || ids[ids.length - 1]);
  }
  function swipe() {
    let sx = 0, sy = 0;
    addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) (dx < 0 ? next : prev)(); }, { passive: true });
  }

  /* ---------- init ---------- */
  X.init = async function (c) {
    cfg = c || {}; items = cfg.items || [];
    L = Object.assign({ hub: 'Portfolio', menu: 'Übersicht', story: 'Story', end: 'Abschluss', backup: 'Backup', next: 'Weiter',
      choose: 'Bereich wählen — oder', allSeen: 'Alle Bereiche gesehen — Klick zum Wiederholen', backHub: 'Zurück zur Übersicht',
      restart: 'Zurück zum Anfang', explored: '{n} von {t} erkundet', nextUp: 'Weiter: {x}', startWith: 'Start mit: {x}' }, cfg.labels || {});
    $$('.scene').forEach(s => {
      const id = s.dataset.id; if (!id) return; scenes[id] = s; s.dataset.role = s.dataset.role || 'story'; hide(s);
      $$('[data-in]', s).forEach(el => el.style.setProperty('--i', +el.dataset.in || 0));
      $$('.x-ln', s).forEach((el, i) => el.style.setProperty('--l', i));
      const r = s.dataset.role;
      if (r === 'intro' && !intro) intro = id; else if (r === 'hub' && !hubId) hubId = id; else if (r === 'outro' && !outroId) outroId = id;
      else if (r === 'story') story.push(id); else if (r === 'backup') backups.push(id);
      else if (r === 'sub') { const it = s.dataset.item; (pagesOf[it] = pagesOf[it] || []).push(id); if (!itemById(it)) console.warn('[Exp] page', id, 'has unknown data-item', it); }
    });
    items.forEach(i => { if (!pagesOf[i.id]) console.warn('[Exp] hub item without page:', i.id); });
    ids = [intro, ...story, hubId, ...items.flatMap(i => pagesOf[i.id] || []), outroId, ...backups].filter(Boolean);
    if (cfg.hud !== false) buildHud();
    document.addEventListener('click', e => {
      const g = e.target.closest('[data-go]'); if (g && !g.closest('#xMenu')) { e.preventDefault(); return go(g.dataset.go, { origin: g }); }
      const gi = e.target.closest('[data-go-item]'); if (gi) { e.preventDefault(); const p = pagesOf[gi.dataset.goItem]; return p && go(p[0], { origin: origins[gi.dataset.goItem] || gi }); }
      const x = e.target.closest('[data-x]'); if (!x) return;
      const a = x.dataset.x; if (a === 'next') next(); else if (a === 'prev') prev(); else if (a === 'hub') X.hub(); else if (a === 'menu') menu();
    });
    addEventListener('keydown', keys); swipe();
    addEventListener('hashchange', () => { const h = decodeURIComponent(location.hash.slice(1)); if (scenes[h] && h !== cur) go(h); });
    const h = decodeURIComponent(location.hash.slice(1));
    if (cfg.ready) await cfg.ready();
    await go(scenes[h] ? h : intro || ids[0], { instant: true, noHash: true });
    document.documentElement.classList.add('x-ready'); X.ready = true;
    if (!window.Studio) window.Studio = { get ready() { return X.ready; }, scenes: () => ids.slice(), go: (k, o) => go(typeof k === 'number' ? ids[k] : k, o), idle: X.idle };
  };


  /* ================= HUB-ELEMENT: frei wählbar (der Nutzer entscheidet die Form) =================
     Vertrag: irgendein Objekt (SVG, HTML, three.js), dessen klickbare Teile ein Hub-Item tragen.
       SVG/HTML:  <g data-item="adas">…</g>  →  Exp.parts(root)          (Klick, Tastatur, Zustände, Aufbau, Ursprung)
       three.js:  mesh.userData.item = 'adas' →  Exp.openItem(id, {x,y}) beim Raycast-Klick
                  Exp.origin(id, () => ({x,y}))  liefert die Bildschirmposition für portal/return
     Fertige Bausteine (nur wenn der Nutzer diese Form will): Exp.gear · Exp.pyramid. Alles andere (Roboter, Turm, Rakete,
     Gebäude, Organ, Landkarte …) wird pro Projekt gezeichnet/modelliert und mit Exp.parts verbunden. */
  X.origin = (id, o) => { origins[id] = o; };
  X.openItem = (id, origin) => { const p = pagesOf[id]; if (p) go(p[0], { origin: origin || origins[id] }); };
  let hubRoot = null;
  X.parts = function (root, o) {
    o = o || {};
    const list = $$('[data-item]', root).filter(e => !e.closest('.x-mini'));
    root.classList.add('x-hubform'); hubRoot = root;
    list.forEach((el, k) => {
      const id = el.dataset.item, it = itemById(id) || {};
      el.classList.add('x-part'); el.style.setProperty('--k', el.style.getPropertyValue('--k') || k);
      if (it.color && !el.style.getPropertyValue('--c')) el.style.setProperty('--c', it.color);
      el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button'); if (it.label) el.setAttribute('aria-label', it.label);
      if (!origins[id]) origins[id] = el;
      el.addEventListener('click', e => { e.stopPropagation(); X.openItem(id, el); });
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); X.openItem(id, el); } });
      if (o.hover) { el.addEventListener('pointerenter', () => o.hover(id, true, el)); el.addEventListener('pointerleave', () => o.hover(id, false, el)); }
    });
    document.addEventListener('exp:progress', e => {
      const d = e.detail; list.forEach(el => { const id = el.dataset.item;
        el.classList.toggle('seen', d.visited.includes(id)); el.classList.toggle('next', !!d.next && d.next.id === id); el.classList.toggle('cur', d.item === id); });
      if (o.state) o.state(d);
    });
    const sc = root.closest('.scene');
    if (sc && o.build !== false) {
      root.classList.add('x-build');
      sc.addEventListener('exp:before', () => { if (!sc.dataset.built || o.rebuild) root.classList.add('x-build'); });
      sc.addEventListener('exp:reveal', () => requestAnimationFrame(() => { root.classList.remove('x-build'); sc.dataset.built = 1; }));
    }
    return list;
  };
  // Mini-Version des gewählten Hub-Elements für die Unterseiten-Köpfe: Klon des SVG, ein Teil leuchtet (jede Form)
  X.mini = function (host, active) {
    if (!hubRoot) return;
    const svg = hubRoot.tagName.toLowerCase() === 'svg' ? hubRoot : $('svg', hubRoot);
    if (!svg) { host.innerHTML = `<div class="x-mini-dots">${items.map(i => `<i class="${i.id === active ? 'on' : ''}" style="--c:${i.color || 'var(--x-accent)'}"></i>`).join('')}</div>`; return; }
    const c = svg.cloneNode(true);
    $$('foreignObject,text,title', c).forEach(n => n.remove());
    $$('[id]', c).forEach(n => n.removeAttribute('id'));
    c.removeAttribute('role'); c.setAttribute('aria-hidden', 'true'); c.classList.remove('x-hubform', 'x-build'); c.classList.add('x-mini');
    $$('[data-item]', c).forEach(n => { n.removeAttribute('tabindex'); n.removeAttribute('role'); n.removeAttribute('aria-label');
      n.classList.remove('x-part', 'seen', 'next', 'cur'); n.classList.add('x-mini-p'); n.classList.toggle('on', n.dataset.item === active); });
    host.innerHTML = ''; host.appendChild(c);
  };
  X.miniGear = X.mini;

  /* ---------- Baustein: Zahnrad (Segmente = Items, Zahnkranz, Gruppen-Bögen, Kern) ---------- */
  const P = (r, a) => [r * Math.cos(a), r * Math.sin(a)];
  const f = n => n.toFixed(2);
  function slice(r0, r1, a0, a1) {
    const [x0, y0] = P(r1, a0), [x1, y1] = P(r1, a1), [x2, y2] = P(r0, a1), [x3, y3] = P(r0, a0), big = a1 - a0 > Math.PI ? 1 : 0;
    return `M${f(x0)} ${f(y0)}A${r1} ${r1} 0 ${big} 1 ${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}A${r0} ${r0} 0 ${big} 0 ${f(x3)} ${f(y3)}Z`;
  }
  function arc(r, a0, a1, rev) {
    const [x0, y0] = P(r, rev ? a1 : a0), [x1, y1] = P(r, rev ? a0 : a1), big = a1 - a0 > Math.PI ? 1 : 0;
    return `M${f(x0)} ${f(y0)}A${r} ${r} 0 ${big} ${rev ? 0 : 1} ${f(x1)} ${f(y1)}`;
  }
  function teeth(n, r0, r1) {
    const st = 2 * Math.PI / n; let d = '';
    for (let i = 0; i < n; i++) {
      const a = i * st, pts = [P(r0, a), P(r0, a + st * .2), P(r1, a + st * .32), P(r1, a + st * .62), P(r0, a + st * .74)];
      pts.forEach(([x, y], k) => { d += (i === 0 && k === 0 ? 'M' : 'L') + f(x) + ' ' + f(y); });
    }
    return d + 'Z';
  }
  const label = it => `<div xmlns="http://www.w3.org/1999/xhtml" class="x-part-l">${it.icon ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${it.icon}</svg>` : ''}<b>${it.label}</b>${it.sub ? `<span>${it.sub}</span>` : ''}</div>`;
  X.gear = function (host, o) {
    o = o || {};
    const its = o.items || items, n = its.length, R = Object.assign({ in: 116, out: 292, band: 304, root: 322, tip: 348, label: 378 }, o.radius || {});
    const st = 2 * Math.PI / n, a00 = o.start != null ? o.start : -Math.PI / 2 - st / 2, gap = o.gap != null ? o.gap : 0.012, uid = 'g' + Math.random().toString(36).slice(2, 7);
    let s = `<svg class="x-gear" viewBox="-400 -400 800 800" role="group" aria-label="${o.label || ''}">
      <defs><radialGradient id="${uid}c"><stop offset="0" stop-color="var(--x-gear-core,#0f1622)"/><stop offset="1" stop-color="var(--x-gear-core-2,#070a10)"/></radialGradient></defs>
      <g class="x-gear-teeth"><path d="${teeth(o.teeth || 56, R.root, R.tip)}" /><circle r="${R.band}" class="x-gear-band"/></g>`;
    (o.groups || []).forEach((g, gi) => {
      const idx = g.items.map(id => its.findIndex(i => i.id === id)).filter(i => i >= 0); if (!idx.length) return;
      const a0 = a00 + Math.min(...idx) * st + .04, a1 = a00 + (Math.max(...idx) + 1) * st - .04, mid = (a0 + a1) / 2, rev = Math.sin(mid) > 0.15;
      s += `<path id="${uid}a${gi}" d="${arc(rev ? R.label + 10 : R.label, a0, a1, rev)}" fill="none"/>
        <text class="x-gear-group" style="--c:${g.color}"><textPath href="#${uid}a${gi}" startOffset="50%" text-anchor="middle">${g.name}</textPath></text>`;
    });
    its.forEach((it, i) => {
      const a0 = a00 + i * st + gap, a1 = a00 + (i + 1) * st - gap, mid = (a0 + a1) / 2, [dx, dy] = P(10, mid), [cx, cy] = P((R.in + R.out) / 2 + 6, mid);
      const w = Math.min(176, (R.out - R.in) * 1.05), hgt = 118;
      s += `<g class="x-gseg" data-item="${it.id}" style="--c:${it.color || 'var(--x-accent)'};--hx:${f(dx)}px;--hy:${f(dy)}px;--bx:${f(-dx * 5)}px;--by:${f(-dy * 5)}px;--k:${i}">
        <path class="x-gseg-f" d="${slice(R.in, R.out, a0, a1)}"/><path class="x-gseg-a" d="${arc(R.out - 3, a0 + .01, a1 - .01)}"/>
        <foreignObject x="${f(cx - w / 2)}" y="${f(cy - hgt / 2)}" width="${f(w)}" height="${hgt}">${label(it)}</foreignObject></g>`;
    });
    const c = o.center || {};
    s += `<circle r="${R.in - 8}" fill="url(#${uid}c)" class="x-gear-core"/>
      <foreignObject x="${-(R.in - 14)}" y="${-(R.in - 14)}" width="${2 * (R.in - 14)}" height="${2 * (R.in - 14)}"><div xmlns="http://www.w3.org/1999/xhtml" class="x-hub-c">
      ${c.kicker ? `<small>${c.kicker}</small>` : ''}${c.title ? `<b>${c.title}</b>` : ''}${c.sub ? `<small>${c.sub}</small>` : ''}</div></foreignObject></svg>`;
    host.innerHTML = s;
    const svg = host.firstElementChild; X.parts(svg, o); return svg;
  };

  /* ---------- Baustein: Pyramide (Stufen = Items, unten = Fundament, oben = Ziel) ---------- */
  X.pyramid = function (host, o) {
    o = o || {};
    const its = (o.items || items).slice(), n = its.length, W = 760, H = 620, gap = o.gap != null ? o.gap : 10, side = o.depth != null ? o.depth : 70;
    const base = H - 40, top = 40, h = (base - top - gap * (n - 1)) / n, half = y => (W / 2 - 30) * (y - top) / (base - top);
    let s = `<svg class="x-pyramid" viewBox="0 0 ${W + side} ${H}" role="group" aria-label="${o.label || ''}">`;
    its.forEach((it, i) => {                       // i = 0 ist die unterste Stufe
      const y1 = base - i * (h + gap), y0 = y1 - h, a = half(y0), b = half(y1), cx = W / 2;
      const front = `M${f(cx - a)} ${f(y0)}L${f(cx + a)} ${f(y0)}L${f(cx + b)} ${f(y1)}L${f(cx - b)} ${f(y1)}Z`;
      const sideP = `M${f(cx + a)} ${f(y0)}L${f(cx + a + side * (a / (W / 2)))} ${f(y0 - side * .35 * (a / (W / 2)))}L${f(cx + b + side * (b / (W / 2)))} ${f(y1 - side * .35 * (b / (W / 2)))}L${f(cx + b)} ${f(y1)}Z`;
      const lw = Math.max(150, (a + b) * .9), lh = Math.min(h, 96);
      s += `<g class="x-pstep" data-item="${it.id}" style="--c:${it.color || 'var(--x-accent)'};--hx:14px;--hy:0px;--bx:0px;--by:${f(30 + i * 8)}px;--k:${i}">
        <path class="x-pstep-s" d="${sideP}"/><path class="x-pstep-f" d="${front}"/><path class="x-pstep-e" d="M${f(cx - a)} ${f(y0)}L${f(cx + a)} ${f(y0)}"/>
        <foreignObject x="${f(cx - lw / 2)}" y="${f(y0 + (h - lh) / 2 + (i === n - 1 ? h * .18 : 0))}" width="${f(lw)}" height="${f(lh)}">${label(it)}</foreignObject></g>`;
    });
    s += '</svg>';
    host.innerHTML = s;
    const svg = host.firstElementChild; X.parts(svg, o); return svg;
  };
})();
