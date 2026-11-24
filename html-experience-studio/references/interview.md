# Briefing: alles in einer Nachricht, dann ein Regiebuch, dann bauen

Ziel: **eine** Frage-Runde, **eine** Freigabe, danach ein Ergebnis, das beim ersten Zeigen sitzt.
Jede zusätzliche Runde kostet Tokens und Geduld. Darum gilt:

- **Nie einzeln nachfragen.** Alles, was fehlt, kommt gesammelt in den Briefing-Bogen (§1).
- **Vorausfüllen statt fragen.** Erst alle Unterlagen lesen, dann den Bogen mit allem füllen, was dort schon steht
  (markiert mit `✓`). Der Nutzer korrigiert nur noch und ergänzt Lücken.
- **Leeres Feld = Claude entscheidet.** Jeder Standard steht im Bogen (in Klammern); der Nutzer muss nichts ausfüllen,
  was ihm egal ist. Die Entscheidung wird im Regiebuch begründet und ist dort mit einem Wort änderbar.
- **Inhalt kommt nur vom Nutzer.** Titel, Texte, Zahlen, Namen, Bilder stammen aus Bogen und Unterlagen. Library, Themes,
  Referenz-Welten und Beispielprojekte liefern **nur Technik und Richtung**, nie Text, nie Platzhalter, nie ihre Motive
  (`scripts/leakcheck.py` prüft das vor der Lieferung).
- Nie Zahlen, Zitate, Namen, Logos erfinden. Fehlt ein Beleg: `[TBD]`.

## §1 Der Briefing-Bogen (so senden; Vorausgefülltes eintragen, Bekanntes weglassen)

Vorlage zum Kopieren für den Nutzer: `BRIEF-VORLAGE.md` im Skill-Ordner (gleiche Struktur).
Die Nachricht hat genau diese Form, kompakt, ohne Erklär-Absätze:

> Damit es beim ersten Wurf sitzt, brauche ich einmal alles auf einen Blick. Was ich aus deinen Unterlagen schon weiß,
> steht drin (✓). **Leere Felder entscheide ich** (Standard in Klammern). Antworte mit den Nummern, z. B. „B1: …“.
> Oder schreib **„Autopilot“**, dann entscheide ich alles und zeige dir nur das Regiebuch.
>
> **A · Rahmen**
> A1 Anlass und Datum · A2 Publikum (wer, wie viele, Haltung) · A3 **Gewünschte Entscheidung danach** (z. B. „Budget für Pilot freigeben“)
> A4 Einsatz: live / Link / Messe / Leave-behind (live + Link) · A5 Dauer oder Seitenzahl (8 live, 6 Link)
> A6 Sprache · A7 Bauart: **Erlebnis-Hub** (Intro → Story → Hauptseite → Unterseiten → Outro) / Klick linear / Scroll-Seite (Erlebnis-Hub)
>
> **B · Botschaft**
> B1 Ein Satz, den der Vorstand danach wiederholt · B2 Drei Belege (Zahl + Quelle) · B3 Größter Einwand und unsere Antwort
>
> **C · Welt und Design (gilt für alles)**
> C1 Grundgefühl in 3 Wörtern · C2 hell / dunkel · C3 CI: Farben, Schrift, Logo
> C4 **Hauptdarsteller** (das eine Ding, das nur zu diesem Thema gehört, z. B. „unser Fahrzeug“, „Globus mit unseren 14 Standorten“)
> C5 Library-Auswahl (IDs aus `library.html`, z. B. `sig:gear-train`) und/oder Referenzen (URL, Screenshot + was daran gefällt)
>
> **D · Titelseite**
> D1 Titel (≤ 8 Wörter) · D2 Unterzeile · D3 Absender, Datum, Logo · D4 Was ist zu sehen? (Hauptdarsteller im Wow-Licht)
> D5 Wie beginnt es? (z. B. „aus dem Schwarz steigt der Globus auf, dann der Titel“)
>
> **E0 · Hauptseite** – **Hauptobjekt nach deiner Wahl** (Zahnrad, Pyramide, Roboter mit klickbaren Bauteilen, Turm,
> Rakete, Landkarte, eigenes; leer = ich schlage drei vor), Bereiche (Name · Gruppe), Story davor (2–4 Seiten)
>
> **E · Seiten** – eine Zeile pro Story- oder Unterseite. Nur ausfüllen, was dir wichtig ist; den Rest entscheide ich.
>
> | # | Kernaussage (≤ 8 Wörter) | Inhalt (Fakten, Zahlen, Bilder) | Visual / Design | Design-Element **+ wo** | Interaktion | Übergang dorthin |
> |---|---|---|---|---|---|---|
> | 1 | ✓ … | ✓ … | | z. B. Zahnrad rechts, 6 Zähne = 6 Bereiche | z. B. Klick auf Zahn → Bereich | innen / Kapitel / **Wow** + was er erzählt |
>
> Design-Elemente (oder eigene): Zahnrad (`sig:gear-train`), Globus (`sig:planet-nasa`), Glas-Kugel (`sig:glass-orb`),
> Schwarzes Loch (`sig:event-horizon`), Gebirge aus Linien (`sig:ridge-lines`), Seide (`sig:silk`), Lichtvorhang
> (`sig:light-curtain`), Wasserlicht (`sig:caustics`), Riffelglas (`sig:fluted-glass`), Raster-Lupe (`sig:dot-lens`),
> 3D-Modell (GLB), Partikel-Form, Zeitstrahl, Karte, Diagramm. **Wo:** Hintergrund · Held · als Diagramm · im Übergang.
>
> **F · Outro**
> F1 Schlusssatz · F2 **Nächster Schritt** (was, wer, bis wann) · F3 Kontakte (Name, Rolle, Foto ja/nein)
> F4 Backup-Seiten für Fragen (2–3, nur über die Übersicht erreichbar)
>
> **G · Pflicht und Verbote** – Must-haves, No-gos, Compliance, wer gibt frei
>
> **H · Material** – was liegt bei, was fehlt, wie ich deine Dateien einbaue (Tabelle §3); Fehlendes baue ich im Code oder in Blender (keine Zusatzkosten).
>
> **I · Ausgabe** – Sprechernotizen (ja) · PDF/Leave-behind (Standbilder-PDF) · personalisiert für einen Kunden (Name/Logo)?

Regeln für den Bogen
- **Genau eine Nachricht.** Was aus den Unterlagen klar ist, steht vorausgefüllt drin und wird nicht gefragt.
- Abschnitt E bekommt so viele Zeilen wie vorgeschlagene Seiten, vorausgefüllt mit dem, was die Unterlagen hergeben.
- Medien (§3) und Fakten-Lücken stehen **im selben Bogen** (Abschnitt H), keine zweite Runde.

## §2 Antwort prüfen (still, ohne neue Fragerunde)

Nach der Antwort **nicht zurückfragen**, sondern Lücken selbst schließen und direkt ins Regiebuch (§4) gehen:

| Lücke | Was Claude tut |
|---|---|
| B1 vage („Präsentation über SDV“) | Kernsatz aus den Unterlagen formulieren, im Regiebuch als **Annahme** markieren |
| A3 fehlt | Entscheidung aus dem Anlass ableiten, als Annahme markieren; das Outro darauf bauen |
| C1/C4 vage („modern“) | Hauptdarsteller aus dem Thema ableiten (Wettbewerber-Test, `craft-bar.md` Teil D) |
| E-Zeilen leer | Seite aus den Unterlagen bauen, eine Idee pro Seite, Komposition wechseln |
| Zahl ohne Quelle | `[TBD]` im Text, Liste „offene Belege“ im Regiebuch |

Nur wenn **Botschaft (B1) und Publikum (A2) beide** fehlen und nicht aus den Unterlagen ableitbar sind: eine einzige
Rückfrage mit genau diesen zwei Punkten. Sonst nie.

## §3 Eigene Dateien einbetten (Teil von Abschnitt H, gleiche Nachricht)

Pro Datei eine Empfehlung **aus der gewählten Welt** in einer Zeile; der Nutzer bestätigt mit der Bogen-Antwort:

| Datei | Empfehlung | Warum | Alternative |
|---|---|---|---|
| fahrzeug.glb | GLB-Held über alle Szenen, Röntgen-Scan zeigt den Akku | ein physisches Objekt ist das Thema | Render als Produkt-Bühne |
| team.jpg | Foto bewusst als Foto, Duotone in CI | Menschen nie verfremden | mono |

Optionen: Foto-Fenster im Raum · Textur der Welt (Globus, Gelände) · Form/Partikel · GLB-Held · Video im Raum ·
Farbwelt (Duotone/Mono/Glow) · gerahmt (Gerät/Browser). Details: `studio-recipes.md`.
Personen: nur Foto/Duotone/Mono, nie als Partikel ohne ausdrückliches Ja.

## §4 Das Regiebuch (eine Nachricht, eine Freigabe)

Statt 2–3 Konzepten, Karten-Runden und Blockout-Runde: **ein** Regiebuch mit allem, was der Nutzer vor dem Bau sehen
muss. Format in `page-cards.md`:
1. **Konzept** in 5 Zeilen: Kernsatz · Hauptdarsteller · Welt · Kamerareise · Wow (wo und warum dort);
   darunter **eine** Alternative in einem Satz.
2. **Seitenplan** (Titel · Hauptseiten · Outro · Backup): Kernaussage, Bild in einem Satz, Design-Element + Ort, Übergang.
3. **Annahmen** (alles, was Claude entschieden hat, nummeriert).
4. **Offen:** `[TBD]`-Belege, fehlende Medien (werden im Code/Blender gebaut).

Der Nutzer antwortet einmal: „ok“ oder eine gesammelte Liste („3: Zahnrad links statt rechts, Annahme 2: …“).
Änderungen werden eingearbeitet **ohne** neues Regiebuch; gebaut wird direkt.

## §5 Autopilot

„Autopilot“, „du entscheidest“, „egal“: Bogen überspringen, Regiebuch aus den Unterlagen ableiten (Standards aus §1),
Annahmen sichtbar. Sagt der Nutzer „Autopilot, direkt bauen“: ohne Freigabe bauen, Regiebuch mit dem Ergebnis liefern.

## §6 Beispiel: ein gut ausgefüllter Bogen (zum Zeigen, wenn der Nutzer unsicher ist)

> A1 Lenkungskreis SDV, 01.10. · A2 6 Vorstände OEM, skeptisch, 25 min · A3 Freigabe Pilot Werk Zwickau
> A4 live, danach Link · A5 9 Seiten · A6 Deutsch · A7 Klick-Keynote
> B1 „Software macht aus jedem Fahrzeug ein lernendes System.“ · B2 drei Zahlen mit Quelle (Folie 4) · B3 „Zu teuer“ → Payback-Rechnung
> C1 präzise, ruhig, technisch · C2 dunkel · C3 CI laut Guide · C4 unser Fahrzeug, aufgeschnitten, Daten fließen hindurch
> C5 `sig:gear-train` fürs Portfolio; Referenz: Leopard-Deck (Röntgen-Scan)
> D1 „Das Fahrzeug, das mitdenkt“ · D4 Fahrzeug im Gegenlicht · D5 Scheinwerfer gehen an, Kamera fährt auf die Front
> E3 „Sechs Bausteine, ein System“ · Portfolio, 6 Bereiche · Zahnrad rechts, 6 Zähne leuchten nacheinander · Klick = Detail · Wow: Flug durchs Cockpit ins Zahnrad
> F2 „Pilot-Kickoff 15.01., Entscheidung heute“ · F3 zwei Experten mit Foto · F4 Backup: Kostenmodell, Zeitplan, Risiken
> H Fahrzeug-GLB liegt bei, Teamfotos fehlen → Initialen · I Sprechernotizen ja, PDF ja
