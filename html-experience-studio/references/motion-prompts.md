# Motion-Prompt-Karten (Profi-Format)

Jede Karte ist ein vollständiger, wiederverwendbarer Auftrag mit festem Aufbau, ähnlich wie bei prompt-motion.com:
`inputs` (was du vom Nutzer brauchst) · `direction` (Look & Verbot) · `structure` (Zeitachse in Sekunden) ·
`build` (exakte Umsetzung mit den Engine-Bausteinen oder Custom-Code) · `gotchas` · `start` (erste Antwort).
Markierung: **[live]** = interaktive Seite im Deck (Engine) · **[film]** = gerendertes MP4/GIF (deterministische Seite
mit `window.seek(t)`, Render mit Playwright + ffmpeg; Skills `motion-effects`, `launch-video`, `reel-export`).
Branche egal: Slots in `{{…}}` mit Kundeninhalt füllen. Zahlen nie erfinden.

Auswahl im Briefing-Bogen (Abschnitt C5/H): Nutzer wählt 1–3 Karten. Du füllst die Inputs aus Unterlagen, fragst nur Fehlendes,
baust über Brief + Engine; nur was die Engine nicht kann, wird als Custom-Seite (`type:"html"`) ergänzt.

Standard-Verbote (gelten für alle Karten): kein ease-in/linear für UI, kein `scale(0)`, keine Layout-Properties
animieren, keine CDN-Links, kein Autoplay-Ton, kein Text über Visuals ohne Kontrast, keine erfundenen Zahlen.

---

## M-01 · Kapitel-Wow: Zoom-Portal [live] · alle Branchen
<inputs>Kapitelname und Kernsatz des neuen Kapitels; ein Element der alten Seite, in das gezoomt wird ({{Gerätebildschirm,
Karte, Kennzahl}}); Akzentfarbe (aus Theme).</inputs>
<direction>Kamera fliegt in ein Objekt der alten Seite hinein, dahinter öffnet sich das neue Kapitel. Ein kontinuierlicher
Schwung, keine Schnitte, kein Rückwärts-Zoom. Hintergrund beschleunigt kurz mit (Stars/Network `boost`). Nur 1–2× pro Deck.</direction>
<structure>0–0.4 s Seite hält, Objekt wird größer (scale 1→1.15) → 0.4–1.0 s Zoom-through auf 1.45×, Blur 0→14 px, Opacity→0
→ 0.2–1.1 s neue Seite von scale .8→1, Blur 10→0 → 0.38 s Titel des neuen Kapitels startet `mask-words`
→ 1.1 s Seite bedienbar.</structure>
<build>Brief: Seite davor `type:"hero"|"html"`, nächste Seite `type:"hero"`, `transition:"zoom-through"` auf der Zielseite.
Für Hyperspace-Gefühl: `transition:"warp"` und `bg.id:"stars"` (boost läuft automatisch). Gerät als CSS-Frame (siehe
`split` + `visual:{type:"device"}`).</build>
<gotchas>Nicht zusammen mit Seitenwechsel-Stagger auf der alten Seite; Reduced Motion fällt auf Kurzblende zurück; nach dem
Portal keine zweite große Bewegung in den ersten 1.2 s.</gotchas>
<start>Frage: Was ist das Objekt, in das gezoomt wird, und wie lautet der erste Satz des neuen Kapitels? Zeige danach das
Storyboard (2 Seiten) und baue.</start>

## M-02 · Shared Title / Kennzahl wandert [live]
<inputs>Ein Satz oder eine Zahl, die zwei aufeinanderfolgende Seiten verbindet (gleicher Text!).</inputs>
<direction>Der Titel der Seite A (groß, zentriert) fliegt an seinen Platz als kleinerer Titel der Seite B. Eine Bewegung
verbindet Aussage und Beleg; alles andere blendet gedämpft ein. Das ist der professionellste, ruhigste Übergang.</direction>
<structure>0 s Seite A steht → 0–0.95 s Titel gleitet (translate+scale, `cubic-bezier(.77,0,.175,1)`) → 0.25–0.6 s Rest der
Seite A blendet aus → 0.3 s Seite B baut Lead/Inhalt auf (Titel startet nicht neu).</structure>
<build>`shared:"<key>"` auf beiden Seiten (Titel) oder `items[].shared` bei Kennzahlen. Gleicher Text, ähnlicher Umbruch.
Übergang `fade-blur` oder `slide`. Engine macht FLIP automatisch (`data-shared`).</build>
<gotchas>Unterschiedlicher Zeilenumbruch lässt den Flug springen: gleiche `\n`; nur ein Paar je Übergang.</gotchas>
<start>Frage nach dem verbindenden Satz/der Zahl und den zwei Seiten; setze `shared` und baue.</start>

## M-03 · Bento-Assemble [live]
<inputs>5–7 Aussagen mit Gewicht (1 Hero-Zahl, 1 Visual, 1 Zitat, Rest Kurztexte), Hero-Zahl exakt.</inputs>
<direction>Kacheln unterschiedlicher Größe bauen sich von der Mitte nach außen auf (Distanz bestimmt Verzögerung), Zahlen
zählen hoch, Chart zeichnet sich. Eine Hero-Kachel (2×2), keine zwei gleich laute.</direction>
<structure>0.28–0.8 s Kacheln fliegen 46 px aus der Mitte, Blur 8→0, scale .93→1 (Delay nach Entfernung) → 0.7 s Count-up
(1.6 s) → 0.9 s Chart-Linie → Hover: Spotlight.</structure>
<build>`type:"bento"`, items `{kind:"stat|text|chart|image|quote", size:"l|w|t|m"}`. Max. 7 Kacheln; `fx:["glass"]` für
Premium-Look. Bilder als Dateien neben das Brief legen (werden eingebettet).</build>
<gotchas>Mehr als 7 Kacheln wirken unruhig; Text je Kachel ≤ 18 Wörter; Mobile = 2 Spalten.</gotchas>
<start>Frage nach der Hero-Zahl (exakt, mit Quelle) und den 4–6 weiteren Aussagen; schlage die Größenverteilung vor.</start>

## M-04 · Daten-Moment: Balken werden Linie [live]
<inputs>3–8 Datenpunkte (Label, Wert, Einheit, Quelle), Aussage (Wachstum? Trend?).</inputs>
<direction>Erst Balken (Vergleich), dann verschmelzen sie zur Linie (Trend). Ein Datensatz, eine Aussage, Klick wechselt
zurück. Werte sichtbar beschriftet.</direction>
<structure>0.3–1.2 s Balken wachsen (80 ms Versatz) → 0.9 s Werte erscheinen → 3.2 s Balken blenden aus (0.6 s), Linie
zeichnet sich (1.2 s), Punkte poppen, Fläche 16 % → Klick toggelt.</structure>
<build>`type:"chart", mode:"morph"`; für Reifegrad `split` + `visual:{type:"ring"}`; Kennzahlen davor als `stats`.</build>
<gotchas>Nur echte Werte; Y-Achse bei 0 beginnen; max. 8 Punkte.</gotchas>
<start>Frage nach Datenreihe und Einheit; leite die Überschrift aus der Aussage ab (Zahl im Titel).</start>

## M-05 · Hub-Morph: Portfolio aus Knoten [live]
<inputs>4–8 Hebel/Angebote (Name ≤ 14 Zeichen, 1 Satz, Farbe), Kernbegriff für die Mitte, je Hebel eine Detailseite.</inputs>
<direction>Zahnrad mit Knoten, Hover zeigt den Satz in der Mitte, Klick lässt die Detailseite aus dem Knoten wachsen,
Zurück schrumpft sie zurück. Hub bleibt im Zustand. Alle Detailseiten gleich aufgebaut.</direction>
<structure>0.15–1.35 s Zahnrad dreht ein (−25°→0, Opacity) → 0.55 s Knoten poppen gestaffelt (110 ms) → Klick: 0.82 s
Morph (clip-path aus Knoten-Rect, Radius 22→0) → Esc: 0.68 s zurück, Hub blendet ein.</structure>
<build>`type:"hub"` + `subpages` (Vorlage: `steps` Problem/Lösung/Mehrwert oder `split`+Kennzahl). `H` springt zum Hub.</build>
<gotchas>> 8 Knoten überlappen; Sub-Seiten ≤ 110 Wörter; Zurück-Weg immer erklären (Hint-Leiste).</gotchas>
<start>Frage nach Hebelliste und Aufbau der Detailseite (Vorlage 1–6 aus `navigation-patterns.md`).</start>

## M-06 · Kapitelwechsel mit Jalousie/Vorhang [live]
<inputs>Kapitelgrenzen im Deck (Seitennummern), gewünschte Stimmung (Tempo/Seriosität).</inputs>
<direction>Die Seite wird zum Bauteil: Paneele bzw. Hälften verdecken die Szene, dahinter wechselt der Inhalt unsichtbar.
Wirkt wie ein Filmschnitt mit Handschrift. Nur an Kapitelgrenzen, sonst `slide`/`fade-blur`.</direction>
<structure>`blinds`: 0–0.5 s Paneele decken (55 ms Versatz) → Seite tauscht → 0.5–1.0 s Paneele geben frei → 0.95 s Titel startet ·
`curtain-split`: 0–0.95 s Hälften fahren ±54 % weg, neue Seite scale .9→1, Helligkeit .55→1.</structure>
<build>`transition:"blinds"` oder `"curtain-split"` auf der ersten Seite des neuen Kapitels.</build>
<gotchas>Nicht kombinieren mit schweren Hintergründen (Canvas) auf schwachen Geräten; max. 3 Kapitelwechsel pro Deck.</gotchas>
<start>Frage nach Kapitelgrenzen; weise jeder Grenze einen Übergang zu und zeige die Zuordnung im Storyboard.</start>

## M-07 · 3D-Dolly + Linsen-Schwenk [live]
<inputs>Zwei Seiten, die als "Szenenwechsel" erzählt werden (z. B. Problem → Lösung), Tempo (ruhig/dynamisch).</inputs>
<direction>`depth-dolly`: alte Seite fällt in die Tiefe und dreht weg, neue kommt von vorn. `lens-sweep`: ein Unschärfeband
fährt über die Seite, dahinter tauscht der Inhalt (Fokuswechsel-Gefühl). Kurven stark, nie zurückfedern.</direction>
<structure>0–0.9 s alte Seite translateZ −600 px, rotateY 22°, Opacity→0 · 0.12–1.1 s neue Seite von +320 px/−16° → 0 ·
`lens-sweep` 1.1 s, Tausch bei 40 %.</structure>
<build>`transition:"depth-dolly"|"lens-sweep"` auf der Zielseite; Richtung folgt Vor/Zurück (Dolly).</build>
<gotchas>3D-Transforms brauchen `overflow:hidden` (Deck hat es); bei Reduced Motion Kurzblende.</gotchas>
<start>Frage, welche zwei Seiten zusammengehören; wähle Dolly (Tiefe) oder Linse (Fokus) mit Begründung.</start>

## M-08 · Produkt im Rahmen mit Auto-Scroll [live]
<inputs>Screenshots des Produkts (Desktop lang, Handy), URL-Text für die Adressleiste, 2–3 Vorteile als Bullets.</inputs>
<direction>Browser- oder Handy-Rahmen schwebt ein; langer Screenshot scrollt langsam hin und her (9 s), echte UI statt
Illustration. Ohne Screenshot: neutrale Skeleton-UI mit gestaffeltem Aufbau (klar als Platzhalter).</direction>
<structure>0.25–1.25 s Rahmen hebt sich (translateY 30, rotateX 8°, scale .96) → 0.7 s Skeleton-Blöcke bauen auf (90 ms) → ab 1.2 s
Screenshot scrollt (ease-in-out, alternate).</structure>
<build>`type:"split"`, `visual:{type:"device", frame:"browser|phone", src:"screens/home.png", url:"…"}`; Vorteile als `bullets`.</build>
<gotchas>Screenshot ≥ 1600 px breit, WebP; keine fremden Marken ohne Freigabe; Scroll stoppt bei Reduced Motion.</gotchas>
<start>Frage nach Screenshots (oder Platzhalter) und den drei Vorteilen; baue die Seite.</start>

## M-09 · Vorher/Nachher-Reveal [live]
<inputs>Zwei Bilder gleichen Formats (oder zwei Labels), je 1 Satz Aussage.</inputs>
<direction>Regler fährt einmal 100→15→50 % als Demo, dann steuert der Nutzer (Maus, Touch, ←/→). Die Differenz muss in
2 Sekunden sichtbar sein.</direction>
<structure>0.6–2.5 s Demo-Fahrt → danach nutzergesteuert; Griff glüht in Akzentfarbe.</structure>
<build>`type:"split"`, `visual:{type:"compare", a:{src,label}, b:{src,label}}`.</build>
<gotchas>Bildausschnitte exakt gleich ausrichten; Alt-Texte; Labels ≤ 2 Wörter.</gotchas>
<start>Frage nach den zwei Zuständen und Bildern.</start>

## M-10 · Fahrplan zeichnet sich [live]
<inputs>3–6 Meilensteine (Zeitpunkt, Titel, optional Satz), Startdatum.</inputs>
<direction>Linie wächst von links nach rechts, Meilensteine erscheinen im Takt der Linie (nicht vorher). Zeitpunkte als
Mono-Kicker.</direction>
<structure>0.3–1.7 s Linie (scaleX 0→1, `(.77,0,.175,1)`) → Meilenstein i erscheint bei i/(n−1)·1 s, translateY 18→0.</structure>
<build>`type:"timeline"`; bei vielen Phasen stattdessen `steps` oder mehrere Seiten.</build>
<gotchas>Keine erfundenen Termine; Mobile = vertikal.</gotchas>
<start>Frage nach Meilensteinen und Terminen; markiere Unbekanntes als [TBD].</start>

## M-11 · Fließende Architektur [live]
<inputs>3–5 Stufen (Quelle → Verarbeitung → Ergebnis) mit Namen, 1 Satz je Stufe.</inputs>
<direction>Knoten erscheinen nacheinander, Impulse laufen entlang der Verbindungen. Zeigt Richtung und Rhythmus, nicht
Details.</direction>
<structure>0.3 s + 160 ms je Knoten (translateY 16→0) → Impulse 2.2 s Loop, `(.77,0,.175,1)`.</structure>
<build>`type:"split"`, `visual:{type:"flow", nodes:[…]}`; Details der Stufen als `bullets`.</build>
<gotchas>Max. 5 Knoten; Impulse nicht als Datenwert missverstehen: Beschriftung "schematisch".</gotchas>
<start>Frage nach Stufen und Reihenfolge.</start>

## M-12 · Produkt-Flug über die Landingpage [film]
<inputs>Link der Seite (oder Screenshots in Sektionen), Markenname + Logo, zweiteilige Schlusszeile (Aussage + kurzer Nachsatz),
optional 15-s-Track. Länge 12–15 s, 1440×1152, 60 fps.</inputs>
<direction>Eine durchgehende 3D-Kamerafahrt über die flach liegende Seite auf hellem Studioboden mit weichem Schatten.
Kamera gleitet rückwärts die Seite entlang, steigt senkrecht auf, zeigt die Seite als Streifen, taucht in den Hero und endet
auf einer Titelkarte. Geringe Schärfentiefe: vorn weich, Zielbereich scharf. Karten schweben leicht über der Seite,
Fotos/Chips heben sich und stellen sich auf. Verboten: Schnitte, Überblendungen, Stopps im Gleiten, seitliches Schwenken,
Zoom-rein-und-raus, Glows, Text über der Seite vor der Endkarte.</direction>
<structure>0–8 s Flug (Geschwindigkeit als Kurve: 0→0.5 bis 0.6 s, 1.0 bis 1.6 s, 0.94–1.1 bis 7.3 s, auslaufend) → 7.7–9.2 s
Aufstieg → 9.2–9.5 s Draufsicht → 9.5–10 s Sturz in den Hero (Karte mit 1018 px Breite, 38 px Radius) → 10–14.5 s Titel: Zeile 1
Wort für Wort (60 ms), Nachsatz kursiv in Grau, Badge mit Logo.</structure>
<build>1) Seite mit Playwright (1440 px, Scale 2) öffnen, bis unten scrollen, Teile mit `data-layer` markieren, Hintergrund-Screenshot
ohne diese Teile + je ein transparentes PNG pro Teil + JSON mit Positionen. 2) Eine WebGL2-Seite, alles aus `seek(t)` (keine Timer):
Seite = texturiertes Quad, Teile = eigene Quads mit Höhe, Mipmaps + 16× Anisotropie. 3) Kamera aus **einer** Geschwindigkeitskurve
integrieren (nicht aus Positions-Keys), Brennweite 1880 px, Tilt 56°. 4) Schärfentiefe pro Pixel (Golden-Angle-Disc, 40 Taps, Mip-Level
passend). 5) Hochgehobene Teile werfen weichen Schatten. 6) Render mit Playwright auf echter GPU, 16 Subframes Motion Blur, H.264,
ffmpeg. Hilfs-Skills: `motion-effects` (seek-Muster), `reel-export` (Vertikalfassung), `launch-video`.</build>
<gotchas>Ohne Code-Ausführung nur Live-Vorschau möglich, MP4 braucht Claude Code. Layout vor dem Timing sperren (Sektionshöhen
ändern alles danach). Teile nicht per Transparenz ausblenden: erst in die Dunstfarbe faden. Vorab 30-fps-Vorschau mit Optical-Flow
prüfen: Geschwindigkeit darf nie einbrechen, keine Zoom-in-Phase im Flug.</gotchas>
<start>Frage nach Link, Marke, Schlusszeile, Track. Erfasse die Seite, zeige Standbilder bei 0, 1.6, 2.5, 5, 6.5, 9.3 und 11 s,
erst dann rendern.</start>

## M-13 · Launch-Film 30–45 s [film]
<inputs>Produktname, ein Satz Versprechen, 3 Beweis-Momente (je 1 Zahl/Bild), Call-to-Action, Logo, Format (16:9/9:16).</inputs>
<direction>Ein Satz, auf Szenen verteilt; echte Produktbilder mit langsamen Kamerabewegungen; ein getippter Prompt/Ablauf;
Beweis; klarer CTA. Ruhige Typografie, 1 Akzent, max. 3 Wörter pro Einblendung im Hook.</direction>
<structure>0–3 s Hook (Frage) → 3–12 s Problem-Szene → 12–25 s Lösung in 3 Beweis-Momenten (je 4 s, Count-up/Chart-Morph) →
25–32 s Produkt-Rahmen mit Auto-Scroll → 32–38 s CTA + Logo, Hold 2 s.</structure>
<build>Skill `launch-video` (Single-File-HTML mit `window.seek`) + Bausteine aus dieser Engine (Stats, Chart-Morph, Device);
Export mit `reel-export` für 9:16.</build>
<gotchas>Musik/Ton nur mit Rechten; Zahlen mit Quelle; Texte im Safe-Zone-Bereich (Reels).</gotchas>
<start>Frage nach Versprechen und den 3 Beweisen; schlage Szenenfolge vor und bestätige vor dem Bauen.</start>

## M-14 · Partikel formen Zahl oder Wortmarke [live/film]
<inputs>Zahl/Wort (≤ 6 Zeichen), Moment (Meilenstein, Name), Dauer 4–12 s.</inputs>
<direction>Tausende feine Punkte driften wie ein Sternenhimmel und ziehen sich zur Zahl zusammen, federn, halten, lösen sich
beim Verlassen. Edel statt Party: wenig Farbe, langsame Bewegung.</direction>
<structure>0–1.2 s Drift → 1.2–3.6 s Sog zur Form (Federung 8 %) → 3.6–8 s Halten mit leichtem Atmen → Label gleitet ein.</structure>
<build>Custom-Seite `type:"html"` mit Canvas 2D: Zielpunkte aus Offscreen-Text (`getImageData`), 2500–4000 Punkte, DPR ≤ 2,
`enter`/`leave` für Start/Stop (siehe `prompt-library.md` P3).</build>
<gotchas>Zahl exakt; Fallback bei Reduced Motion = statischer Text.</gotchas>
<start>Frage nach Zahl/Wort und Anlass.</start>

## Wie eine neue Karte entsteht
1. Wirkung in einem Satz, 2. Zeitachse in Sekunden (max. 8 Beats), 3. Engine-Bausteine, die schon passen, 4. Custom-Anteil
(Code-Skizze), 5. Verbote/Gotchas, 6. Startfrage. Dann hier einfügen und in `catalog.md` verlinken.
