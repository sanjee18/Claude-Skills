# Regiebuch: eine Freigabe statt vieler Runden

Das Regiebuch ist der **einzige** Freigabepunkt vor dem Bau. Es ersetzt Konzept-Auswahl, Karten-Blöcke und
Blockout-Freigabe. Es muss so konkret sein, dass der Nutzer jedes Bild vor sich sieht – dann sitzt der erste Wurf.
Ablage: `concept.md` im Projekt (Freigabe mit Datum notieren).

## Format (eine Nachricht)

```
## Regiebuch · <Titel>                          Bauart: Klick-Keynote · 9 Seiten · dunkel · ~25 min
Kernsatz      Software macht aus jedem Fahrzeug ein lernendes System.
Held          Das Fahrzeug, aufgeschnitten; Datenlicht fließt hindurch und endet im Portfolio-Zahnrad.
Welt          Eine dunkle Halle, ein Licht von links; alles passiert am und im Fahrzeug.
Kamerareise   Front → Röntgen durch die Karosserie → Cockpit → Flug ins Zahnrad → zurück in die Totale.
Wow           Seite 4: Flug durchs Cockpit ins Zahnrad (dort kippt die Geschichte vom Problem zur Lösung).
Alternative   Statt Fahrzeug: Gebirge aus euren Rückrufkurven (Ridge Lines), das sich glättet.

| #  | Rolle   | Kernaussage (≤ 8 Wörter)      | Bild in einem Satz                                    | Design-Element · wo     | Übergang dorthin         |
|----|---------|-------------------------------|-------------------------------------------------------|-------------------------|--------------------------|
| 00 | Titel   | Das Fahrzeug, das mitdenkt    | Front im Gegenlicht, Scheinwerfer zünden nacheinander | Fahrzeug (GLB) · Mitte  | aus Schwarz, 2,4 s       |
| 01 | Problem | Jeder Rückruf kostet [TBD]    | Röntgen-Scan legt 3 Steuergeräte frei, eins glüht rot | Scan-Linie · durchs Bild| innen: Kamera senkt sich |
| …  |         |                               |                                                       |                         |                          |
| 08 | Outro   | Pilot-Kickoff 15.01.          | Totale, Licht geht auf Akzent, ein Satz, zwei Köpfe   | –                       | Kapitel: Rückfahrt       |
| B1 | Backup  | Kostenmodell                  | ruhige Tabelle auf Glas                               | –                       | nur über Übersicht (M)   |

Annahmen   1 Publikum skeptisch → Beleg vor Behauptung  2 Zahnrad rechts, Text links  3 Sprechernotizen ja …
Offen      [TBD] Quelle Rückrufkosten · Teamfotos fehlen (Initialen) · Video-Generierung: 1 Job, ca. 40 Credits, Prompt: „…“
→ „ok“ oder gesammelte Änderungen („3: …, Annahme 2: …“). Danach baue ich direkt.
```

## Regeln für die Seitenzeilen

- **Eine Idee pro Seite.** Titel ≤ 8 Wörter, Unterzeile ≤ 30 Wörter.
- **Bild in einem Satz** – Komposition, Vorder-/Hintergrund, Licht. Kann man es nicht zeichnen, ist es zu vage.
- **Keine Komposition zweimal hintereinander** (Text links + Bild rechts ist kein Default); Maßstab, Höhe, Licht wechseln.
- **Design-Element mit Ort**: Hintergrund · Held · Diagramm · Übergang. Ein Signature-Stück ist Technik-Quelle, nicht
  Kopie: Farbe, Form und Inhalt kommen aus dem Thema (Zahnrad mit 6 Zähnen = 6 Bereiche, Globus mit euren Standorten).
- **Übergänge haben drei Rollen**: innen (leise) · Kapitel (erkennbar anders) · Wow (1–2× pro Deck) – und erzählen etwas.
- **Titel → Hauptseiten → Outro** immer vollständig; Backup-Seiten (Q&A) separat markieren.
- Scroll-Bühne: Spalte `#` wird `p-Bereich` (z. B. `.17–.31`), dazu Beat-Text ≤ 5 Wörter und Austrittsrichtung.

## Nach der Freigabe

Bauen ohne weitere Runden. Die Qualitätsschleife (Standbilder, Bewegungsstreifen, Review, Craft-Gate, Leak-Check) läuft
**intern**: Claude prüft und bessert selbst nach (bis zu 2 Durchgänge), dem Nutzer wird erst das fertige Ergebnis gezeigt,
mit Standbild-Bogen und Review-Werten. Ausnahme: Medien-Generierung mit Kosten wird vorher bestätigt (steht im Regiebuch).
Spätere Änderungswünsche gesammelt annehmen und in einem Durchgang umsetzen.
