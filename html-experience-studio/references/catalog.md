# Katalog (generiert aus `assets/library.json`, nicht von Hand bearbeiten)

Live ansehen und auswählen: `library.html`. Neu erzeugen: `python scripts/build_library.py`.
Kosten = Rechenlast: ● gering · ●● mittel · ●●● hoch.

## Design-Themes (16) · Feld `theme.design`

Komplette Designsprache (Tokens, Schriften, Bauteile, Bewegung, Verbote). Details: `references/design-themes.md`.

| ID | Name | Wirkung | Bewegung (Titel · ruhig / Kapitel / Wow · Hintergrund) | Stimmung |
|---|---|---|---|---|
| `keynote-glass` | Keynote Glass | Hell, Blau-Dunst, Milchglas – Produkt-Launch wie auf der Bühne. | blur-words · fade-blur / zoom-through / portal-dive · none | premium, ruhig, futuristisch |
| `product-mono` | Product UI Mono | Warmes Grau, Schwarz-Weiß-UI, Federn statt Glow. | rise · slide / card-stack / flip · none | minimal, technisch, seriös |
| `particle-tech` | Particle Tech | Schwarze Bühne, eine lebende Partikel-Skulptur, Mono-UI darüber – Forschungslabor-Keynote. | scramble · fade-blur / zoom-through / warp-tunnel · none | futuristisch, dramatisch, energetisch |
| `editorial-archive` | Editorial Archive | Papier-Creme, Serife, Regal-Rhythmus – wie ein Kulturmagazin. | mask-words · push-parallax / curtain-split / shatter · none | editorial, warm, seriös |
| `swiss-logistics` | Swiss Logistics | Weiß, schmale fette Riesentypo, Raster und Routen. | line-rise · slide / wipe-diagonal / shutter · none | energetisch, technisch, minimal |
| `data-transfer` | Data Transfer | Navy und Cyan, Datenfeld, Warp-Tunnel – Systeme, die zusammenlaufen. | rise · fade-blur / data-converge / warp-tunnel · none | technisch, futuristisch, premium |
| `nova-iris` | Nova Iris | Eine Iris aus Lichtfasern sieht dich an – und löst sich in fließende Glasfasern auf. | line-rise · fade-blur / zoom-through / portal-dive · none | futuristisch, premium, dramatisch |
| `velvion-health` | Velvion Health | Glühende DNA hinter einem Glas-Dashboard – Gesundheitsdaten als Kino. | rise · fade-blur / lens-sweep / zoom-through · none | premium, warm, dramatisch |
| `anchor-field` | Anchor Field | Partikel bauen einen Glas-Würfel, dann einen Baum – über einem Feld aus Wellenringen. | blur-words · fade-blur / data-converge / warp-tunnel · none | technisch, premium, futuristisch |
| `event-horizon` | Event Horizon | Ein Wirbel aus Licht hängt oben im Bild, darunter zentrierte Ruhe. | blur-words · fade-blur / zoom-through / warp-tunnel · stars | futuristisch, minimal, premium |
| `lumora-orb` | Lumora Orb | Eine leuchtende Flüssig-Kugel mit Galaxie im Inneren, umkreist von Glasblasen. | rise · fade-blur / portal-dive / warp-tunnel · stars | futuristisch, dramatisch, energetisch |
| `veyra-studio` | Veyra Studio | Studio-Blau, ein gerahmtes Produkt, elektrisch-grüne Punkte zum Erkunden. | fade-up · fade-blur / zoom-through / morph-open · none | premium, technisch, minimal |
| `bloom-garden` | Bloom Garden | Eine Blüte aus Licht öffnet sich – floral, warm, hochwertig. | blur-words · fade-blur / band-reveal / ink-goo · none | warm, premium, natürlich |
| `lanka-heritage` | Lanka Heritage | Gold, Sand, warmes Schwarz – antike Steine im Abendlicht. | split-lines · fade-blur / depth-dolly / lens-sweep · none | premium, editorial, dramatisch |
| `lanka-jungle` | Lanka Jungle & Highlands | Tiefes Grün, Nebel, Moos – Regenwald und Teeland. | split-lines · fade-blur / depth-dolly / lens-sweep · none | premium, editorial, dramatisch |
| `lanka-coast` | Lanka Coast | Türkis, Tiefblau, Sonnenuntergang – Meer und Küstenlicht. | split-lines · fade-blur / depth-dolly / lens-sweep · none | premium, editorial, dramatisch |

## 3D-Szenen (1) · Feld `scene.kind = model`

| ID | Name | Wirkung | Passt zu | Stimmung | Kosten |
|---|---|---|---|---|---|
| `model` | 3D-Modell als Held (GLB) | Echtes 3D-Modell über alle Seiten: Kamerafahrt pro Seite, Röntgen-Scan als Übergang, Bauteile leuchten, Annotationen am Objekt, Blaupause mit Explosionsansicht, Hologramm, Punktwolke. | Fahrzeug, Maschine, Gerät, Gebäude, Produkt – wenn ein physisches Objekt der Held ist (GLB aus Blender, CAD, Hersteller) | technisch, futuristisch, präzise, dramatisch | ●●● |

## Signature-Stücke (10) · Feld `Technik-Quelle (assets/signature, studio:sigkit)`

| ID | Name | Wirkung | Passt zu | Stimmung | Kosten |
|---|---|---|---|---|---|
| `planet-nasa` | Terra Dusk: die echte Erde aus dem Orbit | Die Erde mit NASA-Satellitenbildern auf einer Kugel, von einer tiefen Sonne beleuchtet: echte Kontinente und Städte (Black Marble) auf der Nachtseite, Wolken, die gegen den Boden driften und Schatten werfen, Sonnenglanz auf offenem Wasser, Relief aus echten Höhendaten, Atmosphäre mit Randlicht. Ziehen dreht mit Schwung, Hover = Kamera-Orbit, die Sonne sitzt am Zeiger und die Städte gehen hinter dem Terminator an. | Globale Präsenz, echte Standorte, Lieferketten, Klima, Raumfahrt, Netzwerke: überall, wo es die echte Erde sein muss | premium, dramatisch, technisch, ruhig | ●●● |
| `event-horizon` | Event Horizon: Schwarzes Loch | Echte Lichtablenkung um eine Masse: Akkretionsscheibe über und unter dem Schatten, Photonenring, verzerrte Sterne. Kepler-Rotation, Doppler-Aufhellung, Schwarzkörperfarben. Ziehen = Orbit mit Schwung. | Wow-Moment, Sog, Plattform als Gravitationszentrum, Kapitelöffner bei Disruption | dramatisch, futuristisch, premium | ●●● |
| `gear-train` | Gear Train: Getriebe, das wirklich greift | Fünf gefräste Zahnräder als Distanzfelder, korrekt verzahnt (Achsabstand, Übersetzung, Phase gelöst). Gedrehtes Metall mit anisotropem Glanz, Fase, Schatten, Okklusion. Zeiger = Lampe, Ziehen treibt an. | Portfolio-Zahnrad, Zusammenspiel der Bausteine, Operating Model, Engineering, Industrie | technisch, premium, seriös, minimal | ●● |
| `glass-orb` | Glass Orb: Vollglas mit Dünnschicht | Massive Glaskugel im Studio, echt gerechnet: Brechung hinein und hinaus, Totalreflexion, Dispersion an der Kante, Fresnel, dezente Irisierung. Der Boden steht in der Kugel auf dem Kopf, das Farblicht folgt dem Zeiger. | KI- oder Produkt-Hero, Klarheit, Vision, Premium-Opener | premium, minimal, futuristisch, ruhig | ●● |
| `silk` | Satin: Seide unter einem Licht | Fallende Seide als Höhenfeld mit anisotropem Ward-Glanz entlang der Fäden: lange Lichtbänder auf den Faltenkämmen, ruhiger Körper. Der Zeiger drückt eine weiche Delle ins Tuch. Hell oder dunkel. | Hintergrund für Luxus, Mode, Beauty, Private Banking, Einladungen; ruhig genug für Text | premium, ruhig, warm, editorial | ● |
| `light-curtain` | Light Curtain: Licht steigt vom Boden | Drei Tiefenebenen aus Lichtstrahlen über einer heißen Bodenlinie, wie Polarlicht von der Seite oder Bühnenlicht im Dunst. Der Vorhang neigt sich zum Zeiger, die Ebenen verschieben sich mit Parallaxe. | Keynote-Opener, Launch, Bühne, Kapitelwechsel; obere 55 % bleiben frei für Titel | dramatisch, premium, futuristisch | ● |
| `caustics` | Caustic Pool: Licht unter Wasser | Echte Kaustik: Sonnenlicht, gebündelt von einer bewegten Wasseroberfläche. Helligkeit = Flächenverzerrung 1/|det(I + k Hesse h)|, alles analytisch. Unter dem Zeiger sammelt eine Wasserlinse das Licht. | Nachhaltigkeit, Wasser, Gesundheit, Wellness, Hotel, Transparenz | ruhig, natürlich, premium | ● |
| `fluted-glass` | Fluted Glass: Riffelglas vor Farblicht | Weiches Farblicht hinter geriffeltem Glas: jede Riffel staucht und spiegelt das Bild, R/G/B brechen leicht verschieden, Glanzlinie und Fuge je Riffel, feiner Frost. Eine Lampe hinter der Scheibe folgt dem Zeiger. | Produkt- oder Software-Launch, Tech-Marke, Event-Opener, Wallpaper-Ästhetik | premium, futuristisch, minimal, energetisch | ● |
| `ridge-lines` | Ridge Lines: Gebirge aus Schnittlinien | Ein Gebirge nur aus Querschnitten, in echter Perspektive überflogen. Verdeckte Linien sind wirklich verdeckt, Gipfel tragen die Akzentfarbe wie Höhenangaben. Die Kamera neigt und dreht sich zum Zeiger. | Strategie, Weg nach vorn, Daten, Engineering, Expedition, Energie | technisch, ruhig, seriös, minimal | ●● |
| `dot-lens` | Dot Lens: Rasterdruck unter der Lupe | Halbton-Raster auf warmem Papier, der Tonwert atmet langsam. Eine Lupe am Zeiger vergrößert tonnenförmig, färbt die Mitte im Akzent, mit Glaskante und Kontaktschatten. Das helle Stück der Serie. | Helle Decks: Editorial, Swiss, Research, Bericht, genauer hinsehen | editorial, minimal, seriös, ruhig | ● |

## Referenz-Welten (3) · Feld `Moodboard · references/worlds.md (kein Seitentyp)`

| ID | Name | Wirkung | Passt zu | Stimmung | Kosten |
|---|---|---|---|---|---|
| `scroll-stage` | Scroll-Bühne mit Film und Hairline-Rahmen | Eine gepinnte Bühne, ein Film aus Licht und eine einzige Zahl p treiben alles: Maskentypografie, gerichtete Austritte, Linien und Sterne als Rahmen, Lineal mit wandernder Kennzahl, 3D-Karussell mit Tiefenunschärfe, Glas-Formular. | Firmen-, Produkt- oder Partnerseite, Pitch als Scroll-Story: überall, wo ein starkes Objekt und kurze Sätze tragen | dramatisch, premium, editorial, minimal, warm | ●● |
| `moonlit-petals` | Moonlit Petals: Nachtblüte im Gegenlicht | Prozedurale Blütenkrone, einmal gebacken und danach nur komponiert: Schärfentiefe, Glühen, Dolden an Federn, Blütenblätter in Tiefenebenen, Bokeh, Korn. Der Zeiger verzieht die Krone weich wie Wind. | Ruhige Hero-Fläche ohne Text, Einladung, Kosmetik, Hotel, Wellness, Danke-Seite: Stimmung statt Information | ruhig, natürlich, premium, dramatisch, warm | ●●● |
| `vinyl-supernova` | Vinyl Supernova: Partikel-Zeitleiste | 36.000 Partikel formen eine Schallplatte, zerfallen in einen Wirbel, werden zur Wolke und bauen sich magnetisch wieder auf. Eine Zeitleiste, sechs Regler, Bloom, Spuren, Korn. | Musik, Audio, Medien, Produkt-Teaser; Loop als Hero oder Übergang für alles, was zerfallen und wiederkehren soll | dramatisch, futuristisch, energetisch, technisch | ●●● |

## Hintergründe (4) · Feld `bg.id`

| ID | Name | Wirkung | Passt zu | Stimmung | Kosten |
|---|---|---|---|---|---|
| `flow-field` | Strömungsfeld | Hunderte Partikel folgen einem unsichtbaren Strömungsfeld und hinterlassen Spuren. | Transformation, Energie, Bewegung, Kunst | natürlich, premium, dramatisch | ●●● |
| `noise-mesh` | Mesh mit Korn | Mesh-Gradient mit feinem Filmkorn, editorial. | Agentur, Design, Premium-Editorial | editorial, premium | ● |
| `datafield` | Datenfeld | Netz mit Datenpaketen, dazu Ströme, die ins Fokus-Element der aktiven Seite zusammenlaufen und ihm folgen. | SDV, Plattform, KI, Daten; passt zu warp-tunnel und data-converge | technisch, futuristisch, premium | ●● |
| `light-tunnel` | Lichtkorridor | Endloser Korridor aus Lichtrahmen fliegt langsam auf dich zu, leichte Maus-Parallaxe. | Keynote, Launch, Vision, Titelseite | futuristisch, dramatisch, minimal | ● |

## Text-Animationen (17) · Feld `page.enter`

| ID | Name | Wirkung | Passt zu | Stimmung | Kosten |
|---|---|---|---|---|---|
| `mask-words` | Wörter aus Maske | Wörter gleiten einzeln aus einer unsichtbaren Kante hoch. | Hero, Kapiteltitel (Allrounder) | premium, seriös, dramatisch | ● |
| `blur-words` | Aus der Unschärfe | Wörter werden aus Unschärfe scharf. | Statements, Zitate, ruhige Looks | ruhig, premium | ● |
| `chars` | Buchstabenwelle | Buchstaben steigen nacheinander auf. | Kurze Titel (1–3 Wörter) | technisch, energetisch | ● |
| `fade-up` | Einblenden | Schlicht von unten einblenden. | Fließtext, viele Seiten, seriöser Ton | minimal, seriös | ● |
| `scramble` | Entschlüsseln | Zeichen rauschen und entschlüsseln sich zum Wort. | Security, KI, Daten (1–2× pro Deck) | technisch, futuristisch | ● |
| `typewriter` | Schreibmaschine | Text wird mit Cursor getippt. | Prompts, Dialoge, Code | technisch, retro, verspielt | ● |
| `split-lines` | Zeilenweise | Ganze Zeilen kippen nacheinander aus der Maske. | Lange Titel, Editorial, Manifest | editorial, premium | ● |
| `rotate-words` | Wörter klappen auf | Wörter klappen in 3D von unten nach oben. | Aufzählungen im Titel, Produktclaims | energetisch, verspielt | ● |
| `zoom-words` | Wörter zoomen ein | Wörter fallen groß und unscharf auf ihren Platz. | Laute Aussage, Event, Opener | dramatisch, energetisch | ● |
| `blur-chars` | Funkeln | Buchstaben werden in zufälliger Reihenfolge scharf. | Luxus, Beauty, ruhige Enthüllung | premium, ruhig | ● |
| `wave-chars` | Federnde Welle | Buchstaben federn mit leichtem Überschwingen herein. | Consumer, Kinder, Startup | verspielt, warm | ● |
| `tracking-in` | Zusammenziehen | Weit gesperrte Buchstaben ziehen sich zusammen. | Mode, Luxus, Film-Titel | premium, dramatisch, minimal | ● |
| `shine` | Glanzlicht | Ein Lichtband läuft einmal über den Titel. | Award, Premium-Produkt, Abschluss | premium, dramatisch | ● |
| `underline-draw` | Linie zeichnet sich | Titel blendet ein, eine Akzentlinie zeichnet sich darunter. | Beratung, seriös, Kapitel | seriös, minimal, editorial | ● |
| `rise` | Ruhiges Aufsteigen | Der ganze Titel steigt 18 px in 1,1 s weich auf. Standard des Studio-Looks. | Standard für fast alle Seiten, seriös und hochwertig | premium, seriös, ruhig, minimal | ● |
| `word-rise` | Wort für Wort aus der Unschärfe | Jedes Wort steigt 16 px aus 12 px Unschärfe, alle 60 ms das nächste. | Abschlusskarten, Kernbotschaft, Film-Titel | premium, dramatisch, futuristisch | ● |
| `line-rise` | Zeilen aus der Unschärfe | Zeilen steigen nacheinander aus der Unschärfe auf. | Mehrzeilige Statements, Kapitel-Opener | premium, editorial, ruhig | ● |

## Übergänge (20) · Feld `nav.transition / page.transition`

| ID | Name | Wirkung | Passt zu | Stimmung | Kosten |
|---|---|---|---|---|---|
| `fade-blur` | Weiche Blende | Überblenden mit leichter Unschärfe. | Standard innerhalb eines Kapitels | ruhig, minimal, seriös | ● |
| `slide` | Schieben | Seitlich schieben, Richtung folgt vor/zurück. | Lineare Story | minimal, seriös | ● |
| `push-parallax` | Parallax-Push | Alte Seite weicht dunkler zurück, neue schiebt sich darüber. | Kapitelwechsel, Roadmap | premium, editorial | ● |
| `push-up` | Hochschieben | Vertikaler Push, fühlt sich wie Scrollen an. | Decks, die wie eine Webseite wirken sollen | minimal, ruhig | ● |
| `zoom-through` | Durchzoomen | Durch die alte Seite hindurch in die neue. | Tiefer eintauchen, Kapitel-Wow | dramatisch, futuristisch | ● |
| `clip-circle` | Kreis-Enthüllung | Neue Seite wächst kreisförmig aus dem Klickpunkt. | Fokus, Reveal, Antwort auf Frage | verspielt, premium | ● |
| `wipe-diagonal` | Diagonaler Wisch | Schräge Kante wischt die neue Seite herein. | Tempo, Tech, Editorial | energetisch, technisch | ● |
| `warp` | Hyperspace (leicht) | Flache Lichtstreifen aus der Mitte, alte Seite fliegt vorbei. Für den großen Sprung: warp-tunnel. | Sprung in eine neue Welt (max. 1–2× pro Deck) | futuristisch, dramatisch, energetisch | ●● |
| `depth-dolly` | Kamerafahrt 3D | Alte Seite fällt in die Tiefe und dreht weg. | Szenenwechsel, Problem → Lösung | dramatisch, premium | ● |
| `lens-sweep` | Linsenschwenk | Ein Glasband fährt über die Seite, darunter tauscht der Inhalt. | Fokuswechsel, ruhig-premium | premium, ruhig | ●● |
| `card-stack` | Kartenstapel | Alte Seite wird zur Karte, neue gleitet von unten darüber (iOS). | App-/Produkt-Decks, Detailebene | minimal, premium | ● |
| `band-reveal` | Horizontöffnung | Ein Band öffnet sich von der Mittellinie. | Film-Opener, Cinematic | dramatisch, premium | ● |
| `shared` | Wandernder Titel | Titel oder Zahl mit gleichem shared-Key fliegt von Seite A zu Seite B. (automatisch: page.shared = "key" auf beiden Seiten) | Aussage → Beleg; ruhigster Profi-Übergang | premium, seriös, minimal | ● |
| `morph-open` | Karten-Morph | Detailseite wächst aus der geklickten Karte bzw. dem Knoten und schrumpft zurück. (automatisch: items[].to = "subId") | Übersicht → Detail (Karten, Hub, Bento) | premium, verspielt | ● |
| `warp-tunnel` | Datentransfer-Warp | Sturzflug in das Fokus-Element der alten Seite, 3D-Lichttunnel mit Tiefe, dann laufen Datenströme im Fokus der neuen Seite zusammen und sie baut sich aus der Tiefe auf (~2,3 s). | Der eine Kapitel-Wow: z. B. Cockpit → Portfolio, Problem → Lösung. Fokus per data-focal setzen. Max. 1× pro Deck | futuristisch, dramatisch, technisch | ●●● |
| `data-converge` | Datenströme | Lichtpakete fließen auf geschwungenen Bahnen ins Fokus-Element der neuen Seite, die sich als Kreis daraus öffnet. | Plattform, Daten, „alles läuft zusammen“, Hub/Übersicht | technisch, futuristisch, premium | ●● |
| `portal-dive` | Portal-Flug | Leuchtender Ring öffnet sich am Klickpunkt, die neue Seite ist darin schon sichtbar, dann fliegt die Kamera hindurch. | Deep Dive aus einer Übersicht, Eintritt in eine neue Welt | futuristisch, dramatisch, verspielt | ●● |
| `shatter` | Glasbruch | Risse laufen vom Klickpunkt, die alte Seite zerspringt in Scherben, die an der Kamera vorbeifliegen. | Bruch mit dem Status quo, „alte Welt“ → neue Lösung (max. 1×) | dramatisch, energetisch | ●● |
| `ink-goo` | Flüssige Tinte | Akzent-Tinte quillt aus dem Klickpunkt, verschmilzt flüssig und deckt den Bildschirm, dann läuft sie ab. | Marken-Moment, Kapitelwechsel mit Charakter, Consumer/Kreativ | verspielt, energetisch, premium | ●● |
| `scan-reveal` | Scan-Linie | Leuchtende Laser-Linie scannt über die Seite, dahinter liegt schon die neue (Röntgen-/Diagnose-Gefühl). | Analyse, Ist-Aufnahme, „jetzt sehen wir, was darunter liegt“ | technisch, futuristisch, seriös | ● |

## Interaktion & Finish (11) · Feld `theme.fx[]`

| ID | Name | Wirkung | Passt zu | Stimmung | Kosten |
|---|---|---|---|---|---|
| `grain` | Filmkorn | Feines analoges Korn über allem. | Dunkle Premium-Looks, Editorial | premium, editorial, retro | ● |
| `glass` | Milchglas | Karten werden zu Glas mit Unschärfe und Lichtkante. | Über bewegten Hintergründen | premium, futuristisch | ●● |
| `gradient` | Titel-Verlauf | Titel laufen nach unten weich aus. | Große Headlines, dunkle Themes | premium, dramatisch | ● |
| `vignette` | Vignette | Ränder dunkeln ab, der Blick geht zur Mitte. | Cinematic, Bühne, Fokus | dramatisch, premium | ● |
| `scanlines` | Bildschirmzeilen | Feine Zeilen wie auf einem Röhrenmonitor. | Retro, Gaming, Security | retro, technisch | ● |
| `outline-cards` | Konturkarten | Karten ohne Fläche, nur feine Kontur. | Minimal, Swiss, helle Themes | minimal, editorial | ● |
| `tilt` | 3D-Neigung | Karten neigen sich zum Cursor, mit wanderndem Glanz. | Portfolio, Produktkarten, Webseiten | verspielt, premium | ● |
| `magnetic` | Magnetische Buttons | Buttons und Knoten ziehen sich leicht zum Cursor. | Interaktive Webseite, CTA | verspielt, premium | ● |
| `cursor-glow` | Cursor-Licht | Weiches Akzentlicht folgt dem Mauszeiger. | Dunkle Themes, Live-Präsentation | futuristisch, dramatisch | ● |
| `parallax` | Tiefen-Parallax | Titel und Inhalt verschieben sich gegenläufig zur Maus. | Hero, Kapitel, Tiefe ohne 3D | premium, verspielt | ● |
| `click-ripple` | Klick-Welle | Klicks erzeugen eine Farbwelle im Element. | Interaktive Demos, Touch | verspielt | ● |

## Layouts & Seitentypen (21) · Feld `page.type`

| ID | Name | Wirkung | Passt zu | Stimmung | Kosten |
|---|---|---|---|---|---|
| `hero` | Hero / Opener | Großer Titel, Lead, optional Button. | Start, Kapitelanfang | dramatisch, premium | ● |
| `statement` | Statement | Eine Aussage, zentriert, viel Luft. | These, Haltung, Kapitelfazit | minimal, editorial | ● |
| `number` | Eine große Zahl | Riesige Zahl zählt hoch, darunter die Bedeutung. | Der eine Beleg, der zählt | dramatisch, minimal | ● |
| `stats` | Kennzahlen | 2–4 Zahlen zählen hoch. | Business Case, Ergebnisse | seriös, technisch | ● |
| `chart` | Diagramm (Balken → Linie) | Balken wachsen und morphen auf Klick zur Linie. | Wachstum, Entwicklung | seriös, technisch | ● |
| `cards` | Karten | Raster mit Lichtfleck beim Hover, optional Link zur Detailseite. | Leistungen, Optionen, Hebel | seriös, premium | ● |
| `bento` | Bento-Raster | Asymmetrische Kacheln setzen sich von der Mitte zusammen. | Viele Aussagen auf einer Seite, Produktüberblick | premium, verspielt | ● |
| `split` | Text + Visual | Text links, Visual rechts (Ring, Fluss, Bild, Gerät, Vergleich, Diagramm). | Erklären mit Bild | seriös, minimal | ● |
| `timeline` | Zeitstrahl | Linie zeichnet sich, Meilensteine erscheinen. | Roadmap, Historie, Plan | seriös, ruhig | ● |
| `steps` | Tabs / Schritte | Reiter mit Inhalt, z. B. Problem / Lösung / Mehrwert. | Argumentationskette, Prozess | seriös, minimal | ● |
| `big-list` | Große Liste | Große Zeilen, die aktive leuchtet nacheinander auf. | Prinzipien, Agenda, Versprechen | editorial, premium, minimal | ● |
| `kinetic` | Kinetische Typo | Riesige Wörter laufen gegenläufig über den Bildschirm. | Opener, Kapitel, Markenwerte | energetisch, dramatisch, editorial | ● |
| `marquee` | Laufband | Zwei gegenläufige Bänder mit Begriffen oder Namen. | Kompetenzen, Partner, Themen | verspielt, energetisch | ● |
| `hub` | Hub / Portfolio-Übersicht | Knoten um einen Kern; Klick öffnet Detailseite mit Morph. Stile: orbit, gear (Zahnrad), radial, constellation. | Nur wenn Inhalte echte Bereiche/Hebel sind | technisch, premium | ● |
| `gallery` | Bildergalerie | Bilder decken sich mit Wischblende auf. | Referenzen, Eindrücke, Moodboard | editorial, warm | ● |
| `team` | Team / Experten | Personenkarten mit Foto oder Initialen. | Ansprechpartner, Experten-Outro | warm, seriös | ● |
| `quote` | Zitat | Großes Zitat mit Absender. | Stimme des Kunden (nur echte Zitate) | ruhig, editorial | ● |
| `media` | Vollbild-Medium | Bild oder Video füllt die Seite, Text darüber. | Emotion, Ort, Produkt | dramatisch, warm | ●● |
| `cta` | Abschluss / CTA | Klare Handlung plus Kontakte. | Ende, Next Steps | seriös, minimal | ● |
| `html` | Eigenes HTML | Freies Markup, wenn der Katalog nicht reicht. | Sonderfälle, eingebettete Demos |  | ● |
| `hotspots` | Produkt-Bühne (Hotspots) | Gerahmtes Produktbild mit Punkten: Hover spielt einen Clip (z. B. Haube öffnet), Klick zoomt in eine Schnitt-Ansicht mit Bauteilen, Varianten-Panel für Farben/Felgen. Eigene Renders und Clips. | Produkt, Fahrzeug, Maschine, Gerät, Gebäude zum Erkunden | technisch, premium, minimal | ●● |

## Kamera & Film (6) · Feld `page.type`

| ID | Name | Wirkung | Passt zu | Stimmung | Kosten |
|---|---|---|---|---|---|
| `flyover` | UI-Überflug | Eine durchgehende Kamerafahrt über eine liegende Seite: Gleiten mit Tiefenunschärfe, Karten heben sich und stellen sich zur Linse auf, Aufstieg in die Draufsicht, Sturzflug in den Hero, Abschlusstitel Wort für Wort. | Produkt- oder Plattform-Opener, Launch, Website/App zeigen (Wow, 1× pro Deck) | dramatisch, premium, futuristisch | ●●● |
| `lift-cards` | Karten stellen sich auf | Karten liegen auf einem geneigten Boden und stellen sich nacheinander mit Schatten zur Kamera auf. | 3–6 Hebel, Leistungen, Features mit Tiefe statt flachem Raster | premium, technisch, dramatisch | ● |
| `end-card` | Abschlusskarte | Eine Karte landet aus der Tiefe unter einem zweiteiligen Titel: Aussage plus kursiver grauer Nachsatz, Wort für Wort. | Finale, Produktreveal, Claim am Ende | premium, dramatisch, minimal | ● |
| `device-float` | Schwebendes Gerät | Ein Handy mit echter Tiefe steigt auf, dreht sich sanft; Chips schweben in verschiedenen Tiefen mit Unschärfe. | App-Feature zeigen, Mobile-Produkt, Reveal | premium, futuristisch, verspielt | ● |
| `particle-form` | Partikel formen Zahl | Tausende Punkte driften, ziehen sich zu einer Zahl oder einem Wort zusammen, halten, zerfallen. | Die eine Zahl, Launch-Claim, Kapitel-Opener (nur echte Werte) | futuristisch, technisch, dramatisch | ●● |
| `depth-stack` | Ebenen-Stapel 3D | Architektur-Ebenen schweben in 3D auseinander, Beschriftungen zeichnen sich ein. | Architektur, Plattform-Schichten, Tech-Stack | technisch, premium | ● |

## Visuals (in split) (6) · Feld `page.visual.type`

| ID | Name | Wirkung | Passt zu | Stimmung | Kosten |
|---|---|---|---|---|---|
| `ring` | Fortschrittsring | Ring füllt sich, Zahl zählt hoch. | Reifegrad, Score, Anteil | seriös, technisch | ● |
| `flow` | Prozessfluss | Knoten mit laufenden Impulsen dazwischen. | Architektur, Prozess, Datenfluss | technisch | ● |
| `device` | Gerät (Browser/Phone) | Screenshot im Geräterahmen, scrollt langsam. | Software, App, Webseite zeigen | premium, technisch | ● |
| `compare` | Vorher / Nachher | Schieberegler vergleicht zwei Zustände. | Redesign, Wirkung, Transformation | verspielt, seriös | ● |
| `image` | Bild | Bild mit sanftem Zoom. | Foto, Illustration, Render | warm, editorial | ● |
| `chart` | Diagramm im Split | Diagramm neben Text (bars/line/morph). | Zahl mit Erklärung | seriös | ● |

## Look-Kombinationen (8) · Feld `theme + nav + bg + enter`

| ID | Name | Wirkung | Theme · Modus · Hintergrund · Übergang · Titel · Finish | Stimmung |
|---|---|---|---|---|
| `look-studio` | Studio (Standard) | Der Mindeststandard: ruhige dunkle Welt, Inter, linksbündig, Eyebrow mit Linie, weiche lange Einblendungen. | midnight · deck · none · fade-blur · rise · grain | premium, seriös, ruhig |
| `look-cinematic` | Cinematic Dark | Dunkel, filmisch, Tiefe. | midnight · deck · beams · band-reveal · split-lines · grain, vignette | dramatisch, premium |
| `look-editorial` | Clean Editorial | Hell, Serifen, Magazin. | paper · scroll · none · push-parallax · split-lines · outline-cards | editorial, minimal |
| `look-luxury` | Noir Gold | Schwarz und Gold, gesperrte Titel. | noir-gold · deck · bokeh · lens-sweep · tracking-in · grain, vignette | premium, dramatisch |
| `look-swiss` | Swiss Minimal | Weiß, Raster, ein Signalrot. | swiss-light · deck · none · slide · underline-draw · outline-cards | minimal, seriös |
| `look-nature` | Nature Calm | Grün, Konturlinien, ruhig. | forest-signal · scroll · topo · fade-blur · blur-words · grain | natürlich, ruhig |
| `look-clinic` | Clinic Light | Hell, Mint, Seidenwellen. | clinic-mint · scroll · wave-lines · fade-blur · fade-up · – | ruhig, seriös |
| `look-data` | Data Lab | Punktwelle, Entschlüsseln, präzise. | midnight · deck · dot-wave · tiles · scramble · glass, cursor-glow | technisch, futuristisch |

## Themes (`theme.preset`)

| Preset | Schrift | Hintergrund | Akzent | Notiz |
|---|---|---|---|---|
| `midnight` | grotesk | #05070c | #5fd6ff | Neutral dark, cyan accent. Safe default. |
| `capgemini-invent` | grotesk | #050b18 | #12abdb | Approximation of Capgemini Invent look (vibrant blue on deep navy). Verify against the current CI guide before client use. |
| `paper` | editorial | #f6f3ee | #0b5fff | Neutral light, editorial, ink on warm white. |
| `aurora-violet` | humanist | #0a0716 | #b794ff | Soft violet/pink glow, calm premium. |
| `warm-sand` | humanist | #100c08 | #ffb35c | Warm dark, amber accent: retail, hospitality, consumer. |
| `forest-signal` | tech | #05100c | #5af2a0 | Deep green, lime signal: energy, sustainability, agri. |
| `steel-finance` | grotesk | #0a0d11 | #45d0c2 | Cool graphite with restrained teal: finance, insurance, public. |
| `noir-gold` | editorial | #0a0907 | #d8b26a | Black and warm gold: luxury, private banking, awards. |
| `swiss-light` | grotesk | #f7f7f5 | #e3262e | White, strict grid feel, one signal red. |
| `synth-sunset` | tech | #0e0716 | #ff4fb8 | Retro neon: magenta and orange on deep purple. |
| `clinic-mint` | humanist | #f3f8f7 | #0f9d8a | Light, calm mint and blue: health, pharma, insurance. |
| `terracotta` | editorial | #f4ece2 | #c4562d | Warm light editorial: clay, sand, ink. |
| `mono-ink` | grotesk | #0b0b0b | #ffffff | Pure black and white, no colour; type does the work. |

Eigene Farben: jedes Feld (`bg surface text muted line accent accent2 onAccent font`) im Brief überschreiben.
Hub-Stile (`style` bei `type:"hub"`): `orbit` (Standard, neutral) · `constellation` · `radial` · `gear` (nur Technik/Maschine).
