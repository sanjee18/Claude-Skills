/* DEMO-Projekt der Bauart "Erlebnis-Hub". Zeigt die Mechanik: Hub-Items, Gruppen, ein eigener Übergang pro Seitenpaar,
   Szenen-Hooks, Inhalts-Visuals aus Daten. Inhalt, Farben und Visuals sind im echten Projekt komplett eigene. */
(function () {
  const $ = q => document.querySelector(q), $$ = q => [...document.querySelectorAll(q)];
  const I = { // icon paths (24er Raster, 1.5 Strich) – im Projekt eigene zeichnen
    berth: '<path d="M3 17h18M5 17l2-6h10l2 6M9 11V6h6v5"/>', yard: '<rect x="4" y="5" width="7" height="6"/><rect x="13" y="5" width="7" height="6"/><rect x="4" y="13" width="7" height="6"/><rect x="13" y="13" width="7" height="6"/>',
    gate: '<path d="M4 20V6M20 20V6M4 9h16"/><path d="M8 13h8"/>', power: '<path d="M13 3 6 13h5l-1 8 7-10h-5z"/>', crew: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.2c2.8.3 5 2.4 5 5.8"/>'
  };
  const C = { flow: '#3fb6ff', grid: '#38d9b0', people: '#b18cff' };
  const items = [
    { id: 'berth', label: 'Liegeplatz', sub: 'Planung nach Prognose', icon: I.berth, color: C.flow, group: 'Schiffsfluss' },
    { id: 'yard', label: 'Yard', sub: 'Steuerung', icon: I.yard, color: C.flow, group: 'Schiffsfluss' },
    { id: 'gate', label: 'Smart Gate', sub: 'Landseite', icon: I.gate, color: C.grid, group: 'Infrastruktur' },
    { id: 'power', label: 'Landstrom', sub: 'Netz & CO₂', icon: I.power, color: C.grid, group: 'Infrastruktur' },
    { id: 'crew', label: 'Organisation', sub: 'Rollen & Takt', icon: I.crew, color: C.people, group: 'Menschen' }
  ];
  const groups = [{ name: 'Schiffsfluss', color: C.flow, items: ['berth', 'yard'] }, { name: 'Infrastruktur', color: C.grid, items: ['gate', 'power'] },
    { name: 'Menschen', color: C.people, items: ['crew'] }];

  /* ---------- eigene Übergänge pro Seitenpaar (Regiebuch-Spalte "Übergang") ---------- */
  const transitions = {
    // Heute → Morgen: die Lineal-Zahl schrumpft, bevor die Seite wechselt (erzählt "Wartezeit fällt")
    'today>tomorrow': async c => {
      const n = $('#hoursNum'); await Exp.anim(n, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.4) translateY(-30%)', opacity: 0 }], { duration: 600, easing: Exp.ease.inOut });
      await Exp.transitions.push(c); Exp.clean(n);
    },
    'tomorrow>hub': 'converge',               // Band zieht sich zusammen → das Zahnrad verdichtet sich
    'hub>outro': 'dissolve', 'sub>outro': 'dissolve',
    'berth-1>berth-2': 'lift',
    '*>b-cost': 'fade'
  };

  /* ---------- Inhalts-Visuals ---------- */
  // Intro-Stand-in: Lichtlinien über einem Horizont (im echten Projekt: generiertes Video / GLB / eigener Shader)
  function harbour() {
    const cv = $('#harbour'), x = cv.getContext('2d'); let w, h, dpr;
    const fit = () => { dpr = Math.min(2, devicePixelRatio); w = cv.width = innerWidth * dpr; h = cv.height = innerHeight * dpr; };
    fit(); addEventListener('resize', fit);
    const lines = Array.from({ length: 60 }, (_, i) => ({ y: .64 + Math.pow(i / 60, 1.6) * .36, s: .2 + Math.random() * .8, o: Math.random() * 6.28 }));
    const draw = t => {
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#03060b'); g.addColorStop(.64, '#0a1a2a'); g.addColorStop(.68, '#071019'); g.addColorStop(1, '#02040a');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      const sun = x.createRadialGradient(w * .5, h * .64, 0, w * .5, h * .64, w * .45); sun.addColorStop(0, 'rgba(95,200,255,.28)'); sun.addColorStop(1, 'rgba(95,200,255,0)');
      x.fillStyle = sun; x.fillRect(0, 0, w, h);
      lines.forEach(L => { const y = L.y * h, k = (L.y - .64) * 2.8; x.strokeStyle = `rgba(140,215,255,${.05 + k * .22})`; x.lineWidth = dpr * (0.5 + k);
        x.beginPath(); for (let i = 0; i <= 60; i++) { const px = i / 60 * w; x.lineTo(px, y + Math.sin(i * .35 + t * .0006 * L.s + L.o) * 3 * dpr * (1 + k * 3)); } x.stroke(); });
      x.fillStyle = '#02050a'; [[.06, .12, .03], [.11, .17, .025], [.84, .15, .035], [.9, .2, .025], [.95, .12, .02]].forEach(([cx, hh, ww]) => { // Kran-Silhouetten
        x.fillRect(w * cx, h * (.64 - hh), w * .003, h * hh); x.fillRect(w * (cx - ww), h * (.64 - hh), w * ww * 2.4, h * .005); });
      if (document.body.dataset.role === 'intro' && !Exp.reduced) requestAnimationFrame(draw);
    };
    document.addEventListener('exp:progress', () => { if (document.body.dataset.role === 'intro') requestAnimationFrame(draw); });
    requestAnimationFrame(draw);
  }
  function ruler() {
    const s = $('#ruler'); let d = '';
    for (let i = 0; i <= 100; i++) { const x = i * 10, hgt = i % 10 ? (i % 5 ? 14 : 26) : 44; d += `<line x1="${x}" x2="${x}" y1="${120 - hgt}" y2="120"/>`; }
    s.innerHTML = d + '<rect class="wait" x="0" y="0" width="0" height="4"/>';
  }
  function countUp(el, to, ms) { const t0 = performance.now(); const f = t => { const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 4); el.textContent = Math.round(to * e); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }
  function weeks() {
    const W = ['Daten anbinden', 'ETA-Modell', 'Schatten-Betrieb', 'Schatten-Betrieb', 'Live mit 2 Plätzen', 'Live mit 2 Plätzen', 'Messen', 'Entscheidung'];
    $('.weeks-track').innerHTML = W.map((w, i) => `<li style="--k:${i}"><span class="x-mono">W${i + 1}</span><b>${w}</b></li>`).join('');
  }
  function gateToggle() {
    const lanes = $('.lanes'), tg = $('.toggle'); $$('.trucks').forEach((t, i) => { t.innerHTML = '<i></i>'.repeat(8 - i * 2); });
    tg.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; tg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      tg.dataset.state = b.dataset.state; lanes.dataset.state = b.dataset.state; const k = $('.lane-kpi b'); k.textContent = k.dataset[b.dataset.state]; });
  }


  /* Eigenes Hub-Objekt: ein Containerkran, dessen Bauteile die Hebel sind. So entsteht jede Wunschform
     (Roboter, Turm, Rakete …): Objekt zeichnen, jedes klickbare Bauteil in <g data-item="…"> legen, Exp.parts(svg). */
  function crane(host) {
    const lab = (id, x, y, w, ax, ay) => { const it = items.find(i => i.id === id), right = x < ax;
      return `<path class="cr-lead" d="M${ax} ${ay}L${right ? x + w : x} ${y + 20}"/><circle class="cr-dot" cx="${ax}" cy="${ay}" r="4"/>
        <foreignObject x="${x}" y="${y}" width="${w}" height="46"><div xmlns="http://www.w3.org/1999/xhtml" class="cr-l${right ? ' r' : ''}"><b>${it.label}</b><span>${it.sub}</span></div></foreignObject>`; };
    let truss = ''; for (let x = 90; x < 760; x += 30) truss += `M${x} 140L${x + 15} 168L${x + 30} 140`;
    host.innerHTML = `<svg class="crane" viewBox="0 0 860 660" role="group" aria-label="Portfolio-Kran">
      <path class="cr-ground" d="M40 612H820"/>
      <g data-item="gate" style="--by:40px"><path class="s f" d="M218 604L262 236H292L262 604ZM540 604L500 236H530L570 604Z"/>
        <path class="s" d="M246 380L530 380M236 470L548 470M246 380L548 470M236 470L530 380"/><rect class="s f" x="196" y="596" width="96" height="16" rx="4"/><rect class="s f" x="516" y="596" width="96" height="16" rx="4"/>
        ${lab('gate', 600, 500, 170, 556, 520)}</g>
      <g data-item="power" style="--by:-30px"><rect class="s f" x="300" y="178" width="200" height="58" rx="6"/><path class="s" d="M320 196h40M320 210h40M380 192v30M396 192v30M412 192v30"/>
        ${lab('power', 80, 250, 170, 300, 220)}</g>
      <g data-item="berth" style="--bx:-60px;--by:0px;--hx:-8px;--hy:0px"><path class="s f" d="M70 140H790V168H70Z"/><path class="s thin" d="${truss}"/><path class="s" d="M380 140L400 70L420 140M400 70L790 140M400 70L70 140"/>
        ${lab('berth', 40, 40, 170, 200, 110)}</g>
      <g data-item="yard" style="--by:-40px;--hx:10px;--hy:0px"><rect class="x-hit" x="610" y="168" width="120" height="274"/><rect class="s f" x="640" y="168" width="60" height="22" rx="3"/><path class="s thin" d="M652 190V372M688 190V372"/>
        <rect class="s f" x="618" y="372" width="104" height="12" rx="2"/><rect class="s f box" x="610" y="386" width="120" height="56" rx="3"/><path class="s thin" d="M630 392v44M650 392v44M670 392v44M690 392v44M710 392v44"/>
        ${lab('yard', 690, 460, 170, 700, 442)}</g>
      <g data-item="crew" style="--by:-20px"><path class="s f glass" d="M532 172H600V214H540Z"/><path class="s thin" d="M548 180h40v24h-34"/>
        ${lab('crew', 612, 222, 150, 598, 206)}</g>
    </svg>`;
    Exp.parts(host.firstElementChild);
  }

  // Legende neben dem Hub-Element
  $('#legend').innerHTML = groups.map(g => `<div class="lg" style="--c:${g.color}"><i></i>${g.name}<em>${g.items.length}</em></div>`).join('');

  Exp.on('today', { enter: () => countUp($('#hoursNum'), 38, 1400) });   // Platzhalterzahl im Demo: im Projekt nur belegte Zahlen

  Exp.init({
    items, transitions,
    brand: '<svg viewBox="0 0 28 28"><path d="M14 2 26 14 14 26 2 14Z" fill="#fff"/></svg>',
    title: 'Hafenwerk · Portfolio',
    labels: { hub: 'Portfolio', menu: 'Übersicht' },
    ready: async () => {
      harbour(); ruler(); weeks(); gateToggle();
      // Hub-Element = Entscheidung des Nutzers (Briefing E0). Demo: ?hub=kran (eigenes Objekt) | pyramide | zahnrad
      const form = new URLSearchParams(location.search).get('hub') || 'kran';
      if (form === 'zahnrad') Exp.gear($('#gear'), { items, groups, center: { kicker: 'Hafenwerk', title: 'OS', sub: 'Portfolio' }, label: 'Portfolio' });
      else if (form === 'pyramide') Exp.pyramid($('#gear'), { items: ['crew', 'power', 'gate', 'yard', 'berth'].map(id => items.find(i => i.id === id)), label: 'Portfolio' });
      else crane($('#gear'));
      $$('[data-mini]').forEach(m => Exp.mini(m, m.dataset.mini));
      Exp.mini($('#outroGear'), null);
    }
  });
})();
