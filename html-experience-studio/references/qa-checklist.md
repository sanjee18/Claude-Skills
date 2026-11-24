# QA-Checkliste (vor jeder Auslieferung)

Automatisch (optional): `cd scripts && npm i playwright && npx playwright install chromium`, dann
`node scripts/check.cjs out/Name_v1.html` → JS-Fehler, jede Seite + Sub-Seite, Screenshots 1440×900 und 390×844,
Seiten die höher als der Bildschirm sind.

Manuell im Browser (Chrome/Edge):
- [ ] **Mindeststandard** (`design-rules.md` §0): neben das Referenz-Niveau gelegt, keine AI-Slop-Merkmale, eine Welt, ruhige Typo.
- [ ] `cam`-Szenen: Standbilder bei mehreren Zeiten geprüft (`Deck.$('.stage.is-active')._r.clock.seek(t)`), kein Ruckeln, P/R funktionieren.
- [ ] Konsole ohne Fehler; Build ohne Lint-Warnungen (oder bewusst akzeptiert).
- [ ] Jede Seite: Titel sichtbar, nichts abgeschnitten, nichts überlappt, genau ein Bildschirm hoch (1440×900).
- [ ] Zahlen/Namen/Zitate stimmen mit den Unterlagen; keine erfundenen Werte; `[TBD]` nur wo angekündigt.
- [ ] Navigation: →/←/Leertaste/Mausrad/Wischen (Deck) bzw. Scroll; Seitenpunkte, M-Übersicht, H, Esc.
- [ ] Hub: jeder Knoten öffnet seine Sub-Seite, Zurück/Esc kehrt in den Hub zurück; Hover-Text im Kern lesbar.
- [ ] Übergänge: schnelles Mehrfachdrücken bricht nichts (letzte Eingabe gewinnt); Zurück-Richtung stimmt.
- [ ] Bewegung: nicht mehr als 1 Signature-Moment pro Seite; nichts ruckelt (Hintergrund aus → Verbesserung? dann Intensität senken).
- [ ] Reduced Motion (OS-Einstellung) → keine Hintergrundbewegung, kurze Blenden.
- [ ] Kontrast AA, Fokus sichtbar, Alt-Texte, Charts mit Label.
- [ ] Handy-Breite (390 px): Layout einspaltig, Hub bedienbar, keine Horizontal-Scrollbalken.
- [ ] Datei < 15 MB; offline testen (WLAN aus): alles lädt, keine externen Requests (Netzwerk-Tab leer).
- [ ] Marken/Logos/Fotos/Modelle: Freigabe und Lizenzen geklärt, Credits vorhanden.
- [ ] Dateiname mit Version; kurze Bedienhinweise für den Presenter (Vollbild F11).

Fehlerbilder → Ursache
| Symptom | Ursache | Fix |
|---|---|---|
| Titel bleibt unsichtbar | Seite nie "entered" (Seiten-ID/Typ falsch, JS-Fehler) | Konsole, `id`/`type` prüfen |
| Seite scrollt intern | zu viel Inhalt | Text kürzen, Karten ≤ 6, Seite teilen |
| Hub-Knoten überlappen | > 8 Items oder lange Titel | ≤ 8, Titel ≤ 14 Zeichen |
| Ruckeln | Hintergrund + Warp + große Bilder | `bg.intensity` 0.6, Bild ≤ 1920 px |
| Sub-Seite öffnet nicht | `to` ohne passende Sub-`id` | Lint-Meldung beheben |
