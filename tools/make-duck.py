W = H = 32

def build():
    g = [['.' for _ in range(W)] for _ in range(H)]
    def ell(cx, cy, rx, ry, ch):
        for y in range(H):
            for x in range(W):
                if ((x+.5-cx)/rx)**2 + ((y+.5-cy)/ry)**2 <= 1: g[y][x] = ch

    # ---- silhouette: one connected shape, built before outlining ----
    ell(13.5, 18.0, 11.0, 6.0, 'G')      # body
    ell(20.5, 9.5, 5.7, 5.7, "G")        # head, a true circle
    ell(18.0, 14.0, 5.0, 4.5, 'G')       # neck

    # tail: a blunt wedge off the back, thick enough to avoid 1px specks
    for y in range(12, 19):
        for x in range(2, 7):
            if 2 <= (y - 12) + (x - 2) <= 8: g[y][x] = 'G'

    ell(13.0, 20.0, 6.5, 2.4, 'L')       # belly highlight

    # ---- 1px uniform outline over the silhouette ----
    out = [r[:] for r in g]
    for y in range(H):
        for x in range(W):
            if g[y][x] == '.': continue
            if any(not (0 <= x+dx < W and 0 <= y+dy < H) or g[y+dy][x+dx] == '.'
                   for dx, dy in ((1,0),(-1,0),(0,1),(0,-1))):
                out[y][x] = 'K'
    g = out

    # ---- features drawn explicitly on top, each with its own outline ----
    # beak: an orange wedge off the right of the head
    beak = {
        (26,9):'K',(27,9):'K',(28,9):'K',(29,9):'K',
        (26,10):'O',(27,10):'O',(28,10):'O',(29,10):'K',
        (26,11):'O',(27,11):'O',(28,11):'K',
        (26,12):'K',(27,12):'K',
    }
    for (x,y),c in beak.items(): g[y][x] = c

    # eye: white block, black pupil
    for y in range(7, 10):
        for x in range(21, 24): g[y][x] = 'E'
    g[8][22] = 'P'

    # feet: orange run on the body's underside, keeping a black edge below it
    ys = [y for y in range(H) if any(c != '.' for c in g[y])]
    b = max(ys)
    for x in range(10, 17):
        if g[b-1][x] != '.': g[b-1][x] = 'O'
    return g

g = build()
for r in g: print(''.join(r))

# Run:  python3 tools/make-duck.py
# Prints the 32x32 grid. The committed assets/duck.svg was generated from this;
# edit the primitives above and re-emit if the logo ever needs adjusting.
