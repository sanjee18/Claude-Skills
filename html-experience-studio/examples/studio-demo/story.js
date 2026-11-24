/* Landfall · bespoke world for the Studio runtime demo.
   Everything visual here is written for THIS story: a dusk ocean (shader), an island grown from noise, a sky dome,
   and a camera that travels between four shots. The runtime only supplies the plumbing. */
(function () {
  'use strict';
  const T = THREE, S = Studio;
  const HORIZON = new T.Color('#c9865c'), ZENITH = new T.Color('#0a1220'), DEEP = new T.Color('#050d16'), SUN = new T.Vector3(-.15, .05, -1).normalize();
  const ISLAND = new T.Vector3(0, 0, -170);
  const fog = { color: new T.Color('#a8714f'), density: .0042 };

  /* ---------- tiny value noise ---------- */
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  const noise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return S.lerp(S.lerp(hash(xi, yi), hash(xi + 1, yi), u), S.lerp(hash(xi, yi + 1), hash(xi + 1, yi + 1), u), v); };
  const fbm = (x, y) => { let a = 0, w = .5; for (let k = 0; k < 6; k++) { a += w * noise(x, y); x = x * 2.03 + 17.1; y = y * 2.03 + 9.2; w *= .5; } return a; };

  /* ---------- sky dome ---------- */
  function sky() {
    const m = new T.ShaderMaterial({ side: T.BackSide, depthWrite: false, fog: false, toneMapped: false,
      uniforms: { uH: { value: HORIZON }, uZ: { value: ZENITH }, uSun: { value: SUN } },
      vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: `uniform vec3 uH,uZ,uSun; varying vec3 vD;
        void main(){ float h = clamp(vD.y,0.,1.); vec3 c = mix(uH, uZ, pow(h,.42));
          float s = max(dot(vD,uSun),0.); c += vec3(1.,.76,.5)*(pow(s,1400.)*2.2 + pow(s,30.)*.28 + pow(s,5.)*.07);
          c = mix(c, uH*.8, smoothstep(.02,-.05,vD.y)); gl_FragColor = vec4(c,1.); }` });
    return new T.Mesh(new T.SphereGeometry(1500, 48, 24), m);
  }

  /* ---------- ocean ---------- */
  function ocean() {
    const g = new T.PlaneGeometry(3600, 3600, 360, 360); g.rotateX(-Math.PI / 2);
    const m = new T.ShaderMaterial({ toneMapped: false, fog: false,
      uniforms: { uT: { value: 0 }, uH: { value: HORIZON }, uZ: { value: ZENITH }, uDeep: { value: DEEP }, uSun: { value: SUN },
        uFogC: { value: fog.color }, uFogD: { value: fog.density } },
      vertexShader: `uniform float uT; varying vec3 vW; varying vec3 vN;
        float wv(vec2 p, vec2 d, float f, float a, float s){ return a*sin(dot(p,d)*f + uT*s); }
        float H(vec2 p){ return wv(p,vec2(.8,.6),.05,.9,.9)+wv(p,vec2(-.4,.9),.09,.45,1.3)+wv(p,vec2(.2,-1.),.21,.16,2.1)+wv(p,vec2(.95,.3),.43,.06,3.1); }
        void main(){ vec3 p = (modelMatrix*vec4(position,1.)).xyz; float e = .6;
          float h = H(p.xz); vN = normalize(vec3(H(p.xz-vec2(e,0.))-H(p.xz+vec2(e,0.)), 2.*e, H(p.xz-vec2(0.,e))-H(p.xz+vec2(0.,e))));
          p.y += h; vW = p; gl_Position = projectionMatrix*viewMatrix*vec4(p,1.); }`,
      fragmentShader: `uniform vec3 uH,uZ,uDeep,uSun,uFogC; uniform float uFogD; varying vec3 vW; varying vec3 vN;
        void main(){ vec3 v = normalize(cameraPosition - vW); vec3 n = normalize(vN);
          float fr = .03 + .97*pow(1.-max(dot(n,v),0.),5.);
          vec3 r = reflect(-v,n); vec3 sk = mix(uH, uZ, pow(clamp(r.y,0.,1.),.42));
          vec3 c = mix(uDeep, sk*.62, fr);
          float sp = pow(max(dot(r,uSun),0.), 380.); c += vec3(1.,.8,.55)*sp*1.7;
          c += vec3(1.,.7,.45)*pow(max(dot(r,uSun),0.),18.)*.12;
          float d = length(cameraPosition - vW); float f = 1. - exp(-pow(d*uFogD,2.));
          gl_FragColor = vec4(mix(c, uFogC, f),1.); }` });
    const mesh = new T.Mesh(g, m); mesh.frustumCulled = false;
    S.onFrame(ctx => { m.uniforms.uT.value = ctx.time; m.uniforms.uFogD.value = fog.density; mesh.position.x = Math.round(ctx.camera.position.x / 10) * 10; mesh.position.z = Math.round(ctx.camera.position.z / 10) * 10; });
    return mesh;
  }

  /* ---------- island ---------- */
  const marks = {};
  function island() {
    const N = 300, SZ = 260, g = new T.PlaneGeometry(SZ, SZ, N, N); g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position, col = new Float32Array(pos.count * 3), c = new T.Color();
    const sand = new T.Color('#c9ad86'), green = new T.Color('#1f3520'), green2 = new T.Color('#36502a'), rock = new T.Color('#6b6155'), reef = new T.Color('#2f7f86');
    let peak = { y: -1 };
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const wx = x + (fbm(x * .012 + 3, z * .012) - .5) * 60, wz = z + (fbm(x * .012, z * .012 + 7) - .5) * 60;
      const r = Math.hypot(wx * 1.15, wz * .8) / 100;
      const mask = S.clamp(1 - r, 0, 1);
      let h = Math.pow(mask, 1.5) * (10 + fbm(x * .035, z * .035) * 34) + fbm(x * .11, z * .11) * 2.2 * mask - 2.6;
      h = Math.max(h, -6);
      pos.setY(i, h);
      if (h > peak.y) peak = { x, y: h, z };
      const t = fbm(x * .2, z * .2);
      if (h < .1) c.copy(reef).lerp(DEEP, S.clamp(-h / 5, 0, 1));
      else if (h < 1.5) c.copy(sand);
      else if (h > 24) c.copy(rock).lerp(green, .25);
      else c.copy(green).lerp(green2, t * .9);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new T.BufferAttribute(col, 3)); g.computeVertexNormals();
    const mesh = new T.Mesh(g, new T.MeshStandardMaterial({ vertexColors: true, roughness: .92, metalness: 0 }));
    mesh.position.copy(ISLAND);
    marks.peak = new T.Vector3(peak.x, peak.y + 2, peak.z).add(ISLAND);
    marks.bay = new T.Vector3(-72, 1.5, 22).add(ISLAND);
    marks.reef = new T.Vector3(64, .6, 70).add(ISLAND);
    return mesh;
  }

  Studio.init({
    background: '#c9865c', toneMapping: 'none', bloom: { strength: .42, radius: .55, threshold: .9 }, drift: .02, parallax: .8,
    setup(ctx) {
      ctx.scene.background = null;
      ctx.scene.fog = new T.FogExp2(fog.color, fog.density);
      ctx.scene.add(sky(), ocean(), island());
      ctx.scene.add(new T.HemisphereLight('#e7b48a', '#050d16', .55));
      const sun = new T.DirectionalLight('#ffd2a1', 2.2); sun.position.copy(SUN).multiplyScalar(300).add(new T.Vector3(0, 60, 0)); ctx.scene.add(sun);
      const rim = new T.DirectionalLight('#7aa6d6', .5); rim.position.set(120, 80, 200); ctx.scene.add(rim);
      S.onFrame(() => { ctx.scene.fog.density = fog.density; });
      for (const el of ctx.$$('[data-pin]')) S.anchor(el, marks[el.dataset.pin]);
    },
    scenes: [
      { id: 'open', chapter: '', shot: { pos: [0, 4.5, 330], look: [-34, 9, 200], fov: 38 } },
      { id: 'approach', chapter: 'Approach', dur: 5.2, revealAt: .7,
        shot: { pos: [62, 11, 6], look: [38, 9, -170], fov: 40 },
        via: { path: [[10, 3.2, 230], [40, 5, 110]], ease: 'inOutSine' },
        enter: () => S.tween({ dur: 4.6, ease: 'inOutSine', update: e => { fog.density = S.lerp(.0046, .0034, e); } }) },
      { id: 'ridge', chapter: 'The ridge', dur: 3.6,
        shot: { pos: [-112, 52, -60], look: [-6, 12, -172], fov: 42 }, mobile: { pos: [-150, 70, -40], fov: 50 },
        via: { path: [[-30, 30, -20]] } },
      { id: 'end', chapter: 'Perspective', dur: 4.4, revealAt: .75,
        shot: { pos: [-150, 280, 140], look: [-120, 0, -150], fov: 34 }, mobile: { pos: [0, 420, 120], look: [0, 0, -120], fov: 48 },
        via: { path: [[-120, 140, -30]], fovPulse: .15 },
        enter: () => S.tween({ dur: 3.6, update: e => { fog.density = S.lerp(.0034, .0012, e); } }),
        leave: () => S.tween({ dur: 2, update: e => { fog.density = S.lerp(.0012, .0034, e); } }) }
    ]
  });
})();
