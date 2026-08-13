/* Grey Duck Running Podcast — progressive enhancement only.
   Nothing here is required; the page is fully readable with JS disabled. */

(function () {
  'use strict';

  // Mark that JS is running. The reveal styles hang off this class, so with JS
  // off the elements are simply visible rather than stuck at opacity 0.
  document.documentElement.classList.add('js');

  // Current year in the footer.
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  var reveals = document.querySelectorAll('.reveal');

  var reduced = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Show everything at once if motion is unwanted or the browser is too old
  // for IntersectionObserver.
  if (reduced || !('IntersectionObserver' in window)) {
    for (var i = 0; i < reveals.length; i++) reveals[i].classList.add('is-in');
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);   // reveal once, then stop watching
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  reveals.forEach(function (el) { io.observe(el); });

  // Anything already on screen at load should not wait for a scroll event.
  requestAnimationFrame(function () {
    reveals.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('is-in');
        io.unobserve(el);
      }
    });
  });
})();
