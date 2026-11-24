/* library preview runner: runs inside each card's iframe. Config comes from location.hash (JSON):
   {kind,id,theme,demo?,set?}. Every demo loops forever so the card behaves like a video preview. */
(function () {
  'use strict';
  const D = window.Deck, T = window.__THEMES;
  let cfg = {}; try { cfg = JSON.parse(decodeURIComponent(window.__CFG || location.hash.slice(1))); } catch (e) {}
  const timers = []; const later = (f, ms) => timers.push(setTimeout(f, ms)); const every = (f, ms) => timers.push(setInterval(f, ms));

  function theme(id) {
    const p = T.presets[id] || T.presets.midnight, f = T.fonts[p.font] || T.fonts.grotesk, r = document.documentElement.style;
    Object.entries({ '--bg': p.bg, '--surface': p.surface, '--text': p.text, '--muted': p.muted, '--line': p.line, '--accent': p.accent, '--accent2': p.accent2, '--on-accent': p.onAccent, '--font-d': f.d, '--font-b': f.b, '--font-m': f.m, '--w-d': f.wd }).forEach(([k, v]) => r.setProperty(k, v));
  }
  const brief = (pages, o) => Object.assign({ meta: { title: '' }, nav: { mode: 'deck', transition: 'fade-blur', rail: false }, bg: { id: 'none' }, theme: { fx: [] }, pages }, o || {});
  const start = b => { D.start(JSON.parse(JSON.stringify(b))); document.body.classList.add('pv'); try { parent.postMessage({ hes: 'ready' }, '*'); } catch (e) {} };

  // three visibly different pages so a transition is readable in a small card
  const trio = enter => [
    { id: 'a', type: 'hero', kicker: 'Kapitel 1', title: 'Die *Ausgangslage*', enter: enter || 'fade-up', sub: 'Seite A' },
    { id: 'b', type: 'stats', title: 'Seite *B*', enter: enter || 'fade-up', items: [{ value: 24, label: 'Beispiel' }, { value: 87, suffix: '%', label: 'Beispiel' }, { value: 3, label: 'Beispiel' }] },
    { id: 'c', type: 'statement', kicker: 'Kapitel 2', title: 'Seite *C*', enter: enter || 'fade-up' }
  ];
  function cycle(b, ms) {
    start(b); let i = 0; const n = b.pages.length;
    every(() => { if (D.busy()) return; i = (i + 1) % n; D.go(i); }, ms || 2600);
  }

  // synthetic pointer that wanders over the page, so hover/cursor effects show without a mouse
  function ghostPointer() {
    let t = 0, real = 0;
    addEventListener('pointermove', e => { if (e.isTrusted) real = performance.now(); }, { passive: true });
    every(() => {
      if (performance.now() - real < 1500) return; t += .045;
      const x = innerWidth * (.5 + .36 * Math.sin(t * 1.3)), y = innerHeight * (.55 + .28 * Math.sin(t * 2.1 + 1));
      const el = document.elementFromPoint(x, y) || document.body;
      el.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true }));
    }, 33);
  }

  theme(cfg.theme || 'midnight');
  const k = cfg.kind, id = cfg.id;
  // a design theme: tokens + fonts + component CSS (html[data-design]) + its own motion grammar, shown as a mini website
  function design(d) {
    const r = document.documentElement, t = d.tokens, f = d.fonts; r.dataset.design = d.id;
    Object.entries({ '--bg': t.bg, '--surface': t.surface, '--text': t.text, '--muted': t.muted, '--line': t.line, '--accent': t.accent, '--accent2': t.accent2, '--on-accent': t.onAccent, '--font-d': f.d, '--font-b': f.b, '--font-m': f.m, '--w-d': f.wd }).forEach(([a, v]) => r.style.setProperty(a, v));
  }
  // media references "media:key" resolve to files embedded once in this preview document (VEYRA example, MIT)
  const MED = window.__MEDIA || {};
  const res = o => JSON.parse(JSON.stringify(o), (k2, v) => (typeof v === 'string' && v.startsWith('media:') ? MED[v.slice(6)] || '' : v));
  const veyra = () => res({ id: 'v', type: 'hotspots', title: 'Electric, inside out.', sub: 'Explore beneath the surface.\nSelect a point to begin.', src: MED.exterior ? 'media:exterior' : undefined, ratio: '1670 / 941', backLabel: 'Back to vehicle',
    meta: 'VEYRA — Design study (MIT, Amir Mušić)', footer: [{ title: 'Electric drive', text: 'Lift the hood.' }, { title: 'Battery architecture', text: 'Look beneath the body.' }, { title: 'Body finishes', text: 'Five colours.' }, { title: 'Wheel designs', text: 'Three expressions.' }],
    points: [{ x: 25, y: 48, label: 'Electric drive', hover: MED.hoodF ? { forward: 'media:hoodF', reverse: 'media:hoodR' } : undefined, detail: { src: MED.drive ? 'media:drive' : undefined, kicker: 'Power delivery', title: 'Electricity,\ninto motion.', text: 'The electric motor turns electrical energy into rotation.', items: [{ label: 'Stator windings', text: 'Stationary windings create a rotating magnetic field.', x: 32, y: 46 }, { label: 'Rotor', text: 'The rotor turns within the stator.', x: 24, y: 49 }, { label: 'Reduction gear', text: 'Gearing lowers rotational speed.', x: 48, y: 51 }] } },
      { x: 64, y: 72, label: 'Battery' }, { x: 55, y: 51, label: 'Paint', text: 'Body colour', variants: [{ label: 'Studio Silver', color: '#c9cfd2' }, { label: 'Electric Green', color: '#edff39', src: MED.green ? 'media:green' : undefined }] }, { x: 48, y: 71, label: 'Wheels' }] });
  // demo loop for the stage: hover the hood, open the drive detail, back, paint green
  function stageLoop() {
    const q = s => document.querySelector('.stage.is-active ' + s), pt = k => q(`.hs-plane > .hs-pt[data-k="${k}"]`);
    const ev = (el, t) => el && el.dispatchEvent(new PointerEvent(t, { bubbles: false }));
    const run = () => { later(() => ev(pt(0), 'pointerenter'), 1200); later(() => ev(pt(0), 'pointerleave'), 3600); later(() => pt(0) && pt(0).click(), 5600);
      later(() => { const b = q('.hs-back'); b && b.click(); }, 9000); later(() => pt(2) && pt(2).click(), 10600); later(() => { const s = document.querySelectorAll('.stage.is-active .hs-sw button')[1]; s && s.click(); }, 11400);
      later(() => pt(2) && pt(2).click(), 14000); };
    run(); every(run, 15500);
  }
  if (k === 'scene' && id === 'model') {   // 3D model scene: demo drone (own procedural model, MIT) through every look
    const d = (window.__DESIGNS || []).find(x => x.id === 'data-transfer'); if (d) design(d);
    const P = (t, kk, tr) => ({ id: 'p' + t.length + kk, type: 'statement', kicker: kk, title: t, transition: tr });
    const shots = [{ az: 35, el: 14, dist: 6.4, x: .26 }, { az: 70, el: 8, dist: 4.4, x: .22, look: 'xray', focus: ['LiDAR', 'Gimbal'], notes: [{ at: 'LiDAR', label: 'LiDAR' }, { at: 'Gimbal', label: 'Kamera' }] },
      { az: 20, el: 22, dist: 6, x: .2, look: 'blueprint', explode: .7 }, { az: 0, el: 60, dist: 5.4, x: .2, look: 'hologram', anim: 'Rotors' }, { az: 140, el: 10, dist: 5, x: .2, look: 'points' }];
    cycle(brief([P('Studio-*Look*', 'Kamerafahrt'), P('Röntgen-*Scan*', 'Bauteile leuchten', 'fade-blur'), P('Blaupause, *explodiert*', 'Aufbau', 'fade-blur'), P('*Hologramm*', 'Animation aus dem GLB', 'fade-blur'), P('*Punktwolke*', 'Digitaler Zwilling', 'fade-blur')],
      { nav: { mode: 'deck', transition: 'fade-blur', rail: false }, scene: { kind: 'model', src: MED.drone, intro: 'scan', spin: 6, shots } }), 5200);
    ghostPointer(); return;
  }
  if (k === 'page' && id === 'hotspots') { start(brief([veyra()], { theme: { fx: [] } })); stageLoop(); return; }
  if (k === 'design') {
    const d = (window.__DESIGNS || []).find(x => x.id === id); if (!d) return;
    design(d); const m = d.motion;
    if (id === 'veyra-studio') { start(brief([veyra()], { nav: { mode: 'deck', rail: false } })); stageLoop(); return; }
    const pages = [
      { id: 'a', type: 'hero', kicker: d.name, title: 'Die Zukunft *sichtbar* machen', sub: d.tagline, cta: { label: 'Mehr erfahren', to: 'b' } },
      { id: 'b', type: 'split', kicker: 'Reifegrad', title: 'Ein Wert, *sofort* verstanden', bullets: ['Zählt hoch und zeichnet den Ring', 'Beispielwert, kein echter'], visual: { type: 'ring', value: 72, suffix: '%', label: 'Beispiel' }, transition: m.calm },
      { id: 'c', type: 'stats', kicker: 'Wirkung', title: 'Drei Zahlen, *ein* Bild', items: [{ value: 24, label: 'Beispiel A' }, { value: 87, suffix: '%', label: 'Beispiel B' }, { value: 3.4, decimals: 1, suffix: 'x', label: 'Beispiel C' }], transition: m.chapter },
      { id: 'd', type: 'cards', kicker: 'Bausteine', title: 'Was wir *liefern*', items: [{ icon: 'layers', title: 'Plattform', text: 'Kurzer Beispieltext.', tag: '01' }, { icon: 'chart', title: 'Analyse', text: 'Kurzer Beispieltext.', tag: '02' }, { icon: 'route', title: 'Umsetzung', text: 'Kurzer Beispieltext.', tag: '03' }], transition: m.calm },
      { id: 'e', type: 'hub', kicker: 'Portfolio', title: 'Alles *verbunden*', style: m.hub || 'orbit', core: 'Kern', coreHint: 'Beispiel', items: [{ title: 'Daten' }, { title: 'Cloud' }, { title: 'Sicherheit' }, { title: 'Menschen' }, { title: 'Prozesse' }], transition: m.wow }
    ];
    cycle(brief(pages, { nav: { mode: 'deck', transition: m.calm, enter: m.enter, rail: true }, bg: { id: m.bg || 'none', intensity: m.bgIntensity || 1 }, theme: { fx: m.fx || [] }, scene: d.scene }), 5200);
    ghostPointer();
  } else if (k === 'bg') {
    start(brief([{ id: 'a', type: 'hero', align: 'center', kicker: 'Hintergrund', title: cfg.name || id, enter: 'fade-up' }], { bg: { id, intensity: 1.35 } }));
    ghostPointer();
  } else if (k === 'tx') {
    const run = () => start(brief([{ id: 'a', type: 'statement', kicker: 'Titel-Animation', title: 'Präsentationen, die *begeistern*', enter: id }]));
    run(); every(run, 3800);
  } else if (k === 'tr' && id === 'shared') {
    cycle(brief([{ id: 'a', type: 'statement', title: 'Eine *Aussage*', shared: 'k' }, { id: 'b', type: 'split', title: 'Eine *Aussage*', shared: 'k', bullets: ['Der Titel ist hierher geflogen', 'Darunter folgt der Beleg'], visual: { type: 'ring', value: 70, label: 'Beleg' } }], { nav: { mode: 'deck', transition: 'fade-blur', rail: false } }), 3000);
  } else if (k === 'tr' && id === 'morph-open') {
    start(brief([{ id: 'a', type: 'cards', title: 'Karte *anklicken*', items: [{ icon: 'bolt', title: 'Bereich A', to: 's1' }, { icon: 'shield', title: 'Bereich B', to: 's1' }, { icon: 'spark', title: 'Bereich C', to: 's1' }], subpages: [{ id: 's1', type: 'statement', title: 'Detailseite *wächst aus der Karte*' }] }]));
    const loop = () => { const c = document.querySelectorAll('.stage.is-active .card')[1]; if (c) D.open('s1', c.getBoundingClientRect()); later(() => D.back(), 2200); };
    later(loop, 1400); every(loop, 4400);
  } else if (k === 'tr') {
    cycle(brief(trio(), { nav: { mode: 'deck', transition: id, rail: false } }), id === 'warp-tunnel' ? 3800 : ['data-converge', 'portal-dive', 'shatter', 'ink-goo'].includes(id) ? 3200 : id === 'tiles' || id === 'blinds' || id === 'shutter' || id === 'color-sweep' ? 3000 : 2500);
  } else if (k === 'fx') {
    const fxl = [id];
    start(brief([{ id: 'a', type: 'cards', title: 'Finish: *' + (cfg.name || id) + '*', items: [{ icon: 'bolt', title: 'Karte', text: 'Hover mich' }, { icon: 'layers', title: 'Karte', text: 'Hover mich' }, { icon: 'spark', title: 'Karte', text: 'Hover mich' }] }], { bg: { id: id === 'glass' ? 'blobs' : 'none' }, theme: { fx: fxl } }));
    ghostPointer();
    if (id === 'click-ripple') every(() => { const c = document.querySelectorAll('.card')[(Math.random() * 3) | 0]; if (!c) return; const r = c.getBoundingClientRect(); c.dispatchEvent(new PointerEvent('pointerdown', { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, bubbles: true })); }, 900);
  } else if (k === 'cam') {
    const p = Object.assign({ id: 'a' }, cfg.demo || { type: id });
    const run = () => start(brief([p], { bg: { id: 'none' } }));
    run(); every(run, id === 'flyover' ? 16000 : id === 'end-card' ? 8000 : 10000);
  } else if (k === 'page' || k === 'visual') {
    const p = Object.assign({ id: 'a' }, cfg.demo || { type: 'statement', title: id });
    const run = () => start(brief([p]));
    run(); every(run, p.type === 'big-list' || p.type === 'kinetic' ? 9000 : 6500);
    if (p.type === 'hub' || p.type === 'cards' || p.type === 'bento') ghostPointer();
  } else if (k === 'look') {
    const s = cfg.set || {}; theme(s.theme || 'midnight');
    cycle(brief(trio(s.enter), { nav: { mode: 'deck', transition: s.tr, rail: false }, bg: { id: s.bg || 'none' }, theme: { fx: s.fx || [] } }), 3000);
    ghostPointer();
  }
})();
