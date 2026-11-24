#!/usr/bin/env python3
"""Extract a colour palette from reference images and suggest theme overrides.

  python palette.py refs/*.png refs/*.jpg

Needs Pillow (pip install pillow). Without it: look at the images with the Read tool and estimate hex values by eye.
Output: dominant colours with share, plus a theme snippet (bg/surface/text/muted/accent/accent2) and contrast checks.
"""
import sys


def lum(c):
    def ch(v):
        v /= 255
        return v / 12.92 if v <= .03928 else ((v + .055) / 1.055) ** 2.4
    r, g, b = c
    return .2126 * ch(r) + .7152 * ch(g) + .0722 * ch(b)


def contrast(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + .05) / (lb + .05)


def hx(c):
    return "#%02x%02x%02x" % tuple(int(v) for v in c)


def sat(c):
    mx, mn = max(c), min(c)
    return 0 if mx == 0 else (mx - mn) / mx


def mix(a, b, t):
    return tuple(a[i] * (1 - t) + b[i] * t for i in range(3))


def main(paths):
    try:
        from PIL import Image
    except ImportError:
        print("Pillow fehlt (pip install pillow). Alternative: Bilder mit dem Read-Tool ansehen und Farben schätzen.")
        return 1
    if not paths:
        print(__doc__)
        return 1
    buckets = {}
    for p in paths:
        im = Image.open(p).convert("RGB")
        im.thumbnail((160, 160))
        q = im.quantize(colors=8, method=Image.Quantize.MEDIANCUT)
        pal = q.getpalette()
        for count, idx in q.getcolors():
            c = tuple(pal[idx * 3: idx * 3 + 3])
            key = tuple(v // 24 for v in c)
            n, s = buckets.get(key, (0, (0, 0, 0)))
            buckets[key] = (n + count, tuple(s[i] + c[i] * count for i in range(3)))
    cols = sorted(((n, tuple(s[i] / n for i in range(3))) for n, s in buckets.values()), reverse=True)
    total = sum(n for n, _ in cols)
    print("Dominante Farben:")
    for n, c in cols[:8]:
        print(f"  {hx(c)}  {100 * n / total:4.1f} %  sat {sat(c):.2f}")
    base = cols[0][1]
    dark = lum(base) < .25
    bg = base if dark or lum(base) > .8 else (mix(base, (0, 0, 0), .8) if lum(base) < .5 else mix(base, (255, 255, 255), .85))
    text = (242, 244, 248) if lum(bg) < .4 else (20, 22, 26)
    accents = sorted([c for n, c in cols if sat(c) > .35], key=lambda c: -sat(c)) or [cols[min(1, len(cols) - 1)][1]]
    a1 = accents[0]
    a2 = accents[1] if len(accents) > 1 else mix(a1, text, .3)
    surface = mix(bg, text, .06)
    muted = mix(text, bg, .42)
    print("\nTheme-Vorschlag (im Brief unter theme):")
    print(f'  {{"bg":"{hx(bg)}","surface":"{hx(surface)}","text":"{hx(text)}","muted":"{hx(muted)}","accent":"{hx(a1)}","accent2":"{hx(a2)}","onAccent":"{hx((0, 0, 0) if lum(a1) > .4 else (255, 255, 255))}"}}')
    print("\nKontrast (Ziel ≥ 4.5):")
    for name, fg, b in (("text/bg", text, bg), ("muted/surface", muted, surface), ("accent/bg", a1, bg)):
        r = contrast(fg, b)
        print(f"  {name:14s} {r:4.1f}  {'ok' if r >= 4.5 else ('nur große Titel' if r >= 3 else 'zu schwach')}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
