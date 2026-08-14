#!/usr/bin/env python3
"""Derive the responsive hero renditions from the original photograph.

The hero is the page's largest contentful paint, so it gets the most attention:
three widths, each in AVIF, WebP and JPEG. The browser picks one via <picture>,
and because it is a real <img> in the markup the preload scanner finds it before
the stylesheet has even arrived.

Run:  python3 tools/build-images.py
"""

import os
import sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "assets-src", "hero-source.jpg")
OUT = os.path.join(ROOT, "public", "assets")

# Widths track the CSS breakpoints, doubled at the small end for dense screens.
WIDTHS = [800, 1280, 1920]
ASPECT = 864 / 1920  # the crop the design was built around

# Quality chosen per format. AVIF and WebP hold up far below JPEG's numbers, and
# this is a backdrop behind a 62-94% veil rather than something anyone inspects.
#
# AVIF quality was picked by measurement, not feel: compositing the veil over
# each candidate and diffing against the original gives a mean error under
# 1/255 all the way down to q20, but the WORST pixel degrades sharply once
# below q50 (Δ14 at q50, Δ27 at q35, Δ39 at q30) — isolated artifacts in the
# smooth regions. Dropping to q40 would save a further 10 KB; that is not worth
# a visible speck on the largest element on the page.
ENCODINGS = [
    ("avif", {"format": "AVIF", "quality": 50}),
    ("webp", {"format": "WEBP", "quality": 74, "method": 6}),
    ("jpg", {"format": "JPEG", "quality": 76, "optimize": True, "progressive": True}),
]


def build():
    if not os.path.exists(SOURCE):
        sys.exit(
            f"Missing {SOURCE}.\n"
            "The hero original lives in assets-src/ so it is never served — only "
            "the derived renditions belong in public/."
        )

    src = Image.open(SOURCE).convert("RGB")
    rows = []

    for width in WIDTHS:
        height = round(width * ASPECT)
        # LANCZOS for downscaling; the source is larger than every rendition.
        resized = src.resize((width, height), Image.LANCZOS)

        for ext, opts in ENCODINGS:
            path = os.path.join(OUT, f"hero-{width}.{ext}")
            resized.save(path, **opts)
            rows.append((f"hero-{width}.{ext}", os.path.getsize(path)))

    baseline = dict(rows).get(f"hero-{WIDTHS[-1]}.jpg", 0)
    print(f"{'file':<22}{'size':>10}{'vs jpeg':>10}")
    for name, size in rows:
        width = name.split("-")[1].split(".")[0]
        jpeg = dict(rows)[f"hero-{width}.jpg"]
        delta = f"{(size / jpeg - 1) * 100:+.0f}%" if jpeg else "—"
        print(f"{name:<22}{size / 1024:>8.1f} KB{delta:>10}")


if __name__ == "__main__":
    build()
