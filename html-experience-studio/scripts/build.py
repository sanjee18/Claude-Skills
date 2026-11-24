#!/usr/bin/env python3
"""Build one offline single-file HTML from a brief.json.

  python build.py brief.json out.html            # build a deck/site
  python build.py brief.json out.html --gallery  # same + live control panel (library preview)

Images/videos referenced by relative path in the brief are embedded as data URIs (offline).
Prints lint warnings (unknown ids, missing numbers, too much text per page, broken sub-page links).
"""
import argparse, base64, json, mimetypes, re, sys
for _s in (sys.stdout, sys.stderr):   # Windows consoles: never crash on ✓ ✗ → umlauts
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENGINE = ROOT / "assets" / "engine"
ORDER = ["core.js", "bg.js", "bg2.js", "bg3.js", "bg4.js", "text.js", "text2.js", "transitions.js", "transitions2.js", "transitions3.js", "transitions4.js", "scene.js", "scene2.js", "scene3.js", "scene4.js", "fx.js", "text3.js", "text4.js", "pages.js", "pages2.js", "pages3.js", "film.js", "boot.js"]
CSS = ["engine.css", "engine2.css", "engine3.css", "film.css"]
FONTS = ROOT / "assets" / "fonts"
DESIGNS_DIR = ROOT / "assets" / "designs"
# complete design themes (tokens, fonts, components, motion grammar, rules): references/design-themes.md
DESIGNS = {d["id"]: d for d in json.loads((DESIGNS_DIR / "designs.json").read_text(encoding="utf-8"))["designs"]}
FAMILY = {"Inter": "Inter", "Ubuntu": "Ubuntu", "InterTight": "Inter Tight", "JetBrainsMono": "JetBrains Mono",
          "InstrumentSerif": "Instrument Serif", "Geist": "Geist", "GeistMono": "Geist Mono",
          "BarlowCondensed": "Barlow Condensed", "Unbounded": "Unbounded", "SpaceGrotesk": "Space Grotesk"}

# Single source of truth for every library id: assets/library.json (also feeds the library page).
LIB = json.loads((ROOT / "assets" / "library.json").read_text(encoding="utf-8"))
KNOWN = {k: {e["id"] for e in LIB["items"] if e["kind"] == k} for k in ("bg", "tx", "tr", "fx", "page")}
KNOWN["page"] |= {e["id"] for e in LIB["items"] if e["kind"] == "cam"}
KNOWN["bg"].add("none"); KNOWN["tx"].add("none")
KNOWN["mode"] = {"deck", "scroll"}
KNOWN["hub_style"] = {"orbit", "gear", "radial", "constellation"}
VISUALS = {e["id"] for e in LIB["items"] if e["kind"] == "visual"}
ASSET_RE = re.compile(r"\.(png|jpe?g|webp|gif|svg|mp4|webm|glb)$", re.I)
VENDOR = ROOT / "assets" / "vendor"   # three.js – embedded only for 3D model scenes


def warn(msg):
    print("  ! " + msg, file=sys.stderr)


def embed_assets(node, base, stats):
    if isinstance(node, dict):
        return {k: embed_assets(v, base, stats) for k, v in node.items()}
    if isinstance(node, list):
        return [embed_assets(v, base, stats) for v in node]
    if isinstance(node, str) and ASSET_RE.search(node) and not node.startswith(("data:", "http")):
        p = (base / node)
        if p.exists():
            mime = mimetypes.guess_type(p.name)[0] or "application/octet-stream"
            data = p.read_bytes()
            if p.suffix.lower() == ".glb":   # 3D model: gzip it, the engine inflates it (DecompressionStream)
                import gzip
                mime = "model/gltf-binary"
                raw = gzip.decompress(data) if data[:2] == b"\x1f\x8b" else data
                if b"KHR_draco_mesh_compression" in raw[:200000]:
                    warn(f"{node}: Draco-komprimiert – wird offline nicht geladen. Ohne Draco exportieren (Meshopt geht: gltfpack -cc).")
                if len(raw) > 12e6:
                    warn(f"{node}: {len(raw)/1e6:.1f} MB – für flüssige Darstellung < 8 MB anstreben (gltfpack -cc -tc, Texturen 2K).")
                data = data if data[:2] == b"\x1f\x8b" else gzip.compress(data, 9)
            stats["bytes"] += len(data)
            return f"data:{mime};base64," + base64.b64encode(data).decode()
        warn(f"asset not found: {node}")
    return node


def lint(brief):
    ids, sub_ids = set(), set()
    pages = brief.get("pages", [])
    if not pages:
        warn("brief has no pages")
    nav = brief.get("nav", {})
    if nav.get("mode", "deck") not in KNOWN["mode"]:
        warn(f"unknown nav.mode '{nav.get('mode')}' (deck|scroll)")
    if nav.get("transition", "fade-blur") not in KNOWN["tr"]:
        warn(f"unknown nav.transition '{nav.get('transition')}'")
    dz = brief.get("theme", {}).get("design")
    if dz and dz not in DESIGNS:
        warn(f"unknown theme.design '{dz}' ({', '.join(DESIGNS)})")
    for f in brief.get("theme", {}).get("fx", []):
        if f not in KNOWN["fx"]:
            warn(f"unknown theme.fx '{f}' (see assets/library.json kind fx)")
    bg = brief.get("bg", {}).get("id", "none")
    if bg not in KNOWN["bg"]:
        warn(f"unknown bg '{bg}'")

    def words(p):
        txt = " ".join(str(p.get(k, "")) for k in ("title", "sub", "body", "note"))
        for k in ("items", "bullets"):
            for it in p.get(k, []) or []:
                txt += " " + (json.dumps(it, ensure_ascii=False) if isinstance(it, dict) else str(it))
        return len(re.findall(r"\w+", txt))

    def check(p, sub=False):
        pid = p.get("id")
        if not pid:
            warn("page without id")
            return
        if pid in ids or pid in sub_ids:
            warn(f"duplicate id '{pid}'")
        (sub_ids if sub else ids).add(pid)
        t = p.get("type")
        if t not in KNOWN["page"]:
            warn(f"[{pid}] unknown page type '{t}'")
        if p.get("enter") and p["enter"] not in KNOWN["tx"]:
            warn(f"[{pid}] unknown enter '{p['enter']}'")
        if p.get("transition") and p["transition"] not in KNOWN["tr"]:
            warn(f"[{pid}] unknown transition '{p['transition']}'")
        if len(re.sub(r"[*\n]", "", p.get("title", ""))) > 90:
            warn(f"[{pid}] title > 90 chars (one idea per screen)")
        w = words(p)
        if t not in ("html",) and w > (110 if sub else 90):
            warn(f"[{pid}] ~{w} words; presentations read best at <= 60-80 words per screen")
        if t == "stats":
            for it in p.get("items", []):
                if not isinstance(it.get("value"), (int, float)):
                    warn(f"[{pid}] stat '{it.get('label')}' needs a numeric value (never invent numbers; use [TBD] in label if unknown)")
        if p.get("design") and p["design"] not in DESIGNS:
            warn(f"[{pid}] unknown design '{p['design']}'")
        if t == "hub" and p.get("style", "orbit") not in KNOWN["hub_style"]:
            warn(f"[{pid}] unknown hub style '{p.get('style')}' (orbit|gear|radial|constellation)")
        if p.get("visual") and p["visual"].get("type") not in VISUALS:
            warn(f"[{pid}] unknown visual type '{p['visual'].get('type')}'")
        if t == "hub" and not 3 <= len(p.get("items", [])) <= 8:
            warn(f"[{pid}] hub works best with 3-8 items (has {len(p.get('items', []))})")
        for sp in p.get("subpages", []) or []:
            check(sp, True)

    for p in pages:
        check(p)
    for p in pages:
        for it in (p.get("items") or []):
            if isinstance(it, dict) and it.get("to") and it["to"] not in sub_ids:
                warn(f"[{p.get('id')}] item links to unknown sub page '{it['to']}'")
        c = p.get("cta") or {}
        if c.get("open") and c["open"] not in sub_ids:
            warn(f"[{p.get('id')}] cta.open -> unknown sub '{c['open']}'")
        if c.get("to") and c["to"] not in ids:
            warn(f"[{p.get('id')}] cta.to -> unknown page '{c['to']}'")


def design_ids(brief):
    """every design theme the deck uses: theme.design + page.design (also in sub pages)"""
    out = []
    def add(i):
        if i in DESIGNS and i not in out:
            out.append(i)
    add(brief.get("theme", {}).get("design"))
    def walk(ps):
        for p in ps or []:
            add(p.get("design")); walk(p.get("subpages"))
    walk(brief.get("pages"))
    return out


def apply_design(brief):
    """A design theme sets the defaults of the whole deck; anything the brief states explicitly wins."""
    d = DESIGNS.get(brief.get("theme", {}).get("design"))
    if not d:
        if any(DESIGNS.get(p.get("design")) for p in brief.get("pages", [])):
            used = design_ids(brief)
            brief["_designs"] = {i: {k: DESIGNS[i][k] for k in ("tokens", "fonts", "scene", "motion") if k in DESIGNS[i]} for i in used}
        return brief
    m = d["motion"]
    nav = brief.setdefault("nav", {})
    nav.setdefault("mode", m["mode"]); nav.setdefault("transition", m["calm"]); nav.setdefault("enter", m["enter"])
    brief.setdefault("bg", {"id": m["bg"], "intensity": m.get("bgIntensity", 1)})
    brief["theme"].setdefault("fx", list(m.get("fx", [])))
    if d.get("scene"):
        brief.setdefault("scene", d["scene"])
    used = design_ids(brief)
    if len(used) > 1:
        brief["_designs"] = {i: {k: DESIGNS[i][k] for k in ("tokens", "fonts", "scene", "motion") if k in DESIGNS[i]} for i in used}
    for p in brief.get("pages", []):
        if p.get("type") == "hub" and "style" not in p and m.get("hub"):
            p["style"] = m["hub"]
    return brief


def theme_vars(brief, themes):
    t = brief.get("theme", {})
    d = DESIGNS.get(t.get("design"))
    if d:
        p = {**d["tokens"], **{k: v for k, v in t.items() if k not in ("preset", "design", "fx")}}
        font = d["fonts"]
        v = {"--bg": p["bg"], "--surface": p["surface"], "--text": p["text"], "--muted": p["muted"], "--line": p["line"],
             "--accent": p["accent"], "--accent2": p.get("accent2", p["accent"]), "--on-accent": p.get("onAccent", "#000"),
             "--font-d": font["d"], "--font-b": font["b"], "--font-m": font["m"], "--w-d": str(font["wd"])}
        return ";".join(f"{k}:{val}" for k, val in v.items()), p
    preset = themes["presets"].get(t.get("preset", "midnight"))
    if preset is None:
        warn(f"unknown theme preset '{t.get('preset')}', using midnight")
        preset = themes["presets"]["midnight"]
    p = {**preset, **{k: v for k, v in t.items() if k not in ("preset",)}}
    font = themes["fonts"].get(p.get("font", "grotesk"), themes["fonts"]["grotesk"])
    v = {
        "--bg": p["bg"], "--surface": p["surface"], "--text": p["text"], "--muted": p["muted"], "--line": p["line"],
        "--accent": p["accent"], "--accent2": p.get("accent2", p["accent"]), "--on-accent": p.get("onAccent", "#000"),
        "--font-d": font["d"], "--font-b": font["b"], "--font-m": font["m"], "--w-d": str(font["wd"]),
    }
    return ";".join(f"{k}:{val}" for k, val in v.items()), p


def js_json(obj):
    return json.dumps(obj, ensure_ascii=False).replace("</", "<\\/").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")


def font_faces(used=None):
    """Embedded webfonts (offline, licences in assets/fonts/LICENSES.md). Files are named Family-weight[i].woff2.
    used = CSS text naming the families in use: only those are embedded (Inter/Ubuntu always, engine baseline). None = all."""
    out = []
    for f in sorted(FONTS.glob("*.woff2")):
        stem, w = f.stem.split("-")
        fam = FAMILY.get(stem, stem)
        if used is not None and stem not in ("Inter", "Ubuntu") and fam not in used:
            continue
        out.append("@font-face{font-family:'%s';font-style:%s;font-weight:%s;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2')}"
                   % (fam, "italic" if w.endswith("i") else "normal", w.rstrip("i"), base64.b64encode(f.read_bytes()).decode()))
    return "\n".join(out)


def design_css(ids):
    return "\n".join((DESIGNS_DIR / f"{i}.css").read_text(encoding="utf-8") for i in ids if (DESIGNS_DIR / f"{i}.css").exists())


def engine_css(design_ids=(), used=None):
    return (font_faces(used) + "\n" + "\n".join((ENGINE / f).read_text(encoding="utf-8") for f in CSS)
            + "\n" + design_css(design_ids))


def uses_model(node):
    """True when any scene (deck, page, design) is a 3D model scene -> three.js gets embedded."""
    if isinstance(node, dict):
        if node.get("kind") == "model":
            return True
        return any(uses_model(v) for v in node.values())
    if isinstance(node, list):
        return any(uses_model(v) for v in node)
    return False


def engine_js(three=False):
    js = "\n".join((ENGINE / f).read_text(encoding="utf-8") for f in ORDER)
    return ((VENDOR / "three-r147.js").read_text(encoding="utf-8") + "\n;\n" + js) if three else js


def assemble(brief, themes, head_js="", tail_js="", all_designs=False, three=False):
    """all_designs: embed every design theme + font (library / gallery, switchable at runtime via html[data-design])."""
    vars_css, _ = theme_vars(brief, themes)
    dz = brief.get("theme", {}).get("design")
    ids = list(DESIGNS) if all_designs else design_ids(brief)
    used = None if all_designs else vars_css + design_css(ids) + js_json(brief.get("_designs", {}))
    attr = f' data-design="{dz}"' if dz in DESIGNS else ""
    shell = (ROOT / "assets" / "shell.html").read_text(encoding="utf-8")
    meta = brief.get("meta", {})
    return (shell.replace("{{LANG}}", meta.get("lang", "de")).replace("{{TITLE}}", re.sub(r"[<>&]", "", meta.get("pageTitle", meta.get("title", "Presentation"))))
            .replace("{{HTML_ATTR}}", attr).replace("{{THEME_VARS}}", vars_css).replace("{{ENGINE_CSS}}", engine_css(ids, used))
            .replace("{{BRIEF_JSON}}", js_json(brief)).replace("{{EXTRA_HEAD_JS}}", head_js)
            .replace("{{ENGINE_JS}}", engine_js(three or uses_model(brief))).replace("{{EXTRA_TAIL_JS}}", tail_js))



# ---------------------------------------------------------------------------------------------------------------
# Quality gate: the minimum standard (reference level) is checked mechanically, so it does not depend on the model
# or on how detailed the interview answers were. A failing deck is not built; --draft builds anyway (marked DRAFT).
WOW = {"warp-tunnel", "portal-dive", "shatter", "data-converge", "warp", "zoom-through", "curtain-split", "depth-dolly",
       "ink-goo", "scan-reveal", "lens-sweep", "morph-open", "cube", "flip", "band-reveal"}
EMBED = {"photo", "particles", "duotone", "glow", "blueprint", "mono", "hotspots", "gallery", "device", "video", "model"}


def _assets_in(node):
    out = []
    if isinstance(node, dict):
        for k, v in node.items():
            if k in ("scene",):
                continue
            out += _assets_in(v)
    elif isinstance(node, list):
        for v in node:
            out += _assets_in(v)
    elif isinstance(node, str) and ASSET_RE.search(node) and not node.startswith("data:"):
        out.append(node)
    return out


def quality(brief):
    """returns (passed, rows) – rows = [(ok, rule, hint)]"""
    pages = brief.get("pages", [])
    rows = []
    def rule(ok, name, hint):
        rows.append((bool(ok), name, hint))

    design = brief.get("theme", {}).get("design")
    rule(design in DESIGNS, "Design-Theme gesetzt (theme.design)",
         "Ohne Design-Theme entsteht der Folien-Look. Eines der Themes aus references/design-themes.md wählen.")
    rule(brief.get("scene") or any(p.get("type") == "hotspots" for p in pages),
         "Signature-Szene vorhanden (Hauptdarsteller über alle Seiten)",
         "scene aus dem Design-Theme übernehmen oder eigene media/particles-Szene setzen.")
    rule(pages and pages[0].get("type") in ("hero", "hotspots", "kinetic", "flyover", "particle-form", "media", "end-card"),
         "Erste Seite ist ein Hero-Moment", "Mit hero/kinetic/hotspots beginnen, nicht mit Agenda oder Text.")
    used = {p.get("transition") for p in pages[1:]} - {None}
    rule(len(pages) < 5 or used & WOW, "Kapitel- und Wow-Übergänge gesetzt (page.transition)",
         "An Kapitelgrenzen motion.chapter, an der stärksten Stelle genau einmal motion.wow setzen.")
    wows = [p["id"] for p in pages if p.get("transition") in {"warp-tunnel", "portal-dive", "shatter", "warp"}]
    rule(len(wows) <= 2, "Höchstens 2 große Wow-Übergänge", f"Zu viele: {wows}. Wow nutzt sich ab.")
    types = [p.get("type") for p in pages]
    rule(len(pages) < 6 or len(set(types)) >= 4, "Abwechslung: ≥ 4 verschiedene Seitentypen bei ≥ 6 Seiten",
         f"Nur {sorted(set(types))}. Zahl → number, Bereiche → hub, Ablauf → steps/timeline, Zitat → quote.")
    streak = max((len(list(g)) for _, g in __import__("itertools").groupby(types)), default=0)
    rule(streak <= 2, "Nie mehr als 2 gleiche Seitentypen hintereinander", "Seitentypen mischen.")
    heavy = []
    for p in pages:
        txt = " ".join(str(p.get(k, "")) for k in ("title", "sub", "body", "note"))
        for k in ("items", "bullets"):
            for it in p.get(k, []) or []:
                txt += " " + (json.dumps(it, ensure_ascii=False) if isinstance(it, dict) else str(it))
        if p.get("type") not in ("html", "hotspots") and len(re.findall(r"\w+", txt)) > 90:
            heavy.append(p.get("id"))
    rule(not heavy, "≤ 90 Wörter pro Seite (eine Idee pro Bildschirm)", f"Kürzen oder in Sub-Seiten auslagern: {heavy}")
    grids = [p.get("id") for p in pages if p.get("type") in ("cards", "bento") and len(p.get("items", [])) > 4]
    rule(not grids, "Keine Kartenraster mit mehr als 4 Karten", f"In hub mit Sub-Seiten oder big-list umbauen: {grids}")
    loose = []
    for p in pages:
        for a in _assets_in(p):
            if not (p.get("embed") in EMBED or (isinstance(p.get("visual"), dict) and p["visual"].get("embed") in EMBED)
                    or p.get("type") in ("hotspots",)):
                loose.append(f"{p.get('id')}:{a}")
    sc = brief.get("scene") or {}
    if sc.get("kind") == "media" and not sc.get("treat"):
        loose.append("scene:" + str(sc.get("src")))
    rule(not loose, "Jedes Bild/Video hat eine bewusste Einbettung (embed/treat)",
         "Nutzer fragen, WIE es eingebettet wird: particles (Figur aus Lichtpunkten), duotone/glow/blueprint (in die "
         "Farbwelt), hotspots (Produkt-Bühne), gallery (3D-Bogen), device/photo (gerahmt), video. Offen: " + ", ".join(loose[:6]))
    tbd = sum(json.dumps(p, ensure_ascii=False).count("[TBD") for p in pages)
    rule(True, f"Offene Punkte [TBD]: {tbd}", "Vor Kundeneinsatz klären.")
    return all(ok for ok, _, _ in rows), rows


def print_quality(rows, passed):
    n = sum(1 for ok, _, _ in rows if ok)
    print(f"\nQualitäts-Gate (Mindeststandard): {n}/{len(rows)} {'BESTANDEN' if passed else 'NICHT BESTANDEN'}")
    for ok, name, hint in rows:
        print(("  ✓ " if ok else "  ✗ ") + name + ("" if ok else "\n      → " + hint))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("brief"), ap.add_argument("out")
    ap.add_argument("--gallery", action="store_true", help="include the live control panel")
    ap.add_argument("--draft", action="store_true", help="build even if the quality gate fails (marked as draft)")
    a = ap.parse_args()

    bpath = Path(a.brief).resolve()
    brief = json.loads(bpath.read_text(encoding="utf-8"))
    themes = json.loads((ROOT / "assets" / "themes.json").read_text(encoding="utf-8"))

    print(f"Linting {bpath.name} ...")
    lint(brief)
    brief = apply_design(brief)
    if not a.gallery:
        passed, rows = quality(brief)
        print_quality(rows, passed)
        if not passed and not a.draft:
            print("\n  Nicht gebaut. Punkte oben beheben (Brief anpassen) und erneut bauen. Nur für Zwischenstände: --draft", file=sys.stderr)
            sys.exit(3)
        if not passed:
            brief.setdefault("meta", {})["title"] = "[ENTWURF] " + brief.get("meta", {}).get("title", "")

    stats = {"bytes": 0}
    brief = embed_assets(brief, bpath.parent, stats)

    head_js = tail_js = ""
    if a.gallery:
        head_js = ("<script>window.__GALLERY=true;window.__THEMES=" + js_json(themes) + ";window.__LIB=" + js_json(LIB)
                   + ";window.__DESIGNS=" + js_json(list(DESIGNS.values())) + ";</script>")
        tail_js = "<script>\n" + (ENGINE / "gallery.js").read_text(encoding="utf-8") + "\n</script>"
    html = assemble(brief, themes, head_js, tail_js, all_designs=a.gallery)

    out = Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding="utf-8")
    mb = out.stat().st_size / 1e6
    print(f"OK  {out}  ({mb:.2f} MB, embedded assets {stats['bytes']/1e6:.2f} MB)")
    if mb > 15:
        warn("file > 15 MB: compress images (WebP, max 1920px) / models")


if __name__ == "__main__":
    main()
