import { defineConfig } from 'astro/config';

// output: 'static' is the default — no SSR adapter needed for this site.
// Deployed on Vercel, which serves from the domain root, so no `base`
// path is needed (every asset reference in the codebase is already
// prefixed with import.meta.env.BASE_URL, which resolves to '/' here).
// Set `site` to the final Vercel/custom domain once it's settled —
// nothing in this codebase currently depends on it.
export default defineConfig({});
