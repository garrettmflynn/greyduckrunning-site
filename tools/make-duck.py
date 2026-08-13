#!/usr/bin/env python3
"""Rebuild assets/duck.png (and its derivatives) from the podcast's logo.

    python3 tools/make-duck.py assets/logo-source.jpg

This does two things and deliberately nothing more: it removes the white
background, and it removes the white that antialiasing baked into the edge
pixels. The artwork itself is left exactly as drawn.

Why so little? Earlier versions of this script tried to reconstruct the logo as
clean vector pixel art by recovering the Excel grid it was drawn on. That does
not work, and the reason is worth recording so nobody burns another afternoon
on it:

  * The grid cannot be recovered. Three independent methods — fitting a lattice
    to colour-change positions, scoring cell-colour uniformity, and testing run
    lengths as whole multiples of a cell — all returned flat, signal-free
    curves. The source was downscaled by a non-integer factor with
    interpolation, so the cell boundaries no longer exist.

  * The outline is already broken. Traced at *native* resolution, with no grid
    assumption at all, the black outline comes apart into 43 disconnected
    pieces and the feet into 3. Those breaks are in the file. No tracing can
    restore information the downscale destroyed.

  * Flattening makes it worse. Snapping every pixel to the four brand colours
    to "clean up" the JPEG turns a soft continuous edge into a dotted one — the
    intermediate greys were what held the outline together visually.

So the honest move is to keep the pixels and stop reinterpreting them. The
consequence is that the logo does not enlarge well; the site shows it at or
near its natural size for that reason.

A larger export — the original spreadsheet, or a full-size screenshot before
downscaling — would make a crisp, freely scalable, recolourable vector trivial.
That is the fix. This script is the workaround.

Requires Pillow. assets/duck.png is committed, so normal site work never runs
this.
"""
import sys
import pathlib
from PIL import Image

# The colours the artwork uses, white excluded — white is background here.
INK = {'grey': (176, 176, 176), 'black': (0, 0, 0),
       'belly': (200, 200, 200), 'orange': (248, 104, 0)}

WHITE_CUTOFF = 240      # counts as background when flood filling
EDGE_CUTOFF = 215       # measured; see cut_out() — lower values worsen the rim


def luminance(c):
    return (c[0] + c[1] + c[2]) / 3


def background(im):
    """Flood fill the outside from the border.

    Deliberately a fill and not a whiteness test: the duck's eye is white too,
    but it is enclosed, so the fill never reaches it and it stays opaque.
    """
    W, H = im.size
    px = im.load()
    white = lambda p: p[0] >= WHITE_CUTOFF and p[1] >= WHITE_CUTOFF and p[2] >= WHITE_CUTOFF

    seen, stack = set(), []
    for x in range(W):
        for y in (0, H - 1):
            if white(px[x, y]):
                stack.append((x, y))
    for y in range(H):
        for x in (0, W - 1):
            if white(px[x, y]):
                stack.append((x, y))
    seen.update(stack)
    while stack:
        x, y = stack.pop()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            a, b = x + dx, y + dy
            if 0 <= a < W and 0 <= b < H and (a, b) not in seen and white(px[a, b]):
                seen.add((a, b))
                stack.append((a, b))
    return seen


def cut_out(im):
    """Transparent background, classified by REGION ROLE rather than brightness.

    Four cases, and the distinction matters:

    background  white reachable from the border -> transparent.

    enclosed white  white the fill never reaches -> a real feature, kept opaque
        white. This is the eye. An earlier version tested brightness instead and
        the eye, being pure white, was treated as a fully-faded edge pixel and
        given alpha 0 — the flood fill preserved it and the next step deleted it.

    boundary  a kept pixel touching the background, and light enough to be a
        blend rather than ink. Only these are un-blended: the stored RGB is part
        white, which glows as a pale halo on a dark background, so recover the
        ink it is fading from and express the mix as alpha.

    interior  everything else -> kept exactly as drawn.

    EDGE_CUTOFF is 215 by measurement, not taste. Lowering it to 200 or 190 pulls
    more pixels into the un-blend and makes the pale rim worse (73 -> 98), not
    better.
    """
    W, H = im.size
    px = im.load()
    outside = background(im)

    def touches_background(x, y):
        return any((x + dx, y + dy) in outside
                   for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1),
                                  (1, 1), (1, -1), (-1, 1), (-1, -1)))

    is_white = lambda p: (p[0] >= WHITE_CUTOFF and p[1] >= WHITE_CUTOFF
                          and p[2] >= WHITE_CUTOFF)

    out = Image.new('RGBA', (W, H))
    o = out.load()
    for y in range(H):
        for x in range(W):
            c = px[x, y]
            if (x, y) in outside:
                o[x, y] = (0, 0, 0, 0)
            elif is_white(c):
                o[x, y] = (255, 255, 255, 255)
            elif touches_background(x, y) and luminance(c) >= EDGE_CUTOFF:
                ink = min(INK.values(),
                          key=lambda f: sum((u - v) ** 2 for u, v in zip(c, f)))
                span = max(1.0, 255.0 - luminance(ink))
                alpha = max(0.0, min(1.0, (255.0 - luminance(c)) / span))
                o[x, y] = ink + (int(round(alpha * 255)),)
            else:
                o[x, y] = c + (255,)
    return out.crop(out.getbbox())


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else 'assets/logo-source.jpg'
    assets = pathlib.Path(__file__).resolve().parent.parent / 'assets'

    duck = cut_out(Image.open(src).convert('RGB'))
    duck.save(assets / 'duck.png')
    duck.save(assets / 'favicon.png')
    print(f'duck.png {duck.width}x{duck.height}')

    icon = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
    d = duck.resize((duck.width * 3, duck.height * 3), Image.LANCZOS)
    icon.paste(d, ((512 - d.width) // 2, (512 - d.height) // 2), d)
    icon.save(assets / 'icon-512.png')

    card = Image.new('RGB', (1200, 630), (248, 248, 248))
    d2 = duck.resize((duck.width * 5, duck.height * 5), Image.LANCZOS)
    card.paste(d2, ((1200 - d2.width) // 2, (630 - d2.height) // 2), d2)
    card.save(assets / 'og-image.png')

    print('wrote duck.png, favicon.png, icon-512.png, og-image.png')


if __name__ == '__main__':
    main()
