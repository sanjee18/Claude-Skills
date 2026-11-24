# 3D-Modell aus Referenzfotos mit Blender (Modul)

Für Seiten mit 3D-Objekt (Fahrzeug, Maschine, Gerät, Produkt). Ergebnis: `.blend` + `.glb` (≤ 3 MB für die Einbettung).
Voraussetzungen: Blender mit MCP-Add-on verbunden (sonst Python-Skripte schreiben und lokal ausführen), Referenzbilder
in `references/`. Keine kostenpflichtigen KI-3D-Dienste. Skills nutzen: `blender-modeler`, `hard-surface` /
`vehicle-artist` / `prop-artist` (je nach Objekt), `retopology`, `materials`, `lighting`, `rendering`, `qa-review`,
`export-pipeline`, `asset-optimization`.

## Vor dem Start klären (max. 4 Fragen)
1. Objekt + Variante (z. B. "Modell/Version X", Farbe, Ausstattung)? 2. Referenzbilder vorhanden (Front, Heck, Seite,
oben, Details, Innenraum)? 3. Verwendungszweck (Hero-Objekt, Röntgen-Szene, Detailansicht, nur Silhouette)?
4. Offizielle Maße vorhanden (Quelle/Datei)? Ohne Quelle: als **Schätzung** kennzeichnen.

## Auftragsvorlage (an Claude/Blender-MCP; Platzhalter ersetzen)
```
Du arbeitest als erfahrener {{Hard-Surface/Automotive}}-Modeler, Blender Technical Artist und Visualisierer.
Erstelle in Blender ein sauberes, möglichst originalgetreues 3D-Modell von {{OBJEKT/VARIANTE}} anhand der Bilder
in `references/`.

OBERSTES ZIEL: Silhouette und Proportion korrekt; danach Oberflächenqualität, Bauteiltrennung, Details.
Fotorealistisches Rendering darf ungenaue Geometrie nicht kaschieren.

EINSCHRÄNKUNGEN
- Nur Blender und lokale Assets; keine bezahlten/externen Generierungs-APIs.
- Keine nicht sichtbaren Details erfinden; unbekannte Bereiche markieren und weitere Referenzen anfordern.
- Referenzen sind meist perspektivisch (keine Blaupausen): Perspektive, Verdeckung, Bewegungsunschärfe
  berücksichtigen; keine millimetergenaue Rekonstruktion behaupten.
- Reale Maße nur aus verifizierter, im Projekt vorhandener Quelle; Quelle + Werte in MODEL_NOTES.md.
- Keine Box-Karosserie/Low-Poly-Platzhalter als Endergebnis, keine aufgemalten Details wo Geometrie gehört.
- Fehlen die Bilder: Download-Skripte nicht blind ausführen, sondern Anleitung zum lokalen Ausführen geben.

PHASE 0 – Bestandsaufnahme: Dateien prüfen → reference_analysis.md (Ansicht, sichtbar/verdeckt, Formmerkmale,
Widersprüche) + Liste fehlender Ansichten.
PHASE 1 – Maßstab & Blockout: metrische Einheiten; Koordinatensystem dokumentieren (X Länge, Y Breite, Z Höhe);
Achsen/Radstand/Spur/Überhänge aus Daten oder gekennzeichneten Schätzungen; nur Hauptvolumen; Kameras
(Front/Heck/Seite/3-4); Clay-Render. **STOPP: Vorschau zeigen, auf Freigabe warten.**
PHASE 2 – Hauptflächen: kontrollierte glatte Flächen, Quad-Topologie, saubere Übergänge; bewegliche Teile separat;
Reflexionsprüfung mit großen Area-Lights + neutraler Studio-HDRI; Fehler beheben. **STOPP: Freigabe.**
PHASE 3 – Sekundärgeometrie: Leuchten/Linsen, Lufteinlässe, Verglasung, Spiegel, Griffe, Räder/Reifen, Verkleidungen
als echte Geometrie (keine schwebenden Decals).
PHASE 4 – Innenraum (falls gefordert): Armaturen/Cockpit, Lenkrad, Displays, Sitze. Erklärende Text-Labels aus den
Referenzen NICHT modellieren.
PHASE 5 – Materialien: Lack (Metallic+Clearcoat), Glas, Gummi, Kunststoffe, Chrom; Mikro-Rauheit sparsam.
PHASE 6 – QA: Renderings (Seite, Front, Heck, 3/4 vorn, 3/4 hinten, oben, ggf. Cockpit); Symmetrie, Radposition,
Dachlinie, Überhänge, Fugen prüfen → Fehlerliste → iterativ korrigieren.

TECHNIK: Collections 01_BODY 02_GLASS 03_LIGHTS 04_WHEELS 05_TRIM 06_INTERIOR 07_DETAILS 08_CAMERAS_LIGHTS;
sinnvolle Namen; nicht-destruktive Modifier; Polygonzahl gezielt; regelmäßig Versionen speichern; `.blend` + `.glb`
(FBX optional); MODEL_NOTES.md mit Annahmen, verifizierten Maßen, offenen Punkten.
ARBEITSMODUS: kleine prüfbare Schritte; nach jeder Phase speichern, rendern, prüfen. Nie "fertig" behaupten, wenn es
nicht in Blender geprüft wurde. Beginne nur mit Phase 0 und 1, zeige den Blockout-Render, warte auf Feedback.
```

## Danach: ins HTML bringen
1. `asset-optimization` + `export-pipeline`: GLB mit meshopt/Draco, Texturen WebP ≤ 1024 px, Zielgröße ≤ 3 MB.
2. Einbetten: bei Automotive-Story Skript `embed_model.py` aus Skill `interactive-sdv-presentation`; allgemein
   three.js (inline min.js) + GLTFLoader, GLB als base64 → Effekt P2 (Röntgen-Scan) oder Showcase-Drehung.
3. Lizenz/Urheber in Credits, Markenlogos am Modell nur mit Freigabe, ggf. de-badgen.
4. Fallback ohne WebGL: Standbild (Render) als `media`-Seite.

## Qualitätskontrolle
Bild-Overlay-Vergleich Referenz ↔ Render (gleiche Kamera), Fehlerliste mit Prioritäten, offene Punkte benennen statt
raten. Ergebnisse aus Fotos sind eine Annäherung und gehören als solche gekennzeichnet.
