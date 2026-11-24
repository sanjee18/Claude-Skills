/* scene4.js · 3D model signature scene (real GLB model as the hero, Leopard/keynote level).
   Needs window.THREE (assets/vendor/three-r147.js) – build.py embeds it only when a brief uses kind "model".
   Same contract as the other scenes: Deck.sceneKinds.model(cfg) -> { shot(page, i), destroy() }.

   scene: { kind:"model", src:"model.glb" (build.py gzips + embeds), look:"studio", rotate:[0,90,0] (deg, fix orientation),
            spin: 4 (deg/s idle orbit), floor:"shadow"|"grid"|"none", intro:"scan"|"assemble"|"rise"|"drive"|"none",
            exposure: 1.05, poster:"still.jpg" (fallback without WebGL),
            shots:[ shot, … ] }                      -> shot i is used for page i unless the page sets page.scene
   shot / page.scene: { az, el, dist, x, y, fov, look, focus:["Battery","Wheel"], explode:0..1, anim:"Open",
            notes:[{ at:"Battery" | [x,y,z] (-1..1 of the bounding box), label:"Batterie", text:"82 kWh, 400 V" }],
            src:"other.glb", spin }
   looks:  studio (original materials, studio light) · clay (matte, form only) · xray (fresnel glass, focus parts glow solid)
           hologram (xray + scanlines) · blueprint (edges + faint fill) · points (vertices as light points)
   A change of look is played as a scan wipe across the model (the x-ray → solid reveal); focus parts glow in every look. */
(function () {
  'use strict';
  const D = window.Deck, h = D.h;
  const K = (D.sceneKinds = D.sceneKinds || {});
  const cache = new Map();   // src -> Promise<base model>

  async function bytes(src) {
    let b = await (await fetch(src)).arrayBuffer();
    const u = new Uint8Array(b, 0, 2);
    if (u[0] === 0x1f && u[1] === 0x8b && window.DecompressionStream)
      b = await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
    return b;
  }

  K.model = cfg => {
    const T = window.THREE;
    const wrap = h('div', { class: 'scn scn-model', 'aria-hidden': 'true' });
    document.body.insertBefore(wrap, document.getElementById('app'));
    const poster = () => { if (cfg.poster) wrap.append(h('img', { class: 'm3-poster', src: cfg.poster, alt: '' })); };
    if (!T || !T.GLTFLoader) { poster(); return { shot() {}, destroy() { wrap.remove(); } }; }

    const cv = h('canvas', { class: 'm3-cv' }), tags = h('div', { class: 'm3-tags' }), load = h('div', { class: 'm3-load' }, '3D · 0 %');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); tags.append(svg);
    wrap.append(cv, tags, load);
    let R;
    try { R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
    catch (e) { cv.remove(); load.remove(); poster(); return { shot() {}, destroy() { wrap.remove(); } }; }
    R.outputEncoding = T.sRGBEncoding; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = cfg.exposure || 1.05;
    R.localClippingEnabled = true; R.setClearColor(0, 0);

    /* ---- theme colours ---- */
    const C = n => new T.Color().setRGB(...D.rgb(n).map(v => v / 255)).convertSRGBToLinear();
    const acc = C('--accent'), acc2 = C('--accent2'), txt = C('--text');
    const bgc = D.rgb('--bg', '#000'), light = (bgc[0] * .3 + bgc[1] * .59 + bgc[2] * .11) > 140;

    /* ---- scene, studio environment, lights ---- */
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, .01, 200);
    const pm = new T.PMREMGenerator(R), env = new T.Scene();
    env.add(new T.Mesh(new T.BoxGeometry(12, 12, 12), new T.MeshBasicMaterial({ color: light ? 0x8a8f96 : 0x0b0d11, side: T.BackSide })));
    const box = (w, hh, x, y, z, ry, rx, k) => { const m = new T.Mesh(new T.PlaneGeometry(w, hh), new T.MeshBasicMaterial({ color: new T.Color(k, k, k), side: T.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, 0); env.add(m); };
    box(7, 1.6, 0, 5.8, 0, 0, Math.PI / 2, 7); box(1.4, 5, -5.8, 1.5, 1, Math.PI / 2, 0, 3.2); box(1.4, 5, 5.8, 1.5, -1.5, -Math.PI / 2, 0, 2.2); box(6, 2.4, 0, 1.2, -5.8, 0, 0, 1.2);
    scene.environment = pm.fromScene(env, .04).texture; pm.dispose();
    const key = new T.DirectionalLight(0xffffff, 1.6); key.position.set(3, 6, 4); scene.add(key, new T.HemisphereLight(0xffffff, 0x222222, .35));
    const rim = new T.PointLight(acc, 1.4, 12); rim.position.set(-3, 2, -3); scene.add(rim);

    /* ---- floor ---- */
    function floorTex(kind) {
      const s = 1024, c = document.createElement('canvas'); c.width = c.height = s; const g = c.getContext('2d');
      if (kind === 'grid') {
        const a = D.rgb('--accent'); g.strokeStyle = `rgba(${a},.55)`; g.lineWidth = 1.5;
        for (let i = 0; i <= 32; i++) { const p = i * s / 32; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, s); g.moveTo(0, p); g.lineTo(s, p); g.stroke(); }
        g.globalCompositeOperation = 'destination-in';
        const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); r.addColorStop(0, 'rgba(0,0,0,1)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, s, s);
      } else {
        const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); r.addColorStop(0, `rgba(0,0,0,${light ? .32 : .7})`); r.addColorStop(.5, `rgba(0,0,0,${light ? .12 : .3})`); r.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = r; g.fillRect(0, 0, s, s);
      }
      const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t;
    }
    const floors = {};
    function floor(kind) {
      for (const k in floors) floors[k].visible = false;
      if (!kind || kind === 'none') return;
      if (!floors[kind]) { const sz = kind === 'grid' ? 9 : 1; const m = new T.Mesh(new T.PlaneGeometry(sz, sz), new T.MeshBasicMaterial({ map: floorTex(kind), transparent: true, depthWrite: false, opacity: kind === 'grid' ? .5 : 1 }));
        m.rotation.x = -Math.PI / 2; m.position.y = .001; m.renderOrder = -1; floors[kind] = m; scene.add(m); }
      floors[kind].visible = true;
      if (kind === 'shadow' && M) { const s = Math.max(M.size.x, M.size.z) * 1.7; floors.shadow.scale.set(s, s, 1); }
    }

    /* ---- looks (materials) ---- */
    const XV = `varying vec3 vN; varying vec3 vV; varying vec3 vW;
      #include <clipping_planes_pars_vertex>
      void main(){ vec4 mvPosition = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mvPosition.xyz);
        vW = (modelMatrix*vec4(position,1.)).xyz; gl_Position = projectionMatrix*mvPosition;
        #include <clipping_planes_vertex>
      }`;
    const XF = `uniform vec3 uC; uniform float uA, uH, uT;
      varying vec3 vN; varying vec3 vV; varying vec3 vW;
      #include <clipping_planes_pars_fragment>
      void main(){
        #include <clipping_planes_fragment>
        float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), 2.2);
        float s = uH * (.35 + .65*step(.55, fract(vW.y*70. - uT*1.6)));
        float band = uH * exp(-pow((vW.y - mod(uT*.45, 2.6) + .3)*7., 2.));
        float a = uA * (.05 + f*.95) * (1. - uH*.35 + s*.5) + band*.35;
        gl_FragColor = vec4(uC * (.35 + f*1.6 + band*2.5), a);
      }`;
    function xray(col, a, holo, planes) {
      return new T.ShaderMaterial({ vertexShader: XV, fragmentShader: XF, transparent: true, depthWrite: false, side: T.DoubleSide, clipping: true, clippingPlanes: planes,
        blending: light ? T.NormalBlending : T.AdditiveBlending, uniforms: { uC: { value: col.clone() }, uA: { value: a * (light ? 1.6 : 1) }, uH: { value: holo ? 1 : 0 }, uT: { value: 0 } } });
    }
    const edgeCache = new WeakMap(), ptCache = new WeakMap();
    function edgesOf(g) { if (!edgeCache.has(g)) edgeCache.set(g, new T.EdgesGeometry(g, 28)); return edgeCache.get(g); }
    function pointsOf(g, ws) {   // even surface sampling (area weighted), ~5000 points per m² of the normalised model
      if (ptCache.has(g)) return ptCache.get(g);
      const p = g.attributes.position, idx = g.index, tri = idx ? idx.count / 3 : p.count / 3, A = new T.Vector3(), B = new T.Vector3(), Cc = new T.Vector3();
      const at = (t, k) => idx ? idx.getX(t * 3 + k) : t * 3 + k, areas = new Float32Array(tri); let tot = 0;
      for (let t = 0; t < tri; t++) { A.fromBufferAttribute(p, at(t, 0)); B.fromBufferAttribute(p, at(t, 1)); Cc.fromBufferAttribute(p, at(t, 2));
        tot += areas[t] = B.sub(A).cross(Cc.sub(A)).length() / 2; }
      const n = Math.max(40, Math.min(30000, Math.round(tot * ws * ws * (cfg.pointDensity || 5000)))), out = new Float32Array(n * 3);
      let acc = 0, t = 0; const stepA = tot / n;
      for (let i = 0; i < n; i++) {
        const goal = (i + Math.random()) * stepA; while (t < tri - 1 && acc + areas[t] < goal) acc += areas[t++];
        let u = Math.random(), v = Math.random(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
        A.fromBufferAttribute(p, at(t, 0)); B.fromBufferAttribute(p, at(t, 1)); Cc.fromBufferAttribute(p, at(t, 2));
        out[i * 3] = A.x + (B.x - A.x) * u + (Cc.x - A.x) * v; out[i * 3 + 1] = A.y + (B.y - A.y) * u + (Cc.y - A.y) * v; out[i * 3 + 2] = A.z + (B.z - A.z) * u + (Cc.z - A.z) * v;
      }
      const pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(out, 3)); ptCache.set(g, pg); return pg;
    }
    const hidden = new T.MeshBasicMaterial({ visible: false });

    function mats(L) {   // per layer (each layer has its own clipping plane)
      const P = [L.plane];
      return {
        xr: xray(acc, .55, false, P), holo: xray(acc, .7, true, P), bp: xray(acc, .18, false, P),
        clay: new T.MeshStandardMaterial({ color: light ? 0xf1f1f1 : 0xcfd3d8, roughness: .62, metalness: 0, clippingPlanes: P }),
        focus: new T.MeshStandardMaterial({ color: acc2, emissive: acc2, emissiveIntensity: 0, roughness: .35, metalness: .1, clippingPlanes: P, transparent: true, opacity: .96 }),
        line: new T.LineBasicMaterial({ color: acc, transparent: true, opacity: light ? .8 : .65, clippingPlanes: P, depthWrite: false }),
        pts: new T.PointsMaterial({ color: acc, size: .011, sizeAttenuation: true, transparent: true, opacity: .85, depthWrite: false, clippingPlanes: P, blending: light ? T.NormalBlending : T.AdditiveBlending }),
        orig: new Map()
      };
    }
    const isFocus = (o, focus) => focus && focus.length && focus.some(f => { for (let p = o; p; p = p.parent) if (p.name && p.name.toLowerCase().includes(String(f).toLowerCase())) return true; return false; });
    function dress(L, look, focus) {   // assign materials of a look to every mesh of a layer
      const m = L.m;
      L.group.traverse(o => {
        if (!o.isMesh) return;
        (o.userData.extra || []).forEach(e => o.remove(e)); o.userData.extra = [];
        const f = isFocus(o, focus);
        if (f) { o.material = m.focus; o.renderOrder = 2; return; }
        o.renderOrder = 0;
        if (look === 'studio') {
          const src = o.userData.om; const arr = Array.isArray(src) ? src : [src];
          const cl = arr.map(s => { if (!m.orig.has(s)) { const c = s.clone(); c.clippingPlanes = [L.plane]; c.clipShadows = true; m.orig.set(s, c); } return m.orig.get(s); });
          o.material = Array.isArray(src) ? cl : cl[0];
        } else if (look === 'clay') o.material = m.clay;
        else if (look === 'xray') o.material = m.xr;
        else if (look === 'hologram') o.material = m.holo;
        else if (look === 'blueprint') { o.material = m.bp; const e = new T.LineSegments(edgesOf(o.geometry), m.line); o.add(e); o.userData.extra.push(e); }
        else if (look === 'points') { o.material = hidden; o.updateMatrixWorld(true); const e = new T.Points(pointsOf(o.geometry, o.matrixWorld.getMaxScaleOnAxis()), m.pts); o.add(e); o.userData.extra.push(e); }
      });
      L.look = look; L.focus = (focus || []).join('|');
    }

    /* ---- model loading + normalising (longest side = 2, standing on y = 0, centred) ---- */
    let M = null, L = null, Lold = null;
    function base(src) {
      if (cache.has(src)) return cache.get(src);
      const p = (async () => {
        load.textContent = '3D · lädt';
        const buf = await bytes(src), ld = new T.GLTFLoader();
        if (window.MeshoptDecoder) ld.setMeshoptDecoder(window.MeshoptDecoder);
        const g = await new Promise((ok, no) => ld.parse(buf, '', ok, no));
        const root = g.scene || g.scenes[0], inner = new T.Group(), outer = new T.Group();
        const r = cfg.rotate || [0, 0, 0]; root.rotation.set(...r.map(v => v * Math.PI / 180));
        inner.add(root); outer.add(inner); outer.updateMatrixWorld(true);
        let bb = new T.Box3().setFromObject(inner); const c = bb.getCenter(new T.Vector3()), sz = bb.getSize(new T.Vector3());
        const k = 2 / Math.max(sz.x, sz.y, sz.z); inner.position.set(-c.x, -bb.min.y, -c.z); outer.scale.setScalar(k); outer.updateMatrixWorld(true);
        bb = new T.Box3().setFromObject(outer);
        const ctr = bb.getCenter(new T.Vector3());
        outer.traverse(o => { if (o.isMesh) {
          o.frustumCulled = false;
          const wc = new T.Box3().setFromObject(o).getCenter(new T.Vector3()), dir = wc.sub(ctr);
          const inv = new T.Matrix3().getNormalMatrix(o.parent.matrixWorld).invert(); const ld2 = dir.clone().applyMatrix3(inv);
          o.userData.p0 = o.position.toArray(); o.userData.ex = ld2.multiplyScalar(1.1).toArray();
        } });
        load.textContent = '';
        return { src, group: outer, box: bb, size: bb.getSize(new T.Vector3()), center: ctr, anims: g.animations || [] };
      })();
      cache.set(src, p); return p;
    }
    function layer(model, look, focus) {
      const g = model.group.clone(true);   // shares geometry + original materials
      g.traverse(o => { if (o.isMesh) o.userData = Object.assign({}, o.userData, { extra: [], om: o.material }); });
      const Ly = { group: g, model, plane: new T.Plane(new T.Vector3(1, 0, 0), 1e4), ex: 0, exT: 0, mixer: model.anims.length ? new T.AnimationMixer(g) : null };
      Ly.m = mats(Ly); dress(Ly, look, focus); scene.add(g); return Ly;
    }
    function dispose(Ly) { if (!Ly) return; scene.remove(Ly.group); Object.values(Ly.m).forEach(v => { if (v && v.dispose) v.dispose(); }); Ly.m.orig.forEach(v => v.dispose()); }

    /* ---- scan wipe between two layers (old look -> new look) ---- */
    const sheet = new T.Mesh(new T.PlaneGeometry(1, 1), new T.ShaderMaterial({ transparent: true, depthWrite: false, side: T.DoubleSide, blending: light ? T.NormalBlending : T.AdditiveBlending,
      uniforms: { uC: { value: acc.clone() }, uA: { value: 0 } }, vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: 'uniform vec3 uC; uniform float uA; varying vec2 vU; void main(){ float e = smoothstep(0.,.25,vU.y)*smoothstep(1.,.75,vU.y); gl_FragColor = vec4(uC*1.6, uA*e*(.18 + .5*smoothstep(.46,.5,vU.x)*smoothstep(.54,.5,vU.x))); }' }));
    sheet.visible = false; scene.add(sheet);
    let scan = null;
    function startScan(next, dur) {
      if (Lold) dispose(Lold);
      Lold = L; L = next;
      if (!Lold || D.reduced || dur === 0) { dispose(Lold); Lold = null; return; }
      scan = { t0: performance.now(), dur: dur || 1500 };
    }
    function scanTick(now) {
      if (!scan) return;
      const t = Math.min(1, (now - scan.t0) / scan.dur), e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const r = new T.Vector3().setFromMatrixColumn(cam.matrixWorld, 0).setY(0).normalize();
      const ctr = L.model.center, Rr = Math.max(L.model.size.x, L.model.size.z) * .62 + .1, s = -Rr + e * 2 * Rr;
      const p = ctr.clone().addScaledVector(r, s);
      L.plane.setFromNormalAndCoplanarPoint(r.clone().negate(), p);
      Lold.plane.setFromNormalAndCoplanarPoint(r, p);
      sheet.visible = true; sheet.position.copy(p); sheet.lookAt(p.clone().add(r)); sheet.scale.set(Rr * 2.2, L.model.size.y * 1.5 + .3, 1); sheet.position.y = L.model.size.y * .5;
      sheet.material.uniforms.uA.value = Math.sin(t * Math.PI) * 1.2;
      if (t >= 1) { scan = null; sheet.visible = false; L.plane.set(new T.Vector3(1, 0, 0), 1e4); dispose(Lold); Lold = null; }
    }

    /* ---- camera ---- */
    const DEF = { az: 35, el: 14, dist: 4.4, x: .18, y: 0, fov: 30 };
    const cs = Object.assign({}, DEF), ct = Object.assign({}, DEF), tgt = new T.Vector3(0, .5, 0), tgtT = new T.Vector3(0, .5, 0);
    let spin = cfg.spin == null ? 3 : cfg.spin, spinOff = 0, mx = 0, my = 0, rise = 0;
    const onMove = e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; };
    addEventListener('pointermove', onMove, { passive: true });
    function size() { const dpr = Math.min(devicePixelRatio || 1, 1.75); R.setPixelRatio(dpr); R.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; }
    size(); addEventListener('resize', size);
    const small = () => innerWidth < 760;

    /* ---- notes (annotations attached to parts) ---- */
    let notes = [];
    function clearNotes() { notes.forEach(n => { n.el.classList.remove('on'); n.ln.style.opacity = 0; setTimeout(() => { n.el.remove(); n.ln.remove(); }, 500); }); notes = []; }
    function anchor(at) {
      if (!M) return null;
      if (Array.isArray(at)) { const hs = M.size.clone().multiplyScalar(.5); return M.center.clone().add(new T.Vector3(at[0] * hs.x, at[1] * hs.y, at[2] * hs.z)); }
      let hit = null; L.group.traverse(o => { if (!hit && o.name && o.name.toLowerCase().includes(String(at).toLowerCase())) hit = o; });
      return hit ? new T.Box3().setFromObject(hit).getCenter(new T.Vector3()) : null;
    }
    function setNotes(list) {
      clearNotes();
      (list || []).forEach((n, i) => {
        const p = anchor(n.at); if (!p) return;
        const el = h('div', { class: 'm3-tag' }, h('i', { class: 'm3-dot' }), h('div', { class: 'm3-lab' }, h('b', null, n.label || ''), n.text ? h('span', null, n.text) : null));
        const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line'); ln.style.opacity = 0;
        tags.append(el); svg.append(ln);
        const o = { p, el, ln, i, side: 0 }; notes.push(o);
        setTimeout(() => { if (notes.includes(o)) { el.classList.add('on'); ln.style.opacity = ''; } }, (D.reduced ? 0 : 900) + i * 160);
      });
    }
    const v3 = new T.Vector3();
    function placeNotes() {
      if (!notes.length) return;
      const W = innerWidth, H = innerHeight, cx = (.5 + (small() ? 0 : cs.x * .5)) * W;
      const pos = notes.map(n => {
        v3.copy(n.p).project(cam); const x = (v3.x * .5 + .5) * W, y = (-v3.y * .5 + .5) * H;
        if (!n.side) n.side = x >= cx ? 1 : -1;
        if (!n.w) { n.w = n.el.lastChild.offsetWidth; n.hh = n.el.lastChild.offsetHeight; }
        let side = n.side; const off = small() ? 34 : 70;
        if (side > 0 && x + off + n.w > W - 12) side = -1; else if (side < 0 && x - off - n.w < 12) side = 1;
        return { n, x, y, side, lx: x + side * off, ly: Math.max(70 + (n.hh || 0), y - (small() ? 30 : 44)) };
      });
      for (const sd of [-1, 1]) {   // labels on the same side never overlap: push them down in order
        const col = pos.filter(q => q.side === sd).sort((a, b) => a.ly - b.ly);
        for (let k = 1; k < col.length; k++) { const a = col[k - 1], b = col[k]; if (b.ly - (b.n.hh || 40) < a.ly + 8) b.ly = a.ly + 8 + (b.n.hh || 40); }
      }
      pos.forEach(({ n, x, y, side, lx, ly }) => {
        n.el.classList.toggle('l', side < 0);
        n.el.style.setProperty('--x', x + 'px'); n.el.style.setProperty('--y', y + 'px');
        n.el.style.setProperty('--lx', (lx - x) + 'px'); n.el.style.setProperty('--ly', (ly - y) + 'px');
        n.ln.setAttribute('x1', x); n.ln.setAttribute('y1', y); n.ln.setAttribute('x2', lx); n.ln.setAttribute('y2', ly);
      });
    }

    /* ---- shots ---- */
    let want = null, first = true, seq = 0;
    async function shot(page, i) {
      const shots = cfg.shots || [], s = Object.assign({}, DEF, shots.length ? shots[i % shots.length] : {}, page && page.scene);
      const look = s.look || cfg.look || 'studio', focus = s.focus || [], src = s.src || cfg.src, tk = ++seq;
      want = s;
      const asp = innerWidth / innerHeight;   // portrait screens: pull back so the model still fits the width
      Object.assign(ct, { az: s.az, el: s.el, dist: s.dist * (asp < 1 ? Math.pow(1 / Math.max(asp, .45), .75) : 1), x: small() ? 0 : s.x, y: small() ? .14 : s.y, fov: s.fov });
      if (s.spin != null) spin = s.spin; else spin = cfg.spin == null ? 3 : cfg.spin;
      if (!src) return;
      let model;
      try { model = await base(src); } catch (e) { console.warn('model', e); load.textContent = ''; poster(); return; }
      if (tk !== seq) return;
      M = model;
      tgtT.set(M.center.x, M.size.y * (s.ty == null ? .45 : s.ty), M.center.z);
      floor(cfg.floor || (look === 'blueprint' || look === 'hologram' || look === 'points' ? 'grid' : 'shadow'));
      if (first) {
        first = false; tgt.copy(tgtT);
        const intro = D.reduced ? 'none' : (cfg.intro || 'scan');
        Object.assign(cs, ct, { dist: ct.dist * (intro === 'none' ? 1 : 1.45), az: ct.az - (intro === 'none' ? 0 : 40), el: ct.el + (intro === 'none' ? 0 : 10) });
        if (intro === 'scan' && look !== 'xray') { L = layer(M, 'xray', focus); setTimeout(() => { if (want === s) startScan(layer(M, look, focus), 1900); }, 700); }
        else L = layer(M, look, focus);
        if (intro === 'assemble') L.ex = 1.4;
        if (intro === 'rise') rise = 1;
        if (intro === 'drive') rise = -1;
      } else if (!L || L.model !== M || L.look !== look) startScan(layer(M, look, focus), 1500);
      else if (L.focus !== focus.join('|')) dress(L, look, focus);
      L.exT = s.explode || 0;
      if (L.mixer) { L.mixer.stopAllAction(); const clip = s.anim && M.anims.find(a => a.name.toLowerCase().includes(String(s.anim).toLowerCase()));
        if (clip) { const a = L.mixer.clipAction(clip); a.setLoop(s.once ? T.LoopOnce : T.LoopRepeat); a.clampWhenFinished = true; a.reset().play(); } }
      setNotes(s.notes);
    }

    /* ---- loop ---- */
    let raf = 0, alive = true, last = performance.now();
    const ang = (a, b) => { let d = ((b - a) % 360 + 540) % 360 - 180; return d; };
    function frame(now) {
      if (!alive) return; raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      const k = D.reduced ? 1 : 1 - Math.exp(-dt * 1.9), kf = 1 - Math.exp(-dt * 3);
      spinOff += (D.reduced ? 0 : spin) * dt;
      cs.az += ang(cs.az, ct.az) * k; for (const q of ['el', 'dist', 'x', 'y', 'fov']) cs[q] += (ct[q] - cs[q]) * k;
      tgt.lerp(tgtT, k);
      const az = (cs.az + spinOff + mx * 7) * Math.PI / 180, el = Math.max(-5, Math.min(80, cs.el - my * 5)) * Math.PI / 180;
      cam.fov = cs.fov; cam.position.set(tgt.x + Math.sin(az) * Math.cos(el) * cs.dist, tgt.y + Math.sin(el) * cs.dist, tgt.z + Math.cos(az) * Math.cos(el) * cs.dist);
      cam.lookAt(tgt);
      const W = innerWidth, H = innerHeight; cam.setViewOffset(W, H, -cs.x * W, cs.y * H, W, H); cam.updateProjectionMatrix();
      for (const Ly of [L, Lold]) {
        if (!Ly) continue;
        if (Ly === L) Ly.ex += (Ly.exT - Ly.ex) * (D.reduced ? 1 : 1 - Math.exp(-dt * 2.2));
        if (Ly.ex > .001 || Ly.exW) { Ly.exW = Ly.ex > .001; Ly.group.traverse(o => { if (o.isMesh && o.userData.p0) { const p = o.userData.p0, e = o.userData.ex; o.position.set(p[0] + e[0] * Ly.ex, p[1] + e[1] * Ly.ex, p[2] + e[2] * Ly.ex); } }); }
        if (Ly.mixer) Ly.mixer.update(dt);
        Ly.m.focus.emissiveIntensity += ((L && L.focus ? .9 + .25 * Math.sin(now / 420) : 0) - Ly.m.focus.emissiveIntensity) * kf;
        for (const x of [Ly.m.xr, Ly.m.holo, Ly.m.bp]) x.uniforms.uT.value = now / 1000;
      }
      if (rise && L) { rise *= D.reduced ? 0 : Math.exp(-dt * 1.6); if (Math.abs(rise) < .002) rise = 0;
        L.group.position.set(rise < 0 ? rise * 5 : 0, rise > 0 ? -rise * 1.2 : 0, 0); }
      scanTick(now);
      R.render(scene, cam);
      placeNotes();
    }
    raf = requestAnimationFrame(frame);

    return {
      shot,
      destroy() { alive = false; cancelAnimationFrame(raf); removeEventListener('resize', size); removeEventListener('pointermove', onMove);
        dispose(L); dispose(Lold); R.dispose(); R.forceContextLoss && R.forceContextLoss(); wrap.remove(); }
    };
  };
})();
