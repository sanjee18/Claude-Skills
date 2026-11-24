"""Bundle a bespoke Studio project folder into ONE offline HTML file.

    python studio_bundle.py <project>/index.html <out>.html

Project conventions (all paths relative to index.html):
  <script src="studio:three"></script>            -> skill's three.js r147 (+GLTFLoader, EffectComposer, Bloom, Meshopt)
  <script src="studio:runtime"></script>          -> assets/studio/runtime.js
  <script src="studio:sigkit"></script>           -> assets/studio/sigkit.js (one full-frame shader + springs, drag, budget)
  <script src="studio:scrollstage"></script>      -> assets/studio/scrollstage.js (scroll-driven stage, see references/craft-bar.md)
  <link rel="stylesheet" href="studio:runtime">   -> assets/studio/runtime.css
  <script src="studio:experience"></script> + <link rel="stylesheet" href="studio:experience">  -> Erlebnis-Hub runtime
                                                    (any studio:<name> resolves to assets/studio/<name>.js / .css)
  <link rel="studio-fonts" href="Instrument Serif:400,400i;Inter:400,500;JetBrains Mono:400">  -> inline @font-face
  <script src="story.js"></script> / <link rel="stylesheet" href="style.css">   -> inlined
  <img src="…">, <video src="…">, <source src="…">, CSS url(…)                  -> data URIs
  Studio.asset('media/x.glb') / asset('…') anywhere in JS                         -> window.__ASSETS (glb/json gzip+base64)
External http(s) references are reported: the deliverable must work offline.
"""
import base64, gzip, mimetypes, re, sys
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
FONTS = SKILL / "assets" / "fonts"
MIME = {".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".mp4": "video/mp4", ".webm": "video/webm",
        ".glb": "model/gltf-binary", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg"}
missing, external = [], []


def data_uri(p: Path) -> str:
    mt = MIME.get(p.suffix.lower()) or mimetypes.guess_type(p.name)[0] or "application/octet-stream"
    return f"data:{mt};base64,{base64.b64encode(p.read_bytes()).decode()}"


def local(base: Path, ref: str):
    if re.match(r"^(data:|blob:|#|%23|studio:)", ref):
        return None
    if re.match(r"^(https?:)?//", ref):
        external.append(ref)
        return None
    p = (base / ref.split("?")[0]).resolve()
    if not p.exists():
        missing.append(ref)
        return None
    return p


def css_inline(css: str, base: Path) -> str:
    def rep(m):
        p = local(base, m.group(2))
        return f"url({data_uri(p)})" if p else m.group(0)
    return re.sub(r"url\((['\"]?)([^'\")]+)\1\)", rep, css)


def fonts_css(spec: str) -> str:
    out = []
    for fam in spec.split(";"):
        if ":" not in fam:
            continue
        name, ws = fam.split(":", 1)
        name = name.strip()
        for w in ws.split(","):
            w = w.strip()
            italic = w.endswith("i")
            f = FONTS / f"{name.replace(' ', '')}-{w}.woff2"
            if not f.exists():
                missing.append(f"font {name} {w} (have: {', '.join(sorted(x.stem for x in FONTS.glob('*.woff2')))})")
                continue
            out.append(f"@font-face{{font-family:'{name}';font-style:{'italic' if italic else 'normal'};font-weight:{w.rstrip('i')};"
                       f"font-display:swap;src:url({data_uri(f)}) format('woff2')}}")
    return "<style>" + "".join(out) + "</style>"


def main():
    src, out = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
    base = src.parent
    html = src.read_text(encoding="utf-8")

    html = re.sub(r'<link[^>]*rel="studio-fonts"[^>]*href="([^"]+)"[^>]*>', lambda m: fonts_css(m.group(1)), html)
    html = re.sub(r'<link[^>]*rel="stylesheet"[^>]*href="studio:([\w-]+)"[^>]*>',
                  lambda m: "<style>" + (SKILL / f"assets/studio/{m.group(1)}.css").read_text(encoding="utf-8") + "</style>", html)

    def css_link(m):
        p = local(base, m.group(1))
        return "<style>" + css_inline(p.read_text(encoding="utf-8"), p.parent) + "</style>" if p else m.group(0)
    html = re.sub(r'<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>', css_link, html)
    html = re.sub(r"(<style[^>]*>)(.*?)(</style>)", lambda m: m.group(1) + css_inline(m.group(2), base) + m.group(3), html, flags=re.S)

    js_srcs = []
    def script(m):
        ref = m.group(1)
        if ref == "studio:three":
            code = (SKILL / "assets/vendor/three-r147.js").read_text(encoding="utf-8")
        elif ref == "studio:scrollstage":
            code = (SKILL / "assets/studio/scrollstage.js").read_text(encoding="utf-8")
        elif ref == "studio:sigkit":
            code = (SKILL / "assets/studio/sigkit.js").read_text(encoding="utf-8")
        elif ref == "studio:runtime":
            code = (SKILL / "assets/studio/runtime.js").read_text(encoding="utf-8")
        elif ref.startswith("studio:") and (SKILL / f"assets/studio/{ref[7:]}.js").exists():
            code = (SKILL / f"assets/studio/{ref[7:]}.js").read_text(encoding="utf-8")
        else:
            p = local(base, ref)
            if not p:
                return m.group(0)
            code = p.read_text(encoding="utf-8")
            js_srcs.append((code, p.parent))
        return "<script>" + code.replace("</script", "<\\/script") + "</script>"
    html = re.sub(r'<script[^>]*src="([^"]+)"[^>]*>\s*</script>', script, html)
    for m in re.finditer(r"<script>(.*?)</script>", html, flags=re.S):
        js_srcs.append((m.group(1), base))

    def attr(m):
        p = local(base, m.group(3))
        return f"{m.group(1)}{m.group(2)}=\"{data_uri(p)}\"" if p else m.group(0)
    html = re.sub(r"(<(?:img|video|source|audio)\b[^>]*?\s)(src|poster)=\"([^\"]+)\"", attr, html)

    assets = {}
    for code, b in js_srcs:
        for ref in re.findall(r"asset\(\s*['\"]([^'\"]+)['\"]\s*\)", code):
            if ref in assets:
                continue
            p = local(base, ref)
            if not p:
                continue
            if p.suffix.lower() in (".glb", ".json", ".bin"):
                assets[ref] = "gz:" + base64.b64encode(gzip.compress(p.read_bytes(), 9)).decode()
            else:
                assets[ref] = data_uri(p)
    if assets:
        import json
        blob = "<script>window.__ASSETS=" + json.dumps(assets) + ";</script>"
        html = html.replace("<head>", "<head>" + blob, 1) if "<head>" in html else blob + html

    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding="utf-8")
    mb = out.stat().st_size / 1e6
    print(f"OK  {out}  ({mb:.2f} MB, {len(assets)} JS assets)")
    if external:
        print("WARN external references (not offline):", *sorted(set(external))[:12], sep="\n  ")
    if mb > 15:
        print("WARN file > 15 MB: compress images (WebP ≤ 1920 px, q 70–80), models (meshopt + WebP textures), videos")
    if missing:
        print("ERROR missing files:", *sorted(set(missing)), sep="\n  ")
        sys.exit(1)


if __name__ == "__main__":
    main()
