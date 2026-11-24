# Studio-Rezepte (three.js r147, vanilla)

Bausteine für **Techniken**, nicht für Looks. Immer an Farbe, Licht, Tempo und Inhalt des Projekts anpassen.
`T = THREE`, `S = Studio`, `ctx` aus `setup(ctx)`. Getestete Grundlage: `examples/studio-demo/story.js`
(Ozean-Shader, Himmelskuppel, Gelände aus Noise, Kamerafahrt, 3D-Labels, Nebel-Choreografie).

## 1 · Echtes Gelände aus Höhendaten (Inseln, Länder, Berge)
Höhendaten als Graustufen-PNG (z. B. aus frei lizenzierten DEM/SRTM-Kacheln, vorab mit Python skaliert, 512–1024 px).
```js
const img = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = S.asset('media/dem.png'); });
const cv = Object.assign(document.createElement('canvas'), { width: img.width, height: img.height });
const c2 = cv.getContext('2d'); c2.drawImage(img, 0, 0); const px = c2.getImageData(0, 0, img.width, img.height).data;
const g = new T.PlaneGeometry(W, H, img.width - 1, img.height - 1); g.rotateX(-Math.PI / 2);
const p = g.attributes.position;
for (let i = 0; i < p.count; i++) p.setY(i, px[i * 4] / 255 * HEIGHT - SEA);   // Reihenfolge = Bildzeilen
g.computeVertexNormals();
```
Orte: Längen/Breiten linear auf die Fläche abbilden (Bounding Box der Kachel), Labels mit `S.anchor`.
Farbe nach Höhe/Neigung (Vertex Colors) oder echtes Satellitenbild als Textur (Lizenz prüfen).

## 2 · Foto-Fenster im Raum (Fotos dominieren, sind aber Teil der Welt)
```js
const mat = new T.ShaderMaterial({ transparent: true, depthWrite: false,
  uniforms: { map: { value: S.texture('media/tea.webp') }, uO: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `uniform sampler2D map; uniform float uO; varying vec2 vUv;
    void main(){ vec4 c = texture2D(map, vUv); vec2 e = smoothstep(0., .08, vUv) * smoothstep(0., .08, 1. - vUv);
      gl_FragColor = vec4(c.rgb, uO * e.x * e.y); }` });
const photo = new T.Mesh(new T.PlaneGeometry(16, 9), mat);   // Seitenverhältnis des Fotos!
```
Kamera fährt auf das Fenster zu und *hindurch* (Shot dicht davor, `fov` kleiner) → nächste Szene beginnt im Bild.
Mehrere Fenster entlang der Kamerareise = Galerie als Raum statt Raster.

## 3 · Röntgen-Scan über ein GLB (Look-Wechsel als Ereignis)
```js
const xray = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending,
  uniforms: { uScan: { value: -1 }, uC: { value: new T.Color('#6fd2ff') } },
  vertexShader: 'varying vec3 vW,vN; void main(){ vN=normalize(normalMatrix*normal); vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
  fragmentShader: `uniform float uScan; uniform vec3 uC; varying vec3 vW,vN;
    void main(){ float rim = pow(1.-abs(vN.z), 2.); float band = smoothstep(.25,0.,abs(vW.x-uScan));
      gl_FragColor = vec4(uC*(rim*.8+band*1.6), (rim*.5+band)*step(vW.x,uScan+.02)); }` });
// Original- und Röntgen-Material je Mesh merken, dann uScan von -L bis +L tweenen und Original ausblenden.
S.tween({ dur: 1.6, ease: 'inOutCubic', update: e => xray.uniforms.uScan.value = S.lerp(-2, 2, e) });
```
Bauteile hervorheben: Mesh per Name suchen (`gltf.scene.getObjectByName`), eigenes Emissive-Material, Label anheften.

## 4 · Partikel-Morph (Form A → Form B, Kennzahl aus Punkten)
```js
const N = 40000, a = new Float32Array(N * 3), b = new Float32Array(N * 3);   // Positionen aus Formen/Bild/Text samplen
const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(a, 3)); g.setAttribute('aB', new T.BufferAttribute(b, 3));
const m = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending,
  uniforms: { uK: { value: 0 }, uT: { value: 0 }, uC: { value: new T.Color('#ffd28a') } },
  vertexShader: `attribute vec3 aB; uniform float uK,uT; void main(){ float k = smoothstep(0.,1.,uK);
    vec3 p = mix(position, aB, k) + sin(uT + position.yzx*3.)*.02*(1.-abs(k*2.-1.))*8.;
    vec4 mv = modelViewMatrix*vec4(p,1.); gl_PointSize = 2.2*(30./-mv.z); gl_Position = projectionMatrix*mv; }`,
  fragmentShader: 'uniform vec3 uC; void main(){ float d=length(gl_PointCoord-.5); gl_FragColor=vec4(uC, smoothstep(.5,.0,d)); }' });
```
Punkte aus Text: Text in ein Canvas zeichnen, Pixel mit Alpha > 128 als Positionen nehmen.

## 5 · Warp / Durchflug (großer Kapitelsprung, max. 1× pro Deck)
Sterne als `LineSegments` entlang z; im Übergang `scale.z` und Geschwindigkeit hochtweenen, `fovPulse` am Ziel-Shot,
gleichzeitig Bloom-Stärke kurz anheben. Am Ende harter Schnitt in die neue Welt *innerhalb* des Weiß-Blitzes.

## 6 · Nebel, Dunst, Licht-Atmosphäre
- `FogExp2`-Dichte pro Szene tweenen (Demo: Insel taucht aus dem Dunst auf).
- Nebelbänke: 4–8 große transparente Ebenen mit Noise-Shader (`uT` animiert), `depthWrite:false`, langsam driftend.
- God Rays billig: additiver Kegel (`ConeGeometry`, offen) mit Verlauf-Shader, nur im Gegenlicht.

## 7 · Liquid Glass (statt liquid-glass-js)
In der Szene (echte Refraktion der WebGL-Welt):
```js
const glass = new T.Mesh(new T.RoundedBoxGeometry(3.2, 2, .25, 6, .3), new T.MeshPhysicalMaterial({
  transmission: 1, roughness: .08, thickness: .6, ior: 1.45, clearcoat: 1, clearcoatRoughness: .05,
  attenuationColor: new T.Color('#bfe6ff'), attenuationDistance: 2.5 }));
ctx.scene.environment = /* PMREM aus einer RoomEnvironment oder HDR-Textur */ null;
```
Für DOM-Panels über der Szene: `backdrop-filter: blur(18px) saturate(1.4)` + feine helle Innenkante
(`box-shadow: inset 0 1px 0 rgba(255,255,255,.35)`) + Spiegelung als `linear-gradient`-Overlay. SVG-Displacement im
`backdrop-filter` nur Chromium → nur mit Fallback.

## 8 · Kamera taucht in ein Objekt (Optik, Bildschirm, Fenster, Blüte)
Ziel-Shot dicht vor der Öffnung, `via.fovPulse: .25`, `revealAt: .9`; im `enter` der nächsten Szene den DOM-Inhalt
aus einer Kreismaske öffnen (`clip-path: circle(0% at 50% 50%)` → `circle(150%)`), Welt dahinter abdunkeln.

## 9 · Inhalts-Visuals aus Daten (statt Seitentypen)
Jede Grafik beantwortet *eine* Frage und bekommt ihre eigene Form:
- Anteile → proportionale Flächen/Bögen im Stil der Welt (nicht 4 Zahlen untereinander).
- Ablauf über Zeit → Linie, die der Kamerareise folgt, oder Zeitstrahl auf dem Boden der 3D-Welt.
- Orte → Punkte auf dem Gelände (Rezept 1) mit Route als leuchtende Kurve (`TubeGeometry` entlang `CatmullRomCurve3`).
- Struktur → Schichten im Raum, die die Kamera abfährt.
SVG mit `data-draw` für Linien, `data-count` für Zahlen; Werte nie erfinden.

## 10 · Video in der Welt
`new T.VideoTexture(videoEl)` (muted, playsinline, loop) auf ein Foto-Fenster (Rezept 2) oder als Himmel/Hintergrund-
Ebene; Video-Element im HTML mit `src` → Bundler bettet es ein.

---
# Teil 2 · Referenz-Niveau-Rezepte (aus pear.no, Moonlit Petals, Vinyl Supernova)

Lauffähiger Code zu jedem Rezept: `assets/worlds/scroll-stage.html`, `moonlit-petals.html`, `vinyl-supernova.html`
(in der Library unter „Referenz-Welten“). Begründung und Gate: `craft-bar.md`. Bündeln wie ein Projekt:
`<script src="studio:scrollstage">` / `studio:three` und `python scripts/studio_bundle.py …`.

## 11 · Scroll-Bühne: eine Zahl p treibt alles
```html
<main class="stage" style="position:fixed;inset:0"><div class="artboard"> …Kinder absolut in Artboard-Pixeln… </div></main>
<script src="studio:scrollstage"></script>
<script>
const SS = ScrollStage, R = SS.range, V = SS.vis, E = SS.ease;
SS.init({ runway: 9, tau: .14, artboard: [1440, 900], portrait: [720, 1100],
  chapters: [{ id: 'model', at: .015 }, { id: 'werk', at: .19 } /* … */],
  onFrame(p) { const i = R(.17, .235, p), o = R(.27, .31, p, 'inOutCubic');   // Eintritt / Austritt als Bereiche auf p
    group(el, i, o, 70, -26); } });
</script>
```
- `R(a,b,p,ease)` = 0..1 im Bereich, `V(p,a,b,fin,fout)` = Trapez für „sichtbar zwischen a und b“.
- **Immer Funktion von p, nie Zustand** (`if (p>.3) el.classList.add(...)` bricht beim Zurückscrollen).
- Artboard-CSS: `.artboard{position:absolute;left:50%;top:50%;width:var(--aw);height:var(--ah);transform:translate(-50%,-50%) scale(var(--k))}`;
  `html[data-orient=portrait]` bekommt eigene Positionen. Einstieg zeitgesteuert, danach p. `?p=0.4` springt für Standbilder.
- Tests: `node scripts/scroll_frames.cjs deck.html out --at 0,.1,.2 --mobile`.
- Kinder von `.artboard` sind per Regel absolut; **verschachtelte Container (Ring, Formular) brauchen die Regel ebenfalls** (`.ring>*{position:absolute}`), sonst landen Karten außerhalb des Bilds.

## 12 · Film als Hauptdarsteller: Video scrubben oder Frame-Sequenz
```js
const v = document.querySelector('video.film');            // muted playsinline preload=auto, ffmpeg -g 1 (siehe craft-bar Teil D)
let want = 0; onFrame(p => { want = p * v.duration; });
(function tick(){ v.currentTime += (want - v.currentTime) * .2; requestAnimationFrame(tick); })();   // geglättet, nie hart setzen
const tex = new THREE.VideoTexture(v);                      // oder Canvas 2D: ctx.drawImage(v, 0, 0, w, h)
```
Safari/iOS: Frame-Sequenz (WebP 1440 px, 60–120 Bilder) als `Image`-Array, `ctx.drawImage(frames[Math.round(p*(n-1))])`;
Dateigröße im Blick (Bundler bettet als Data-URI ein). Filter über dem Film im Fragment-Shader (Verzug, Korn, Vignette).
Ohne Film: Shader-Platzhalter wie `scroll-stage.html` (Orb, domain-warped fbm), dem Nutzer als Platzhalter benennen.

## 13 · Rahmen-System: Hairlines, Stern, Ticks
```css
.hl{background:rgba(236,231,221,.26)} .hl.v{width:1px;top:0;bottom:0;transform-origin:50% 0} #v1{left:var(--x1)}
.star{width:22px;margin:-11px 0 0 -11px;animation:spin 18s linear infinite}   /* ein Ornament, an den Schnittpunkten */
```
Linien zeichnen sich zeitgesteuert ein (`scaleY(0→1)`), gleiten bei Kapitelwechsel `translateX(±60px)` aus dem Bild.
Ticks: 33 `<line>`, Länge `= basis + 56·exp(-((y - yKennzahl)/70)²)`, Deckkraft wächst mit der Nähe.

## 14 · Typografie-Choreografie: Maske rein, gerichtet raus
```js
SS.split(h1, 'chars');  SS.split(p, 'lines');                       // .wd>.ch / .ln>i, aria-label bleibt am Elternelement
const rv = (els, t, y = 108, spread = .65) => els.forEach((el, i) => { const u = clamp(t*(1+spread) - i/els.length*spread);
  el.style.transform = `translateY(${(1 - E.outExpo(u)) * y}%)`; });
const grp = (el, inT, outT, dx, dy) => { el.style.visibility = inT > 0 && outT < 1 ? 'visible' : 'hidden';
  el.style.opacity = 1 - outT; el.style.transform = `translate3d(${dx*outT}px,${dy*outT}px,0) scale(${1 - .04*outT})`;
  el.style.filter = outT > .01 ? `blur(${5*outT}px)` : 'none'; };
```
`.ln{overflow:hidden;padding:.04em 0 .2em;margin:-.04em 0 -.2em}` (Unterlängen!). Austrittsrichtung je Beat wechseln.

## 15 · Handschrift und Zeichen-Striche
```js
SS.draw(pathEl, R(.21, .29, p, 'inOutSine'));       // stroke-dasharray = Länge, dashoffset = Länge·(1−t); pathLength="1" geht auch
```
Echte Schrift: Glyphen als Pfade exportieren (Font → SVG), je Strich ein `<path>` mit eigenem p-Bereich (`data-a/data-b`).
Logo/Rahmen genauso (`rect pathLength="1"`).

## 16 · 3D-Karussell mit Tiefenunschärfe und Riss-Kante
```js
cards.forEach((c, i) => { const a = i*72 + ang, z = Math.cos(a*Math.PI/180);          // ang = −t·(N−1)·72, t aus p
  c.style.transform = `translate(-50%,-50%) rotateY(${a}deg) translateZ(360px) rotateY(${-a}deg) scale(${.78 + .22*(z+1)/2})`;
  c.style.filter = `blur(${(1 - z) * 2.5}px)`; c.style.zIndex = Math.round((z+1)*50); });   // Eltern: perspective:1700px
```
Riss-Kante nur auf dem Rahmen-Element, nie auf Text: `<filter><feTurbulence type="fractalNoise" baseFrequency=".018 .026" numOctaves="3"/><feDisplacementMap scale="12" xChannelSelector="R" yChannelSelector="G"/></filter>`.

## 17 · Glas-Pillen im Raum
```css
.gl{backdrop-filter:blur(9.5px) saturate(1.1);background:linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.1));
 box-shadow:inset 0 0 0 1px rgba(255,255,255,.14),inset 0 1px 0 rgba(255,255,255,.41),inset 0 -6px 12px rgba(0,0,0,.16),0 24px 48px rgba(0,0,0,.35)}
.gl::after{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(115deg,rgba(255,255,255,.28),transparent 38%)}
```
Eltern `perspective:1700px`, Formular `transform-style:preserve-3d; rotateX(15deg) rotateY(31deg) rotateZ(5.6deg)`, Pillen mit
`translate3d(x,y,−100…−180px) rotateZ(±3deg)`. **Kein `opacity`/`filter` am Elternteil** (erzeugt Backdrop-Root, Glas bricht nichts mehr).
Bei Fokus Neigung reduzieren, `inert` solange unsichtbar. Funkeln: 3-px-Punkte mit `box-shadow` und unterschiedlichen Dauern.

## 18 · Canvas „backen und komponieren“
Struktur aus `moonlit-petals.html`: `buildTree(seed, …)` (Geometrie im Referenzraum) → `bakeScene(W,H,geo,…)` (Offscreen-Canvases:
core, coreBlur, sprites, halo, bloom, bg) → `frame()` nur `drawImage`. Cache-Schlüssel `[W,H,farben,seed,…].join('|')`.
Glühen: `ctx.globalCompositeOperation='lighter'` + halbierte Kopien. Schärfentiefe: ferne Ebene mit `res = 1/(1+blur·u·.5)` backen und hochskalieren.

## 19 · Federfeld → WebGL-Verzug (weiches Hover)
Grobes Gitter (Kachel ≈ min(W,H)/20) mit Federn `v += (60·(ziel−o) − 5.5·v + mitnahme)·dt`; Offsets als RGBA8-Textur (`128 + o/cap·127`);
Mini-Shader `texture2D(img, uv − (disp−128)/127·cap)`. Nachbarn bewegen sich zusammen, weil die Textur bilinear gefiltert wird.
Sprites am Ankerpunkt: gedämpfte Feder (`gv += ((gt−g)·40 − gv·4.5 + kick)·dt`) lässt sie überschwingen.

## 20 · Partikel-Zeitleiste im Vertex-Shader
```glsl
float phase = fract(uTime/uDur), burst = sm((phase-.24)/.21), reform = sm((phase-.61)/.30), ex = burst*(1.-reform);
vec3 shape = /* f(h1,h2,uTime) */;   vec3 away = shape + dirOnSphere(h3,h4) * travel(h5) /* gedreht um ex*(2.5+h3*7.) */;
vec3 p = mix(shape, away, ex);       // jedes Partikel: reine Funktion von (Hashes, Zeit)
```
Attribute `aA` (vec4 h1..h4) und `aB` (h5) aus `frac(i·φ)` in JS (Double-Genauigkeit!). `Points` mit `frustumCulled=false`
oder fester `boundingSphere`. `gl_PointSize = größe·pxProEinheit/−mv.z` mit `pxProEinheit = H/(2·tan(fov/2))`.
Farbe als HSL im Shader, Form-Identität über Radien (Label, Spindel), Wolke silbrig. Kein CDN: three.js lokal (`studio:three`).

## 21 · Nachbearbeitung klein und gezielt
Bloom (Stärke ~.5, Threshold ~.3) → Spuren (`max(neu, alt·damp)` zwischen zwei Render-Targets; Klasse `Trails` in `vinyl-supernova.html`) →
Abschlusspass in *einem* Shader: Kontrast `(c−.5)·1.15+.5`, Sättigung ×.9, Vignette, Korn (`hash(uv·res + fract(t)·37)`).
Hintergrund `#020203` statt `#000`. Kamera als Erzähler: beim Zerfall `R = 100 + 85·ex`.
