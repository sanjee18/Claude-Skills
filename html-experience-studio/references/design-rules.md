# Design-Regeln (destilliert aus den besten Skills)

Herkunft: design-taste-frontend (Taste), impeccable, emil-design-eng, choreograph, animate, apple-design,
ui-ux-pro-max, mobile-native, break-ui, gsap-scrolltrigger. Präsentationen werden selten gesehen → mehr Bewegung
ist erlaubt (bis 900 ms), aber nie wiederholt/auf Tastendruck-Frequenz.

## 0. Mindeststandard (Benchmark: professionelles Referenz-Deck, ohne Skill gebaut)

Jedes Ergebnis muss mindestens so professionell wirken wie das Referenz-Deck des Nutzers (dunkle 3D-Fahrzeug-Story,
Portfolio-Zahnrad, Experten-Outro). Kundenmaterial daraus wird nie übernommen, nur die Gestaltungsprinzipien:

1. **Eine Welt statt Folien.** Ein durchgehender Raum (Hintergrund, Licht, ggf. 3D-Bühne) bleibt stehen; Seiten blenden
   darüber ein und aus. Kapitelwechsel sind Kamerabewegungen, keine Vorlagen-Wechsel.
2. **Echter Inhalt als Hauptbild.** Pro Seite ein starkes, echtes Motiv: Foto, Produkt-UI, 3D-Modell, Kamerafahrt
   (`cam`-Bausteine). Kein dekoratives Partikelnetz als Ersatz für Inhalt.
3. **Ruhige Typografie.** Eingebettete Inter (Display 500, −0.025em), Titel 34–74 px, linksbündig, Eyebrow
   mit Haarlinie (12 px, 600, +0.14em), Lead 15–19 px in `--text-2`, Zeilenlänge ≤ 32em. Mono nur für Code/Daten.
4. **Leise Bedienung.** HUD: Marke | Titel links, Chips rechts; Seitenpunkte als Pille unten rechts; Hinweise als Keycaps.
5. **Eine Bewegungssprache.** Einblendung `rise` (18 px, 1,1 s, `cubic-bezier(.22,1,.36,1)`), gestaffelt 120–140 ms.
   Große Effekte nur als Kamerabewegung (`cam`), nie als bunte Übergangs-Show.
6. **Verboten (AI-Slop-Merkmale):** zentrierte Riesen-Headlines als Standard, Icons in gefüllten Kacheln, Mono-Versalien
   überall, Glow/Neon-Ränder, dicke farbige Seitenränder an Karten, Chip-Wüsten, identische Kartenraster ohne Hierarchie,
   Partikel-/Netz-Hintergründe ohne inhaltlichen Grund.

Prüfen: Screenshot neben das Referenz-Deck legen. Wirkt es billiger, lauter oder generischer → nicht ausliefern.

## Kamera & Film (`cam`-Bausteine)
- Jede Szene ist zeitgesteuert (`seek(t)`, keine CSS-Transitions) → pausierbar (P), neu startbar (R), als MP4 renderbar
  mit `scripts/film_export.cjs` (Standbilder mit `--stills` zuerst prüfen; `--blur 4` für Bewegungsunschärfe).
- Eine durchgehende Kamera, kein Schnitt, keine Überblendung innerhalb der Szene; Tempo aus einer Geschwindigkeitskurve.
- Tiefenunschärfe nur vor dem Fokus stark, dahinter schwach; Fokus liegt immer auf dem, was die Bildmitte kreuzt.
- Abheben klein halten (20–60 px), Fotos/Testimonial dürfen höher (100–120 px). Schatten wachsen mit der Höhe.
- Nie einen `preserve-3d`-Elternteil mit `filter`/`opacity` belegen (flacht die 3D-Ebenen ab).
- Max. 1–2 `cam`-Szenen pro Deck, an den stärksten Stellen (Opener, Reveal, Finale).

## Layout & Inhalt (Taste, Impeccable)
1. **Eine Seite = eine Idee** und genau ein Bildschirm hoch (1440×900). Titel ≤ 90 Zeichen, ≈ 60–80 Wörter.
2. **Gleiche linke/rechte Ränder** (Engine: `.inner`, clamp-Padding). Nichts am Rand kleben lassen.
3. **Klartext statt Floskeln:** sagen, was es ist und was es dem Kunden bringt. Keine Buzzword-Ketten, keine
   Bildunterschriften unter Visuals, keine "Lorem"-Texte; Platzhalter nur als `[TBD]`.
4. **Echt vor Dekor:** echte Fotos/UI/Zahlen vor Illustrationen; keine generischen Stock-Looks, keine Kachel-
   Gitter aus identischen Karten ohne Hierarchie. Pro Seite 1 Hero-Element (Visual oder Zahl), Rest unterordnen.
5. **Hierarchie in 3 Stufen:** Kicker (Mono, Akzent) → Titel (groß, enge Laufweite) → Lead (muted). Ein Akzent pro Seite.
6. **Branchen-Disziplin:** Effekt-Szenen (Shader, Partikel, 3D) nur bei technischen Themen; bei Handel/Public/Health
   Fotos, Typo, ruhige Farben (`aurora`/`none`).

## Typografie & Farbe (ui-ux-pro-max, Impeccable)
- Min. 20 px Fließtext bei 1080p-Projektion (Engine: clamp 16–19 px Basis, Lead bis 22 px); Titel 40–106 px.
- Kontrast mindestens WCAG AA (4,5:1 Text, 3:1 große Titel). Muted-Text nie unter 4,5:1 auf der Fläche.
- 1 Akzent + 1 Sekundärakzent; Statusfarben (ok/warn) nur für Bedeutung. Dunkle Themes: Fläche nie reines #000.
- Fonts: System-Stacks (offline). Display eng (-0.03em), Mono nur für Kicker/HUD/Daten.

## Bewegung (Emil, Choreograph, Apple, Animate)
1. **Zweck benennen:** Orientierung (woher/wohin), Zustandswechsel, Erklärung, Delight (nur selten). "Sieht cool aus"
   allein reicht nur für Einstieg und 1–2 Kapitelmomente.
2. **Kurven:** nie `ease-in`/linear für UI; Eingang `cubic-bezier(.23,1,.32,1)`, Bewegung `(.77,0,.175,1)`,
   Slide `(.32,.72,0,1)`. Nie `scale(0)`: von .8–.97 + Opacity.
3. **Nur transform/opacity/filter/clip-path** animieren (kein width/height/top/left); Canvas nur für Hintergrund/Warp.
4. **Choreografie:** ein Eingang pro Container (nicht Eltern *und* Kinder staggern); Lead zuerst, Support kürzer,
   Dekoration nur Fade. Stagger ungleichmäßig (Engine: `95·i^0.8`), gesamt < 1,2 s auf Präsentationen, Seite bleibt
   sofort bedienbar. Ausgang kürzer und gleichzeitig.
5. **Dauer:** Mikro 100–200 ms · Panels 300–500 ms · Seitenübergänge 700–1000 ms · Count-up 1,4–1,8 s.
6. **Unterbrechbar:** Navigation während Übergang wird gemerkt (Engine: letzte Eingabe gewinnt), nie blockieren.
7. **Spatial consistency:** Vorwärts schiebt nach links, zurück nach rechts; Sub-Seite wächst aus dem Klick-Element
   und schrumpft dorthin zurück.
8. **Nicht animieren:** Tastatur-Navigation innerhalb von Seiten, hochfrequente Hover-Listen, Daten die gelesen werden.
9. **Reduced Motion:** Engine kürzt auf ≤ 120 ms, stoppt Hintergrund und Rotationen. Nicht umgehen.

## Interaktion (Taste, Emil)
- Buttons: Hover +1 px, Press `scale(.97)`; Karten mit Link heben 2 px, Spotlight folgt der Maus; Fokus-Ring sichtbar.
- Touch-Ziele ≥ 44 px, Seite `100svh`, `viewport-fit=cover`, kein Hover-only-Inhalt (Hover nur Zusatz).
- Hint-Leiste bei Deck ("← →  ·  Scrollen  ·  M Übersicht  ·  Esc zurück"); Seitenpunkte + Fortschritt immer da.

## Robustheit (break-ui)
Testdaten mit langen Titeln, 0/1/12 Karten, sehr großen Zahlen (1.280.000), fehlenden Feldern. Seiten dürfen intern
scrollen (Engine lässt Rad-Navigation erst am Ende durch), Text darf nie abgeschnitten werden.

## Barrierefreiheit
Landmarken (`main`, `nav`), `aria-label` je Seite, `role=img` + Label bei Charts, Alt-Texte, Tastaturbedienung
(Pfeile, Leertaste, Esc, M, H), sichtbarer Fokus, keine Informationen nur über Farbe.

## Übergänge auf Profi-Niveau (Transition-Craft)
1. **Übergang erzählt:** Er sagt, wie zwei Seiten zusammenhängen. Gleiche Idee weiterführen → Shared Element (`shared`) oder
   `slide`; neues Kapitel → `zoom-through`/`blinds`/`curtain-split`; Szenenwechsel → `depth-dolly`; Sprung in neue Welt → `warp` (leicht) bzw. `warp-tunnel` (filmisch);
   Übersicht → Detail → `portal-dive`; „alles läuft zusammen“ → `data-converge`; Analyse/Ist-Aufnahme → `scan-reveal`;
   Bruch mit dem Status quo → `shatter`; Marken-Moment → `ink-goo`.
2. **Variation mit System:** höchstens 3 verschiedene Übergangstypen pro Deck; je Kapitelgrenze ein "großer", innerhalb eines
   Kapitels immer derselbe "kleine". Richtung konsistent (vor = nach links/vorn, zurück = umgekehrt).
3. **Überlappen statt warten:** neue Seite startet, während die alte noch ausläuft; Text-Entrance beginnt bei 35–50 % des
   Übergangs (`at`), nie danach. Kein Leerlauf-Bild.
4. **Eine Kamera:** Hintergrund beschleunigt mit (`boost`), Blur auf dem Weg nach außen/innen als billiges Motion-Blur, keine
   zweite Bewegung gleichzeitig (kein Zoom plus Slide plus Rotation).
5. **Dauer 0.7–1.1 s** (Ausnahme: der eine filmische Wow-Übergang `warp-tunnel` ≈ 2,3 s), Kurve `(.77,0,.175,1)` für Bewegung, `(.23,1,.32,1)` für Ankunft; schnelles Weiterklicken wird gemerkt
   (letzte Eingabe gewinnt), nie blockiert.
6. **Finish:** `glass` + `grain` für Tiefe auf dunklen Themes, `gradient` nur bei kurzen Titeln; kein Glow-Overkill.
7. **Fokus-Kette (Referenz-Niveau):** Ein Wow-Übergang verbindet zwei *Dinge*, nicht zwei Seiten: Sturzflug in das
   Fokus-Element der alten Seite (Klickpunkt, Bildschirm, Karte) → Tunnel/Ströme → Ankunft im Fokus-Element der neuen Seite
   (Hub, Zahnrad, Grafik). Fokus = Element mit `data-focal`, sonst erstes Visual der Seite, sonst Bildmitte. Dazu passt
   Hintergrund `datafield` (Ströme folgen dem Fokus der aktiven Seite).
8. **Prüfen:** Übergang in Zeitlupe (Chrome DevTools → Animationen 10 %) und auf schwachem Gerät; Reduced Motion testen.

## Delight-Budget pro Deck
1 Eröffnungs-Wow (Hero + Hintergrund) · 1 Kapitelwechsel-Wow (`zoom-through`/`warp-tunnel`/`portal-dive`) · 1 Daten-Moment
(`morph`-Chart oder Count-up) · 1 Interaktions-Moment (Hub-Morph). Alles andere ruhig.
