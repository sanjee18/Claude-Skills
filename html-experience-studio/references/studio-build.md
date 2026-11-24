# Studio-Modus: maßgeschneiderte Builds (Standard)

Maßstab ist die Leopard-Referenz (`RVT_Capgemini_Invent_Future_Collaboration_Workshop_Leopard.html`). Sie wirkt nicht
wegen einzelner Effekte, sondern weil **alles für genau diesen Inhalt gebaut ist**:

- **Eine durchgehende Welt statt Folien.** Ein Hauptdarsteller (dort: echtes GLB-Modell) bleibt über alle Szenen im Bild.
  Jede Szene ist eine neue Kamera-Einstellung in derselben Welt.
- **Übergänge erzählen.** „Von außen → unter die Panzerung (Röntgen-Scan) → durch die Optik (Kamera taucht ins Glas) →
  Warp ins Portfolio-Zahnrad.“ Jeder Wechsel ist ein Erzählschritt, keine Blende.
- **Wenige Szenen, jede choreografiert.** 6 Hauptszenen, ~125 KB eigener Szenen-Code, ~80 KB eigene 3D-Bühne.
- **Inhalts-Visuals eigens gebaut** (V-Modell, Eisberg, Zeitleiste, Architektur als Live-SVG im Deck-Stil), echte Demos.

**Zwei Bauarten.** *Kamera-Welt* (diese Datei: Szenen = Shots in einem 3D-Raum, `runtime.js`) und *Scroll-Bühne*
(Website/Pitch: eine gepinnte Fläche, Scroll = Zahl p, alles Funktion von p, `assets/studio/scrollstage.js`; Aufbau, Zahlen und
Gate in `craft-bar.md`, Code in `studio-recipes.md` §11–17, lebendes Beispiel `assets/worlds/scroll-stage.html`). Beide teilen
Briefing-Bogen, Regiebuch, Hero-Asset-Strategie und Review. Dritte Bauart: Shader-Bühne (ein Vollbild-Shader auf `sigkit.js`, Signature-Stücke in `signature.md`). Die Referenz-Welten Moonlit Petals und Vinyl Supernova zeigen
zwei weitere Hauptdarsteller-Typen (Canvas-Szene, Partikel-Zeitleiste): `worlds.md`.

Daraus folgen die Regeln dieses Modus:

1. **Kein Seitentyp, kein Template, kein Library-Baustein im Output.** Library, Design-Themes und Beispiele sind
   *Moodboard*: sie zeigen Richtung, Tempo, Material. Übernommen wird die Qualität, nicht das Element.
2. **Erst die Welt, dann die Seiten.** Konzept = Hauptdarsteller + Raum + Kamerareise. Seiten sind Shots darin.
3. **Der Nutzer bestimmt jede Seite** im Briefing-Bogen (Titel, Hauptseiten, Outro, Design-Elemente + Ort, Übergänge) und gibt **ein** Regiebuch frei (`interview.md`, `page-cards.md`).
4. **Jede Grafik wird aus ihrem Inhalt gebaut** (Zahl, Ablauf, Vergleich, Ort, Struktur → eigene Form).
5. **Prüfung auf Wirkung**, nicht auf Formalien: `review-rubric.md`.

## Technik-Entscheidung

| Option | Einsatz | Warum |
|---|---|---|
| **three.js r147 (vanilla), eingebettet** | **Standard** | Offline, ohne Build-Schritt, GLB/Shader/Postprocessing. Referenz beweist das Niveau. In `assets/vendor/three-r147.js`: Core, GLTFLoader, EffectComposer, RenderPass, ShaderPass, UnrealBloomPass, Reflector, RoundedBoxGeometry, MeshoptDecoder. |
| react-three-fiber (pmndrs) | nur auf Wunsch, wenn ein dauerhaftes React-Projekt entsteht | Braucht React + Bundler (Vite + Single-File-Plugin). Bessere Code-Struktur, aber kein besseres Bild. Für Einmal-Keynotes Overhead. |
| pmndrs-Bibliotheken ohne React (z. B. `postprocessing`) | wenn ein Effekt fehlt (DOF, God Rays, Chromatic Aberration) | Laufen vanilla; vor Download Nutzer fragen, in `assets/vendor` mit Lizenz ablegen. |
| liquid-glass-js (dashersw) | **nur als visuelle Referenz** | Ein Commit, kein Paket, mehrere Dateien, `html2canvas` (langsam, erfasst WebGL nicht zuverlässig). Liquid Glass stattdessen als eigener Refraktions-Shader in der Szene: `studio-recipes.md` → „Liquid Glass“. |
| GSAP | nicht nötig | Runtime hat Tweens + Kamera-Easing. Nur nehmen, wenn eine Timeline-Choreografie es klar braucht. |

## Projektstruktur

```
<projekt>/
  index.html     Szenen als <section class="scene" data-id="…"> (Texte, Inhalts-Visuals, Anker-Labels)
  style.css      die eigene Gestaltung (Typo, Farbe, Layout pro Szene) – nichts aus den Themes kopieren
  story.js       Welt + Choreografie: Studio.init({ setup, scenes:[…] })
  media/         Fotos (WebP ≤ 1920 px), GLB (meshopt/WebP), Videos (720–1080p, ohne Ton)
  concept.md     Briefing-Antworten + Regiebuch (Freigabe mit Datum dokumentieren)
```
Start: `examples/studio-demo/` kopieren (Ozean-Shader, Insel aus Noise, Kameraflug, 3D-Labels, Count-up, SVG-Draw)
und **alles Inhaltliche ersetzen**. Das Demo zeigt die Mechanik, nicht den Look des nächsten Projekts.

## Runtime-Vertrag (`assets/studio/runtime.js`)

```js
Studio.init({
  background: '#05070a', fog: {color, density}, toneMapping: 'aces'|'none', exposure: 1,
  bloom: { strength: .5, radius: .5, threshold: .85 } | false, drift: .015, parallax: .06, three: true,
  setup: async ctx => { /* Welt bauen: ctx.THREE, ctx.scene, ctx.camera, ctx.renderer, ctx.composer */ },
  scenes: [{
    id: 'open', chapter: 'Kapitelname', title: 'für Übersicht (sonst h1/h2)',
    shot:   { pos:[x,y,z], look:[x,y,z], fov:40, roll:0, push:.12, pushDur:18 },  // Einstellung; push = langsames Heranfahren nach Ankunft
    mobile: { pos:[…], fov:50 },                                     // optional: Shot fürs Handy (sonst fov × cfg.mobileFov, Standard 1.4)
    via:    { path:[[…],[…]], look:[[…]], dur:4, ease:'cine', fovPulse:.1 },  // Kamerafahrt HIN zu dieser Szene
    dur: 2.2, revealAt: .55,                                         // Text erscheint bei 55 % der Fahrt
    setup(ctx){}, enter(ctx,{from,dir,camera}){ return promise }, leave(ctx,{to,dir}){}, update(ctx,t,dt){}, always:false
  }]
});
```
- `Studio.tween({dur, ease, delay, update:e=>…})` → Promise · Easing: `cine` (Kamera), `inOutCubic`, `outExpo`, `inOutSine` …
- `Studio.anchor(el, vec3|object3D, {dx,dy})` → HTML-Label klebt an einem 3D-Punkt (Klasse `anchor`).
- `Studio.asset('media/x.webp')`, `Studio.texture(p)`, `await Studio.loadGLB('media/x.glb')`, `Studio.json(p)`.
- `Studio.onFrame(ctx => …)` für eigene Animationen; `Studio.go(id)`, `next()`, `prev()`, `idle()`.
- DOM: `[data-in="n"]` gestaffelte Reveals (`data-fx="fade|mask|wipe|scale"`), `.ln>span` Zeilen-Masken,
  `[data-count]` (+ `data-dec`, `data-pre`, `data-suf`), `svg[data-draw]` zeichnet Linien, `[data-go]`, `[data-next]`.
- Ohne WebGL-Welt (`three:false`) bleibt Navigation/Reveal erhalten – z. B. für reine Editorial-/SVG-Decks.
- Bedienung eingebaut: Pfeile/Leertaste/Klicker (PageUp/Down), Mausrad, Wischen, `M` Übersicht, `F` Vollbild,
  `P` Sprecheransicht (Notizen, nächste Szene, Timer), `B`/`.` Schwarzbild, Zifferntasten, Hash-Links,
  `prefers-reduced-motion` (Fahrten werden Schnitte). Szene mit `backup: true` = Q&A-Anhang (nicht in next/prev).

## Ablauf eines Builds

1. **Regiebuch freigegeben** (`concept.md`): Kernsatz, Held, Welt, Kamerareise, Wow, Seitenplan Titel → Hauptseiten → Outro → Backup.
2. **Bauen in Endqualität**: Welt, Shots, Fahrten, Texte, Inhalts-Visuals, Material, Licht, Mikro-Choreografie in einem
   Zug (kein Blockout zur Freigabe). Sprechernotizen (`<aside class="notes">`), Backup-Szenen (`backup: true`).
3. **Bündeln**: `python scripts/studio_bundle.py <projekt>/index.html out/<Name>_v1.html` (eine Offline-Datei).
4. **Interne Qualitätsschleife** (bis zu 2 Durchgänge): `node scripts/studio_frames.cjs out/x.html out/frames --motion`
   + `python scripts/sheet.py out/frames` → selbst ansehen → `review-rubric.md` + Craft-Gate + `scripts/leakcheck.py`
   → schwächste Punkte nacharbeiten. Optional Agent `impeccable:impeccable-finish-reviewer` / `impeccable-motion-reviewer`.
5. **Liefern** mit Standbild-Bogen und Review-Werten. Unter Schwelle → nicht liefern, weiter nacharbeiten.

## Budget und Robustheit

- Ziel < 15 MB; GLB mit meshopt + WebP-Texturen; Fotos WebP q70–80; keine externen Requests (Bundler warnt).
- 60 fps auf einem Laptop: Geometrie < ~1,5 Mio. Dreiecke, Bloom nur mit hohem Threshold, DPR ≤ 1,75.
- Lesbarkeit über WebGL: projektbezogene Vignette/Verläufe in `style.css`, Kontrast AA prüfen.
- Bilder von Menschen nie verfremden ohne Ja; Fakten nur belegt, sonst `[TBD]`; Bildnachweise im Deck.
