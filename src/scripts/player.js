/**
 * Playback.
 *
 * Rows are triggers; the sticky bar is the only place playback state lives.
 * Enhances server-rendered markup rather than producing it — the episode list
 * is the site's primary content, so it ships in the HTML and works with
 * JavaScript off.
 *
 * Multi-page notes. The bar carries transition:persist, so the <audio> element
 * and whatever it is playing survive navigation. Two consequences shape this
 * file:
 *
 *   - The playing episode is identified by its audio URL, not by a DOM node.
 *     A row element does not exist after you navigate away from the page that
 *     rendered it, so holding a reference to one would silently lose the
 *     highlight the moment someone clicked Races mid-episode.
 *   - Row handlers rebind on every astro:page-load; bar and <audio> handlers
 *     bind once, guarded on the persisted element, or each navigation would
 *     stack another copy of every listener onto the same element.
 */

// Module scope outlives navigation under the ClientRouter, which is exactly
// where the "what is playing" answer belongs.
let currentSrc = null;

/**
 * H:MM:SS past the hour, M:SS below it. These episodes run over an hour, so
 * minutes-only produced "67:33" — technically correct, not how anyone reads a
 * duration.
 */
const fmt = (secs) => {
  if (!Number.isFinite(secs)) return '—';
  const pad = (n) => String(n).padStart(2, '0');
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

const setup = () => {
  const bar = document.querySelector('[data-playerbar]');
  const audio = bar?.querySelector('audio');
  if (!bar || !audio) return;

  const els = {
    art: bar.querySelector('.pb-art'),
    title: bar.querySelector('.pb-title'),
    play: bar.querySelector('.pb-play'),
    seek: bar.querySelector('.pb-bar'),
    fill: bar.querySelector('.pb-bar span'),
    now: bar.querySelector('.pb-now'),
    dur: bar.querySelector('.pb-dur'),
    close: bar.querySelector('.pb-close'),
  };

  const rows = () => Array.from(document.querySelectorAll('.episode'));
  const srcOf = (row) => row.querySelector('.ep-play')?.dataset.audio || '';

  const paint = () => {
    const playing = Boolean(currentSrc) && !audio.paused;

    for (const row of rows()) {
      const on = srcOf(row) === currentSrc && Boolean(currentSrc);
      row.classList.toggle('is-current', on);
      row.classList.toggle('is-playing', on && !audio.paused);
      const btn = row.querySelector('.ep-play');
      if (!btn) continue;
      const title = btn.dataset.title;
      btn.setAttribute('aria-label', `${on && !audio.paused ? 'Pause' : 'Play'} ${title}`);
      btn.setAttribute('aria-pressed', String(Boolean(on && !audio.paused)));
    }

    els.play.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    bar.classList.toggle('is-playing', playing);
    // Keep the bar clear of the last section rather than covering it.
    document.body.classList.toggle('has-playerbar', !bar.hidden);
  };

  const show = (btn) => {
    els.title.textContent = btn.dataset.title;
    // Seed the duration from the feed so it is correct before a byte of audio
    // loads; loadedmetadata refines it if the file disagrees.
    const known = Number(btn.dataset.seconds);
    els.dur.textContent = known ? fmt(known) : '—';
    if (btn.dataset.art) {
      els.art.src = btn.dataset.art;
      els.art.hidden = false;
    } else {
      els.art.hidden = true;
    }
    bar.hidden = false;
  };

  /**
   * play() rejects for reasons outside our control — autoplay policy, a dead
   * URL, a codec the browser refuses. Unhandled, the UI freezes mid-state.
   */
  const start = () => {
    const p = audio.play();
    if (!p?.catch) return paint();
    p.then(paint).catch((err) => {
      els.now.textContent = err?.name === 'NotAllowedError' ? 'tap play' : 'unavailable';
      paint();
    });
  };

  const toggle = () => {
    if (audio.paused) start();
    else { audio.pause(); paint(); }
  };

  // Rebound every navigation: these rows are new DOM. The flag matters because
  // setup runs twice on first load (see the bottom of this file).
  for (const row of rows()) {
    const btn = row.querySelector('.ep-play');
    if (!btn || btn.dataset.bound) continue;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      if (currentSrc === btn.dataset.audio) return toggle();
      currentSrc = btn.dataset.audio;
      audio.src = currentSrc;
      show(btn);
      start();
    });
  }

  // Bound once. The bar persists across navigation, so without this guard each
  // page visit would add another listener to the same button.
  if (!bar.dataset.bound) {
    bar.dataset.bound = '1';

    els.play.addEventListener('click', () => {
      if (currentSrc) toggle();
    });

    els.close.addEventListener('click', () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      currentSrc = null;
      bar.hidden = true;
      paint();
    });

    const seekTo = (ratio) => {
      if (!audio.duration) return;
      audio.currentTime = Math.max(0, Math.min(1, ratio)) * audio.duration;
    };

    els.seek.addEventListener('click', function (e) {
      const r = this.getBoundingClientRect();
      seekTo((e.clientX - r.left) / r.width);
    });

    // Keyboard seeking, since the bar is exposed as a slider.
    els.seek.addEventListener('keydown', (e) => {
      if (!audio.duration) return;
      const step = e.shiftKey ? 60 : 15;
      if (e.key === 'ArrowRight') { audio.currentTime += step; e.preventDefault(); }
      if (e.key === 'ArrowLeft') { audio.currentTime -= step; e.preventDefault(); }
      if (e.key === 'Home') { audio.currentTime = 0; e.preventDefault(); }
    });

    audio.addEventListener('loadedmetadata', () => {
      els.dur.textContent = fmt(audio.duration);
    });
    audio.addEventListener('timeupdate', () => {
      const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      els.fill.style.width = `${pct}%`;
      els.now.textContent = fmt(audio.currentTime);
      els.seek.setAttribute('aria-valuenow', String(Math.round(pct)));
    });
    audio.addEventListener('play', paint);
    audio.addEventListener('pause', paint);
    audio.addEventListener('ended', () => {
      currentSrc = null;
      paint();
    });
    audio.addEventListener('error', () => {
      if (audio.src) els.now.textContent = 'unavailable';
    });
  }

  // Re-mark the row for whatever is already playing on the page just entered.
  paint();

  /**
   * Drop the bottom fade when the list already fits — a gradient hinting at
   * more content when there is none reads as a rendering fault.
   */
  const scroller = document.querySelector('.episodes-scroll');
  if (scroller && !scroller.dataset.watched) {
    scroller.dataset.watched = '1';
    const check = () => {
      scroller.toggleAttribute('data-complete', scroller.scrollHeight <= scroller.clientHeight + 1);
    };
    check();
    window.addEventListener('resize', check, { passive: true });
  }
};

// astro:page-load fires on first load too, but a deferred module can register
// its listener after that has already gone out — so run once directly as well.
// Every setup here is idempotent, guarded on the elements it binds to.
setup();
document.addEventListener('astro:page-load', setup);
