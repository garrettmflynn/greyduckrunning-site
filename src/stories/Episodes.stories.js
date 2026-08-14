import { episodeRow, stage } from './helpers.js';

/**
 * Episode rows and the card that holds them.
 *
 * Rows are compact triggers only. Playback state lives in the sticky PlayerBar —
 * six rows each carrying their own progress bar and clock meant six copies of a
 * control only one of which could ever be active, and every row had to reserve
 * height for something usually hidden.
 */
export default {
  title: 'Components/Episodes',
  argTypes: {
    title: { control: 'text' },
    date: { control: 'text' },
    duration: { control: 'text' },
    latest: { control: 'boolean' },
    state: { control: 'inline-radio', options: ['idle', 'current', 'playing'] },
  },
};

const card = (rows, { count = rows.length } = {}) => `
  <div class="player">
    <div class="player-head">
      <h2 class="player-title">Episodes <span class="player-count">${count}</span></h2>
      <a class="player-rss" href="#">RSS</a>
    </div>
    <div class="episodes-scroll" tabindex="0" role="group" aria-label="Episode list, scrollable">
      <ol class="episodes">${rows}</ol>
    </div>
  </div>`;

export const Row = {
  args: {
    title: 'Pure Water Days 2026',
    date: '11 Aug 2026',
    duration: '1 hr 7 min',
    latest: true,
    state: 'idle',
  },
  render: (args) => stage(card(episodeRow(args), { count: 1 }), { width: '520px' }),
};

export const States = {
  parameters: {
    docs: {
      description: {
        story:
          'Idle, selected, and playing. The play glyph swaps to pause via CSS on ' +
          '`.is-playing` — no second button, and no JavaScript needed to describe ' +
          'the state.',
      },
    },
  },
  render: () =>
    stage(
      card(
        [
          episodeRow({ title: 'Idle row', state: 'idle', art: '/assets/episodes/ep01.jpg' }),
          episodeRow({ title: 'Selected, paused', state: 'current', art: '/assets/episodes/ep02.jpg' }),
          episodeRow({ title: 'Playing now', state: 'playing', art: '/assets/episodes/ep03.jpg' }),
        ].join(''),
        { count: 3 }
      ),
      { width: '520px' }
    ),
};

export const LongTitles = {
  parameters: {
    docs: {
      description: {
        story:
          'Titles clamp to two lines. These run long in reality — "Free Throw ' +
          'Contest + Valentine Marathon and Badger Trail Races" — and in a narrow ' +
          'column an unclamped title wraps to four lines and the rows stop reading ' +
          'as a list.',
      },
    },
  },
  render: () =>
    stage(
      card(
        [
          episodeRow({
            title: 'Free Throw Contest + Valentine Marathon and Badger Trail Races',
            date: '5 Aug 2026',
            duration: '1 hr 2 min',
            art: '/assets/episodes/ep01.jpg',
          }),
          episodeRow({
            title: 'Ride Across Wisconsin Recap and Twin Cities Marathon News',
            date: '14 Jul 2026',
            duration: '54 min',
            art: '/assets/episodes/ep04.jpg',
          }),
        ].join(''),
        { count: 2 }
      ),
      { width: '420px' }
    ),
};

export const ScrollsAtScale = {
  name: 'Scrolls at scale',
  parameters: {
    docs: {
      description: {
        story:
          'At roughly weekly cadence this list is 50+ within a year, so it ' +
          'scrolls rather than growing — a fixed viewport keeps the card, and the ' +
          'two-column hero it sits in, the same shape at six episodes or sixty. ' +
          'The region is focusable so keyboard users can scroll it, which WCAG ' +
          '2.1.1 requires. The bottom fade removes itself when everything fits.',
      },
    },
  },
  render: () => {
    const many = Array.from({ length: 24 }, (_, i) =>
      episodeRow({
        title: `Episode ${24 - i}: a representative title of ordinary length`,
        date: '11 Aug 2026',
        duration: i % 3 === 0 ? '1 hr 7 min' : '54 min',
        art: `/assets/episodes/ep0${i % 6}.jpg`,
        latest: i === 0,
      })
    ).join('');
    return stage(card(many, { count: 24 }), { width: '520px' });
  },
};

export const WithoutArtwork = {
  name: 'Missing artwork',
  parameters: {
    docs: {
      description: {
        story:
          'Artwork is optional in the feed. The row stays aligned without it ' +
          'rather than collapsing — a missing image should not reflow the list.',
      },
    },
  },
  render: () =>
    stage(
      card(episodeRow({ title: 'An episode with no artwork', art: null }), { count: 1 }),
      { width: '520px' }
    ),
};
