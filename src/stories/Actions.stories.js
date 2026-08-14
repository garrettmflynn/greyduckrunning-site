import { icon, stage } from './helpers.js';

/**
 * The two header actions and the footer's icon-only links.
 *
 * Outlined rather than filled, deliberately: two solid brand-coloured slabs in
 * a 73px bar shout over the hero photograph and compete with each other. The
 * border uses --muted, which measures 3.31:1 over that photo and so clears the
 * 3:1 that non-text UI needs — --line was 1.00:1 there, an outline nobody could
 * see. Brand colour arrives on hover, where it is a bonus rather than the only
 * cue.
 */
export default {
  title: 'Design system/Actions',
  argTypes: {
    brand: { control: 'inline-radio', options: ['spotify', 'strava'] },
    label: { control: 'text' },
  },
};

const cta = ({ brand = 'spotify', label = 'Subscribe' } = {}) => `
  <a class="cta" href="#" data-brand="${brand}" aria-label="${label}">
    ${icon(brand)}<span>${label}</span>
  </a>`;

export const Button = {
  args: { brand: 'spotify', label: 'Subscribe' },
  render: (args) => stage(cta(args)),
};

export const BothActions = {
  name: 'Header pair',
  render: () =>
    stage(`
      <div style="display:flex;gap:6px;align-items:center">
        ${cta({ brand: 'spotify', label: 'Subscribe' })}
        ${cta({ brand: 'strava', label: 'Join the Club' })}
      </div>`),
};

export const CollapsedToGlyphs = {
  name: 'Collapsed (under 620px)',
  parameters: {
    docs: {
      description: {
        story:
          'Two labelled actions plus the theme toggle will not fit a phone bar, ' +
          'so the labels are visually hidden and the glyphs remain. aria-label ' +
          'keeps each one announced.',
      },
    },
  },
  render: () =>
    stage(`
      <div style="display:flex;gap:6px;align-items:center">
        <a class="cta" href="#" data-brand="spotify" aria-label="Subscribe on Spotify"
           style="padding:0;width:40px;justify-content:center">${icon('spotify')}</a>
        <a class="cta" href="#" data-brand="strava" aria-label="Join the Strava club"
           style="padding:0;width:40px;justify-content:center">${icon('strava')}</a>
      </div>`),
};

export const IconLinks = {
  name: 'Footer icon links',
  parameters: {
    docs: {
      description: {
        story:
          'Glyphs take the text colour rather than each brand\'s own — Spotify ' +
          'green on white is 2.28:1, under the 3:1 that meaningful non-text UI ' +
          'needs. Brand colour returns on hover. Targets are 44px.',
      },
    },
  },
  render: () =>
    stage(`
      <nav style="display:flex;gap:2px" aria-label="Elsewhere">
        <a class="icon-btn" href="#" aria-label="Listen on Spotify">${icon('spotify')}</a>
        <a class="icon-btn" href="#" aria-label="Instagram">${icon('instagram')}</a>
        <a class="icon-btn" href="#" aria-label="Join the Strava club">${icon('strava')}</a>
      </nav>`),
};

export const ThemeToggle = {
  parameters: {
    docs: {
      description: {
        story:
          'Shows the icon for the theme you would switch TO. The border is ' +
          'transparent while the header sits over the hero photo, where a --line ' +
          'border measured 1.00:1 — an outline nobody can see.',
      },
    },
  },
  render: () =>
    stage(`
      <button class="theme-toggle" type="button" aria-pressed="false" aria-label="Switch to dark theme">
        ${icon('moon', 'i-moon')}${icon('sun', 'i-sun')}
      </button>`),
};
