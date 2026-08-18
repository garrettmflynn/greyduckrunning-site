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
const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)');
let toggle = null;

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

// The header — and with it the toggle — is fresh DOM after every navigation,
// so this re-runs rather than binding once at module load.
const setup = () => {
  toggle = document.querySelector('.theme-toggle');
  if (!toggle || toggle.dataset.bound) return sync();
  toggle.dataset.bound = '1';
  sync();
  toggle.addEventListener('click', () => {
    const next = effective() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch {}
    sync();
  });
};

// astro:page-load fires on first load too, but a deferred module can register
// its listener after that has already gone out — so run once directly as well.
// Every setup here is idempotent, guarded on the elements it binds to.
setup();
document.addEventListener('astro:page-load', setup);

/**
 * Re-apply the stored choice after a client-side navigation.
 *
 * The ClientRouter swaps the incoming document's <html> attributes onto the
 * live one, and the server never renders data-theme — it is set at runtime by
 * the inline head script. So every navigation silently dropped the attribute
 * and the site fell back to following the system.
 *
 * astro:after-swap runs before the new page paints, which is what keeps this
 * from being a visible flash of the wrong theme.
 */
document.addEventListener('astro:after-swap', () => {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') root.setAttribute('data-theme', stored);
  } catch {}
  sync();
});

// Follow the system only while the visitor has never chosen explicitly.
systemDark?.addEventListener?.('change', () => {
  let stored = null;
  try { stored = localStorage.getItem('theme'); } catch {}
  if (stored !== 'dark' && stored !== 'light') sync();
});
