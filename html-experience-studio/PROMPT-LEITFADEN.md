# Prompt-Leitfaden: Webseiten und Präsentationen auf Senior-Webdesigner-Niveau

Für Kolleginnen und Kollegen, die mit `/html-experience-studio` arbeiten. Der Skill fragt fehlende Punkte zwar selbst nach,
aber **je präziser der erste Prompt, desto weniger Runden und desto höher das Niveau**.

Das Ziel ist nicht „eine schöne Folie in HTML“, sondern ein Erlebnis wie eine Apple- oder Tesla-Keynote:
**ein lebendiger Hauptdarsteller, wenig Text, große ruhige Typo, jede Seite eine Kamera-Einstellung, ein Wow-Moment.**

---

## 1. Fünf Regeln, die den Unterschied machen

1. **Sag, wofür, nicht wie.** Ziel, Publikum, Anlass und die eine Botschaft zuerst. Effekte kommen danach.
2. **Gib dem Design einen Hauptdarsteller.** Ein Objekt, das über alle Seiten bleibt und sich verwandelt (Fahrzeug,
   Partikel-Skulptur, Globus, Produkt-Render, Video). Ohne Hauptdarsteller wird es PowerPoint.
3. **Zeig Referenzen statt Adjektive.** „Modern und fancy“ sagt nichts. Zwei Screenshots, ein Video oder ein Link sagen alles.
4. **Nenne die Grenzen.** Was ist verboten (z. B. Kartenraster, Glow, erfundene Zahlen), wie groß darf die Datei sein,
   wie wird es gezeigt (live, Link, Messe-Screen).
5. **Liefere echtes Material.** Logo, CI-Farben, Zahlen mit Quelle, Produktbilder, Clips. Fehlt etwas: `[TBD]` schreiben
   lassen, nie erfinden lassen.

---

## 2. Vorlage zum Kopieren

Ausfüllen, was du weißt; Unbekanntes einfach weglassen – der Skill fragt nach.

```text
/html-experience-studio

<ziel>
Was soll entstehen (Präsentation / Webseite / Scroll-Story / Produkt-Bühne)?
Anlass und die EINE Botschaft, die hängen bleiben soll:
</ziel>

<publikum>
Wer schaut zu? Was sollen sie danach denken, fühlen, tun?
</publikum>

<einsatz>
Live präsentiert (Beamer/TV) · per Link verschickt · Messe-Bildschirm · Tablet · Handy?
Dauer bzw. Umfang: ca. __ Seiten / Abschnitte. Pflichtteile: Agenda, Team, Kontakt, Demo …
Sprache: Deutsch / Englisch.
</einsatz>

<material>
Liegt bei: Folien, Texte, Zahlen (mit Quelle), Logo (SVG/PNG), CI-Farben (Hex), Bilder, Renders, Videos.
Was fehlt und als [TBD] markiert werden soll:
</material>

<welt_und_gefuehl>
Grundthema / Welt: z. B. technisch, Natur, floral, Weltraum, editorial, Luxus, Retro – oder eigene Metapher:
Gefühl in 3 Wörtern:
Referenzen (Links, Screenshots, Videos) und was genau daran gefällt:
</welt_und_gefuehl>

<design>
Design-Theme aus der Library (falls schon bekannt), z. B. data-transfer, lumora-orb, veyra-studio, bloom-garden:
Ein Design für alles – oder Kapitel bewusst unterschiedlich (welches Kapitel, welche Welt)?
</design>

<hauptdarsteller>
Was ist der Held, der über alle Seiten bleibt und sich verwandelt?
(Partikel-Skulptur, Globus, Fahrzeug, Produkt mit Hotspots, eigenes Video, morphendes UI-Element …)
Der eine Wow-Moment: wo, und was passiert dort?
</hauptdarsteller>

<seiten>
1. Einstieg – Botschaft:
2. … – Botschaft:
3. … – Botschaft:
(je Seite EINE Aussage, max. 60–80 Wörter)
</seiten>

<verboten>
z. B. Kartenraster, Icon-Kacheln, Glow-Overkill, erfundene Zahlen, Stockfotos, mehr als ein Akzent.
</verboten>

<lieferung>
Eine Offline-HTML-Datei, Versionsnummer im Namen, max. __ MB, funktioniert auch am Handy.
Vor dem Bauen: Storyboard-Tabelle zur Bestätigung zeigen.
</lieferung>
```

---

## 3. Drei ausgefüllte Beispiele

### Beispiel A – Workshop-Präsentation (live, Automotive/SDV)

```text
/html-experience-studio

<ziel>
Interaktive Präsentation statt PowerPoint für einen Workshop zum Software-Defined Vehicle.
Botschaft: „Wir machen aus Fahrzeugdaten ein System, das sich selbst verbessert.“
</ziel>

<publikum>
Bereichsleitung Entwicklung bei einem OEM, technisch versiert, wenig Zeit.
Danach sollen sie sagen: „Das will ich im Detail sehen“ und einen Deep-Dive-Termin vereinbaren.
</publikum>

<einsatz>
Live auf einem 75-Zoll-Screen, ich steuere mit Pfeiltasten. Ca. 12 Seiten, 20 Minuten.
Pflicht: Agenda, Portfolio mit 6 Bereichen zum Anklicken, 2 Use Cases, Kontakt. Sprache Englisch.
</einsatz>

<material>
Anbei: alte PPTX (Texte übernehmen), Fahrzeug-Render (PNG, freigestellt), 3 Kennzahlen mit Quelle im Notizfeld.
Fehlende Zahlen bitte als [TBD] markieren.
</material>

<welt_und_gefuehl>
Welt: technisch, „Daten fließen durchs Fahrzeug“. Gefühl: präzise, ruhig, futuristisch.
Referenz: Screenshot 1 (Datenströme laufen in ein Zahnrad), Screenshot 2 (Lumora: leuchtende Kugel mit Orbit-Ringen).
Gefällt: dunkle Bühne, ein Objekt im Zentrum, dünne Mono-Labels, ein großer Moment.
</welt_und_gefuehl>

<design>
Grundsätzlich data-transfer. Kapitel „Fahrzeug erkunden“ bewusst anders: veyra-studio als Produkt-Bühne
mit Hotspots (Antrieb, Batterie, Software-Updates).
</design>

<hauptdarsteller>
Cyan-Partikelwelt: Datentunnel → Globus mit Routen → Kennzahlen aus Partikeln → Architektur-Gitter.
Wow: Übergang vom Fahrzeug-Cockpit ins Portfolio-Zahnrad als Datentransfer-Warp.
</hauptdarsteller>

<seiten>
1. Titel – „From vehicle data to a self-improving system.“
2. Ausgangslage – eine Zahl, die das Problem zeigt [TBD]
3. Fahrzeug erkunden – Produkt-Bühne mit 3 Hotspots
4. Portfolio – Zahnrad-Hub mit 6 Bereichen, jeder mit Deep-Dive
5.–6. Use Cases – je Problem → Lösung → Mehrwert
7. Kontakt – 2 Ansprechpartner
</seiten>

<verboten>
Kartenraster, Stockfotos, erfundene Zahlen, mehr als ein Warp, Warm-Töne.
</verboten>

<lieferung>
Eine Offline-HTML, < 15 MB, Name SDV_Workshop_v1.html. Erst Storyboard zeigen, dann bauen.
</lieferung>
```

### Beispiel B – Produkt-Launch-Webseite (per Link verschickt)

```text
/html-experience-studio

<ziel>
One-Pager zum Launch unserer KI-Plattform, verschickt als Link. Botschaft: „KI, die mitdenkt – in Echtzeit.“
</ziel>
<publikum>Entscheider in Versicherungen; sollen sich für eine Demo anmelden.</publikum>
<einsatz>Scroll-Seite, Desktop und Handy, ca. 6 Abschnitte, Englisch.</einsatz>
<material>Logo SVG, Farben #2FD8FF / #1D4DFF, 4 Kundenlogos (Freigabe liegt vor), Produkt-Screenshot.</material>
<welt_und_gefuehl>
Welt: Weltraum/Energie. Gefühl: mutig, lebendig, hochwertig.
Referenz: Lumora-Orb aus der Library (leuchtende Flüssig-Kugel mit Orbit-Ringen), Event Horizon für den Schluss.
</welt_und_gefuehl>
<design>lumora-orb durchgehend; letzter Abschnitt event-horizon (Wirbel oben, zentrierter Call-to-Action).</design>
<hauptdarsteller>
Die Kugel bleibt im Zentrum; die Ringe kippen pro Abschnitt, die Kugel wandert nach rechts, wenn Text kommt.
Wow: Portal-Flug in die Produkt-Demo.
</hauptdarsteller>
<seiten>
1. Hero – „The next leap in living intelligence.“  2. Problem in einem Satz  3. Wie es funktioniert (3 Schritte)
4. Produkt-Screenshot im Geräterahmen  5. Kundenlogos als Chips  6. „Join the waitlist“
</seiten>
<verboten>Kartenraster, Serifen, Preise, Testimonials ohne Freigabe.</verboten>
<lieferung>Offline-HTML, < 10 MB, Launch_Site_v1.html.</lieferung>
```

### Beispiel C – Nachhaltigkeits-Story mit eigenem Video (Messe-Bildschirm)

```text
/html-experience-studio

<ziel>Loop-fähige Scroll-Story für den Messestand: „Wir messen, was die Natur leistet.“</ziel>
<publikum>Messebesucher, 30 Sekunden Aufmerksamkeit; sollen am Stand nachfragen.</publikum>
<einsatz>Messe-Screen ohne Bedienung (Auto-Weiter alle 8 s) + Tablet zum selbst Durchklicken. 5 Seiten, Deutsch.</einsatz>
<material>Drohnenvideo (12 s, MP4, ohne Ton), 2 Landschaftsfotos, 3 Messwerte mit Quelle.</material>
<welt_und_gefuehl>Natur trifft Präzision. Ruhig, hell, glaubwürdig. Referenz: Field Lab aus der Library.</welt_und_gefuehl>
<design>bloom-garden durchgehend.</design>
<hauptdarsteller>
Das Drohnenvideo als Szene (media): jede Seite springt an eine andere Stelle und zoomt; Text links mit weicher Maske.
Wow: Scan-Linie legt die Messwerte über die Landschaft frei.
</hauptdarsteller>
<seiten>1. Titel über dem Video  2.–4. je ein Messwert mit Quelle  5. QR-Code zum Gespräch [TBD]</seiten>
<verboten>Neon, dunkle Flächen, erfundene Werte.</verboten>
<lieferung>Offline-HTML, Video unverändert eingebettet, Name Messe_Natur_v1.html.</lieferung>
```

---

## 3b. Eigene Bilder und Videos: sag, WIE sie eingebettet werden

Ein Foto „einfach rein“ wirkt wie ein Fremdkörper. Gib pro Datei an, wie es Teil der Welt wird:

| Datei | Schwach | Stark |
|---|---|---|
| elefant.jpg | „Bau den Elefanten ein.“ | „Elefant als **Figur aus Lichtpunkten** (particles) im Sternenhimmel, auf Seite 3.“ |
| auto.png | „Hier ist unser Auto.“ | „Auto als **Produkt-Bühne** (hotspots): Antrieb, Batterie, Software; Detailbilder anbei.“ |
| team.jpg | „Teamfoto rein.“ | „Teamfoto **duotone** in unseren Akzentfarben, gerahmt auf der Kontaktseite.“ |
| fahrzeug.glb | „Zeig das Auto in 3D.“ | „Fahrzeug als **3D-Held** (model): Seite 1 Studio-Fahrt, Seite 3 Röntgen-Scan – Akku und Steuergerät leuchten mit Labels, Seite 5 Explosionsansicht.“ |
| drohne.mp4 | „Video als Hintergrund.“ | „Drohnenvideo als **Szene**: jede Seite springt an eine andere Stelle, Text links mit Maske.“ |

Optionen: particles · duotone · glow · blueprint · mono · hotspots · gallery · video · device · photo · model (echtes 3D-Modell als `.glb` – Blender, CAD-Export oder vom Hersteller).

## 4. Kurzversion (wenn es schnell gehen muss)

```text
/html-experience-studio
Präsentation für [Anlass] vor [Publikum], ca. [N] Seiten, live/Link.
Botschaft: „[ein Satz]“. Welt/Gefühl: [3 Wörter], Referenz: [Link/Screenshot oder Library-Theme].
Held: [Objekt/Video/Produkt], Wow-Moment: [wo]. Material anbei, fehlende Zahlen als [TBD].
Erst Storyboard zeigen.
```

---

## 5. Schwach vs. stark

| Schwach | Stark |
|---|---|
| „Mach eine moderne, fancy Präsentation.“ | „Dunkle Bühne, ein Fahrzeug als Held, dünne Mono-Labels – wie Screenshot 1.“ |
| „Füg coole Animationen ein.“ | „Ein Wow-Moment: Datentransfer-Warp vom Cockpit ins Portfolio. Sonst ruhige Blenden.“ |
| „Zeig unsere Zahlen.“ | „3 Kennzahlen aus Anlage X (Quelle Folie 4); die erste soll sich aus Partikeln formen.“ |
| „Mach es wie Apple.“ | „Ein Objekt pro Seite im Zentrum, große Typo, keine Kartenraster, Bewegung mit Unschärfe.“ |
| „Ein paar Seiten.“ | „12 Seiten, 20 Minuten live, Pflicht: Agenda, Portfolio, 2 Use Cases, Kontakt.“ |
| „Irgendwas mit Natur.“ | „Welt: Natur trifft Präzision. Theme bloom-garden, eigenes Drohnenvideo als Szene.“ |

---

## 6. Checkliste vor dem Absenden

- [ ] Botschaft in **einem** Satz
- [ ] Publikum und gewünschte Reaktion
- [ ] Einsatz (live / Link / Messe) und **Seitenzahl**
- [ ] **Welt/Thema** und 1–3 Referenzen (Link, Screenshot, Video oder Library-Theme)
- [ ] **Ein Design oder mehrere** (welches Kapitel welche Welt)
- [ ] **Hauptdarsteller** und **ein** Wow-Moment
- [ ] Material angehängt; fehlende Werte als `[TBD]`
- [ ] Verbote genannt
- [ ] Lieferformat und max. Dateigröße
- [ ] „Erst Storyboard zeigen“

---

## 7. Gute Feedback-Prompts für die zweite Runde

- „Seite 3 wirkt wie eine Folie: Kartenraster raus, die Szene soll die Aussage tragen, Text als schmale Spalte.“
- „Der Held ist auf Seite 2–4 zu groß und überdeckt den Titel – Objekt weiter nach rechts, kleiner.“
- „Zu viele verschiedene Übergänge. Innen nur fade-blur, an Kapitelgrenzen zoom-through, einmal warp-tunnel.“
- „Die Kennzahl auf Seite 5 soll sich aus Partikeln formen und die anderen zwei als Liste daneben.“
- „Kapitel 2 soll eine andere Welt sein: bloom-garden statt data-transfer, Übergang dorthin als scan-reveal.“
- „Mach daraus v2, alles andere bleibt.“

Tipp: In der **Motion Library** (`library.html`) Themes und Bausteine live ansehen, mit ＋ auswählen,
„Auswahl kopieren“ und in den Prompt einfügen – das ersetzt lange Beschreibungen.
