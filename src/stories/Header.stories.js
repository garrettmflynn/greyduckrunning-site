import { icon, stage } from './helpers.js';

/**
 * The header lockup: duck, wordmark, two actions, theme toggle.
 *
 * The wordmark is in the DOM from the start but collapsed until the page
 * scrolls — the hero owns the name at the top, and showing it in both places
 * reads the title twice within a couple of hundred pixels. It collapses with
 * max-width, not opacity alone: an invisible element still occupies space, and
 * the reserved width used to push the controls past the viewport edge at 320px.
 */
export default {
  title: 'Components/Header',
  argTypes: {
    scrolled: { control: 'boolean', description: 'Wordmark expands and the bar gains a surface' },
  },
};

const header = ({ scrolled = false, compact = false } = {}) => `
  <header class="site-header ${scrolled ? 'is-scrolled' : ''}" style="position:relative">
    <div class="wrap header-inner">
      <a class="brand" href="#top" aria-label="Grey Duck Running — home">
        <img class="brand-mark" src="/assets/duck-square.svg" width="180" height="180" alt="">
        <span class="brand-name">Grey Duck Running</span>
      </a>
      <div class="header-actions">
        <a class="cta" href="#" data-brand="spotify" aria-label="Subscribe on Spotify">
          ${icon('spotify')}${compact ? '' : '<span>Subscribe</span>'}
        </a>
        <a class="cta" href="#" data-brand="strava" aria-label="Join the Strava club">
          ${icon('strava')}${compact ? '' : '<span>Join the Club</span>'}
        </a>
        <button class="theme-toggle" type="button" aria-pressed="false" aria-label="Switch to dark theme">
          ${icon('moon', 'i-moon')}${icon('sun', 'i-sun')}
        </button>
      </div>
    </div>
  </header>`;

export const OverHero = {
  name: 'At rest (over the hero)',
  parameters: {
    docs: {
      description: {
        story:
          'Transparent over the photograph, with no border and no surface. The ' +
          'action outlines use --muted here rather than --line: over the hero ' +
          'image --line measures 1.00:1, an outline nobody can see, while --muted ' +
          'measures 3.31:1 and clears the 3:1 that non-text UI requires.',
      },
    },
  },
  render: () =>
    stage(
      `<div style="background:#2b2b2b center/cover url('/assets/hero-1280.jpg');border-radius:var(--radius);overflow:hidden">
         ${header()}
         <div style="height:120px"></div>
       </div>`,
      { pad: '0' }
    ),
};

export const Scrolled = {
  parameters: {
    docs: {
      description: {
        story:
          'Past the hero the bar takes a surface and a hairline, and the wordmark ' +
          'expands into the space the duck was holding alone.',
      },
    },
  },
  render: () => stage(header({ scrolled: true }), { pad: '0' }),
};

export const Compact = {
  name: 'Compact (under 620px)',
  parameters: {
    docs: {
      description: {
        story:
          'Labels are visually hidden and the glyphs carry the actions. ' +
          'aria-label keeps both announced, and targets stay at 40–44px.',
      },
    },
  },
  render: () =>
    stage(header({ scrolled: true, compact: true }), { width: '400px', pad: '0' }),
};
