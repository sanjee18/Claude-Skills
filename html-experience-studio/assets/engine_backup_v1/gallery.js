/* gallery panel: live preview of every library option. Only included with build.py --gallery */
(function () {
  'use strict';
  const D = window.Deck, h = D.h, T = window.__THEMES;
  const B = JSON.parse(document.getElementById('brief').textContent);
  B.nav = Object.assign({ mode: 'deck', transition: 'zoom-through' }, B.nav);
  B.bg = Object.assign({ id: 'network', intensity: 1 }, B.bg);
  B.theme = Object.assign({ preset: 'midnight' }, B.theme);
  let enter = 'mask-words';

  const LOOKS = [];
  const LIB = window.__LIB, ids = k => LIB.items.filter(i => i.kind === k && !i.auto).map(i => i.id);
  const OPTS = {
    theme: Object.keys(T.presets),
    mode: ['deck', 'scroll'],
    bg: ids('bg').concat('none'),
    tr: ids('tr'),
    fx: ids('fx'),
    enter: ids('tx')
  };
  LIB.items.filter(i => i.kind === 'look').forEach(l => LOOKS.push({ id: l.id, label: l.name, theme: l.set.theme, mode: l.set.mode, bg: l.set.bg, tr: l.set.tr, enter: l.set.enter, fx: l.set.fx }));

  function applyTheme() {
    const p = T.presets[B.theme.preset], f = T.fonts[p.font], r = document.documentElement.style;
    Object.entries({ '--bg': p.bg, '--surface': p.surface, '--text': p.text, '--muted': p.muted, '--line': p.line, '--accent': p.accent, '--accent2': p.accent2, '--on-accent': p.onAccent, '--font-d': f.d, '--font-b': f.b, '--font-m': f.m, '--w-d': f.wd }).forEach(([k, v]) => r.setProperty(k, v));
  }
  function setEnter(id) { enter = id; const set = p => { p.enter = id; (p.subpages || []).forEach(set); }; B.pages.forEach(p => { if (p.type !== 'html') set(p); }); }
  function restart() { applyTheme(); D.start(JSON.parse(JSON.stringify(B))); render(); }

  const css = h('style', null, `
  #gal{position:fixed;left:14px;bottom:14px;z-index:60;font:500 12px/1.3 var(--font-b);color:var(--text)}
  #gal .tog{padding:.6rem .9rem;border-radius:999px;background:var(--accent);color:var(--on-accent);font-weight:700;box-shadow:0 8px 30px -8px #000}
  #gal .pan{display:none;width:min(330px,calc(100vw - 28px));max-height:74vh;overflow:auto;margin-bottom:8px;padding:14px;border-radius:16px;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(16px);border:1px solid var(--line);box-shadow:0 20px 60px -20px #000}
  #gal.open .pan{display:block}
  #gal h4{font:600 10px var(--font-m);letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin:12px 0 6px}#gal h4:first-child{margin-top:0}
  #gal .g{display:flex;flex-wrap:wrap;gap:5px}
  #gal .g button{padding:.38rem .65rem;border-radius:999px;border:1px solid var(--line);color:var(--muted);font-size:11.5px}
  #gal .g button.on{background:var(--accent);color:var(--on-accent);border-color:var(--accent);font-weight:700}
  #gal .g button:hover{border-color:var(--accent)}
  #gal input[type=range]{width:100%;accent-color:var(--accent)}
  #gal .out{margin-top:12px;display:flex;gap:6px}#gal .out button{flex:1;padding:.55rem;border-radius:10px;background:var(--surface);border:1px solid var(--line)}
  #gal pre{margin-top:8px;padding:8px;border-radius:10px;background:var(--surface);border:1px solid var(--line);font:11px/1.4 var(--font-m);white-space:pre-wrap;color:var(--muted);display:none}
  `);
  const wrap = h('div', { id: 'gal' }); document.body.append(css, wrap);
  let open = false, shown = false;

  function group(title, key, list, current, set, labels) {
    return [h('h4', null, title), h('div', { class: 'g' }, list.map(v => h('button', { class: v === current ? 'on' : '', onclick: () => set(v) }, (labels && labels[v]) || v)))];
  }
  function snippet() {
    return JSON.stringify({ theme: { preset: B.theme.preset, fx: B.theme.fx || [] }, nav: { mode: B.nav.mode, transition: B.nav.transition }, bg: { id: B.bg.id, intensity: B.bg.intensity }, enter }, null, 2);
  }
  function render() {
    wrap.innerHTML = ''; wrap.classList.toggle('open', open);
    const pre = h('pre', null, snippet()); pre.style.display = shown ? 'block' : 'none';
    wrap.append(h('div', { class: 'pan' },
      h('h4', null, 'Look-Bundles'), h('div', { class: 'g' }, LOOKS.map(l => h('button', { onclick: () => { B.theme.preset = l.theme; B.nav.mode = l.mode; B.bg.id = l.bg; B.nav.transition = l.tr; setEnter(l.enter); B.theme.fx = (l.fx || []).slice(); restart(); } }, l.label))),
      group('Theme', 'theme', OPTS.theme, B.theme.preset, v => { B.theme.preset = v; restart(); }),
      group('Navigation', 'mode', OPTS.mode, B.nav.mode, v => { B.nav.mode = v; restart(); }, { deck: 'Deck (Klick/Pfeile)', scroll: 'Scroll' }),
      group('Hintergrund', 'bg', OPTS.bg, B.bg.id, v => { B.bg.id = v; D.setBg(v, B.bg.intensity); render(); }),
      h('input', { type: 'range', min: .3, max: 1.6, step: .1, value: B.bg.intensity, oninput: e => { B.bg.intensity = +e.target.value; D.setBg(B.bg.id, B.bg.intensity); } }),
      group('Übergang', 'tr', OPTS.tr, B.nav.transition, v => { B.nav.transition = v; D.brief().nav.transition = v; render(); }),
      group('Titel-Animation', 'enter', OPTS.enter, enter, v => { setEnter(v); restart(); }),
      h('h4', null, 'Finish'), h('div', { class: 'g' }, OPTS.fx.map(k => h('button', { class: (B.theme.fx || []).includes(k) ? 'on' : '', onclick: () => { const a = B.theme.fx = B.theme.fx || []; const i = a.indexOf(k); i < 0 ? a.push(k) : a.splice(i, 1); restart(); } }, k))),
      h('div', { class: 'out' }, h('button', { onclick: () => D.next() }, 'Nächste Seite →'),
        h('button', { onclick: () => { shown = !shown; render(); try { navigator.clipboard.writeText(snippet()); } catch (e) {} } }, 'Auswahl kopieren')), pre),
      h('button', { class: 'tog', onclick: () => { open = !open; render(); } }, open ? '× schließen' : '⚙ Library'));
  }
  setEnter(enter); applyTheme(); D.start(JSON.parse(JSON.stringify(B))); render();
})();
