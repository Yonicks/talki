#!/usr/bin/env python3
"""Publish the latest screenshot sets to docs/screenshots/{chrome,android}.

Overwrites in place and deletes anything no longer produced, so the folder
only ever holds the latest set (one compressed .webp per screen). Sources
are written by device-sweep.mjs (Pixel 9) and android-sweep.mjs.

    python3 tools/home-fidelity/publish_screenshots.py [chrome] [android]
"""
import sys
from pathlib import Path

from PIL import Image, ImageStat

MOBILE = Path(__file__).resolve().parents[2]
DEST = MOBILE.parents[1] / "docs" / "screenshots"
SOURCES = {
    "chrome": MOBILE / "artifacts" / "device" / "pixel-9",
    "android": MOBILE / "artifacts" / "android",
}
WIDTH = 1200  # same width for both sets so they compare side by side


def publish(kind: str) -> int:
    files = sorted(SOURCES[kind].glob("*.png"))
    if not files:
        sys.exit(f"publish_screenshots: no {kind} captures in {SOURCES[kind]}")
    # Validate the whole set first so a bad capture never leaves a half-updated folder.
    for src in files:
        if ImageStat.Stat(Image.open(src).convert("L")).mean[0] < 12:
            sys.exit(f"publish_screenshots: {src.name} is (nearly) black; nothing was published.")
    dest = DEST / kind
    dest.mkdir(parents=True, exist_ok=True)
    kept = set()
    for src in files:
        img = Image.open(src).convert("RGB")
        img = img.resize((WIDTH, round(img.height * WIDTH / img.width)), Image.LANCZOS)
        out = dest / f"{src.stem}.webp"
        img.save(out, "WEBP", quality=82, method=6)
        kept.add(out.name)
    for old in dest.glob("*.webp"):
        if old.name not in kept:
            old.unlink()
    total = sum(p.stat().st_size for p in dest.glob("*.webp"))
    print(f"publish_screenshots: {kind}: {len(kept)} screens, {total / 1024:.0f} KB -> {dest}")
    return len(kept)


if __name__ == "__main__":
    kinds = [k for k in sys.argv[1:] if k in SOURCES] or list(SOURCES)
    for k in kinds:
        publish(k)
