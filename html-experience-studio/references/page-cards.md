# Regiebuch: eine Freigabe statt vieler Runden

Das Regiebuch ist der **einzige** Freigabepunkt vor dem Bau. Es ersetzt Konzept-Auswahl, Karten-Blöcke und
Blockout-Freigabe. Es muss so konkret sein, dass der Nutzer jedes Bild vor sich sieht – dann sitzt der erste Wurf.
Ablage: `concept.md` im Projekt (Freigabe mit Datum notieren).

## Format (eine Nachricht)

```
## Regiebuch · <Titel>                          Bauart: Erlebnis-Hub · 1 Intro · 3 Story · Hub (Zahnrad, 6) · 9 Unterseiten · Outro · dunkel
Kernsatz      Software macht aus jedem Fahrzeug ein lernendes System.
Held          Das Fahrzeug, aufgeschnitten; Datenlicht fließt hindurch und endet im Portfolio-Zahnrad.
Welt          Eine dunkle Halle, ein Licht von links; alles passiert am und im Fahrzeug.
Kamerareise   Front → Röntgen durch die Karosserie → Cockpit → Flug ins Zahnrad → zurück in die Totale.
Wow           Seite 4: Flug durchs Cockpit ins Zahnrad (dort kippt die Geschichte vom Problem zur Lösung).
Alternative   Statt Fahrzeug: Gebirge aus euren Rückrufkurven (Ridge Lines), das sich glättet.

| #   | Rolle      | Kernaussage (≤ 8 Wörter)   | Bild in einem Satz (Archetyp bei Unterseiten)                  | Design-Element · wo      | Übergang dorthin (Name: was er erzählt)            |
|-----|------------|----------------------------|-----------------------------------------------------------------|--------------------------|----------------------------------------------------|
| 00  | Intro      | Das Fahrzeug, das mitdenkt | Video-Loop Röntgen-Fahrzeug, Titel 3 Zeilen, weiße + Glas-Pill  | Video · Vollbild         | Laden: Zeilen steigen aus der Maske                |
| 01  | Story      | Gebaut um Mechanik         | Altes Modell auf Spiegelboden, Labels an Motor/Getriebe         | Fahrzeug (GLB) · rechts  | `intro>s1` eigen: Titelbild wird zum 3D-Raum       |
| 02  | Story      | Definiert durch Software   | Röntgen-Scan wandelt es ins neue Modell, Ära-Schalter kippt     | Scan-Linie · durchs Bild | `s1>s2` eigen: Scan fährt durch (Wow 1)            |
| 03  | Hub        | Ein Portfolio, sechs Hebel | Zahnrad rechts, 3 Gruppen, Fortschritt links                    | Zahnrad · rechts         | `s2>hub` eigen: Datenstrom fließt ins Rad (Wow 2)  |
| 04a | Unterseite | ADAS als Werttreiber       | A1 Spannungsbogen, Wert-Station = Umsatzpotenzial [TBD]         | Mini-Rad · Kopf          | `portal`: öffnet aus dem Segment                   |
| 04b | Unterseite | Acht Wochen bis SOP        | A2 Zeitstrahl, KW 6 trägt das Werk-Foto                         | –                        | `lift`                                             |
| …   |            |                            |                                                                 |                          |                                                    |
| 10  | Outro      | Pilot-Kickoff 15.01.       | Köpfe im Kreis ums gedimmte Rad, Steering-Team als Glas-Leiste  | Zahnrad · Mitte, gedimmt | `dissolve`                                         |
| B1  | Backup     | Kostenmodell               | ruhige Tabelle auf Glas                                         | –                        | nur über Übersicht (M)                             |

Annahmen   1 Publikum skeptisch → Beleg vor Behauptung  2 Zahnrad rechts, Text links  3 Sprechernotizen ja …
Offen      [TBD] Quelle Rückrufkosten · Teamfotos fehlen (Initialen) · Intro-Motiv: eigener Shader statt Video (kein Material vorhanden)
→ „ok“ oder gesammelte Änderungen („3: …, Annahme 2: …“). Danach baue ich direkt.
```

## Regeln für die Seitenzeilen

- **Eine Idee pro Seite.** Titel ≤ 8 Wörter, Unterzeile ≤ 30 Wörter.
- **Bild in einem Satz** – Komposition, Vorder-/Hintergrund, Licht. Kann man es nicht zeichnen, ist es zu vage.
- **Keine Komposition zweimal hintereinander** (Text links + Bild rechts ist kein Default); Maßstab, Höhe, Licht wechseln.
- **Design-Element mit Ort**: Hintergrund · Held · Diagramm · Übergang. Ein Signature-Stück ist Technik-Quelle, nicht
  Kopie: Farbe, Form und Inhalt kommen aus dem Thema (Zahnrad mit 6 Zähnen = 6 Bereiche, Globus mit euren Standorten).
- **Übergänge haben drei Rollen**: innen (leise) · Kapitel (erkennbar anders) · Wow (1–2× pro Deck) – und erzählen etwas.
- **Intro → Story → Hub → Unterseiten → Outro** immer vollständig (Erlebnis-Hub, `experience-architecture.md`); Backup-Seiten separat.
- **Unterseiten:** Archetyp (A1–A12) + was ihn für diesen Inhalt eigen macht; keine zwei gleichen nacheinander.
- **Übergangs-Spalte = Register:** Name (eingebaut) oder „eigen: …“ mit einem Satz, was er erzählt. Story-, Hub- und Wow-Kanten sind eigen.
- **Intro-Zeile** nennt Medium (Video/3D/Shader/Foto), Headline-Umbruch inkl. gedimmter Hälfte und die zwei Aktionen.
- Scroll-Bühne: Spalte `#` wird `p-Bereich` (z. B. `.17–.31`), dazu Beat-Text ≤ 5 Wörter und Austrittsrichtung.

## Nach der Freigabe

Bauen ohne weitere Runden. Die Qualitätsschleife (Standbilder, Bewegungsstreifen, Review, Craft-Gate, Leak-Check) läuft
**intern**: Claude prüft und bessert selbst nach (bis zu 2 Durchgänge), dem Nutzer wird erst das fertige Ergebnis gezeigt,
mit Standbild-Bogen und Review-Werten.
Spätere Änderungswünsche gesammelt annehmen und in einem Durchgang umsetzen.
