/* text4.js · text entrances with depth, light and weight (overrides the flat versions in text.js / text2.js / text3.js).
   What was wrong: every unit moved the same distance with the same easing at an even stagger, and nothing happened to the
   LIGHT on the glyphs. Reference-level type arrives like an object:
   (1) non-linear stagger (the first words lead, the rest follow quickly) with a tiny deterministic jitter, so it never reads as a metronome
   (2) arrival from depth: perspective, rotateX/Y, brightness as shading (turned-away faces are dark), motion blur that peaks mid-flight
   (3) a short glow on landing (accent text-shadow) that decays; an overshoot of ~3 % that settles
   (4) masks with a counter-rotation (the word swings out of the mask instead of sliding)
   Kept as they were: scramble, typewriter, glitch, marker, outline-fill, underline-draw (distinct looks). Reduced motion: D.an shortens all of it. */
(function () {
  'use strict';
  const D = window.Deck, R = D.reg.tx, an = D.an, split = D.split;
  const EO = 'cubic-bezier(.16,1,.3,1)', EOUT = 'cubic-bezier(.22,1,.36,1)', all = ps => Promise.all(ps);
  const GLOW = 'color-mix(in srgb, var(--accent) 55%, transparent)', NOGLOW = 'color-mix(in srgb, var(--accent) 0%, transparent)';
  const jit = i => ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;                    // deterministic 0..1
  // stagger: delay of item i of n inside `total` ms; curve < 1 front-loads (leaders first, followers close together)
  const st = (i, n, total, curve = .72) => total * Math.pow(i / Math.max(n - 1, 1), curve) + (jit(i) - .5) * Math.min(26, total / Math.max(n, 1) * .5);
  const open = el => { el.style.overflow = 'visible'; };                                    // 3D words must not be clipped by their mask
  const persp = (el, p = 900) => { el.style.perspective = p + 'px'; };
  const total = (n, per = 55, max = 800) => Math.min(max, n * per);

  // words swing out of a mask: counter-rotation + a 3 % overshoot, glow on landing
  R['mask-words'] = (el, o) => {
    const ws = split(el, 'words'), T = total(ws.length, 70, 760);
    return all(ws.map((w, i) => an(w, [
      { transform: 'translateY(115%) rotate(4deg)', transformOrigin: '0% 100%', filter: 'blur(3px)', offset: 0 },
      { transform: 'translateY(-3%) rotate(-.4deg)', filter: 'blur(0)', offset: .72 },
      { transform: 'none', offset: 1 }], { duration: 1050, delay: (o.delay || 0) + st(i, ws.length, T), easing: EO })));
  };
  // rack-focus words that fly in from different depths; each is dark while turned away, flashes bright when it lands
  R['blur-words'] = (el, o) => {
    const ws = split(el, 'words'), T = total(ws.length, 60, 720); persp(el, 1000);
    ws.forEach(w => open(w.parentNode));
    return all(ws.map((w, i) => an(w, [
      { opacity: 0, filter: 'blur(16px) brightness(.55)', transform: `translate3d(${(jit(i) - .5) * 24}px,${14 + jit(i + 3) * 14}px,${-140 - jit(i + 7) * 120}px) rotateX(${18 + jit(i + 1) * 14}deg)`, textShadow: `0 0 0 ${NOGLOW}`, offset: 0 },
      { opacity: 1, filter: 'blur(2px) brightness(1.5)', textShadow: `0 0 .4em ${GLOW}`, offset: .62 },
      { opacity: 1, filter: 'blur(0) brightness(1)', transform: 'none', textShadow: `0 0 0 ${NOGLOW}`, offset: 1 }], { duration: 980, delay: (o.delay || 0) + st(i, ws.length, T), easing: EO })));
  };
  // letters tip up from their baseline like cards standing up
  R.chars = (el, o) => {
    const cs = split(el, 'chars'), T = total(cs.length, 26, 900); persp(el, 700); cs.forEach(c => open(c.parentNode));
    return all(cs.map((c, i) => an(c, [
      { opacity: 0, transform: 'rotateX(-75deg) translateY(30%)', transformOrigin: '50% 100%', filter: 'blur(5px) brightness(.5)', offset: 0 },
      { opacity: 1, transform: 'rotateX(6deg)', filter: 'blur(0) brightness(1.35)', offset: .7 },
      { opacity: 1, transform: 'none', filter: 'brightness(1)', offset: 1 }], { duration: 800, delay: (o.delay || 0) + st(i, cs.length, T, .85), easing: EO })));
  };
  R['fade-up'] = (el, o) => an(el, [{ opacity: 0, transform: 'translateY(26px) scale(.985)', filter: 'blur(8px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 1000, delay: o.delay || 0, easing: EO });
  R.rise = R['fade-up'];
  R['split-lines'] = (el, o) => {
    const ws = split(el, 'words'), tops = [...new Set(ws.map(w => w.parentNode.offsetTop))].sort((a, b) => a - b);
    return all(ws.map(w => { const li = tops.indexOf(w.parentNode.offsetTop); return an(w, [
      { transform: 'translateY(118%) rotate(3.5deg) skewY(4deg)', transformOrigin: '0% 100%', offset: 0 },
      { transform: 'translateY(-3%) rotate(0) skewY(0)', offset: .7 }, { transform: 'none', offset: 1 }], { duration: 1100, delay: (o.delay || 0) + li * 140 + jit(li * 7 + 1) * 18, easing: EO }); }));
  };
  // words fold down from the top edge of their line: dark while folded, lit when flat (real shading from brightness)
  R['rotate-words'] = (el, o) => {
    const ws = split(el, 'words'), T = total(ws.length, 70, 760); ws.forEach(w => { open(w.parentNode); w.parentNode.style.perspective = '700px'; });
    return all(ws.map((w, i) => an(w, [
      { opacity: 0, transform: 'rotateX(-92deg)', transformOrigin: '50% 100%', filter: 'brightness(.3)', offset: 0 },
      { opacity: 1, transform: 'rotateX(8deg)', filter: 'brightness(1.45)', offset: .68 },
      { opacity: 1, transform: 'none', filter: 'brightness(1)', offset: 1 }], { duration: 1000, delay: (o.delay || 0) + st(i, ws.length, T), easing: EO })));
  };
  // words arrive from behind the camera: huge, blown out and unfocused, then settle to size
  R['zoom-words'] = (el, o) => {
    const ws = split(el, 'words'), T = total(ws.length, 90, 800); ws.forEach(w => open(w.parentNode));
    return all(ws.map((w, i) => an(w, [
      { opacity: 0, transform: 'scale(2.6)', filter: 'blur(18px) brightness(2)', offset: 0 },
      { opacity: 1, transform: 'scale(.97)', filter: 'blur(0) brightness(1.2)', offset: .75 },
      { opacity: 1, transform: 'none', filter: 'brightness(1)', offset: 1 }], { duration: 1050, delay: (o.delay || 0) + st(i, ws.length, T, .8), easing: EO })));
  };
  R['flip-chars'] = (el, o) => {
    const cs = split(el, 'chars'), T = total(cs.length, 30, 800); cs.forEach(c => { open(c.parentNode); c.parentNode.style.perspective = '600px'; });
    return all(cs.map((c, i) => an(c, [
      { opacity: 0, transform: 'rotateY(-95deg)', filter: 'brightness(.25)', offset: 0 },
      { opacity: 1, transform: 'rotateY(10deg)', filter: 'brightness(1.5)', offset: .7 },
      { opacity: 1, transform: 'none', filter: 'brightness(1)', offset: 1 }], { duration: 850, delay: (o.delay || 0) + st(i, cs.length, T, .9), easing: EO })));
  };
  R['slot-chars'] = (el, o) => {
    const cs = split(el, 'chars'); cs.forEach(c => { const p = c.parentNode; p.style.overflow = 'hidden'; p.style.verticalAlign = 'top'; p.style.paddingBottom = '.14em'; });
    return all(cs.map((c, i) => an(c, [
      { transform: 'translateY(-125%)', filter: 'blur(6px)', offset: 0 }, { transform: 'translateY(10%)', filter: 'blur(1px)', offset: .72 }, { transform: 'none', filter: 'blur(0)', offset: 1 }],
      { duration: 780 + (i % 3) * 150, delay: (o.delay || 0) + ((i * 37) % 11) * 42, easing: 'cubic-bezier(.2,.75,.3,1)' })));
  };
  R['blur-chars'] = (el, o) => {
    const cs = split(el, 'chars'); cs.forEach(c => open(c.parentNode));
    return all(cs.map((c, i) => an(c, [
      { opacity: 0, transform: 'scale(.88)', filter: 'blur(10px)', textShadow: `0 0 0 ${NOGLOW}`, offset: 0 },
      { opacity: 1, transform: 'scale(1.02)', filter: 'blur(0)', textShadow: `0 0 .5em ${GLOW}`, offset: .6 },
      { opacity: 1, transform: 'none', filter: 'blur(0)', textShadow: `0 0 0 ${NOGLOW}`, offset: 1 }], { duration: 900, delay: (o.delay || 0) + ((i * 29) % 17) * 38, easing: EOUT })));
  };
  R['wave-chars'] = (el, o) => {
    const cs = split(el, 'chars'), T = total(cs.length, 28, 850); cs.forEach(c => open(c.parentNode));
    return all(cs.map((c, i) => an(c, [
      { opacity: 0, transform: 'translateY(70%) scale(.55) rotate(-8deg)', filter: 'blur(4px)', offset: 0 },
      { opacity: 1, transform: 'translateY(-12%) scale(1.06) rotate(1deg)', filter: 'blur(0)', offset: .6 },
      { opacity: 1, transform: 'none', offset: 1 }], { duration: 900, delay: (o.delay || 0) + st(i, cs.length, T, 1), easing: EO })));
  };
  R['tracking-in'] = (el, o) => {
    const ls = getComputedStyle(el).letterSpacing === 'normal' ? '0em' : getComputedStyle(el).letterSpacing;
    return an(el, [{ opacity: 0, letterSpacing: '.5em', filter: 'blur(14px) brightness(1.6)', transform: 'scale(1.04)' }, { opacity: 1, letterSpacing: ls, filter: 'blur(0) brightness(1)', transform: 'none' }], { duration: 1500, delay: o.delay || 0, easing: EO });
  };
  R['word-rise'] = (el, o) => {
    const ws = split(el, 'words'), T = total(ws.length, 60, 700); ws.forEach(w => open(w.parentNode));
    return all(ws.map((w, i) => an(w, [{ opacity: 0, transform: 'translateY(22px) scale(.98)', filter: 'blur(12px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 1000, delay: (o.delay || 0) + st(i, ws.length, T), easing: EO })));
  };
  R['line-rise'] = (el, o) => {
    if (!el.dataset.html) el.dataset.html = el.innerHTML;
    el.innerHTML = el.dataset.html.split(/<br\s*\/?>/i).map(p => '<span class="lr" style="display:block">' + p + '</span>').join('');
    return all([...el.querySelectorAll('.lr')].map((l, i) => an(l, [{ opacity: 0, transform: 'translateY(26px)', filter: 'blur(12px) brightness(.7)' }, { opacity: 1, transform: 'none', filter: 'blur(0) brightness(1)' }], { duration: 1100, delay: (o.delay || 0) + i * 150, easing: EO })));
  };
})();
