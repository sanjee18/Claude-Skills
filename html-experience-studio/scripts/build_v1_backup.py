#!/usr/bin/env python3
"""Build one offline single-file HTML from a brief.json.

  python build.py brief.json out.html            # build a deck/site
  python build.py brief.json out.html --gallery  # same + live control panel (library preview)

Images/videos referenced by relative path in the brief are embedded as data URIs (offline).
Prints lint warnings (unknown ids, missing numbers, too much text per page, broken sub-page links).
"""
import argparse, base64, json, mimetypes, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENGINE = ROOT / "assets" / "engine"
ORDER = ["core.js", "bg.js", "bg2.js", "text.js", "text2.js", "transitions.js", "transitions2.js", "fx.js", "pages.js", "pages2.js", "boot.js"]
CSS = ["engine.css", "engine2.css"]

# Single source of truth for every library id: assets/library.json (also feeds the library page).
LIB = json.loads((ROOT / "assets" / "library.json").read_text(encoding="utf-8"))
KNOWN = {k: {e["id"] for e in LIB["items"] if e["kind"] == k} for k in ("bg", "tx", "tr", "fx", "page")}
KNOWN["bg"].add("none"); KNOWN["tx"].add("none")
KNOWN["mode"] = {"deck", "scroll"}
KNOWN["hub_style"] = {"orbit", "gear", "radial", "constellation"}
VISUALS = {e["id"] for e in LIB["items"] if e["kind"] == "visual"}
ASSET_RE = re.compile(r"\.(png|jpe?g|webp|gif|svg|mp4|webm)$", re.I)


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


def theme_vars(brief, themes):
    t = brief.get("theme", {})
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


def engine_css():
    return "\n".join((ENGINE / f).read_text(encoding="utf-8") for f in CSS)


def engine_js():
    return "\n".join((ENGINE / f).read_text(encoding="utf-8") for f in ORDER)


def assemble(brief, themes, head_js="", tail_js=""):
    vars_css, _ = theme_vars(brief, themes)
    shell = (ROOT / "assets" / "shell.html").read_text(encoding="utf-8")
    meta = brief.get("meta", {})
    return (shell.replace("{{LANG}}", meta.get("lang", "de")).replace("{{TITLE}}", re.sub(r"[<>&]", "", meta.get("title", "Presentation")))
            .replace("{{THEME_VARS}}", vars_css).replace("{{ENGINE_CSS}}", engine_css())
            .replace("{{BRIEF_JSON}}", js_json(brief)).replace("{{EXTRA_HEAD_JS}}", head_js)
            .replace("{{ENGINE_JS}}", engine_js()).replace("{{EXTRA_TAIL_JS}}", tail_js))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("brief"), ap.add_argument("out")
    ap.add_argument("--gallery", action="store_true", help="include the live control panel")
    a = ap.parse_args()

    bpath = Path(a.brief).resolve()
    brief = json.loads(bpath.read_text(encoding="utf-8"))
    themes = json.loads((ROOT / "assets" / "themes.json").read_text(encoding="utf-8"))

    print(f"Linting {bpath.name} ...")
    lint(brief)

    stats = {"bytes": 0}
    brief = embed_assets(brief, bpath.parent, stats)

    head_js = tail_js = ""
    if a.gallery:
        head_js = "<script>window.__GALLERY=true;window.__THEMES=" + js_json(themes) + ";window.__LIB=" + js_json(LIB) + ";</script>"
        tail_js = "<script>\n" + (ENGINE / "gallery.js").read_text(encoding="utf-8") + "\n</script>"
    html = assemble(brief, themes, head_js, tail_js)

    out = Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding="utf-8")
    mb = out.stat().st_size / 1e6
    print(f"OK  {out}  ({mb:.2f} MB, embedded assets {stats['bytes']/1e6:.2f} MB)")
    if mb > 15:
        warn("file > 15 MB: compress images (WebP, max 1920px) / models")


if __name__ == "__main__":
    main()
