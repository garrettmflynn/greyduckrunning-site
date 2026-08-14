/**
 * Playback.
 *
 * Rows are triggers; the sticky bar is the only place playback state lives.
 * Enhances server-rendered markup rather than producing it — the episode list
 * is the site's primary content, so it ships in the HTML and works with
 * JavaScript off.
 */
const bar = document.querySelector('[data-playerbar]');
const audio = bar?.querySelector('audio');
const rows = Array.from(document.querySelectorAll('.episode'));

if (bar && audio && rows.length) {
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

  let current = null;

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

  const paint = () => {
    const playing = current && !audio.paused;

    for (const row of rows) {
      const on = row === current;
      row.classList.toggle('is-current', on);
      row.classList.toggle('is-playing', on && !audio.paused);
      const btn = row.querySelector('.ep-play');
      const title = btn.dataset.title;
      btn.setAttribute('aria-label', `${on && !audio.paused ? 'Pause' : 'Play'} ${title}`);
      btn.setAttribute('aria-pressed', String(Boolean(on && !audio.paused)));
    }

    els.play.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    bar.classList.toggle('is-playing', Boolean(playing));
    // Keep the bar clear of the last section rather than covering it.
    document.body.classList.toggle('has-playerbar', !bar.hidden);
  };

  const show = (row) => {
    const btn = row.querySelector('.ep-play');
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

  for (const row of rows) {
    row.querySelector('.ep-play').addEventListener('click', function () {
      if (current === row) {
        if (audio.paused) start();
        else { audio.pause(); paint(); }
        return;
      }
      current = row;
      audio.src = this.dataset.audio;
      show(row);
      start();
    });
  }

  els.play.addEventListener('click', () => {
    if (!current) return;
    if (audio.paused) start();
    else { audio.pause(); paint(); }
  });

  els.close.addEventListener('click', () => {
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    current = null;
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
    current = null;
    paint();
  });
  audio.addEventListener('error', () => {
    if (audio.src) els.now.textContent = 'unavailable';
  });
}

/**
 * Drop the bottom fade when the list already fits — a gradient hinting at more
 * content when there is none reads as a rendering fault.
 */
const scroller = document.querySelector('.episodes-scroll');
if (scroller) {
  const check = () => {
    const fits = scroller.scrollHeight <= scroller.clientHeight + 1;
    scroller.toggleAttribute('data-complete', fits);
  };
  check();
  window.addEventListener('resize', check, { passive: true });
}
