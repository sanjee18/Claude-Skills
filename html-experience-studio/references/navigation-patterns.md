# Navigationsmuster (aus dem Einsatz ableiten, nicht als Menü abfragen)

## A · Scroll-Story (`nav.mode:"scroll"`)
Eine lange Seite, jede Sektion = ein Bildschirm, Inhalte blenden beim Erscheinen ein. Fortschrittsbalken + Seitenpunkte.
- Für: Versand per Link, Selbstlesen, Landingpage, mobile Nutzung.
- Übergänge zwischen Seiten entfallen (Scroll ist der Übergang); Bewegung kommt aus `enter` + Sektions-Animationen.
- Ruhige Titel-Animationen und Hintergründe wirken hier am besten (Auswahl nach `art-direction.md`).

## B · Deck (`nav.mode:"deck"`)
Eine Seite sichtbar, Pfeile/Leertaste/Mausrad/Wischen wechseln mit Übergang. M = Übersicht, Seitenpunkte klickbar.
- Für: Live-Präsentation, Workshop, Keynote.
- Übergang je Kapitelgrenze variieren (z. B. `slide` innerhalb eines Kapitels, `zoom-through`/`warp` zum neuen Kapitel).

## C · Übersicht + Sub-Seiten (`hub`/`cards`/`bento` + `subpages`)
Nur wenn die Inhalte gleichwertige Bereiche sind (Portfolio, Leistungen, Use Cases) und der Nutzer Vertiefungen will.
Eine Übersicht mit 3–8 Knoten (Hub-Stil `orbit`, `constellation`, `radial` oder `gear`, passend zum Thema) oder Karten/Bento; Klick öffnet die Detailseite per Morph, Esc/Zurück kehrt zurück
(Hub bleibt im Zustand). Karten (`cards` mit `to`) funktionieren genauso.
- Sub-Seiten-Vorlagen (im Interview fragen):
  1. **Problem/Lösung/Mehrwert** → `steps` (Tabs)
  2. **Kennzahlen + Aussage** → `stats` oder `split` + `ring`
  3. **Prozess/Architektur** → `split` + `flow`
  4. **Fahrplan** → `timeline`
  5. **Beweis/Demo** → `media` oder `html` mit eingebetteter Demo
  6. **Mehrere Use Cases** → `cards` (`to` → weitere Sub-Seiten, max. 2 Ebenen)
- Pro Sub-Seite ein Kernsatz, max. ≈ 80–110 Wörter; gleiche Struktur über alle Hebel (Wiedererkennung).

## D · Hybrid (empfohlen bei Portfolio)
Deck-Story (Hero → Problem → Kennzahlen → Sprung) → **Hub** → Sub-Seiten → Outro/CTA. `H` springt jederzeit zum Hub.
Beispiel: `examples/showcase.brief.json`.

## E · Geführte Tour mit Verzweigung
Deck, an einer Stelle `cards`/`hub` zum Wählen (Rolle, Branche, Thema) → jede Wahl öffnet eine eigene Sub-Seiten-Strecke.
Nur bauen, wenn der Anlass es verlangt (mehr Seiten = mehr Prüfaufwand).

## Fragen an den Nutzer (Kurzform)
1. Nur nach unten scrollen oder Seite für Seite?  2. Soll irgendwo geklickt werden, um Detailseiten zu öffnen? Wo?
3. Wie sieht eine Detailseite aus (Vorlage 1–6)?  4. Soll es eine Übersichtsseite geben, zu der man zurückkehrt?
5. Wer bedient (Presenter live / Kunde selbst)?  → bestimmt Hint-Leiste, Tempo, Dichte.
