# VEYRA – Referenz-Beispiel für `hotspots` + `veyra-studio`

Interaktive Produkt-Bühne nach **VEYRA — Electric, inside out.** (v1.0.0) von Amir Mušić,
https://github.com/amirmushichge/veyra-interactive-car

- `media/` enthält die aktiven Medien des Releases **unverändert** (Bytes wie im Release; nicht skaliert, nicht neu komprimiert).
- Lizenz: MIT für Code und – soweit die Rechte des Autors reichen – für die mitgelieferten Konzeptbilder und Videos.
  Siehe `LICENSE-VEYRA.txt` und `THIRD_PARTY_NOTICES-VEYRA.md` (KI-generierte Bilder, Hover-Filme mit Kling 3.0 via Pika,
  After-Effects-Finishing). Keine Rechte an Marken oder Persönlichkeitsrechten. Hinweis bei Weitergabe beibehalten.
- VEYRA ist eine fiktive Designstudie, kein Hersteller; keine Reichweiten-, Leistungs- oder Preisangaben.
- Dies ist eine **Adaption** in die Engine dieses Skills (Seitentyp `hotspots`), keine 1:1-Kopie des React-Codes:
  Layout, Texte, Koordinaten, Farben, Schrift und Medien folgen dem Release; die Interaktionslogik ist neu geschrieben.

Bauen: `python scripts/build.py examples/veyra/veyra.brief.json examples/veyra/VEYRA_v1.html` (≈ 20 MB, da Originale unverändert).
