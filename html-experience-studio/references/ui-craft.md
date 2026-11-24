# UI-Craft: die Oberfläche auf Produkt-Launch-Niveau

**Pflichtlektüre vor jedem Bau** (alle Bauarten). Die 3D-/Shader-Welt allein macht keine Referenz-Qualität: der Unterschied
zwischen „ordentlich“ und „wie ein Apple-/Linear-/Vercel-Launch“ liegt in der **Oberfläche**: Typo-Rhythmus, Pills,
Glas, Abstände, Hover-Physik. Diese Datei hält die Werte fest, die Code `assets/studio/experience.css` liefert
(`<link rel="stylesheet" href="studio:experience">`). Maßstab: ein Vollbild-Hero eines SaaS-Launches (Video-Hintergrund,
Glas-Navigation, zentrierte Headline mit gedimmter zweiter Hälfte, weiße + Glas-Pill) und die Capgemini-Invent-SDV-Referenz
(Intro mit Bild + Sweep, HUD, Zahnrad-Hub, Rail mit zwei Punktgruppen).

## §1 Die Hero-Formel (Intro-Seite und jede Seite mit Bühnen-Charakter)

| Schicht (unten → oben) | Wert | Klasse |
|---|---|---|
| Medium | Vollbild, **bewegt**: WebGL/Shader, Canvas, three.js, Foto mit Licht-Sweep, oder ein Video des Nutzers (`autoplay muted loop playsinline`, `object-cover`). Kein Verlauf als Ersatz, keine kostenpflichtige Generierung. | `.x-media > video` |
| Schleier | `rgba(0,0,0,.10)` über dem Medium, **nicht mehr** – das Bild soll leuchten | `.x-media::after` |
| Scrim | gerichtet, nur wo Text steht: unten (`0deg, .7 → 0 @42 %`) oder links (`90deg, .78 → 0 @58 %`) | `.x-scrim-b` / `.x-scrim-l` |
| Navigation | oben, **nicht** fixiert, `py 16–20 px`, `px 20/24/48/64 px` je Breakpoint; Logo-Mark 28 px + Wortmarke 18–20 px `tracking-tight` | `.x-nav`, `.x-logo` |
| Inhalt | **oben ausgerichtet, nicht vertikal zentriert**: Abstand zur Nav 64/80/96 px, `text-center`, `max-width ≈ 48rem` | Projekt |
| Headline | 30 → 72 px (sm…xl), `line-height 1.03–1.05`, `tracking -0.02…-0.03em`, Gewicht 400–500 (nicht fett!) | `.x-h-hero` |
| Gedimmte Hälfte | zweiter Gedanke in derselben Zeile **60 % Weiß**, gleiche Größe/Gewicht: „Bridge the gaps. *Ditch the grindwork.*“ | `.x-dim` |
| Unterzeile | 14 → 18 px, `leading-relaxed`, 80 % Weiß, `max-width 28rem`, Abstand 24–32 px | `.x-lead` |
| CTAs | **zwei** nebeneinander, `gap 12–16 px`: ① solide **weiße Pill** (`#fff`, Text `gray-900`, 14 px 600, `px 20–24 py 10–12`) ② **Liquid-Glass-Pill** (weißer Text, Hover `bg-white/10`) | `.x-btn`, `.x-btn.liquid-glass.glass` |

**Zeilenumbrüche sind Gestaltung:** Die Headline wird von Hand in 2–3 Zeilen gesetzt (`<span class="x-ln"><span>…`), der
Schnitt fällt zwischen zwei Gedanken, die gedimmte Hälfte beginnt mitten in der Zeile. Nie den Browser umbrechen lassen
(`white-space:nowrap` je Zeile, Größe per `clamp()` so wählen, dass es bei 1280 px passt).

## §2 Typo-Grammatik

- **Eine** Display-Schrift (Grotesk mit engem Tracking: Inter Tight, Geist, Ubuntu für Capgemini; selbst gehostet über
  `studio-fonts`) + Text-Schrift (Inter) + Mono für Quellen/Labels. „Helvetica Now“ und andere Lizenzschriften nur mit Lizenz
  des Nutzers einbetten; Ersatz ohne Lizenz: Inter Tight 500.
- Größen: Hero 34–96 · XL 34–76 · L 26–46 · Lead 15–19 · Small 13 · Eyebrow 11 px/600/`.2em`/Versalien mit 22-px-Strich davor.
- **Gewicht 500 für Headlines** (600+ wirkt nach Template), negatives Tracking wächst mit der Größe.
- Eyebrow → Headline → Lead → Aktion: immer diese Reihenfolge, Abstände 18 / 22 / 28 px.
- Zahlen: `tabular-nums`, Einheit in 35 % Größe daneben, Quelle in Mono darunter.

## §3 Liquid Glass (exaktes Rezept, nicht „ungefähr“)

```css
.liquid-glass{background:rgba(255,255,255,.01);background-blend-mode:luminosity;backdrop-filter:blur(4px);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.1);position:relative;overflow:hidden}
.liquid-glass::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1.4px;pointer-events:none;
  background:linear-gradient(180deg,rgba(255,255,255,.45) 0%,rgba(255,255,255,.15) 20%,transparent 40% 60%,
    rgba(255,255,255,.15) 80%,rgba(255,255,255,.45) 100%);
  -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
```
Wirkung: ein **Rand aus Licht** (oben und unten hell, Mitte unsichtbar), fast keine Füllung, 4 px Blur. Funktioniert nur
über einem lebendigen Hintergrund (Video, Bild, Shader). Einsatz: Sekundär-CTA, Dropdowns, Umschalter, Chips über Medien.
**Achtung:** `.liquid-glass` setzt `position:relative` – Dropdowns brauchen `position:absolute !important` (`.x-dd` hat es).
Für Inhalts-Panels auf dunklem Grund: `.glass-panel` (stärkerer Blur, Hairline, Schatten), nicht Liquid Glass.

## §4 Komponenten (alle in `experience.css`)

| Komponente | Werte | Verhalten |
|---|---|---|
| Pill solid `.x-btn` | 46 px hoch, Radius 999, 14 px 600, weißer Glow-Schatten | Hover: `bg .9` + 1 px hoch, Pfeil wandert 3 px; Active: `scale .98` |
| Pill glass `.x-btn.liquid-glass.glass` | wie oben, weißer Text | Hover `bg-white/10` |
| Pill ghost `.x-btn.ghost` | 1 px `line-2`-Rand | für die dritte Aktion (z. B. „Ansprechpartner“) |
| Nav-Dropdown `.x-nav-i > .x-dd.liquid-glass` | `top:100%`, Radius 12, `py 12 px-8`, `min-width 160`, Items 14 px, `white/80 → white`, `hover:bg-white/5` | öffnet bei Hover/Fokus, `dropdown-in` 0,2 s (`translateY(-4) scale(.96)` → 0), Chevron dreht 180° |
| Mobil-Menü | `bg-[Grundton]/95 backdrop-blur-xl rounded-2xl p-6`, Unterpunkte eingerückt, Fußzeile mit Rand + beiden CTAs | rein mit `cubic-bezier(.16,1,.3,1)` 400 ms; Icon Menu↔X mit Rotation/Scale/Opacity 300 ms |
| HUD-Chip `.x-chip` | 34 px, 12,5 px 500, `text-2` | Hover: Glasfläche + Hairline |
| Umschalter (Ära, Vorher/Nachher) | Pill-Container 4 px Padding, gleitender Hintergrund-Knopf `.9s ease` | Zustand per `data-state`, Inhalt reagiert |
| Fortschritt `.x-progress` | Text + 2-px-Balken, Akzentfarbe | bindet sich an `data-x-progress-text/bar` |
| Hinweis-Zeile `.x-hint` | unten mittig, `<kbd>→</kbd>` + nächstes Ziel | verschwindet während Übergängen |

## §5 Bewegung der Oberfläche

- Easing: `--x-ease` `cubic-bezier(.22,1,.36,1)` (Standard-Austritt), `--x-ease-io` `(.65,0,.35,1)` (Übergänge),
  `--x-expo` `(.16,1,.3,1)` (Masken, Menüs). Nie `ease`/`linear` für sichtbare Bewegung.
- Eintritt: Headline-Zeilen per Maske (`.x-ln`, 1,2 s, 120 ms Versatz), alles andere `[data-in]` steigt 22 px aus 10 px Blur
  (110 ms Staffel). Austritt gerichtet und schneller (Übergang übernimmt).
- Hover hat **Physik**: kleine Wege (1–10 px), 0,3–0,6 s, kein Farbsprung ohne Bewegung.
- Ambient: höchstens eine Dauerbewegung pro Seite (Zahnrad dreht 160 s/Umdrehung, Video, Partikel), nie mehrere.

## §6 Responsiv (ist Teil der Qualität, nicht Nacharbeit)

Breakpoints wie Tailwind (640 / 768 / 1024 / 1280). Padding `20 → 24 → 48 → 64 px`. Nav-Links < 860 px weg → Menü-Knopf.
Hub: Zahnrad oben, Text unten. Jede Seite wird in `studio_frames.cjs --mobile` angesehen; Hochformat bekommt eine **eigene**
Anordnung, nicht eine geschrumpfte.

## §7 Anti-Standard: woran man Template-Output erkennt (sofort ersetzen)

- Headline fett (700+), zentriert in der Bildschirmmitte, darunter drei gleich große Karten mit Icon.
- Hintergrund ist ein Verlauf oder Partikelnetz statt eines Mediums mit Inhalt.
- Buttons eckig oder mit Rahmen in Akzentfarbe; nur **ein** Button-Stil im ganzen Deck.
- Jede Seite: Eyebrow + H2 + Absatz links, Bild rechts. Gleiche Komposition zweimal hintereinander.
- Keine gedimmte Hälfte, kein Rhythmus in den Zeilen; Browser bricht um.
- Übergänge überall gleich (Fade) – siehe `experience-architecture.md` §4.
- Glas ohne lebendigen Untergrund (sieht grau aus); Blur > 20 px auf kleinen Elementen.
