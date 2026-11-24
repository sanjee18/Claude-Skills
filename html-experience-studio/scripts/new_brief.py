#!/usr/bin/env python3
"""Create a high-level brief skeleton (reference level) from a few answers. The structure, design theme, signature
scene, transition roles and page rhythm are fixed here, so the result does not depend on the model or on how detailed
the interview was. Claude then only replaces the [TBD: …] placeholders with real content and builds.

  python scripts/new_brief.py out/brief.json --title "RVT & Invent Alignment" --message "Ein Satz, der hängen bleibt" \
      --audience "Bereichsleitung Entwicklung" --pages 10 --world technisch --org "Capgemini Invent" \
      --chapters "Ausgangslage;Fahrzeug;Portfolio;Use Cases" --levers "ADAS;Infotainment;Plattform;Agents;SDV OM;SOP" \
      --asset "media/auto.png=hotspots" --asset "media/elefant.png=particles" --mode deck --lang de

--world maps a theme in plain words to a design theme (or use --design <id>).
--asset file=embed: particles | duotone | glow | blueprint | hotspots | gallery | device | photo | video | model (.glb -> 3D-Szene)
"""
import argparse, json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build  # noqa: E402

WORLD = [  # keyword -> design theme (first match wins); keep in sync with SKILL.md "Autopilot"
    (r"techn|sdv|auto|fahrzeug|automotive|daten|plattform|\bit\b|cloud|system", "data-transfer"),
    (r"ki|ai|forschung|deep ?tech|vision|labor", "particle-tech"),
    (r"auge|sehen|wahrnehm|computer vision|kamera", "nova-iris"),
    (r"launch|engine|3d|creative|studio|wow", "lumora-orb"),
    (r"weltraum|space|kosmos|stern|universum|warteliste", "event-horizon"),
    (r"versicher|finanz|bank|enterprise|risiko", "anchor-field"),
    (r"produkt|gerät|hardware|maschine|industrie-design|konfigur", "veyra-studio"),
    (r"health|gesund|bio|medizin|longevity|dna", "velvion-health"),
    (r"floral|blume|blüte|garten|kosmetik|pflanze", "bloom-garden"),
    (r"logistik|transport|industrie|swiss|infrastruktur|operations", "swiss-logistics"),
    (r"editorial|magazin|kultur|verlag|bericht|geschichte|archiv", "editorial-archive"),
    (r"saas|app|ui|ux|software|developer|tool", "product-mono"),
    (r"keynote|apple|präsentation|management|pitch", "keynote-glass"),
]


def pick_design(world, fallback="particle-tech"):
    w = (world or "").lower()
    for rx, d in WORLD:
        if re.search(rx, w):
            return d
    return fallback


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("--title", required=True); ap.add_argument("--message", default="[TBD: die eine Botschaft in einem Satz]")
    ap.add_argument("--audience", default=""); ap.add_argument("--org", default="")
    ap.add_argument("--pages", type=int, default=9); ap.add_argument("--world", default=""); ap.add_argument("--design", default="")
    ap.add_argument("--chapters", default=""); ap.add_argument("--levers", default="")
    ap.add_argument("--asset", action="append", default=[]); ap.add_argument("--mode", default="")
    ap.add_argument("--lang", default="de"); ap.add_argument("--auto", type=int, default=0, help="seconds per page (kiosk)")
    a = ap.parse_args()

    design = a.design or pick_design(a.world + " " + a.title + " " + a.message)
    if design not in build.DESIGNS:
        sys.exit(f"unknown design {design}: {', '.join(build.DESIGNS)}")
    m = build.DESIGNS[design]["motion"]
    chapters = [c.strip() for c in a.chapters.split(";") if c.strip()] or ["Ausgangslage", "Lösung", "Wirkung"]
    levers = [c.strip() for c in a.levers.split(";") if c.strip()]
    assets = [x.split("=", 1) + ["photo"] for x in a.asset]
    assets = [(x[0], x[1]) for x in assets]
    T = "[TBD: {}]".format

    # page pool in narrative order; each one idea, varied types, hero first, CTA last
    pool = []
    pool.append({"id": "start", "type": "hero", "kicker": a.org or T("Anlass · Datum"), "title": a.title, "sub": a.message,
                 "cta": {"label": "Start", "to": "why"}})
    pool.append({"id": "why", "type": "statement", "kicker": chapters[0], "title": T("Spannung in einem Satz: was heute nicht funktioniert"),
                 "sub": T("ein Satz Kontext")})
    pool.append({"id": "proof", "type": "number", "kicker": chapters[0], "value": 0, "suffix": "", "label": T("Kennzahl mit Quelle – nie erfinden"),
                 "transition": m["chapter"]})
    model = next((p for p, e in assets if e == "model" or p.lower().endswith(".glb")), None)
    for path, emb in assets:   # every asset gets a deliberate stage
        if path == model:
            continue           # the 3D model becomes the signature scene (below), not a page
        if emb == "hotspots":
            pool.append({"id": "explore", "type": "hotspots", "title": T("Produkt erkunden"), "sub": T("Hinweis zum Erkunden"), "src": path, "ratio": "16 / 9",
                         "points": [{"x": 30, "y": 50, "label": T("Punkt 1"), "text": T("kurz")}, {"x": 60, "y": 60, "label": T("Punkt 2"), "text": T("kurz")}],
                         "transition": m["chapter"]})
        else:
            pool.append({"id": "visual-" + Path(path).stem, "type": "split", "kicker": chapters[min(1, len(chapters) - 1)], "title": T("Aussage zum Bild"),
                         "bullets": [T("Beleg 1"), T("Beleg 2")], "visual": {"type": "image", "src": path, "embed": emb, "alt": T("Bildbeschreibung")}})
    if levers:
        pool.append({"id": "portfolio", "type": "hub", "kicker": chapters[min(1, len(chapters) - 1)], "title": T("Ein Portfolio. *N Hebel.*"),
                     "core": a.org or T("Kern"), "coreHint": "Bereich anklicken",
                     "items": [{"title": l, "text": T("ein Satz"), "to": "lever-" + str(i)} for i, l in enumerate(levers)],
                     "subpages": [{"id": "lever-" + str(i), "type": "split", "kicker": l, "title": T(l + ": Kernaussage"),
                                   "bullets": [T("Problem"), T("Ansatz"), T("Mehrwert")]} for i, l in enumerate(levers)],
                     "transition": m["wow"]})
    pool.append({"id": "how", "type": "steps", "kicker": chapters[min(1, len(chapters) - 1)], "title": T("So lösen wir es"),
                 "items": [{"label": "Problem", "title": T("Problem"), "text": T("ein Satz")}, {"label": "Lösung", "title": T("Lösung"), "text": T("ein Satz")},
                           {"label": "Mehrwert", "title": T("Mehrwert"), "text": T("ein Satz")}]})
    pool.append({"id": "impact", "type": "stats", "kicker": chapters[-1], "title": T("Wirkung in *Zahlen*"),
                 "items": [{"value": 0, "label": T("Kennzahl 1 mit Quelle")}, {"value": 0, "suffix": "%", "label": T("Kennzahl 2 mit Quelle")}],
                 "transition": m["chapter"]})
    pool.append({"id": "road", "type": "timeline", "kicker": chapters[-1], "title": T("Die nächsten Schritte"),
                 "items": [{"label": T("Wann"), "title": T("Schritt"), "text": T("kurz")} for _ in range(3)]})
    pool.append({"id": "voice", "type": "quote", "title": T("Zitat – nur echt und freigegeben"), "author": T("Name"), "role": T("Rolle")})
    pool.append({"id": "principles", "type": "big-list", "kicker": chapters[-1], "title": T("Woran wir uns messen"), "items": [T("Prinzip 1"), T("Prinzip 2"), T("Prinzip 3")]})
    end = {"id": "next", "type": "cta", "title": T("Der eine nächste Schritt"), "cta": {"label": T("Termin vereinbaren"), "to": "start"},
           "contacts": [{"label": T("Ansprechpartner"), "value": T("Name · E-Mail")}]}

    n = max(4, a.pages)
    keep = [p for p in pool if p["type"] in ("hero", "hotspots", "hub")] + [p for p in pool if p["id"].startswith("visual-")]
    rest = [p for p in pool if p not in keep]
    pages = sorted(keep + rest[: max(0, n - 1 - len(keep))], key=lambda p: pool.index(p)) + [end]
    if not any(p.get("transition") in (m["wow"],) for p in pages) and len(pages) > 4:
        pages[len(pages) // 2]["transition"] = m["wow"]
    brief = {"meta": {"title": a.title, "org": a.org, "lang": a.lang, "audience": a.audience},
             "theme": {"design": design}, "nav": {"mode": a.mode or m["mode"]}, "pages": pages}
    if a.auto:
        brief["nav"]["auto"] = a.auto
    if model:   # 3D model as hero: one camera shot per page, looks change at chapter pages (scan wipe)
        parts = glb_parts(Path(a.out).parent / model) or glb_parts(Path(model))
        note = lambda k: {"at": parts[k % len(parts)] if parts else T("Bauteilname im Modell"), "label": T("Bauteil"), "text": T("ein Satz")}
        rota = [{"az": 35, "el": 14, "dist": 5.6, "x": .28},
                {"az": 80, "el": 10, "dist": 3.8, "x": .22, "look": "xray", "focus": [T("Bauteil, das leuchten soll")], "notes": [note(0), note(1)]},
                {"az": -30, "el": 28, "dist": 4.2, "x": .22, "notes": [note(2)]},
                {"az": 20, "el": 22, "dist": 5.4, "x": .2, "look": "blueprint", "explode": .6},
                {"az": 140, "el": 12, "dist": 4.4, "x": .2, "look": "points"},
                {"az": 210, "el": 16, "dist": 4.6, "x": .22}]
        shots = [dict(rota[0])] + [dict(rota[1 + (k % (len(rota) - 1))]) for k in range(len(pages) - 2)] + [dict(rota[-1])]
        brief["scene"] = {"kind": "model", "src": model, "look": "studio", "intro": "scan", "spin": 3, "shots": shots[:len(pages)]}
        if parts:
            print("Bauteile im Modell (für notes.at / focus):", ", ".join(parts[:40]))
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text(json.dumps(brief, ensure_ascii=False, indent=1), encoding="utf-8")
    tbd = json.dumps(brief, ensure_ascii=False).count("[TBD")
    print(f"OK {a.out}: {len(pages)} Seiten, Design {design}, Szene {brief.get('scene', build.DESIGNS[design].get('scene', {})).get('kind')}, {tbd} Platzhalter [TBD] zu füllen.")
    print("Nächster Schritt: alle [TBD: …] mit echten Inhalten ersetzen (nichts erfinden), dann build.py.")


def glb_parts(p):
    """named mesh nodes of a .glb (plain or gzipped) – what notes.at / focus can point at"""
    try:
        import gzip, struct
        raw = p.read_bytes()
        if raw[:2] == b"\x1f\x8b":
            raw = gzip.decompress(raw)
        if raw[:4] != b"glTF":
            return []
        n = struct.unpack("<I", raw[12:16])[0]
        j = json.loads(raw[20:20 + n])
        return [x["name"] for x in j.get("nodes", []) if x.get("name") and "mesh" in x]
    except Exception:
        return []


if __name__ == "__main__":
    main()
