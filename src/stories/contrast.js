/**
 * Contrast measurement for the token documentation.
 *
 * This exists because the first version of the contrast table printed hardcoded
 * ratios and an unconditional "PASS" — it would have kept reporting compliance
 * after a token changed, which is worse than having no table at all. Everything
 * here is derived from the running stylesheet and the actual hero JPEG.
 *
 * WCAG 2.1 relative luminance and contrast ratio, per the definitions in
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */

/** Resolve any CSS colour string to [r, g, b, a] using the browser's own parser. */
export function parseColor(css) {
  const probe = document.createElement('span');
  probe.style.display = 'none';
  probe.style.color = css;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  const nums = resolved.match(/[\d.]+/g);
  if (!nums) throw new Error(`Could not parse colour: ${css}`);
  return [Number(nums[0]), Number(nums[1]), Number(nums[2]), nums[3] === undefined ? 1 : Number(nums[3])];
}

/** Read a custom property off :root and resolve it to rgba. */
export const token = (name) =>
  parseColor(getComputedStyle(document.documentElement).getPropertyValue(name).trim());

const channel = (v) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

export const luminance = ([r, g, b]) =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

export function ratio(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/** Composite a source-over layer onto an opaque backdrop. */
const over = (fg, a, bg) => [
  fg[0] * a + bg[0] * (1 - a),
  fg[1] * a + bg[1] * (1 - a),
  fg[2] * a + bg[2] * (1 - a),
];

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });

/**
 * Worst-case contrast of `fg` anywhere over the veiled hero photograph.
 *
 * The veil is a vertical linear-gradient from --veil-top to --veil-bot painted
 * over the image, so the effective backdrop differs by row: the top of the hero
 * is barely veiled (where the header controls sit) and the bottom is nearly
 * opaque paper. Every row is composited with the veil interpolated at that row,
 * and the minimum ratio across the whole image is returned.
 *
 * Sampling the entire image is deliberately conservative — background-size:cover
 * crops it, so the real visible region is a subset of what is measured here.
 */
export async function worstOverHero(fgCss, { src = '/assets/hero-1280.jpg' } = {}) {
  const fg = parseColor(fgCss).slice(0, 3);
  const [tr, tg, tb, ta] = token('--veil-top');
  const [br, bg_, bb, ba] = token('--veil-bot');

  const img = await loadImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const cache = new Map();
  let worst = Infinity;
  let at = null;

  for (let y = 0; y < height; y++) {
    const t = height === 1 ? 0 : y / (height - 1);
    const vr = tr + (br - tr) * t;
    const vg = tg + (bg_ - tg) * t;
    const vb = tb + (bb - tb) * t;
    const va = ta + (ba - ta) * t;

    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const composited = over([vr, vg, vb], va, [data[i], data[i + 1], data[i + 2]]);
      const key = (composited[0] | 0) * 65536 + (composited[1] | 0) * 256 + (composited[2] | 0);
      let r = cache.get(key);
      if (r === undefined) {
        r = ratio(fg, composited);
        cache.set(key, r);
      }
      if (r < worst) {
        worst = r;
        at = { x, y, bg: composited.map((n) => Math.round(n)) };
      }
    }
  }

  return { ratio: worst, at };
}

/** Contrast of one token against another, both resolved live. */
export const tokenRatio = (fgName, bgName) =>
  ratio(token(fgName).slice(0, 3), token(bgName).slice(0, 3));

export const rgbToHex = ([r, g, b]) =>
  '#' + [r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0').toUpperCase()).join('');
