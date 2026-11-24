/* scene3.js · media + shader signature scenes. Same contract as scene2.js (Deck.sceneKinds[kind](cfg) -> {shot, destroy}).

   media – the user's own video or image as the persistent scene (offline: build.py embeds relative paths).
     scene: { kind:"media", src:"dna.mp4" | "hero.webp", fit:"cover"|"contain", pos:"50% 50%", mask:"left"|"bottom"|"top"|"radial"|"none",
              tint:0..1 (darken towards --bg), mode:"loop"|"scrub"|"hold", parallax:1, shots:[{ src, t, zoom, x, y, rate }] }
     page.scene: { src, t, zoom, x, y }   -> per page: another clip/image, seek time t (s), Ken-Burns framing.
     mode loop  = plays, each page seeks to its t;  scrub = glides currentTime to t (needs a keyframe-dense clip);
     hold = paused frame at t (a still from the clip). Images get a slow Ken-Burns drift towards the shot framing.
   orb  – raymarched glowing liquid sphere with a swirl inside and a fresnel rim (Lumora-style hero). WebGL1, own canvas.
     scene: { kind:"particles", …, with:{ kind:"orb", x:.5, y:.55, r:.26, hue:"accent", shots:[{x,y,r,spin}] } } */
(function () {
  'use strict';
  const D = window.Deck, h = D.h, an = D.an;
  const K = (D.sceneKinds = D.sceneKinds || {});
  const isVid = s => /\.(mp4|webm|mov)(\?|$)|^data:video\//i.test(s || '');
  const layer = cls => { const w = h('div', { class: 'scn ' + cls, 'aria-hidden': 'true' }); document.body.insertBefore(w, document.getElementById('app')); return w; };

  /* ---------- media ---------- */
  K.media = cfg => {
    const w = layer('scn-media mask-' + (cfg.mask || 'left') + (cfg.treat ? ' treat-' + cfg.treat : '')), shots = cfg.shots || [];
    if (cfg.tint != null) w.style.setProperty('--tint', cfg.tint);
    let cur = null, raf = 0, alive = true, mx = 0, my = 0, frame = { zoom: 1.06, x: 0, y: 0 }, target = Object.assign({}, frame), seekTo = null;
    function make(src) {
      const el = isVid(src) ? h('video', { src, muted: true, playsinline: true, loop: cfg.mode !== 'hold', preload: 'auto' }) : h('img', { src, alt: '' });
      el.className = 'm-el'; el.style.objectFit = cfg.fit || 'cover'; el.style.objectPosition = cfg.pos || '50% 50%';
      if (el.tagName === 'VIDEO') { el.muted = true; if (cfg.mode !== 'hold' && cfg.mode !== 'scrub' && !D.reduced) el.play().catch(() => {}); }
      w.append(el); return el;
    }
    const pm = e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }; addEventListener('pointermove', pm, { passive: true });
    (function loop() { if (!alive) return; raf = requestAnimationFrame(loop); const k = D.reduced ? 1 : .035, p = cfg.parallax == null ? 1 : cfg.parallax;
      for (const q of ['zoom', 'x', 'y']) frame[q] += (target[q] - frame[q]) * k;
      if (cur) cur.style.transform = `translate(${(frame.x - mx * .012 * p) * 100}%,${(frame.y - my * .012 * p) * 100}%) scale(${frame.zoom})`;
      if (seekTo != null && cur && cur.tagName === 'VIDEO' && cur.readyState > 1) {   // scrub: glide the playhead
        const d = seekTo - cur.currentTime; if (Math.abs(d) < .03) seekTo = null; else cur.currentTime += d * .12; }
    })();
    function shot(page, i) {
      const s = Object.assign({}, shots.length ? shots[i % shots.length] : {}, page.scene || {}), src = s.src || cfg.src;
      if (!src) return;
      if (!cur || cur.dataset.src !== src) {
        const old = cur; cur = make(src); cur.dataset.src = src;
        an(cur, [{ opacity: 0, filter: 'blur(14px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: D.reduced ? 1 : 1100 });
        if (old) an(old, [{ opacity: 1 }, { opacity: 0 }], { duration: 900 }).then(() => old.remove());
      }
      target = { zoom: s.zoom || 1.06, x: s.x || 0, y: s.y || 0 };
      if (cur.tagName === 'VIDEO' && s.t != null) {
        if (cfg.mode === 'scrub' && !D.reduced) seekTo = s.t;
        else { try { cur.currentTime = s.t; } catch (e) {} if (cfg.mode !== 'hold') cur.play().catch(() => {}); }
      }
      if (cur.tagName === 'VIDEO' && s.rate) cur.playbackRate = s.rate;
    }
    return { shot, destroy() { alive = false; cancelAnimationFrame(raf); removeEventListener('pointermove', pm); w.remove(); } };
  };

  /* ---------- orb (raymarched liquid glow sphere) ---------- */
  const OV = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;
  const OF = `precision highp float;
  uniform vec2 uRes, uC, uM; uniform float uR, uT, uSpin; uniform vec3 uA, uB;
  float h3(vec3 p){ p = fract(p*.3183+.1); p *= 17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  float n3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f*f*(3.-2.*f);
    return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
               mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z); }
  float fbm(vec3 p){ float a = 0., w = .5; for (int k = 0; k < 4; k++){ a += w*n3(p); p = p*2.02+vec3(1.7,9.2,3.1); w *= .5; } return a; }
  float sdf(vec3 p){ float d = length(p) - 1.; return d + .07*(fbm(p*1.5 + uT*.22) - .5) + .03*sin(p.x*3.+uT*.7)*sin(p.y*3.1-uT*.5); }
  vec3 nrm(vec3 p){ vec2 e = vec2(.004,0.); return normalize(vec3(sdf(p+e.xyy)-sdf(p-e.xyy), sdf(p+e.yxy)-sdf(p-e.yxy), sdf(p+e.yyx)-sdf(p-e.yyx))); }
  // studio environment seen in reflections: a big soft box top-left, a thin strip light right, dark floor
  vec3 env(vec3 r){
    float box = pow(max(dot(normalize(r), normalize(vec3(-.5,.65,.55))),0.), 18.)*.55;
    float strip = smoothstep(.93,.99, dot(normalize(r), normalize(vec3(.85,.15,.35))));
    float up = pow(max(r.y,0.), 1.5)*.35, floor_ = smoothstep(0.,-.8,r.y)*.12;
    return vec3(1.,.97,.95)*box*1.3 + mix(uB,vec3(1.),.5)*strip*1.1 + mix(uA,uB,.5)*(up+floor_);
  }
  void main(){
    vec2 uv = (gl_FragCoord.xy - uC) / (uR*uRes.y);           // orb radius = uR of the viewport height
    vec3 ro = vec3(0.,0.,3.4), rd = normalize(vec3(uv*.82, -2.6));
    float t = 0., hit = 0.; vec3 p;
    for (int k = 0; k < 48; k++){ p = ro + rd*t; float d = sdf(p); if (d < .002){ hit = 1.; break; } t += d*.9; if (t > 6.) break; }
    float r = length(uv); vec3 col = vec3(0.); float a = 0.;
    // outer glow, a faint floor bounce below the sphere (it hovers) and a tight corona
    float halo = exp(-max(r-.98,0.)*4.2)*.5 + exp(-max(r-.98,0.)*14.)*.55;
    vec2 fq = vec2(uv.x*.72, (uv.y+1.5)*2.6); float bounce = exp(-dot(fq,fq)*1.7)*.38;
    col += uB*(halo*.62) + mix(uA,uB,.5)*bounce; a += halo*.5 + bounce*.5;
    if (hit > .5){
      vec3 n = nrm(p), V = -rd; float nv = max(dot(n,V),0.), F = pow(1.-nv, 3.);
      // refracted ray walks through the volume: the galaxy sits INSIDE the glass and shifts with the cursor (parallax)
      vec3 rr = normalize(refract(rd, n, .78)); vec3 acc = vec3(0.); float tr = 1.;
      for (int k = 0; k < 14; k++){
        float s = (float(k)+.5)/14.*1.9; vec3 q = p + rr*s + vec3(uM*.35, 0.);
        float rad = length(q.xy), ang = atan(q.y,q.x) + uSpin*uT, vol = smoothstep(1.05,.2,length(q));
        vec3 c3 = vec3(cos(ang - rad*3.4), sin(ang - rad*3.4), q.z*1.6)*1.5;
        float sw = fbm(c3*1.7 + vec3(0.,0.,uT*.18)), arm = smoothstep(.38,.8,sw)*vol;
        float core = exp(-rad*rad*7.)*vol*(1.-abs(q.z)*.6);
        vec3 em = mix(uA*.4, uB, smoothstep(.3,.9,sw))*arm*3.8 + uA*.3*vol + vec3(1.,.97,.92)*core*1.5;
        acc += em*tr*.1; tr *= 1. - (arm*.12+core*.06);
      }
      vec3 L = normalize(vec3(-.5,.65,.55)), H = normalize(L+V);
      float spec = pow(max(dot(n,H),0.), 180.)*1.1 + pow(max(dot(n,H),0.), 24.)*.14;
      vec3 refl = env(reflect(rd, n));
      float limb = mix(.35, 1., pow(nv, .55));                      // darker toward the edge: reads as thick glass
      col = acc*limb*(1.-F*.35) + refl*(.04 + F*.7) + uB*F*.5 + vec3(1.)*spec;
      col += vec3(.9,.25,.6)*F*F*.18 + vec3(.2,.5,1.)*pow(F,5.)*.3; // thin-film fringe on the rim
      a = 1.;
    }
    col = col/(1.+col*.25);                                          // soft shoulder instead of hard clipping
    gl_FragColor = vec4(col*clamp(a,0.,1.), clamp(a,0.,1.));
  }`;
  K.orb = cfg => {
    const cv = h('canvas', { class: 'scn scn-orb', 'aria-hidden': 'true' }); document.body.insertBefore(cv, document.getElementById('app'));
    const gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true });
    if (!gl) { cv.remove(); return { shot() {}, destroy() {} }; }
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(o)); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, OV)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, OF)); gl.linkProgram(pr); gl.useProgram(pr);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(pr, n), col = n => D.rgb(n).map(v => v / 255);
    const st = { x: cfg.x == null ? .5 : cfg.x, y: cfg.y == null ? .55 : cfg.y, r: cfg.r || .26, spin: cfg.spin == null ? .35 : cfg.spin }, tg = Object.assign({}, st);
    let raf = 0, alive = true, last = performance.now(), T = 0, mx = 0, my = 0; const place = { on: false, x: 0, y: 0, r: 0 }; document.body.classList.add('has-orb');
    const size = () => { const s = Math.min(devicePixelRatio || 1, 1.5) * .8; cv.width = Math.round(innerWidth * s); cv.height = Math.round(innerHeight * s); };
    size(); addEventListener('resize', size);
    const pm = e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }; addEventListener('pointermove', pm, { passive: true });
    (function loop(now) { if (!alive) return; raf = requestAnimationFrame(loop); if (document.hidden) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now; T += D.reduced ? 0 : dt; const k = 1 - Math.pow(.03, dt);
      for (const q of ['x', 'y', 'r', 'spin']) st[q] += (tg[q] - st[q]) * k;
      gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U('uRes'), cv.width, cv.height); gl.uniform2f(U('uC'), place.on ? (place.x * .5 + .5) * cv.width : (st.x + mx * .015) * cv.width, place.on ? (place.y * .5 + .5) * cv.height : (1 - st.y - my * .015) * cv.height);
      gl.uniform1f(U('uR'), place.r > 0 ? place.r : st.r); gl.uniform1f(U('uT'), T); gl.uniform1f(U('uSpin'), st.spin); gl.uniform2f(U('uM'), mx * 2, -my * 2);
      gl.uniform3fv(U('uA'), col('--accent2')); gl.uniform3fv(U('uB'), col('--accent'));
      gl.drawArrays(gl.TRIANGLES, 0, 3); })(performance.now());
    return { place(x, y, r) { place.on = true; place.x = x; place.y = y; place.r = r; }, radius(k) { return Math.max(.01, (cfg.r || .26) * (st.r / (cfg.r || .26)) * 2.38 * k * .5 * 1.0); },
      shot(page, i) { const s = (cfg.shots || [])[i % ((cfg.shots || []).length || 1)] || {}; Object.assign(tg, { x: cfg.x == null ? .5 : cfg.x, y: cfg.y == null ? .55 : cfg.y, r: cfg.r || .26 }, s); },
      destroy() { alive = false; document.body.classList.remove('has-orb'); cancelAnimationFrame(raf); removeEventListener('resize', size); removeEventListener('pointermove', pm); cv.remove(); } };
  };
})();
