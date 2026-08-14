/**
 * The header is transparent over the hero photo and materialises on scroll.
 * The border and blur only arrive with the background — otherwise a hairline
 * floats over the image with nothing behind it.
 */
const header = document.querySelector('.site-header');

if (header) {
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}
