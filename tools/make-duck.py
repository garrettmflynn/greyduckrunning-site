#!/usr/bin/env python3
"""Rebuild assets/duck.svg (and the PNG derivatives) from the podcast's logo.

The logo we were given is a small JPEG, so it carries compression noise. This
traces it back to its native pixel grid, repairs the noise, and emits vector
output — the artwork is preserved exactly, just made resolution-independent.

    python3 tools/make-duck.py path/to/logo.jpg

Requires Pillow. Only needed if the logo itself changes; assets/duck.svg is
committed, so normal site work never runs this.
"""
import sys, pathlib
from collections import Counter
from PIL import Image

# The five colours the artwork uses, sampled from the Spotify cover.
PAL = {'W': (255, 255, 255), 'G': (176, 176, 176), 'K': (0, 0, 0),
       'L': (200, 200, 200), 'O': (248, 104, 0)}
HEX = {'G': '#B0B0B0', 'K': '#000000', 'L': '#C8C8C8', 'O': '#F86800', 'E': '#FFFFFF'}
GRID = 30  # native pixel grid of the source logo


def snap(p):
    return min(PAL, key=lambda k: sum((a - b) ** 2 for a, b in zip(p, PAL[k])))


def trace(path, n=GRID):
    """Downsample to the native grid, majority-voting each cell."""
    im = Image.open(path).convert('RGB')
    w, h = im.size
    cw, ch = w / n, h / n
    out = []
    for gy in range(n):
        row = []
        for gx in range(n):
            x0, y0 = int(gx * cw), int(gy * ch)
            x1, y1 = int((gx + 1) * cw), int((gy + 1) * ch)
            mx, my = max(1, (x1 - x0) // 4), max(1, (y1 - y0) // 4)
            votes = Counter(snap(im.getpixel((x, y)))
                            for y in range(y0 + my, y1 - my)
                            for x in range(x0 + mx, x1 - mx))
            row.append(votes.most_common(1)[0][0] if votes else 'W')
        out.append(row)
    return out


def despeckle(src):
    """Drop belly-grey pixels with no belly-grey neighbour — JPEG ringing, not design.

    Neighbours are read from `src`, never from the copy being written, or one
    repair changes the next pixel's neighbourhood and the fix cascades.
    """
    n = len(src)
    g = [r[:] for r in src]
    for y in range(n):
        for x in range(n):
            if src[y][x] != 'L':
                continue
            nb = [src[y + dy][x + dx] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))
                  if 0 <= x + dx < n and 0 <= y + dy < n]
            if nb.count('L') == 0:
                g[y][x] = 'G'
    return g


def fill_holes(g):
    """Paint enclosed background regions white.

    The duck's eye is a gap in the artwork that reads white only because the
    source sits on a white square. Left alone it would go transparent in SVG.
    """
    n = len(g)
    seen, stack = set(), []
    for i in range(n):
        for p in ((i, 0), (i, n - 1), (0, i), (n - 1, i)):
            if g[p[1]][p[0]] == 'W':
                stack.append(p)
    seen.update(stack)
    while stack:
        x, y = stack.pop()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < n and 0 <= ny < n and g[ny][nx] == 'W' and (nx, ny) not in seen:
                seen.add((nx, ny))
                stack.append((nx, ny))
    for y in range(n):
        for x in range(n):
            if g[y][x] == 'W' and (x, y) not in seen:
                g[y][x] = 'E'
    return g


def crop(g):
    n = len(g)
    ys = [y for y in range(n) if any(c != 'W' for c in g[y])]
    xs = [x for x in range(n) if any(g[y][x] != 'W' for y in ys)]
    return [g[y][min(xs):max(xs) + 1] for y in range(min(ys), max(ys) + 1)]


def to_svg(grid):
    """Merge horizontal runs into rects, grouped by colour."""
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
    C = {k: v for k, v in PAL.items()}
    C['E'] = (255, 255, 255)
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
    root = pathlib.Path(__file__).resolve().parent.parent
    assets = root / 'assets'

    grid = crop(fill_holes(despeckle(trace(src))))
    h, w = len(grid), len(grid[0])
    print(f'duck: {w}x{h} (aspect {w/h:.2f}:1)')

    svg = to_svg(grid)
    (assets / 'duck.svg').write_text(svg)
    (assets / 'favicon.svg').write_text(svg)

    card = Image.new('RGB', (1200, 630), (248, 248, 248))
    d = to_png(grid, 30)
    card.paste(d, ((1200 - d.width) // 2, (630 - d.height) // 2), d)
    card.save(assets / 'og-image.png')

    icon = Image.new('RGB', (512, 512), (248, 248, 248))
    d2 = to_png(grid, 16)
    icon.paste(d2, ((512 - d2.width) // 2, (512 - d2.height) // 2), d2)
    icon.save(assets / 'icon-512.png')

    print('wrote duck.svg, favicon.svg, og-image.png, icon-512.png')


if __name__ == '__main__':
    main()
