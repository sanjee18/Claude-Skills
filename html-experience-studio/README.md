# HTML Experience Studio

Interaktive HTML-Erlebnisse statt PowerPoint: ein Interview, eine Bibliothek, **eine Offline-Datei**.

## Installieren
**Claude Code / Code-Tab der Desktop-App:** Ordner `html-experience-studio` nach `~/.claude/skills/` kopieren
(Windows: `C:\Users\<Name>\.claude\skills\`). Neue Sitzung starten, `/html-experience-studio` eingeben.

**Claude Desktop / claude.ai Chat:** `python scripts/package.py` erzeugt `html-experience-studio.zip` →
Einstellungen → Skills → ZIP hochladen. (Python/Code-Ausführung muss im Konto aktiv sein, damit der Build läuft.)

Voraussetzung: Python 3.9+ (nur für `build.py`). Optional: Node + Playwright für `check.cjs`.

## Benutzen
1. Im Chat: `/html-experience-studio`. Claude fragt zuerst offen nach Thema, Publikum, Material und gewünschtem Gefühl
   (gern mit Referenzbildern) und schlägt erst danach 2–3 begründete Design-Richtungen vor.
2. Optional selbst auswählen: `library.html` öffnen (über 100 Bausteine live: Hintergründe, Text-Animationen, Übergänge,
   Interaktionen, Layouts, Looks), mit ＋ auswählen, „Auswahl kopieren“ und im Chat einfügen.
3. Claude zeigt ein Storyboard, baut nach einer Bestätigung `out/<Name>_v1.html`.
4. Änderungen: einfach sagen, was anders sein soll → Brief wird angepasst, `_v2` gebaut.

**Wie schreibe ich einen guten Prompt?** → **[`PROMPT-LEITFADEN.md`](PROMPT-LEITFADEN.md)**: Vorlage zum Kopieren,
drei ausgefüllte Beispiele auf Senior-Niveau (Workshop live, Launch-Webseite, Messe-Story mit Video), Kurzversion,
„schwach vs. stark“, Checkliste und Feedback-Prompts für die zweite Runde.

Kurzbeispiele
- „Präsentation für den SDV-Workshop vor der Bereichsleitung, 12 Seiten live, Theme data-transfer, Held: Datenströme
  durchs Fahrzeug, Wow: Warp ins Portfolio. Material anbei, fehlende Zahlen als [TBD]. Erst Storyboard zeigen."
- „Mach aus diesen Folien (PPTX) eine Scroll-Story im Theme bloom-garden mit unserem Drohnenvideo als Szene."
- „Produkt-Bühne für unser neues Gerät wie VEYRA: Render, Hover-Clip, Schnittbild, drei Farbvarianten."
- „Unser Fahrzeug als 3D-Held (GLB anbei): Kamerafahrt, Röntgen-Scan auf Akku und Steuergerät, Explosionsansicht." (Beispiel `examples/model-demo/`)
- „Baue aus diesen Fotos ein 3D-Modell in Blender" (Blender-Modul).

## Inhalt
| Pfad | Zweck |
|---|---|
| `PROMPT-LEITFADEN.md` | **Für Kollegen:** optimaler Prompt, Vorlage, Beispiele, Checkliste |
| `SKILL.md` | Ablauf, Regeln (Claude liest zuerst) |
| `references/` | Interview, Katalog, Brief-Schema, Design-Regeln, Navigationsmuster, Branchen, Prompt-Bibliothek, Blender-Modul, QA |
| `assets/engine/` | Engine (JS/CSS): Seitentypen, Hintergründe, Text-Animationen, Übergänge, Navigation |
| `assets/vendor/` | three.js r147 (MIT) – nur eingebettet, wenn ein Brief ein 3D-Modell nutzt (`LICENSES.md`) |
| `assets/designs/` | 15 Design-Themes (Tokens, Schriften, Bauteile, Bewegung, Signature-Szene, Verbote) |
| `assets/themes.json` | Farb-Presets (ohne Design-Theme) + Schrift-Stacks |
| `assets/fonts/` | Eingebettete OFL-Schriften (Lizenzen in `LICENSES.md`) |
| `scripts/build.py` | Brief → eine HTML-Datei (+ Lint), `--gallery` für Vorschau |
| `scripts/check.cjs` | Automatischer Smoke-Test (Playwright) |
| `scripts/package.py` | ZIP für Upload |
| `examples/showcase.brief.json` | Beispiel mit vielen Seitentypen |
| `examples/veyra/` | Referenz-Produkt-Bühne mit Original-Medien (MIT, Amir Mušić), fertig gebaut als `VEYRA_v1.html` |
| `assets/library.json` | Alle Bausteine mit Beschreibung, Stimmung, Kosten (eine Quelle für Build, Linter, Library) |
| `library.html` | Motion Library: Karten mit Live-Vorschau, Filter, Auswahl → JSON (`scripts/build_library.py`) |
| `library-gallery.html` | Spielwiese: Beispiel-Deck mit Panel zum Umschalten |

## Erweitern
Neue Animation = Funktion in `assets/engine/*.js` registrieren (`R.xyz = …`, CSS in `engine2.css`), Eintrag in
`assets/library.json` (id, kind, name, desc, use, moods, cost), dann `python scripts/build_library.py`.
Build-Linter, Katalog, Library und Spielwiese übernehmen die ID automatisch.

## Hinweise
- Capgemini-Invent-Theme ist eine Annäherung → mit dem aktuellen CI-Guide abgleichen.
- Keine Kundendaten im Skill; Beispiele sind Demo-Werte.
- Schriften sind eingebettet (OFL, offline); ein Deck enthält nur die Schriften seiner Design-Themes.
- Eigene Medien (Renders, Videos) liegen neben dem Brief und werden eingebettet; Ziel < 15 MB.
