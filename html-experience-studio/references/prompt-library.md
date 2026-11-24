# Prompt-Bibliothek für Custom-Effekte (wenn der Katalog nicht reicht)

Vorgehen: erst Katalog (`catalog.md`) ausschöpfen. Nur wenn nötig eine Seite `type:"html"` bauen oder die Engine
um einen Eintrag erweitern (neue `R.page.*`/`R.tr.*`/`R.bg.*`/`R.tx.*` Funktion in `assets/engine`, dann `build.py`).
Jeder Effekt: offline, ohne Bibliothek (Canvas 2D / CSS / WAAPI) – three.js nur für echte 3D-Modelle.

## Master-Gerüst (7 Slots, in jede Anfrage einsetzen)
```
ZIEL:     Was soll der Betrachter fühlen/verstehen? (1 Satz)
FORMAT:   Seitentyp, Größe 16:9, Dauer der Szene, Loop ja/nein, Auslöser (Eintritt/Klick/Scroll)
LOOK:     Theme-Variablen der Engine (--accent, --bg …), Schriften der Engine, keine Fremdfarben
MOTION:   Phasen mit Zeiten (z. B. 0–0.6 s …), Kurven (.23,1,.32,1 / .77,0,.175,1), Stagger variiert
NIE:      kein ease-in, kein scale(0), keine Layout-Properties animieren, keine CDN, kein Autoplay-Ton
SZENE:    exakte Inhalte/Zahlen aus dem Brief (nichts erfinden)
CHECK:    Reduced-Motion-Fallback, 60 fps, Esc/Zurück funktioniert, Text nicht abgeschnitten
```

## Effekt-Karten (Slots in {{…}} füllen)

**P1 · Display → Zahnrad (Cockpit-Bildschirm wird zum Portfolio-Hub)**
Prompt: „Baue eine Szene, in der eine Kamera auf den Bildschirm {{Gerät}} zufährt. Phase 1 (0–1,2 s): Zoom auf den
Screen, Inhalt {{UI-Inhalt}} füllt den Bildschirm, Rand läuft aus. Phase 2 (1,2–1,8 s): Warp-Tunnel (Streifen aus
der Mitte, `warp`-Muster). Phase 3 (1,8–2,8 s): Zahnrad mit {{N}} Hebeln dreht ein, Knoten poppen gestaffelt.“
Umsetzung: Seite 1 `type:"html"` mit CSS-Gerät (div, Border-Radius, Screen-Inhalt) + Seite 2 `hub`; Übergang
`warp` zwischen beiden; Gerät skaliert per WAAPI `scale(1→6)` auf den Screen-Mittelpunkt.

**P2 · Fahrzeug-/Objekt-Röntgen-Scan (three.js, braucht GLB)**
Prompt: „Lade {{modell.glb}} (inline base64), Studio-Licht, langsame Kamerafahrt. Ein Scan-Plane läuft in {{3}} s
durch das Modell: dahinter Wireframe/Röntgen-Material (Fresnel, additiv), davor Lack. Danach Labels ({{Komponenten}})
poppen an Ankerpunkten auf, Linien zeichnen sich.“ Nutzt das Modell-Skript des Skills `interactive-sdv-presentation`
(embed_model.py) oder GLTFLoader inline (Budget: ≤ 3 MB, meshopt/WebP 1024).

**P3 · Datenpartikel formen Zahl/Logo**
Prompt: „Canvas-2D: {{3000}} Punkte driften, ziehen sich über {{2,4}} s zu den Pixeln des Textes {{Zahl/Wort}}
(Offscreen-Canvas-Maske, Zielpositionen per `getImageData`), federn leicht, halten, zerfallen beim Verlassen.“

**P4 · Vorher/Nachher-Slider**
Prompt: „Zwei Zustände {{A}} / {{B}} übereinander, Griff mit Pointer-Events, `clip-path: inset(0 X% 0 0)` auf B,
Tastatur (←/→) verschiebt in 5 %-Schritten, Startanimation fährt einmal von 0→100→50.“

**P5 · Standort-/Netzwerk-Karte mit Pulsen**
Prompt: „SVG-Karte (vereinfachte Konturen oder abstraktes Punktraster) mit {{N}} Knoten an {{Koordinaten}},
Verbindungen zeichnen sich (stroke-dashoffset), pulsierende Ringe in Staffelung, Hover zeigt Tooltip {{Text}}.“

**P6 · Architektur-Layer-Stack (Explosion)**
Prompt: „{{4}} Ebenen ({{Namen}}) als CSS-3D-Karten (`transform-style:preserve-3d`, `rotateX(58deg) rotateZ(-30deg)`),
Eintritt: Ebenen fliegen von unten gestaffelt (80 ms), Hover hebt eine Ebene um 24 px und zeigt Beschreibung.“

**P7 · Demo-Overlay (eigene HTML einbetten)**
Prompt: „Vollbild-Overlay mit `<iframe srcdoc>`/Blob der Demo {{demo.html}}, Öffnen per Morph aus der Karte, Esc
schließt, Fokus wird gefangen, kein Autoplay-Ton. Demo im Deck-Look (gleiche Farben) gestalten.“

**P8 · Sticky-Scroll-Storytelling (scrub)**
Prompt: „Section 300 vh hoch, innen `position:sticky` Bühne. Fortschritt p = Scroll in der Section (0–1); {{3}} Schritte
schalten bei p = .33/.66, Visual morpht (CSS-Variablen), Text wechselt per Crossfade. Reduced Motion: Schritte statisch.“
(Nur Scroll-Modus.)

**P9 · Maus-Spotlight / Magnet**
Prompt: „Radialer Lichtkegel folgt dem Cursor (`--mx/--my`), Karten drehen max. 4° (nur bei `hover:hover`).“
Bereits in `cards` enthalten (Spotlight); Tilt nur auf ausdrücklichen Wunsch.

**P10 · Flow/Sankey zeichnet sich**
Prompt: „SVG-Pfade von {{Quellen}} zu {{Zielen}}, Breite proportional zu {{Werten}}, Zeichnen in 1,4 s
(stroke-dashoffset), danach laufende Impulse. Werte nur aus dem Brief.“

**P11 · Agent-/Chat-UI-Mock (KI-Themen)**
Prompt: „Chat-Fenster, Nutzerfrage tippt ({{Text}}, `typewriter`), Agent-Schritte erscheinen als Chips nacheinander
(denkt → ruft Tool {{Name}} → Ergebnis), Antwort streamt Wort für Wort. Klar als Demo/Simulation markiert.“

**P12 · Device-Mockup mit Screen-Wechsel**
Prompt: „Handy/Laptop als CSS-Rahmen, {{3}} Screens ({{Bilder}}) wechseln per Klick/Pfeil mit Crossfade+Scale .98→1,
Parallax-Tilt ≤ 3° zur Maus. Screens echte Screenshots.“

## Einbau-Checkliste für Custom-Effekte
Auslöser an `enter`/`leave` der Seite koppeln (Engine ruft `enter(stage)`/`leave(stage)`), Timer/RAF in `leave` stoppen,
nur Engine-CSS-Variablen verwenden, Reduced-Motion-Zweig, mit `qa-checklist.md` testen.
