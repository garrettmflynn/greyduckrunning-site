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
index.html          all page content
styles.css          all styling + the pixel-duck mark (inline SVG data URI)
script.js           footer year + mobile nav toggle; page works with JS off
assets/cover.jpg    the show's real cover art, from Spotify
assets/favicon.svg  pixel duck, generated from the mark in styles.css
CNAME.example       rename to CNAME to attach greyduckrunning.com (see below)
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
`image-rendering: pixelated` on the artwork so it stays crisp when scaled.

Dark mode is supported via `prefers-color-scheme`.

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

The repo is private. **GitHub Pages on a private repo requires a paid plan** (Pro, Team, or
Enterprise). On a free plan you must either make the repo public or deploy somewhere else
(Netlify and Cloudflare Pages both serve private repos free).

To enable Pages: **Settings → Pages → Source: GitHub Actions**. The workflow in
`.github/workflows/pages.yml` publishes the repo root on every push to `main`.

---

## Attaching greyduckrunning.com

> [!IMPORTANT]
> `greyduckrunning.com` is **currently live on Squarespace** (nameservers `nsb1–4.squarespacedns.com`,
> serving HTTP 200 as of setup). Pointing DNS at GitHub Pages **takes that site down** and replaces
> it with this one. That is a deliberate cutover, so nothing in this repo does it automatically —
> the `CNAME` file ships defused as `CNAME.example`.

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

- **Socials are unverified beyond Instagram.** Only
  [instagram.com/greyduckrunning](https://www.instagram.com/greyduckrunning) is wired up, and it was
  supplied directly rather than confirmed programmatically — Instagram serves a login wall to
  automated readers. Slots for Facebook / Strava / email are commented out in the `#follow` section
  of `index.html`; open each URL yourself before uncommenting.
- **Host bios are written, not sourced.** The descriptions of Christian and Lauren in `#about` are
  plausible filler matching the show's tone. Replace them with real bios.
- **`assets/og-image.png` is not present**; social previews currently fall back to `cover.jpg`,
  which is square. A 1200×630 version would preview better on Twitter/Facebook.
