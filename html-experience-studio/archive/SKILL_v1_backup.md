---
name: html-experience-studio
description: >-
  Arbeitet wie ein Senior-Webdesigner und Motion Designer: Interview mit Präzisions-Check, begründete Art Direction,
  dann interaktive HTML-Präsentationen und Webseiten als EINE Offline-Datei auf Keynote-Niveau (lebendige
  Signature-Szene, Kamera-Shots statt Folien, Wow-Übergänge). 15 komplette Design-Themes + Motion Library mit über
  120 live vorschaubaren Bausteinen, eigene Bilder/Videos als Partikel-Figur, Duotone, Produkt-Bühne oder Video-Szene,
  echte 3D-Modelle (GLB) als Hauptdarsteller mit Kamerafahrten, Röntgen-Scan und Annotationen, Qualitäts-Gate im Build. Nutzen bei: "statt PowerPoint", "HTML-Präsentation", "interaktive Keynote", "Webseite für
  Pitch/Workshop", "Scroll-Story", "Animationen/Übergänge aussuchen", "Motion Library", "Design nach meinem Thema",
  "Look aus Referenzbildern", "3D-Modell aus Referenzfotos mit Blender".
  English: senior-level interactive single-file HTML decks/sites with a live motion library and a quality gate.
---

# HTML Experience Studio

Ergebnis-Standard: **jede Datei sieht aus wie eine Apple-/Tesla-Keynote**, nicht wie PowerPoint. Ein lebendiger
Hauptdarsteller über alle Seiten, dünne UI, große ruhige Typo, eine Idee pro Seite, geführte Erkundung, ein Wow-Moment.
Referenzen für dieses Niveau: `examples/veyra/`, die Design-Themes in `library.html`, `references/design-themes.md`.

Das Niveau hängt **nicht** von deinem Geschick ab, sondern von drei festen Werkzeugen. Nutze sie immer:
1. `scripts/new_brief.py` erzeugt das Gerüst (Design-Theme, Szene, Seitenrhythmus, Übergangsrollen).
2. `scripts/build.py` hat ein **Qualitäts-Gate**: schwache Decks werden nicht gebaut (Exit 3) – Punkte beheben, neu bauen.
3. `scripts/check.cjs` macht Screenshots jeder Seite – ansehen, bevor du lieferst.

`<skill>` = dieser Ordner. Alle Befehle mit Python 3.9+ ausführen.

## Ablauf (Pflicht, in dieser Reihenfolge)

**1 · Unterlagen lesen.** Folien, PDF, Text, CI, Bilder, Videos zuerst ansehen. Liste alle Dateien auf.

**2 · Interview Runde 1** – genau nach `references/interview.md` (Nachricht mit 8 Fragen **und** je einem Beispiel für eine
starke Antwort). Keine Vorschläge, keine Effekte, keine Auswahlmenüs. Auf die Antwort warten.
Library nur verlinken, und zwar **immer mit absolutem Pfad und dem Hinweis, sie im Browser zu öffnen**
(`<skill>/library.html`; in Chat-Vorschauen laufen die Animationen nicht). Biete an, sie direkt zu öffnen:
Windows `start "" "<pfad>"`, macOS `open "<pfad>"`.

**3 · Präzisions-Check** (Pflicht, `interview.md` §2). Bewerte jede Antwort ✓ präzise / ⚠ vage / ✗ fehlt, in einer
Tabelle. Für jedes ⚠/✗: Folge nennen („mit ‚modern‘ entsteht ein Standard-Look“) + **Beispiel einer starken Antwort**
+ nachfragen. Weiter erst, wenn **Botschaft, Publikum, Seitenzahl, Welt/Gefühl** ✓ sind – **oder** der Nutzer sagt
„Autopilot“/„du entscheidest“: dann Autopilot (§5 in interview.md), Annahmen sichtbar auflisten.

**4 · Jede Datei des Nutzers: Einbettung fragen** (Pflicht, `interview.md` §3). Nie ein Bild einfach als Foto oder
Hintergrund einsetzen. Pro Datei die passende Option empfehlen und fragen:
`particles` (Figur aus Lichtpunkten, passt zu dunklen/Sternen-Welten) · `duotone`/`glow`/`blueprint`/`mono` (Foto in die
Farbwelt) · `hotspots` (Produkt-Bühne zum Erkunden) · `gallery` (3D-Bildbogen) · `video` (Szene, springt pro Seite) ·
`device`/`photo` (bewusst gerahmt) · `model` (`.glb` als 3D-Hauptdarsteller). Die Antwort steht später als `embed`/`treat` im Brief.

**5 · Art Direction** (`references/art-direction.md`): 2–3 Richtungen, **jede = ein Design-Theme** + Begründung aus den
Antworten + was angepasst wird. Library mit Markierung: `python <skill>/scripts/build_library.py --rec "design:<id>,…"`
→ Pfad + `#rec=…` geben. Nutzer wählt.

**6 · Gerüst erzeugen** (Pflicht):
`python <skill>/scripts/new_brief.py out/brief.json --title "…" --message "…" --audience "…" --pages N --design <id>
--org "…" --chapters "A;B;C" --levers "x;y;z" --asset "datei=embed" [--mode deck|scroll] [--auto 8]`
Dann **jede** `[TBD: …]`-Stelle mit echtem Inhalt füllen. Nichts erfinden: fehlende Zahlen/Zitate bleiben `[TBD]`.

**7 · Storyboard zeigen** (Tabelle nach `interview.md` §4: Seite · Typ · Aussage · Design · Szene/Shot · Übergang · Medien).
**Eine** Bestätigung einholen.

**8 · Bauen:** `python <skill>/scripts/build.py out/brief.json out/<Name>_v1.html`.
Gate nicht bestanden → die genannten Punkte im Brief beheben, neu bauen. `--draft` nur für Zwischenstände.

**9 · Ansehen** (Pflicht): `node <skill>/scripts/check.cjs out/<Name>_v1.html` → Screenshots in `out/shots/` öffnen und
jede Seite gegen den Standard prüfen: Held sichtbar und nicht über dem Text? Eine Idee pro Seite? Keine Folien-Optik?
Bilder in die Welt integriert? Wenn nein: überarbeiten, nicht liefern.

**10 · Liefern:** Pfad der Datei, 3 Zeilen (was drin ist · Bedienung: Pfeile, M Übersicht, Esc, F11 · offene `[TBD]`).
Änderungen: Brief anpassen, Version hochzählen.

## Autopilot (Nutzer will nicht ins Detail)

Welt → Design-Theme (in `new_brief.py --world` eingebaut): technisch/SDV/Daten → `data-transfer` · KI/Forschung →
`particle-tech` · Wahrnehmung/Vision → `nova-iris` · Launch/3D/Creative → `lumora-orb` · Weltraum/Warteliste →
`event-horizon` · Versicherung/Finanzen → `anchor-field` · Produkt/Gerät → `veyra-studio` · Health/Bio → `velvion-health` ·
floral/Garten/Kosmetik → `bloom-garden` · Natur/Nachhaltigkeit → `field-lab` · Logistik/Industrie → `swiss-logistics` ·
Editorial/Kultur → `editorial-archive` · Portfolio/Person → `dark-portfolio` · SaaS/App → `product-mono` ·
Keynote/Management → `keynote-glass`. Seitenzahl ohne Angabe: 9. Immer Annahmen auflisten und Storyboard zeigen.

## Design-Themes und Szenen

- 15 Themes in `assets/designs/` (Steckbriefe: `references/design-themes.md`). Im Brief `theme.design`. Jedes Theme hat eine
  **Signature-Szene**, die über alle Seiten bleibt; pro Seite steuerbar mit `page.scene` (`shape`, `cam`, `text`, `src`).
- Partikel-Formen: ring sphere globe galaxy helix wave terrain tunnel brain lattice iris fibers tree ripple box vortex
  orbit flower text numeral **image** (eigenes Bild als Lichtpunkt-Figur: `{"shape":"image","src":"x.png","mode":"alpha|luma|dark|auto"}`).
- Eigene Videos/Bilder als Szene: `scene.kind = "media"` mit `treat` (duotone/glow/blueprint/mono/photo).
- Produkt zum Erkunden: Seitentyp `hotspots` (Theme `veyra-studio`, Beispiel `examples/veyra/`).
- Portfolio/Bereiche: `hub` mit Sub-Seiten – zeigt automatisch „n von N erkundet“, Häkchen und „Weiter: …“.
- Design pro Kapitel: `page.design` (max. 3 Welten pro Deck). Messe-Bildschirm: `nav.auto` (Sekunden pro Seite).
- **3D-Modell als Held** (Fahrzeug, Maschine, Gerät – Niveau der Leopard-Referenz): `scene.kind = "model"` mit einer `.glb`.
  Kamerafahrt pro Seite, Röntgen-Scan beim Look-Wechsel, leuchtende Bauteile (`focus`), Annotationen am Objekt (`notes`),
  Blaupause mit Explosionsansicht, Hologramm, Punktwolke, GLB-Animationen. Gerüst: `new_brief.py --asset "media/x.glb=model"`
  (listet die Bauteilnamen). Schema: `brief-schema.md`, Beispiel: `examples/model-demo/`, Vorschau: Library-Tab „3D-Szenen".
  Im Interview anbieten, sobald ein physisches Objekt Thema ist. Kein GLB vorhanden → fragen: Hersteller-/CAD-Export,
  Blender-Modell aus Fotos (`references/blender-from-photos.md`, Blender-MCP) oder ersatzweise `hotspots` mit einem Render.

## Harte Regeln

- Nie Zahlen, Zitate, Namen, Kundenlogos erfinden → `[TBD]`.
- Eine Idee pro Seite, ≤ 90 Wörter. Keine Kartenraster > 4, keine Icon-Kacheln, keine Folien-Optik.
- Bilder/Videos nie unbearbeitet „hinten rein“: immer eine gefragte Einbettung (Schritt 4).
- Bewegung mit Zweck: innen ruhig, an Kapitelgrenzen `motion.chapter`, genau 1–2× `motion.wow`.
- Offline, eine Datei, Ziel < 15 MB. Kontrast AA, Tastatur, `prefers-reduced-motion`.
- Marken/Personen nur mit Einverständnis. Capgemini-Invent-Farben vor Kundeneinsatz gegen den CI-Guide prüfen.

## Weitere Dateien

| Datei | Wofür |
|---|---|
| `PROMPT-LEITFADEN.md` | Vorlage + Beispiele für Nutzer. Kommt ein Prompt in diesem Format: Felder = beantwortete Fragen. |
| `references/interview.md` | Fragen, Beispielantworten, Präzisions-Check, Einbettungs-Fragen, Autopilot, Storyboard |
| `references/brief-schema.md` | Alle Felder des Briefs |
| `references/design-themes.md` | Steckbriefe der Themes (generiert) |
| `references/art-direction.md`, `design-rules.md`, `qa-checklist.md` | Begründungen, Regeln, Prüfliste |
| `library.html` | Motion Library (im Browser öffnen). Neu bauen: `scripts/build_library.py`, Standbilder: `node tools/posters.cjs` |
| `scripts/film_export.cjs` | MP4 einer `cam`-Szene (einmalig `cd tools && npm i playwright-core @ffmpeg-installer/win32-x64`) |
