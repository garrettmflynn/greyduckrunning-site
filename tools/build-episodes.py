#!/usr/bin/env python3
"""Turn the podcast's RSS feed into data the site builds from.

    python3 tools/build-episodes.py

Writes src/data/episodes.json, mirrors the feed to public/feed.xml, and pulls
episode artwork into public/assets/episodes/.

It emits DATA, not markup. An earlier version spliced HTML between comment
markers in index.html, which meant the generator owned presentation and every
layout change had to be made inside Python string literals. Astro components own
the markup now; this only knows about the feed.

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
import json
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

ART_FEATURED = 320      # rendered at 160 CSS px, so 2x for retina
ART_ROW = 128           # rendered at 64
BLURB_CHARS = 165


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'grey-duck-running-site'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def duration_seconds(raw):
    """iTunes duration is HH:MM:SS, sometimes MM:SS, sometimes bare seconds."""
    if not raw:
        return 0
    raw = raw.strip()
    if raw.isdigit():
        return int(raw)
    total = 0
    for part in raw.split(':'):
        total = total * 60 + int(part)
    return total


def tidy_duration(raw):
    total = duration_seconds(raw)
    if not total:
        return ''
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


def parse(xml_bytes, public_dir):
    channel = ET.fromstring(xml_bytes).find('channel')
    show_art = channel.find('itunes:image', NS)
    show_art = show_art.get('href') if show_art is not None else None

    art_dir = public_dir / 'assets' / 'episodes'
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
                art_rel = f'/assets/episodes/{dest.name}'
            except Exception as exc:                  # a missing image is not fatal
                print(f'  ! artwork for {slug} failed: {exc}')

        episodes.append({
            'title': (item.findtext('title') or 'Untitled').strip(),
            'audio': enclosure.get('url'),
            'duration': tidy_duration(item.findtext('itunes:duration', namespaces=NS)),
            'seconds': duration_seconds(item.findtext('itunes:duration', namespaces=NS)),
            'iso': when.strftime('%Y-%m-%d') if when else '',
            'label': when.strftime('%-d %b %Y') if when else '',
            'blurb': blurb(item.findtext('description')),
            'art': art_rel,
        })
    return episodes


def main():
    feed = sys.argv[1] if len(sys.argv) > 1 else FEED
    root = pathlib.Path(__file__).resolve().parent.parent

    raw = fetch(feed)

    # Mirror the feed at the site's own address. The audio enclosures still
    # point at anchor.fm, which is normal — this is a copy, not a new home.
    # Anchor stays canonical for directory submissions; submitting both to
    # Apple would create a duplicate listing of the same show.
    (root / 'public' / 'feed.xml').write_bytes(raw)

    episodes = parse(raw, root / 'public')
    if not episodes:
        raise SystemExit('feed returned no playable episodes; refusing to write an empty list')

    out = root / 'src' / 'data' / 'episodes.json'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(episodes, indent=2, ensure_ascii=False) + '\n')

    print(f'{len(episodes)} episodes -> src/data/episodes.json, feed -> public/feed.xml')
    for ep in episodes:
        print(f'  {ep["label"]:>12}  {ep["duration"]:>10}  {ep["title"][:44]}')


if __name__ == '__main__':
    main()
