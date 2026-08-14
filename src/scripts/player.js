/**
 * Episode player.
 *
 * Enhances server-rendered rows rather than producing them. The episode list is
 * the site's primary content, so it ships in the HTML for search engines and
 * for anyone with JavaScript off; this only adds playback.
 *
 * One <audio> element shared by every row: only one thing should ever be
 * playing, and sharing the element makes that structural rather than a rule to
 * enforce.
 */
const audio = document.querySelector('.player audio');
const episodes = Array.from(document.querySelectorAll('.episode'));

if (audio && episodes.length) {
  let current = null;

  const fmt = (secs) => {
    if (!Number.isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const paint = () => {
    for (const li of episodes) {
      const on = li === current;
      const btn = li.querySelector('.ep-play');
      const progress = li.querySelector('.ep-progress');
      const playing = on && !audio.paused;

      li.classList.toggle('is-current', on);
      li.classList.toggle('is-playing', playing);
      progress.hidden = !on;

      const title = li.querySelector('.ep-title').textContent.trim();
      btn.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${title}`);
      btn.setAttribute('aria-pressed', String(playing));
    }
  };

  /**
   * play() rejects for reasons outside our control — autoplay policy, a dead
   * URL, a codec the browser will not take. Unhandled, the row stays stuck
   * looking like it is playing.
   */
  const start = (li) => {
    const note = li.querySelector('.ep-time');
    note.textContent = '…';
    const p = audio.play();
    if (!p?.catch) return paint();
    p.then(paint).catch((err) => {
      current = null;
      paint();
      note.textContent = err?.name === 'NotAllowedError' ? 'tap to play' : 'unavailable';
    });
  };

  for (const li of episodes) {
    li.querySelector('.ep-play').addEventListener('click', function () {
      if (current === li) {
        if (audio.paused) start(li);
        else { audio.pause(); paint(); }
        return;
      }
      current = li;
      audio.src = this.getAttribute('data-audio');
      start(li);
    });

    li.querySelector('.ep-bar').addEventListener('click', function (e) {
      if (li !== current || !audio.duration) return;
      const r = this.getBoundingClientRect();
      audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
    });
  }

  audio.addEventListener('timeupdate', () => {
    if (!current) return;
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    current.querySelector('.ep-bar span').style.width = `${pct}%`;
    current.querySelector('.ep-time').textContent = fmt(audio.currentTime);
  });
  audio.addEventListener('play', paint);
  audio.addEventListener('pause', paint);
  audio.addEventListener('ended', () => { current = null; paint(); });
  audio.addEventListener('error', () => {
    current?.querySelector('.ep-time') && (current.querySelector('.ep-time').textContent = 'unavailable');
  });
}
