/**
 * Lifts the loading curtain once the things you can actually see are ready.
 *
 * Deliberately NOT the `load` event: that waits for every image on the page,
 * including the six episode thumbnails below the fold and anything a browser
 * decides to speculatively fetch. It fires long after the page looks finished.
 *
 * What it waits for instead:
 *   - the hero photograph DECODED, not merely downloaded. With decoding="async"
 *     the img reports complete() and fires load() before its pixels are ready to
 *     paint, which is exactly the gap that shows a dark rectangle where the
 *     photo should be.
 *   - the webfont resolved, so the wordmark does not reflow behind the curtain.
 *
 * And it is bounded at both ends: a floor so a cached load does not strobe, and
 * a ceiling so a stalled font CDN cannot hold the site hostage.
 */
const root = document.documentElement;

// A cached load is ready in well under 100ms, so without a floor the curtain
// would be a flicker. This is long enough to read as a deliberate opening beat
// and see the duck, and short enough not to feel like an obstacle.
const MIN_MS = 1250;
const MAX_MS = 3000; // hard ceiling; the inline failsafe backs this up again

const started = performance.now();
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Resolves when the hero's pixels are ready to paint — or when it is clear they never will be. */
const heroPainted = () => {
  const img = document.querySelector('.hero-bg img');
  if (!img) return Promise.resolve();

  // decode() is the only signal that accounts for async decoding. A broken or
  // unsupported image rejects; that is still "done" for our purposes.
  if (typeof img.decode === 'function') return img.decode().catch(() => {});

  if (img.complete) return Promise.resolve();
  return new Promise((resolve) => {
    img.addEventListener('load', resolve, { once: true });
    img.addEventListener('error', resolve, { once: true });
  });
};

const fontsReady = () =>
  document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve();

const lift = () => {
  if (!root.classList.contains('is-loading')) return;
  root.classList.remove('is-loading');
  // Tells reveal.js it may begin, so the entrance animation is not spent behind
  // the curtain where nobody sees it.
  window.dispatchEvent(new Event('site:ready'));
};

Promise.race([Promise.all([heroPainted(), fontsReady()]), wait(MAX_MS)])
  .then(() => wait(Math.max(0, MIN_MS - (performance.now() - started))))
  .then(lift)
  .catch(lift);
