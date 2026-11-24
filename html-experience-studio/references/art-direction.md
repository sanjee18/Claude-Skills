# Art Direction: vom Thema des Nutzers zu konkreten Design-Elementen

So arbeitet ein Webdesigner: erst verstehen, dann **eine Richtung mit Begründung** vorschlagen, live zeigen, verfeinern.

**Erst das Design-Theme, dann die Details:** Jede Richtung, die du vorschlägst, baut auf einem der 14 Design-Themes auf
(`references/design-themes.md`) – nenne Theme, warum es zum Inhalt passt, und was du daran anpasst (Akzent aus CI,
Hintergrund, Kapitel-/Wow-Übergang). Die Tabellen unten verfeinern innerhalb des Themes; Verbote des Themes gelten.
Diese Datei übersetzt Worte und Referenzen des Nutzers in IDs aus `assets/library.json`.
Nie Elemente vorschlagen, bevor der Nutzer Inhalt, Publikum und Gefühl beschrieben hat.

## 1. Signale sammeln (aus den Antworten, nicht raten)

| Signal | Woher | Wirkt auf |
|---|---|---|
| **Gefühl** in eigenen Worten („ruhig“, „mutig“, „wie ein Kinotrailer“, „wie Apple“, „verspielt“) | Antwort, Referenz-Seiten | Stimmung → Bewegungsmenge, Tempo, Farbe |
| **Thema/Metapher** („Ozean“, „Weltraum“, „Bauhaus“, „Labor“, „Reise“, „Uhrwerk“) | Antwort | Hintergrund, Übergänge, Layout-Metapher |
| **Marke** (Logo, Hex, CI-PDF, Webseite) | Unterlagen, Bilder | Palette, Schrift, Bildsprache (geht immer vor) |
| **Referenzbilder** (Screenshots, Moodboard, Fotos) | Nutzer liefert | Palette, Kontrast hell/dunkel, Dichte, Typo-Charakter |
| **Inhaltstyp** (Zahlen, Prozess, Portfolio, Geschichte, Produkt) | Unterlagen | Seitentypen und Visuals |
| **Einsatz** (live, Link, Messe-Loop, Tablet) | Antwort | Navigation, Bewegungsmenge, Lesbarkeit |
| **Publikum** (Vorstand, Entwickler, Endkunden, Kinder) | Antwort | Ton, Dichte, wie viel Effekt erlaubt ist |

Fehlt das Gefühl oder ist es vage („modern“, „professionell“, „fancy“): **nach 2–3 Referenzen fragen** (Webseiten,
Screenshots, Bilder, Marken, die ihm gefallen), statt selbst zu entscheiden. „Modern“ allein ist keine Richtung.

## 2. Referenzbilder auswerten

Wenn der Nutzer Bilder liefert (Ordner `refs/` neben dem Brief oder im Chat):
1. Jedes Bild ansehen (Read-Tool). Notieren: hell/dunkel, 3–5 Hauptfarben (Hex schätzen oder
   `python <skill>/scripts/palette.py refs/*` falls Pillow installiert ist), Kontrast, Dichte (luftig/voll),
   Formen (rund/eckig/organisch/geometrisch), Typo-Charakter (Serif, Grotesk, Mono, gesperrt), Bewegungsandeutung.
2. In einem Satz zurückspiegeln: „Ich lese aus deinen Bildern: dunkel, warmes Gold, viel Luft, Serifen, ruhig.“
   Nutzer bestätigt oder korrigiert. Erst dann Elemente ableiten.
3. Eigenes Theme bauen statt Preset erzwingen: `theme: { preset: "<nächstes>", bg, surface, text, muted, accent, accent2, font }`.
   Kontrast prüfen (Text auf bg ≥ 4,5:1, muted ≥ 4,5:1 auf surface).
4. Bilder des Nutzers, die in die Seite sollen: Lizenz/Einverständnis klären, WebP ≤ 1920 px.

**Wann aktiv nach Bildern fragen:** Marke gewünscht, aber keine Farben/Logo · Gefühl unklar · Seitentypen
`media`, `gallery`, `team`, `split`+`image`/`device`/`compare` geplant · 3D-Modell · „so wie diese Seite“ ohne Link/Screenshot ·
Produkt, Ort oder Personen sollen gezeigt werden. Formuliere konkret, welches Bild wofür („ein Screenshot eurer App
für die Geräte-Seite“, „2–3 Webseiten, deren Stil dir gefällt“).

## 3. Stimmung → Elemente (Startpunkte, nie Pflicht)

Je Zeile: Palette-Richtung · Schrift · 2 Hintergründe · 2 Titel-Animationen · Übergänge (ruhig / Kapitel / Wow) · Interaktion · Layout-Idee · vermeiden.

| Stimmung | Palette & Schrift | Hintergrund | Titel | Übergänge ruhig / Kapitel / Wow | Interaktion & Finish | Layout-Ideen | Vermeiden |
|---|---|---|---|---|---|---|---|
| **ruhig, hochwertig** | gedämpft, 1 Akzent · humanist/editorial | `aurora`, `wave-lines` | `blur-words`, `blur-chars` | `fade-blur` / `lens-sweep` / `shared` | `glass`, `grain` | `statement`, `number`, viel Luft | Glitch, Tiles, harte Schnitte |
| **dramatisch, filmisch** | dunkel, hoher Kontrast · grotesk | `beams`, `stars` | `split-lines`, `tracking-in` | `fade-blur` / `band-reveal`, `curtain-split` / `warp-tunnel`, `shatter` | `vignette`, `grain` | `kinetic`, `number`, `media` | Verspielte Federn, bunte Blobs |
| **technisch, präzise** | kühl, Cyan/Teal · tech/mono | `grid`, `dot-wave`, `network` | `chars`, `scramble` | `slide` / `wipe-diagonal`, `scan-reveal` / `data-converge` | `cursor-glow`, `outline-cards` | `split`+`flow`, `stats`, `chart` | Bokeh, Serifen-Romantik |
| **futuristisch, Vision** | tiefes Navy + Neon · grotesk | `stars`, `datafield`, `light-tunnel`, `constellation` | `mask-words`, `zoom-words` | `fade-blur` / `zoom-through`, `portal-dive` / `warp-tunnel` | `glass`, `cursor-glow`, `parallax` | `hero`, `bento`, `hub`(orbit) | Papier-Look, Halftone |
| **verspielt, jung** | warm, 2 kräftige Akzente · humanist | `blobs`, `dot-wave` | `wave-chars`, `rotate-words` | `slide` / `color-sweep`, `flip` / `ink-goo` | `tilt`, `magnetic`, `click-ripple` | `bento`, `cards`, `marquee` | Code-Regen, Vignette, Strenge |
| **energetisch, Sport, Event** | schwarz + Signalfarbe · tech | `beams`, `grid` | `outline-fill`, `zoom-words` | `push-up` / `shutter` / `glitch-cut` | `vignette` | `kinetic`, `number`, `stats` | Lange Blenden, Pastell |
| **seriös, Finanz, Vorstand** | Graphit + Teal/Blau · grotesk | `none`, `gradient-shift` | `fade-up`, `underline-draw` | `fade-blur` / `push-parallax` / `shared` | `outline-cards` | `stats`, `chart`(morph), `steps`, `timeline` | Partikel-Feuerwerk, mehr als 1 Wow |
| **editorial, Magazin, Kultur** | hell, Tinte + 1 Farbe · editorial | `none`, `noise-mesh`, `halftone` | `split-lines`, `marker` | `slide` / `blinds` / `curtain-split` | `grain`, `outline-cards` | `big-list`, `quote`, `gallery` | Glow, Neon, Glass |
| **natürlich, nachhaltig** | Grün, Erde, Sand · humanist | `topo`, `flow-field` | `blur-words`, `split-lines` | `fade-blur` / `push-parallax` / `radial-wipe` | `grain` | `timeline`, `split`+`image`, `number` | Code-Regen, Scanlines |
| **warm, menschlich, Hospitality** | Sand, Terracotta, Gold · editorial/humanist | `bokeh`, `gradient-shift` | `blur-words`, `marker` | `fade-blur` / `card-stack` / `clip-circle` | `tilt` (sanft) | `team`, `gallery`, `quote` | Gitter, Tech-Effekte |
| **minimal, Swiss, Architektur** | Weiß/Schwarz + 1 Signalfarbe · grotesk | `none`, `spotlight` | `underline-draw`, `fade-up` | `slide` / `push-up` / `band-reveal` | `outline-cards` | `statement`, `big-list`, `split` | Mehr als 1 Akzentfarbe, Blobs |
| **retro, Synthwave, Gaming** | Magenta/Orange auf Violett · tech | `grid`, `code-rain` | `glitch`, `slot-chars` | `wipe-diagonal` / `glitch-cut` / `tiles` | `scanlines`, `cursor-glow` | `kinetic`, `marquee` | Serifen-Eleganz |
| **luxuriös** | Schwarz + Gold/Champagner · editorial, gesperrt | `bokeh`, `beams` | `tracking-in`, `shine` | `fade-blur` / `lens-sweep` / `curtain-split` | `grain`, `vignette` | `number`, `statement`, `media` | Bunte Farben, Federn, Glitch |
| **Health, Klinik, Vertrauen** | hell, Mint/Blau · humanist | `wave-lines`, `aurora` | `fade-up`, `blur-words` | `fade-blur` / `card-stack` / `shared` | – | `steps`, `stats`, `split`+`ring` | Dramatik, Dunkelheit, Glitch |

## 4. Themen / Metaphern → Elemente

Wenn der Nutzer ein Motiv nennt, übersetze es in die Library, statt eine fremde Metapher einzubauen:

| Thema | Hintergrund | Übergänge | Layout & Visual | Farbe |
|---|---|---|---|---|
| Ozean, Wasser, Fluss | `wave-lines`, `flow-field` | `fade-blur`, `push-up` | `timeline`, `split`+`flow` | Tiefblau, Türkis |
| Weltraum, Zukunft | `stars`, `constellation`, `orbits` | `zoom-through`, `warp` | `hub`(orbit), `number` | Navy, Cyan |
| Reise, Weg, Roadmap | `topo` | `push-parallax`, `slide` | `timeline`, `big-list` | Sand, Grün |
| Labor, Forschung, Daten | `dot-wave`, `network` | `tiles`, `shutter` | `stats`, `chart`, `bento` | Weiß/Graphit + Signal |
| Bühne, Keynote, Award | `beams`, `spotlight` | `curtain-split`, `band-reveal` | `kinetic`, `number`, `team` | Schwarz + Gold |
| Uhrwerk, Maschine, Engineering | `grid`, `orbits` | `cube`, `wipe-diagonal` | `hub`(gear), `split`+`flow` | Stahl, Kupfer |
| Natur, Wachstum | `topo`, `bokeh` | `radial-wipe`, `fade-blur` | `number`, `timeline` | Grün, Erde |
| Kunst, Kreativität | `flow-field`, `blobs`, `noise-mesh` | `tiles`, `color-sweep` | `gallery`, `bento` | frei, mutig |
| Magazin, Bericht | `halftone`, `none` | `blinds`, `slide` | `big-list`, `quote` | Papier + Tinte |
| Sicherheit, Cyber | `code-rain`, `grid` | `glitch-cut`, `shutter` | `split`+`flow`, `stats` | Schwarz + Grün/Cyan |
| Netzwerk, Community | `constellation`, `network` | `clip-circle`, `zoom-through` | `team`, `marquee`, `hub`(constellation) | frei |

`hub` nur, wenn die Inhalte wirklich gleichwertige Bereiche sind und der Nutzer eine Übersicht mit Detailseiten will.
Stil passend zum Thema wählen: `orbit` (neutral), `constellation` (Netzwerk), `radial` (sachlich), `gear` (nur bei Technik/Maschine/Uhrwerk).

## 4b. Kamera & Film einsetzen (`cam`)

| Inhalt | Baustein | Rolle |
|---|---|---|
| Produkt, App, Website, Plattform zeigen | `flyover` (mit echten Screens/Fotos in `hero.src` und `items[].src`) | Opener oder Kapitel-Wow |
| Feature in der App, Ergebnis | `device-float` (Screen als Bild oder HTML) | Reveal |
| Claim / Finale | `end-card` (Aussage + kursiver Nachsatz) | Abschluss |
| 3–6 Hebel, Schritte | `lift-cards` statt flachem Kartenraster | Kapitelseite |
| Architektur, Schichten | `depth-stack` | Erklärseite |
| Die eine echte Zahl | `particle-form` | Daten-Moment |

Standard-Look für alles andere: **Studio** (Inter, linksbündig, `rise`, Hintergrund `none`, Finish `grain`).

## 5. Richtungen präsentieren (2–3, nie mehr)

Jede Richtung als kompakte Karte im Chat:

```
Richtung A: „Stille Tiefe“
Idee: Ruhig und hochwertig, eure Zahlen wirken durch Luft statt Effekt.
Farbe: #0b0f14 / #f2f5fa, Akzent #7fd1c7 · Schrift: humanist
Hintergrund: wave-lines · Titel: blur-words · Übergänge: fade-blur, Kapitel lens-sweep, Wow: shared (Zahl wandert)
Interaktion: glass, grain · Signature: Seite 4, die große Zahl fliegt in den Business Case
Warum: Vorstand, live, wenig Zeit → Ruhe und eine starke Zahl.
```

Dann die Library mit genau diesen Empfehlungen öffnen:
`python <skill>/scripts/build_library.py --rec "bg:wave-lines,tx:blur-words,tr:lens-sweep,tr:shared,fx:glass" --theme <preset>`
und den ausgegebenen Link (mit `#rec=…`) dem Nutzer geben. Dort sieht er die Empfehlungen markiert und alles andere zum Tauschen.

Richtungen müssen sich **klar unterscheiden** (z. B. ruhig vs. mutig vs. editorial), sonst ist es keine Wahl.
Der Nutzer darf mischen („A, aber mit dem Hintergrund von B“).

## 6. Bewegungssprache festlegen (wie ein Motion Designer)

- **Ein Tempo pro Deck:** ruhig (Übergänge 900–1100 ms, wenig Stagger) oder zügig (500–800 ms). Nicht mischen.
- **Drei Übergangsrollen:** *innerhalb* eines Kapitels (leise, immer gleich) · *Kapitelgrenze* (erkennbar anders) ·
  *Wow* (1–2× pro Deck, an der Stelle mit der stärksten Aussage). Im Storyboard je Grenze festlegen.
- **Ein Titel-Stil** für das ganze Deck plus höchstens eine Ausnahme für Kapitel-Opener.
- **Hintergrund ruhig halten**, wenn Seiten viel Inhalt haben. Teure Hintergründe (Kosten ●●●) nicht mit `glass`
  auf schwachen Geräten kombinieren.
- **Rhythmus:** ruhig – ruhig – Höhepunkt – ruhig. Nie zwei Wow-Seiten hintereinander.
