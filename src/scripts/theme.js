/**
 * Theme toggle.
 *
 * Three states, not two: no stored value means "follow the system", and that is
 * the default. Clicking stores an explicit choice, and the CSS gives the
 * data-theme attribute precedence over the media query in both directions —
 * defining the dark tokens only inside the media query would make this a no-op
 * on a light-mode machine.
 *
 * Progressive enhancement over server-rendered markup rather than a component
 * that renders itself: the toggle sits in the header and must be there on first
 * paint, not after a bundle loads.
 */
const root = document.documentElement;
const toggle = document.querySelector('.theme-toggle');
const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)');

const effective = () => {
  const set = root.getAttribute('data-theme');
  if (set === 'dark' || set === 'light') return set;
  return systemDark?.matches ? 'dark' : 'light';
};

const sync = () => {
  if (!toggle) return;
  const dark = effective() === 'dark';
  toggle.setAttribute('aria-pressed', String(dark));
  toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');

  const meta = document.querySelector('meta[name="theme-color"]:not([media])')
    || document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute('content', dark ? '#0F1112' : '#FFFFFF');
};

if (toggle) {
  sync();
  toggle.addEventListener('click', () => {
    const next = effective() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch {}
    sync();
  });
}

// Follow the system only while the visitor has never chosen explicitly.
systemDark?.addEventListener?.('change', () => {
  let stored = null;
  try { stored = localStorage.getItem('theme'); } catch {}
  if (stored !== 'dark' && stored !== 'light') sync();
});
