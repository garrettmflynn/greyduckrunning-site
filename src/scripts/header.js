/**
 * The header is transparent over the hero photo and materialises on scroll.
 * The border and blur only arrive with the background — otherwise a hairline
 * floats over the image with nothing behind it.
 *
 * Only the home page has a hero. Everywhere else the bar is solid from the
 * start, so it is marked scrolled immediately rather than fading in against a
 * background that was never there.
 */
const setup = () => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  if (!header.classList.contains('has-hero')) {
    header.classList.add('is-scrolled');
    return;
  }

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  // The header is replaced on navigation, so the listener goes on window and is
  // bound once; the handler re-reads the current header each time it fires.
  if (!header.dataset.bound) {
    header.dataset.bound = '1';
    window.addEventListener('scroll', () => {
      const h = document.querySelector('.site-header');
      if (h?.classList.contains('has-hero')) h.classList.toggle('is-scrolled', window.scrollY > 8);
    }, { passive: true });
  }
};

// astro:page-load fires on first load too, but a deferred module can register
// its listener after that has already gone out — so run once directly as well.
// Every setup here is idempotent, guarded on the elements it binds to.
setup();
document.addEventListener('astro:page-load', setup);
