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
script.js               footer year + mobile nav toggle; page works with JS off
assets/duck.svg         the logo — header mark, hero, and favicon
assets/favicon.svg      copy of duck.svg
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

The artwork is 8-bit pixel art, so the site follows that language: zero `border-radius`,
3px black outlines, hard offset shadows (no blur), `Press Start 2P` for headings, and
`image-rendering: pixelated` so it stays crisp when scaled.

Dark mode is supported via `prefers-color-scheme`.

### The logo

`assets/duck.svg` is the podcast's own duck, vectorised — not a redraw. The source is a
150x150 JPEG, which traces cleanly back to a native 30x30 pixel grid. All of the original
detail is kept: the large eye with its pupil, the wedge beak, the pointed tail, the black
wing line across the body, the belly, and the orange feet. The duck is 28x17, a 1.65:1
aspect — it is genuinely a wide duck, and squaring it up makes it look wrong.

Two pixels were repaired: isolated belly-grey specks that are JPEG ringing rather than
design. The eye is a gap in the original artwork that reads white only because the source
sits on a white square, so enclosed regions are explicitly filled — otherwise the eye goes
transparent in SVG.

`tools/make-duck.py` regenerates `duck.svg`, `favicon.svg`, `og-image.png` and
`icon-512.png` from `assets/logo-source.jpg`, and reproduces the committed SVG byte for
byte. You only need it if the logo itself changes.

Being SVG on an integer grid, it scales to any size without blurring and recolours by
editing five fill values.

---

## Editing common things

**Change copy** — it's all literal text in `index.html`. No templating.

**Episodes** — there is no hardcoded episode list to maintain. The Spotify embed in the
`#listen` section always shows the newest episode and updates itself as new ones publish.
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

- **Instagram is the only known social account.** Five web searches plus a read of
  `greyduckrunning.com` turned up no Facebook page, Strava club, YouTube channel, or contact
  address — the show has essentially no indexed web presence outside Spotify. Only
  [instagram.com/greyduckrunning](https://www.instagram.com/greyduckrunning) is wired up, and that
  came from the hosts rather than from a search (Instagram serves a login wall to automated
  readers, so it could not be confirmed programmatically). Slots for Facebook / Strava / email are
  commented out in the `#follow` section of `index.html`; open each URL yourself before uncommenting.
- **The show is not in any podcast directory but Spotify.** No Apple Podcasts listing, so no public
  RSS feed. Submitting the feed to Apple and Pocket Casts would make the show findable and would
  also unlock a self-hosted episode list here.
- **Host bios are missing.** Christian and Lauren are listed by name and marked "Co-host" in
  `#about`, with nothing else. An earlier draft had invented bios; those were deleted rather
  than reworded, so what's there now is thin but true. Real bios are the main thing this page
  is still waiting on.
