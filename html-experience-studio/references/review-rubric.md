# Review auf Wirkung (vor jeder Lieferung)

Läuft **intern** vor dem ersten Zeigen (bis zu 2 Durchgänge); der Nutzer bekommt das Ergebnis mit den Werten.
Grundlage: Standbilder **und** Bewegungsstreifen (`studio_frames.cjs --motion` → `sheet.py`; Scroll-Bühne: `scroll_frames.cjs --at …`). Jede Frage 1–5.
**Liefern nur, wenn kein Punkt unter 3 liegt und der Schnitt ≥ 4 ist.** Sonst: die zwei schwächsten Punkte
nacharbeiten, neu prüfen. Ehrlich bewerten – „sieht ordentlich aus“ ist eine 3, nicht eine 5.

| # | Frage | 5 = Referenz-Niveau | 2 = Template-Niveau |
|---|---|---|---|
| 1 | **Eine Welt?** Bleibt ein Hauptdarsteller/Raum über alle Szenen bestehen? | Ein Raum, jede Szene ist ein Shot darin | Hintergrund wechselt pro Seite |
| 2 | **Erzählen die Übergänge?** | Jeder Wechsel ist ein Erzählschritt (Fahrt, Tauchen, Scan) | Blende/Schieben zwischen Seiten |
| 3 | **Maßgeschneidert?** Ist jede Szene nur für diesen Inhalt denkbar? | Keine Szene ließe sich in ein anderes Deck kopieren | Seitentyp + ausgetauschter Text |
| 4 | **Inhalts-Visuals** eigens geformt? | Form folgt der Frage (Ort → Gelände, Anteil → Fläche) | Zahlen untereinander, Bullet-Listen |
| 5 | **Komposition** pro Szene bewusst und abwechslungsreich? | Maßstab, Höhe, Licht wechseln mit Absicht | Immer Text links, Bild rechts |
| 6 | **Wow-Moment** vorhanden und verdient? | Ein Moment, über den man spricht, an der stärksten Stelle | Kein Höhepunkt / Effekte überall |
| 7 | **Handwerk**: Licht, Material, Typo, Lesbarkeit, Ruckeln | Filmisch, scharf, flüssig, AA-Kontrast | Blass, überstrahlt, Text auf unruhigem Grund |
| 8 | **Inhalt**: eine Idee pro Szene, belegte Fakten, klare Sprache | Jede Szene ein Satz, den man behält | Textblöcke, unbelegte Zahlen |
| 9 | **Detaildichte**: handgebaute Mikro-Momente, an den Inhalt gebunden (`craft-bar.md` C5) | ≥ 6, jeder nur für dieses Thema denkbar (Handschrift, Lineal, Riss, Glas …) | 0–2 Standard-Effekte (Fade, Hover-Lift) |
| 10 | **Rahmen und Typo-Grammatik**: Linien/Ornament, Eintritt Maske, Austritt gerichtet | Alles an vier Linien ausgerichtet, Austrittsrichtung wechselt, Unterlängen nicht abgeschnitten | Lose Elemente, alles blendet nur ein |
| 11 | **Eigener Hauptdarsteller und Stimme**: Wettbewerber-Test, Beats, Gegenposition | Bild nur für dieses Thema; Sätze ≤ 5 Wörter, kein Floskelwort | Generische Partikel/Gradienten, „ganzheitliche Lösungen“ |
| 12 | **Überzeugt es den Vorstand?** Entscheidung, Belege, Einwand, nächster Schritt | Antwort auf Seite 1–2, jede Zahl mit Quelle, Einwand beantwortet, Outro = Entscheidung mit Datum/Owner, Sprechernotizen, Backup | Schöne Bilder ohne Ask, Zahlen ohne Quelle, „Vielen Dank“ am Ende |

| 13 | **Oberfläche** (`ui-craft.md`): Hero-Formel, Typo mit gedimmter Hälfte, Pills, Liquid Glass, Hover-Physik, Mobil | Wie ein Produkt-Launch: man will klicken | Fette zentrierte Headline, eckige Buttons, Glas auf grauem Grund |
| 15 | **Abstand zur Referenz** (`experience-architecture.md` §6): Hub-Objekt nach Nutzerwahl, ≥ 4 von 6 Achsen eigen | Gleiches Niveau, erkennbar eigenes Deck | Sieht aus wie die Referenz mit anderem Text |
| 14 | **Architektur und Individualität** (`experience-architecture.md`): Intro wirkt, Hub wird gebaut, jede Unterseite eigener Archetyp, jede Kante eigener Übergang | Jede Seite überrascht, man findet sich trotzdem sofort zurecht | Gleiche Seite mit anderem Text, überall Fade |

Dazu das **Craft-Gate** (`craft-bar.md` Teil G, Ja/Nein-Liste): jedes Nein wird nachgearbeitet, bevor die Zahlen zählen.
Scroll-Bühnen zusätzlich: rückwärts scrollen bricht nichts · Kapitel-Sprung über die Rail landet sauber · Hochformat hat eigene Anordnung.

Zusätzlich hart (jedes Nein blockiert): `leakcheck.py` ohne Treffer (kein Demo-/Template-Text) · keine JS-Fehler · keine externen Requests · Text nicht außerhalb des Bildschirms ·
mobil bedienbar · `prefers-reduced-motion` respektiert · Bildnachweise/Lizenzen vollständig · < 15 MB.

Optionaler Zweitblick: Agent `impeccable:impeccable-finish-reviewer` (Standbilder + Konzept) und
`impeccable:impeccable-motion-reviewer` (Bewegungsstreifen) mit dieser Tabelle als Maßstab beauftragen.
