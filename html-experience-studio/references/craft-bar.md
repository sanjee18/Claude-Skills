# Craft-Bar: was zwischen „ordentlich“ und Referenz-Niveau liegt

Entstanden aus drei Referenzen, die der Nutzer als Maßstab gegeben hat: **pear.no** (Scroll-Bühne, Film, Rahmen, Typo),
**Moonlit Petals** (Canvas-Nachtblüte) und **Vinyl Supernova** (Partikel-Zeitleiste). Live ansehen: Library →
Tab „Referenz-Welten“ (`assets/worlds/*.html`, Technik im Detail: `worlds.md`, Code-Rezepte: `studio-recipes.md` §11–§21).
**Lies diese Datei vor dem Konzept (Schritt 4) und vor jeder Freigabe-Runde (Gate in Teil G).**

## Teil A · Warum die Ergebnisse mittelmäßig bleiben (8 Ursachen)

| # | Mittelmaß | Referenz-Niveau (belegt im DOM/Code der Referenzen) |
|---|---|---|
| 1 | **Kein eigener Hauptdarsteller.** Generische Partikel, Gradienten, Stock-Look. | Ein Objekt, das nur zu *diesem* Thema gehört: Pear = ein goldener Birnen-Monolith auf Marmorsockel (Name → Bild → Text-Stimme). Test: *Könnte das Bild auf der Seite eines Wettbewerbers stehen?* Wenn ja, verwerfen. |
| 2 | **Folien.** Seite für Seite, Blende dazwischen. | **Eine Zahl p (0..1)** aus der Scroll-Position, mit Trägheit geglättet. Film, Text, Linien, Karussell, Formular sind *Funktionen von p*. Kapitel sind Bereiche auf p (`data-at="0.012 / 0.232 / 0.400 / 0.628"`), nicht Seiten. |
| 3 | **Kein Rahmen-System.** Text schwebt lose auf dem Bild. | 4 Hairlines (2 vertikal, 2 horizontal, 1 px, ~26 % Weiß) + ein einziges Ornament (4-Punkt-Stern) an den Schnittpunkten. *Alles* richtet sich an diesen Linien aus; sie gleiten gerichtet aus dem Bild, wenn das Kapitel wechselt. |
| 4 | **Eine Easing-Kurve für alles**, Text blendet nur ein. | Grammatik: **rein = Maske** (Zeile/Buchstabe fährt aus einer Kante), **raus = gerichtet** (`translate3d(-86px,-14px) scale(.96) blur(5px)`, Richtung wechselt je Beat, Zeilen mit leicht versetztem Weg). |
| 5 | **Zu wenig Detailtiefe.** Ein Effekt pro Seite. | 8–12 handgebaute Mikro-Momente: Handschrift per Strichzug, Lineal mit wandernder Kennzahl, Karussell mit Riss-Kante, Glas-Pillen mit Glints, gestrichelter Rahmen, der sich zeichnet, Logo, das sich zeichnet, CTA-Flood, Wortmarke als Fußzeile. |
| 6 | **Fließtext.** Absätze, Aufzählungen, Floskeln. | Beats aus 3–5 Wörtern („We build it. We rank it. We share in what it earns.“), Gegenposition („Not an agency on the clock“), Offenlegung („Full disclosure“), Ausschlusskriterium („We say no more often than yes“), echte FAQ. |
| 7 | **Handwerk unsichtbar.** Läuft, sieht aber nach Baukasten aus. | Selbst gehostete Schrift (keine Drittanbieter), feste **Artboard-Fläche** (1440×900 → `scale(k)`), eigenes Hochformat, `inert` auf unsichtbaren Formularen, JSON-LD (Organization + FAQPage), OG-Bild, `color-scheme`, `theme-color`, `aria-hidden` auf Animationsebenen. |
| 8 | **Referenz nicht zerlegt.** Look „nachempfunden“ statt verstanden. | **Teardown** (Teil B) *vor* dem Konzept: Schichten, Zeitleiste, Vokabular, Tokens, Stimme, Herkunft des Hero-Assets. |

## Teil B · Teardown: Referenz zerlegen (Pflicht, wenn der Nutzer HTML/URL/Code als Vorbild gibt)

1. **Daten holen:** Nutzer-HTML in eine Datei legen; bei URL: gerenderten DOM (`Copy outerHTML`) und, wenn möglich, die Bundle-Dateien.
2. **Bericht erzeugen:** `python <skill>/scripts/teardown.py <datei.html>` (Meta, Schichten, Techniken, Kapitel-Marker,
   Inline-Transform-Vokabular, Tokens, Texte). Dann selbst lesen: der Bericht findet, die Deutung ist deine Arbeit.
3. **Sieben Fragen beantworten** und in `concept.md` unter „Referenz-Teardown“ ablegen:
   1. *Treiber:* Was bewegt alles (Scroll p, Zeit, Zeiger)? Wie lang ist die Strecke (Runway in Viewport-Höhen)?
   2. *Schichtenstapel* von unten nach oben (Film/Canvas, Typo, 3D-DOM, Overlay) und was jede Ebene allein tut.
   3. *Hauptdarsteller:* Wie wurde das Hero-Asset gemacht (Video, Gemälde, Modell, Shader)? Woher kommt es?
   4. *Rahmen-System:* Linien, Ornamente, Raster, Marken; woran richtet sich alles aus?
   5. *Choreografie-Vokabular:* Eintritt, Austritt, Dauern, Staffelung, Richtungen, Blur/Scale-Werte, Easing.
   6. *Signatur-Details:* Welche 5–10 Dinge würde man vermissen? (Handschrift, Riss, Glas, Lineal …)
   7. *Stimme:* Satzlänge, Beat-Form, Gegenposition, Ehrlichkeit, FAQ-Fragen.
4. **Übertragen heißt: Prinzip ja, Inhalt nein.** Keine Texte, Logos, Bilder oder Markenmotive der Referenz übernehmen; die
   Bauweise (Teil C) auf das *eigene* Thema und ein *eigenes* Hauptobjekt anwenden. Code des Nutzers (z. B. Framer-Komponente)
   als Quelle behandeln: Lizenz klären, bevor etwas in ein Kundenprojekt geht.

## Teil C · Anatomie einer Referenz-Seite (Maßstab: pear.no)

**C1 Architektur.** `section.stage > .pin` (fest, 100 vh) + unsichtbare Strecke (`.runway`, 700–900 vh). Scroll → `p`;
`p` wird mit Zeitkonstante ~0,14 s geglättet (`assets/studio/scrollstage.js`). Kapitel-Längen folgen dem Gewicht
(Modell 22 %, Werk 17 %, Konditionen 23 %, Fragen 37 % …), nicht gleichmäßig. Navigation springt per eased Scroll auf `at`.
Einstieg (Titel, Linien, Logo) läuft **zeitgesteuert** beim Laden; ab dem Scrollen übernimmt p.

**C2 Schichtenstapel (unten → oben).** Quellfilm (`<video muted loop playsinline>`, unsichtbar) → WebGL-Canvas, der den Film
mit Shader/Filter zeigt → Typo-Schichten (Beat-Gruppen) → 3D-DOM-Szenen (Karussell, Formular) → Übergangs-Canvas →
Fußzeilen-Film → Overlay (Linien, Sterne, Logo, Menü, Rail, Kapitelnavigation). Jede Ebene hat eine eigene Sichtbarkeitsfunktion
von p; ausgeblendet = `visibility:hidden` (nicht nur Opacity: Performance, Fokus, Screenreader).

**C3 Rahmen.** `--v1/--v2` (x) und `--h1/--h2` (y) als CSS-Variablen, vier 1-px-Linien in 26 % Weiß; `data-out="l|r|u|d"` lässt
jede Linie in ihre Richtung aus dem Bild gleiten. Stern als SVG (`M12 0 … Z`, 22 px) mit langsamer Drehung, gestaffelte
`animation-delay`. Optional: wackelnde Linie (SVG-Pfad mit `feTurbulence`), Fortschritts-Ticks (33 Linien, Länge/Deckkraft
wachsen nahe der Kennzahl). **Regel: ein Ornament, vier Linien, alles daran ausgerichtet.**

**C4 Typografie.** Eine Display-Serif (selbst gehostet), Labels in 11 px/0,16 em Versalien (Mono), Fließtext 18–19 px.
Headline 118–132 px, Zeilenhöhe 0,98. Aufbau `.ln > i` (Zeilen-Maske) und `.wd > .ch` (Buchstaben, `data-c`).
Eintritt: Stagger über die Zeile, `outExpo`, 0,9–1,2 s. Austritt: gerichtet (C-Tabelle oben). Beats wechseln Position
(unten links, oben rechts, Mitte), nie zweimal dieselbe Komposition.

**C5 Detail-Katalog (jedes 30–60 Zeilen).** Handschrift (`stroke-dasharray/offset`, je Strich `data-a/data-b` = Bereich von p) ·
Lineal + Kennzahl · 3D-Karussell (`rotateY(a) translateZ(R) rotateY(-a)`, Tiefe = Blur 1,5/4 px, Z-Index = Tiefe) mit
Riss-Kante (`feTurbulence` + `feDisplacementMap`, nur auf den Rahmen, nie auf Text) · Leader-Linie mit 8-px-Quadrat als
Endkappe · Glas-Pillen (`backdrop-filter`, CSS-Variablen `--blur --fill --rim --bev --spec --sat --ins`, Rim-Spans, Glints) ·
Orbit-Ellipsen hinter dem Formular · gestrichelter Rahmen zeichnet sich (`pathLength="1"`) · Logo zeichnet sich ·
CTA-Flood (doppeltes Label + `clip-path: inset(100% 0 0 0)` → `inset(0)`) · Wortmarke riesig in der Fußzeile.

**C6 Artboard.** Alles ist in Pixeln auf einer festen Fläche gebaut (1440×900) und als Ganzes mit `scale(k)` an den
Viewport gepasst (`k = min(w/1440, h/900)`; Pear: `scale(0.94987)`). Dadurch stimmen Zeilenumbrüche, Linien und 3D-Abstände
auf jedem Gerät. Hochformat bekommt **ein eigenes Artboard** (z. B. 720×1100) mit eigener Anordnung, kein Stauchen.

**C7 Film.** Das Hauptobjekt ist ein **vorgerendertes Bewegtbild** (Gemälde/Render/Video-Loop), das per Shader gefiltert und
mit p gescrubbt oder gestartet wird. Nicht „prozedural, weil einfacher“. Siehe Teil D.

**C8 Stimme.** Pro Beat 3–5 Wörter, Verb vorn, parallel gebaut. Gegenposition benennen („Nicht eine Agentur auf der Uhr“).
Offenlegung und Ausschluss („Wir sagen öfter Nein als Ja“) schaffen Vertrauen. Untertitel ≤ 2 Zeilen. FAQ mit echten Fragen,
Antworten ≤ 40 Wörter. **Nie Floskeln** („ganzheitlich“, „innovativ“, „maßgeschneiderte Lösungen“).

**C9 Hygiene.** Keine Drittanbieter-Schriften · `<title>` als Versprechen · Description · Canonical · OG 1200×630 mit Alt ·
JSON-LD (Organization, FAQPage) · FAQ-Text im DOM *und* als JSON-LD · `aria-hidden` auf Animationsebenen, ein linearer
Screenreader-Text (`.sr`) · `inert` auf unsichtbaren Formularen · Menü-Button `aria-expanded` · `prefers-reduced-motion`
(p ohne Glättung, Animationen aus) · DPR-Grenze 1,25–1,5 für Vollflächen-Shader.

## Teil D · Hero-Asset-Strategie (die größte Lücke)

Ohne eigenes Hauptobjekt bleibt jede Seite Template, egal wie gut die Typografie ist. **Vor** dem Konzept beantworten:

1. **Welches eine Ding gehört nur zu diesem Thema?** (Namens-Wortspiel, Produkt, Ort, Material, Handwerk.) Drei Kandidaten notieren, Nutzer wählt.
2. **Welches Medium?**
   | Medium | Wann | Werkzeug |
   |---|---|---|
   | Video-Loop | Stimmung, Produkt, Ort | **eigene Aufnahmen/Videos des Nutzers**, Blender-Render (lokal, kostenlos), Bildschirmaufnahme eines eigenen three.js-/Shader-Motivs |
   | GLB-Modell | physisches Objekt, Technik, Produkt | CAD/Hersteller, Blender, `blender-from-photos.md` |
   | Prozedural (Shader, Canvas, Partikel) | Stimme *ist* die Abstraktion (Nachtblüte, Zerfall, Klang) oder Platzhalter | `assets/worlds/*`, `studio-recipes.md` |
3. **Ohne Zusatzkosten.** Keine kostenpflichtige Generierung (Kling, Higgsfield, Bild-/Video-APIs): alles entsteht im Code, in Blender oder aus dem Material des Nutzers. Die Referenz (SDV-Deck) ist genauso entstanden: parametrisches Fahrzeug
   und GLBs in three.js, SVG-Zahnrad, Canvas-Datenfeld, ein Foto mit Licht-Sweep. Bildnachweis/Lizenz je Asset in
   `concept.md`. Personen, Marken nur mit Einverständnis.
4. **Für Scrubbing encodieren:** 6–10 s, 1440 px breit, ohne Ton, jedes Bild ein Keyframe:
   `ffmpeg -i in.mp4 -vf "scale=1440:-2,fps=30" -c:v libx264 -crf 24 -g 1 -pix_fmt yuv420p -an -movflags +faststart film.mp4`
   (Ziel ≤ 6–8 MB; Gesamtdatei < 15 MB). Safari/iOS scrubben unzuverlässig: dort WebP-Frame-Sequenz auf Canvas
   (`studio-recipes.md` §12). Poster-Frame als Fallback, `prefers-reduced-motion` zeigt das Poster.
5. **Plan B ohne Kosten:** Shader-Film wie in `assets/worlds/scroll-stage.html`: dem Nutzer *ausdrücklich* sagen, dass das
   ein Platzhalter für den echten Film ist.

## Teil E · Moonlit Petals: Prinzipien (Canvas, „backen und komponieren“)

1. **Teures einmal backen** (Krone, Dolden, Halo, Hintergrund in Offscreen-Canvases), pro Frame nur komponieren; Cache-Schlüssel aus Größe + Farben + Seed.
2. **Alles Zufällige seeded** (`mulberry32`): gleiche Seed = gleiche Szene, reproduzierbar für Standbilder und Reviews.
3. **Referenzraum** (736×414), skaliert auf jede Größe; so bleibt die Komposition stabil.
4. **Licht als eine Zahl pro Element**, Farbe über 65-stufige Palette (LUT): keine Farbrechnung beim Zeichnen.
5. **Detail nur, wo sichtbar:** kleine Elemente = 5 Punkte, große = Kerben, Glanz, Staubblätter.
6. **Schärfentiefe geschenkt:** hintere Ebene bei niedriger Auflösung backen und hochskalieren; Halo durch wiederholtes Halbieren; Glühen mit `lighter`.
7. **Bewegung in Schichten:** Grundwind (zwei Sinus je Sprite), Zeiger als gedämpfte Feder (schwingt über), Federgitter → Textur → Mini-Shader verzieht das gebackene Bild (Nachbarn bewegen sich zusammen).
8. **Tiefenebenen für Partikel** (Größe, Deckkraft, Fallrate aus z), seltenes Nah-Bokeh, Korn als verschobene Kachel, Vignette.
9. **Robust:** DPR ≤ 2, `ResizeObserver`, kein WebGL → ohne Verzug weiterlaufen, `prefers-reduced-motion` → Zeit steht, Abstimmwerte in *einem* Objekt.

## Teil F · Vinyl Supernova: Prinzipien (Partikel-Zeitleiste)

1. **Eine Schleifen-Zeitleiste mit benannten Phasen** (Form · Zerfall · Wolke · Rückbau) und `smoothstep`; `disperse = burst × (1 − reform)`.
2. **Partikel = Funktion(Index, Zeit)**, nicht Zustand: Hashes aus dem Goldenen Schnitt (`i·0.618…` mod 1) als Attribute, Berechnung im Vertex-Shader. Keine CPU-Schleife, keine Datentextur → 30.000+ Partikel bei 60 fps.
3. **Form aus Physik bauen:** `sqrt(h)` für gleichmäßige Scheibe, Rillen als Sinus, Bänder `pow(max(0,sin),8)`, Lichtkeile über den Winkel, Label/Spindel als Radien.
4. **Zerfall hat Struktur:** gleichverteilte Kugelrichtung, Weg pro Partikel ungleich (`pow(h,.65)`), Wirbel dreht die Richtung mit dem Zerfall, Turbulenz aus Hashes × Phase.
5. **Identität bleibt im Chaos:** Label-Partikel bleiben rot, der Rest wird silbrig; Funkeln über `pow(sin,12)`.
6. **Kamera erzählt mit:** beim Zerfall zurückziehen, damit die Wolke als Körper lesbar wird.
7. **Nachbearbeitung klein halten:** Bloom niedrig, Spuren (Afterimage), ein Abschlusspass für Kontrast/Vignette/Korn, Hintergrund nie reines Schwarz (`#020203`).
8. **Sechs Regler reichen** (Tempo, Radius, Streuung, Dauer, Neigung, Helligkeit); alles in `PARAMS`.
9. **Offline:** three.js lokal einbetten, nie per CDN/`importmap`.

## Teil G · Craft-Gate (vor jeder Freigabe-Runde und vor der Lieferung; jedes Nein = nacharbeiten)

**Konzept** · [ ] Hauptobjekt gehört nur zu diesem Thema (Wettbewerber-Test) · [ ] Hero-Asset-Weg (Teil D) entschieden und freigegeben · [ ] Kernsatz in ≤ 8 Wörtern.
**Struktur** · [ ] Eine Zahl p/Zeit treibt alles · [ ] Kapitel haben unterschiedliche Längen nach Gewicht · [ ] fester Artboard + eigenes Hochformat · [ ] Rahmen-System mit genau einem Ornament.
**Typo/Text** · [ ] Eine Schriftfamilie + Mono, selbst gehostet · [ ] Eintritt Maske, Austritt gerichtet (Blur/Scale), Richtung wechselt · [ ] Beats ≤ 5 Wörter, Untertitel ≤ 2 Zeilen · [ ] Gegenposition oder Offenlegung vorhanden · [ ] keine Floskel.
**Details** · [ ] ≥ 6 handgebaute Mikro-Momente aus C5, jeder an *diesen* Inhalt gebunden · [ ] eine Kennzahl läuft an einem Instrument (Lineal, Ring, Zeitstrahl) · [ ] ein interaktives Objekt (Formular, Karussell) ist wirklich bedienbar · [ ] ein Moment, über den man spricht (Wow).
**Material** · [ ] kein reines `#000`, keine Standard-Gradient-Hintergründe · [ ] Licht kommt aus einer Richtung · [ ] Korn/Vignette sparsam · [ ] Text auf unruhigem Grund hat Scrim (AA-Kontrast).
**Oberfläche** · [ ] Intro nach Hero-Formel mit bewegtem Medium · [ ] Headline von Hand umbrochen, gedimmte Hälfte · [ ] weiße + Glas-Pill, Liquid Glass exakt (`ui-craft.md` §3) · [ ] Mobil-Anordnung eigens.
**Architektur** · [ ] Hub-Form aus dem Inhalt, wird beim Ankommen gebaut · [ ] jede Unterseite eigener Archetyp · [ ] Übergangs-Register: Story-/Hub-/Wow-Kanten eigene Funktionen · [ ] blind durchklicken und frei springen funktionieren.
**Hygiene** · [ ] C9 komplett · [ ] keine JS-Fehler, keine externen Requests (`scroll_frames.cjs`/`studio_frames.cjs`) · [ ] 60 fps auf dem Laptop (Vollflächen-Shader ≤ 0,75× Auflösung) · [ ] < 15 MB.

## Teil H · Anti-Muster (sofort erkennbar, sofort ersetzen)

Partikel-Netz/Aurora-Gradient als Hauptdarsteller · Icon-Kacheln und Karten-Raster · jede Seite „Titel links, Bild rechts“ ·
dieselbe Easing-Kurve für alles · Text, der nur einblendet · Fließtext-Absätze · Stock-Fotos ohne Konzept · Inter/Roboto als
Display-Schrift · Glas-Karten ohne Hintergrund, der etwas zu brechen hat · Zahlen „100+“, „24/7“ ohne Beleg · Blur-Orbs ·
Scroll-Hinweis, der nie verschwindet · Animation, die beim Zurückscrollen bricht (alles *Funktion von p*, nie Zustand).

## Teil I · 3D-Wirkung ohne GLB (warum Partikel und Shader „flach“ aussahen)

Flach wirkt etwas, wenn dem Auge die **Tiefenhinweise** fehlen. Moonlit Petals hat sie (Ebenen, Schärfentiefe, Glühen, Korn).
Jede Szene der Engine, die ohne Modell auskommt, braucht diese acht, geprüft in dieser Reihenfolge:

1. **Gerichtetes Licht:** eine Hauptlichtquelle (oben links), Licht-/Schattenseite am Objekt, dünnes Gegenlicht (Rim). Nie gleichmäßig hell.
2. **Okklusion / Verdeckung:** Vorderes verdeckt Hinteres (Ringe laufen vor *und* hinter der Kugel). Additive Punktwolken ohne Verdeckung lesen sich als Poster. Lösung: Verdeckungstest gegen die Hauptform (Orb-Silhouette im Vertex-Shader) oder Rückseite abdunkeln (geschlossene Formen).
3. **Schärfentiefe:** Fokusebene = Kameradistanz; Abstand davon → Streukreis (größer, dunkler, Rand heller = Bokeh), Energie bleibt erhalten (`1/(1+coc²·9)`).
4. **Atmosphärische Perspektive:** nah = heller und wärmer, fern = dunkler und kühler (Akzent 2).
5. **Echtes Material statt Flächenfarbe:** Glas = Fresnel + Brechung durch ein Volumen (Galaxie *im* Glas, verschiebt sich mit dem Zeiger = Parallaxe) + Reflexion einer Studio-Umgebung (Softbox, Streifenlicht); Randverdunklung (`pow(n·v, .55)`), dünner Farbsaum am Rand.
6. **Verankerung im Raum:** Bodenreflex/Kontaktlicht unter schwebenden Objekten, Objekt folgt der Kamera (Zoom, Verschiebung), keine eigenständig skalierten Overlays.
7. **Weiche Schulter statt hartem Clipping:** `c/(1+c·.25)`; Spitzlicht klein und scharf, nicht ein heller Fleck.
8. **Finish in jedem Hintergrund:** Licht von einer Seite, Vignette in der Seitenfarbe, feines Korn (nur helle Sprenkel, sonst graut alles ein). Hintergründe nie unter ~.9 Deckkraft ausblenden.

Umgesetzt in der Engine: `assets/engine/scene.js` (Partikel: Schärfentiefe, Licht, Rückseite, Orb-Verdeckung), `scene3.js` (Orb: Volumen-Marsch,
Studio-Reflexion, Fresnel, Bodenreflex, Platzierung aus der Partikelkamera), `engine3.css` (`#bg::after` Finish-Layer).
Prüfen bei jedem neuen Hauptdarsteller: Foto-Test in Graustufen und halber Größe: ist Vorne/Hinten noch erkennbar? Wenn nein, fehlt Punkt 1–3.

## Teil J · Übergänge mit Licht und Tiefe

Ein Übergang zwischen zwei ruhigen Textseiten hat sonst fast nichts zu zeigen: er wirkt wie ein Fade mit Extraschritten.
Referenz-Übergänge tragen **eigenes Licht** und bewegen Seiten **in der Tiefe**. `assets/engine/transitions4.js`:

- **Licht-Ebene** `D.tx.play(kind, {delay, dur, dir, x, y, str})` auf einem Overlay-Canvas (additiv): `bloom` (Linsenreflex: Kern, anamorpher Streifen, Geister),
  `sweep` (Glas-Glanzband mit Farbsäumen), `dust` (Bokeh in Tiefenstaffel: nah groß und schnell, fern klein und langsam), `streak` (radiale Fahrtlinien), `ring` (leuchtende Kante eines wachsenden Kreises).
- **Tiefe:** Perspektive, fallende Helligkeit der abtretenden Seite, Schärfeverlust nach Tiefe (Rack Focus), Schatten an der einlaufenden Kante, Einlauf aus der Tiefe mit Überstrahlung, die sich auflöst.
- **Rezepttabelle `FX`:** jeder Übergang bekommt ein Lichtrezept; was nicht gelistet ist, bekommt einen leisen Glas-Glanz. Neue Übergänge: in `FX` eintragen.
- **Regel:** Bewegung und Licht teilen Zeitpunkt und Richtung (`dir`); Licht erreicht den Höhepunkt, wenn die Seiten wechseln (`bloom` bei ~50 % der Dauer). Pro Deck nur einen starken Lichtmoment (Wow).
- **Prüfen:** Bewegungsstreifen mitten im Übergang ansehen, nicht nur Anfang und Ende (`studio_frames.cjs --motion`; Library-Standbilder zeigen jetzt die Mitte).

## Teil K · Hintergründe als beleuchtete Räume

Ein Hintergrund, der nur eine weiche Farbfläche ist, trägt nichts. `assets/engine/bg4.js` ersetzt zwölf davon durch Fragment-Shader
(WebGL2, 0,6× Auflösung, Zeigerparallaxe, Dither gegen Banding, helle Themes werden als Tinte statt als Licht abgebildet):

| ID | Raum | Tiefe / Material |
|---|---|---|
| `aurora` | Lichtvorhänge in 3 Ebenen | helle Unterkante, Vertikalstrahlen, Horizontglühen |
| `stars` | Nebel + 3 Sternebenen | nah = große weiche Scheiben, fern = scharfe Punkte, Parallaxe je Ebene |
| `blobs` | glänzende Flüssigkeit | Metaball-Feld als Höhenkarte beleuchtet (diffus, Glanz, Rand) |
| `beams`, `spotlight` | Lichtkegel mit Staub | Strahlen aus Winkel-Rauschen, runde Staubpartikel, Lichtpfütze am Boden |
| `grid` | Perspektiv-Boden | kantenglatte Linien (`fwidth`), Nebel, Horizont, tiefe Sonne |
| `light-tunnel` | Korridor aus Lichtrahmen | Fluchtpunkt folgt dem Zeiger |
| `topo` | beleuchtetes Gelände | Höhenschummerung, Höhenlinien, Indexlinien |
| `bokeh` | Scheiben in 3 Schärfeebenen | nah riesig und weich, fern klein mit hellem Rand |
| `gradient-shift`, `noise-mesh` | Farbgewebe | Leuchtdichte als Seide beleuchtet |
| `wave-lines` | Linienreihen in Perspektive | vorne hell und dick, hinten dünn und dunkel |

**Neuen Hintergrund bauen:** Funktion `vec3 scene(vec2 p, vec2 m)` (p = zentriert, Höhe 1, y nach oben; m = Zeiger 0..1) in `SCENES` eintragen,
Licht zurückgeben (additiv, ~0..1). Regeln: (1) eine Lichtquelle mit Abfall, (2) mindestens zwei Tiefenebenen, (3) Material statt Fläche,
(4) Rasterzellen-Effekte (Sterne, Staub, Bokeh) müssen *innerhalb* der Zelle abklingen, sonst entstehen sichtbare Quadrate,
(5) Hash ohne große Produkte (`fract(p.xyx*.1031)`), sonst Blockmuster, (6) Wertrauschen mit `pow` ergibt Quadrate: für Staub runde Punkte pro Zelle.
Ebenfalls Shader (zweite Gruppe): `network`, `constellation`, `datafield` (Graph in 3 Tiefenebenen, Datenpakete auf den Verbindungen, Brennpunkt),
`code-rain` (Glyphspalten in 3 Ebenen, weiße Köpfe), `flow-field` (Line-Integral-Convolution: Rauschen entlang eines Wirbelfelds = seidige Strähnen),
`dot-wave` (Punkte auf Perspektiv-Boden, Schärfeebene mittig), `orbits` (5 Ringe per Strahl/Ebene in echter Perspektive, Satelliten), `halftone` (Rasterpunkte auf 30°, Größe folgt beleuchtetem Verlauf).
Damit sind alle 20 Hintergründe beleuchtete Räume. Neu: Graph-Ebene `netL(p, Skala, Ebene, Parallaxe, Linienbreite, Punktschärfe, Pakete, Linkstärke)` im Shader-Kopf wiederverwendbar.

## Teil L · Text-Eintritte mit Tiefe, Licht und Gewicht

`assets/engine/text4.js` überschreibt die flachen Versionen (alle gleiche Strecke, gleiche Kurve, gleicher Takt). Regeln:

1. **Nicht-linearer Takt:** die ersten Einheiten führen, der Rest folgt dicht (`st(i, n, total, curve<1)`), plus deterministischer Jitter. Gesamtdauer des Staffelns ≤ ~800 ms, egal wie lang der Text ist.
2. **Ankunft aus der Tiefe:** Perspektive am Elternelement, `rotateX/Y`, `translateZ`; abgewandte Flächen sind dunkel (`brightness(.3–.5)`), beim Aufrichten kurz überhell (`1.4–1.5`): das ist echte Schattierung ohne Beleuchtungsmodell.
3. **Bewegungsunschärfe im Flug:** Blur ist am Anfang hoch und endet bei 0, nicht linear.
4. **Landung mit Glanz und Überschwingen:** ~3 % Überschwingen bei Offset .7, kurzer Akzent-Schein (`text-shadow`), der abklingt.
5. **Masken schwingen:** Wort kommt aus der Maske mit Gegenrotation (`rotate(4deg)` → `-.4deg` → 0), nicht als gerades Schieben.
6. 3D-Einheiten brauchen `overflow:visible` an ihrer Maske (`open()`), sonst werden sie abgeschnitten.
7. Unverändert bleiben bewusst eigene Looks: `scramble`, `typewriter`, `glitch`, `marker`, `outline-fill`, `underline-draw`.
