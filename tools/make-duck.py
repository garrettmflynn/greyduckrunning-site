#!/usr/bin/env python3
"""Rebuild the logo assets from assets/logo-source.png.

    python3 tools/make-duck.py

The source is a lossless PNG screenshot of the original spreadsheet, and that
changes everything. Every earlier version of this script was salvage work
against a 150px JPEG whose compression had destroyed the drawing grid: three
independent detection methods returned flat, signal-free curves, the black
outline had come apart into 43 disconnected pieces, and cell purity never
exceeded ~88% at any grid. None of that applies now.

From the lossless source the grid recovers exactly:

    28 x 29 cells, purity 100.00%

Every cell is a single flat colour. The outline is 3 fragments rather than 43,
the silhouette is one piece, and the crown and feet outlines that the JPEG had
eaten are present.

CELLS ARE NOT SQUARE. Measured pitch is 24.75px across and 14.83px down, a
ratio of 1.67:1 — the shape of a default Excel cell, which is what the logo was
drawn on. Rendering the grid with square pixels would make the duck stand
noticeably taller and narrower than the artwork does. So a cell is emitted as
5 wide by 3 tall, giving square output pixels, an overall 140x87 viewBox, and
an aspect of 1.61 which matches the source's 1.612.

Requires Pillow. The generated assets are committed, so normal site work never
runs this.
"""
import pathlib
import sys
from collections import Counter

from PIL import Image

# Exact colours read off the lossless source. These supersede the values used
# before, which were sampled from the compressed Spotify cover and were all
# slightly wrong (#B0B0B0, #C8C8C8, #F86800).
GREY = (183, 183, 183)      # #B7B7B7
BLACK = (0, 0, 0)
BELLY = (204, 204, 204)     # #CCCCCC
ORANGE = (255, 109, 1)      # #FF6D01
WHITE = (255, 255, 255)

PALETTE = {'G': GREY, 'K': BLACK, 'L': BELLY, 'O': ORANGE, 'W': WHITE}
HEX = {'G': '#B7B7B7', 'K': '#000000', 'L': '#CCCCCC', 'O': '#FF6D01', 'E': '#FFFFFF'}

COLS, ROWS = 28, 29
CELL_W, CELL_H = 5, 3       # keeps the 1.67:1 cell shape with square pixels

# Merge the belly highlight into the main grey. Requested deliberately: at the
# sizes this is shown, a second grey a few shades off the first is detail nobody
# reads. Set to False to keep the artwork's four inks.
FLATTEN_BELLY = True


def snap(px):
    return min(PALETTE, key=lambda k: sum((a - b) ** 2 for a, b in zip(px, PALETTE[k])))


def find_duck(im):
    """Locate the artwork inside the screenshot.

    Matches on actual duck ink rather than "not white", so the phone status bar,
    the card border and its drop shadow are all ignored.
    """
    W, H = im.size
    px = im.load()

    def ink(p):
        r, g, b = p
        if r < 80 and g < 80 and b < 80:
            return True
        if abs(r - g) < 12 and abs(g - b) < 12 and 150 < r < 215:
            return True
        return r > 180 and 60 < g < 160 and b < 90

    ys = [y for y in range(450, H) if any(ink(px[x, y]) for x in range(W))]
    xs = [x for x in range(W) if any(ink(px[x, y]) for y in ys)]
    return min(xs), min(ys), max(xs) + 1, max(ys) + 1


def read_grid(im):
    """Majority-vote each cell over its middle half."""
    W, H = im.size
    cw, ch = W / COLS, H / ROWS
    px = im.load()
    grid = []
    for r in range(ROWS):
        row = []
        for c in range(COLS):
            x0, x1 = int(c * cw + cw * 0.3), int(c * cw + cw * 0.7)
            y0, y1 = int(r * ch + ch * 0.3), int(r * ch + ch * 0.7)
            vals = [snap(px[x, y])
                    for y in range(y0, max(y0 + 1, y1))
                    for x in range(x0, max(x0 + 1, x1))]
            row.append(Counter(vals).most_common(1)[0][0])
        grid.append(row)
    return grid


def mark_eye(grid):
    """Distinguish the enclosed white of the eye from the background.

    Flood fill the outside; any white the fill cannot reach is a feature. The
    eye would otherwise be emitted as a transparent hole.
    """
    H, W = len(grid), len(grid[0])
    seen, stack = set(), []
    for x in range(W):
        for y in (0, H - 1):
            if grid[y][x] == 'W':
                stack.append((x, y))
    for y in range(H):
        for x in (0, W - 1):
            if grid[y][x] == 'W':
                stack.append((x, y))
    seen.update(stack)
    while stack:
        x, y = stack.pop()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            a, b = x + dx, y + dy
            if 0 <= a < W and 0 <= b < H and grid[b][a] == 'W' and (a, b) not in seen:
                seen.add((a, b))
                stack.append((a, b))
    return [['E' if (grid[y][x] == 'W' and (x, y) not in seen) else grid[y][x]
             for x in range(W)] for y in range(H)]


def to_svg(grid):
    """Horizontal runs as rects. Scales to any size; recolours via five fills."""
    H, W = len(grid), len(grid[0])
    parts = {}
    for y, row in enumerate(grid):
        x = 0
        while x < W:
            c, n = row[x], 1
            while x + n < W and row[x + n] == c:
                n += 1
            if c != 'W':
                parts.setdefault(HEX[c], []).append(
                    f"<rect x='{x * CELL_W}' y='{y * CELL_H}' "
                    f"width='{n * CELL_W}' height='{CELL_H}'/>")
            x += n
    order = [HEX[k] for k in ('G', 'L', 'E', 'O', 'K') if HEX[k] in parts]
    body = ''.join(f"<g fill='{c}'>" + ''.join(parts[c]) + "</g>" for c in order)
    return (f"<svg xmlns='http://www.w3.org/2000/svg' "
            f"viewBox='0 0 {W * CELL_W} {H * CELL_H}' shape-rendering='crispEdges' "
            f"role='img' aria-label='Grey Duck Running'>{body}</svg>\n")


SQUARE_SIDE = 180          # 140 wide duck + 20 padding each side
SQUARE_X = 20              # multiple of CELL_W, so cell edges stay aligned
SQUARE_Y = 46              # (180 - 87) / 2, rounded to an integer


def to_svg_square(grid):
    """The same duck centred on a 1:1 canvas.

    The wide mark (1.61:1) is weak at header size — short, and with nothing to
    sit against it floats beside the wordmark. A square frame gives it presence
    at 40px without touching the artwork's proportions. Whether it carries a
    background tile is left to CSS, so the framed and bare versions are one
    declaration apart rather than two assets.
    """
    H, W = len(grid), len(grid[0])
    parts = {}
    for y, row in enumerate(grid):
        x = 0
        while x < W:
            ch, n = row[x], 1
            while x + n < W and row[x + n] == ch:
                n += 1
            if ch != 'W':
                parts.setdefault(HEX[ch], []).append(
                    f"<rect x='{SQUARE_X + x * CELL_W}' y='{SQUARE_Y + y * CELL_H}' "
                    f"width='{n * CELL_W}' height='{CELL_H}'/>")
            x += n
    order = [HEX[k] for k in ('G', 'L', 'E', 'O', 'K') if HEX[k] in parts]
    body = ''.join(f"<g fill='{c}'>" + ''.join(parts[c]) + "</g>" for c in order)
    # No crispEdges here, deliberately. This mark is shown small — 40px in the
    # header — where a 5x3 cell cannot land on whole device pixels at any usable
    # scale, and snapping edges would make some cells 1px and their neighbours
    # 2px. That unevenness is exactly what read as "aliasing" before. Letting the
    # browser antialias a downscale of flat art looks clean instead. The wide
    # duck.svg keeps crispEdges, since the hero uses it at an exact 2x.
    return (f"<svg xmlns='http://www.w3.org/2000/svg' "
            f"viewBox='0 0 {SQUARE_SIDE} {SQUARE_SIDE}' "
            f"role='img' aria-label='Grey Duck Running'>{body}</svg>\n")


def to_png(grid, scale=1):
    H, W = len(grid), len(grid[0])
    rgb = dict(PALETTE, E=WHITE)
    im = Image.new('RGBA', (W * CELL_W * scale, H * CELL_H * scale), (0, 0, 0, 0))
    px = im.load()
    for y, row in enumerate(grid):
        for x, ch in enumerate(row):
            if ch == 'W':
                continue
            col = rgb[ch] + (255,)
            for dy in range(CELL_H * scale):
                for dx in range(CELL_W * scale):
                    px[x * CELL_W * scale + dx, y * CELL_H * scale + dy] = col
    return im


def main():
    root = pathlib.Path(__file__).resolve().parent.parent
    src = sys.argv[1] if len(sys.argv) > 1 else root / 'assets' / 'logo-source.png'
    assets = root / 'assets'

    im = Image.open(src).convert('RGB')
    duck = im.crop(find_duck(im))
    grid = mark_eye(read_grid(duck))

    if FLATTEN_BELLY:
        grid = [['G' if c == 'L' else c for c in row] for row in grid]

    (assets / 'duck.svg').write_text(to_svg(grid))
    (assets / 'duck-square.svg').write_text(to_svg_square(grid))
    base = to_png(grid)
    base.save(assets / 'duck.png')
    print(f'duck {base.width}x{base.height} from a {COLS}x{ROWS} grid')

    # square, on the same white tile the header uses
    icon = Image.new('RGBA', (512, 512), (255, 255, 255, 255))
    d = to_png(grid, 3)
    icon.paste(d, ((512 - d.width) // 2, (512 - d.height) // 2), d)
    icon.save(assets / 'icon-512.png')
    fav = Image.new('RGBA', (180, 180), (255, 255, 255, 255))
    f = to_png(grid, 1)
    fav.paste(f, ((180 - f.width) // 2, (180 - f.height) // 2), f)
    fav.save(assets / 'favicon.png')

    card = Image.new('RGB', (1200, 630), (255, 255, 255))
    d2 = to_png(grid, 4)
    card.paste(d2, ((1200 - d2.width) // 2, (630 - d2.height) // 2), d2)
    card.save(assets / 'og-image.png')

    print('wrote duck.svg, duck.png, favicon.png, icon-512.png, og-image.png')


if __name__ == '__main__':
    main()
