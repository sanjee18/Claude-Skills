/* boot: builds stages from window brief, navigation (deck | scroll), sub pages, chrome, public API window.Deck */
(function () {
  'use strict';
  const D = window.Deck, R = D.reg, h = D.h, $ = D.$, $$ = D.$$;
  let pend = null, B, main = [], stages = {}, subs = {}, cur = 0, busy = false, stack = [], bgApi = null, mode = 'deck', io = null, wheelAcc = 0, wheelT = 0, unbind = [];

  D._bg = () => bgApi;
  const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); unbind.push(() => t.removeEventListener(ev, fn, o)); };
  const idx = t => typeof t === 'number' ? t : main.findIndex(p => p.id === t);

  /* ---------- stages ---------- */
  function mk(p, isSub) {
    const r = (R.page[p.type] || R.page.statement)(p);
    const st = h('section', { class: 'stage' + (isSub ? ' sub' : ''), 'data-id': p.id, 'data-type': p.type, 'aria-label': p.title || p.id, 'aria-hidden': 'true' }, h('div', { class: 'inner' }, r.el));
    st._r = r; st._p = p;
    if (isSub) st.firstElementChild.prepend(h('button', { class: 'back', 'data-back': '', 'aria-label': 'Zurück' }, '←', h('span', null, ' Zurück')));
    return st;
  }
  function enterStage(st) {
    if (!st || st.classList.contains('entered')) return;
    st.classList.add('entered');
    $$('[data-tx]', st).forEach(el => { if (el.dataset.flipped) return; (R.tx[el.dataset.tx] || R.tx['fade-up'])(el, { delay: +el.dataset.d || 0 }); });
    $$('[data-stagger]', st).forEach(D.stagger);
    st._r.enter && st._r.enter(st);
  }
  function leaveStage(st) {
    if (!st) return;
    st.classList.remove('entered');
    st.getAnimations({ subtree: true }).forEach(a => a.cancel());
    $$('[data-tx]', st).forEach(el => { if (el.dataset.html) el.innerHTML = el.dataset.html; el.classList.remove('tx-shine', 'tx-outline', 'tx-fill'); });
    $$('[data-shared]', st).forEach(el => { delete el.dataset.flipped; el.style.opacity = ''; });
    st._r.leave && st._r.leave(st);
  }

  /* ---------- shared-element FLIP: same data-shared key on both pages -> the element travels ---------- */
  function sharedPairs(from, to) {
    const out = [];
    $$('[data-shared]', to).forEach(t => { const f = from.querySelector('[data-shared="' + t.dataset.shared + '"]'); if (f) out.push([f, t]); });
    return out;
  }

  // text elements: measure the glyph box (not the full-width block) so centred and left-aligned titles line up
  function box(el) {
    if (!el.dataset.tx) return el.getBoundingClientRect();
    const r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect();
  }

  /* ---------- transition runner ---------- */
  async function run(from, to, tid, c) {
    const t = R.tr[tid] || R.tr['fade-blur'];
    if (to) {
      to.style.display = 'grid'; to.classList.add('is-active'); to.setAttribute('aria-hidden', 'false');
      if (c.mode === 'close') { if (from) from.style.zIndex = 2; to.style.zIndex = 1; } else { if (from) from.style.zIndex = 1; to.style.zIndex = 2; }
      if (c.mode === 'nav' && from) {
        sharedPairs(from, to).map(([f, e]) => [f, e, box(f), box(e)]).forEach(([f, e, a, b]) => {
          if (!a.width || !b.width) return;
          e.dataset.flipped = '1'; f.style.opacity = '0';
          D.an(e, [{ transformOrigin: '0 0', transform: `translate(${a.left - b.left}px,${a.top - b.top}px) scale(${a.width / b.width})` }, { transformOrigin: '0 0', transform: 'translate(0,0) scale(1)' }], { duration: 950, easing: D.EASE_IO });
        });
      }
      if (!to.classList.contains('entered')) setTimeout(() => enterStage(to), D.reduced ? 0 : (t.at == null ? 300 : t.at));
    }
    await t(Object.assign({ from, to }, c));
    if (from && c.hideFrom !== false) {
      from.classList.remove('is-active'); from.style.display = 'none'; from.style.visibility = ''; from.setAttribute('aria-hidden', 'true');
      $$('[data-shared]', from).forEach(e => { e.style.opacity = ''; });
      from.getAnimations().forEach(a => a.cancel()); if (from.firstElementChild) from.firstElementChild.getAnimations().forEach(a => a.cancel());
      if (!c.keepFrom) leaveStage(from);
    }
    if (to) { to.getAnimations().forEach(a => a.cancel()); to.style.zIndex = ''; }
  }

  /* ---------- navigation ---------- */
  function settle() { busy = false; chrome(); if (pend) { const f = pend; pend = null; f(); } }
  async function go(t) {
    const i = idx(t); if (i < 0) return;
    if (mode === 'scroll') { stages[main[i].id].scrollIntoView({ behavior: D.reduced ? 'auto' : 'smooth' }); return; }
    if (stack.length) await back();
    if (busy) { pend = () => go(t); return; }
    if (i === cur) return;
    busy = true;
    const from = stages[main[cur].id], to = stages[main[i].id], dir = i > cur ? 1 : -1;
    await run(from, to, main[i].transition || B.nav.transition || 'fade-blur', { dir, mode: 'nav' });
    cur = i; settle();
  }
  const next = () => go(Math.min(cur + 1, main.length - 1));
  const prev = () => go(Math.max(cur - 1, 0));

  async function open(id, rect) {
    if (!subs[id]) return;
    if (busy) { pend = () => open(id, rect); return; }
    busy = true;
    const from = stack.length ? subs[stack[stack.length - 1].id] : (mode === 'deck' ? stages[main[cur].id] : null), to = subs[id];
    stack.push({ id, rect: rect || null, parent: from });
    document.body.classList.add('in-sub'); if (mode === 'scroll') document.documentElement.style.overflow = 'hidden';
    await run(from, to, rect ? 'morph-open' : (subs[id]._p.transition || B.nav.transition || 'zoom-through'), { dir: 1, mode: 'open', rect, hideFrom: !!from, keepFrom: true });
    settle();
  }
  async function back() {
    if (busy) { pend = () => back(); return; }
    if (!stack.length) return;
    busy = true;
    const rec = stack.pop();
    await run(subs[rec.id], rec.parent, rec.rect ? 'morph-close' : 'fade-blur', { dir: -1, mode: 'close', rect: rec.rect });
    if (!stack.length) { document.body.classList.remove('in-sub'); document.documentElement.style.overflow = ''; }
    settle();
  }

  /* ---------- chrome: hud, rail, progress, overview ---------- */
  function chrome() {
    const c = $('#chrome'); if (!c) return;
    const pad = n => String(n + 1).padStart(2, '0');
    $('.hud-count', c).textContent = pad(cur) + ' / ' + String(main.length).padStart(2, '0');
    $$('.rail button', c).forEach((b, i) => b.classList.toggle('on', i === cur));
    $('.progress i', c).style.transform = `scaleX(${main.length > 1 ? cur / (main.length - 1) : 1})`;
    document.body.dataset.page = main[cur] ? main[cur].id : '';
    try { history.replaceState(null, '', '#/' + (stack.length ? stack[stack.length - 1].id : main[cur].id)); } catch (e) {}
  }
  function buildChrome() {
    const c = $('#chrome'); c.innerHTML = '';
    const m = B.meta || {};
    c.append(h('div', { class: 'progress' }, h('i')),
      h('div', { class: 'hud hud-l' }, m.org && h('b', null, m.org), m.title && h('span', null, m.title)),
      h('div', { class: 'hud hud-r' }, h('span', { class: 'hud-count' }), h('button', { class: 'ov-btn', 'data-overview': '', 'aria-label': 'Übersicht' }, '▦')),
      B.nav.rail !== false && h('nav', { class: 'rail', 'aria-label': 'Seiten' }, main.map((p, i) => h('button', { 'data-go': p.id, title: p.title ? p.title.replace(/\*/g, '').split('\n')[0] : p.id, 'aria-label': 'Seite ' + (i + 1) }))),
      h('div', { class: 'hint-bar' }, mode === 'deck' ? '← →  ·  Scrollen  ·  M Übersicht  ·  Esc zurück' : 'Scrollen  ·  M Übersicht  ·  Esc zurück'));
  }
  function overview(force) {
    let o = $('.overview');
    if (o) { if (force !== true) o.remove(); return; }
    o = h('div', { class: 'overview', role: 'dialog', 'aria-label': 'Übersicht' }, main.map((p, i) => h('button', { 'data-go': p.id }, h('small', null, String(i + 1).padStart(2, '0')), h('span', null, (p.title || p.id).replace(/\*/g, '').split('\n')[0]))));
    document.body.append(o);
  }

  /* ---------- input ---------- */
  function bindInput() {
    on(document, 'click', e => {
      const g = e.target.closest('[data-go]'); if (g && g.dataset.go) { const ov = $('.overview'); if (ov) ov.remove(); go(g.dataset.go); return; }
      const o = e.target.closest('[data-open]'); if (o && o.dataset.open) { open(o.dataset.open, o.getBoundingClientRect()); return; }
      if (e.target.closest('[data-back]')) { back(); return; }
      if (e.target.closest('[data-overview]')) overview();
      const nx = e.target.closest('[data-next]'); if (nx) next();
    });
    on(document, 'keydown', e => {
      if (e.metaKey || e.ctrlKey || e.altKey || /input|textarea|select/i.test(e.target.tagName)) return;
      const k = e.key;
      if (k === 'Escape') { const ov = $('.overview'); if (ov) ov.remove(); else back(); return; }
      if (k === 'm' || k === 'M') { overview(); return; }
      if (k === 'h' || k === 'H') { const hp = main.find(p => p.type === 'hub'); if (hp) go(hp.id); return; }
      if (mode !== 'deck' || stack.length) return;
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(k)) { e.preventDefault(); next(); }
      else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(k)) { e.preventDefault(); prev(); }
      else if (k === 'Home') go(0); else if (k === 'End') go(main.length - 1);
    });
    if (mode === 'deck') {
      on(window, 'wheel', e => {
        if (busy || stack.length || $('.overview')) return;
        const st = stages[main[cur].id], inn = st && st.firstElementChild;
        if (inn && inn.scrollHeight > inn.clientHeight + 4) { const atEnd = inn.scrollTop + inn.clientHeight >= inn.scrollHeight - 2, atTop = inn.scrollTop <= 0; if ((e.deltaY > 0 && !atEnd) || (e.deltaY < 0 && !atTop)) return; }
        wheelAcc += e.deltaY; clearTimeout(wheelT); wheelT = setTimeout(() => { wheelAcc = 0; }, 160);
        if (Math.abs(wheelAcc) > 40) { const d = wheelAcc; wheelAcc = 0; d > 0 ? next() : prev(); }
      }, { passive: true });
      let ty = null, tx = null;
      on(window, 'touchstart', e => { ty = e.touches[0].clientY; tx = e.touches[0].clientX; }, { passive: true });
      on(window, 'touchend', e => {
        if (ty == null || stack.length) return; const dy = ty - e.changedTouches[0].clientY, dx = tx - e.changedTouches[0].clientX; ty = null;
        if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx)) dy > 0 ? next() : prev(); else if (Math.abs(dx) > 60) dx > 0 ? next() : prev();
      }, { passive: true });
    }
  }

  /* ---------- background ---------- */
  D.setBg = (id, intensity) => {
    if (bgApi) bgApi.destroy();
    B.bg = { id, intensity: intensity == null ? (B.bg && B.bg.intensity) || 1 : intensity };
    bgApi = (R.bg[id] || R.bg.none).init($('#bg'), { intensity: B.bg.intensity });
  };

  /* ---------- start / teardown ---------- */
  function teardown() {
    unbind.forEach(f => f()); unbind = []; if (io) io.disconnect(); if (bgApi) bgApi.destroy(); bgApi = null;
    ['#app', '#subs', '#chrome'].forEach(s => { const e = $(s); if (e) e.innerHTML = ''; });
    const ov = $('.overview'); if (ov) ov.remove();
    main = []; stages = {}; subs = {}; stack = []; cur = 0; busy = false; pend = null; document.documentElement.style.overflow = '';
    document.body.classList.remove('in-sub');
  }
  D.start = brief => {
    teardown(); B = brief; B.nav = Object.assign({ mode: 'deck', transition: 'fade-blur' }, B.nav);
    const fx = (B.theme && B.theme.fx) || []; if (D.applyFx) D.applyFx(fx); else ['grain', 'glass', 'gradient'].forEach(k => document.body.classList.toggle('fx-' + k, fx.includes(k)));
    mode = B.nav.mode; document.body.classList.toggle('deck', mode === 'deck'); document.body.classList.toggle('scroll', mode === 'scroll');
    main = B.pages || [];
    const app = $('#app'), subWrap = $('#subs');
    main.forEach((p, i) => {
      const st = mk(p, false); stages[p.id] = st; app.append(st);
      (p.subpages || []).forEach(sp => { subs[sp.id] = mk(sp, true); subWrap.append(subs[sp.id]); });
      if (mode === 'deck' && i === 0) { st.style.display = 'grid'; st.classList.add('is-active'); st.setAttribute('aria-hidden', 'false'); }
    });
    buildChrome(); bindInput(); D.setBg((B.bg && B.bg.id) || 'none', (B.bg && B.bg.intensity) || 1);
    if (mode === 'scroll') {
      io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { enterStage(e.target); cur = main.findIndex(p => p.id === e.target.dataset.id); chrome(); } }), { threshold: .5 });
      Object.values(stages).forEach(s => { s.setAttribute('aria-hidden', 'false'); io.observe(s); });
      on(window, 'scroll', () => { const m = document.documentElement; $('.progress i').style.transform = `scaleX(${m.scrollTop / Math.max(1, m.scrollHeight - innerHeight)})`; }, { passive: true });
    } else if (main[0]) setTimeout(() => enterStage(stages[main[0].id]), 120);
    const hash = location.hash.replace('#/', ''); if (hash && idx(hash) > 0 && mode === 'deck') { cur = idx(hash); main.forEach(p => { stages[p.id].style.display = 'none'; }); const s = stages[hash]; s.style.display = 'grid'; s.classList.add('is-active'); enterStage(s); }
    chrome();
  };
  D.go = go; D.next = next; D.prev = prev; D.open = open; D.back = back; D.overview = overview;
  D.pages = () => main.map(p => p.id); D.subIds = () => Object.keys(subs); D.current = () => (stack.length ? stack[stack.length - 1].id : main[cur] && main[cur].id);
  D.brief = () => B; D.busy = () => busy;

  const boot = () => { const el = document.getElementById('brief'); if (el && !window.__GALLERY) D.start(JSON.parse(el.textContent)); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
