#!/usr/bin/env python3
"""Create html-experience-studio.zip for upload (Claude Desktop/claude.ai Settings > Skills) or sharing.
The zip contains one top-level folder `html-experience-studio/` with SKILL.md at its root.
Run:  python scripts/package.py   (rebuilds library-gallery.html first)"""
import subprocess, sys, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP_DIRS = {"out", ".claude", "__pycache__", "node_modules", "shots", ".git"}

subprocess.run([sys.executable, str(ROOT / "scripts" / "build.py"), str(ROOT / "examples" / "showcase.brief.json"),
                str(ROOT / "library-gallery.html"), "--gallery"], check=True)

dest = ROOT.parent / "html-experience-studio.zip"
with zipfile.ZipFile(dest, "w", zipfile.ZIP_DEFLATED) as z:
    for p in sorted(ROOT.rglob("*")):
        rel = p.relative_to(ROOT)
        if p.is_dir() or any(part in SKIP_DIRS for part in rel.parts) or p.suffix == ".pyc":
            continue
        z.write(p, Path("html-experience-studio") / rel)
print(f"OK {dest} ({dest.stat().st_size/1e3:.0f} KB)")
