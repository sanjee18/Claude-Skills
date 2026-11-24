# brief.json – Schema

```json
{
  "meta":  { "title": "…", "org": "Firma/Anlass (HUD links)", "lang": "de" },
  "theme": { "design": "data-transfer" },
  "nav":   { "mode": "deck", "transition": "zoom-through", "rail": true },
  "bg":    { "id": "network", "intensity": 1 },
  "pages": [ { "id": "start", "type": "hero", "title": "…" } ]
}
```

- `theme.design`: **komplettes Design-Theme** (empfohlener Weg): `keynote-glass` · `product-mono` ·
  `particle-tech` · `editorial-archive` · `swiss-logistics` · `data-transfer` · `nova-iris` · `velvion-health` · `anchor-field` · `event-horizon` · `lumora-orb` · `veyra-studio` · `bloom-garden`. Setzt Farben, Schriften,
  Bauteil-Stil und die Standard-Bewegung (Modus, Übergang, Titel-Animation, Hintergrund, Finish, Hub-Stil); alles hier im
  Brief Gesetzte gewinnt. Kapitel- und Wow-Übergang aus `references/design-themes.md` per `page.transition` setzen.
- `scene`: Signature-Szene, kommt automatisch aus dem Design-Theme; nur zum Überschreiben (z. B. eigene Bilder für
  `cards3d`: `"scene": {"kind": "cards3d", "images": ["img/a.webp", …], "captions": […]}`). Pro Seite `page.scene =
  {"shape": "globe", "cam": {"az": 30, "el": 15, "dist": 3.2, "x": 0.3}}` oder `{"shape": "text", "text": "2030"}`.
  Details und Formen: `references/design-themes.md`.
- **Eigenes Video / Bild als Szene** (`scene3.js`, Art `media`): `"scene": {"kind": "media", "src": "media/dna.mp4",
  "mask": "left|bottom|top|radial|none", "tint": 0.2, "mode": "loop|scrub|hold", "shots": [{"t": 1}, {"t": 6, "zoom": 1.15, "x": -0.04}]}`.
  Pro Seite anderes Material: `page.scene = {"src": "media/cell.webp", "zoom": 1.1}`. `t` = Sekunde im Clip, `scrub` gleitet
  den Abspielkopf (Clip mit dichten Keyframes exportieren: `ffmpeg -i in.mp4 -g 4 -crf 23 -an out.mp4`), `hold` = Standbild.
  Bilder bekommen eine langsame Ken-Burns-Fahrt. Medien liegen neben dem Brief und werden eingebettet (Ziel < 15 MB:
  Video 720–1080p, 6–15 s, ohne Ton). Kombination Partikel + zweite Ebene: `scene.with = {kind:"orb"|"media", …}`.
- **Echtes 3D-Modell als Held** (`scene4.js`, Art `model`, three.js wird nur dann eingebettet): eine `.glb`-Datei neben dem
  Brief (Blender, CAD-Export, Hersteller; Meshopt/WebP-komprimiert ok, **kein Draco**; wird gzip-eingebettet, Ziel < 8 MB).
  `"scene": {"kind": "model", "src": "media/auto.glb", "look": "studio", "intro": "scan|assemble|rise|drive|none",
  "rotate": [0, 90, 0], "spin": 3, "floor": "shadow|grid|none", "shots": [ … eine pro Seite … ]}`. Ein Shot / `page.scene`:
  `{"az": 35, "el": 14, "dist": 4.4, "x": 0.22, "y": 0, "fov": 30, "look": "xray", "focus": ["Battery"], "explode": 0.6,
  "anim": "Open", "notes": [{"at": "Battery", "label": "Akku", "text": "ein Satz"}], "src": "anderes.glb"}`.
  `az`/`el` = Blickwinkel in Grad, `dist` = Abstand (Modell ist auf Länge 2 normiert), `x`/`y` = Bildversatz (Text links → `x` 0.2–0.3).
  Looks: `studio` (Originalmaterial) · `clay` (Form) · `xray` (Glas, Fokus-Teile leuchten massiv) · `hologram` (+ Scanlinien) ·
  `blueprint` (Kanten + Raster) · `points` (Punktwolke). Wechselt der Look, läuft ein **Röntgen-Scan** über das Modell.
  `notes.at` / `focus` = Name eines Bauteils im GLB (Teilstring reicht; `new_brief.py` listet alle Namen) oder Position
  `[x, y, z]` im Bereich −1…1 der Bounding-Box. `anim` spielt einen Animations-Clip aus dem GLB (Schleife; `once: true` = einmal).
  Pro Seite höchstens 3 Notes. Beispiel: `examples/model-demo/`.
- `theme.preset`: nur ohne `design` – reine Farbwelt, siehe `catalog.md` (13 Presets). Überschreibbar: `bg surface text muted line accent accent2 onAccent font`
  (`font`: `grotesk` · `editorial` · `tech` · `humanist`). Eigene Farbwelt aus Referenzbildern/CI: nächstes Preset wählen und
  alle Farben überschreiben; Kontrast prüfen.
- `nav.mode`: `deck` (Seite für Seite) · `scroll`. `nav.auto`: Sekunden pro Seite für Messe-/Kiosk-Bildschirme (nur `deck`, läuft in Schleife, jede Eingabe pausiert zwei Takte). `nav.transition`: Standard-Übergang *in* eine Seite;
  pro Seite überschreibbar mit `transition`.
- **Bild-Einbettung (Pflicht, Gate prüft):** jedes Bild/Video im Brief braucht eine bewusste Einbettung: `visual.embed` bzw. `page.embed` = particles | duotone | glow | blueprint | mono | photo | device | gallery | video | hotspots | model; media-Szene: `scene.treat`. Vorher den Nutzer fragen (`interview.md` §3).
- `bg.id`: jede ID der Art `bg` aus `catalog.md` oder `none`; `intensity` 0.3–1.6.
- `theme.fx`: Liste aus IDs der Art `fx` (Finish wie `grain`, `glass`, `vignette`; Interaktion wie `tilt`, `magnetic`,
  `cursor-glow`, `parallax`). Max. 2 Finishes + 1 Interaktion.
- Bildpfade (`png jpg webp gif svg mp4 webm`) relativ zum Brief → werden eingebettet.
- Text: `*Wort*` = Akzentfarbe, `\n` = Zeilenumbruch.

## Gemeinsame Felder je Seite
`id` (eindeutig) · `type` · `design` (anderes Design-Theme nur für diese Seite/dieses Kapitel: Farben, Schrift, Bauteile und
Szene wechseln beim Seitenwechsel; max. 3 Designs pro Deck, Wechsel nur an Kapitelgrenzen) · `kicker` · `title` · `sub` (Lead-Satz) · `enter` (Titel-Animation, jede ID der Art `tx`) ·
`transition` (Übergang hinein, jede ID der Art `tr`) · `shared` (Key: Titel fliegt zur Seite mit gleichem Key) · `subpages` (Array von Seiten, nur über Links erreichbar).

## Seitentypen

| type | Felder |
|---|---|
| `hero` | `cta {label,to|open}` `meta` `align:"center"` |
| `statement` | `cta` |
| `stats` | `items[{value (Zahl!), prefix, suffix, decimals, label, note, shared}]` |
| `chart` | `mode: bars|line|morph` `data[{label,value}]` `unit` `max` `note` `label` (Alt-Text) |
| `cards` | `items[{icon,title,text,tag,to}]` `columns` `variant:"numbered"` `moreLabel`. Mit `to` = öffnet Sub-Seite. Icons: bolt shield chart cloud cpu users globe lock spark layers route target |
| `hotspots` | Interaktive Produkt-Bühne: `src` (Produkt-Render), `ratio` ("1672 / 941"), `sub` (2 Zeilen rechts), `meta`, `footer[{title,text}]` (sonst aus den Punkten), `points[{x,y,label,text, hover:{forward,reverse} oder {src}, detail:{src,kicker,title,text,items[{x,y,label,text}],note}, variants[{label,color,src}]}]`. x/y in % des **Bildes**. Hover-Clips: kurz (≤ 1,5 s), gleicher Bildausschnitt wie `src`, vorwärts + rückwärts als zwei Dateien. Varianten: gleicher Ausschnitt, nur Lack/Räder anders. Ohne `src` zeigt ein Platzhalter-Produkt das Layout. |
| `split` | `bullets[]` `flip` `cta` `visual {type: ring|flow|image|chart|device|compare}` – ring: `value,label,suffix`; flow: `nodes[]`; image: `src,alt`; chart: wie chart; device: `frame:"browser|phone", src, url`; compare: `a{src,label}, b{src,label}` |
| `timeline` | `items[{label,title,text}]` (3–6) |
| `steps` | `items[{label,title,text,bullets}]` (Tabs; Problem/Lösung/Mehrwert) |
| `bento` | `items[{kind: stat|text|chart|image|quote, size: l|w|t|m, …}]` (≤ 7; stat: `value,label,suffix`; chart: `data`; image: `src`) |
| `marquee` | `rows[["Begriff", …], […]]` (1–2 Reihen, laufen gegenläufig) |
| `hub` | `style: orbit|constellation|radial|gear` `core` `coreHint` `items[{title,text,color,to}]` (3–8, `to` = Sub-Seiten-ID) `hint`. Nur wenn Inhalte gleichwertige Bereiche sind. |
| `number` | `value` (Zahl!) `prefix` `suffix` `decimals` `title` `sub` (eine große Zahl) |
| `big-list` | `items["Zeile mit *Akzent*", …]` (3–6) `title` `kicker` |
| `kinetic` | `rows[["Wort", …], […]]` (1–3 Reihen) `speed` (s) `sub` |
| `team` | `items[{name, role, contact, src}]` (ohne `src`: Initialen) |
| `gallery` | `items[{src, alt, caption}]` (ohne `src`: Platzhalter-Kachel) |
| `quote` | `title` (Zitat) `author` `role` |
| `media` | `src` oder `video`, `title` (Vollbild mit Overlay-Text) |
| `cta` | `cta` `contacts[{label,value}]` |
| `html` | `html` (Custom-Markup; nur wenn Katalog nicht reicht) |

## Verlinken
- `cta.to:"<seitenId>"` springt zu einer Hauptseite, `cta.open:"<subId>"` öffnet eine Sub-Seite.
- Karten/Hub-Knoten mit `to:"<subId>"` öffnen die Sub-Seite mit Morph aus dem geklickten Element; Esc/Zurück schließt.
- Sub-Seiten können beliebige Seitentypen sein (auch Hub in Hub ist möglich, aber nicht empfohlen).

## Beispiel
`examples/showcase.brief.json` (viele Seitentypen, Hub mit Sub-Seiten). Live-Varianten jedes Bausteins: `library.html`.
