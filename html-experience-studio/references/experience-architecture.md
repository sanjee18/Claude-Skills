# Erlebnis-Architektur: Intro → Story → Hub → Unterseiten → Outro

Bauart **Erlebnis-Hub** (Standard, sobald der Inhalt mehrere gleichrangige Bereiche hat: Portfolio, Angebote, Hebel,
Standorte, Workstreams). Niveau-Vorbild: die Capgemini-Invent-SDV-Referenz (Intro mit Vollbild-Visual, Story in einer
3D-Welt, ein Hauptobjekt mit klickbaren Teilen, Deep-Dives, Experten-Outro). **Übernommen wird das Niveau und der
Aufbau, nicht das Aussehen** (§6): Form des Hauptobjekts, Farbwelt, Kompositionen und Übergänge sind jedes Mal neu. Runtime: `assets/studio/experience.js` + `experience.css`
(`<script src="studio:experience">`), Startprojekt: `examples/hub-demo/` (Mechanik übernehmen, Inhalt komplett ersetzen).

## §1 Seitengraph und Rollen

```
intro ──► story 1 ──► story 2 ──► (story 3) ──► HUB ◄──────────────┐
                                                 │  Klick Segment   │ letzte Seite der Kette
                                                 ▼                  │
                                          sub a-1 ─► sub a-2 ───────┘   (je Hub-Item 1–3 Seiten)
                                                 │
                                                 └─► alle gesehen / „Ansprechpartner“ ──► OUTRO ──► (intro)
backup-Seiten: nur über Übersicht (M) / #id
```

Markup: `<section class="scene" data-id="…" data-role="intro|story|hub|sub|outro|backup" data-item="<hubItemId>">`.
`→`/Klicker folgen der **geführten Reihenfolge**: Story linear, im Hub zum nächsten *ungesehenen* Item, am Ende einer
Kette zurück in den Hub, wenn alle gesehen sind ins Outro. `H` = Hub, `M` = Übersicht, `Esc` auf Unterseite = Hub.
Der Vortragende kann also frei springen (Publikum wählt) **und** blind durchklicken – beides muss funktionieren.

## §2 Pflichtseiten und wie sie Referenz-Niveau erreichen

**Intro (Titelseite) – „der erste Eindruck verkauft“**
- Vollbild-Medium mit Bewegung, im Code gebaut oder aus dem Material des Nutzers (three.js/GLB im Licht, Shader, Canvas,
  Foto mit Licht-Sweep, eigenes Video; nie kostenpflichtig generiert) – Hero-Formel aus
  `ui-craft.md` §1. HUD ausgeblendet (`body.x-on-intro`), eigene Kopfzeile oder nur Logo.
- Kicker (Thema) · Titel in 2–3 gesetzten Zeilen, Akzent oder gedimmte Hälfte · Meta-Zeile (Datum | Uhrzeit, Absender) ·
  **weiße Pill „Reise starten“** + Glas-Pill (z. B. „Direkt zum Portfolio“) oder `oder → drücken`.
- Ein Eingangs-Moment (Zeilen steigen aus der Maske, Licht fährt über das Bild, Logo zeichnet sich) – kein statisches Bild.

**Story (2–4 Seiten) – „warum jetzt“**
- Eine Aussage pro Seite, ein Instrument pro Seite (Lineal mit wandernder Kennzahl, Band, das sich zusammenzieht,
  Ära-Schalter Hardware ↔ Software, Röntgen-Scan). Kompositionen wechseln: unten links → oben rechts → zentriert.
- Ideal: eine durchgehende Welt (three.js/Shader), die Kamera fährt von Seite zu Seite (Kamera-Welt-Technik aus
  `studio-recipes.md`); Minimum: ein gemeinsames Hintergrund-Medium, das pro Seite seinen Zustand ändert.

**Hub (Hauptseite) – „das Angebot als ein Objekt, dessen Teile man anklickt“**
- **Die Form entscheidet der Nutzer** (Briefing E0, Pflichtfrage): Zahnrad, Pyramide, Roboter mit klickbaren Bauteilen,
  Turm, Rakete, Gebäude-Schnitt, Fahrzeug, Organ, Landkarte, Schichtkuchen, eigenes. Im Autopilot schlägt Claude im
  Regiebuch **drei** themenbezogene Formen vor und baut erst nach der Wahl. Nie stillschweigend das Zahnrad nehmen.
- **Teile-Vertrag** (§5): jedes klickbare Teil trägt `data-item="<id>"`; `Exp.parts(root)` macht daraus Knöpfe mit
  Tastatur, Zuständen (`.seen` gefüllt, `.next` glüht, `.cur`), Aufbau-Animation beim Ankommen und Portal-Ursprung.
- Fertige Bausteine nur, wenn genau diese Form gewählt wurde: `Exp.gear(host, {items, groups, center})`,
  `Exp.pyramid(host, {items})` (unten = Fundament). Alles andere wird pro Projekt gezeichnet oder modelliert.
- Begleitend (Komposition frei): Eyebrow · Headline mit gedimmter Hälfte · ein Satz · Legende · Fortschritt
  (`data-x-progress-text/bar`) · weiße Pill „Weiter: <nächstes>“ (`data-x-next`) + Ghost-Pill „Ansprechpartner“.
- Jedes Teil hat eine **Beschriftung am Objekt** (Callout mit Hairline oder Text im Teil), Hover hebt das Teil an
  (`--hx/--hy`), beim Ankommen setzt sich das Objekt zusammen (`--bx/--by` = Startversatz je Teil, 90 ms Staffel).

**Unterseiten – „jede Seite ein eigenes Visual“**
- Kopf: Mini-Version des gewählten Hub-Objekts mit leuchtendem Teil (`Exp.mini(host, itemId)`, klont jedes SVG-Objekt)
  + Eyebrow „Bereich · 1/2“ + Headline. Das ist die einzige
  Wiederholung; **darunter ist jede Seite anders** (Archetypen §3, keine zwei gleichen nacheinander, keine zwei gleichen
  im selben Item).
- Inhalte kommen aus den Unterlagen (Folien, PDFs): Problem/Lösung/Wert, Assets, Use Cases, Demos. Folien-Grafiken werden
  **nachgebaut** (SVG/HTML, animierbar), nicht als Screenshot eingefügt; eingebettete Demos öffnen in einem Vollbild-Dialog.

**Outro – „die Entscheidung und die Menschen“**
- Entscheidung + nächster Schritt mit Datum/Owner (C-Level-Standard) **und** die Experten: Fotos im Kreis um das gedimmte
  Hub-Element, je Person eine gestrichelte Linie zu ihrem Segment, Steering-Team als Glas-Leiste unten.

## §3 Archetypen für Unterseiten (Startpunkte, immer aus den Daten geformt)

| # | Archetyp | Wann | Kern-Visual |
|---|---|---|---|
| A1 | Spannungsbogen | Problem → Lösung → Wert | drei Stationen auf einer Linie, die sich zeichnet; Wert-Station leuchtet |
| A2 | Zeitstrahl / Taskforce | Vorgehen, Pilot, Ramp-up | Wochen-Schiene, Meilensteine fallen gestaffelt ein, Ziel glüht |
| A3 | Schichten-Stapel | Architektur, Plattform | isometrische Glasplatten, Hover hebt eine Schicht an |
| A4 | Vorher / Nachher | Wirkung zeigen | Umschalter (Pill) verändert das Visual live |
| A5 | Zahlenwand | 2–4 belegte Kennzahlen | große Ziffern an einer Hairline, Quelle in Mono |
| A6 | Zitat + Beleg | Kunde / Betrieb | ein Satz in Display-Größe, Name + Freigabe |
| A7 | V-Modell / Prozess-Band | Engineering-Abläufe | V aus Pfaden, Agenten/Schritte docken an |
| A8 | Eisberg / Tiefe | sichtbar vs. verborgen | Wasserlinie, unten die eigentlichen Hebel |
| A9 | Asset-Raster | „Beispiel-Assets“ (max. 1× pro Deck!) | Glas-Kacheln mit gestricheltem Rand, Hover-Glint |
| A10 | Live-Demo | Prototyp vorhanden | Vorschau-Karte → Vollbild-Dialog mit Esc |
| A11 | Karte / Orte | Standorte, Netzwerk | Punkte auf Karte/Globus, Linien laden nacheinander |
| A12 | Matrix | Optionen bewerten | 2×2 mit wandernden Punkten |

Im Regiebuch steht pro Unterseite **Archetyp + was ihn für diesen Inhalt eigen macht** (z. B. „A2, aber die Wochen sind
die 8 Kalenderwochen bis SOP, Woche 6 trägt das Werk-Foto“).

## §4 Übergänge: ein eigener je Seitenpaar

Die Runtime löst Übergänge in dieser Reihenfolge auf: `'a>b'` (Seiten-IDs) → `'a>*'` → `'*>b'` → Rollenpaar
(`'hub>sub'`) → Standard. Werte: Name eines eingebauten Übergangs **oder** eine eigene `async (ctx) => {…}`-Funktion
(ctx: `from, to, A, B, dir, origin` + Helfer `Exp.anim/sleep/show/hide/reveal/clean`).

| Eingebaut | Standard für | Erzählt |
|---|---|---|
| `rise` | intro → story | Titelwelt fährt durch die Kamera (Scale 1,08 + Blur 18) |
| `push` | story → story | Kapitel schiebt sich weiter (seitlich, Blur, 7 vw) |
| `converge` | story → hub | alles zieht sich zusammen, der Hub verdichtet sich aus der Unschärfe |
| `portal` | hub → sub | Unterseite öffnet sich **aus dem angeklickten Segment** (Kreis-Maske + Lichtblitz) |
| `return` | sub → hub | Seite fällt zurück in ihr Segment, Hub zoomt hinein |
| `lift` | sub → sub | leise, vertikal, innerhalb eines Bereichs |
| `wipe` | Kapitelwechsel | harte Kante mit Lichtlinie |
| `dissolve` | → outro | langsam, weich, nichts bewegt sich seitlich |
| `curtain` | outro → intro | Akzentfläche überquert den Schirm |

**Regeln:** (1) Jede Kante, die in der Live-Präsentation vorkommt, steht im Regiebuch mit Namen. (2) Mindestens die
Story-Kanten und `story>hub` sind **eigene** Funktionen, die etwas Inhaltliches tun (Zahl schrumpft, Fahrzeug wird
durchsichtig, Datenstrom fließt ins Zahnrad) – die eingebauten sind Grundierung, nicht das Ergebnis. (3) 1–2 Wow-Übergänge
pro Deck (Referenz: Flug aus dem Cockpit durch einen Datenstrom ins Zahnrad). (4) `→` während eines Übergangs springt
ans Ende (Vortragende warten nie). (5) `prefers-reduced-motion`: Schnitt statt Bewegung (Runtime erledigt das).

3D-Welt + Hub kombinieren: three.js-Canvas als feste Ebene unter den Szenen; eigene Übergänge rufen die Kamerafahrt auf
(`await world.fly('cockpit')`), blenden den Canvas aus und übergeben an `converge`/eigene DOM-Choreografie.

## §5 Bau-Checkliste Erlebnis-Hub

- [ ] Intro nach Hero-Formel, mit bewegtem Medium und zwei Pills
- [ ] 2–4 Story-Seiten mit je einem Instrument, wechselnde Komposition
- [ ] Hub-Element aus dem Inhalt geformt, wird beim Ankommen gebaut, Fortschritt + „Weiter: …“ funktionieren
- [ ] Jede Unterseite eigener Archetyp aus den Daten; Mini-Hub als Orientierung
- [ ] Übergangs-Register im Projekt (`transitions: {…}`) mit eigenen Funktionen für Story- und Wow-Kanten
- [ ] Outro mit Entscheidung + Köpfen; Backup-Seiten nur über M
- [ ] Klicker blind durchklicken (Intro → … → Outro) und frei springen (Segment, M, H, #id) – beides ohne Hänger


## §5 Teile-Vertrag: jede Wunschform klickbar machen

**SVG (Roboter, Kran, Turm, Rakete …)** – Objekt von Hand zeichnen, jedes Bauteil eine Gruppe:

```html
<div class="hub-obj" id="robot"><svg viewBox="0 0 600 720">
  <g data-item="sensorik" style="--by:-40px">          <!-- Kopf = Sensorik; startet 40 px höher und fällt an seinen Platz -->
    <rect class="s f" x="220" y="40" width="160" height="120" rx="28"/> <circle class="s eye" cx="265" cy="100" r="12"/> …
    <path class="lead" d="M380 90H470"/><foreignObject x="476" y="70" width="140" height="44">…Label…</foreignObject>
  </g>
  <g data-item="rechenkern"> <rect class="x-hit" x="190" y="180" width="220" height="220"/> … Torso, Chip im Brustkorb … </g>
  <g data-item="aktorik-l" style="--bx:-60px;--hx:-8px;--hy:0px"> … linker Arm … </g>
  <g data-item="aktorik-r" style="--bx:60px;--hx:8px;--hy:0px"> … rechter Arm … </g>
  <g data-item="antrieb" style="--by:60px"> … Beine/Räder … </g>
</svg></div>
<script> Exp.parts($('#robot svg'), { hover: (id, on) => {/* z. B. Augen leuchten, Arm winkt */} }); </script>
```
Regeln: dünne Teile bekommen eine unsichtbare Trefferfläche `<rect class="x-hit">`; Farbe je Teil über `--c` (aus den
Items oder inline); Zustände per CSS (`[data-item].seen .f{…}`, `.next` glüht automatisch); `Exp.mini` funktioniert ohne
Zusatzarbeit. Ein eigenes Objekt braucht ~60–120 Zeilen SVG – das ist der Teil, der das Deck unverwechselbar macht.

**three.js (Roboter als Modell, Fahrzeug, Gebäude)** – Teile im Modell markieren, Raycast öffnet die Unterseite:

```js
part.userData.item = 'antrieb';                                   // je Mesh/Gruppe
canvas.addEventListener('click', e => { const hit = raycast(e); if (hit) Exp.openItem(hit.userData.item, { x: e.clientX, y: e.clientY }); });
items.forEach(it => Exp.origin(it.id, () => toScreen(partOf(it.id))));   // portal/return starten am Bauteil
document.addEventListener('exp:progress', e => recolor(e.detail));       // seen / next / cur am Material zeigen
```
Hover: Emissive anheben + Label (`Studio.anchor`-Technik aus `studio-recipes.md`). Tastatur: zusätzlich unsichtbare
HTML-Knöpfe je Teil (`<button data-go-item="antrieb" class="sr">`).

## §6 Niveau ja, Kopie nein (Abstand zur Referenz)

Die Referenz zeigt, **wie gut** es sein muss – nicht, wie es aussieht. Vor dem Regiebuch prüfen, auf mindestens
**vier von sechs Achsen** bewusst anders als die Referenz (und als die Demo):

| Achse | Referenz | Eigene Entscheidung kommt aus |
|---|---|---|
| Hauptobjekt | Zahnrad | Nutzerwahl (E0) |
| Farbwelt | Nachtblau + Cyan/Türkis/Violett | CI des Absenders + Thema (hell ist erlaubt!) |
| Intro-Komposition | Foto rechts, Titel links unten | Hero-Formel-Varianten: zentriert-oben, Split, Vollbild-Objekt, Typo-only auf Shader |
| Story-Welt | 3D-Fahrzeug, Röntgen-Scan | das Thema des Nutzers (Gelände, Fabrik, Körper, Stadt, Daten …) |
| Wow-Übergang | Datenstrom ins Zahnrad | eigene Idee aus dem Inhalt |
| Typo | Ubuntu + Inter | CI-Schrift oder passende Grotesk/Serif aus `assets/fonts` |

Die Tokens in `experience.css` (dunkelblau/cyan) sind nur Platzhalter: **jedes Projekt setzt `:root` neu.** Texte,
Bilder, Logos und Motive der Referenz werden nie übernommen (leakcheck).
