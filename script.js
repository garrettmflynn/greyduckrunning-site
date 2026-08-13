/* Grey Duck Running Podcast — minimal progressive enhancement.
   No dependencies. Everything here is optional; the page works without JS. */

(function () {
  'use strict';

  // Current year in the footer.
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Mobile nav toggle.
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('mobile-nav');

  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      if (open) {
        nav.hidden = false;
        nav.setAttribute('data-open', '');
      } else {
        nav.removeAttribute('data-open');
        nav.hidden = true;
      }
    };

    setOpen(false);

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close after tapping a link.
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setOpen(false);
    });

    // Close on Escape.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    // Reset when returning to desktop width.
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setOpen(false);
    });
  }
})();
