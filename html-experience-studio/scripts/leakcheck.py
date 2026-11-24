#!/usr/bin/env python3
"""Leak check: does a deliverable contain text from the skill's own demos, worlds or templates?

    python leakcheck.py out/Deck_v1.html            # exit 1 if any demo phrase is found

The library, reference worlds, signature pieces and example projects are moodboards: their technique may travel,
their words may not. This collects every visible phrase (>= 3 words) from those sources and reports any that
reappear in the deliverable. Fix by replacing the text with the user's own content or [TBD].
"""
import re, sys
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
SOURCES = [*(SKILL / "assets" / "worlds").glob("*.html"), *(SKILL / "assets" / "signature").glob("*.html"),
           *(SKILL / "examples").rglob("*.html"), *(SKILL / "examples").rglob("*.js"), *(SKILL / "examples").rglob("*.json")]
SOURCES = [p for p in SOURCES if "node_modules" not in p.parts and "/out/" not in p.as_posix() and p.stat().st_size < 400_000]
# the plumbing ships inside every deliverable (three.js, runtime, sigkit, scrollstage): its strings are allowed
PLUMBING = [*(SKILL / "assets" / "vendor").glob("*.js"), *(SKILL / "assets" / "studio").glob("*.*")]
TAG = re.compile(r">([^<>{}]{14,})<")
STR = re.compile(r"""(['"`])((?:(?!\1).){14,}?)\1""")
WORD = re.compile(r"[A-Za-zÄÖÜäöüß]{2,}")


def phrases(text: str):
    out = set()
    text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.S)
    for m in TAG.finditer(text):
        out.add(m.group(1))
    # quoted strings only from script code: in markup they are attribute values (class lists, ids), not copy
    code = chr(10).join(re.findall(r"<script[^>]*>(.*?)</script>", text, flags=re.S)) if "<html" in text.lower() or "<section" in text.lower() else text
    for m in STR.finditer(code):
        out.add(m.group(2))
    clean = set()
    for s in out:
        s = re.sub(r"\s+", " ", s).strip()
        words = WORD.findall(s)
        if len(words) < 3 or len(s) > 300:
            continue
        if re.search(r"[;{}=()]|\b(function|const|return|var|let)\b|https?:|\.(js|css|png|glb|mp4)\b", s):
            continue                                            # code, not copy
        clean.add(s.lower())
    return clean


def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(2)
    out = Path(sys.argv[1]).read_text(encoding="utf-8", errors="ignore").lower()
    out = re.sub(r"\s+", " ", out)
    allowed = set()
    for p in PLUMBING:
        allowed |= phrases(p.read_text(encoding="utf-8", errors="ignore"))
    hits = []
    for src in SOURCES:
        try:
            for ph in phrases(src.read_text(encoding="utf-8", errors="ignore")):
                if ph in out and ph not in allowed:
                    hits.append((src.relative_to(SKILL).as_posix(), ph))
        except OSError:
            pass
    if hits:
        print(f"LEAK  {len(hits)} phrase(s) from skill demos found in the deliverable:")
        for src, ph in sorted(set(hits))[:40]:
            print(f"  [{src}] {ph[:110]}")
        sys.exit(1)
    print("OK  no demo/template text in the deliverable")


if __name__ == "__main__":
    main()
