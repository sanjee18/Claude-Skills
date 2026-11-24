# Design-Themes (generiert aus `assets/designs/designs.json`, nicht von Hand bearbeiten)

Ein Design-Theme ist die **komplette Designsprache** eines Decks: Farbrollen, Schriftpaar, Bauteil-Stil, Layout,
Bildsprache, Bewegungsgrammatik und Verbote. Im Brief: `"theme": {"design": "<id>"}`. Es setzt die Standards
für `nav.mode`, `nav.transition` (ruhig), `nav.enter`, `bg`, `theme.fx` und den Hub-Stil; alles, was im Brief
ausdrücklich steht, gewinnt. Farben einzeln überschreibbar (`theme.accent` usw.), Kontrast danach prüfen.

**Übergangsrollen:** `ruhig` = Standard innerhalb eines Kapitels (nav.transition), `Kapitel` = an Kapitelgrenzen als
`page.transition` setzen, `Wow` = genau 1× pro Deck an der stärksten Stelle.

**Neues Theme anlegen:** Eintrag in `designs.json` (Felder wie unten) + `assets/designs/<id>.css` (alle Regeln mit
`[data-design=<id>]` beginnen; Bauteile: `.t .acc .kicker .lead .card .tile .btn .stat .num .node .bul .vis-ring`).
Neue Schrift: OFL-Latin-woff2 als `Family-Gewicht.woff2` nach `assets/fonts`, Name in `FAMILY` in `build.py`,
Lizenz in `assets/fonts/LICENSES.md`. Danach `python scripts/build_library.py`.

**Signature-Szene (das Wichtigste):** Jedes Theme hat einen Hauptdarsteller, der über alle Seiten bestehen bleibt und
pro Seite einen neuen Shot bekommt (`assets/engine/scene.js` WebGL-Partikel, `scene2.js` DOM-Szenen). Seiten sind
Kamera-Einstellungen, keine Folien: links eine schmale Textspalte, rechts die Szene; Karten werden zu Listen, Diagramme
in `split` übernimmt die Szene. Pro Seite überschreibbar: `page.scene = {shape, cam, text}`. Formen: ring sphere globe
galaxy helix wave terrain tunnel brain lattice scatter text numeral (Kennzahl der Seite als Partikel-Typo).
Kamera: `{az, el, dist, x, y, fov}`. Szenen-Arten: `particles` · `morph-ui` · `cards3d` (eigene Bilder: `scene.images`) · `type`.

## Keynote Glass · `keynote-glass`

*Hell, Blau-Dunst, Milchglas – Produkt-Launch wie auf der Bühne.* Weiße Bühne mit blauem Dunst, darin ein schwebendes Objekt aus feinen Blau-Partikeln, das sich pro Seite verwandelt (Kugel, Ring, die Kennzahl, Galaxie). Große ruhige Inter-Titel mit Verlaufs-Akzent, Milchglas-Pillen, Bewegung mit Unschärfe.

- **Passt zu:** Produkt-Launch, Feature-Vorstellung, Software, Pitch an Management · Stimmung: premium, ruhig, futuristisch · Ton: light
- **Farben:** bg `#fdfdfb` · surface `#ffffff` · text `#0f1b33` · muted `#5b6b86` · accent `#2f6bff` · accent2 `#3cc8f0`
- **Schriften:** Titel 'Inter' (600) · Text 'Inter' · Mono 'Inter'
- **Bewegung:** Titel `blur-words` · ruhig `fade-blur` · Kapitel `zoom-through` · Wow `portal-dive` · Hintergrund `none` · Finish glass · Hub `orbit` · Modus `deck` · ruhig, 900–1100 ms, jede Bewegung mit Bewegungsunschärfe
- **Signature-Szene:** `particles` · Shots: sphere → ring → numeral → galaxy → helix
- **Layout:** Viel Weißraum, zentrierte Hero-Lockups erlaubt, Inhalt in schwebenden Glasfenstern (Radius groß).
- **Typo:** Inter 600, Tracking -0.035em, Titel max. 2 Zeilen; Kicker als kleine Pille in Eisblau.
- **Bauteile:** Milchglas-Karten (weiß 70 %, Blur 24 px, 1 px Rand, weicher blauer Schatten), Pillen-Buttons in Kräftigblau, Zahlen in Navy.
- **Bilder:** Produkt-Screens im Browser-/Geräterahmen, helle freigestellte Objekte, keine Stockfotos.
- **Signature:** Ein schwebendes Partikel-Objekt in Blau verwandelt sich Seite für Seite; ein Portal-Flug in die Produktwelt.
- **Verboten:** Lila, Magenta, Orange · harte Schwarz-Flächen · Glow auf Text · Glitch und harte Schnitte · mehr als ein Akzent pro Seite

Steckbrief (für eigene Seiten / `type:"html"` und als Prompt):

> Richtung: Apple-Keynote-Gefühl. Hell (#FDFDFB), Navy-Text (#0F1B33), ein Kräftigblau (#2F6BFF) und Eisblau (#3CC8F0), blauer Dunst am unteren Rand. Schrift: Inter 600 für Titel, 400 für Text. Bauteile: Milchglas-Karten mit großem Radius und weichem blauem Schatten, Pillen-Buttons. Bewegung: jede Bewegung startet schon in Fahrt (starkes Ease-out) und trägt Unschärfe, die der Geschwindigkeit folgt; Übergänge ruhig fade-blur, Kapitel zoom-through, ein Wow portal-dive. Verboten: Lila/Orange, Glow auf Text, Glitch, harte Schnitte, mehr als ein Akzent pro Seite.

## Product UI Mono · `product-mono`

*Warmes Grau, Schwarz-Weiß-UI, Federn statt Glow.* Warm-graue Bühne, auf der ein einziges UI-Element die Story erzählt: Ein Cursor klickt es an, und es verwandelt sich mit Federn in den nächsten Zustand (Button, Loader, Toggle, Chart, Island, die Kennzahl). Geist-Schrift, harte 1-px-Kanten, keine Effekte.

- **Passt zu:** SaaS, App, Developer-Tool, UX-Konzept, Produkt-Demo · Stimmung: minimal, technisch, seriös · Ton: light
- **Farben:** bg `#ecebe7` · surface `#ffffff` · text `#111111` · muted `#6b6a66` · accent `#111111` · accent2 `#ff5b1f`
- **Schriften:** Titel 'Geist' (600) · Text 'Geist' · Mono 'Geist Mono'
- **Bewegung:** Titel `rise` · ruhig `slide` · Kapitel `card-stack` · Wow `flip` · Hintergrund `none` · Finish – · Hub `radial` · Modus `deck` · zügig, 500–800 ms, Federn mit höchstens kleinem Überschwingen
- **Signature-Szene:** `morph-ui`
- **Layout:** Strenges 12er-Raster, linksbündig, UI-Komponenten als Bühne (Karten wie App-Fenster).
- **Typo:** Geist 600 für Titel, Tracking -0.04em; Labels in Geist Mono, klein, keine Versalien-Orgie.
- **Bauteile:** Weiße Karten mit 1 px Rand und 12 px Radius, schwarze Buttons, ein einziger Signal-Akzent (Orange) für Status.
- **Bilder:** Echte UI-Zustände (Button, Toggle, Tabs, Chart, ⌘K) statt Fotos.
- **Signature:** Ein Objekt, nie geschnitten: Jede Seite ist ein neuer Zustand desselben UI-Elements, ausgelöst von einem Cursor-Klick.
- **Verboten:** Glows · Verläufe auf UI-Flächen · Partikel-Bursts · federnde Übertreibung · Icon-Kacheln mit Farbfüllung · Leerlauf ohne Bewegung

Steckbrief (für eigene Seiten / `type:"html"` und als Prompt):

> Richtung: Dribbble-Niveau Produkt-UI-Motion. Warmes Grau (#ECEBE7), schwarze und weiße Bauteile, ein Signal-Orange (#FF5B1F) nur für Status. Schrift: Geist (600 Titel, 400 Text), Labels in Geist Mono. Bauteile: weiße Karten mit 1-px-Kante und 12 px Radius, schwarze Buttons. Bewegung: Federn mit höchstens kleinem Überschwingen, ein Objekt verwandelt sich statt zu schneiden; Übergänge slide / card-stack / flip. Verboten: Glows, Verläufe auf UI, Partikel, federnde Übertreibung, Icon-Kacheln, Leerlauf.

## Particle Tech · `particle-tech`

*Schwarze Bühne, eine lebende Partikel-Skulptur, Mono-UI darüber – Forschungslabor-Keynote.* Eine GPU-Partikelwolke ist der Hauptdarsteller und bleibt über alle Seiten stehen: Ring-Skulptur, Galaxie, Doppelhelix, die Kennzahl selbst aus Partikeln. Jede Seite ist eine neue Form und eine neue Kamera, der Cursor wirbelt die Wolke auf. Darüber nur eine dünne Mono-Schicht: Marke, Chips, runder Zähler, schmale Textspalte.

- **Passt zu:** KI, Deep Tech, Forschung, Vision-Keynote, Produktname mit Wucht · Stimmung: futuristisch, dramatisch, energetisch · Ton: dark
- **Farben:** bg `#000000` · surface `#0a0a0a` · text `#dddddd` · muted `#8a8a8a` · accent `#aa88ff` · accent2 `#ffd28a`
- **Schriften:** Titel 'Unbounded' (400) · Text 'JetBrains Mono' · Mono 'JetBrains Mono'
- **Bewegung:** Titel `scramble` · ruhig `fade-blur` · Kapitel `zoom-through` · Wow `warp-tunnel` · Hintergrund `none` · Finish grain · Hub `constellation` · Modus `deck` · die Szene trägt die Bewegung: Formen fließen 2,2 s ineinander, Seiten blenden nur weich; Cursor wirbelt, Wolke heilt in ~2 s
- **Signature-Szene:** `particles` · Shots: ring → galaxy → numeral → helix → brain → sphere
- **Layout:** Szene füllt den Bildschirm, Objekt rechts der Mitte; links eine schmale Spalte (max. 420 px). Hero: riesiger Titel unten links über der Wolke. Keine Kartenraster.
- **Typo:** Unbounded nur für Hero und Kennzahlen; alles andere JetBrains Mono, Versalien, 13 px, Zeilenhöhe 1.35; Überschriften der Spalte in Lavendel.
- **Bauteile:** Chips (#1c1c1c, 11 px), runder Seitenzähler oben rechts, Marke mit Kreis-Stern-Zeichen, Listen statt Karten (Haarlinie oben), Text mit plus-lighter über den Partikeln.
- **Bilder:** Keine Fotos – die Partikel-Szene ist das Bild. Videos nur als kleine Thumbnails in der Spalte.
- **Signature:** Die Kennzahl der Seite formt sich aus der Partikelwolke; jede Form entsteht aus der vorigen.
- **Verboten:** helle Flächen · Kartenraster und Icon-Kacheln · Serifen · mehr als eine Akzentfarbe · Text ohne Bezug zur Szene · harte Schnitte zwischen Formen

Steckbrief (für eigene Seiten / `type:"html"` und als Prompt):

> Richtung: Forschungslabor-Keynote. Reines Schwarz, Text #DDDDDD, ein Lavendel (#AA88FF) für Überschriften und seltene Leuchtpunkte. Eine GPU-Partikelwolke ist der Hauptdarsteller und bleibt über alle Seiten bestehen: jede Seite ist ein Shot mit eigener Form (Ring-Skulptur, Galaxie, Doppelhelix, die Kennzahl als Partikel-Typo) und eigener Kamera; Formen fließen mit Curl-Noise ineinander, der Cursor wirbelt die Wolke auf, sie heilt in ~2 s. UI als dünne Schicht: Marke oben links, runder Zähler oben rechts, Chips, schmale Mono-Spalte (Versalien, 13 px), Text mit plus-lighter. Unbounded nur für Hero-Titel und Zahlen. Verboten: helle Flächen, Kartenraster, Icon-Kacheln, Serifen, harte Schnitte.

## Editorial Archive · `editorial-archive`

*Papier-Creme, Serife, Regal-Rhythmus – wie ein Kulturmagazin.* Warmes Papier, auf dem riesige kursive Serifen-Ziffern und Wörter als Outline-Kulisse stehen und pro Seite wie ein umgeblättertes Blatt aus der Maske rollen. Schwarze Instrument-Serif-Titel, Haarlinien, Mono-Nummern, ein Rot.

- **Passt zu:** Kultur, Verlag, Marke mit Geschichte, Jahresbericht, Strategie-Erzählung · Stimmung: editorial, warm, seriös · Ton: light
- **Farben:** bg `#f2ece1` · surface `#faf6ee` · text `#1b1712` · muted `#6d6458` · accent `#b3261e` · accent2 `#1d3c6e`
- **Schriften:** Titel 'Instrument Serif' (400) · Text 'Inter Tight' · Mono 'JetBrains Mono'
- **Bewegung:** Titel `mask-words` · ruhig `push-parallax` · Kapitel `curtain-split` · Wow `shatter` · Hintergrund `none` · Finish outline-cards · Hub `radial` · Modus `scroll` · gemessen, wie Umblättern, 900–1100 ms
- **Signature-Szene:** `type`
- **Layout:** Magazin-Raster mit Haarlinien, Spaltennummern, viel Papier, Bilder wie Regalreihen nebeneinander.
- **Typo:** Instrument Serif 400 groß für Titel, Inter Tight für Text, Mono-Nummern (No. 01) und Seitenangaben.
- **Bauteile:** Karten ohne Fläche, nur Haarlinie oben; Buttons als unterstrichener Text mit Pfeil; Zitate groß und kursiv.
- **Bilder:** Buchrücken, Objekte, Archivfotos, Scans; warm und körnig.
- **Signature:** Riesige Outline-Serife im Hintergrund (Kapitelnummer oder Kennzahl), die pro Seite aus der Maske rollt.
- **Verboten:** Glas-Effekte · Neon · Glows · runde Kacheln · Partikel

Steckbrief (für eigene Seiten / `type:"html"` und als Prompt):

> Richtung: Kulturmagazin. Papier-Creme (#F2ECE1), Druckschwarz (#1B1712), ein Signalrot (#B3261E). Schrift: Instrument Serif für große Titel und kursive Zitate, Inter Tight für Text, Mono für Nummern (No. 01). Bauteile: Haarlinien statt Flächen, Text-Buttons mit Pfeil, Bilder in Regalreihen. Bewegung: gemessen wie Umblättern, Wörter steigen aus Masken, ruhig push-parallax, Kapitel curtain-split. Verboten: Glas, Neon, Glows, runde Kacheln, Partikel.

## Swiss Logistics · `swiss-logistics`

*Weiß, schmale fette Riesentypo, Raster und Routen.* Reinweiß, ein gepunkteter 3D-Globus mit roten Routenbögen dreht sich rechts, links riesige schmale Versalien. Die Kamera fliegt näher an Häfen, die Punkte werden zur Kennzahl, zum Wellenfeld, zum Container-Gitter.

- **Passt zu:** Logistik, Industrie, Mobilität, Infrastruktur, Operations-Excellence · Stimmung: energetisch, technisch, minimal · Ton: light
- **Farben:** bg `#ffffff` · surface `#f4f4f2` · text `#0b0b0b` · muted `#5c5c5c` · accent `#e3262e` · accent2 `#0b0b0b`
- **Schriften:** Titel 'Barlow Condensed' (800) · Text 'Inter' · Mono 'JetBrains Mono'
- **Bewegung:** Titel `line-rise` · ruhig `slide` · Kapitel `wipe-diagonal` · Wow `shutter` · Hintergrund `none` · Finish – · Hub `radial` · Modus `deck` · zackig, 500–750 ms, klare Richtungen
- **Signature-Szene:** `particles` · Shots: globe → globe → numeral → wave → lattice
- **Layout:** Schweizer Raster, Titel füllen die Breite, Zahlen riesig, Informationen in Spalten mit Linien.
- **Typo:** Barlow Condensed 800 Versalien, Zeilenabstand 0.9; Inter für Text; Mono für Koordinaten und Codes.
- **Bauteile:** Eckige Kästen ohne Radius, schwarze Balken-Buttons, rote Markierungen, Tabellen statt Karten.
- **Bilder:** Karten, Routen, Drahtgitter-Globus, Container, Luftbilder in Schwarzweiß.
- **Signature:** Gepunkteter Globus mit roten Routen; die Punkte ordnen sich zur riesigen Kennzahl.
- **Verboten:** Radien über 4 px · Verläufe · Glas · Serifen · verspielte Federn

Steckbrief (für eigene Seiten / `type:"html"` und als Prompt):

> Richtung: Schweizer Typografie für Logistik. Reinweiß, Schwarz, ein Signalrot (#E3262E). Schrift: Barlow Condensed 800 in Versalien, riesig und eng (Zeilenabstand .9), Inter für Text, Mono für Codes. Bauteile: eckige Kästen ohne Radius, schwarze Balken-Buttons, rote Markierungen, Linien-Tabellen. Bewegung: zackig und gerichtet, Zeilen steigen auf, ruhig slide, Kapitel wipe-diagonal, Wow shutter. Verboten: Radien über 4 px, Verläufe, Glas, Serifen, Federn.

## Data Transfer · `data-transfer`

*Navy und Cyan, Datenfeld, Warp-Tunnel – Systeme, die zusammenlaufen.* Nachtblaue Welt, in der Cyan-Partikel das System bilden: Datentunnel, Globus mit Routen, die Kennzahl als Partikel-Typo, Gitter-Architektur. Inter Tight mit Mono-HUD, Glas mit Eck-Markern, Datentransfer-Warp als großer Moment.

- **Passt zu:** Automotive / SDV, Plattform, IT-Architektur, Daten-Strategie, Transformation · Stimmung: technisch, futuristisch, premium · Ton: dark
- **Farben:** bg `#040a16` · surface `#0a1426` · text `#eaf2ff` · muted `#8aa0c2` · accent `#6fd2ff` · accent2 `#2e9be0`
- **Schriften:** Titel 'Inter Tight' (500) · Text 'Inter' · Mono 'JetBrains Mono'
- **Bewegung:** Titel `rise` · ruhig `fade-blur` · Kapitel `data-converge` · Wow `warp-tunnel` · Hintergrund `none` · Finish glass, grain · Hub `gear` · Modus `deck` · ruhig mit einem großen Moment: 900 ms innen, 2,3 s Warp
- **Signature-Szene:** `particles` · Shots: tunnel → globe → numeral → lattice → sphere
- **Layout:** Linksbündige Textspalte, rechts das Kernobjekt (Hub, Ring, Fahrzeug); HUD-Labels in den Ecken.
- **Typo:** Inter Tight 500, Tracking -0.03em; HUD und Kicker in JetBrains Mono, Versalien, 11 px.
- **Bauteile:** Glasflächen mit Cyan-Haarlinie und Eck-Markern, Kennzahlen in Cyan, Zahnrad-Hub als Navigation.
- **Bilder:** Fahrzeug-/System-Renderings, Röntgen- und Drahtgitter-Ansichten, UI-Screens im Cockpit.
- **Signature:** Die Partikel fließen vom Datentunnel in den Globus, in die Kennzahl, ins Architektur-Gitter; ein Warp-Tunnel als Kapitelsprung.
- **Verboten:** Warm-Töne · Serifen · Stockfotos von Menschen am Laptop · mehr als ein Warp pro Deck

Steckbrief (für eigene Seiten / `type:"html"` und als Prompt):

> Richtung: Datentransfer im System. Nachtblau (#040A16), Cyan (#6FD2FF) und Stahlblau (#2E9BE0). Schrift: Inter Tight 500, HUD und Kicker in JetBrains Mono (Versalien, 11 px). Bauteile: Glasflächen mit Cyan-Haarlinie und Eck-Markern, Zahnrad-Hub, Kennzahlen in Cyan. Bewegung: lebendes Datenfeld im Hintergrund, das dem Kernobjekt folgt; innen fade-blur, Kapitel data-converge, ein warp-tunnel als großer Moment. Verboten: Warm-Töne, Serifen, Stockfotos, mehr als ein Warp.

## Nova Iris · `nova-iris`

*Eine Iris aus Lichtfasern sieht dich an – und löst sich in fließende Glasfasern auf.* Tiefes Nachtblau, im Zentrum eine Iris aus Tausenden kobaltblauen Fasern mit einem Kranz weißer Speichen; beim Weiterblättern fließen die Fasern zu Glasfaser-Strängen mit leuchtenden Perlen an den Spitzen. Schmale Versalien mit kursiven Serifen-Wörtern, (A)/(B)-Labels, Ghost-Buttons.

- **Passt zu:** KI-Produkt, Vision, Wahrnehmung/Computer Vision, Launch · Stimmung: futuristisch, premium, dramatisch · Ton: dark
- **Farben:** bg `#03050d` · surface `#0a0f24` · text `#eef1ff` · muted `#7f89b4` · accent `#3d6bff` · accent2 `#ffffff`
- **Schriften:** Titel 'Barlow Condensed' (500) · Text 'Inter' · Mono 'JetBrains Mono'
- **Bewegung:** Titel `line-rise` · ruhig `fade-blur` · Kapitel `zoom-through` · Wow `portal-dive` · Hintergrund `none` · Finish grain, vignette · Hub `radial` · Modus `deck` · ruhig und schwebend; die Iris pulsiert, Fasern fließen 2 s
- **Signature-Szene:** `particles` · Shots: iris → fibers → numeral → fibers → iris
- **Layout:** Objekt in der Bildmitte rechts, Titel links darüber (überlappt das Objekt leicht), rechts eine kleine (A)-Spalte mit Text und Ghost-Button.
- **Typo:** Barlow Condensed 500 Versalien für Titel, einzelne Wörter kursiv in Instrument Serif; Labels (A) (B) in Mono.
- **Bauteile:** Ghost-Buttons mit Haarlinie, Pfeil-Rund-Knopf oben links, Mini-Navigation oben rechts mit Pfeilen.
- **Bilder:** Keine Fotos; Licht-Fasern sind das Bild. Eigenes Video optional als media-Szene.
- **Signature:** Die Iris aus Fasern, die sich in Glasfaser-Stränge mit Leuchtperlen verwandelt.
- **Verboten:** Warm-Töne · Kartenraster · harte Schnitte · mehr als ein Blau

Steckbrief (für eigene Seiten / `type:"html"` und als Prompt):

> Richtung: KI, die sieht. Nachtblau (#03050D), Kobaltblau (#3D6BFF) als Licht, Weiß für einen Speichenkranz. Hauptdarsteller: eine Iris aus Tausenden blauen Licht-Fasern mit weißem Speichenkranz, die sich beim Weiterblättern in fließende Glasfaser-Stränge mit leuchtenden Perlen an den Spitzen auflöst. Typo: schmale Versalien (Barlow Condensed), einzelne Wörter kursiv als Serife (LEARN *to see* BRILLIANTLY). (A)/(B)-Labels in Mono, Ghost-Buttons. Bewegung ruhig und schwebend. Verboten: Warm-Töne, Kartenraster, harte Schnitte.

## Velvion Health · `velvion-health`

*Glühende DNA hinter einem Glas-Dashboard – Gesundheitsdaten als Kino.* Warmes Dunkel, eine glühende, funkelnde DNA-Helix als Bühne (Partikel oder eigenes Video), davor ein Glas-Dashboard: eine große Kennzahl im dunklen Kreis, Widget-Karten mit farbigen Verlaufsbildern, Pillen-Buttons, persönliche Begrüßung oben rechts.

- **Passt zu:** Health, Longevity, Biotech, persönliche Datenprodukte, Dashboards zum Zeigen · Stimmung: premium, warm, dramatisch · Ton: dark
- **Farben:** bg `#0c0706` · surface `rgba(30,22,20,.6)` · text `#fff3ea` · muted `#b49a8a` · accent `#ff8a3d` · accent2 `#ffe0b5`
- **Schriften:** Titel 'Inter Tight' (600) · Text 'Inter' · Mono 'JetBrains Mono'
- **Bewegung:** Titel `rise` · ruhig `fade-blur` · Kapitel `lens-sweep` · Wow `zoom-through` · Hintergrund `none` · Finish glass, grain · Hub `orbit` · Modus `deck` · ruhig, die DNA funkelt und dreht sich langsam, Zahlen zählen
- **Signature-Szene:** `particles` · Shots: helix → helix → helix → brain → helix
- **Layout:** Bühne vollflächig; links die Begrüßung und eine große Kennzahl im dunklen Kreis, rechts eine Spalte aus Glas-Widgets.
- **Typo:** Inter Tight 600, große Zahlen 700; Labels klein und hell.
- **Bauteile:** Glas-Widgets (Blur 24 px) mit Verlaufsbild-Karten (Koralle, Mint, Pfirsich), Pillen-Chips mit Plus, Kennzahl im Kreis.
- **Bilder:** DNA-/Zell-Video oder -Render als media-Szene (scene: {kind:'media', src:'dna.mp4'}); sonst die Partikel-Helix.
- **Signature:** Glühende DNA hinter dem Glas-Dashboard, die Kennzahl im dunklen Kreis.
- **Verboten:** kaltes Blau · harte Kanten · Kartenraster ohne Glas · Stockfotos von Ärzten

Steckbrief (für eigene Seiten / `type:"html"` und als Prompt):

> Richtung: Gesundheitsdaten als Kino. Warmes Dunkel (#0C0706), glühendes Orange (#FF8A3D) und Pfirsich. Bühne: eine funkelnde DNA-Helix (eigenes Video als media-Szene oder Partikel). Davor ein Glas-Dashboard: Begrüßung, eine riesige Kennzahl im dunklen Kreis, Widget-Karten mit Verlaufsbildern (Koralle, Mint, Pfirsich), Pillen-Chips. Inter Tight. Bewegung ruhig, Zahlen zählen. Verboten: kaltes Blau, harte Kanten, Stockfotos.

## Anchor Field · `anchor-field`

*Partikel bauen einen Glas-Würfel, dann einen Baum – über einem Feld aus Wellenringen.* Tiefviolettes Dunkel, über dem Boden konzentrische Wellenringe; darüber formen blaue Partikel einen gläsernen Würfel, einen Baum aus Daten, eine Kugel. Leichte große Inter-Tight-Titel, Navigation als zentrierte Pille, blauer Pillen-Button, schwebende Logo-Chips.

- **Passt zu:** Enterprise-KI, Versicherung, Finanzen, Plattform-Launch · Stimmung: technisch, premium, futuristisch · Ton: dark
- **Farben:** bg `#05040f` · surface `rgba(20,18,44,.7)` · text `#eef0ff` · muted `#8b8db4` · accent `#3d86ff` · accent2 `#9d86ff`
- **Schriften:** Titel 'Inter Tight' (300) · Text 'Inter' · Mono 'JetBrains Mono'
- **Bewegung:** Titel `blur-words` · ruhig `fade-blur` · Kapitel `data-converge` · Wow `warp-tunnel` · Hintergrund `none` · Finish grain · Hub `constellation` · Modus `deck` · ruhig, Partikel wachsen 2 s zur neuen Form
- **Signature-Szene:** `particles` · Shots: box+ripple → tree+ripple → numeral → tree+ripple → sphere+ripple
- **Layout:** Titel oben links leicht und groß, Objekt in der Mitte über den Wellenringen, kleine Infokarte unten links.
- **Typo:** Inter Tight 300 groß, Tracking -0.03em; Labels als Pillen mit Punkt.
- **Bauteile:** Zentrierte Nav-Pille, blauer Pillen-Button oben rechts, Logo-Chips als dunkle Pillen, Glas-Infokarte.
- **Bilder:** Partikel-Objekte statt Fotos; Kundenlogos als Chips.
- **Signature:** Wellenringe am Boden, darüber wächst aus Partikeln ein Datenbaum.
- **Verboten:** Warm-Töne · fette Titel · Kartenraster · harte Schnitte

Steckbrief (für eigene Seiten / `type:"html"` und als Prompt):

> Richtung: ruhige Enterprise-KI. Tiefviolettes Schwarz (#05040F), Blau (#3D86FF) und Violett (#9D86FF). Über dem Boden konzentrische Wellenringe aus Licht, darüber formen Partikel nacheinander einen gläsernen Würfel mit Logo, einen Datenbaum, eine Kugel. Titel groß und leicht (Inter Tight 300), zentrierte Nav-Pille, blauer Pillen-Button, Logo-Chips. Verboten: Warm-Töne, fette Titel, Kartenraster.

## Event Horizon · `event-horizon`

*Ein Wirbel aus Licht hängt oben im Bild, darunter zentrierte Ruhe.* Pures Schwarz mit Sternenstaub, oben angeschnitten ein riesiger Licht-Wirbel (schwarzes Loch mit hellem Innenring). Darunter zentriert: kleiner Pillen-Hinweis, zweizeiliger Titel mit Verlauf ins Grau, kurzer Text, weißer Pillen-Button.

- **Passt zu:** Launch, Warteliste, KI-Produkt, Vision-Seite · Stimmung: futuristisch, minimal, premium · Ton: dark
- **Farben:** bg `#000000` · surface `#0b0d12` · text `#f3f5f9` · muted `#8a92a3` · accent `#7fd3ff` · accent2 `#ffffff`
- **Schriften:** Titel 'Inter Tight' (500) · Text 'Inter' · Mono 'JetBrains Mono'
- **Bewegung:** Titel `blur-words` · ruhig `fade-blur` · Kapitel `zoom-through` · Wow `warp-tunnel` · Hintergrund `stars` · Finish – · Hub `orbit` · Modus `deck` · langsam, der Wirbel dreht sich stetig
- **Signature-Szene:** `particles` · Shots: vortex → vortex → numeral → vortex → galaxy
- **Layout:** Alles zentriert; Objekt oben angeschnitten, Text im unteren Drittel.
- **Typo:** Inter Tight 500, Titel mit Verlauf von Weiß zu Grau, Text klein und grau.
- **Bauteile:** Pillen-Hinweis mit Punkt, weißer Pillen-Button, dünne Navigation.
- **Bilder:** Wirbel/Schwarzes Loch als Partikel oder eigenes Video (media, mask top).
- **Signature:** Der Licht-Wirbel oben im Bild.
- **Verboten:** linksbündige Kompositionen · Farben außer Eisblau · Kartenraster

Steckbrief (für eigene Seiten / `type:"html"` und als Prompt):

> Richtung: Launch an der Ereignishorizont-Kante. Schwarz mit Sternenstaub, oben angeschnitten ein riesiger Licht-Wirbel mit hellem Innenring (eisblau, weiß). Alles zentriert: Pillen-Hinweis, zweizeiliger Titel mit Verlauf ins Grau, kurzer grauer Text, weißer Pillen-Button. Inter Tight. Langsame Drehung. Verboten: Linksbündigkeit, weitere Farben, Kartenraster.

## Lumora Orb · `lumora-orb`

*Eine leuchtende Flüssig-Kugel mit Galaxie im Inneren, umkreist von Glasblasen.* Schwarz, in der Mitte eine lebendige Flüssig-Kugel (Shader) mit wirbelndem Licht im Inneren und Cyan-Rand, umgeben von geneigten Orbit-Ringen, auf denen Glasblasen reiten. Riesige enge Versalien oben links, Seitenzähler 001/005, Social-Links unten links, rechts unten eine kurze Spalte mit Cyan-Button.

- **Passt zu:** 3D-/Creative-Tech, Engine, Studio, Launch mit Wow · Stimmung: futuristisch, dramatisch, energetisch · Ton: dark
- **Farben:** bg `#000000` · surface `#0a0d14` · text `#ffffff` · muted `#9aa3b5` · accent `#2fd8ff` · accent2 `#1d4dff`
- **Schriften:** Titel 'Inter Tight' (700) · Text 'Inter' · Mono 'JetBrains Mono'
- **Bewegung:** Titel `rise` · ruhig `fade-blur` · Kapitel `portal-dive` · Wow `warp-tunnel` · Hintergrund `stars` · Finish – · Hub `orbit` · Modus `deck` · die Kugel atmet und dreht, Ringe kippen pro Seite
- **Signature-Szene:** `particles` · Shots: orbit → orbit → orbit → orbit → orbit
- **Layout:** Objekt zentral; Titel riesig oben links über dem Objekt, rechts unten eine kurze Spalte mit Button, links Zähler und Social-Links.
- **Typo:** Inter Tight 700 Versalien, Zeilenhöhe .92, Tracking -0.04em; Text klein grau.
- **Bauteile:** Cyan-Button eckig mit Pfeil, Seitenzähler 001/005 mit Punkten, Social-Links als Versalien-Liste, 'Continue' mit Pfeil nach unten.
- **Bilder:** Die Kugel ist das Bild; eigene Renders/Videos optional als media-Szene.
- **Signature:** Die lebendige Flüssig-Kugel mit Galaxie innen und Glasblasen auf den Orbit-Ringen.
- **Verboten:** Kartenraster · Serifen · Warm-Töne · zweites Objekt neben der Kugel

Steckbrief (für eigene Seiten / `type:"html"` und als Prompt):

> Richtung: lebendige 3D-Engine. Schwarz, Cyan (#2FD8FF) und Tiefblau (#1D4DFF). Hauptdarsteller: eine leuchtende Flüssig-Kugel (Shader, Rand cyan, innen wirbelnde Galaxie, atmet), umkreist von geneigten Orbit-Ringen mit Glasblasen. Riesige enge Versalien oben links (Inter Tight 700), Zähler 001/005, Social-Links unten links, unten rechts kurzer Text mit eckigem Cyan-Button. Verboten: Kartenraster, Serifen, Warm-Töne.

## Veyra Studio · `veyra-studio`

*Studio-Blau, ein gerahmtes Produkt, elektrisch-grüne Punkte zum Erkunden.* Ruhiges Studio-Blau, ein Produkt-Render in einem weißen Rahmen als Bühne. Elektrisch-grüne Hotspots öffnen beim Hover per Clip das Innere, Klick zoomt in eine Schnitt-Ansicht, Varianten-Panel für Farben und Räder. Space Grotesk nur in 400, Hierarchie über Größe und Abstand.

- **Passt zu:** Fahrzeug, Produkt-Design, Hardware, Industrie-Design, Konzeptstudie · Stimmung: premium, technisch, minimal · Ton: mid
- **Farben:** bg `#6b879d` · surface `#35586e` · text `#ffffff` · muted `#e1eaf0` · accent `#edff39` · accent2 `#708fa2`
- **Schriften:** Titel 'Space Grotesk' (400) · Text 'Space Grotesk' · Mono 'Space Grotesk'
- **Bewegung:** Titel `fade-up` · ruhig `fade-blur` · Kapitel `zoom-through` · Wow `morph-open` · Hintergrund `none` · Finish – · Hub `radial` · Modus `deck` · ruhig und präzise; Hover-Clips vorwärts bis zum Ende, dann rückwärts; Detail als Zoom-Überblendung
- **Signature-Szene:** `–`
- **Layout:** Kopfzeile (Wortmarke, Untertitel, Hinweis), Titelzeile, gerahmtes Bild über die volle Breite, vier Textspalten als Fußzeile, schmale Grundlinie.
- **Typo:** Space Grotesk 400 ausschließlich; Hierarchie nur über Größe und Abstand, kein Fett.
- **Bauteile:** Weißer 3-px-Rahmen (16 px Radius), 48-px-Hotspots mit grünen Scheiben und dünnem Plus, grüne Hover-Labels, blaues Varianten-Panel unterhalb des Bildes, grüner Zurück-Knopf mit Esc.
- **Bilder:** Freigestelltes Produkt-Render im Studio (gleicher Bildausschnitt für alle Varianten), kurze Hover-Clips vorwärts/rückwärts, Schnittbilder für Details.
- **Signature:** Die Produkt-Bühne: Hover öffnet das Innere, Klick zoomt in die Technik, Varianten wechseln ohne das Produkt zu verdecken.
- **Verboten:** Fettschrift · Kauf-Buttons, Preise, erfundene Leistungsdaten · Kartenraster · Panels über dem Produkt · Partikel/Glows

Steckbrief (für eigene Seiten / `type:"html"` und als Prompt):

> Richtung: Industrie-Design-Studie. Studio-Blau (#6B879D), Panel-Blau (#35586E), Weiß, Elektrisch-Grün (#EDFF39) nur für Hotspots und Zurück-Knopf. Space Grotesk ausschließlich 400. Ein Produkt-Render in einem weißen 3-px-Rahmen ist die Bühne; vier grüne Hotspots: Hover spielt einen kurzen Clip vorwärts (Haube öffnet), Verlassen spielt ihn rückwärts; Klick zoomt per Überblendung in eine Schnitt-Ansicht mit drei Bauteil-Punkten und Liste; Lack/Räder öffnen ein blaues Panel unterhalb des Bildes. Fußzeile mit vier Textspalten. Verboten: Fett, Preise, erfundene Daten, Kartenraster, Panels über dem Produkt.

## Bloom Garden · `bloom-garden`

*Eine Blüte aus Licht öffnet sich – floral, warm, hochwertig.* Cremiges Rosé, eine Blüte aus Tausenden Lichtpunkten öffnet sich Schicht für Schicht, Pollen schweben; große Instrument-Serif-Titel mit kursivem Akzentwort, ruhige Scroll-Story. Für florale, organische, wachsende Themen.

- **Passt zu:** Floral, Kosmetik, Garten, Gesundheit, Wachstum, Nachhaltigkeit mit Wärme, Events · Stimmung: warm, premium, natürlich · Ton: light
- **Farben:** bg `#f7efe9` · surface `#fffaf6` · text `#3a2630` · muted `#8a6b74` · accent `#d9577f` · accent2 `#e8a33d`
- **Schriften:** Titel 'Instrument Serif' (400) · Text 'Inter' · Mono 'JetBrains Mono'
- **Bewegung:** Titel `blur-words` · ruhig `fade-blur` · Kapitel `band-reveal` · Wow `ink-goo` · Hintergrund `none` · Finish grain · Hub `orbit` · Modus `scroll` · langsam wachsend; die Blüte öffnet sich 2 s, Pollen treiben
- **Signature-Szene:** `particles` · Shots: flower → flower → numeral → galaxy → flower
- **Layout:** Viel warmer Raum, Blüte rechts, Text links; Zitate groß und kursiv.
- **Typo:** Instrument Serif 400 für Titel (Akzentwort kursiv, Rosé), Inter für Text.
- **Bauteile:** Pillen-Buttons in Rosé, feine Haarlinien, runde Bild-Ausschnitte.
- **Bilder:** Blüten/Pflanzen als Partikel-Figur (embed particles) oder Duotone in Rosé; keine bunten Stockfotos.
- **Signature:** Die Lichtblüte, die sich Seite für Seite weiter öffnet; Kennzahlen aus Blütenpunkten.
- **Verboten:** Neon · harte Schnitte · kaltes Blau · Kartenraster

Steckbrief (für eigene Seiten / `type:"html"` und als Prompt):

> Richtung: florale Wärme. Cremiges Rosé (#F7EFE9), Rosé-Akzent (#D9577F), Honig (#E8A33D). Hauptdarsteller: eine Blüte aus Lichtpunkten, die sich Seite für Seite öffnet, Pollen treiben; Kennzahlen formen sich aus Blütenpunkten. Instrument Serif mit kursivem Akzentwort, Inter für Text, Pillen-Buttons. Langsame Scroll-Story. Verboten: Neon, harte Schnitte, kaltes Blau, Kartenraster.

## Lanka Heritage · `lanka-heritage`

*Gold, Sand, warmes Schwarz – antike Steine im Abendlicht.* Variante von Dark Portfolio für die Sri-Lanka-Keynote: gleiche Schriften und Bauteile, eigene Farbwelt.

- **Passt zu:** Persönliche Vorstellung, Experten-Profil, Agentur, Referenzen, Award-Einreichung · Stimmung: premium, editorial, dramatisch · Ton: dark
- **Farben:** bg `#0d0a07` · surface `#17110b` · text `#f4ece0` · muted `#a39478` · accent `#f4ece0` · accent2 `#d9a95a`
- **Schriften:** Titel 'Instrument Serif' (400) · Text 'Inter' · Mono 'JetBrains Mono'
- **Bewegung:** Titel `split-lines` · ruhig `fade-blur` · Kapitel `depth-dolly` · Wow `lens-sweep` · Hintergrund `none` · Finish grain, vignette · Hub `orbit` · Modus `deck` · langsam, filmisch, 1000–1300 ms, nichts federt
- **Signature-Szene:** `media`
- **Layout:** Titel groß unten links, Metadaten als Mono-Labels in den Ecken, Bildkarten schweben leicht schräg im Raum.
- **Typo:** Instrument Serif 400 für Titel (Akzentwort kursiv), Inter für Text, JetBrains Mono 10–11 px für Labels.
- **Bauteile:** Randlose Bildkarten mit feinem Rahmen, weiße Pillen-Buttons, Nummerierung 01/02 in Mono.
- **Bilder:** Freigestelltes Porträt im Zentrum, Arbeitsproben als schwebende Screens, Schwarzweiß erlaubt.
- **Signature:** Der 3D-Bogen aus Arbeitsproben dreht sich Seite für Seite weiter; kursives Serifen-Akzentwort.
- **Verboten:** Icon-Kacheln · Verläufe · schnelle Federn · mehr als zwei Schriftgrößen pro Seite

Steckbrief (für eigene Seiten / `type:"html"` und als Prompt):

> Richtung: filmisches Portfolio. Tiefes Schwarz (#0A0A0A), warmes Weiß (#F3F1EC), ein gedämpftes Messing (#C9A77A) als einziger Farbton. Schrift: Instrument Serif für Titel mit kursivem Akzentwort, Inter für Text, JetBrains Mono 10–11 px für Eck-Labels. Bauteile: schwebende Bildkarten mit feinem Rahmen, weiße Pillen-Buttons, Nummern 01/02. Bewegung: langsam und filmisch, Zeilen gleiten aus Masken, Kapitel depth-dolly, Wow lens-sweep, Korn und Vignette. Verboten: bunte Akzente, Icon-Kacheln, Verläufe, federnde Bewegung.

## Lanka Jungle & Highlands · `lanka-jungle`

*Tiefes Grün, Nebel, Moos – Regenwald und Teeland.* Variante von Dark Portfolio für die Sri-Lanka-Keynote: gleiche Schriften und Bauteile, eigene Farbwelt.

- **Passt zu:** Persönliche Vorstellung, Experten-Profil, Agentur, Referenzen, Award-Einreichung · Stimmung: premium, editorial, dramatisch · Ton: dark
- **Farben:** bg `#060b09` · surface `#0f1814` · text `#eaf1ea` · muted `#8ea596` · accent `#eaf1ea` · accent2 `#7fb88a`
- **Schriften:** Titel 'Instrument Serif' (400) · Text 'Inter' · Mono 'JetBrains Mono'
- **Bewegung:** Titel `split-lines` · ruhig `fade-blur` · Kapitel `depth-dolly` · Wow `lens-sweep` · Hintergrund `none` · Finish grain, vignette · Hub `orbit` · Modus `deck` · langsam, filmisch, 1000–1300 ms, nichts federt
- **Signature-Szene:** `media`
- **Layout:** Titel groß unten links, Metadaten als Mono-Labels in den Ecken, Bildkarten schweben leicht schräg im Raum.
- **Typo:** Instrument Serif 400 für Titel (Akzentwort kursiv), Inter für Text, JetBrains Mono 10–11 px für Labels.
- **Bauteile:** Randlose Bildkarten mit feinem Rahmen, weiße Pillen-Buttons, Nummerierung 01/02 in Mono.
- **Bilder:** Freigestelltes Porträt im Zentrum, Arbeitsproben als schwebende Screens, Schwarzweiß erlaubt.
- **Signature:** Der 3D-Bogen aus Arbeitsproben dreht sich Seite für Seite weiter; kursives Serifen-Akzentwort.
- **Verboten:** Icon-Kacheln · Verläufe · schnelle Federn · mehr als zwei Schriftgrößen pro Seite

Steckbrief (für eigene Seiten / `type:"html"` und als Prompt):

> Richtung: filmisches Portfolio. Tiefes Schwarz (#0A0A0A), warmes Weiß (#F3F1EC), ein gedämpftes Messing (#C9A77A) als einziger Farbton. Schrift: Instrument Serif für Titel mit kursivem Akzentwort, Inter für Text, JetBrains Mono 10–11 px für Eck-Labels. Bauteile: schwebende Bildkarten mit feinem Rahmen, weiße Pillen-Buttons, Nummern 01/02. Bewegung: langsam und filmisch, Zeilen gleiten aus Masken, Kapitel depth-dolly, Wow lens-sweep, Korn und Vignette. Verboten: bunte Akzente, Icon-Kacheln, Verläufe, federnde Bewegung.

## Lanka Coast · `lanka-coast`

*Türkis, Tiefblau, Sonnenuntergang – Meer und Küstenlicht.* Variante von Dark Portfolio für die Sri-Lanka-Keynote: gleiche Schriften und Bauteile, eigene Farbwelt.

- **Passt zu:** Persönliche Vorstellung, Experten-Profil, Agentur, Referenzen, Award-Einreichung · Stimmung: premium, editorial, dramatisch · Ton: dark
- **Farben:** bg `#050b0e` · surface `#0c161a` · text `#eaf4f3` · muted `#8aa6a8` · accent `#eaf4f3` · accent2 `#3fc7c0`
- **Schriften:** Titel 'Instrument Serif' (400) · Text 'Inter' · Mono 'JetBrains Mono'
- **Bewegung:** Titel `split-lines` · ruhig `fade-blur` · Kapitel `depth-dolly` · Wow `lens-sweep` · Hintergrund `none` · Finish grain, vignette · Hub `orbit` · Modus `deck` · langsam, filmisch, 1000–1300 ms, nichts federt
- **Signature-Szene:** `media`
- **Layout:** Titel groß unten links, Metadaten als Mono-Labels in den Ecken, Bildkarten schweben leicht schräg im Raum.
- **Typo:** Instrument Serif 400 für Titel (Akzentwort kursiv), Inter für Text, JetBrains Mono 10–11 px für Labels.
- **Bauteile:** Randlose Bildkarten mit feinem Rahmen, weiße Pillen-Buttons, Nummerierung 01/02 in Mono.
- **Bilder:** Freigestelltes Porträt im Zentrum, Arbeitsproben als schwebende Screens, Schwarzweiß erlaubt.
- **Signature:** Der 3D-Bogen aus Arbeitsproben dreht sich Seite für Seite weiter; kursives Serifen-Akzentwort.
- **Verboten:** Icon-Kacheln · Verläufe · schnelle Federn · mehr als zwei Schriftgrößen pro Seite

Steckbrief (für eigene Seiten / `type:"html"` und als Prompt):

> Richtung: filmisches Portfolio. Tiefes Schwarz (#0A0A0A), warmes Weiß (#F3F1EC), ein gedämpftes Messing (#C9A77A) als einziger Farbton. Schrift: Instrument Serif für Titel mit kursivem Akzentwort, Inter für Text, JetBrains Mono 10–11 px für Eck-Labels. Bauteile: schwebende Bildkarten mit feinem Rahmen, weiße Pillen-Buttons, Nummern 01/02. Bewegung: langsam und filmisch, Zeilen gleiten aus Masken, Kapitel depth-dolly, Wow lens-sweep, Korn und Vignette. Verboten: bunte Akzente, Icon-Kacheln, Verläufe, federnde Bewegung.
