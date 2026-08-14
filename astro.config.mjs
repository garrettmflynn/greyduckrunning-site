import { defineConfig } from 'astro/config';

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
});
