/* Grey Duck Running Podcast — progressive enhancement only.
   Nothing here is required; the page is fully readable with JS disabled. */

(function () {
  'use strict';

  // Mark that JS is running. The reveal styles hang off this class, so with JS
  // off the elements are simply visible rather than stuck at opacity 0.
  document.documentElement.classList.add('js');

  // ---- theme toggle -------------------------------------------------
  // Three states, not two: no stored value means "follow the system", and that
  // is the default. Clicking stores an explicit choice; the CSS gives the
  // attribute precedence over the media query in both directions.
  var root = document.documentElement;
  var toggle = document.querySelector('.theme-toggle');
  var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

  var effective = function () {
    var set = root.getAttribute('data-theme');
    if (set === 'dark' || set === 'light') return set;
    return systemDark && systemDark.matches ? 'dark' : 'light';
  };

  var syncControl = function () {
    if (!toggle) return;
    var dark = effective() === 'dark';
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    // keep the browser chrome in step with the page
    var meta = document.querySelector('meta[name="theme-color"]:not([media])')
            || document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0F1112' : '#FFFFFF');
  };

  if (toggle) {
    syncControl();
    toggle.addEventListener('click', function () {
      var next = effective() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncControl();
    });
  }

  // Follow the system if the visitor has never chosen explicitly.
  if (systemDark && systemDark.addEventListener) {
    systemDark.addEventListener('change', function () {
      var stored = null;
      try { stored = localStorage.getItem('theme'); } catch (e) {}
      if (stored !== 'dark' && stored !== 'light') syncControl();
    });
  }

  // ---- header materialises on scroll --------------------------------
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

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
