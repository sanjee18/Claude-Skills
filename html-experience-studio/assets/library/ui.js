/* Motion Library UI: card grid with live previews, filters, selection tray, export for the brief.
   Globals: __LIB (assets/library.json), __THEMES (assets/themes.json), __PREVIEW (preview document HTML). */
(function () {
  'use strict';
  const L = window.__LIB, T = window.__THEMES, $ = (s, r = document) => r.querySelector(s);
  const el = (tag, a, ...k) => { const e = document.createElement(tag); for (const n in a || {}) { const v = a[n]; if (v == null || v === false) continue; if (n === 'class') e.className = v; else if (n === 'html') e.innerHTML = v; else if (n.startsWith('on')) e.addEventListener(n.slice(2), v); else e.setAttribute(n, v === true ? '' : v); } k.flat(3).forEach(c => c != null && c !== false && e.append(c.nodeType ? c : document.createTextNode(c))); return e; };
  const key = it => it.kind + ':' + it.id;
  const store = { get(k, d) { try { const v = localStorage.getItem('hes.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('hes.' + k, JSON.stringify(v)); } catch (e) {} } };
  let src = ''; try { src = URL.createObjectURL(new Blob([window.__PREVIEW], { type: 'text/html' })); } catch (e) {}
  const P = window.__POSTERS || {}, PATH = window.__LIBPATH || 'library.html';
  // live previews: 'blob' (normal browser) -> 'srcdoc' (sandboxed viewers) -> 'poster' (stills + hint to open in a browser)
  let mode = src ? 'blob' : 'srcdoc', gotReady = false, probe = 0;
  addEventListener('message', e => { if (e.data && e.data.hes === 'ready') gotReady = true; });
  const srcdoc = c => window.__PREVIEW.replace('<head>', '<head><script>window.__CFG=' + JSON.stringify(c) + ';<\/script>');
  function armProbe() { clearTimeout(probe); gotReady = false; probe = setTimeout(() => { if (gotReady || S.paused) return;
    if (mode === 'blob') { mode = 'srcdoc'; reloadAll(); armProbe(); } else if (mode === 'srcdoc') { mode = 'poster'; unloadAll(); hint(); } }, 5000); }
  function hint() {
    if (document.querySelector('.hint-open')) return;
    const b = el('div', { class: 'hint-open', role: 'status' }, el('b', null, 'Live-Animationen sind in dieser Vorschau gesperrt.'),
      el('span', null, ' Du siehst Standbilder. Öffne die Library im Browser (Chrome/Edge), dann laufen alle Vorschauen live: '),
      el('code', null, PATH), el('button', { onclick: e => { try { navigator.clipboard.writeText(PATH); e.target.textContent = '✓ kopiert'; } catch (x) {} } }, 'Pfad kopieren'));
    document.body.insertBefore(b, document.body.children[1] || null);
  }

  // URL hash: #rec=bg:aurora,tx:blur-words&theme=paper  -> recommended cards are marked (set by Claude)
  const hp = new URLSearchParams(location.hash.slice(1));
  const rec = new Set((hp.get('rec') || '').split(',').filter(Boolean));
  const S = {
    kind: rec.size ? 'rec' : 'all', moods: new Set(), q: '', theme: hp.get('theme') || store.get('theme', 'midnight'),
    sel: new Set(store.get('sel', [])), paused: false
  };
  const MAX_LIVE = 9;

  /* ---------- header ---------- */
  const kinds = Object.entries(L.kinds);
  const count = k => L.items.filter(i => k === 'all' || (k === 'rec' ? rec.has(key(i)) : i.kind === k)).length;
  const head = el('header', { class: 'top' },
    el('div', { class: 'brand' }, el('b', null, 'Motion Library'), el('span', null, L.items.length + ' Bausteine · live')),
    el('label', { class: 'search' }, el('span', { class: 'sr' }, 'Suchen'), el('input', { type: 'search', placeholder: 'Suchen: Vorhang, Daten, ruhig …', oninput: e => { S.q = e.target.value.toLowerCase(); render(); } })),
    el('label', { class: 'themes' }, el('span', null, 'Farbwelt'), el('select', { onchange: e => { S.theme = e.target.value; store.set('theme', S.theme); reloadAll(); } }, Object.entries(T.presets).map(([k, p]) => { const o = el('option', { value: k }, k); if (k === S.theme) o.selected = true; return o; }))),
    el('button', { class: 'pause', onclick: e => { S.paused = !S.paused; e.target.textContent = S.paused ? '▶ Vorschauen' : '❚❚ Pausieren'; S.paused ? unloadAll() : observeAll(); } }, '❚❚ Pausieren'));
  const tabs = el('nav', { class: 'tabs', 'aria-label': 'Kategorie' });
  const moods = el('div', { class: 'moods', 'aria-label': 'Stimmung' });
  const intro = el('p', { class: 'intro' }, 'Wähle aus, was dir gefällt (＋), oder öffne eine Karte groß. Unten „Auswahl kopieren“ und im Chat einfügen. Die Farbwelt oben färbt alle Vorschauen um.');
  const grid = el('main', { class: 'grid' });
  const tray = el('aside', { class: 'tray', 'aria-live': 'polite' });
  document.body.append(head, intro, tabs, moods, grid, tray);

  function renderFilters() {
    tabs.innerHTML = '';
    const list = [['all', { label: 'Alle' }]].concat(rec.size ? [['rec', { label: '★ Für dich empfohlen' }]] : [], kinds);
    list.forEach(([k, v]) => tabs.append(el('button', { class: S.kind === k ? 'on' : '', onclick: () => { S.kind = k; render(); } }, v.label, el('small', null, count(k)))));
    moods.innerHTML = '';
    L.moods.forEach(m => moods.append(el('button', { class: S.moods.has(m) ? 'on' : '', 'aria-pressed': S.moods.has(m), onclick: () => { S.moods.has(m) ? S.moods.delete(m) : S.moods.add(m); render(); } }, m)));
    if (S.moods.size) moods.append(el('button', { class: 'clear', onclick: () => { S.moods.clear(); render(); } }, '× Stimmung'));
  }

  /* ---------- cards + live previews ---------- */
  const live = new Map(); // card -> iframe
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) load(e.target); else unload(e.target); }), { rootMargin: '80px' });
  const WB = {};   // world id -> blob url (worlds are complete offline pages, not engine configs)
  function worldSrc(it, auto) {
    const h = window.__WORLDS && window.__WORLDS[it.file]; if (!h) return null;
    if (mode === 'blob') { try { WB[it.file] = WB[it.file] || URL.createObjectURL(new Blob([h], { type: 'text/html' })); return { src: WB[it.file] + (auto ? '#auto' : '') }; } catch (e) {} }
    return { srcdoc: h };
  }
  function setFrame(f, it, auto) {
    if (it.file) { const w = worldSrc(it, auto); if (w && w.src) f.src = w.src; else if (w) f.srcdoc = w.srcdoc; return; }
    if (mode === 'blob') f.src = src + '#' + cfg(it); else f.srcdoc = srcdoc(decodeURIComponent(cfg(it)));
  }
  function cfg(it) { return encodeURIComponent(JSON.stringify({ kind: it.kind, id: it.id, name: it.name, theme: S.theme, demo: it.demo, set: it.set })); }
  function load(card) {
    if (S.paused || live.has(card)) return;
    if (live.size >= MAX_LIVE) { const [old] = [...live.keys()].filter(c => c !== card && !inView(c)).concat([...live.keys()]); if (old) unload(old); }
    if (mode === 'poster') return;
    const it = card._it, f = el('iframe', { title: 'Vorschau ' + it.name, loading: 'lazy', tabindex: '-1', 'aria-hidden': 'true' });
    setFrame(f, it, true);
    card.querySelector('.pv').append(f); live.set(card, f); fit(card);
  }
  function unload(card) { const f = live.get(card); if (f) { f.remove(); live.delete(card); } }
  const inView = c => { const r = c.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
  function fit(card) { const pv = card.querySelector('.pv'); pv.style.setProperty('--s', pv.clientWidth / 1280); }
  function unloadAll() { [...live.keys()].forEach(unload); }
  function observeAll() { document.querySelectorAll('.card').forEach(c => { io.unobserve(c); io.observe(c); }); }
  function reloadAll() { unloadAll(); observeAll(); }
  addEventListener('resize', () => document.querySelectorAll('.card').forEach(fit));

  const dots = n => el('span', { class: 'cost', title: ['', 'leicht', 'mittel', 'aufwendig'][n] + ' (Rechenlast)' }, '●'.repeat(n) + '○'.repeat(3 - n));
  function card(it) {
    const k = key(it), on = S.sel.has(k);
    const c = el('article', { class: 'card' + (on ? ' sel' : '') + (rec.has(k) ? ' rec' : '') },
      el('div', { class: 'pv', onclick: () => modal(it), style: P[key(it)] ? 'background:#000 url(' + P[key(it)] + ') center/cover' : null }, el('div', { class: 'poster' + (P[key(it)] ? ' img' : '') }, it.name), rec.has(k) && el('span', { class: 'badge' }, '★ empfohlen')),
      el('div', { class: 'meta' },
        el('div', { class: 'row' }, el('h3', null, it.name), dots(it.cost || 1)),
        el('div', { class: 'row sub' }, el('span', { class: 'kind' }, L.kinds[it.kind].label), el('code', null, it.id)),
        el('p', null, it.desc), it.use && el('p', { class: 'use' }, 'Passt zu: ' + it.use),
        el('div', { class: 'tags' }, (it.moods || []).map(m => el('span', null, m))),
        el('div', { class: 'acts' }, el('button', { class: 'add', 'aria-pressed': on, onclick: () => toggle(it) }, on ? '✓ Ausgewählt' : '＋ Auswählen'), el('button', { class: 'big', onclick: () => modal(it) }, '⤢ Groß ansehen'))));
    c._it = it; return c;
  }
  function visible() {
    return L.items.filter(it => (S.kind === 'all' || (S.kind === 'rec' ? rec.has(key(it)) : it.kind === S.kind))
      && (!S.moods.size || (it.moods || []).some(m => S.moods.has(m)))
      && (!S.q || (it.name + ' ' + it.id + ' ' + it.desc + ' ' + (it.use || '') + ' ' + (it.moods || []).join(' ')).toLowerCase().includes(S.q)));
  }
  function render() {
    renderFilters(); unloadAll(); io.disconnect(); grid.innerHTML = '';
    const vs = visible();
    if (!vs.length) grid.append(el('p', { class: 'empty' }, 'Nichts gefunden. Filter oder Suche lockern.'));
    vs.forEach(it => { const c = card(it); grid.append(c); io.observe(c); });
    requestAnimationFrame(() => document.querySelectorAll('.card').forEach(fit));
    renderTray();
  }

  /* ---------- selection ---------- */
  function toggle(it) { const k = key(it); S.sel.has(k) ? S.sel.delete(k) : S.sel.add(k); store.set('sel', [...S.sel]); document.querySelectorAll('.card').forEach(c => { if (key(c._it) === k) { const on = S.sel.has(k); c.classList.toggle('sel', on); const b = c.querySelector('.add'); b.textContent = on ? '✓ Ausgewählt' : '＋ Auswählen'; b.setAttribute('aria-pressed', on); } }); renderTray(); }
  function exportJson() {
    const picks = {}; [...S.sel].forEach(k => { const [kind, id] = k.split(':'); (picks[kind] = picks[kind] || []).push(id); });
    return JSON.stringify({ library: 'html-experience-studio', theme: S.theme, picks }, null, 1);
  }
  function renderTray() {
    tray.innerHTML = ''; tray.classList.toggle('open', S.sel.size > 0);
    if (!S.sel.size) return;
    const byKind = {}; [...S.sel].forEach(k => { const it = L.items.find(i => key(i) === k); if (it) (byKind[it.kind] = byKind[it.kind] || []).push(it); });
    tray.append(el('div', { class: 'chips' }, el('b', null, S.sel.size + ' gewählt'), Object.entries(byKind).map(([kd, its]) => el('span', { class: 'grp' }, el('small', null, L.kinds[kd].label), its.map(it => el('button', { title: 'Entfernen', onclick: () => toggle(it) }, it.name, ' ×'))))),
      el('div', { class: 'tacts' },
        el('button', { class: 'copy', onclick: e => { const t = exportJson(); const done = () => { e.target.textContent = '✓ Kopiert, jetzt im Chat einfügen'; setTimeout(() => { e.target.textContent = '⧉ Auswahl kopieren'; }, 2600); }; try { navigator.clipboard.writeText(t).then(done, () => fallback(t)); } catch (x) { fallback(t); } } }, '⧉ Auswahl kopieren'),
        el('button', { onclick: () => { S.sel.clear(); store.set('sel', []); render(); } }, 'Leeren')));
  }
  function fallback(t) { const ta = el('textarea', { class: 'fb', readonly: true }); ta.value = t; document.body.append(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} setTimeout(() => ta.remove(), 8000); }

  /* design theme: palette, fonts, motion grammar, rules, banned list, copyable prompt */
  function guide(d) {
    const t = d.tokens, m = d.motion, r = d.rules || {};
    const sw = ['bg', 'surface', 'text', 'muted', 'accent', 'accent2'].map(k => el('span', { class: 'sw', title: k + ' ' + t[k], style: 'background:' + t[k] }));
    const fam = s => (s.match(/'([^']+)'/) || [0, s])[1];
    return el('div', { class: 'guide' },
      el('div', { class: 'sws' }, sw),
      el('p', { class: 'use' }, 'Schrift: ' + fam(d.fonts.d) + ' / ' + fam(d.fonts.b) + ' / ' + fam(d.fonts.m)),
      el('p', { class: 'use' }, 'Bewegung: Titel ' + m.enter + ' · ruhig ' + m.calm + ' · Kapitel ' + m.chapter + ' · Wow ' + m.wow + ' · Hintergrund ' + m.bg + ' · ' + m.tempo),
      el('dl', null, Object.entries({ Layout: r.layout, Typo: r.type, Bauteile: r.components, Bilder: r.imagery, Signature: r.signature }).filter(x => x[1]).map(([k, v]) => [el('dt', null, k), el('dd', null, v)])),
      el('p', { class: 'use ban' }, 'Verboten: ' + (d.banned || []).join(' · ')),
      el('button', { class: 'cp', onclick: e => { try { navigator.clipboard.writeText(d.prompt); } catch (x) { fallback(d.prompt); } e.target.textContent = '✓ Steckbrief kopiert'; } }, '⧉ Steckbrief kopieren'));
  }

  /* reference world: palette, the techniques it is made of, how to transfer it, source and licence note */
  function worldGuide(d) {
    return el('div', { class: 'guide' },
      el('div', { class: 'sws' }, (d.tokens || []).map(c => el('span', { class: 'sw', title: c, style: 'background:' + c }))),
      el('p', { class: 'use' }, 'Technik (so ist es gebaut):'),
      el('ul', { class: 'tech' }, (d.technik || []).map(t => el('li', null, t))),
      el('p', { class: 'use' }, 'Übertragen: ' + (d.uebertragen || '')),
      el('p', { class: 'use ban' }, 'Quelle: ' + (d.quelle || '')),
      el('p', { class: 'use' }, 'Moodboard, kein Baustein: Richtung, Tempo, Material übernehmen, nichts 1:1. Details: references/worlds.md'));
  }

  /* ---------- big preview ---------- */
  function modal(it) {
    const k = key(it), close = () => { m.remove(); document.removeEventListener('keydown', esc); };
    const esc = e => { if (e.key === 'Escape') close(); };
    const frame = el('iframe', { title: 'Großansicht ' + it.name });
    if (mode === 'blob' || mode === 'srcdoc') setFrame(frame, it, false);
    else frame.srcdoc = '<body style="margin:0;background:#000 url(' + (P[key(it)] || '') + ') center/contain no-repeat"></body>';
    const m = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': it.name, onclick: e => { if (e.target === m) close(); } },
      el('div', { class: 'box' }, el('div', { class: 'stagebox' }, frame),
        el('div', { class: 'side' }, el('small', null, L.kinds[it.kind].label), el('h2', null, it.name), el('code', null, it.id), el('p', null, it.desc), it.use && el('p', { class: 'use' }, 'Passt zu: ' + it.use),
          it.how && el('p', { class: 'use' }, 'Im Brief: ' + it.how), el('p', { class: 'use' }, 'Feld: ' + L.kinds[it.kind].field),
          el('div', { class: 'tags' }, (it.moods || []).map(x => el('span', null, x))),
          it.kind === 'design' && guide(it), it.file && worldGuide(it),
          el('div', { class: 'acts' }, el('button', { class: 'add', onclick: () => { toggle(it); close(); } }, S.sel.has(k) ? '✓ Ausgewählt (entfernen)' : '＋ Auswählen'), el('button', { onclick: () => { if (mode === 'blob') { frame.src = 'about:blank'; setTimeout(() => setFrame(frame, it, false), 30); } else if (mode === 'srcdoc') setFrame(frame, it, false); } }, '↻ Neu abspielen'), el('button', { onclick: close }, 'Schließen ✕')))));
    document.body.append(m); document.addEventListener('keydown', esc); m.querySelector('.add').focus();
  }

  render(); armProbe();
})();
