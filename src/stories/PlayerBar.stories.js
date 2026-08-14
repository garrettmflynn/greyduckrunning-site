import { icon, stage } from './helpers.js';

/**
 * The sticky playback bar — the single place playback state lives.
 *
 * It also owns the only <audio> element on the page. Sharing one element is
 * what makes "only one episode plays at a time" structural rather than a rule
 * something has to enforce.
 *
 * Stories render it in flow rather than fixed to the viewport, so it can be
 * inspected alongside other components.
 */
export default {
  title: 'Components/Player bar',
  argTypes: {
    title: { control: 'text' },
    elapsed: { control: 'text' },
    duration: { control: 'text' },
    progress: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    playing: { control: 'boolean' },
  },
};

const bar = ({
  title = 'Pure Water Days 2026',
  elapsed = '0:04',
  duration = '1:07:33',
  progress = 6,
  playing = true,
  art = '/assets/episodes/ep00.jpg',
} = {}) => `
  <div class="playerbar ${playing ? 'is-playing' : ''}" style="position:relative;border-radius:var(--radius);border:1px solid var(--line)">
    <div class="wrap playerbar-inner">
      ${art ? `<img class="pb-art" src="${art}" width="44" height="44" alt="">` : ''}
      <button class="pb-play" type="button" aria-label="${playing ? 'Pause' : 'Play'}">
        ${icon('play', 'pb-icon-play')}${icon('pause', 'pb-icon-pause')}
      </button>
      <div class="pb-body">
        <p class="pb-title">${title}</p>
        <div class="pb-progress">
          <div class="pb-bar" role="slider" tabindex="0" aria-label="Seek"
               aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}">
            <span style="width:${progress}%"></span>
          </div>
          <span class="pb-time"><span class="pb-now">${elapsed}</span> / <span class="pb-dur">${duration}</span></span>
        </div>
      </div>
      <button class="pb-close" type="button" aria-label="Stop playback">
        <svg class="ico" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6z"/>
        </svg>
      </button>
    </div>
  </div>`;

export const Playing = {
  args: { title: 'Pure Water Days 2026', elapsed: '0:04', duration: '1:07:33', progress: 6, playing: true },
  render: (args) => stage(bar(args)),
};

export const Paused = {
  args: { title: 'Vaycay Mode!!!', elapsed: '32:10', duration: '1:13:38', progress: 44, playing: false },
  render: (args) => stage(bar(args)),
};

export const DurationFormatting = {
  name: 'Duration formatting',
  parameters: {
    docs: {
      description: {
        story:
          'H:MM:SS past the hour, M:SS below it. Minutes-only produced "67:33" — ' +
          'technically correct, not how anyone reads a duration. The value is ' +
          'seeded from the feed rather than waiting on audio metadata, so it is ' +
          'right before a byte of audio loads.',
      },
    },
  },
  render: () =>
    stage(`
      <div style="display:grid;gap:14px">
        ${bar({ title: 'Over an hour — 4053s', elapsed: '0:04', duration: '1:07:33', progress: 1 })}
        ${bar({ title: 'Under an hour — 3241s', elapsed: '12:07', duration: '54:01', progress: 22 })}
      </div>`),
};

export const NoArtwork = {
  name: 'Narrow / no artwork',
  parameters: {
    docs: {
      description: {
        story:
          'Below 560px the artwork is dropped — at that width the title matters ' +
          'more than the thumbnail.',
      },
    },
  },
  render: () => stage(bar({ art: null, title: 'Fight Night Preview and Storm The Farm Recap' }), { width: '420px' }),
};
