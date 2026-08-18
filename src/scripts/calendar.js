/**
 * Race calendar: one month at a time, with a search that ignores the month.
 *
 * A view over server-rendered markup, not a fetch. Every month is already in
 * the HTML — this hides the ones you are not looking at. That ordering matters:
 * with JavaScript off the controls never appear and the whole calendar is
 * there in date order, which is both the honest fallback and what gets indexed.
 *
 * The controls ship hidden and are revealed here, so a failure in this file
 * leaves a working page rather than dead buttons.
 */
const setup = () => {
  const root = document.querySelector('[data-calendar]');
  if (!root || root.dataset.calReady) return;

  const controls = root.querySelector('[data-cal-controls]');
  const select = root.querySelector('[data-cal-select]');
  const search = root.querySelector('[data-cal-search]');
  const status = root.querySelector('[data-cal-status]');
  const prev = root.querySelector('[data-cal-prev]');
  const next = root.querySelector('[data-cal-next]');
  const months = Array.from(root.querySelectorAll('[data-month]'));
  if (!controls || !select || !months.length) return;

  root.dataset.calReady = '1';
  controls.hidden = false;

  const keys = months.map((m) => m.dataset.month);
  const rows = months.flatMap((m) =>
    Array.from(m.querySelectorAll('.event')).map((el) => ({
      el,
      month: m.dataset.month,
      // Title and location are what anyone would type. Lowercased once here
      // rather than on every keystroke.
      haystack: (el.textContent || '').toLowerCase().replace(/\s+/g, ' '),
    }))
  );

  const monthLabel = (key) =>
    root.querySelector(`[data-month="${key}"] .events-month-label`)?.textContent?.trim() ?? key;

  const count = (n, noun) => `${n} ${noun}${n === 1 ? '' : 's'}`;

  let current = root.dataset.defaultMonth || keys[0];
  if (!keys.includes(current)) current = keys[0];

  const showMonth = (key) => {
    current = key;
    for (const m of months) m.hidden = m.dataset.month !== key;
    for (const r of rows) r.el.hidden = false;
    select.value = key;

    const i = keys.indexOf(key);
    prev.disabled = i <= 0;
    next.disabled = i >= keys.length - 1;

    const n = months[i]?.querySelectorAll('.event').length ?? 0;
    // Announced, not shown: the select and the month heading already say
    // "August 2026" on screen, and a third copy is noise.
    status.hidden = false;
    status.dataset.mode = 'month';
    status.textContent = `${count(n, 'race')} in ${monthLabel(key)}`;
    // Deep-linkable without adding a history entry per click.
    history.replaceState(history.state, '', `#m-${key}`);
  };

  const runSearch = (query) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      prev.disabled = false;
      next.disabled = false;
      showMonth(current);
      return;
    }

    let hits = 0;
    for (const r of rows) {
      const match = r.haystack.includes(q);
      r.el.hidden = !match;
      if (match) hits++;
    }
    // A month is shown only if something in it matched, so the headings still
    // tell you when each result is.
    for (const m of months) {
      m.hidden = !Array.from(m.querySelectorAll('.event')).some((e) => !e.hidden);
    }
    prev.disabled = true;
    next.disabled = true;
    // Shown here — during a search the count is the only feedback there is.
    status.hidden = false;
    status.dataset.mode = 'search';
    status.textContent = hits
      ? `${count(hits, 'race')} matching “${query.trim()}”`
      : `No races matching “${query.trim()}”`;
  };

  const step = (delta) => {
    const i = keys.indexOf(current) + delta;
    if (i >= 0 && i < keys.length) showMonth(keys[i]);
  };

  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  select.addEventListener('change', () => {
    search.value = '';
    showMonth(select.value);
  });

  let timer;
  search.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => runSearch(search.value), 120);
  });
  search.addEventListener('search', () => runSearch(search.value));

  // A #m-YYYY-MM link should open on that month rather than scrolling into a
  // month that is about to be hidden.
  const fromHash = location.hash.match(/^#m-(\d{4}-\d{2})$/)?.[1];
  showMonth(fromHash && keys.includes(fromHash) ? fromHash : current);
};

setup();
document.addEventListener('astro:page-load', setup);
