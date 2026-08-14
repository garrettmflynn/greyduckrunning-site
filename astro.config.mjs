import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://greyduckrunning.com',

  // Everything in public/ is copied verbatim: the logo assets the Python tools
  // generate, the mirrored feed, CNAME, and .nojekyll. Astro hashes what it
  // bundles (CSS and island JS), which is what makes the stale-stylesheet class
  // of bug impossible — no hand-maintained ?v= to forget.
  build: { assets: '_assets' },

  vite: {
    build: {
      // A one-page site: a single stylesheet beats a request per component.
      cssCodeSplit: false,
    },
  },

  // One page, so the sitemap is close to a formality — but lastmod is the field
  // crawlers actually act on, and the default output omits it. Build time is the
  // honest value here: the only things that trigger a build are a code change or
  // the twice-daily refresh finding new episodes, and both change this page.
  //
  // changefreq and priority are deliberately left off; Google has said for years
  // that it ignores them.
  integrations: [
    sitemap({
      serialize: (item) => ({ ...item, lastmod: new Date().toISOString() }),
    }),
  ],
});