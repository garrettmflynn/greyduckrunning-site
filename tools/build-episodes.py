#!/usr/bin/env python3
"""Write the episode list into index.html from the podcast's RSS feed.

    python3 tools/build-episodes.py

Generated at build time rather than fetched in the browser. The feed does serve
access-control-allow-origin:* so a runtime fetch would work, but baking the list
in means it renders instantly, survives JavaScript being off, and does not make
the page depend on anchor.fm being reachable. The cost is that it goes stale, so
.github/workflows/episodes.yml re-runs this daily and commits when the feed has
actually changed.

Episode artwork is downloaded and resized into assets/episodes/ rather than
hotlinked. Three reasons: the originals are ~1400px square and would be scaled
down by the browser anyway, hotlinking makes every visitor hit a third-party CDN,
and a dead CDN would leave holes in the page.

Everything written here is the hosts' own feed content.
"""
import html
import pathlib
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from io import BytesIO

from PIL import Image

FEED = 'https://anchor.fm/s/114a97fbc/podcast/rss'
NS = {'itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd'}
START, END = '<!-- EPISODES:START -->', '<!-- EPISODES:END -->'

ART_FEATURED = 320      # rendered at 160 CSS px, so 2x for retina
ART_ROW = 128           # rendered at 64
BLURB_CHARS = 165


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'grey-duck-running-site'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def tidy_duration(raw):
    if not raw:
        return ''
    raw = raw.strip()
    if raw.isdigit():
        total = int(raw)
    else:
        total = 0
        for part in raw.split(':'):
            total = total * 60 + int(part)
    hours, rem = divmod(total, 3600)
    mins = rem // 60
    if hours:
        return f'{hours} hr {mins} min' if mins else f'{hours} hr'
    return f'{mins} min'


def blurb(desc):
    """First sentence or so of the hosts' own description, as a plain-text tease."""
    text = re.sub(r'<[^>]+>', ' ', desc or '')
    text = html.unescape(text)
    text = re.sub(r'https?://\S+', '', text)          # their link dumps are not prose
    text = re.sub(r'\s+', ' ', text).strip()
    if len(text) <= BLURB_CHARS:
        return text
    cut = text[:BLURB_CHARS]
    stop = max(cut.rfind('. '), cut.rfind('! '), cut.rfind('? '))
    return (cut[:stop + 1] if stop > 60 else cut.rsplit(' ', 1)[0] + '…').strip()


def save_art(url, dest, size):
    if dest.exists():
        return
    im = Image.open(BytesIO(fetch(url))).convert('RGB')
    im.thumbnail((size, size), Image.LANCZOS)
    im.save(dest, 'JPEG', quality=78, optimize=True, progressive=True)


def parse(xml_bytes, assets):
    channel = ET.fromstring(xml_bytes).find('channel')
    show_art = channel.find('itunes:image', NS)
    show_art = show_art.get('href') if show_art is not None else None

    art_dir = assets / 'episodes'
    art_dir.mkdir(parents=True, exist_ok=True)

    episodes = []
    for i, item in enumerate(channel.findall('item')):
        enclosure = item.find('enclosure')
        if enclosure is None or not enclosure.get('url'):
            continue
        published = item.findtext('pubDate')
        when = parsedate_to_datetime(published) if published else None
        img = item.find('itunes:image', NS)
        art_url = (img.get('href') if img is not None else None) or show_art

        slug = f'ep{len(episodes):02d}'
        art_rel = ''
        if art_url:
            size = ART_FEATURED if i == 0 else ART_ROW
            dest = art_dir / f'{slug}.jpg'
            try:
                save_art(art_url, dest, size)
                art_rel = f'assets/episodes/{dest.name}'
            except Exception as exc:                  # a missing image is not fatal
                print(f'  ! artwork for {slug} failed: {exc}')

        episodes.append({
            'title': (item.findtext('title') or 'Untitled').strip(),
            'audio': enclosure.get('url'),
            'duration': tidy_duration(item.findtext('itunes:duration', namespaces=NS)),
            'iso': when.strftime('%Y-%m-%d') if when else '',
            'label': when.strftime('%-d %b %Y') if when else '',
            'blurb': blurb(item.findtext('description')),
            'art': art_rel,
        })
    return episodes


def play_button(ep, title):
    return f'''<button class="ep-play" type="button"
                  data-audio="{html.escape(ep['audio'], quote=True)}"
                  aria-label="Play {title}">
            <svg class="ico ep-icon-play" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M8 5.5v13l11-6.5z"/></svg>
            <svg class="ico ep-icon-pause" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M7 5h3.2v14H7zM13.8 5H17v14h-3.2z"/></svg>
          </button>'''


def progress():
    return '''<div class="ep-progress" hidden>
              <div class="ep-bar"><span></span></div>
              <span class="ep-time">0:00</span>
            </div>'''


def render(episodes):
    out = []
    for i, ep in enumerate(episodes):
        title = html.escape(ep['title'])
        art = (f'<img class="ep-art" src="{ep["art"]}" width="160" height="160" alt="" loading="lazy">'
               if ep['art'] else '')
        meta = f'<time datetime="{ep["iso"]}">{html.escape(ep["label"])}</time>'
        if ep['duration']:
            meta += f' · {html.escape(ep["duration"])}'

        if i == 0:
            out.append(f'''          <li class="episode episode--featured">
            {art}
            <div class="ep-body">
              <p class="ep-tag">Latest episode</p>
              <h3 class="ep-title">{title}</h3>
              <p class="ep-meta">{meta}</p>
              <p class="ep-blurb">{html.escape(ep['blurb'])}</p>
              {play_button(ep, title)}
              {progress()}
            </div>
          </li>''')
        else:
            out.append(f'''          <li class="episode">
            {art}
            <div class="ep-body">
              <h3 class="ep-title">{title}</h3>
              <p class="ep-meta">{meta}</p>
              {progress()}
            </div>
            {play_button(ep, title)}
          </li>''')
    return '\n'.join(out)


def main():
    feed = sys.argv[1] if len(sys.argv) > 1 else FEED
    root = pathlib.Path(__file__).resolve().parent.parent
    page = root / 'index.html'

    raw = fetch(feed)

    # Mirror the feed at the site's own address. The audio enclosures still
    # point at anchor.fm, which is normal — this is a copy, not a new home.
    # Anchor stays canonical for directory submissions; submitting both to
    # Apple would create a duplicate listing of the same show.
    (root / 'feed.xml').write_bytes(raw)

    episodes = parse(raw, root / 'assets')
    if not episodes:
        raise SystemExit('feed returned no playable episodes; leaving the page alone')

    block = f'{START}\n{render(episodes)}\n          {END}'
    text = page.read_text()
    if START not in text:
        raise SystemExit(f'markers missing from index.html: {START} / {END}')
    page.write_text(re.sub(re.escape(START) + '.*?' + re.escape(END), block, text, flags=re.S))

    print(f'{len(episodes)} episodes written, feed mirrored to feed.xml')
    for ep in episodes:
        print(f'  {ep["label"]:>12}  {ep["duration"]:>10}  {ep["title"][:44]}')


if __name__ == '__main__':
    main()
