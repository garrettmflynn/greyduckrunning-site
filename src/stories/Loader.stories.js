import { stage } from './helpers.js';

/**
 * The opening curtain.
 *
 * The interesting part is not the visual — it is that the overlay is hidden by
 * default and shown only by `html.is-loading`, a class set by an inline script
 * that arms its own removal timer in the same breath. Inverting that (visible by
 * default, hidden by JS) would mean a failed script leaves a blank page instead
 * of a working one.
 *
 * It waits on the hero photograph being DECODED and the webfont resolving —
 * not the `load` event, which waits on every below-the-fold thumbnail and fires
 * long after the page looks finished.
 */
export default {
  title: 'Components/Loader',
  parameters: { layout: 'fullscreen' },
};

const curtain = () => `
  <div class="loader" aria-hidden="true" style="position:relative;min-height:380px">
    <div class="loader-inner">
      <div class="loader-duck">
        <img src="/assets/duck-square.svg" width="180" height="180" alt="">
      </div>
      <p class="loader-word">Grey Duck Running</p>
    </div>
  </div>`;

/** Stories render the curtain in flow, so `is-loading` is faked on a wrapper. */
const shown = (extraCss = '') => {
  const host = document.createElement('div');
  host.innerHTML = `<style>
    .sb-curtain .loader { opacity: 1; visibility: visible; transition: none; }
    ${extraCss}
  </style><div class="sb-curtain">${curtain()}</div>`;
  return host;
};

export const Curtain = {
  render: () => shown(),
};

export const Still = {
  name: 'Ring paused',
  parameters: {
    docs: {
      description: {
        story:
          'The ring is the only thing that moves. Nothing is applied to the mark ' +
          'itself: it is pixel art, and any transform sends every edge through ' +
          'the anti-aliaser — which softens a deliberately crisp logo at the one ' +
          'moment it is the only thing on screen.',
      },
    },
  },
  render: () => shown('.sb-curtain .loader-duck::before { animation-play-state: paused; }'),
};

export const ReducedMotion = {
  name: 'Reduced motion',
  parameters: {
    docs: {
      description: {
        story:
          'The ring stops but stays visible rather than disappearing — there ' +
          'should still be a sign the page is working. The wait itself is ' +
          'unchanged; motion was only ever decoration here.',
      },
    },
  },
  render: () =>
    shown(`.sb-curtain .loader-duck::before {
      animation: none;
      border-color: var(--line);
      border-top-color: var(--accent);
    }`),
};
