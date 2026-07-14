# Yonsei Matcha

Source for the Yonsei Matcha popup website, built with [Astro](https://astro.build).

## Updating the weekly schedule and menu

You do **not** need to touch any code to update the site week to week.

- **This week's stops:** edit `data/schedule.yaml`. Each entry is a `day`,
  `date`, `location`, and `time`. Add or remove entries freely — the site
  regenerates the schedule cards from whatever is in this file, in order.
- **Menu:** edit `data/menu.yaml`. Each item has a `section` (`staple` for
  things always on the menu, `special` for this week only), a `name`, a
  `description`, and a `price` list. Most items have one price with an empty
  `label`; items with both a matcha and hojicha version get two price
  entries with `label: Matcha` / `label: Hojicha`.

Both files have comments (lines starting with `#`) explaining the format
inline.

After editing, commit and push the change — Vercel will automatically
rebuild and redeploy the site.

## Local development

```bash
npm install
npm run dev       # starts a local dev server at http://localhost:4321
npm run build     # production build, output in dist/
npm run preview   # serve the production build locally
npm test          # run the price-formatting unit tests
```

## Deploying

This is a static Astro site with no backend. To deploy on Vercel:

1. Push this repository to GitHub.
2. In Vercel, "Add New Project" → import the GitHub repo. Vercel
   auto-detects the Astro framework preset — no configuration needed.
3. Every push to `main` triggers an automatic rebuild and redeploy.

## Swapping placeholder assets

- **Logo:** `public/images/logo-wordmark.svg` is a text-based stand-in for
  the real logo. Once you have the real file, save it as
  `public/images/logo-wordmark.png` (or `.svg`) and update the `src`
  attribute in `src/components/Nav.astro` and `src/components/Footer.astro`.
- **Story photo:** currently a CSS gradient placeholder in
  `src/components/Story.astro`. Replace the `.story-photo` block with an
  Astro `<Image>` component once a real photo is available.
- **Instagram grid:** currently 8 gradient placeholder tiles in
  `src/components/InstagramFollow.astro`. Replace with real thumbnails the
  same way.
- **Instagram handle and contact email:** currently placeholders
  (`yonseimatcha` and `hello@yonseimatcha.com`). Update the `igHandle`
  constant in `src/components/InstagramFollow.astro` and
  `src/components/Footer.astro`, and the `igHandle` constant in
  `src/components/ThisWeeksStops.astro`, once you confirm the real values.
