# Referenz-Welten (Library-Tab „Referenz-Welten“)

Kleinere Einzelstücke auf demselben Niveau (ein Shader, eine Idee): Tab **Signature-Stücke**, siehe `signature.md`.

Drei vollständige, offline lauffähige Seiten, die das **Niveau** zeigen, das der Nutzer als Maßstab gesetzt hat.
Sie sind **Moodboard und Lehrmaterial**, keine Bausteine: Richtung, Tempo, Material übernehmen, nichts 1:1.
Quellcode: `assets/worlds/<id>.html` (mit `studio:three` / `studio:scrollstage`-Platzhaltern),
gebündelt: `tools/_worlds/<id>.html`. Neu bauen: `python scripts/build_library.py`.

| ID | Medium | Kernidee | Code-Rezepte | Wann |
|---|---|---|---|---|
| `scroll-stage` | DOM + WebGL-Shader, `scrollstage.js` | Eine gepinnte Bühne, p treibt Film, Text, Rahmen, Lineal, Karussell, Glas-Formular | §11–§17 | Firmen-/Produkt-/Partnerseite, Pitch als Scroll-Story |
| `moonlit-petals` | Canvas 2D + Mini-WebGL | Einmal backen, danach nur komponieren; weicher Hover-Verzug | §18–§19 | Stimmungsfläche ohne Text, Natur, Wellness, Einladung |
| `vinyl-supernova` | three.js r147, Vertex-Shader | Zeitleiste Form → Zerfall → Wolke → Rückbau, Partikel = f(Index, Zeit) | §20–§21 | Musik/Medien/Produkt-Teaser, Loop, Übergang |

## Herkunft und Rechte
- `scroll-stage`: Technik und Struktur aus **pear.no** analysiert (öffentliche Seite). **Keine** Texte, Logos, Markenmotive oder
  Assets übernommen; alle Inhalte sind Platzhalter. Das Hauptobjekt (Shader-Orb) ersetzt den Film der Referenz und ist ein
  *Platzhalter*: echte Projekte brauchen ein eigenes, themengebundenes Hero-Asset (`craft-bar.md` Teil D).
- `moonlit-petals`: Vanilla-Port einer **vom Nutzer gelieferten** Framer-Komponente (Originkit). Lizenz der Quelle vor
  Kundeneinsatz klären; im Zweifel nur die Prinzipien (§18–§19) mit eigenem Motiv neu bauen.
- `vinyl-supernova`: Port des vom Nutzer gelieferten „Particles Swarm Export“ auf three r147 (offline, Vertex-Shader statt
  CPU-Schleife + GPGPU). Choreografie und Zahlenwerte stammen aus dem Original.

## Bedienung in den Welten
- `scroll-stage`: scrollen/Pfeile; Kapitel-Rail rechts; `?p=0.4` (oder `#p=0.4`) springt zu einer Stelle; `#auto` spielt selbst.
- `moonlit-petals`: Zeiger bewegen/klicken verzieht Krone und Dolden; `#t=2.4` Zeit-Versatz (Bokeh früh), `#color=ffb3d1`, `#dir=right`.
- `vinyl-supernova`: ziehen = Kamera; `#t=3.4` Zeit-Versatz.

## Neue Welt aufnehmen (Checkliste)
1. Datei `assets/worlds/<id>.html` (eine Seite, offline, `prefers-reduced-motion`, keine externen Requests; three/Scrollstage über `studio:`-Platzhalter).
2. Eintrag in `assets/library.json` (`kind:"world"`, `file`, `poster` = Hash für den Standbild-Frame, `tokens`, `technik`, `uebertragen`, `quelle`).
3. `python scripts/build_library.py`, danach `cd tools && node posters.cjs world`, danach `build_library.py` erneut (Standbilder einbetten).
4. Kurzprüfung: Library im Browser öffnen → Tab „Referenz-Welten“ → live + „Groß ansehen“.
