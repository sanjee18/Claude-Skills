/* scene.js · persistent signature scene behind all pages (WebGL2, no libraries, offline).
   One GPU particle world for the whole deck: every page is a "shot" (shape + camera). On a page change the particles
   flow from the old shape into the new one (staggered springs + curl noise), the camera glides to the new framing,
   the cursor stirs the cloud and it heals back. "Every shot is made out of the previous one."

   Brief:  scene: { kind:"particles", blend:"add"|"normal", density:1, size:1, spin:0.04, noise:1, alpha, route:"accent"|"accent2", shots:[{shape, cam}] }
           page.scene: { shape, cam, text }   (overrides the shot for that page)
   Shapes: ring · sphere · globe · galaxy · helix · wave · terrain · tunnel · brain · lattice · scatter · iris · fibers · tree · ripple
           box · vortex · orbit · text (text:"87%"). Combine two with "tree+ripple" (mix = share of the first, default .7).
           cfg.with = {kind:"orb"|"media"…} runs a second layer in sync (shot() is forwarded).
           auto: stats/number pages show their first value as particle type when the shot says shape:"numeral".
   Camera: { az (deg), el (deg), dist, x, y (screen shift −1..1, moves the object left/right), fov }
   Colours come from the theme: --text (base), --accent (sparse highlights), --accent2. */
(function () {
  'use strict';
  const D = window.Deck;
  const TAU = Math.PI * 2, rnd = Math.random;
  let S = null;   // running scene

  /* ---------- shapes: Float32Array(n*4) xyz + w (0..1 per-point random, >1.5 = accent route/marker) ---------- */
  function hash(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  const fbm = (x, y, z) => { let a = 0, f = 1, w = .5; for (let o = 0; o < 4; o++) { a += w * (Math.sin(x * f * 1.7 + Math.cos(y * f * 1.3)) * Math.cos(z * f * 1.9 + Math.sin(x * f * .7))); f *= 2.03; w *= .5; } return a; };
  function fill(n, fn) { const a = new Float32Array(n * 4); for (let i = 0; i < n; i++) { const p = fn(i, n); a[i * 4] = p[0]; a[i * 4 + 1] = p[1]; a[i * 4 + 2] = p[2]; a[i * 4 + 3] = p[3] == null ? hash(i) : p[3]; } return a; }
  const SHAPES = {
    // twisted hollow ring with soft lobes: the sculpture
    ring: n => fill(n, i => { const u = rnd() * TAU, v = rnd() * TAU, lob = 1 + .32 * Math.sin(3 * u + .6), R = .62, r = .2 * lob * (.92 + .08 * rnd());
      const tw = v + u * 1.5, x = (R + r * Math.cos(tw)) * Math.cos(u), y = (R + r * Math.cos(tw)) * Math.sin(u), z = r * Math.sin(tw) + .12 * Math.sin(2 * u);
      return [x, y * .92 + .05 * Math.sin(5 * u), z]; }),
    sphere: n => fill(n, i => { const k = i + .5, ph = Math.acos(1 - 2 * k / n), th = Math.PI * (1 + Math.sqrt(5)) * k, r = .78 + rnd() * .02; return [r * Math.cos(th) * Math.sin(ph), r * Math.cos(ph), r * Math.sin(th) * Math.sin(ph)]; }),
    // dotted planet: procedural continents on a sphere + three raised route arcs (accent)
    globe: n => { const a = new Float32Array(n * 4), arcs = Math.floor(n * .06); let i = 0, guard = 0;
      while (i < n - arcs && guard++ < n * 40) { const z = 1 - 2 * rnd(), t = rnd() * TAU, s = Math.sqrt(1 - z * z), x = s * Math.cos(t), y = z, w = s * Math.sin(t);
        const land = fbm(x * 1.6 + 3, y * 1.6, w * 1.6) + .18 * Math.sin(y * 3); if (land < .08 && rnd() > .06) continue;
        const r = .8; a[i * 4] = x * r; a[i * 4 + 1] = y * r; a[i * 4 + 2] = w * r; a[i * 4 + 3] = land < .08 ? .05 : hash(i) * .9; i++; }
      const P = [[.3, .5], [2.2, .2], [4.1, .6], [5.3, -.3]];
      for (; i < n; i++) { const k = i % 3, A = P[k], B = P[k + 1], t = rnd();
        const lerp = (p, q) => p + (q - p) * t, th = lerp(A[0], B[0]), la = lerp(A[1], B[1]), h = .8 + .28 * Math.sin(Math.PI * t);
        a[i * 4] = h * Math.cos(la) * Math.cos(th); a[i * 4 + 1] = h * Math.sin(la); a[i * 4 + 2] = h * Math.cos(la) * Math.sin(th); a[i * 4 + 3] = 2; }
      return a; },
    galaxy: n => fill(n, i => { const arm = i % 3, r = Math.pow(rnd(), .6) * .95, ang = arm * TAU / 3 + r * 5.2 + (rnd() - .5) * .5 / (r + .2);
      return [r * Math.cos(ang), (rnd() - .5) * .08 * (1.2 - r), r * Math.sin(ang), r < .12 ? 1.95 : null]; }),
    helix: n => fill(n, i => { const t = (rnd() - .5) * 2, s = i % 2 ? Math.PI : 0, a = t * 7 + s, rung = rnd() < .18, r = .32;
      if (rung) { const k = rnd(), aa = Math.round(t * 14) / 2; return [r * Math.cos(aa) * (k * 2 - 1), t * .95, r * Math.sin(aa) * (k * 2 - 1), 1.9]; }
      return [r * Math.cos(a) + (rnd() - .5) * .03, t * .95, r * Math.sin(a) + (rnd() - .5) * .03]; }),
    wave: n => fill(n, i => { const s = Math.sqrt(n) | 0, gx = (i % s) / s - .5, gz = Math.floor(i / s) / s - .5; return [gx * 2, .12 * Math.sin(gx * 9) * Math.cos(gz * 7), gz * 2]; }),
    terrain: n => fill(n, i => { const s = Math.sqrt(n) | 0, x = (i % s) / s - .5, z = Math.floor(i / s) / s - .5, h = fbm(x * 3, 0, z * 3) * .22 + .1 * Math.exp(-((x - .1) ** 2 + z * z) * 18);
      return [x * 2, h, z * 2, h > .17 ? 1.9 : null]; }),
    tunnel: n => fill(n, i => { const z = rnd() * 4 - 2, a = rnd() * TAU, ring = Math.abs((z * 4) % 1) < .06, r = .7 + (ring ? 0 : (rnd() - .5) * .05); return [r * Math.cos(a), r * Math.sin(a), z, ring ? 1.9 : null]; }),
    brain: n => fill(n, i => { const z = 1 - 2 * rnd(), t = rnd() * TAU, s = Math.sqrt(1 - z * z); let x = s * Math.cos(t), y = z * .82, w = s * Math.sin(t) * 1.15;
      const d = 1 + .13 * fbm(x * 5, y * 5, w * 5), side = Math.sign(x) || 1; return [x * .62 * d + side * .05, y * .62 * d, w * .62 * d]; }),
    lattice: n => fill(n, i => { const e = i % 12, t = rnd() * 2 - 1, c = .62, E = [[t, -1, -1], [t, 1, -1], [t, -1, 1], [t, 1, 1], [-1, t, -1], [1, t, -1], [-1, t, 1], [1, t, 1], [-1, -1, t], [1, -1, t], [-1, 1, t], [1, 1, t]][e];
      return [E[0] * c + (rnd() - .5) * .02, E[1] * c + (rnd() - .5) * .02, E[2] * c + (rnd() - .5) * .02, rnd() < .04 ? 1.9 : null]; }),
    scatter: n => fill(n, () => [(rnd() - .5) * 3, (rnd() - .5) * 2, (rnd() - .5) * 3]),
    // flower: layered cupped petals (rhodonea) around a dotted pistil, petal tips glow (floral worlds)
    flower: n => fill(n, i => { if (rnd() < .06) { const a = rnd() * TAU, r = .09 * Math.sqrt(rnd()); return [r * Math.cos(a), .06 + rnd() * .06, r * Math.sin(a), 1.9]; }
      const layer = Math.floor(rnd() * 3), k = [5, 8, 13][layer], off = layer * .37, a = rnd() * TAU, pet = Math.abs(Math.cos(k / 2 * a + off));
      const r = (.25 + layer * .2) * Math.pow(pet, .6) * Math.sqrt(rnd() * .85 + .15), cup = .32 * Math.pow(r / .65, 1.6) - layer * .05;
      return [r * Math.cos(a), cup + (rnd() - .5) * .012, r * Math.sin(a), pet > .97 && rnd() < .5 ? 1.9 : null]; }),
    // iris: radial fibres around a dark pupil + a ring of white spokes (accent2)
    iris: n => fill(n, i => { if (i % 10 < 2) { const k = Math.floor(rnd() * 56), a = k / 56 * TAU + (rnd() - .5) * .012, r = .66 + rnd() * .1 * (k % 2 ? 1 : .7);
        return [r * Math.cos(a), r * Math.sin(a), (rnd() - .5) * .01, 1.9]; }
      if (i % 10 === 2) { const a = rnd() * TAU, r = .78 + (rnd() - .5) * .006; return [r * Math.cos(a), r * Math.sin(a), 0, 1.9]; }
      const a = rnd() * TAU, t = Math.pow(rnd(), .8), r = .2 + t * .38 + .03 * Math.sin(a * 23), wob = .015 * Math.sin(a * 40 + t * 9);
      return [r * Math.cos(a + wob), r * Math.sin(a + wob), (rnd() - .5) * .05 * (1 - t), t > .96 ? .99 : null]; }),
    // fibres: optic-fibre strands sweeping down, bright beads at the tips
    fibers: n => fill(n, i => { const s = i % 90, h1 = hash(s * 3.1), h2 = hash(s * 7.7), t = rnd(), tip = rnd() < .14;
      const tt = tip ? 1 : t, x = -1 + h1 * .6 + tt * (1.1 + h2 * .9), y = 1.1 - tt * (1.2 + h1 * .9) + .25 * Math.sin(tt * 3 + h2 * 6), z = (h2 - .5) * 1.2 + .2 * Math.sin(tt * 4 + h1 * 9);
      if (tip) { const a = rnd() * TAU, b = Math.acos(2 * rnd() - 1), r = .035 * Math.cbrt(rnd()); return [x + r * Math.sin(b) * Math.cos(a), y + r * Math.cos(b), z + r * Math.sin(b) * Math.sin(a), 1.9]; }
      return [x + (rnd() - .5) * .008, y + (rnd() - .5) * .008, z]; }),
    // tree: trunk + forked branches + a dense noisy canopy
    tree: n => fill(n, i => { const k = rnd();
      if (k < .1) { const t = rnd(), r = .05 * (1 - t * .6), a = rnd() * TAU; return [r * Math.cos(a), -.75 + t * .75, r * Math.sin(a)]; }
      if (k < .3) { const b = Math.floor(rnd() * 14), a = b / 14 * TAU + hash(b) , t = rnd(), el = .5 + hash(b + 9) * .6; return [Math.cos(a) * t * .55 * Math.cos(el), t * .55 * Math.sin(el) + .02, Math.sin(a) * t * .55 * Math.cos(el)]; }
      const a = rnd() * TAU, b = Math.acos(2 * rnd() - 1), d = .62 * Math.cbrt(rnd()) * (1 + .22 * fbm(Math.cos(a) * 3, Math.cos(b) * 3, Math.sin(a) * 3));
      return [d * Math.sin(b) * Math.cos(a) * 1.25, .42 + d * Math.cos(b) * .62, d * Math.sin(b) * Math.sin(a) * 1.25, rnd() < .02 ? 1.9 : null]; }),
    // ripple: concentric rings on the floor
    ripple: n => fill(n, i => { const k = Math.floor(rnd() * 11), r = .18 + k * .15 + (rnd() - .5) * .01, a = rnd() * TAU; return [r * Math.cos(a), -.8 + .01 * Math.sin(r * 30), r * Math.sin(a), k % 3 === 0 ? 1.9 : null]; }),
    // box: glass cube shell, bright edges
    box: n => fill(n, i => { const f = Math.floor(rnd() * 6), u = rnd() * 2 - 1, v = rnd() * 2 - 1, c = .58, edge = Math.max(Math.abs(u), Math.abs(v)) > .97;
      const P = [[1, u, v], [-1, u, v], [u, 1, v], [u, -1, v], [u, v, 1], [u, v, -1]][f]; return [P[0] * c, P[1] * c, P[2] * c, edge ? 1.9 : (rnd() < .3 ? null : .3)]; }),
    // vortex: accretion disc around a black hole, bright inner ring
    vortex: n => fill(n, i => { const r = .28 + Math.pow(rnd(), 2.2) * 1.05, a = rnd() * TAU + r * 3.2, inner = r < .36;
      return [r * Math.cos(a), (rnd() - .5) * .03 * r + (inner ? (rnd() - .5) * .02 : 0), r * Math.sin(a) * .9, inner || rnd() < .03 ? 1.9 : null]; }),
    // orbit: tilted rings with glass bubbles riding on them (pairs with the orb shader)
    orbit: n => fill(n, i => { const k = Math.floor(rnd() * 7), R = .95 + k * .075, bubble = rnd() < .22;
      if (bubble) { const b = Math.floor(rnd() * 40), a = hash(b * 3.3) * TAU, rr = .015 + hash(b) * .045, u = rnd() * TAU, v = Math.acos(2 * rnd() - 1), Rb = .95 + Math.floor(hash(b * 5) * 7) * .075;
        return [Rb * Math.cos(a) + rr * Math.sin(v) * Math.cos(u), rr * Math.cos(v), Rb * Math.sin(a) + rr * Math.sin(v) * Math.sin(u), 1.9]; }
      const a = rnd() * TAU; return [R * Math.cos(a), (rnd() - .5) * .006, R * Math.sin(a)]; }),
    text: (n, txt, font) => {   // particle type: sample a filled glyph mask
      const c = document.createElement('canvas'), W = 1024, H = 360, x = c.getContext('2d'); c.width = W; c.height = H;
      x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; let fs = 300; x.font = `700 ${fs}px ${font}`;
      while (x.measureText(txt).width > W * .94 && fs > 40) { fs -= 10; x.font = `700 ${fs}px ${font}`; }
      x.fillText(txt, W / 2, H / 2 + fs * .04); const d = x.getImageData(0, 0, W, H).data, pts = [];
      for (let y = 0; y < H; y += 2) for (let k = 0; k < W; k += 2) if (d[(y * W + k) * 4] > 128) pts.push(k, y);
      if (!pts.length) return SHAPES.sphere(n);
      return fill(n, i => { const j = (Math.floor(hash(i) * pts.length / 2)) * 2; return [(pts[j] / W - .5) * 2.1 + (rnd() - .5) * .004, -(pts[j + 1] / H - .5) * 2.1 * H / W, (rnd() - .5) * .08]; });
    }
  };

  /* image -> particle figure. mode: 'alpha' (PNG cut-out), 'luma' (bright subject on dark), 'dark' (dark subject on light),
     'auto' (alpha if transparent, else contrast to the corner colour). Depth from brightness, so the figure has volume. */
  const imgCache = {};
  function imagePoints(src, mode, cb) {
    const go = img => {
      const W = 420, H = Math.max(1, Math.round(W * img.naturalHeight / img.naturalWidth)), c = document.createElement('canvas'); c.width = W; c.height = H;
      const x = c.getContext('2d'); x.drawImage(img, 0, 0, W, H); let d; try { d = x.getImageData(0, 0, W, H).data; } catch (e) { return cb(null); }
      const at = (k, y) => (y * W + k) * 4, bg = [d[0], d[1], d[2]], hasA = d[3] < 250 || d[at(W - 1, H - 1) + 3] < 250;
      const m = mode === 'auto' || !mode ? (hasA ? 'alpha' : 'contrast') : mode, pts = [];
      for (let y = 0; y < H; y += 1) for (let k = 0; k < W; k += 1) {
        const o = at(k, y), lum = (d[o] * .3 + d[o + 1] * .59 + d[o + 2] * .11) / 255;
        let w = 0;
        if (m === 'alpha') w = d[o + 3] / 255; else if (m === 'luma') w = Math.max(0, lum - .25) * 1.4; else if (m === 'dark') w = Math.max(0, .75 - lum) * 1.4;
        else w = Math.min(1, (Math.abs(d[o] - bg[0]) + Math.abs(d[o + 1] - bg[1]) + Math.abs(d[o + 2] - bg[2])) / 140);
        if (w > .35) { const o2 = at(Math.min(W - 1, k + 2), y), o3 = at(k, Math.min(H - 1, y + 2));
          const edge = Math.abs(d[o] - d[o2]) + Math.abs(d[o] - d[o3]) + Math.abs(d[o + 3] - d[o2 + 3]) + Math.abs(d[o + 3] - d[o3 + 3]) > 90;
          pts.push(k / W, y / H, edge ? 1 : lum * .8, w); if (edge) pts.push(k / W, y / H, 1, w); }
      }
      cb(pts.length ? { pts, ar: W / H } : null);
    };
    if (imgCache[src]) return go(imgCache[src]);
    const img = new Image(); img.onload = () => { imgCache[src] = img; go(img); }; img.onerror = () => cb(null); img.src = src;
  }
  SHAPES.image = (n, P) => fill(n, i => { const j = Math.floor(rnd() * P.pts.length / 4) * 4, s = 1.9 / Math.max(P.ar, 1), sx = P.ar >= 1 ? 1.9 : 1.9 * P.ar;
    const l = P.pts[j + 2]; return [(P.pts[j] - .5) * sx + (rnd() - .5) * .004, -(P.pts[j + 1] - .5) * (P.ar >= 1 ? s : 1.9) + (rnd() - .5) * .004, (l - .5) * .18 + (rnd() - .5) * .03, l > .85 && rnd() < .3 ? 1.9 : null]; });

  /* ---------- tiny matrix helpers ---------- */
  function persp(fov, asp, n, f) { const t = 1 / Math.tan(fov / 2); return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]; }
  function lookAt(e, c) { let z = [e[0] - c[0], e[1] - c[1], e[2] - c[2]]; const zl = Math.hypot(...z); z = z.map(v => v / zl);
    let x = [z[2], 0, -z[0]]; const xl = Math.hypot(...x) || 1; x = x.map(v => v / xl); const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
    return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -(x[0] * e[0] + x[1] * e[1] + x[2] * e[2]), -(y[0] * e[0] + y[1] * e[1] + y[2] * e[2]), -(z[0] * e[0] + z[1] * e[1] + z[2] * e[2]), 1]; }
  function mul(a, b) { const o = new Array(16); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; }

  /* ---------- shaders ---------- */
  const VQ = `#version 300 es
  void main(){ vec2 p = vec2((gl_VertexID<<1)&2, gl_VertexID&2); gl_Position = vec4(p*2.-1., 0., 1.); }`;
  const SIM = `#version 300 es
  precision highp float;
  uniform sampler2D uPos, uVel, uTgt; uniform float uT, uDt, uMorph, uChaos, uK, uCalm; uniform mat4 uVP; uniform vec2 uM, uMV; uniform float uMR;
  layout(location=0) out vec4 oPos; layout(location=1) out vec4 oVel;
  vec3 curl(vec3 p, float t){
    return vec3(2.7*cos(2.7*p.y) - 1.3*cos(1.3*p.z+.8*t), 2.3*cos(2.3*p.z) - 1.9*cos(1.9*p.x+.6*t), 2.1*cos(2.1*p.x) - 1.7*cos(1.7*p.y+t))
         + .5*vec3(5.1*cos(5.1*p.y+t) - 4.3*cos(4.3*p.z), 3.7*cos(3.7*p.z-t) - 4.9*cos(4.9*p.x), 4.1*cos(4.1*p.x+.5*t) - 3.3*cos(3.3*p.y)); }
  void main(){
    ivec2 c = ivec2(gl_FragCoord.xy);
    vec4 P = texelFetch(uPos, c, 0), V = texelFetch(uVel, c, 0), G = texelFetch(uTgt, c, 0);
    float r = fract(P.w*7.31+.13);
    float go = smoothstep(r*.55, r*.55+.45, uMorph);                       // staggered hand-over to the new shape
    vec3 v = V.xyz*.86;
    v += (G.xyz - P.xyz) * uK * (.15 + .85*go);
    v += curl(P.xyz*1.3, uT*.35) * (.00055*uCalm + uChaos*.006*(1.-go*.6));     // idle breathing + morph turbulence
    vec4 s = uVP*vec4(P.xyz,1.); vec2 q = s.xy/s.w;                          // cursor stir in screen space
    float f = exp(-dot(q-uM,q-uM)/(uMR*uMR));
    v.xy += uMV*f*.004; v.z += length(uMV)*f*.0015*(r-.5);
    oPos = vec4(P.xyz + v*uDt, G.w); oVel = vec4(v, 0.);
  }`;
  const VR = `#version 300 es
  precision highp float;
  uniform sampler2D uPos; uniform mat4 uVP; uniform float uSize, uDpr, uT, uFocus, uDof, uAsp; uniform int uS; uniform vec4 uOrb;
  out float vR; out float vA; out float vD; out float vCoc; out float vOcc; out vec3 vP;
  void main(){
    ivec2 c = ivec2(gl_VertexID % uS, gl_VertexID / uS);
    vec4 P = texelFetch(uPos, c, 0); vR = fract(P.w*13.7); vA = step(1.5, P.w);
    vec4 s = uVP*vec4(P.xyz,1.); gl_Position = s; vD = (s.w - uFocus)/uFocus; vP = P.xyz;
    vCoc = clamp(abs(vD)*uDof, 0., 1.);                                       // circle of confusion: distance from the focal plane
    // the glowing orb hides everything that is behind it (rings pass in front of and behind the sphere)
    vec2 q = (s.xy/s.w - uOrb.xy)*vec2(uAsp,1.); float behind = step(uOrb.w, s.w), inside = 1. - smoothstep(uOrb.z*.96, uOrb.z*1.01, length(q));
    vOcc = 1. - behind*inside*step(.001, uOrb.z);
    float big = mix(1., 2.2, pow(vR, 40.));
    gl_PointSize = uSize*uDpr*big*(.7 + .6*fract(vR*3.1)) * (6./max(s.w,.3)) * (vA>.5 ? 1.4 : 1.) * (1. + vCoc*2.4);
  }`;
  const FR = `#version 300 es
  precision highp float;
  uniform vec3 uBase, uAcc, uAcc2, uEye, uL; uniform float uT, uAlpha, uLight, uClosed; in float vR; in float vA; in float vD; in float vCoc; in float vOcc; in vec3 vP; out vec4 o;
  void main(){
    vec2 p = gl_PointCoord*2.-1.; float d = dot(p,p); if (d>1. || vOcc < .01) discard;
    // soft focus: sharp points are tiny bright spheres, out-of-focus points become dim bokeh discs with a brighter rim
    float sharp = (1.-d)*(1.-d)*(1.+.6*(1.-d)), bokeh = (.55 + .6*smoothstep(.55,1.,d))*(1.-smoothstep(.9,1.,d));
    float prof = mix(sharp, bokeh, vCoc), energy = 1./(1. + vCoc*vCoc*9.);
    vec3 N = normalize(vP + vec3(.0001)), V = normalize(uEye - vP);              // surface normal of closed shapes: away from the centre
    float lam = max(dot(N, uL), 0.), face = dot(N, V);
    float shade = uLight > .5 ? .38 + .9*lam - .25*pow(1.-abs(face), 2.) * 0. + .25*pow(1.-abs(face), 3.) : mix(1., .22 + .95*lam + .35*pow(1.-abs(face), 3.), .85);        // key light + rim light
    float backF = mix(1., smoothstep(-.35, .35, face)*.8 + .2, uClosed);          // far side of a closed shape is dim: reads as a solid
    vec3 sn = vec3(p, sqrt(1.-d)); float sp = pow(max(dot(reflect(-normalize(vec3(-.4,.5,.8)), sn), vec3(0,0,1)), 0.), 24.);
    vec3 col = mix(uBase, uAcc, pow(vR, 28.)); col = mix(col, uAcc2, vA);
    float depthF = clamp(1.28 - .5*(vD+1.), .45, 1.35);                           // near = brighter, far = cooler and dimmer
    col = mix(col, uAcc2*.8, clamp(vD*.55, 0., .5));
    float spark = .55 + .45*(.5+.5*sin(uT*3.5 + vR*40.)) * pow(vR, 8.) * 2.;
    float a = prof * uAlpha * energy * depthF * vOcc;
    vec3 lit = uLight > .5 ? mix(uAcc2*.5 + col*.12, col*1.06, clamp(shade, 0., 1.)) + sp*(1.-vCoc)*.5 : col*shade*backF + sp*(1.-vCoc)*.6;   // light themes: shadow side takes the accent, lit side the base
    if (uLight > .5) a *= backF;                                                  // light themes: the far side fades out instead of going dark
    o = uLight > .5 ? vec4(lit*.78, a*.95) : vec4(lit*spark*a, a);
  }`;

  function prog(gl, vs, fs) {
    const p = gl.createProgram();
    [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]].forEach(([t, src]) => { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); gl.attachShader(p, s); });
    gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}; const nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (let i = 0; i < nu; i++) { const n = gl.getActiveUniform(p, i).name; u[n] = gl.getUniformLocation(p, n); }
    return { p, u };
  }
  function tex(gl, s, data) { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, s, s, 0, gl.RGBA, gl.FLOAT, data);
    [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.NEAREST)); [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE)); return t; }

  /* ---------- mount ---------- */
  function mount(cfg) {
    unmount(); if (!cfg) return;
    const DK = D.sceneKinds && D.sceneKinds[cfg.kind];
    if (DK) { S = { dom: DK(cfg), cfg, alive: true }; return; }   // DOM scenes from scene2.js
    if (cfg.kind !== 'particles') return;
    const cv = D.h('canvas', { id: 'scene', 'aria-hidden': 'true' }); document.body.insertBefore(cv, document.getElementById('app'));
    const gl = cv.getContext('webgl2', { antialias: false, alpha: true, premultipliedAlpha: true });
    if (!gl || !gl.getExtension('EXT_color_buffer_float')) { cv.remove(); return; }   // no GPU sim: pages still work, no scene
    const small = innerWidth < 760, side = Math.round((small ? 128 : 300) * Math.sqrt(cfg.density || 1)), N = side * side;
    let simP, rP;
    try { simP = prog(gl, VQ, SIM); rP = prog(gl, VR, FR); } catch (e) { console.warn('scene shader', e); cv.remove(); return; }
    const start = SHAPES.scatter(N), zero = new Float32Array(N * 4);
    const T = { pos: [tex(gl, side, start), tex(gl, side, start)], vel: [tex(gl, side, zero), tex(gl, side, zero)], tgt: tex(gl, side, start) };
    const fb = [0, 1].map(i => { const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, T.pos[i], 0); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, T.vel[i], 0); return f; });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const vao = gl.createVertexArray();
    const col = n => D.rgb(n).map(v => v / 255);
    const light = cfg.blend === 'normal';
    const cam = { az: 0, el: 10, dist: 4, x: 0, y: 0, fov: 32 }, camT = Object.assign({}, cam), shotCam = Object.assign({}, cam);
    S = { cv, gl, N, side, T, fb, vao, simP, rP, cfg, i: 0, morph: 1, chaos: 0, t0: performance.now(), last: performance.now(), raf: 0, cam, camT, mouse: [0, 0], mv: [0, 0], pm: null, light, shape: '', alive: true,
      col: { base: col('--text'), acc: col('--accent'), acc2: col('--accent2') }, font: D.cssVar('--font-d') || 'sans-serif', yaw: 0 };
    const size = () => { const dpr = Math.min(devicePixelRatio || 1, 2); cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr); S.dpr = dpr; };
    size(); addEventListener('resize', size); S.size = size;
    if (cfg.with && D.sceneKinds && D.sceneKinds[cfg.with.kind]) S.extra = D.sceneKinds[cfg.with.kind](cfg.with);
    const pm = e => { const x = (e.touches ? e.touches[0].clientX : e.clientX) / innerWidth * 2 - 1, y = -((e.touches ? e.touches[0].clientY : e.clientY) / innerHeight * 2 - 1);
      S.mv = [S.mv[0] * .5 + (x - S.mouse[0]) * 30, S.mv[1] * .5 + (y - S.mouse[1]) * 30]; S.mouse = [x, y]; };
    addEventListener('pointermove', pm, { passive: true }); addEventListener('touchmove', pm, { passive: true }); S.pm = pm;
    loop(performance.now());
  }
  function unmount() {
    if (!S) return; if (S.dom) { S.dom.destroy(); S = null; return; }
    S.alive = false; cancelAnimationFrame(S.raf); if (S.extra) S.extra.destroy(); removeEventListener('resize', S.size); removeEventListener('pointermove', S.pm); removeEventListener('touchmove', S.pm);
    const ext = S.gl.getExtension('WEBGL_lose_context'); S.cv.remove(); if (ext) ext.loseContext(); S = null;
  }

  /* ---------- shots ---------- */
  function shapeFor(page, i) {
    const shots = (S.cfg.shots && S.cfg.shots.length) ? S.cfg.shots : [{ shape: 'ring' }];
    const sh = Object.assign({}, shots[i % shots.length], page && page.scene);
    const v = page && page.visual;   // an image the user chose to show as a figure of light points
    if (v && v.type === 'image' && v.embed === 'particles' && !(page.scene && page.scene.shape)) Object.assign(sh, { shape: 'image', src: v.src, mode: v.mode || 'auto', cam: Object.assign({ az: 0, el: 0, dist: 3.2, x: .3 }, v.cam) });
    if (sh.shape === 'numeral') {
      const it = page && ((page.items && page.items[0]) || (page.value != null && page));
      sh.text = it && it.value != null ? (it.prefix || '') + String(it.value).replace('.', ',') + (it.suffix || '') : String(i + 1).padStart(2, '0');
      sh.shape = 'text';
    }
    return sh;
  }
  function shot(page, i) {
    if (!S) return;
    if (S.dom) return S.dom.shot(page || {}, i);
    if (S.extra) S.extra.shot(page || {}, i);
    const sh = shapeFor(page, i), key = sh.shape + ':' + (sh.text || '') + (sh.src ? ':' + sh.src.length + sh.src.slice(-24) : '');
    Object.assign(S.camT, { az: 0, el: 10, dist: 4, x: 0, y: 0, fov: 32 }, sh.cam || {});
    S.lock = sh.shape === 'text' || sh.shape.startsWith('text+') || !!sh.lock; if (sh.shape === 'text' && !(sh.cam && sh.cam.el != null)) S.camT.el = 0;
    if (key === S.shape) return;
    S.shape = key;
    if (sh.shape === 'image' && sh.src) {           // async: sample the picture, then morph into it
      S.lock = true; if (!(sh.cam && sh.cam.el != null)) S.camT.el = 0;
      return imagePoints(sh.src, sh.mode, P => { if (!S || S.shape !== key) return; const data = P ? SHAPES.image(S.N, P) : SHAPES.sphere(S.N); upload(data); });
    }
    const gen = (name, n) => name === 'text' ? SHAPES.text(n, sh.text || '', S.font) : (SHAPES[name] || SHAPES.ring)(n);
    let data;
    if (sh.shape.includes('+')) { const [a, b] = sh.shape.split('+'), na = Math.floor(S.N * (sh.mix || .7)); data = new Float32Array(S.N * 4); data.set(gen(a, na)); data.set(gen(b, S.N - na), na * 4); }
    else data = gen(sh.shape, S.N);
    upload(data);
  }
  function upload(data) {
    const gl = S.gl; gl.bindTexture(gl.TEXTURE_2D, S.T.tgt); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, S.side, S.side, gl.RGBA, gl.FLOAT, data);
    S.morph = 0; S.chaos = D.reduced ? 0 : 1;
    if (D.reduced) { [0, 1].forEach(k => { gl.bindTexture(gl.TEXTURE_2D, S.T.pos[k]); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, S.side, S.side, gl.RGBA, gl.FLOAT, data); }); S.morph = 1; }
  }

  const CLOSED = new Set(['sphere', 'globe', 'brain', 'iris', 'box']);

  /* ---------- frame ---------- */
  function loop(now) {
    if (!S || !S.alive) return;
    S.raf = requestAnimationFrame(loop);
    if (document.hidden) return;
    const dt = Math.min(.05, (now - S.last) / 1000); S.last = now; const t = (now - S.t0) / 1000;
    const gl = S.gl, c = S.cam, ct = S.camT, k = 1 - Math.pow(.025, dt);              // critically damped glide
    for (const p of ['az', 'el', 'dist', 'x', 'y', 'fov']) c[p] += (ct[p] - c[p]) * k;
    S.morph = Math.min(1, S.morph + dt / 1.8); S.chaos *= Math.pow(.25, dt);
    if (S.lock) S.yaw += (Math.round(S.yaw / 360) * 360 - S.yaw) * k; else S.yaw += dt * (S.cfg.spin == null ? 2.2 : S.cfg.spin * 57.3);
    S.mv = [S.mv[0] * Math.pow(.02, dt), S.mv[1] * Math.pow(.02, dt)];
    // camera: orbit around the object + gaze from the cursor; x/y shift the framing (object left/right of the copy)
    const az = (c.az + S.yaw + S.mouse[0] * -4) * Math.PI / 180, el = (c.el + S.mouse[1] * 3) * Math.PI / 180;
    const eye = [c.dist * Math.cos(el) * Math.sin(az), c.dist * Math.sin(el), c.dist * Math.cos(el) * Math.cos(az)];
    const asp = S.cv.width / S.cv.height, P = persp(c.fov * Math.PI / 180, asp, .05, 50);
    P[8] = -c.x * 1.0; P[9] = -c.y * 1.0;                                                  // off-axis shift (lens shift, no parallax)
    const VP = mul(P, lookAt(eye, [0, 0, 0]));
    // simulate
    const r = S.i, w = 1 - r;
    gl.bindFramebuffer(gl.FRAMEBUFFER, S.fb[w]); gl.viewport(0, 0, S.side, S.side); gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
    gl.disable(gl.BLEND); gl.useProgram(S.simP.p); gl.bindVertexArray(S.vao);
    [[S.T.pos[r], 'uPos'], [S.T.vel[r], 'uVel'], [S.T.tgt, 'uTgt']].forEach(([tx, n], j) => { gl.activeTexture(gl.TEXTURE0 + j); gl.bindTexture(gl.TEXTURE_2D, tx); gl.uniform1i(S.simP.u[n], j); });
    const u = S.simP.u; gl.uniform1f(u.uT, t); gl.uniform1f(u.uDt, Math.min(dt * 60, 2.5)); gl.uniform1f(u.uMorph, S.morph); gl.uniform1f(u.uChaos, S.chaos); gl.uniform1f(u.uCalm, (S.lock ? .15 : 1.) * (S.cfg.noise == null ? 1 : S.cfg.noise)); gl.uniform1f(u.uK, D.reduced ? .2 : .03);
    gl.uniformMatrix4fv(u.uVP, false, VP); gl.uniform2f(u.uM, S.mouse[0], S.mouse[1]); gl.uniform2f(u.uMV, S.mv[0], S.mv[1]); gl.uniform1f(u.uMR, .18);
    gl.drawArrays(gl.TRIANGLES, 0, 3); S.i = w;
    // render
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, S.cv.width, S.cv.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND); if (S.light) gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); else gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(S.rP.p); const v = S.rP.u;
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, S.T.pos[w]); gl.uniform1i(v.uPos, 0);
    gl.uniformMatrix4fv(v.uVP, false, VP); gl.uniform1f(v.uSize, (S.cfg.size || 1) * (S.light ? 1.25 : 1) * 1.6); gl.uniform1f(v.uDpr, S.dpr); gl.uniform1f(v.uT, t); gl.uniform1i(v.uS, S.side);
    gl.uniform3fv(v.uBase, S.cfg.base === 'accent' ? S.col.acc.map(x => x * .8) : S.light ? S.col.base : S.col.base.map(x => x * .55)); gl.uniform3fv(v.uAcc, S.col.acc); gl.uniform3fv(v.uAcc2, S.cfg.route === 'accent' ? S.col.acc : S.col.acc2);
    gl.uniform1f(v.uAlpha, S.cfg.alpha || (S.light ? .9 : .75)); gl.uniform1f(v.uLight, S.light ? 1 : 0);
    const ex = S.extra && S.extra.place ? S.extra : null, w0 = VP[15], ox = VP[12] / w0, oy = VP[13] / w0;   // projected object centre (origin)
    gl.uniform1f(v.uFocus, c.dist); gl.uniform1f(v.uDof, S.cfg.dof == null ? 1.15 : S.cfg.dof); gl.uniform1f(v.uAsp, asp); gl.uniform3fv(v.uEye, eye);
    gl.uniform3fv(v.uL, [-.45, .6, .66]); gl.uniform1f(v.uClosed, CLOSED.has(S.shape) ? 1 : 0);
    let orbR = 0; if (ex) { orbR = ex.radius(P[5] / w0); ex.place(ox, oy, orbR); }
    gl.uniform4f(v.uOrb, ox, oy, orbR * 2, w0);
    gl.drawArrays(gl.POINTS, 0, S.N);
  }

  D.scene = { mount, unmount, shot, shapes: Object.keys(SHAPES), state: () => S && (S.dom ? { kind: S.cfg.kind } : { shape: S.shape, morph: S.morph, n: S.N }) };
})();
