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
  requestAnimationFrame(() => {
    reveals.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('is-in');
        io.unobserve(el);
      }
    });
  });
}
