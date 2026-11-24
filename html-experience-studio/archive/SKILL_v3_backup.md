---
name: html-experience-studio
description: >-
  Arbeitet wie ein Senior-Webdesigner, Motion Designer und Creative Technologist und baut MASSGESCHNEIDERTE interaktive
  HTML-Keynotes und Webseiten als EINE Offline-Datei auf Referenz-Niveau, gemacht, um C-Level und Kunden zu überzeugen.
  Tokensparend: EIN kompakter Briefing-Bogen (vorausgefüllt aus den Unterlagen: Titelseite, Hauptseiten, Outro,
  Inhalte, Design, Design-Elemente wie Zahnrad/Globus und wo sie sitzen, Übergänge), EIN Regiebuch zur Freigabe, dann
  Bau mit interner Qualitätsschleife statt vieler Iterationsrunden. Eine durchgehende three.js- oder Shader-Welt statt
  Folien, Kamerafahrten als Übergänge, eigene Shader, GLB-Modelle, Inhalts-Visuals aus den Daten, Sprecheransicht,
  Backup-Seiten. Zweite Bauart: Scroll-Bühne wie pear.no. Motion Library mit Signature-Stücken auf Apple-Niveau (Planet,
  Schwarzes Loch, Zahnradgetriebe, Glas-Kugel, Seide, Lichtvorhang, Kaustik, Riffelglas, Höhenlinien, Raster-Lupe) und
  Referenz-Welten nur als Technik-Quelle, nie als Inhalt. Nutzen bei: "statt PowerPoint", "HTML-Präsentation",
  "interaktive Keynote", "Webseite für Pitch/Workshop", "Landingpage auf Referenz-Niveau", "Scroll-Story", "wie pear.no",
  "3D-Präsentation", "Vorstandspräsentation", "Kundenpitch", "wie die Leopard-Referenz", "Design nach meinem Thema",
  "HTML/Code als Vorbild", "3D-Modell aus Referenzfotos mit Blender".
  English: bespoke single-file keynotes/sites for executives, one-shot brief, one approval, internal quality loop.
---

# HTML Experience Studio

**Maßstab:** die Leopard-Referenz (Analyse in `references/studio-build.md`) und die Signature-Stücke der Library
(`references/signature.md`: so sieht Handwerk im Code aus). Nicht deren Elemente kopieren – ihr **Niveau** erreichen:
eine durchgehende Welt, erzählende Kamerafahrten, jede Szene und jede Grafik nur für diesen Inhalt gebaut.

**Grundsatz: Jede Datei ist maßgeschneidert.** Kein Seitentyp, kein Template-Inhalt im Output. Library, Signature-Stücke,
Referenz-Welten, Design-Themes und Beispiele liefern **Technik und Richtung**, nie Texte, Platzhalter oder Motive
(`scripts/leakcheck.py` prüft das). Titel, Hauptseiten, Outro, Inhalte, Design-Elemente und Übergänge bestimmt der Nutzer
im Briefing-Bogen; was er offen lässt, entscheidet Claude und legt es im Regiebuch offen.

**Tokensparend und First-Shot:** eine Frage-Runde (Bogen), eine Freigabe (Regiebuch), dann bauen. Keine Einzelfragen,
keine Karten-Blöcke, keine Blockout-Freigabe. Die Iteration passiert **intern** (Standbilder → Review → nacharbeiten),
der Nutzer sieht das fertige Ergebnis.

**Qualitätslatte (zuerst lesen: `references/craft-bar.md`, dann `references/signature.md`).** Referenz-Niveau heißt:
1. **Eigener Hauptdarsteller** nur für dieses Thema (Wettbewerber-Test), Medium bewusst gewählt (Video, GLB, prozedural, Shader), Kosten/Rechte geklärt.
2. **Eine Treibergröße** (Scroll p oder Zeit) statt Folien; alles ist Funktion davon, rückwärts sicher.
3. **Physik statt Effekt:** Licht in linearem Raum + Filmkurve + Dithering, Bewegung auf Federn (ζ ≈ 0,7), Trägheit, Zeiger in Layout-Pixeln (`signature.md`).
4. **Rahmen-System** (Hairlines, ein Ornament) und **Typo-Grammatik** (Maske rein, gerichteter Austritt mit Blur/Scale).
5. **Detaildichte:** ≥ 6 handgebaute Mikro-Momente, an *diesen* Inhalt gebunden. **Stimme:** Beats aus 3–5 Wörtern, keine Floskeln.
Gibt der Nutzer **HTML, URL oder Code als Vorbild**: erst **Teardown** (`scripts/teardown.py`, craft-bar Teil B), dann Konzept.

`<skill>` = dieser Ordner. Python 3.9+, Node (Playwright in `tools/`).

## Zwei Modi

| Modus | Wann | Werkzeuge |
|---|---|---|
| **Studio** (Standard) | Immer, außer der Nutzer will ausdrücklich schnell/einfach. Bauarten: **Kamera-Welt** (3D-Raum, Szenen = Shots, `runtime.js`), **Shader-Bühne** (ein Vollbild-Shader als Welt, `sigkit.js`) oder **Scroll-Bühne** (p = Scroll, `scrollstage.js`) | `assets/studio/*`, `scripts/studio_bundle.py`, `studio_frames.cjs` / `scroll_frames.cjs`, `sheet.py`, `teardown.py`, `leakcheck.py` |
| Schnell (Templates) | Nutzer sagt „schnell“, „Entwurf“ – vorher sagen, dass das Ergebnis Template-Niveau hat | `new_brief.py`, `build.py`, `check.cjs` (Ablauf: `archive/SKILL_v1_backup.md`) |

## Ablauf Studio-Modus (Pflicht, in dieser Reihenfolge)

**1 · Unterlagen lesen** (Folien, PDF, Bilder, Videos, GLB, CI) – vollständig, bevor gefragt wird.

**2 · Briefing-Bogen** (`references/interview.md` §1): **eine** Nachricht mit Abschnitten A–I (Rahmen, Botschaft, Welt,
**Titelseite**, **Hauptseiten-Tabelle** mit Inhalt · Visual · Design-Element + Ort · Interaktion · Übergang, **Outro**,
Pflicht/Verbote, Material inkl. Einbettung jeder Datei, Ausgabe). Vorausgefüllt aus den Unterlagen (✓), Standards in
Klammern, leere Felder entscheidet Claude. Vorlage für den Nutzer: `BRIEF-VORLAGE.md`. „Autopilot“ überspringt den Bogen.
Library im Browser öffnen lassen (`library.html`, Tab **Signature-Stücke**), Auswahl kommt als IDs in C5.

**3 · Lücken still schließen** (`interview.md` §2): keine zweite Fragerunde. Fakten recherchieren und belegen, Unbelegtes
`[TBD]`. Referenz vorhanden → Teardown, Ergebnis in `concept.md`. Hero-Asset-Strategie (`craft-bar.md` Teil D).

**4 · Regiebuch** (`references/page-cards.md`): eine Nachricht mit Konzept (Kernsatz, Held, Welt, Kamerareise, Wow,
eine Alternative), Seitenplan **Titel → Hauptseiten → Outro → Backup**, Annahmen, Offenem und Kosten für generierte
Medien. **Eine Freigabe** („ok“ oder gesammelte Änderungen). Freigabe in `concept.md` notieren.

**5 · Bauen, direkt in Endqualität:** Projekt aus `examples/studio-demo/` (Kamera-Welt) bzw. `assets/worlds/scroll-stage.html`
(Scroll-Bühne) bzw. einem Signature-Stück + `sigkit.js` (Shader-Bühne) starten: **Mechanik übernehmen, alles
Inhaltliche ersetzen**. Signature-Stücke als Technik-Quelle umbauen (Farbe aus CI, Form aus dem Inhalt: Zahnrad mit
6 Zähnen = 6 Bereiche, Globus mit den Standorten des Kunden). Techniken: `studio-recipes.md`, `signature.md`.
Sprechernotizen als `<aside class="notes">` pro Szene, Backup-Szenen mit `backup: true`.
`python <skill>/scripts/studio_bundle.py <projekt>/index.html out/<Name>_v1.html`

**6 · Interne Qualitätsschleife (bis zu 2 Durchgänge, ohne den Nutzer):**
`node <skill>/scripts/studio_frames.cjs out/<Name>_v1.html out/frames --motion --mobile` → `python <skill>/scripts/sheet.py out/frames`
(Scroll-Bühne: `scroll_frames.cjs … --at 0,.1,.2,…`) → Standbilder selbst ansehen → Review nach
`references/review-rubric.md` (12 Fragen, liefern nur ohne Wert < 3, Schnitt ≥ 4) + Craft-Gate (`craft-bar.md` Teil G)
+ `python <skill>/scripts/leakcheck.py out/<Name>_v1.html` → die schwächsten Punkte nacharbeiten → erneut prüfen.
Optional Zweitblick: `impeccable:impeccable-finish-reviewer` / `impeccable-motion-reviewer`.

**7 · Liefern:** Datei + Standbild-Bogen, 3 Zeilen (Inhalt · Bedienung: Pfeile/Klicker, M Übersicht, P Sprecheransicht,
B Schwarzbild, F Vollbild · offene `[TBD]`), Review-Werte. Änderungswünsche gesammelt annehmen, in einem Durchgang
umsetzen, Version hochzählen.

## C-Level-Standard (gilt immer, auch im Autopilot)

- **Antwort zuerst:** Die Entscheidung (A3) und der Kernsatz stehen spätestens auf Seite 2; jede Seite hat ein „so what“.
- **Jede Zahl mit Quelle und Stand** (Fußnote in Mono, klein); Zahlen über alle Seiten konsistent; nichts erfunden.
- **Einwand vorwegnehmen** (B3) auf einer eigenen Seite oder im Backup; Risiken/Annahmen offen zeigen.
- **Outro = Entscheidung:** konkreter nächster Schritt mit Datum und Owner, Ansprechpartner; kein „Vielen Dank“-Ende.
- **Präsentieren:** Klicker (PageUp/PageDown), Sprecheransicht (P) mit Notizen und Timer, Schwarzbild (B), Backup-Seiten (M),
  Deep-Link je Szene (`#id`), Start ohne Ladeflackern (Veil, Poster-Frame), läuft offline auf fremdem Laptop.
- **Beamer-fest:** 16:9-Safe-Area, Fließtext ≥ 24 px bei 1080p, AA-Kontrast auch bei hellem Raum, keine Information nur in Farbe.
- **Leave-behind:** Standbilder-PDF oder Scroll-Fassung für die Weitergabe; optional personalisiert (`#client=Name`).
- **Marke:** CI-Farben/Schriften des Absenders, Kundenlogo nur mit Freigabe; Capgemini-Invent-Farben gegen den CI-Guide prüfen.

## Technik

- **three.js r147 vanilla, eingebettet** (`assets/vendor/three-r147.js`: GLTFLoader, EffectComposer, Bloom, Reflector,
  RoundedBoxGeometry, Meshopt). Kein Build-Schritt, offline. **sigkit.js** für Vollbild-Shader (Federn, Drag mit Trägheit,
  Pixelbudget, adaptive Auflösung, reduced motion, Farben per Hash).
- react-three-fiber nur, wenn der Nutzer ein dauerhaftes React-Projekt will (Bundler nötig; Begründung `studio-build.md`).
- GLB als Held: Hersteller-/CAD-Export, Sketchfab mit Lizenz, oder Blender aus Fotos (`references/blender-from-photos.md`).

## Harte Regeln

- Nie Zahlen, Zitate, Namen, Logos erfinden → `[TBD]`. Quellen dokumentieren.
- **Kein Text, Platzhalter oder Motiv aus Library, Signature-Stücken, Welten, Themes oder Beispielen im Output** (leakcheck).
- Keine Seitentypen, Kartenraster, Icon-Kacheln, Folien-Layouts im Output. Keine Komposition zweimal hintereinander.
- Eine Idee pro Szene. Übergänge mit Rolle: innen / Kapitel / Wow (1–2×).
- Nichts bauen, was nicht im freigegebenen Regiebuch steht; Abweichungen im Lieferbericht nennen.
- Offline, eine Datei, < 15 MB, AA-Kontrast, Tastatur, `prefers-reduced-motion`, keine JS-Fehler.
- Marken/Personen nur mit Einverständnis; Bildnachweise im Deck. Generierte Medien: Prompt + Kosten vorher im Regiebuch.
- Referenzen des Nutzers (Seiten, Code): Bauweise übertragen, **nie Texte, Logos, Bilder oder Markenmotive**; Lizenz fremden Codes klären.
- Hauptdarsteller nie „generisch, weil einfacher“ (Partikelnetz, Aurora): Platzhalter nur mit ausdrücklichem Hinweis.
- Animationen sind **Funktionen** von p/Zeit, nie Zustände. three.js nie per CDN, immer eingebettet.

## Dateien

| Datei | Wofür |
|---|---|
| **`BRIEF-VORLAGE.md`** | Briefing-Bogen zum Ausfüllen für den Nutzer (A–I) |
| **`references/interview.md`** | Bogen senden, Lücken still schließen, Einbettung eigener Dateien, Autopilot |
| **`references/page-cards.md`** | Regiebuch: Format, Regeln, eine Freigabe |
| **`references/craft-bar.md`** | Qualitätslatte: Ursachen für Mittelmaß, Teardown, Hero-Asset-Strategie, Craft-Gate, Anti-Muster |
| **`references/signature.md`** | Handwerk im Code (Licht, Federn, Trägheit, Budget) + die 10 Signature-Stücke und wie man sie umbaut |
| `references/review-rubric.md` | Review auf Wirkung (12 Fragen) + harte Kriterien |
| `references/worlds.md` | Referenz-Welten (Scroll-Bühne, Moonlit Petals, Vinyl Supernova) |
| `references/studio-build.md` | Referenz-Analyse, Technik-Entscheidung, Projektstruktur, Runtime-Vertrag |
| `references/studio-recipes.md` | Techniken §1–21 (Gelände, Foto-Fenster, Röntgen, Partikel, Warp, Liquid Glass, Scroll-Bühne …) |
| `assets/studio/runtime.js`, `runtime.css` | Kamera-Welt: Szenen, Kamera-Rail, Reveals, Anker, Navigation, Sprecheransicht, Schwarzbild, Backup |
| `assets/studio/sigkit.js` | Shader-Bühne: ein Vollbild-Fragment-Shader + Federn, Drag, Budget, Hash-Parameter |
| `assets/studio/scrollstage.js` | Scroll-Bühne: p mit Trägheit, Artboard, Kapitel, `split`, `draw`, `auto` |
| `assets/signature/*.html` | 10 Signature-Stücke (Quelle; in der Library live) |
| `assets/worlds/*.html` | Referenz-Welten (Quelle für Rezepte §11–21) |
| `scripts/leakcheck.py` | Prüft, dass kein Demo-/Template-Text im Ergebnis steht |
| `scripts/teardown.py`, `scroll_frames.cjs`, `studio_frames.cjs`, `sheet.py` | Teardown · Standbilder · Bewegungsstreifen · Bogen |
| `examples/studio-demo/` | Startprojekt Kamera-Welt (Mechanik, nicht Look, nicht Text) |
| `library.html` (`scripts/build_library.py`) | Moodboard: Signature-Stücke, Referenz-Welten, Hintergründe, Text, Übergänge … |
| Schnellmodus: `brief-schema.md`, `build.py`, `new_brief.py`, `check.cjs` | Template-Decks |
