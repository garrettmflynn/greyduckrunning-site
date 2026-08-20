#!/usr/bin/env python3
"""Derive the bio portraits from the originals in assets-src/portraits/.

Same shape as build-images.py, different subject. Each source is cropped to 3:4
before it lands in assets-src, so this only resizes and encodes — the framing
decision stays with the file a human can look at, not with a magic number here.

Two widths rather than the hero's three: a bio column is ~340px at the widest
layout and narrower everywhere else, so 320 and 640 cover 1x and 2x with nothing
in between worth the bytes.

Run:  python3 tools/build-portraits.py
"""

import os
import sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets-src", "portraits")
OUT = os.path.join(ROOT, "public", "assets", "people")

WIDTHS = [320, 640]
ASPECT = 4 / 3  # portrait: height is 4/3 of width

# Quality picked by measuring what a viewer actually sees: encode at 640, resample
# to the 320 CSS pixels it is painted into, and diff against a near-lossless run
# of the same path. That separates encoder loss from resampling loss, and these
# subjects are almost all high-frequency texture — asphalt, grass, curly fur —
# where the two are easily confused.
#
#   q42  mean 3.9/255, p99.9 20   38-50 KB
#   q50  mean 2.8/255, p99.9 14   56-79 KB   <- here
#   q62  mean 1.9/255, p99.9 10   86-121 KB
#
# q42 saves ~45 KB and starts to mottle the flat sky behind both subjects. q62
# doubles the bytes for a difference no one sees at 320px.
ENCODINGS = [
    ("avif", {"format": "AVIF", "quality": 50}),
    ("webp", {"format": "WEBP", "quality": 75, "method": 6}),
    ("jpg", {"format": "JPEG", "quality": 80, "optimize": True, "progressive": True}),
]


def build():
    if not os.path.isdir(SRC):
        sys.exit(f"Missing {SRC}. Put the 3:4 originals there; they are never served.")

    sources = sorted(f for f in os.listdir(SRC) if f.lower().endswith((".jpg", ".jpeg", ".png")))
    if not sources:
        sys.exit(f"No portraits in {SRC}.")

    os.makedirs(OUT, exist_ok=True)
    rows = []

    for name in sources:
        slug = os.path.splitext(name)[0]
        src = Image.open(os.path.join(SRC, name)).convert("RGB")

        # A source that is not 3:4 would silently letterbox or squash. Say so.
        ratio = src.height / src.width
        if abs(ratio - ASPECT) > 0.02:
            sys.exit(
                f"{name} is {src.width}x{src.height} ({ratio:.3f}), not 3:4 ({ASPECT:.3f}).\n"
                "Crop it before it goes in assets-src so the framing is visible in the file."
            )

        for width in WIDTHS:
            height = round(width * ASPECT)
            resized = src.resize((width, height), Image.LANCZOS)
            for ext, opts in ENCODINGS:
                path = os.path.join(OUT, f"{slug}-{width}.{ext}")
                resized.save(path, **opts)
                rows.append((f"{slug}-{width}.{ext}", os.path.getsize(path)))

    print(f"{'file':<26}{'size':>10}")
    for name, size in rows:
        print(f"{name:<26}{size / 1024:>8.1f} KB")


if __name__ == "__main__":
    build()
