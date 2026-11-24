# Design-Karten: der Nutzer bestimmt jede Seite

Jede Szene bekommt **eine Karte**, bevor gebaut wird. Der Nutzer gibt jede Karte frei („ok“, Änderung oder „anders“).
Nach dem Blockout-Build wird jede Szene als **Standbild + Bewegungsstreifen** gezeigt und erneut freigegeben.
Nichts geht in die Ausarbeitung, was der Nutzer nicht gesehen hat.

## Format (pro Szene, im Chat und in `concept.md`)

```
### 03 · Sigiriya  — „Ein Palast auf einem Felsen.“
Bild:        Was man sieht, als ein Satz Bildbeschreibung (Komposition, Vorder-/Hintergrund, Licht, Tageszeit).
Held:        Was vom Hauptdarsteller in diesem Shot sichtbar ist und was er tut.
Kamera:      Shot (Höhe, Blickrichtung, Brennweite-Gefühl) + Fahrt HIN zu dieser Szene (Weg, Dauer, Gefühl).
Text:        Exakter Titel / Unterzeile / ggf. Zahl – und WO er steht (z. B. unten links über dem Schatten des Felsens).
Inhalts-Visual: Welche Frage es beantwortet und welche eigene Form es hat (oder „keins“).
Bewegung:    Was sich IN der Szene bewegt (Mikro-Choreografie, 1–2 Dinge) und was still bleibt.
Medien:      Datei(en) + Einbettung (Foto-Fenster, Textur auf Gelände, Video im Raum …) + Bildnachweis.
Übergang:    Rolle (innen / Kapitel / Wow) und was er ERZÄHLT („wir steigen vom Felsen in die Tempelkammer hinab“).
Referenz:    Moodboard-Verweis (Library-ID, Referenz-Screenshot, Film-Still) – nur als Richtung.
Offen:       [TBD]-Punkte, fehlende Belege, Entscheidungen für den Nutzer.
```

Scroll-Bühne: Kopfzeile ergänzen um **p-Bereich** (`p .17–.31`), **Beat-Text** (≤ 5 Wörter), **Rahmen/Ornament**
(was an den Linien sitzt), **Austrittsrichtung** und **Mikro-Moment** (welches handgebaute Detail dieser Szene gehört, `craft-bar.md` C5).

## Regeln

- **Eine Idee pro Szene.** Titel ≤ 8 Wörter, Unterzeile ≤ 30 Wörter.
- **Keine Wiederholung derselben Komposition** zweimal hintereinander (Text links + Bild rechts ist kein Default).
- **Jede Karte nennt, was sie von der vorigen unterscheidet** (Kamerahöhe, Licht, Maßstab, Rhythmus).
- **Übergänge haben drei Rollen**: innen (leise, gleich), Kapitel (erkennbar anders), Wow (1–2× pro Deck).
- **Vor dem Zeigen prüfen**: Kann man das Bild der Karte in einem Satz zeichnen? Wenn nein, ist sie zu vage.
- Zeige die Karten in Blöcken von 3–5 Szenen, damit der Nutzer wirklich jede Seite liest.

## Freigabe-Runden

1. **Karten** (Text) → Freigabe je Szene.
2. **Blockout-Standbilder + Bewegungsstreifen** (`studio_frames.cjs --motion`, `sheet.py`) → Freigabe je Szene.
   Der Nutzer sieht: Komposition, Kamera, Text final, Visual als Form.
3. **Ausarbeitung** → finale Standbilder; Änderungen nur noch Feinschliff.
Freigaben in `concept.md` notieren (Datum, Szene, Kommentar).
