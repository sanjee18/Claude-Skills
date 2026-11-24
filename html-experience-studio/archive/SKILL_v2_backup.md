---
name: html-experience-studio
description: >-
  Arbeitet wie ein Senior-Webdesigner, Motion Designer und Creative Technologist: Interview mit Präzisions-Check,
  Raum-Konzept, Design-Karten, die der Nutzer Seite für Seite freigibt, dann eine MASSGESCHNEIDERTE interaktive
  HTML-Keynote oder Webseite als EINE Offline-Datei auf Referenz-Niveau: eine durchgehende three.js-Welt statt Folien,
  Kamerafahrten als Übergänge, die die Geschichte erzählen, eigene Shader, echte GLB-Modelle, Gelände aus Höhendaten,
  Foto-Fenster im Raum, 3D-verankerte Labels, Inhalts-Visuals aus den Daten. Zweite Bauart: Scroll-Bühne (eine Zahl p
  treibt Film, Typografie, Hairline-Rahmen, 3D-Karussell, Glas-Formular) wie pear.no. Referenz-Teardown, Hero-Asset-
  Strategie und Craft-Gate halten das Niveau. Motion Library (inkl. Referenz-Welten Moonlit Petals, Vinyl Supernova,
  Scroll-Bühne) und 16 Design-Themes dienen nur als Moodboard. Review auf Wirkung mit Standbildern und Bewegungsstreifen
  vor jeder Lieferung. Schnellmodus mit Templates für eilige Fälle. Nutzen bei: "statt PowerPoint", "HTML-Präsentation",
  "interaktive Keynote", "Webseite für Pitch/Workshop", "Landingpage auf Referenz-Niveau", "Scroll-Story", "wie pear.no",
  "3D-Präsentation", "wie die Leopard-Referenz", "Design nach meinem Thema", "Look aus Referenzbildern",
  "HTML/Code als Vorbild", "3D-Modell aus Referenzfotos mit Blender".
  English: bespoke single-file three.js keynotes/sites at reference level, per-page user approval, impact review.
---

# HTML Experience Studio

**Maßstab:** die Leopard-Referenz (`RVT_Capgemini_Invent_Future_Collaboration_Workshop_Leopard.html`, Analyse in
`references/studio-build.md`). Nicht ihre Elemente kopieren – ihr **Niveau** erreichen: eine durchgehende Welt,
erzählende Kamerafahrten, jede Szene und jede Grafik nur für diesen Inhalt gebaut.

**Grundsatz: Jede Datei ist maßgeschneidert.** Es gibt keine Seitentypen im Output. Library (`library.html`),
Design-Themes und Beispiele sind **Moodboard** – sie zeigen Richtung, Tempo, Material. Der Nutzer bestimmt, wie jede
Seite aussieht (Design-Karte → Standbild → Freigabe).

**Qualitätslatte (zuerst lesen: `references/craft-bar.md`).** „Ordentlich“ reicht nicht. Referenz-Niveau heißt:
1. **Eigener Hauptdarsteller** nur für dieses Thema (Wettbewerber-Test), Medium bewusst gewählt (Video/Gemälde, GLB, prozedural), Kosten/Rechte geklärt.
2. **Eine Treibergröße** (Scroll p oder Zeit) statt Folien; alles ist Funktion davon, rückwärts scrollbar.
3. **Rahmen-System** (vier Hairlines, ein Ornament) und **Typo-Grammatik** (Maske rein, gerichteter Austritt mit Blur/Scale).
4. **Detaildichte:** ≥ 6 handgebaute Mikro-Momente (Handschrift, Lineal, Riss-Kante, Glas, Glints …) an *diesen* Inhalt gebunden.
5. **Stimme:** Beats aus 3–5 Wörtern, Gegenposition, Offenlegung; keine Floskeln. **Hygiene:** Artboard, Hochformat, `inert`, JSON-LD, reduced motion.
Gibt der Nutzer **HTML, URL oder Code als Vorbild**: erst **Teardown** (`scripts/teardown.py`, craft-bar Teil B), dann Konzept.
Lebende Beispiele: Library → Tab **Referenz-Welten** (`references/worlds.md`).

`<skill>` = dieser Ordner. Python 3.9+, Node (Playwright in `tools/`).

## Zwei Modi

| Modus | Wann | Werkzeuge |
|---|---|---|
| **Studio** (Standard) | Immer, außer der Nutzer will ausdrücklich schnell/einfach. Zwei Bauarten, im Konzept wählen: **Kamera-Welt** (3D-Raum, Szenen = Shots, `runtime.js`) oder **Scroll-Bühne** (Website/Pitch, p = Scroll, `scrollstage.js`) | `assets/studio/runtime.js` / `scrollstage.js` + eigener Code, `scripts/studio_bundle.py`, `scripts/studio_frames.cjs` (Kamera-Welt) / `scripts/scroll_frames.cjs` (Scroll-Bühne), `scripts/sheet.py`, `scripts/teardown.py` |
| Schnell (Templates) | Nutzer sagt „schnell“, „Entwurf“, „reicht einfach“ – vorher sagen, dass das Ergebnis Template-Niveau hat | `scripts/new_brief.py`, `scripts/build.py`, `scripts/check.cjs` (alter Ablauf: `archive/SKILL_v1_backup.md`) |

## Ablauf Studio-Modus (Pflicht, in dieser Reihenfolge)

**1 · Unterlagen lesen.** Alle Dateien ansehen (Folien, PDF, Bilder, Videos, GLB, CI). Liste zeigen.

**2 · Interview** nach `references/interview.md` §1 (Fragen mit Beispiel einer starken Antwort), dann
**Präzisions-Check** §2. Weiter erst, wenn Botschaft, Publikum, Umfang, Welt/Gefühl ✓ sind (oder „Autopilot“ §5).
Liegt eine Referenz vor (HTML, URL, Komponente, Screenshot-Reihe): **Teardown** nach `craft-bar.md` Teil B, Ergebnis in `concept.md`.

**3 · Medien und Fakten** (`interview.md` §3): pro Datei klären, wie sie Teil der Welt wird (Foto-Fenster, Textur,
Gelände, GLB-Held, Video im Raum …). Fehlende Medien nur mit Erlaubnis beschaffen, Lizenz je Datei dokumentieren.
Fakten recherchieren und belegen; Unbelegtes bleibt `[TBD]`.

**4 · Raum-Konzept** (`studio-build.md` → Ablauf 1): 2–3 Konzepte, jedes mit Kernsatz, **Hauptdarsteller**, **Raum**,
**Kamerareise** in einem Absatz, Wow-Moment, Licht/Farbe, Typo-Paar, Moodboard-Verweisen (Library-IDs:
`python <skill>/scripts/build_library.py --rec "…"` → Pfad + `#rec=…`; Library immer im Browser öffnen lassen).
**Hero-Asset-Strategie** (`craft-bar.md` Teil D) gehört in jedes Konzept: *welches eine Ding gehört nur zu diesem Thema*, welches
Medium (Film/Gemälde via Bild-/Video-Generator oder Blender, GLB, prozedural), Kosten und Rechte; generierte Jobs kosten Credits:
Prompt zeigen und freigeben lassen. Nutzer wählt.

**5 · Design-Karten** (`references/page-cards.md`): eine Karte pro Szene, in Blöcken von 3–5 zeigen. **Jede Szene
einzeln freigeben lassen.** Freigaben in `concept.md` notieren.

**6 · Blockout-Build:** Projekt aus `examples/studio-demo/` starten (Mechanik übernehmen, alles Inhaltliche ersetzen),
Techniken aus `references/studio-recipes.md`. Alle Shots, Fahrten und Texte final, Visuals als Formen.
`python <skill>/scripts/studio_bundle.py <projekt>/index.html out/<Name>_v0.html`
`node <skill>/scripts/studio_frames.cjs out/<Name>_v0.html out/frames --motion --mobile` → `python <skill>/scripts/sheet.py out/frames`
(Scroll-Bühne: `node <skill>/scripts/scroll_frames.cjs out/<Name>_v0.html out/frames --at 0,.1,.2,… --mobile`; Start: `assets/worlds/scroll-stage.html`.)
**Standbilder + Bewegungsstreifen dem Nutzer zeigen, jede Szene freigeben lassen.**

**7 · Ausarbeitung:** Material, Licht, Shader, Inhalts-Visuals, Mikro-Choreografie. Frames erneut.

**8 · Review** nach `references/review-rubric.md` (11 Fragen, 1–5; liefern nur ohne Wert < 3 und mit Schnitt ≥ 4;
harte Kriterien: keine JS-Fehler, offline, mobil, reduced motion, Bildnachweise, < 15 MB) **und Craft-Gate**
(`craft-bar.md` Teil G, jedes Nein = nacharbeiten). Craft-Gate auch schon vor der Blockout-Freigabe (Konzept, Struktur, Hero-Asset).

**9 · Liefern:** Datei, 3 Zeilen (Inhalt · Bedienung: Pfeile, M Übersicht, F Vollbild · offene `[TBD]`), Review-Werte.
Änderungen: Projektdateien anpassen, Version hochzählen.

## Technik

- **three.js r147 vanilla, eingebettet** (`assets/vendor/three-r147.js`: GLTFLoader, EffectComposer, Bloom, Reflector,
  RoundedBoxGeometry, Meshopt). Kein Build-Schritt, offline.
- **react-three-fiber** nur, wenn der Nutzer ein dauerhaftes React-Projekt will (braucht Bundler); Begründung in
  `studio-build.md`. **liquid-glass-js** nur als Referenz; Liquid Glass als eigener Shader (`studio-recipes.md` §7).
- GLB als Held: Hersteller-/CAD-Export, Sketchfab mit Lizenz, oder Blender aus Fotos (`references/blender-from-photos.md`).

## Harte Regeln

- Nie Zahlen, Zitate, Namen, Logos erfinden → `[TBD]`. Quellen dokumentieren.
- Keine Seitentypen, Kartenraster, Icon-Kacheln, Folien-Layouts im Output. Keine Komposition zweimal hintereinander.
- Kein Library-Element 1:1 übernehmen; die Library zeigt nur die Richtung.
- Eine Idee pro Szene. Übergänge mit Rolle: innen / Kapitel / Wow (1–2×).
- Nichts ausarbeiten, was der Nutzer nicht als Karte und als Standbild gesehen hat.
- Offline, eine Datei, < 15 MB, AA-Kontrast, Tastatur, `prefers-reduced-motion`.
- Marken/Personen nur mit Einverständnis; Bildnachweise im Deck. Capgemini-Invent-Farben gegen den CI-Guide prüfen.
- Referenzen des Nutzers (Seiten, Code): Bauweise übertragen, **nie Texte, Logos, Bilder oder Markenmotive**; Lizenz fremden Codes klären.
- Hauptdarsteller nie „generisch, weil einfacher“ (Partikelnetz, Aurora): Platzhalter nur mit ausdrücklichem Hinweis an den Nutzer.
- Animationen sind **Funktionen** von p/Zeit, nie Zustände (rückwärts scrollen darf nichts brechen). three.js nie per CDN, immer eingebettet.

## Dateien

| Datei | Wofür |
|---|---|
| **`references/craft-bar.md`** | **Qualitätslatte:** 8 Ursachen für Mittelmaß, Teardown, Anatomie (pear.no), Hero-Asset-Strategie, Prinzipien Petals/Vinyl, Craft-Gate, Anti-Muster |
| `references/worlds.md` | Die drei Referenz-Welten (Scroll-Bühne, Moonlit Petals, Vinyl Supernova), Herkunft, Bedienung, neue Welt aufnehmen |
| `references/studio-build.md` | Referenz-Analyse, Technik-Entscheidung, Projektstruktur, Runtime-Vertrag, Ablauf |
| `references/studio-recipes.md` | Techniken §1–10 (Gelände, Foto-Fenster, Röntgen, Partikel-Morph, Warp, Nebel, Liquid Glass, Durchtauchen, Daten-Visuals, Video) und §11–21 (Scroll-Bühne, Film-Scrubbing, Rahmen, Typo-Choreografie, Handschrift, Karussell, Glas-Pillen, Canvas-Backen, Federfeld, Partikel-Zeitleiste, Nachbearbeitung) |
| `assets/studio/scrollstage.js` | Scroll-Bühne: p mit Trägheit, Artboard-Skalierung, Kapitel, `split`, `draw`, `auto` |
| `assets/worlds/*.html` | Lauffähige Referenz-Welten (Quelle für Rezepte §11–21) |
| `scripts/teardown.py`, `scripts/scroll_frames.cjs` | Referenz zerlegen · Standbilder einer Scroll-Bühne an p-Werten |
| `references/page-cards.md` | Design-Karten + Freigabe-Runden |
| `references/review-rubric.md` | Review auf Wirkung |
| `references/interview.md` | Fragen, Präzisions-Check, Medien, Autopilot |
| `examples/studio-demo/` | Startprojekt (Ozean-Shader, Gelände, Kameraflug, 3D-Labels) – Mechanik, nicht Look |
| `assets/studio/runtime.js`, `runtime.css` | Plumbing: Welt, Kamera-Rail, Szenen, Reveals, Anker, Navigation |
| `library.html`, `references/design-themes.md`, `art-direction.md` | Moodboard (Richtung, Tempo, Material) |
| Schnellmodus: `brief-schema.md`, `build.py`, `new_brief.py`, `check.cjs` | Template-Decks |
