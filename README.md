# greyduckrunning-site

Website for the **[Grey Duck Running Podcast](https://open.spotify.com/show/033LBDWqdgBps2G7CM41d2)** —
"a podcast for the mediocre runner," covering Midwest endurance events (running, biking, hiking
and more). Hosted by Christian and Lauren.

Plain static HTML/CSS/JS. No build step, no framework, no package manager.

---

## Run it locally

Any static server works. With Python installed:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Editing a file and refreshing is the whole dev loop.

---

## Layout

```
index.html              all page content
styles.css              all styling
script.js               footer year + scroll reveals; page works with JS off
assets/duck.svg         the logo — header mark and hero
assets/duck.png         raster copy of duck.svg
assets/favicon.png      copy of duck.png
assets/og-image.png     1200x630 social preview
assets/icon-512.png     512px app icon
assets/duck-square.svg  the logo on a 1:1 canvas — used in the header
assets/logo-source.png  lossless source the logo is generated from
assets/hero-*.jpg       hero background at three widths
assets/brand-icons/     official Simple Icons marks (CC0) for the social links
assets/cover.jpg        the Spotify cover art, kept for reference
tools/make-duck.py      regenerates the logo assets (see below)
CNAME                   attaches greyduckrunning.com (see below)
```

---

## Branding

The palette is read from the logo's lossless source, so these are the artwork's exact
colours:

| Swatch | Hex | Used for |
|---|---|---|
| Duck grey | `#B7B7B7` | the duck |
| Outline black | `#000000` | outline, text |
| Beak orange | `#FF6D01` | beak, feet, accents |
| Eye white | `#FFFFFF` | the eye |
| Belly grey | `#CCCCCC` | *(present in the artwork, merged into the duck grey — see below)* |

An earlier set (`#B0B0B0`, `#C8C8C8`, `#F86800`) was sampled from the compressed Spotify
cover and was slightly wrong on every value.

**The logo is pixel art. The site deliberately is not.** An earlier version pushed the pixel
language across everything — arcade typeface, hard offset shadows, chunky black borders, a
scrolling marquee — and it read as a novelty rather than a podcast worth trusting. The
continuity now comes from two things only: the palette above, and the duck itself shown at
whole-number scale so it stays crisp. Everything else is ordinary modern layout — Inter,
soft shadows, rounded cards, generous whitespace.

`--accent` is the logo's `#FF6D01` nudged to `#E85D04` so it passes contrast as text; the
Spotify green `#1DB954` is used only on the Spotify buttons, where it is the recognised
convention rather than decoration.

Dark mode is supported via `prefers-color-scheme`.

### The logo

`assets/duck.svg` is generated from `assets/logo-source.png`, a **lossless** screenshot of
the original spreadsheet. That source solved a problem that had been unsolvable, and the
contrast is worth recording.

| | Old 150px JPEG | Lossless PNG |
|---|---|---|
| Grid detection | Three methods, all flat and signal-free | Recovered exactly |
| Cell purity | Never above ~88% at any grid | **100.00%** |
| Outline fragments | 43 | 3 |
| Crown / feet outlines | Destroyed by the downscale | Present |
| SVG size | 1005 rects, ~3.9KB gzipped | **141 rects, ~779 bytes** |

The grid is **28 x 29 cells**. Every cell is a single flat colour, which is why the runs
merge and the file is a fifth the size.

**Cells are not square.** Measured pitch is 24.75px across and 14.83px down — a ratio of
1.67:1, the shape of a default Excel cell, which is what the logo was drawn on. That single
fact explains the "squished" look chased for hours against the old source: the duck really is
wider than a square grid would make it. A cell is therefore emitted 5 wide by 3 tall, giving
square output pixels, a 140x87 viewBox, and an aspect of 1.61 against the source's 1.612.

The belly highlight (`#CCCCCC`) is merged into the main grey by `FLATTEN_BELLY` in
`tools/make-duck.py`. That was a deliberate call — a second grey a few shades off the first is
detail nobody reads at these sizes. It is now clean in the source, so flipping that flag to
`False` restores the artwork's four inks.

Being vector on an integer grid, it scales freely and recolours by editing four fill values.
Displayed sizes are still whole multiples of the viewBox (0.5x in the header, 2x in the hero)
so every cell edge lands on a device pixel.
---

## Editing common things

**Change copy** — it's all literal text in `index.html`. No templating.

**Episodes** — there is no hardcoded episode list to maintain. The Spotify embed sits in the
hero and always shows the newest episode, updating itself as new ones publish.
If the show ever gets a public RSS feed, that would open up a self-hosted episode list; as
of setup it was not listed in Apple Podcasts, so no feed URL was available.

> The embed `height` is set to `232`, which fits the single-episode card exactly. Spotify only
> renders the full scrollable episode list for visitors already logged into Spotify — at a
> taller height, logged-out visitors (most of them) get a large empty box instead. Raise it to
> `480` only if you'd rather optimise for logged-in listeners.

**Colors** — every color is a CSS custom property in the `:root` block at the top of
`styles.css`. Change it there once, not throughout the file.

---

## Deploying

Pages is enabled and serving from the `main` branch root — **Settings → Pages → Source:
Deploy from a branch**. There is no build step, so nothing needs to compile; pushing to
`main` publishes.

There is deliberately no Actions workflow. An earlier one used `actions/deploy-pages`, which
requires Pages to be set to "GitHub Actions" as its source. It failed on every push while
Pages was off, and once Pages was switched on as a branch deploy it became a second builder
racing the built-in one. Branch deploys are the simpler fit for a site that is already just
files.

---

## The domain

`CNAME` contains `greyduckrunning.com`. GitHub created it when the custom domain was set in
Settings; do not delete it, or the domain setting is dropped on the next deploy.

**DNS is pointed at GitHub and the site is served.** The apex answers with GitHub's four IPs
and `www` is a `CNAME` to `garrettmflynn.github.io`, confirmed from eight independent public
resolvers. If it ever needs re-doing, the records are below.

In Squarespace, under **Domains → greyduckrunning.com → DNS Settings**, replace the apex `A`
records with GitHub's four:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Optionally add the IPv6 `AAAA` records too:

```
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

And point `www` at `garrettmflynn.github.io` with a `CNAME` record, replacing the existing
`ext-sq.squarespace.com`.

Two things that commonly go wrong here:

- If the domain is still **connected to a Squarespace site**, Squarespace will keep
  reinstating its own records. Disconnect it there first.
- **Enforce HTTPS** stays greyed out until DNS resolves to GitHub and a certificate issues.
  That can take up to 24h. Tick it once it becomes available — until then the site is
  served over HTTP only.

Propagation follows the old records' TTL, so allow up to a few hours before re-checking.
GitHub re-runs the check automatically, and **Settings → Pages** will clear the error on its
own once the records resolve.

---

## Known gaps

- **Host bios are missing — the one thing blocking this page.** The two name cards that used to
  sit at the bottom of `#about` carried nothing beyond "Co-host", so they were removed rather
  than left looking unfinished; the names still appear in the About copy and the At a Glance
  card. An earlier draft had invented bios, deleted rather than reworded.

  Episode one, *Uncle Sam Wants YOU to Listen to Our Podcast* (Jul 7, 59 min), is where they
  introduce themselves and cover how they got into running — but that is audio only. Spotify
  has no transcript for this show, and with no RSS feed there is no file to work from, so the
  intro cannot be recovered without someone listening to it. **Two sentences each from the
  hosts is the fastest fix**, and better than anything reconstructed second-hand.

- **Instagram is the only social account, now confirmed.**
  [instagram.com/greyduckrunning](https://www.instagram.com/greyduckrunning) appears in the hosts'
  own episode descriptions across several episodes, so it is source-verified rather than taken on
  trust. Five web searches plus a read of `greyduckrunning.com` turned up no Facebook page, Strava
  club, YouTube channel, or contact address — the show has essentially no indexed web presence
  outside Spotify. Slots for the others are commented out in the `#follow` section of `index.html`.

- **The show is not in any podcast directory but Spotify.** No Apple Podcasts listing, so no public
  RSS feed. Submitting the feed to Apple and Pocket Casts would make the show findable and would
  also unlock a self-hosted episode list here.

### Verified from episode descriptions

Facts drawn from the hosts' own episode notes, in case they are useful for copy later:

| Fact | Source |
|---|---|
| 6 episodes, launched Jul 7 2026 | full episode list |
| Runtimes 54 min – 1 hr 7 min | episode list — this is what "about an hour" on the page rests on |
| Lauren rode Ride Across Wisconsin, a century ride | ep. *Ride Across Wisconsin Recap* |
| Both raced the Pure Water Days Half Marathon, Chippewa Falls WI | ep. *Pure Water Days 2026* |
| Christian's mum Stephine guested; she spectates races and runs a business | ep. *Vaycay Mode!!!* |
| Races covered span WI, MN, IA and NE | across all episodes |

The events they cover cluster around western Wisconsin (Chippewa Falls, Eau Claire), which
suggests that is where they are based — but that is inferred from race locations, never stated,
so the page says "Upper Midwest" rather than claiming a home town.

---

## Credits

Hero photograph by **Miguel A. Amutio** via [Unsplash](https://unsplash.com/photos/QDv-uBc-poY),
used under the Unsplash License (free for commercial use). Stored at three widths in `assets/`
and served by media query; the original 18MP file is not in the repo.

Brand marks for Spotify, Instagram and Strava are from
[Simple Icons](https://simpleicons.org) (CC0). Extra marks are kept unused in
`assets/brand-icons/` ready for Apple Podcasts, Pocket Casts, YouTube Music, Facebook and RSS.

The duck is the hosts' own artwork, drawn in Excel.
