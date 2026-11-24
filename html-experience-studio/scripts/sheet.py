"""Contact sheets from studio_frames.cjs output, so a whole deck (or every transition) fits in one image to review.
    python sheet.py <framesDir>        -> <framesDir>/sheet_stills.jpg, sheet_mobile.jpg, sheet_motion_<nn>.jpg
Needs Pillow (pip install pillow)."""
import re, sys
from pathlib import Path
from PIL import Image, ImageDraw

d = Path(sys.argv[1])


def sheet(files, out, cols=3, w=640):
    if not files:
        return
    ims = [Image.open(f).convert("RGB") for f in files]
    h = round(w * ims[0].height / ims[0].width)
    rows = (len(ims) + cols - 1) // cols
    S = Image.new("RGB", (cols * w, rows * (h + 22)), "black")
    for i, (f, im) in enumerate(zip(files, ims)):
        x, y = (i % cols) * w, (i // cols) * (h + 22)
        S.paste(im.resize((w, h)), (x, y))
        ImageDraw.Draw(S).text((x + 6, y + h + 5), f.stem, fill="white")
    S.save(out, quality=84)
    print("OK", out)


sheet(sorted(d.glob("still_*.png")), d / "sheet_stills.jpg")
sheet(sorted(d.glob("mobile_*.png")), d / "sheet_mobile.jpg", cols=5, w=300)
for nn in sorted({re.match(r"motion_(\d+)", f.name).group(1) for f in d.glob("motion_*.png")}):
    sheet(sorted(d.glob(f"motion_{nn}_*.png")), d / f"sheet_motion_{nn}.jpg", cols=6, w=420)
