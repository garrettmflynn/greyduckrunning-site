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
assets/duck.png         the logo, background removed — header mark and hero
assets/favicon.png      copy of duck.png
assets/og-image.png     1200x630 social preview
assets/icon-512.png     512px app icon
assets/logo-source.jpg  the logo JPEG the SVG is traced from
assets/cover.jpg        the Spotify cover art, kept for reference
tools/make-duck.py      regenerates the logo assets (see below)
CNAME                   attaches greyduckrunning.com (see below)
```

---

## Branding

The palette is **sampled from the show's actual Spotify cover art**, not invented:

| Swatch | Hex | Share of artwork | Used for |
|---|---|---|---|
| Paper white | `#F8F8F8` | 54.8% | page background |
| Duck grey | `#B0B0B0` | 23.4% | duck body, avatars |
| Outline black | `#000000` | 11.0% | borders, text |
| Belly grey | `#C8C8C8` | 5.1% | *(retired — merged into duck grey)* |
| Beak orange | `#F86800` | 1.2% | accents, primary buttons |

**The logo is pixel art. The site deliberately is not.** An earlier version pushed the pixel
language across everything — arcade typeface, hard offset shadows, chunky black borders, a
scrolling marquee — and it read as a novelty rather than a podcast worth trusting. The
continuity now comes from two things only: the palette above, and the duck itself shown at
whole-number scale so it stays crisp. Everything else is ordinary modern layout — Inter,
soft shadows, rounded cards, generous whitespace.

`--accent` is the logo's `#F86800` nudged to `#E85D04` so it passes contrast as text; the
Spotify green `#1DB954` is used only on the Spotify buttons, where it is the recognised
convention rather than decoration.

Dark mode is supported via `prefers-color-scheme`.

### The logo

`assets/duck.svg` is the logo, flattened to **three inks — black, grey, orange** — plus white
for the eye. The belly highlight was a second grey two shades off the first; at the sizes this
is shown that is detail nobody reads, and it only made the shape noisier. The eye keeps its
white because dropping it costs the eye entirely: at header size a grey eye with a black pupil
reads as a smudge.

The background is removed by flood fill, and alpha is binary — a pixel is fully in or fully
out — so there is no partial-alpha edge to glow as a halo on dark backgrounds.

**It is not enlarged, and that is a hard constraint of the source.** The only file available
is a 150px JPEG whose downscale severed the hairline outline. Traced at native resolution,
with no grid assumption at all, the black outline comes apart into **43 disconnected pieces**
and the feet into 3. Those breaks are in the file; enlarging magnifies every one of them.
The site therefore shows the duck at or near natural size, where it reads exactly as it does
on Spotify and Instagram.

Three attempts to reconstruct it as clean vector pixel art were abandoned, and it is worth
knowing why before trying again:

| Attempt | Result |
|---|---|
| Recover the Excel grid, three ways — lattice fit, cell-colour uniformity, run-length multiples | All three returned flat, signal-free curves. The source was downscaled by a non-integer factor, so cell boundaries no longer exist. |
| Trace at a pinned grid and rebuild the outline | Outline weight came out roughly twice the original, because Excel draws the border as a hairline on the gridline, not as a filled cell. |
| Snap every pixel to the four brand colours | Worse. The intermediate greys were holding the outline together visually; hardening them turned a continuous edge into a dotted one. |

> [!IMPORTANT]
> **A larger export fixes all of this.** The original spreadsheet, or a full-size screenshot
> taken before downscaling, would make a crisp, freely scalable, recolourable vector trivial —
> and would let the logo be used at any size. `tools/make-duck.py` is the workaround, not the
> answer.

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

**DNS still points at Squarespace, which is why GitHub reports `NotServedByPagesError`.** The
nameservers are `nsb1–4.squarespacedns.com`, and the apex still answers with Squarespace's
IPs (`198.185.159.x`, `198.49.23.x`). Until that changes, the domain cannot serve this site —
nothing in this repo can fix it, because the records live in the Squarespace account.

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
