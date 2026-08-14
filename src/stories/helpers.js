/**
 * Shared bits for stories.
 *
 * Stories render the site's real class names against the real stylesheet — no
 * component is re-implemented for Storybook, so documentation cannot drift from
 * what ships.
 */

/** A reference into the sprite injected by .storybook/preview.js. */
export const icon = (name, className = '') => {
  const cls = ['ico', className].filter(Boolean).join(' ');
  return `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
};

/** Wraps a story so components sit on the page background with room to breathe. */
export const stage = (html, { width = '100%', pad = '24px' } = {}) =>
  `<div style="max-width:${width};padding:${pad};font-family:var(--font)">${html}</div>`;

/** One episode row, matching EpisodeItem.astro. */
export const episodeRow = ({
  title = 'Pure Water Days 2026',
  date = '11 Aug 2026',
  duration = '1 hr 7 min',
  art = '/assets/episodes/ep00.jpg',
  latest = false,
  state = 'idle', // idle | current | playing
} = {}) => {
  const classes = [
    'episode',
    state === 'current' && 'is-current',
    state === 'playing' && 'is-current is-playing',
  ]
    .filter(Boolean)
    .join(' ');

  return `
    <li class="${classes}">
      <button class="ep-play" type="button" aria-label="Play ${title}">
        ${icon('play', 'ep-icon-play')}
        ${icon('pause', 'ep-icon-pause')}
      </button>
      ${art ? `<img class="ep-art" src="${art}" width="44" height="44" alt="">` : ''}
      <div class="ep-body">
        <h3 class="ep-title">${title}${latest ? '<span class="ep-flag">Latest</span>' : ''}</h3>
        <p class="ep-meta"><time>${date}</time>${duration ? ` · ${duration}` : ''}</p>
      </div>
    </li>`;
};
