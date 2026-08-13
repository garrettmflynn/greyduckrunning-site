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
CNAME.example           rename to CNAME to attach greyduckrunning.com (see below)
```

---

## Branding

The palette is **sampled from the show's actual Spotify cover art**, not invented:

| Swatch | Hex | Share of artwork | Used for |
|---|---|---|---|
| Paper white | `#F8F8F8` | 54.8% | page background |
| Duck grey | `#B0B0B0` | 23.4% | duck body, avatars |
| Outline black | `#000000` | 11.0% | borders, text |
| Belly grey | `#C8C8C8` | 5.1% | duck belly |
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

`assets/duck.png` is the podcast's own artwork with the white background removed, and the
white un-blended out of the antialiased edge pixels so the outline does not glow as a pale
halo on a dark background. Nothing else is changed.

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

## Deploying to GitHub Pages

The repo is public, so Pages works on a free plan with no upgrade needed.

To enable it: **Settings → Pages → Source: GitHub Actions**. The workflow in
`.github/workflows/pages.yml` publishes the repo root on every push to `main`. Nothing is
published until you turn that on.

---

## Attaching greyduckrunning.com

`greyduckrunning.com` currently resolves to a **Squarespace parking page** — the default
"We're under construction" template, with no real content, no socials, and no branding of its
own. Nameservers are `nsb1–4.squarespacedns.com`. There is nothing of value to preserve, so
cutting over costs nothing but the DNS edit.

The `CNAME` file still ships defused as `CNAME.example`, because arming it before DNS points at
GitHub just puts Pages into an error state. Rename it as part of the cutover, not before.

When you're ready to cut over:

1. `git mv CNAME.example CNAME`, commit, push.
2. Enable Pages (above) and confirm the site loads at `<user>.github.io/greyduckrunning-site`.
3. In Squarespace DNS, replace the existing `A` records for the apex with GitHub's four:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
4. Point `www` at `<user>.github.io` via `CNAME`.
5. In **Settings → Pages → Custom domain**, enter `greyduckrunning.com`, then tick
   **Enforce HTTPS** once the certificate provisions (can take up to ~24h).

DNS changes propagate on TTL, so keep the Squarespace site up until step 2 checks out.

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
