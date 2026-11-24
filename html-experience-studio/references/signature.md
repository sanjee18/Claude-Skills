# Signature-Stücke: Handwerk im Code

Die Library-Kategorie **Signature-Stücke** (`assets/signature/*.html`, live in `library.html`) zeigt das Niveau, das
der Nutzer erwartet (Maßstab: die Originkit-Komponente „Terra Dusk“, vom Nutzer als Beispiel geliefert). Jedes Stück ist
**ein** Fragment-Shader auf `assets/studio/sigkit.js`. Sie sind Technik-Quelle: Farbe, Form und Inhalt kommen im
Projekt immer aus dem Thema des Nutzers, nie aus dem Stück.

## Die Grammatik (was „Apple-Niveau“ im Code bedeutet)

1. **Physik statt Effekt.** Erst fragen, was in der Welt passiert, dann das rechnen: Kaustik = Flächenverzerrung
   1/|det(I + k·Hesse h)|; Satin = anisotroper Glanz entlang der Fäden; Glas = zwei Brechungen + Fresnel; schwarzes Loch =
   Photonenbahn. Ein Effekt, der nur so *aussieht*, kippt beim zweiten Hinsehen.
2. **Linearer Lichtweg.** Farben als sRGB definieren, linear rechnen (`pow(c, 2.2)`, sigkit macht das für `'#hex'`-Params),
   addieren, **ACES-Filmkurve**, dann Gamma. Überlappendes Licht blüht, statt zu clippen.
3. **Dithering** (`dither()`): ruhige Verläufe im Dunkeln zeigen sonst Bänder – auf Beamern sofort sichtbar.
4. **Federn, nie rohe Eingabe.** Zeiger, Hover, Druck laufen über gedämpfte Federn (k 60, c 11 → ζ ≈ 0,7: ein kleiner
   Überschwinger, dann Ruhe), in Teilschritten integriert (dt·120). Nichts springt, auch nicht bei 30 fps.
5. **Trägheit beim Ziehen.** 1:1 unter dem Finger (ein halber Bildschirm = 1 rad), Loslassen gleitet mit der
   geglätteten Geschwindigkeit der letzten Strecke weiter (τ 0,9 s); wer vor dem Loslassen stillhält, schleudert nicht.
6. **Zeiger in Layout-Pixeln.** `getBoundingClientRect` misst Bildschirm-Pixel; bei skalierten Vorfahren (Artboard,
   Vorschau „bei 47 %“) umrechnen, sonst trifft der Klick daneben.
7. **Konstanten mit Einheit und Grund.** `HOVER_TURN = 0.2 // rad bei Hover 5, ≈ 11°`. Jede Zahl hat einen Kommentar,
   warum sie so ist. Das macht Feinschliff möglich und Code übertragbar.
8. **Budget und Würde.** DPR ≤ 2 innerhalb eines Pixelbudgets, adaptive Auflösung bei langen Frames, Pause bei
   verstecktem Tab, `prefers-reduced-motion` friert die Zeit ein (Bild bleibt schön), Assets blenden ein (nie Pop-in).
9. **Ruhe als Default.** Hintergründe dürfen leise sein: Text muss darüber AA-Kontrast halten. Der laute Moment
   (Wow) ist einmal im Deck, nicht in jedem Hintergrund.
10. **Interaktion mit Sinn.** Der Zeiger *ist* etwas in der Welt: Lampe (Getriebe), Sonne (Planet), Fingerspitze (Seide),
    Wasserlinse (Kaustik), Lupe (Raster). Nie nur „folgt der Maus“.

## Die zehn Stücke

| ID | Was | Zeiger ist … | Gut für | Umbauen im Projekt |
|---|---|---|---|---|
| `planet-nasa` | **Terra Dusk, 1:1-Port des Originkit-Codes:** echte NASA-Erde (Tag, Nacht, Wasser, Höhe, Wolken als eingebettete Texturen), Stadtlichter aus Black Marble, Wolkenschatten, Glanz, Atmosphäre | Sonne; Hover = Orbit; Drag = Drehen | Wo es die echte Erde sein muss: Standorte, Lieferkette, Klima | Standorte als Leuchtpunkte/Bögen (Länge/Breite → Globus-Koordinate); `#sunangle`, `#daylight`, `#cursor` |
| `event-horizon` | Schwarzes Loch mit echter Lichtablenkung, Kepler-Scheibe, Doppler | Kamera-Nudge; Drag = Orbit | Wow, Sog, Plattform | Scheibenfarbe = CI-Akzent; als Übergang: Kamera fällt hinein → nächste Szene |
| `gear-train` | Verzahnte SDF-Zahnräder, gedrehtes Metall, Schatten | Lampe; Drag = Antrieb | Portfolio, Operating Model | Rad pro Bereich, Zähne = Gewicht, Akzentrad = Fokus, Klick = Fahrt in den Bereich |
| `glass-orb` | Vollglas-Kugel, Dispersion, Dünnschicht, Studio | farbiges Schlüssellicht | KI-/Produkt-Hero | Logo/Produkt hinter die Kugel (erscheint invertiert); Licht = CI |
| `silk` | Satin-Höhenfeld, Ward-Glanz | Fingerspitze (Delle) | Luxus, Einladung, ruhiger Grund | Hell/dunkel per Hash, Glanzfarbe = CI-Sekundär |
| `light-curtain` | Lichtvorhang über Bodenlinie, 3 Tiefen | Luftzug (Neigung) | Opener, Launch, Kapitel | Bodenlinie wird Trennlinie der nächsten Szene |
| `caustics` | Analytische Wasserkaustik, Dispersion | Wasserlinse | Wasser, Nachhaltigkeit, Health | Logo als Schattenwurf auf dem Grund |
| `fluted-glass` | Mesh-Licht hinter Riffelglas | Lampe hinter der Scheibe | Tech-Launch, Event | Palette = CI, Riffelzahl nach Rolle |
| `ridge-lines` | Gebirge aus Querschnitten mit echter Verdeckung | Kamera-Neigung | Strategie, Daten, Energie | Höhen aus echten Daten → Inhalts-Visual |
| `dot-lens` | Halbton-Raster + Tonnen-Lupe (hell) | Lupe | Editorial, Research, helle Decks | Tonfeld aus Foto, Lupe zeigt Details |

**Terra Dusk (`planet-nasa`):** 1:1-Port des Originkit-Codes mit echten Bildern (ca. 4,5 MB, Texturen in `assets/signature/tex/`, vom Bundler als
Data-URIs eingebettet; direkt von der Platte geöffnet blockt der Browser sie).
sigkit-Erweiterung dafür: `textures` (Bilder auf Texture-Units, Einblenden über `uName_have`), `dragUnit`, `dragArea`, `state.px/py/auto`.

## Ein Stück in ein Projekt übernehmen

1. Shader-Bühne: `<script src="studio:sigkit"></script>` + `Sig({ frag, params, onFrame, drag, budget })`; der
   Bundler bettet sigkit ein. In einer Kamera-Welt: denselben Fragment-Code als `ShaderMaterial` auf eine Ebene oder
   als Hintergrund-Pass (Uniform-Namen beibehalten: `uTime`, `uRes`, `uPtr` …).
2. **Inhalt einsetzen**: Daten → Uniforms (z. B. Zahnzahlen, Standorte als `uniform vec3 uSites[16]`, Höhen als Textur).
3. Farben nur über Params (`#accent=…`), nie im Shader hart ändern; Kontrast zum Text prüfen.
4. Szenen steuern das Stück über Uniforms als **Funktion von p/Zeit** (z. B. `uFocus` = Index des Akzentrads).
5. Standbild prüfen (`scroll_frames.cjs` / `studio_frames.cjs`), `#still` für reduced-motion-Optik.

## Neues Signature-Stück aufnehmen

`assets/signature/<id>.html` (eine Datei, `studio:sigkit`, Kopfkommentar: was es physikalisch ist, Interaktion, Hash-
Parameter) → Eintrag in `assets/library.json` (`kind:"sig"`, `file`, `poster` = Hash für das Standbild, `tokens`,
`technik`, `uebertragen`, `quelle`) → `python scripts/build_library.py` → `cd tools && node posters.cjs sig` →
`build_library.py` erneut. Craft-Gate: Erfüllt es die zehn Punkte oben? Sonst nicht aufnehmen.

## Ausgemustert (nur noch Schnellmodus)

Zugunsten der Signature-Stücke aus der Library genommen (bleiben in `library.json` mit `"retired": true`, alte Briefs
bauen weiter): Hintergründe aurora, blobs, gradient-shift, bokeh, code-rain, grid, halftone, beams, stars, orbits,
constellation, spotlight, topo, wave-lines, dot-wave, network · Übergänge cube, flip, tiles, blinds, shutter,
radial-wipe, color-sweep, glitch-cut, curtain-split · Text glitch, slot-chars, flip-chars, outline-fill, marker ·
Looks look-synth, look-playful, look-warp, look-aurora, look-techgrid.
