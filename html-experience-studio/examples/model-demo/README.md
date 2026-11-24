# 3D-Modell-Szene · Demo

`Drohne_3D_Demo.html` – im Browser öffnen (Pfeiltasten). Zeigt die Szene `scene.kind = "model"`:
Röntgen-Scan beim Start, Kamerafahrt pro Seite, leuchtende Bauteile mit Annotationen, Blaupause mit Explosionsansicht,
Hologramm mit GLB-Animation (Rotoren), Punktwolke.

- `inspection-drone.glb` – prozedurales Demo-Modell (eigene Arbeit, MIT), erzeugt mit `python tools/make_demo_model.py`.
  Benannte Bauteile (Battery, LiDAR, Gimbal, Motor_FL …) und ein Animations-Clip `Rotors`.
- `drone.brief.json` – der Brief. Neu bauen: `python scripts/build.py examples/model-demo/drone.brief.json examples/model-demo/Drohne_3D_Demo.html`

Eigenes Modell: `.glb` neben den Brief legen, `python scripts/new_brief.py out/brief.json … --asset "auto.glb=model"`
erzeugt Shots und listet die Bauteilnamen für `notes`/`focus`. Gute Quellen: CAD-Export (STEP → Blender → GLB),
Hersteller-Modelle, Blender (`references/blender-from-photos.md`). Ziel: < 8 MB. Komprimierung mit Meshopt geht (`gltfpack -cc`), Draco nicht (dann ohne Draco exportieren).
