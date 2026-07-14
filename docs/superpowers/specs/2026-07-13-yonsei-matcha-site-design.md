# Yonsei Matcha Website — Design Spec

Date: 2026-07-13
Status: Approved, ready for implementation planning

## Summary

Turn the existing single-file HTML mockup (`yonsei-matcha-mockup_1.html`) into a
production-ready static site for Yonsei Matcha, a 4th-generation Japanese-Hawaiian
matcha popup that moves between O'ahu farmers markets. The site must let the
owner update the weekly market schedule and menu specials herself, without
touching markup, by editing two YAML data files.

## Source material

- Mockup: `/yonsei-matcha-mockup_1.html` (project root) — visual direction only,
  not final code. Inline CSS custom properties define the palette; sections are
  nav, hero, "this week's stops" (stamp cards), menu (staples + specials),
  story, Instagram follow, footer.
- Logo: user has provided a placeholder wordmark PNG (rectangular, black serif
  text "YONSEI MATCHA / KŪPUNA KUAHĀ" on white/transparent) as a stand-in for
  the real logo files. Final logo files (circular wordmark + square mark with
  ginkgo leaf and 世 kanji) are still to come from the user.

## Brand

- Name: Yonsei Matcha ("Kūpuna Kuahā")
- Palette (CSS custom properties):
  - `--ink: #181818` (black)
  - `--cream: #F7F2E7`, `--paper: #FFFDF8` (warm whites)
  - `--mint: #A8D6D6` (mint-teal accent)
  - `--teal-deep: #4F8482` (deeper teal, used for contrast on dark sections and
    as the near-monochrome accent color — replaces the mockup's rose/gold
    variables, which map to the same deep teal to stay off pink/gold per the
    brand direction)
- Fonts: Playfair Display (headings/serif), Quicksand (labels/schedule text),
  Nunito Sans (body). Self-hosted via `@fontsource` packages rather than the
  mockup's Google Fonts `@import`, for performance and to avoid an external
  render-blocking request.
- Tone: serene, a little playful, family-run — not corporate.

## Tech stack

- **Astro**, static output, no client-side JS runtime by default. Chosen over
  plain HTML/CSS/JS because the site has several repeated card patterns
  (schedule stamps, menu specials) that benefit from real components, and
  Astro still ships plain static files with no framework overhead at runtime.
- **Deployment: Vercel.** Astro's Vercel preset is auto-detected; no
  `vercel.json` needed. The user connects the GitHub repo to their own Vercel
  account — not done on their behalf.
- Data-driven content loaded from YAML files (via `js-yaml` or Astro's
  built-in YAML content collection support) at build time.

## Project structure

```
yonsei-matcha/
├── data/
│   ├── schedule.yaml       ← weekly market stops (user edits this)
│   ├── menu.yaml           ← staples + specials (user edits this)
├── src/
│   ├── assets/images/      ← logo, story photo, IG placeholders
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Hero.astro
│   │   ├── ThisWeeksStops.astro   (reads schedule.yaml)
│   │   ├── StampCard.astro
│   │   ├── Menu.astro             (reads menu.yaml)
│   │   ├── SpecialCard.astro
│   │   ├── Story.astro
│   │   ├── InstagramFollow.astro
│   │   └── Footer.astro
│   ├── layouts/BaseLayout.astro   (head, fonts, global.css, skip-link)
│   ├── styles/global.css          (CSS custom properties = palette, resets)
│   └── pages/index.astro          (assembles all sections)
├── public/                        (favicon, robots.txt only)
├── astro.config.mjs
└── package.json
```

Data files live at the project root (not under `src/`) so the owner can find
and edit them without navigating source code.

## Data schemas

### `/data/schedule.yaml`

```yaml
# This week's market stops. Add/remove entries freely — the schedule
# section on the site regenerates from this list, in the order listed.
# date format: M/D (e.g. 7/10) — shown as-is, no year needed for a weekly popup.
stops:
  - day: Friday
    date: 7/10
    location: "Ko'olau Night Market"
    time: 5–9 PM
  - day: Saturday
    date: 7/11
    location: "Mākia Market @ Salt"
    time: 10 AM–3 PM
  - day: Sunday
    date: 7/12
    location: "Lōkahi Market"
    time: 9 AM–1 PM
```

The stops list may contain any number of entries (1 or more); the
`ThisWeeksStops` component loops over it and must not assume exactly 3.

### `/data/menu.yaml`

```yaml
# section: "staple" (always on menu) or "special" (this week only)
# price: a list of variants. Most staples have one variant with no label.
#        Specials with a matcha AND hojicha version get two variants —
#        the label shows before the price, e.g. "Matcha $8.00 / Hojicha $7.50".
items:
  - section: staple
    name: Matcha Latte
    description: ""
    price:
      - label: ""
        price: 7.50

  - section: special
    name: Strawberry Matcha / Hojicha Latte
    description: Homemade strawberry puree, topped with freeze-dried strawberries.
    price:
      - label: Matcha
        price: 8.00
      - label: Hojicha
        price: 7.50
```

Rendering rule for price variants: if the list has exactly one entry with an
empty label, render as a plain `$price`. If it has 2+ entries (or a non-empty
label), render as `Label $price / Label $price`.

The milk-options note ("2%, oat, coconut, almond, soy — while supplies last")
stays as a static string in `Menu.astro`, not in the YAML, since it changes
far less often than the menu itself.

## Sections

1. **Nav** — sticky, logo (rectangular wordmark image per current asset, no
   forced circle crop) + nav links (visible ≥720px) + a pill button labeled
   "This week's stops" that scrolls to `#find-us` (in-page anchor, not an
   outbound Instagram link — confirmed with user, overriding the "Instagram
   CTA" wording in the original brief).
2. **Hero** — tagline, one-liner, CTA buttons to `#menu` and `#find-us`. Copy
   from the mockup used as placeholder until the user supplies final wording.
3. **This week's stops** — loops `schedule.yaml` into `StampCard` components
   inside the teal-deep "stops-section" block.
4. **Menu** — `menu.yaml` split by `section` into a plain staple list and
   special cards (with price-variant rendering above), plus the static
   milk-options note.
5. **Story** — 4th-generation heritage story. Placeholder copy from the
   mockup, marked with `<!-- REPLACE: her story in her own words -->` so it's
   obvious what needs real content. Story photo starts as a placeholder image
   file at a fixed path, swappable later.
6. **Instagram follow** — static 8-tile placeholder grid + outbound link to
   `@yonseimatcha` (placeholder handle, easy-to-find constant until the real
   handle is confirmed). No live Instagram feed API — out of scope: it would
   require a backend token/proxy, which contradicts the "no backend" constraint.
7. **Footer** — social/contact links, static.

## Images

- Logo: rectangular wordmark PNG (already provided as a close-match
  placeholder) rendered at a fixed height in nav/footer, no circle crop.
  Final logo files (circular wordmark + square ginkgo/世 mark) will replace
  this at the same path once available.
- Story photo and the 8 Instagram grid tiles start as placeholder image files
  (solid teal/rose-gradient blocks approximating the mockup's CSS gradient
  look) at clearly-named paths, swappable later without touching markup.
- All images loaded via Astro's `<Image>` component for automatic WebP
  conversion, responsive `srcset`, and `loading="lazy"` below the fold (hero
  logo loads eager).
- All meaningful images get real `alt` text; decorative images (IG grid
  placeholders) get `alt=""`.

## Accessibility

- Single `<h1>` in hero, sequential `<h2>`/`<h3>` per section, `<nav>` /
  `<main>` / `<footer>` landmarks, skip-to-content link.
- Custom visible `:focus-visible` outline in teal-deep (mockup has no focus
  styling; default browser outline may be hard to see on the cream
  background).
- `@media (prefers-reduced-motion: reduce)` disables `scroll-behavior: smooth`
  and the button hover-lift transform.
- Contrast check during implementation for palette text/background pairs
  (e.g. teal-deep on cream, cream on teal-deep); adjust weight/size if a pair
  fails WCAG AA for body text rather than changing the color itself.

## Performance

- No client-side JS shipped by default (Astro static output, no framework
  runtime).
- Fonts self-hosted via `@fontsource`, limited to the weights actually used.
- Images optimized/lazy-loaded per the Images section above.

## Deployment

- Vercel, connected via the user's own GitHub repo + Vercel account (not
  performed on the user's behalf). `npm run build` produces static output;
  Astro's Vercel preset auto-detects with no extra config file.

## Explicitly out of scope

- Live Instagram feed integration (no backend allowed).
- CMS or admin UI for editing schedule/menu — YAML files edited directly.
- Circular logo crop styling — deferred until the real circular logo file is
  provided.
