#!/usr/bin/env python3
"""Reference teardown: take a saved/rendered HTML page (DevTools "Copy outerHTML", Save As, a URL dump) and print what
makes it tick, as a Markdown report that goes into concept.md before any concept is written.

    python teardown.py <page.html>            # report to stdout
    python teardown.py <page.html> --json     # machine readable

It reads the DOM only (no network). It reports: meta/SEO, fonts, the layer stack (canvas, video, svg filters, 3D / glass /
mask techniques found in inline styles), the scroll timeline (data-at / chapter markers), the choreography grammar
(transform / filter / opacity values the page's JS wrote into inline styles), custom properties, the frame system
(hairlines, ornaments), draw-on SVG, split typography, accessibility hygiene, and the copy (headings, beats) with word counts.
Interpretation is still yours: see references/craft-bar.md part B for the questions to answer with this output."""
import json, re, sys
from collections import Counter
from html.parser import HTMLParser

VOID = {"meta", "link", "br", "img", "input", "hr", "source", "path", "circle", "line", "rect", "use", "ellipse", "polygon", "polyline", "stop"}


class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack, self.tags, self.cls, self.data_attrs, self.styles, self.meta = [], Counter(), Counter(), Counter(), [], {}
        self.text = {}            # heading/paragraph text by tag
        self.scripts, self.ld, self.filters, self.canvas, self.video, self.aria_hidden, self.inert, self.links = [], [], [], 0, [], 0, 0, []
        self.in_style = self.in_ld = False
        self.buf = []
        self.css = []
        self.cur_text = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.tags[tag] += 1
        for c in (a.get("class") or "").split():
            self.cls[c] += 1
        for k, v in a.items():
            if k.startswith("data-"):
                self.data_attrs[k] += 1
        if a.get("style"):
            self.styles.append(a["style"])
        if "aria-hidden" in a:
            self.aria_hidden += 1
        if "inert" in a:
            self.inert += 1
        if tag == "meta":
            n = a.get("name") or a.get("property")
            if n:
                self.meta[n] = a.get("content", "")
        if tag == "link" and a.get("rel") in ("canonical", "icon", "stylesheet", "preload", "studio-fonts"):
            self.links.append((a.get("rel"), a.get("href", "")))
        if tag == "canvas":
            self.canvas += 1
        if tag == "video":
            self.video.append({k: a.get(k) for k in ("src", "loop", "muted", "autoplay", "preload", "playsinline") if k in a})
        if tag == "filter":
            self.filters.append({"id": a.get("id"), "prims": []})
        if tag.startswith("fe") and self.filters:
            self.filters[-1]["prims"].append(tag + (":" + a["type"] if "type" in a else ""))
        if tag == "style":
            self.in_style = True
        if tag == "script":
            self.in_ld = a.get("type") == "application/ld+json"
            self.scripts.append(a.get("src") or ("inline" if not self.in_ld else "ld+json"))
            self.in_script = True
        if tag in ("h1", "h2", "h3", "p", "button", "a") or (a.get("class") or "").split()[:1] in (["beat"], ["stand"], ["subhead"]):
            self.cur_text = [tag, []]
        if tag not in VOID:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag == "style":
            self.in_style = False
        if tag == "script":
            self.in_ld = False
        if self.cur_text and tag == self.cur_text[0]:
            t = re.sub(r"\s+", " ", "".join(self.cur_text[1])).strip()
            if t:
                self.text.setdefault(tag, []).append(t)
            self.cur_text = None
        if tag in self.stack:
            while self.stack and self.stack.pop() != tag:
                pass

    def handle_data(self, d):
        if self.in_style:
            self.css.append(d)
        elif self.in_ld:
            self.ld.append(d)
        elif self.cur_text is not None:
            self.cur_text[1].append(d)


def analyze(html):
    p = P()
    p.feed(html)
    css = "\n".join(p.css) + "\n" + "\n".join(p.styles)
    allv = css + html
    fonts = sorted(set(re.findall(r"font-family:\s*([^;}\"]+)", css)))[:10]
    ff = sorted(set(re.findall(r"@font-face\s*{[^}]*font-family:\s*['\"]?([^;'\"}]+)", "\n".join(p.css))))
    props = Counter(re.findall(r"(--[\w-]+)\s*:", css))
    tf = Counter(re.findall(r"(rotate[XYZ]?\([^)]*\)|translateZ\([^)]*\)|scale\([^)]*\)|blur\([^)]*\))", "\n".join(p.styles)))
    ld_types = []
    for blob in p.ld:
        try:
            j = json.loads(blob)
            for x in (j if isinstance(j, list) else [j]):
                ld_types.append(x.get("@type"))
        except Exception:
            ld_types.append("unparsable")
    techniques = {
        "perspective / 3D ring": bool(re.search(r"perspective", allv)) and bool(re.search(r"translateZ", allv)),
        "backdrop-filter glass": "backdrop-filter" in allv,
        "svg filter distortion": any(x.startswith("fedisplacementmap") for f in p.filters for x in f["prims"]),
        "clip-path masks": "clip-path" in allv,
        "draw-on strokes (dasharray/pathLength)": "stroke-dasharray" in allv or "pathLength" in html,
        "mix-blend-mode": "mix-blend-mode" in allv,
        "per-char split (.ch/.wd)": p.cls.get("ch", 0) > 20,
        "line masks (.ln > i)": p.cls.get("ln", 0) > 0,
        "fixed artboard scale (scale(<1) on wrapper)": bool(re.search(r"scale\(0?\.\d{3,}\)", "\n".join(p.styles))) or "--k" in props,
        "scroll pin / runway": bool(re.search(r"position:\s*(sticky|fixed)", allv)) or "runway" in p.cls,
        "inert / aria-hidden hygiene": p.inert > 0 or p.aria_hidden > 3,
        "reduced-motion handled": "prefers-reduced-motion" in allv,
        "JSON-LD": bool(ld_types),
    }
    chap = re.findall(r'data-at="([\d.]+)"', html)
    words = {k: sum(len(t.split()) for t in v) for k, v in p.text.items()}
    return {
        "title": re.search(r"<title>(.*?)</title>", html, re.S).group(1).strip() if re.search(r"<title>", html) else "",
        "meta": {k: v for k, v in p.meta.items() if k in ("description", "theme-color", "color-scheme", "og:title", "og:image", "og:image:alt", "twitter:card", "robots")},
        "jsonld": ld_types, "fonts_declared": ff, "font_families_used": fonts, "external_scripts": [s for s in p.scripts if s.startswith("http") or s.startswith("/")],
        "canvas": p.canvas, "video": p.video, "svg_filters": p.filters, "techniques": techniques,
        "chapters_at": chap, "custom_properties": props.most_common(14), "inline_transform_vocabulary": tf.most_common(14),
        "data_attributes": p.data_attrs.most_common(10), "top_classes": p.cls.most_common(18),
        "tag_counts": {k: v for k, v in p.tags.items() if k in ("canvas", "video", "svg", "path", "line", "button", "a", "h1", "h2", "h3", "section", "article", "nav")},
        "aria_hidden": p.aria_hidden, "inert": p.inert,
        "copy": {k: v[:8] for k, v in p.text.items() if k in ("h1", "h2", "h3", "p")}, "copy_words": words,
    }


def report(r):
    L = ["# Teardown", "", f"**Titel:** {r['title']}", ""]
    L += ["## Meta / SEO", *(f"- {k}: {v[:120]}" for k, v in r["meta"].items()), f"- JSON-LD: {', '.join(map(str, r['jsonld'])) or 'keins'}", ""]
    L += ["## Schichten", f"- Canvas: {r['canvas']} · Video: {len(r['video'])} {r['video'] or ''}", *(f"- SVG-Filter `{f['id']}`: {', '.join(f['prims'])}" for f in r["svg_filters"]), ""]
    L += ["## Techniken gefunden", *(f"- [{'x' if v else ' '}] {k}" for k, v in r["techniques"].items()), ""]
    L += ["## Zeitleiste", f"- Kapitel-Marker (data-at): {', '.join(r['chapters_at']) or 'keine'}" + (" -> Kapitellängen: " + ", ".join(f"{b - a:.3f}" for a, b in zip(map(float, r['chapters_at']), list(map(float, r['chapters_at']))[1:] + [1.0])) if r['chapters_at'] else ""), ""]
    L += ["## Choreografie-Vokabular (Werte, die JS in Inline-Styles schrieb)", *(f"- `{k}` × {n}" for k, n in r["inline_transform_vocabulary"]), ""]
    L += ["## Tokens", f"- Schriften deklariert: {', '.join(r['fonts_declared']) or '–'} · benutzt: {' | '.join(r['font_families_used'][:4]) or '–'}", "- Custom Properties: " + ", ".join(f"{k}×{n}" for k, n in r["custom_properties"]), ""]
    L += ["## Struktur", "- data-*: " + ", ".join(f"{k}×{n}" for k, n in r["data_attributes"]), "- häufigste Klassen: " + ", ".join(f"{k}×{n}" for k, n in r["top_classes"]), f"- aria-hidden: {r['aria_hidden']} · inert: {r['inert']}", ""]
    L += ["## Texte (Stimme prüfen: Länge, Satzbau, Gegner, Ehrlichkeit)", *(f"- {k} ({r['copy_words'].get(k, 0)} Wörter gesamt): " + " / ".join(v[:5]) for k, v in r["copy"].items()), "",
          "Nächster Schritt: `references/craft-bar.md` Teil B, die Fragen 1–7 mit diesem Bericht beantworten und in `concept.md` ablegen."]
    return "\n".join(L)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    h = open(sys.argv[1], encoding="utf-8", errors="replace").read()
    r = analyze(h)
    print(json.dumps(r, ensure_ascii=False, indent=1) if "--json" in sys.argv else report(r))
