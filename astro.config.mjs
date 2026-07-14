import { defineConfig } from 'astro/config';

// output: 'static' is the default — no SSR adapter needed for this site.
// site/base target GitHub Pages project-page hosting at
// https://codyg12.github.io/yonsei-matcha/ — update both if a custom
// domain is added later (and drop `base` entirely, since a custom
// domain serves from the root).
export default defineConfig({
  site: 'https://codyg12.github.io',
  base: '/yonsei-matcha/',
});
