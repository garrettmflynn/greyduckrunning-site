#!/usr/bin/env python3
"""Stamp styles.css and script.js with a content hash in index.html.

    python3 tools/stamp-assets.py

Why this exists: index.html linked styles.css?v=2, a number I was supposed to
bump by hand whenever the file changed. I never did, so browsers kept serving a
cached stylesheet and every CSS change afterwards was invisible — the page was
running 12,923 bytes of CSS while the file on disk was 21,948. A version that
depends on someone remembering is not a cache-busting strategy.

The hash is derived from the file, so it changes exactly when the file changes
and never otherwise. Run this after editing CSS or JS; the episode workflow runs
it too, so a scheduled rebuild cannot ship a stale reference either.
"""
import hashlib
import pathlib
import re
import sys

ASSETS = ('styles.css', 'script.js')


def main():
    root = pathlib.Path(__file__).resolve().parent.parent
    page = root / 'index.html'
    text = page.read_text()
    changed = []

    for name in ASSETS:
        path = root / name
        if not path.exists():
            print(f'  ! {name} missing, skipped')
            continue
        digest = hashlib.sha256(path.read_bytes()).hexdigest()[:10]
        # Only href/src attributes. An earlier version matched the bare
        # filename anywhere and rewrote a comment that mentioned it.
        pattern = re.compile(r'((?:href|src)=")' + re.escape(name) + r'(?:\?v=[A-Za-z0-9.]+)?(")')

        def sub(m):
            return f'{m.group(1)}{name}?v={digest}{m.group(2)}'

        new_text, n = pattern.subn(sub, text)
        if n:
            was = re.search(r'(?:href|src)="' + re.escape(name) + r'\?v=([A-Za-z0-9.]+)"', text)
            if not was or was.group(1) != digest:
                changed.append(f'{name} -> {digest}')
            text = new_text

    page.write_text(text)
    if changed:
        print('stamped: ' + ', '.join(changed))
    else:
        print('already current')


if __name__ == '__main__':
    sys.exit(main())
