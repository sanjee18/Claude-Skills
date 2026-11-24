#!/usr/bin/env python3
"""Build the Motion Library page (one offline HTML file with live previews of every library item).

  python build_library.py                     # -> <skill>/library.html
  python build_library.py out/library.html --rec "bg:aurora,tx:blur-words" --theme paper
      --rec / --theme only print the URL hash to open with (recommendations are passed via the hash,
      the file itself stays generic).
"""
import argparse, json, subprocess, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build  # noqa: E402

ROOT = build.ROOT
LIBDIR = ROOT / "assets" / "library"


def bundle_worlds(lib):
    """assets/worlds/<file>.html -> tools/_worlds/<file>.html (three, fonts, scrollstage inlined) -> {file: html} for the library iframes."""
    out = ROOT / "tools" / "_worlds"
    out.mkdir(parents=True, exist_ok=True)
    worlds = {}
    for it in lib["items"]:
        if not it.get("file"):
            continue
        sub = "signature" if it["kind"] == "sig" else "worlds"
        src, dst = ROOT / "assets" / sub / (it["file"] + ".html"), out / (it["file"] + ".html")
        r = subprocess.run([sys.executable, str(Path(__file__).resolve().parent / "studio_bundle.py"), str(src), str(dst)], capture_output=True, text=True, encoding="utf-8")
        if r.returncode != 0 or "ERROR" in r.stdout:
            build.warn(f"world {it['file']}: {r.stdout}{r.stderr}")
            continue
        worlds[it["file"]] = dst.read_text(encoding="utf-8")
    return worlds


def write_catalog(lib, themes):
    """references/catalog.md is generated from assets/library.json so docs never drift from the engine."""
    cost = {1: "●", 2: "●●", 3: "●●●"}
    md = ["# Katalog (generiert aus `assets/library.json`, nicht von Hand bearbeiten)", "",
          "Live ansehen und auswählen: `library.html`. Neu erzeugen: `python scripts/build_library.py`.",
          "Kosten = Rechenlast: ● gering · ●● mittel · ●●● hoch.", ""]
    for kind, meta in lib["kinds"].items():
        its = [i for i in lib["items"] if i["kind"] == kind]
        md += [f"## {meta['label']} ({len(its)}) · Feld `{meta['field']}`", ""]
        if kind == "design":
            md += ["Komplette Designsprache (Tokens, Schriften, Bauteile, Bewegung, Verbote). Details: `references/design-themes.md`.", "",
                   "| ID | Name | Wirkung | Bewegung (Titel · ruhig / Kapitel / Wow · Hintergrund) | Stimmung |", "|---|---|---|---|---|"]
            for i in its:
                m = i["motion"]
                md.append(f"| `{i['id']}` | {i['name']} | {i['tagline']} | {m['enter']} · {m['calm']} / {m['chapter']} / {m['wow']} · {m['bg']} | {', '.join(i['moods'])} |")
        elif kind == "look":
            md += ["| ID | Name | Wirkung | Theme · Modus · Hintergrund · Übergang · Titel · Finish | Stimmung |", "|---|---|---|---|---|"]
            for i in its:
                s = i["set"]
                md.append(f"| `{i['id']}` | {i['name']} | {i['desc']} | {s['theme']} · {s['mode']} · {s['bg']} · {s['tr']} · {s['enter']} · {', '.join(s.get('fx', [])) or '–'} | {', '.join(i['moods'])} |")
        else:
            md += ["| ID | Name | Wirkung | Passt zu | Stimmung | Kosten |", "|---|---|---|---|---|---|"]
            for i in its:
                extra = f" (automatisch: {i['how']})" if i.get("auto") else ""
                md.append(f"| `{i['id']}` | {i['name']} | {i['desc']}{extra} | {i.get('use', '')} | {', '.join(i.get('moods', []))} | {cost.get(i.get('cost', 1))} |")
        md.append("")
    md += ["## Themes (`theme.preset`)", "", "| Preset | Schrift | Hintergrund | Akzent | Notiz |", "|---|---|---|---|---|"]
    for k, p in themes["presets"].items():
        md.append(f"| `{k}` | {p['font']} | {p['bg']} | {p['accent']} | {p['note']} |")
    md += ["", "Eigene Farben: jedes Feld (`bg surface text muted line accent accent2 onAccent font`) im Brief überschreiben.",
           "Hub-Stile (`style` bei `type:\"hub\"`): `orbit` (Standard, neutral) · `constellation` · `radial` · `gear` (nur Technik/Maschine).", ""]
    (ROOT / "references" / "catalog.md").write_text("\n".join(md), encoding="utf-8")
    print("OK  references/catalog.md")


def write_design_doc():
    """references/design-themes.md: generated from assets/designs/designs.json (one source of truth)."""
    md = ["# Design-Themes (generiert aus `assets/designs/designs.json`, nicht von Hand bearbeiten)", "",
          "Ein Design-Theme ist die **komplette Designsprache** eines Decks: Farbrollen, Schriftpaar, Bauteil-Stil, Layout,",
          "Bildsprache, Bewegungsgrammatik und Verbote. Im Brief: `\"theme\": {\"design\": \"<id>\"}`. Es setzt die Standards",
          "für `nav.mode`, `nav.transition` (ruhig), `nav.enter`, `bg`, `theme.fx` und den Hub-Stil; alles, was im Brief",
          "ausdrücklich steht, gewinnt. Farben einzeln überschreibbar (`theme.accent` usw.), Kontrast danach prüfen.", "",
          "**Übergangsrollen:** `ruhig` = Standard innerhalb eines Kapitels (nav.transition), `Kapitel` = an Kapitelgrenzen als",
          "`page.transition` setzen, `Wow` = genau 1× pro Deck an der stärksten Stelle.", "",
          "**Neues Theme anlegen:** Eintrag in `designs.json` (Felder wie unten) + `assets/designs/<id>.css` (alle Regeln mit",
          "`[data-design=<id>]` beginnen; Bauteile: `.t .acc .kicker .lead .card .tile .btn .stat .num .node .bul .vis-ring`).",
          "Neue Schrift: OFL-Latin-woff2 als `Family-Gewicht.woff2` nach `assets/fonts`, Name in `FAMILY` in `build.py`,",
          "Lizenz in `assets/fonts/LICENSES.md`. Danach `python scripts/build_library.py`.", "",
          "**Signature-Szene (das Wichtigste):** Jedes Theme hat einen Hauptdarsteller, der über alle Seiten bestehen bleibt und",
          "pro Seite einen neuen Shot bekommt (`assets/engine/scene.js` WebGL-Partikel, `scene2.js` DOM-Szenen). Seiten sind",
          "Kamera-Einstellungen, keine Folien: links eine schmale Textspalte, rechts die Szene; Karten werden zu Listen, Diagramme",
          "in `split` übernimmt die Szene. Pro Seite überschreibbar: `page.scene = {shape, cam, text}`. Formen: ring sphere globe",
          "galaxy helix wave terrain tunnel brain lattice scatter text numeral (Kennzahl der Seite als Partikel-Typo).",
          "Kamera: `{az, el, dist, x, y, fov}`. Szenen-Arten: `particles` · `morph-ui` · `cards3d` (eigene Bilder: `scene.images`) · `type`.", ""]
    for d in build.DESIGNS.values():
        m, r, t = d["motion"], d["rules"], d["tokens"]
        md += [f"## {d['name']} · `{d['id']}`", "", f"*{d['tagline']}* {d['desc']}", "",
               f"- **Passt zu:** {d['use']} · Stimmung: {', '.join(d['moods'])} · Ton: {d['tone']}",
               f"- **Farben:** bg `{t['bg']}` · surface `{t['surface']}` · text `{t['text']}` · muted `{t['muted']}` · accent `{t['accent']}` · accent2 `{t['accent2']}`",
               f"- **Schriften:** Titel {d['fonts']['d'].split(',')[0]} ({d['fonts']['wd']}) · Text {d['fonts']['b'].split(',')[0]} · Mono {d['fonts']['m'].split(',')[0]}",
               f"- **Bewegung:** Titel `{m['enter']}` · ruhig `{m['calm']}` · Kapitel `{m['chapter']}` · Wow `{m['wow']}` · Hintergrund `{m['bg']}` · Finish {', '.join(m.get('fx', [])) or '–'} · Hub `{m.get('hub', 'orbit')}` · Modus `{m['mode']}` · {m['tempo']}",
               f"- **Signature-Szene:** `{d.get('scene', {}).get('kind', '–')}`" + (" · Shots: " + " → ".join(s.get('shape', '') for s in d['scene'].get('shots', [])) if d.get('scene', {}).get('shots') else ""),
               f"- **Layout:** {r['layout']}", f"- **Typo:** {r['type']}", f"- **Bauteile:** {r['components']}",
               f"- **Bilder:** {r['imagery']}", f"- **Signature:** {r['signature']}",
               f"- **Verboten:** {' · '.join(d['banned'])}", "", "Steckbrief (für eigene Seiten / `type:\"html\"` und als Prompt):", "",
               "> " + d["prompt"], ""]
    (ROOT / "references" / "design-themes.md").write_text("\n".join(md), encoding="utf-8")
    print("OK  references/design-themes.md")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out", nargs="?", default=str(ROOT / "library.html"))
    ap.add_argument("--rec", default="", help="comma list kind:id to mark as recommended")
    ap.add_argument("--theme", default="", help="theme preset for all previews")
    a = ap.parse_args()

    lib = json.loads((ROOT / "assets" / "library.json").read_text(encoding="utf-8"))
    # retired items stay valid for the quick-mode engine (old briefs keep building) but leave the moodboard
    lib["items"] = [i for i in lib["items"] if not i.get("retired")]
    themes = json.loads((ROOT / "assets" / "themes.json").read_text(encoding="utf-8"))
    # design themes come first: they set the whole design language, everything else refines it
    lib["kinds"] = {"design": {"label": "Design-Themes", "field": "theme.design"}, **lib["kinds"]}
    lib["items"] = [dict(d, kind="design", cost=2) for d in build.DESIGNS.values()] + lib["items"]
    # signature scenes that need own material (3D model): shown as their own tab, set in the brief as scene.kind
    lib["kinds"] = {"design": lib["kinds"]["design"], "scene": {"label": "3D-Szenen", "field": "scene.kind = model"},
                    **({"sig": lib["kinds"]["sig"]} if "sig" in lib["kinds"] else {}),
                    **({"world": lib["kinds"]["world"]} if "world" in lib["kinds"] else {}),
                    **{k: v for k, v in lib["kinds"].items() if k not in ("design", "world", "sig")}}
    lib["items"] = lib["items"][:len(build.DESIGNS)] + [
        {"id": "model", "kind": "scene", "name": "3D-Modell als Held (GLB)", "cost": 3,
         "desc": "Echtes 3D-Modell über alle Seiten: Kamerafahrt pro Seite, Röntgen-Scan als Übergang, Bauteile leuchten, Annotationen am Objekt, Blaupause mit Explosionsansicht, Hologramm, Punktwolke.",
         "use": "Fahrzeug, Maschine, Gerät, Gebäude, Produkt – wenn ein physisches Objekt der Held ist (GLB aus Blender, CAD, Hersteller)",
         "moods": ["technisch", "futuristisch", "präzise", "dramatisch"]}] + lib["items"][len(build.DESIGNS):]

    keys = {f"{i['kind']}:{i['id']}" for i in lib["items"]}
    for k in filter(None, a.rec.split(",")):
        if k not in keys:
            build.warn(f"--rec: unknown item '{k}'")
    if a.theme and a.theme not in themes["presets"]:
        build.warn(f"--theme: unknown preset '{a.theme}'")

    media = {}
    vdir = ROOT / "examples" / "veyra" / "media"
    for key, fn in {"exterior": "exterior-polished.png", "hoodF": "hood-hover-forward.mp4", "hoodR": "hood-hover-reverse.mp4", "drive": "drive-blue.png", "green": "config/electric-green.png"}.items():
        f = vdir / fn
        if f.exists():
            media[key] = ("data:video/mp4;base64," if fn.endswith(".mp4") else "data:image/png;base64,") + __import__("base64").b64encode(f.read_bytes()).decode()
    glb = ROOT / "examples" / "model-demo" / "inspection-drone.glb"
    if glb.exists():
        media["drone"] = "data:model/gltf-binary;base64," + __import__("base64").b64encode(__import__("gzip").compress(glb.read_bytes(), 9)).decode()
    head = ("<script>window.__MEDIA=" + build.js_json(media) + ";</script><script>window.__GALLERY=true;window.__THEMES=" + build.js_json(themes) + ";window.__DESIGNS=" + build.js_json(list(build.DESIGNS.values())) + ";</script>"
            "<style>body.pv #chrome{display:none}</style>")
    tail = "<script>\n" + (LIBDIR / "preview.js").read_text(encoding="utf-8") + "\n</script>"
    preview = build.assemble({"meta": {"title": "preview"}, "pages": []}, themes, head, tail, all_designs=True, three=True)

    worlds = bundle_worlds(lib)
    posters = {}
    pdir = ROOT / "assets" / "library" / "posters"
    if pdir.exists():
        for f in pdir.glob("*.jpg"):
            posters[f.stem.replace("__", ":")] = "data:image/jpeg;base64," + __import__("base64").b64encode(f.read_bytes()).decode()
    (ROOT / "tools").mkdir(exist_ok=True)
    (ROOT / "tools" / "_preview.html").write_text(preview, encoding="utf-8")   # used by tools/posters.cjs
    page = f"""<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Motion Library</title>
<style>{(LIBDIR / "ui.css").read_text(encoding="utf-8")}</style></head>
<body>
<script>window.__WORLDS={build.js_json(worlds)};window.__POSTERS={build.js_json(posters)};window.__LIBPATH={build.js_json(str(Path(a.out).resolve()))};window.__LIB={build.js_json(lib)};window.__THEMES={build.js_json(themes)};window.__PREVIEW={build.js_json(preview)};</script>
<script>{(LIBDIR / "ui.js").read_text(encoding="utf-8")}</script>
</body></html>"""
    out = Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page, encoding="utf-8")
    n = len(lib["items"])
    print(f"OK  {out}  ({out.stat().st_size / 1e6:.2f} MB, {n} items)")
    write_catalog(lib, themes)
    write_design_doc()
    h = "&".join(x for x in [a.rec and "rec=" + a.rec, a.theme and "theme=" + a.theme] if x)
    if h:
        print(f"Open with: {out.resolve().as_uri()}#{h}")


if __name__ == "__main__":
    main()
