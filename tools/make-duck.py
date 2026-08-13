#!/usr/bin/env python3
"""Rebuild assets/duck.svg (and its PNG derivatives) from the podcast's logo.

The logo was drawn in Excel — coloured cells on a spreadsheet grid — then
screenshotted and downscaled to a small JPEG. So there is a true pixel grid
underneath, but the JPEG has lost some of it. This recovers the grid, repairs
what the downscale damaged, and emits vector output.

    python3 tools/make-duck.py assets/logo-source.jpg

Requires Pillow. assets/duck.svg is committed, so normal site work never runs
this — only needed if the logo itself changes.
"""
import sys
import pathlib
from collections import Counter
from PIL import Image

# The five colours the artwork uses, sampled from the Spotify cover art.
PAL = {'W': (255, 255, 255), 'G': (176, 176, 176), 'K': (0, 0, 0),
       'L': (200, 200, 200), 'O': (248, 104, 0)}
HEX = {'G': '#B0B0B0', 'K': '#000000', 'L': '#C8C8C8', 'O': '#F86800', 'E': '#FFFFFF'}

CELLS_X, CELLS_Y = 28, 17   # the Excel grid the duck was drawn on
SMOOTH_PASSES = 1           # Scale2x rounds; 2 passes thickens the outline


def snap(px):
    return min(PAL, key=lambda k: sum((a - b) ** 2 for a, b in zip(px, PAL[k])))


def trace(path, nx=CELLS_X, ny=CELLS_Y):
    """Downsample to the Excel cell grid.

    Not a plain majority vote. A one-cell outline, once the screenshot was
    downscaled, ends up thinner than a cell — it measures ~3px inside a ~5px
    cell — so majority hands the cell to the grey it borders and the outline
    dissolves. Orange is likewise small enough to lose. Both get presence
    thresholds instead, which is what keeps the crown and the feet.
    """
    im = Image.open(path).convert('RGB')
    W, H = im.size
    xs = [x for x in range(W) if any(snap(im.getpixel((x, y))) != 'W' for y in range(H))]
    ys = [y for y in range(H) if any(snap(im.getpixel((x, y))) != 'W' for x in range(W))]
    x0, x1, y0, y1 = min(xs), max(xs) + 1, min(ys), max(ys) + 1
    cw, ch = (x1 - x0) / nx, (y1 - y0) / ny

    grid = []
    for gy in range(ny):
        row = []
        for gx in range(nx):
            ax, ay = x0 + gx * cw, y0 + gy * ch
            bx, by = x0 + (gx + 1) * cw, y0 + (gy + 1) * ch
            vals = [snap(im.getpixel((x, y)))
                    for y in range(int(ay), max(int(ay) + 1, int(by)))
                    for x in range(int(ax), max(int(ax) + 1, int(bx)))]
            c = Counter(vals)
            tot = sum(c.values())
            if c.get('O', 0) / tot >= 0.28:
                row.append('O')
            elif c.get('K', 0) / tot >= 0.42:
                row.append('K')
            else:
                row.append(c.most_common(1)[0][0])
        grid.append(row)
    return grid


def fill_holes(g):
    """Paint enclosed background regions white.

    The eye is a gap in the artwork that reads white only because the drawing
    sits on a white sheet. Left as background it would go transparent in SVG,
    and close_outline() would draw a black ring around it.
    """
    ny, nx = len(g), len(g[0])
    seen, stack = set(), []
    for i in range(max(nx, ny)):
        for p in ((min(i, nx - 1), 0), (min(i, nx - 1), ny - 1),
                  (0, min(i, ny - 1)), (nx - 1, min(i, ny - 1))):
            if g[p[1]][p[0]] == 'W':
                stack.append(p)
    seen.update(stack)
    while stack:
        x, y = stack.pop()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            a, b = x + dx, y + dy
            if 0 <= a < nx and 0 <= b < ny and g[b][a] == 'W' and (a, b) not in seen:
                seen.add((a, b))
                stack.append((a, b))
    return [['E' if (g[y][x] == 'W' and (x, y) not in seen) else g[y][x]
             for x in range(nx)] for y in range(ny)]


def close_outline(g):
    """Add black only where the silhouette edge is bare.

    Grows outward into background rather than recolouring edge pixels —
    recolouring would turn the orange feet and the beak black. Where the
    artwork already has an outline this does nothing; it fills in the top of
    the head and the underside of the feet, which the downscale ate.
    """
    ny, nx = len(g) + 2, len(g[0]) + 2
    pad = [['W'] * nx for _ in range(ny)]
    for y, row in enumerate(g):
        for x, c in enumerate(row):
            pad[y + 1][x + 1] = c
    out = [r[:] for r in pad]
    for y in range(ny):
        for x in range(nx):
            if pad[y][x] != 'W':
                continue
            if any(0 <= x + dx < nx and 0 <= y + dy < ny
                   and pad[y + dy][x + dx] not in ('W', 'K')
                   for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                out[y][x] = 'K'
    return out


def despeckle(g):
    """Drop belly-grey pixels with no belly-grey neighbour — JPEG ringing.

    Neighbours are read from the input, never from the copy being written, or
    one repair changes the next pixel's neighbourhood and the fix cascades
    along the row. Black is deliberately never despeckled: a legitimate
    outline can be a single isolated pixel (the beak tip), and dropping it
    opens a hole in the silhouette.
    """
    ny, nx = len(g), len(g[0])
    out = [r[:] for r in g]
    for y in range(ny):
        for x in range(nx):
            if g[y][x] != 'L':
                continue
            nb = [g[y + dy][x + dx] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))
                  if 0 <= x + dx < nx and 0 <= y + dy < ny]
            if nb.count('L') == 0:
                out[y][x] = 'G'
    return out


def scale2x(g):
    """EPX/Scale2x — doubles resolution, rounding staircase diagonals.

    Chosen over a smooth resampler because it never introduces a colour that
    is not already in the palette, so the result stays true pixel art.
    """
    ny, nx = len(g), len(g[0])
    at = lambda x, y: g[y][x] if 0 <= x < nx and 0 <= y < ny else 'W'
    out = [['W'] * (nx * 2) for _ in range(ny * 2)]
    for y in range(ny):
        for x in range(nx):
            P = g[y][x]
            A, B, C, D = at(x, y - 1), at(x + 1, y), at(x - 1, y), at(x, y + 1)
            out[2*y][2*x]     = A if (C == A and C != D and A != B) else P
            out[2*y][2*x+1]   = B if (A == B and A != C and B != D) else P
            out[2*y+1][2*x]   = C if (D == C and D != B and C != A) else P
            out[2*y+1][2*x+1] = D if (B == D and B != A and D != C) else P
    return out


def crop(g):
    ny, nx = len(g), len(g[0])
    ys = [y for y in range(ny) if any(c != 'W' for c in g[y])]
    xs = [x for x in range(nx) if any(g[y][x] != 'W' for y in ys)]
    return [g[y][min(xs):max(xs) + 1] for y in range(min(ys), max(ys) + 1)]


def verify(g):
    """Every coloured pixel on the boundary must be black."""
    ny, nx = len(g), len(g[0])
    bare = [(x, y) for y in range(ny) for x in range(nx)
            if g[y][x] not in ('W', 'K')
            and any(not (0 <= x + dx < nx and 0 <= y + dy < ny)
                    or g[y + dy][x + dx] == 'W'
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
    if bare:
        raise SystemExit(f'outline is open at {len(bare)} pixel(s): {bare[:8]}')


def build(path):
    g = fill_holes(trace(path))
    g = close_outline(g)
    g = despeckle(g)
    g = fill_holes(g)
    for _ in range(SMOOTH_PASSES):
        g = scale2x(g)
    g = crop(g)
    verify(g)
    return g


def to_svg(grid):
    h, w = len(grid), len(grid[0])
    parts = {}
    for y, row in enumerate(grid):
        x = 0
        while x < w:
            c, run = row[x], 1
            while x + run < w and row[x + run] == c:
                run += 1
            if c in HEX:
                parts.setdefault(HEX[c], []).append(
                    f"<rect x='{x}' y='{y}' width='{run}' height='1'/>")
            x += run
    order = [HEX[k] for k in ('G', 'L', 'E', 'O', 'K') if HEX[k] in parts]
    body = ''.join(f"<g fill='{c}'>" + ''.join(parts[c]) + "</g>" for c in order)
    return (f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {h}' "
            f"shape-rendering='crispEdges' role='img' "
            f"aria-label='Grey Duck Running'>{body}</svg>\n")


def to_png(grid, scale):
    h, w = len(grid), len(grid[0])
    C = dict(PAL, E=(255, 255, 255))
    im = Image.new('RGBA', (w * scale, h * scale), (0, 0, 0, 0))
    px = im.load()
    for y, row in enumerate(grid):
        for x, ch in enumerate(row):
            if ch == 'W':
                continue
            c = C[ch] + (255,)
            for dy in range(scale):
                for dx in range(scale):
                    px[x * scale + dx, y * scale + dy] = c
    return im


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else 'assets/logo-source.jpg'
    assets = pathlib.Path(__file__).resolve().parent.parent / 'assets'

    grid = build(src)
    h, w = len(grid), len(grid[0])
    print(f'duck: {w}x{h} ({CELLS_X}x{CELLS_Y} cells, {SMOOTH_PASSES} smoothing pass)')

    svg = to_svg(grid)
    (assets / 'duck.svg').write_text(svg)
    (assets / 'favicon.svg').write_text(svg)

    card = Image.new('RGB', (1200, 630), (248, 248, 248))
    d = to_png(grid, 15)
    card.paste(d, ((1200 - d.width) // 2, (630 - d.height) // 2), d)
    card.save(assets / 'og-image.png')

    icon = Image.new('RGB', (512, 512), (248, 248, 248))
    d2 = to_png(grid, 8)
    icon.paste(d2, ((512 - d2.width) // 2, (512 - d2.height) // 2), d2)
    icon.save(assets / 'icon-512.png')

    print('wrote duck.svg, favicon.svg, og-image.png, icon-512.png')


if __name__ == '__main__':
    main()
