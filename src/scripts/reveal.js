/**
 * Scroll reveal.
 *
 * Elements start visible and are only hidden once this confirms it can reveal
 * them — the `js` class on <html> is what the hiding rule hangs off. With
 * JavaScript off nothing is ever stuck at opacity 0.
 */
document.documentElement.classList.add('js');

const reveals = document.querySelectorAll('.reveal');
const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

if (reduced || !('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  reveals.forEach((el) => io.observe(el));

  // Anything already on screen should not wait for a scroll event.
  const revealOnScreen = () => {
    reveals.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('is-in');
        io.unobserve(el);
      }
    });
  };

  // Hold until the curtain lifts, otherwise the entrance animation plays behind
  // it and the page is simply there when the loader fades. Falls through
  // immediately when there is no curtain.
  if (document.documentElement.classList.contains('is-loading')) {
    window.addEventListener('site:ready', () => requestAnimationFrame(revealOnScreen), {
      once: true,
    });
  } else {
    requestAnimationFrame(revealOnScreen);
  }

  // Backstops, because the hero copy and the episode list are hidden by CSS
  // until this runs — the page's primary content depends on it.
  //
  // A hidden tab suspends requestAnimationFrame entirely and defers observer
  // delivery, so a page opened in a background tab reaches neither path. It
  // resolves itself once looked at, but only if something re-checks then.
  document.addEventListener(
    'visibilitychange',
    () => {
      if (!document.hidden) revealOnScreen();
    },
    { passive: true }
  );

  // And if neither the observer nor the frame callback ever runs, bound the
  // damage to a delay rather than leaving the content invisible. Deliberately
  // only reveals what is already on screen, so scroll reveal still works below
  // the fold.
  setTimeout(revealOnScreen, 2500);
}
