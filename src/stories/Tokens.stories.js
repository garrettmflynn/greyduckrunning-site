import { tokenRatio, worstOverHero, rgbToHex } from './contrast.js';

/**
 * The design language itself.
 *
 * Every swatch reads its value from the live custom property rather than a
 * hardcoded hex, so this page cannot drift from src/styles/tokens.css. Change a
 * token and the documentation changes with it.
 */
export default {
  title: 'Design system/Tokens',
  parameters: {
    docs: {
      description: {
        component:
          'Colour, type and elevation tokens. Values are read from the running ' +
          'stylesheet, so this is a mirror of tokens.css rather than a copy of it.',
      },
    },
  },
};

const read = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const grid = (children) => `
  <div style="display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));
              font-family:var(--font)">${children}</div>`;

const swatch = (name, note) => {
  const value = read(name);
  return `
    <div style="border:1px solid var(--line);border-radius:var(--radius-sm);overflow:hidden">
      <div style="height:64px;background:var(${name})"></div>
      <div style="padding:10px 12px">
        <div style="font-size:13px;font-weight:620;color:var(--ink)">${name}</div>
        <div style="font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums">${value || '—'}</div>
        ${note ? `<div style="font-size:11.5px;color:var(--faint);margin-top:4px">${note}</div>` : ''}
      </div>
    </div>`;
};

export const Colour = {
  render: () =>
    grid(
      [
        swatch('--paper', 'page background'),
        swatch('--raised', 'cards, the header once scrolled'),
        swatch('--ink', 'headings and body'),
        swatch('--muted', 'secondary text, control borders'),
        swatch('--faint', 'labels and meta'),
        swatch('--line', 'hairlines and dividers'),
        swatch('--accent', 'the logo orange, darkened to clear 4.5:1 on white'),
        swatch('--accent-soft', 'tint'),
      ].join('')
    ),
};

export const Contrast = {
  name: 'Contrast (WCAG AA)',
  parameters: {
    docs: {
      description: {
        story:
          'Every ratio here is computed at render time — token pairs from the ' +
          'live custom properties, and the photo rows by compositing the veil ' +
          'gradient over the actual hero JPEG and taking the **worst pixel in ' +
          'the image**, not an average. Switch the theme toolbar and the numbers ' +
          'change, because dark mode is a different set of tokens and a different ' +
          'veil. A FAIL row means the site fails, not that the table is stale.',
      },
    },
  },
  render: () => {
    const host = document.createElement('div');
    host.style.fontFamily = 'var(--font)';
    host.innerHTML = `<p style="color:var(--muted);font-size:14px">Measuring against the hero image…</p>`;

    // Rows are declared as intent — what must hold — and the verdict is derived.
    // 1.4.3 wants 4.5:1 for body text; 1.4.11 wants 3:1 for meaningful non-text UI.
    const tokenRows = [
      ['Body text on page', '--ink', '--paper', 4.5],
      ['Secondary text', '--muted', '--paper', 4.5],
      ['Meta / labels', '--faint', '--paper', 4.5],
      ['Accent as text', '--accent', '--paper', 4.5],
      ['Hairline on page', '--line', '--paper', 1.0],
    ];
    const photoRows = [
      ['Hero copy over the photo', '--ink', 4.5],
      ['Control borders over the photo', '--muted', 3.0],
      ['Accent as text over the photo', '--accent', 4.5],
    ];

    const cell = (s, extra = '') => `<td style="padding:10px 12px;${extra}">${s}</td>`;

    const renderRow = ([label, detail, value, need]) => {
      const ok = value >= need;
      return `
        <tr style="border-top:1px solid var(--line)">
          <td style="padding:10px 12px 10px 0">${label}<div style="font-size:11.5px;color:var(--faint)">${detail}</div></td>
          ${cell(value.toFixed(2), 'font-variant-numeric:tabular-nums;font-weight:620')}
          ${cell(need === 1 ? '—' : need.toFixed(1), 'color:var(--muted)')}
          ${cell(
            ok ? 'PASS' : 'FAIL',
            `font-weight:700;color:${ok ? '#1B7F4B' : '#C0261B'}`
          )}
        </tr>`;
    };

    (async () => {
      const rows = [];

      for (const [label, fg, bg, need] of tokenRows) {
        rows.push([label, `${fg} on ${bg}`, tokenRatio(fg, bg), need]);
      }

      for (const [label, fg, need] of photoRows) {
        const value = getComputedStyle(document.documentElement).getPropertyValue(fg).trim();
        const { ratio: r, at } = await worstOverHero(value);
        rows.push([label, `${fg} · worst pixel ${at.x},${at.y} = ${rgbToHex(at.bg)}`, r, need]);
      }

      const failures = rows.filter(([, , v, n]) => v < n);

      host.innerHTML = `
        <table style="border-collapse:collapse;font-size:14px;width:100%;max-width:680px">
          <thead>
            <tr style="text-align:left;color:var(--faint);font-size:12px;text-transform:uppercase;letter-spacing:.06em">
              <th style="padding:8px 12px 8px 0">Pairing</th><th style="padding:8px 12px">Ratio</th>
              <th style="padding:8px 12px">Needs</th><th style="padding:8px 12px">Result</th>
            </tr>
          </thead>
          <tbody style="color:var(--ink)">${rows.map(renderRow).join('')}</tbody>
        </table>
        <p style="font-size:13px;color:var(--muted);max-width:62ch;margin-top:18px">
          The accent fails as text over the photograph and is expected to — a
          mid-tone hue cannot clear 4.5:1 against an image containing both white
          shoes and black shorts at any veil opacity that still shows the image.
          It is listed so the constraint stays visible; emphasis in the hero is
          carried by weight instead. The hairline row has no threshold: a divider
          is decorative, and 1.4.11 does not apply to it.
        </p>
        <p style="font-size:13px;color:var(--muted);max-width:62ch;margin-top:10px">
          ${failures.length} of ${rows.length} rows below threshold.
        </p>`;
    })().catch((err) => {
      host.innerHTML = `<p style="color:#C0261B;font-size:14px">Measurement failed: ${err.message}</p>`;
    });

    return host;
  },
};

export const Typography = {
  render: () => `
    <div style="font-family:var(--font);color:var(--ink);display:grid;gap:22px;max-width:720px">
      <div>
        <div style="font-size:11.5px;color:var(--faint);letter-spacing:.06em;text-transform:uppercase">h1 · clamp(40px, 6.2vw, 68px) · 700</div>
        <div style="font-size:clamp(40px,6.2vw,68px);font-weight:700;letter-spacing:-.035em;line-height:1.03">Grey Duck Running</div>
      </div>
      <div>
        <div style="font-size:11.5px;color:var(--faint);letter-spacing:.06em;text-transform:uppercase">h2 · clamp(27px, 3.4vw, 36px) · 680</div>
        <div style="font-size:clamp(27px,3.4vw,36px);font-weight:680;letter-spacing:-.028em">About the Show</div>
      </div>
      <div>
        <div style="font-size:11.5px;color:var(--faint);letter-spacing:.06em;text-transform:uppercase">body · 17px · 400</div>
        <p style="margin:0;font-size:17px;line-height:1.65;color:var(--muted);max-width:56ch">
          Comfortable reading is 45–75 characters per line. Body copy is capped
          in <code>ch</code> so the measure tracks the font rather than a guessed
          pixel value — note 1ch is the width of the zero glyph, not of an
          average character, so it runs about 1.22× wider than it reads.
        </p>
      </div>
      <div>
        <div style="font-size:11.5px;color:var(--faint);letter-spacing:.06em;text-transform:uppercase">wordmark · 12.5px · 650 · .14em</div>
        <div style="font-size:12.5px;font-weight:650;letter-spacing:.14em;text-transform:uppercase">Grey Duck Running</div>
      </div>
    </div>`,
};

export const Elevation = {
  render: () => `
    <div style="display:flex;gap:24px;flex-wrap:wrap;font-family:var(--font)">
      ${[
        ['--radius', '--shadow', 'cards'],
        ['--radius-sm', '--shadow-lg', 'raised surfaces'],
      ]
        .map(
          ([radius, shadow, label]) => `
        <div style="width:220px;height:130px;background:var(--raised);border:1px solid var(--line);
                    border-radius:var(${radius});box-shadow:var(${shadow});
                    display:flex;align-items:end;padding:14px;color:var(--muted);font-size:12.5px">
          ${label}<br>${radius} · ${shadow}
        </div>`
        )
        .join('')}
    </div>`,
};
