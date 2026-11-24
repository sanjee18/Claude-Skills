/* ------------------------------------------------------------------ *
 *  sigkit.js  ·  the plumbing under every Signature piece
 *
 *  One full-frame fragment shader, and everything around it that makes
 *  it feel finished rather than "a shader in a canvas":
 *
 *    Pointer   read in layout px (correct under scaled ancestors), then
 *              smoothed by a damped spring (k 60, c 11 → ζ≈0.7: one small
 *              overshoot, then still). The shader never sees the raw
 *              mouse, so nothing ever jerks.
 *    Hover     0..1 on the same spring: things lift, glow or lean while
 *              the pointer is on the piece and ease home when it leaves.
 *    Drag      1:1 under the finger (one min-dimension = one radian),
 *              release coasts on the last stretch of velocity (τ 0.9 s);
 *              a pointer held still before release does not fling.
 *    Time      frozen under prefers-reduced-motion, paused when the tab
 *              or the frame is hidden, offset with #t=4.2.
 *    Pixels    DPR ≤ 2 inside a pixel budget, and an adaptive scale that
 *              steps down when frames run long (heavy shaders on laptops).
 *    Colour    params given as '#rrggbb' arrive as LINEAR vec3 uniforms
 *              (u_<name>); numbers as floats. Any of them can be set from
 *              the URL hash: #accent=ffb340&glow=0.6
 *    Preview   #auto drives a slow Lissajous "pointer" so a gallery card
 *              shows the interaction without a mouse.
 *
 *  Shader prelude (prepended to every frag):
 *    uniforms  uRes (device px) · uTime · uDpr · uPtr (device px, y up,
 *              sprung) · uPtrN (−1..1 from centre, divided by min dim/2)
 *              uHover · uPress · uSpin (accumulated drag, radians)
 *    helpers   hash12 · hash22 · noise2 · noise3 · fbm2 · fbm3 · aces ·
 *              toSrgb · dither (kills banding in quiet gradients)
 *
 *  Optional (used by imagery pieces such as planet-nasa):
 *    textures  { uName: { el: <img>, mip: true, wrapS: 'repeat', aniso: 8 } }  uploaded to units 0..n, sampler
 *              uniform = uName, fade-in 0..1 as float uniform uName_have (no pop-in)
 *    dragUnit  () => px per radian for Drag (default: min dimension / 2)
 *    dragArea  (x, y, W, H) => bool, where a press may start a drag (default: anywhere)
 *    state     .px .py raw pointer (layout px) · .auto true under #auto · .gl
 *
 *  Usage:  Sig({ frag: `void main(){ ... }`, params: { accent: '#4f9bff' },
 *                budget: 2.2e6, onFrame(s, set) { set('uFoo', [1,2]) } })
 * ------------------------------------------------------------------ */
(function () {
  const PRELUDE = `
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform float uDpr;
uniform vec2 uPtr; uniform vec2 uPtrN; uniform float uHover; uniform float uPress; uniform vec2 uSpin;
const float PI = 3.14159265; const float TAU = 6.28318531;
float hash12(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
vec2 hash22(vec2 p){ vec3 q = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); q += dot(q, q.yzx + 33.33); return fract((q.xx + q.yz) * q.zy); }
float hash13(vec3 p){ p = fract(p * .1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float noise2(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*f*(f*(f*6.-15.)+10.);
  return mix(mix(hash12(i), hash12(i+vec2(1,0)), u.x), mix(hash12(i+vec2(0,1)), hash12(i+vec2(1,1)), u.x), u.y); }
float noise3(vec3 p){ vec3 i = floor(p), f = fract(p); vec3 u = f*f*(3.-2.*f);
  return mix(mix(mix(hash13(i), hash13(i+vec3(1,0,0)), u.x), mix(hash13(i+vec3(0,1,0)), hash13(i+vec3(1,1,0)), u.x), u.y),
             mix(mix(hash13(i+vec3(0,0,1)), hash13(i+vec3(1,0,1)), u.x), mix(hash13(i+vec3(0,1,1)), hash13(i+vec3(1,1,1)), u.x), u.y), u.z); }
const mat2 ROT2 = mat2(.80, .60, -.60, .80);
float fbm2(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 5; i++){ s += a * noise2(p); p = ROT2 * p * 2.03 + 17.1; a *= .5; } return s; }
float fbm3(vec3 p){ float a = .5, s = 0.; for (int i = 0; i < 5; i++){ s += a * noise3(p); p = p * 2.02 + vec3(11.3, 7.1, 3.7); a *= .5; } return s; }
vec3 aces(vec3 x){ return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14), 0., 1.); }
vec3 toSrgb(vec3 c){ return pow(max(c, 0.), vec3(1./2.2)); }
vec3 dither(vec3 c){ float n = hash12(gl_FragCoord.xy) + hash12(gl_FragCoord.xy + 71.3) - 1.; return c + n / 255.; }
`;
  const VERT = 'attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.,1.);}';
  const K = 60, C = 11, INERTIA_S = 0.9;

  function hashParams() {
    const out = {};
    (location.hash || '').replace(/^#/, '').split('&').forEach(kv => { const [k, v] = kv.split('='); if (k) out[decodeURIComponent(k)] = v === undefined ? true : decodeURIComponent(v); });
    return out;
  }
  function lin(hex) {
    let h = String(hex).replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join('');
    const n = parseInt(h.slice(0, 6), 16) || 0;
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255].map(v => Math.pow(v, 2.2));
  }

  window.Sig = function (opt) {
    const H = hashParams();
    const root = opt.root || document.body;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;display:block;touch-action:pan-y';
    root.prepend(canvas);
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
    if (!gl) { document.body.style.background = opt.fallback || '#05060a'; return null; }
    gl.getExtension('OES_standard_derivatives');
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(o)); } return o; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    const params = Object.assign({}, opt.params || {});
    for (const k in params) if (H[k] !== undefined) params[k] = typeof params[k] === 'string' ? '#' + String(H[k]).replace('#', '') : parseFloat(H[k]);
    const decl = Object.keys(params).map(k => (typeof params[k] === 'string' ? 'uniform vec3 u_' : 'uniform float u_') + k + ';').join('\n');
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, PRELUDE + decl + '\n' + opt.frag));
    gl.linkProgram(prog); gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {}; const u = n => (n in U ? U[n] : (U[n] = gl.getUniformLocation(prog, n)));
    const set = (n, v) => { const l = u(n); if (!l) return; if (typeof v === 'number') gl.uniform1f(l, v); else if (v.length === 2) gl.uniform2fv(l, v); else if (v.length === 3) gl.uniform3fv(l, v); else if (v.length === 4) gl.uniform4fv(l, v); else if (v.length === 9) gl.uniformMatrix3fv(l, false, v); };
    for (const k in params) set('u_' + k, typeof params[k] === 'string' ? lin(params[k]) : params[k]);

    // ── optional textures (images already decoded from data URIs: never tainted) ──
    const texs = [];
    const aniso = gl.getExtension('EXT_texture_filter_anisotropic');
    Object.keys(opt.textures || {}).forEach((name, i) => {
      const d = opt.textures[name], t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, d.wrapS === 'clamp' ? gl.CLAMP_TO_EDGE : gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, d.mip === false ? gl.LINEAR : gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, d.aniso || 8);
      gl.uniform1i(u(name), i);
      const e = { name, i, t, d, have: 0, done: false };
      texs.push(e);
      const load = () => {
        try {
          gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, d.el);
          if (d.mip !== false) gl.generateMipmap(gl.TEXTURE_2D);
          e.done = true;
        } catch (err) { console.warn('sigkit texture', name, err); }
      };
      if (d.el.complete && d.el.naturalWidth) load(); else d.el.addEventListener('load', load, { once: true });
    });

    // ── size: DPR ≤ 2, pixel budget, adaptive scale ──
    const budget = opt.budget || 2.4e6;
    let W = 1, Hh = 1, dpr = 1, scale = 1;
    const resize = () => {
      W = innerWidth; Hh = innerHeight;
      dpr = Math.min(2, devicePixelRatio || 1);
      if (W * Hh * dpr * dpr > budget) dpr = Math.sqrt(budget / Math.max(1, W * Hh));
      dpr *= scale;
      canvas.width = Math.max(1, Math.round(W * dpr)); canvas.height = Math.max(1, Math.round(Hh * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize(); addEventListener('resize', resize);

    // ── motion preferences, visibility ──
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    let reduce = mq.matches || !!H.still; mq.addEventListener && mq.addEventListener('change', () => { reduce = mq.matches; });
    let hidden = document.hidden; document.addEventListener('visibilitychange', () => { hidden = document.hidden; });

    // ── pointer: target → spring ──
    const auto = !!H.auto;
    let tx = W * (opt.rest ? opt.rest[0] : 0.5), ty = Hh * (opt.rest ? opt.rest[1] : 0.5), over = false, pressed = false;
    let dragging = false, dragId = -1, lx = 0, ly = 0, lt = 0;
    const spin = { x: 0, y: 0, vx: 0, vy: 0 };
    const sp = { x: tx, y: ty, vx: 0, vy: 0, h: 0, vh: 0, p: 0, vp: 0 };
    const local = e => { const b = canvas.getBoundingClientRect(); tx = (e.clientX - b.left) * (b.width ? W / b.width : 1); ty = (e.clientY - b.top) * (b.height ? Hh / b.height : 1); };
    addEventListener('pointermove', e => {
      local(e); over = true;
      if (!dragging || e.pointerId !== dragId) return;
      const now = performance.now(), dts = Math.max(0.001, (now - lt) / 1000), m = opt.dragUnit ? opt.dragUnit() : Math.min(W, Hh) / 2;
      const dx = (tx - lx) / m, dy = (ty - ly) / m;
      spin.x += dx; spin.y += dy;
      spin.vx += (dx / dts - spin.vx) * 0.4; spin.vy += (dy / dts - spin.vy) * 0.4;
      lx = tx; ly = ty; lt = now;
    });
    document.addEventListener('pointerleave', () => { if (!dragging) over = false; });
    document.documentElement.addEventListener('mouseleave', () => { if (!dragging) over = false; });
    addEventListener('pointerdown', e => {
      local(e); over = true; pressed = true;
      if (!opt.drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
      if (opt.dragArea && !opt.dragArea(tx, ty, W, Hh)) return;
      dragging = true; dragId = e.pointerId; lx = tx; ly = ty; lt = performance.now(); spin.vx = spin.vy = 0;
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId); document.body.style.cursor = 'grabbing';
    });
    const up = e => {
      pressed = false;
      if (!dragging || e.pointerId !== dragId) return;
      dragging = false; document.body.style.cursor = '';
      if (performance.now() - lt > 80) spin.vx = spin.vy = 0;
    };
    addEventListener('pointerup', up); addEventListener('pointercancel', up);
    if (opt.drag) document.body.style.cursor = 'grab';

    // ── frame ──
    let time = parseFloat(H.t) || opt.t0 || 0, last = -1, slow = 0, fast = 0;
    const state = { get W() { return W; }, get H() { return Hh; }, get dpr() { return dpr; }, sp, spin, get over() { return over; }, get px() { return tx; }, get py() { return ty; }, auto, gl, get dragging() { return dragging; }, get time() { return time; }, reduce: () => reduce, params };
    function frame(now) {
      requestAnimationFrame(frame);
      if (hidden) { last = -1; return; }
      const dt = last < 0 ? 0 : Math.min(0.05, (now - last) / 1000); last = now;
      // adaptive resolution: three slow frames in a row step down, a long run of fast ones steps back up
      if (dt > 0.026) { slow++; fast = 0; } else if (dt > 0 && dt < 0.0175) { fast++; slow = 0; }
      if (slow > 12 && scale > 0.5) { scale = Math.max(0.5, scale * 0.85); slow = 0; resize(); }
      if (fast > 240 && scale < 1) { scale = Math.min(1, scale / 0.85); fast = 0; resize(); }
      if (!reduce) time += dt;

      let gx = tx, gy = ty, gh = over ? 1 : 0;
      if (auto && !over) { const a = time * 0.23; gx = W * (0.5 + 0.28 * Math.sin(a * 1.3)); gy = Hh * (0.5 + 0.22 * Math.sin(a * 0.9 + 1.2)); gh = 0.6 + 0.4 * Math.sin(a * 0.7); }
      else if (!over) { gx = W * (opt.rest ? opt.rest[0] : 0.5); gy = Hh * (opt.rest ? opt.rest[1] : 0.5); }
      if (reduce) { sp.x = gx; sp.y = gy; sp.h = gh; sp.p = pressed ? 1 : 0; }
      else {
        const steps = Math.ceil(dt * 120);
        for (let i = 0; i < steps; i++) {
          const h = dt / steps;
          sp.vx += (K * (gx - sp.x) - C * sp.vx) * h; sp.x += sp.vx * h;
          sp.vy += (K * (gy - sp.y) - C * sp.vy) * h; sp.y += sp.vy * h;
          sp.vh += (K * (gh - sp.h) - C * sp.vh) * h; sp.h += sp.vh * h;
          sp.vp += (K * 1.6 * ((pressed ? 1 : 0) - sp.p) - C * 1.2 * sp.vp) * h; sp.p += sp.vp * h;
        }
      }
      if (!dragging && !reduce) {
        const d = Math.exp(-dt / INERTIA_S);
        spin.x += spin.vx * dt; spin.y += spin.vy * dt; spin.vx *= d; spin.vy *= d;
        if (opt.spinReturn) spin.y *= Math.exp(-dt / opt.spinReturn);
      }
      const m = Math.min(W, Hh) / 2;
      texs.forEach(e => { const k = 1 - Math.exp(-dt / 0.6); e.have += ((e.done ? 1 : 0) - e.have) * k; set(e.name + '_have', e.have); });
      set('uRes', [canvas.width, canvas.height]); set('uTime', time); set('uDpr', dpr);
      set('uPtr', [sp.x * dpr, (Hh - sp.y) * dpr]); set('uPtrN', [(sp.x - W / 2) / m, -(sp.y - Hh / 2) / m]);
      set('uHover', sp.h); set('uPress', sp.p); set('uSpin', [spin.x, spin.y]);
      opt.onFrame && opt.onFrame(state, set, dt);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    requestAnimationFrame(frame);
    return state;
  };
})();
