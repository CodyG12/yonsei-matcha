# Yonsei Matcha Static Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the production-ready Astro static site for Yonsei Matcha described in `docs/superpowers/specs/2026-07-13-yonsei-matcha-site-design.md`, with the weekly schedule and menu driven entirely by `/data/schedule.yaml` and `/data/menu.yaml`.

**Architecture:** An Astro project with static output (no SSR adapter). Two YAML files at the project root hold all content that changes weekly; a small `src/lib/data.ts` module reads and parses them at build time, and page components map the results into markup. The only piece of real branching logic — how to render one vs. two-variant prices — lives in a pure function (`src/lib/pricing.ts`) covered by Vitest unit tests; everything else is static Astro markup verified by a successful build plus a manual browser check, since there's no meaningful logic to unit-test in the templates themselves.

**Tech Stack:** Astro 5 (static output), TypeScript, `js-yaml` for YAML parsing, `@fontsource` packages for self-hosted fonts, Vitest for the one unit-tested module, deployed to Vercel via the user's own GitHub connection (out of scope for this plan — see Task 14).

## Global Constraints

- No SSR adapter — `astro build` must produce fully static HTML/CSS with zero required client-side JS.
- All schedule and menu content comes from `/data/schedule.yaml` and `/data/menu.yaml` — never hardcode a market stop or menu item into a component.
- Palette is exactly: `--ink:#181818`, `--cream:#F7F2E7`, `--paper:#FFFDF8`, `--mint:#A8D6D6`, `--teal-deep:#4F8482`. No pink or gold.
- Fonts: Playfair Display (headings), Quicksand (labels), Nunito Sans (body) — self-hosted via `@fontsource`, not Google Fonts CDN.
- Every meaningful `<img>` has real `alt` text; purely decorative elements get `aria-hidden="true"`.
- `:focus-visible` must be visibly styled (mockup has no focus styling — this plan adds it).
- `@media (prefers-reduced-motion: reduce)` must disable smooth scrolling and hover-lift transforms.
- Nav's CTA pill reads "This week's stops" and scrolls to `#find-us` — it is *not* an outbound Instagram link.
- No live Instagram API integration — link out to Instagram as a static URL only.

---

### Task 1: Project scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `astro.config.mjs`
- Create: `.gitignore`
- Create: `src/pages/.gitkeep` (placeholder so the empty dir is created; removed in Task 13)

**Interfaces:**
- Produces: an installable Astro project with `npm run dev`, `npm run build`, `npm run preview`, `npm test` scripts available to every later task.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "yonsei-matcha",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "js-yaml": "^4.1.0",
    "@fontsource/playfair-display": "^5.0.0",
    "@fontsource/quicksand": "^5.0.0",
    "@fontsource/nunito-sans": "^5.0.0"
  },
  "devDependencies": {
    "@types/js-yaml": "^4.0.9",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 3: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

// output: 'static' is the default — no SSR adapter needed for this site.
export default defineConfig({});
```

- [ ] **Step 4: Create `.gitignore`**

```
node_modules/
dist/
.astro/
.vercel/
.DS_Store
```

- [ ] **Step 5: Create the source directories**

```bash
mkdir -p src/pages src/components src/layouts src/styles src/lib src/assets/images public/images data
touch src/pages/.gitkeep
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`
Expected: installs without errors, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 7: Verify Astro CLI works**

Run: `npx astro --version`
Expected: prints an Astro version string like `astro v5.x.x` with no errors.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json tsconfig.json astro.config.mjs .gitignore src/pages/.gitkeep
git commit -m "chore: scaffold Astro project"
```

---

### Task 2: Design tokens & global stylesheet

**Files:**
- Create: `src/styles/global.css`

**Interfaces:**
- Consumes: nothing.
- Produces: CSS custom properties (`--ink`, `--cream`, `--paper`, `--mint`, `--teal-deep`, `--radius-soft`) and shared utility classes (`.wrap`, `.section`, `.section-head`, `.kicker`, `.btn`, `.btn-primary`, `.btn-ghost`, `.ig-pill`, `.skip-link`) that every later component and layout task relies on.

- [ ] **Step 1: Write `src/styles/global.css`**

```css
:root {
  --ink: #181818;
  --cream: #F7F2E7;
  --paper: #FFFDF8;
  --mint: #A8D6D6;
  --teal-deep: #4F8482;
  --radius-soft: 26px;
}

*, *::before, *::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

body {
  margin: 0;
  background: var(--cream);
  color: var(--ink);
  font-family: 'Nunito Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, .display {
  font-family: 'Playfair Display', serif;
  font-weight: 600;
  margin: 0;
}

.quicksand {
  font-family: 'Quicksand', sans-serif;
}

a {
  color: inherit;
}

img {
  max-width: 100%;
  display: block;
}

.wrap {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px;
}

:focus-visible {
  outline: 3px solid var(--teal-deep);
  outline-offset: 2px;
}

.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  background: var(--ink);
  color: var(--cream);
  padding: 12px 20px;
  z-index: 100;
  border-radius: 0 0 8px 0;
  text-decoration: none;
  font-weight: 700;
}

.skip-link:focus {
  left: 0;
}

.section {
  padding: 84px 0;
}

.section-head {
  margin-bottom: 40px;
}

.kicker {
  font-family: 'Quicksand', sans-serif;
  font-size: 12.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: var(--teal-deep);
}

.section h2 {
  font-size: clamp(28px, 4vw, 42px);
  margin-top: 6px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 26px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 14px;
  text-decoration: none;
  border: 2px solid transparent;
  transition: transform .15s ease;
  font-family: 'Quicksand', sans-serif;
  cursor: pointer;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-primary {
  background: var(--ink);
  color: var(--cream);
}

.btn-ghost {
  border-color: var(--ink);
  color: var(--ink);
}

.ig-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--teal-deep);
  color: var(--cream);
  padding: 9px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  font-family: 'Quicksand', sans-serif;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add design tokens and global stylesheet"
```

---

### Task 3: Price formatting utility (TDD)

**Files:**
- Create: `src/lib/pricing.ts`
- Test: `src/lib/pricing.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `export interface PriceVariant { label: string; price: number }` and `export function formatPrice(variants: PriceVariant[]): string` from `src/lib/pricing.ts`, used by `SpecialCard.astro` (Task 9) and `Menu.astro` (Task 9).

- [ ] **Step 1: Write the failing tests**

Create `src/lib/pricing.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { formatPrice } from './pricing';

describe('formatPrice', () => {
  it('renders a single unlabeled variant as a plain dollar amount', () => {
    expect(formatPrice([{ label: '', price: 7.5 }])).toBe('$7.50');
  });

  it('joins two labeled variants with a slash', () => {
    expect(
      formatPrice([
        { label: 'Matcha', price: 8 },
        { label: 'Hojicha', price: 7.5 },
      ])
    ).toBe('Matcha $8.00 / Hojicha $7.50');
  });

  it('always shows two decimal places, even for whole dollar amounts', () => {
    expect(formatPrice([{ label: '', price: 7 }])).toBe('$7.00');
  });

  it('shows the label even for a single labeled variant', () => {
    expect(formatPrice([{ label: 'Jasmine Matcha Cloud', price: 7.5 }])).toBe(
      'Jasmine Matcha Cloud $7.50'
    );
  });

  it('throws on an empty variant list, since that means the menu data is malformed', () => {
    expect(() => formatPrice([])).toThrow(
      'formatPrice requires at least one price variant'
    );
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/pricing.test.ts`
Expected: FAIL — `Cannot find module './pricing'` (the module doesn't exist yet).

- [ ] **Step 3: Write the minimal implementation**

Create `src/lib/pricing.ts`:

```ts
export interface PriceVariant {
  label: string;
  price: number;
}

export function formatPrice(variants: PriceVariant[]): string {
  if (variants.length === 0) {
    throw new Error('formatPrice requires at least one price variant');
  }

  if (variants.length === 1 && variants[0].label === '') {
    return formatDollar(variants[0].price);
  }

  return variants
    .map((variant) => `${variant.label} ${formatDollar(variant.price)}`.trim())
    .join(' / ');
}

function formatDollar(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/lib/pricing.test.ts`
Expected: PASS — `Test Files 1 passed`, `Tests 5 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pricing.ts src/lib/pricing.test.ts
git commit -m "feat: add price formatting utility with tests"
```

---

### Task 4: Data loading module and real schedule/menu content

**Files:**
- Create: `src/lib/data.ts`
- Create: `data/schedule.yaml`
- Create: `data/menu.yaml`

**Interfaces:**
- Consumes: `js-yaml` (installed in Task 1).
- Produces: `export interface ScheduleStop { day: string; date: string; location: string; time: string }`, `export interface MenuItem { section: 'staple' | 'special'; name: string; description: string; price: { label: string; price: number }[] }`, `export function getSchedule(): ScheduleStop[]`, `export function getMenu(): MenuItem[]` from `src/lib/data.ts`, used by `ThisWeeksStops.astro` (Task 8) and `Menu.astro` (Task 9).

- [ ] **Step 1: Write `data/schedule.yaml`**

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

- [ ] **Step 2: Write `data/menu.yaml`**

```yaml
# section: "staple" (always on menu) or "special" (this week only)
# price: a list of variants. Most staples have one variant with an empty label.
#        Specials with a matcha AND hojicha version get two variants — the
#        label shows before the price, e.g. "Matcha $8.00 / Hojicha $7.50".
items:
  - section: staple
    name: Matcha Latte
    description: ""
    price:
      - label: ""
        price: 7.50

  - section: staple
    name: Hojicha Latte
    description: ""
    price:
      - label: ""
        price: 6.50

  - section: special
    name: Strawberry Matcha / Hojicha Latte
    description: Homemade strawberry puree, topped with freeze-dried strawberries.
    price:
      - label: Matcha
        price: 8.00
      - label: Hojicha
        price: 7.50

  - section: special
    name: Banana Cream Matcha / Hojicha Latte
    description: Topped with crushed Heath, Nilla wafers, and freeze-dried banana.
    price:
      - label: Matcha
        price: 8.50
      - label: Hojicha
        price: 7.00

  - section: special
    name: Kinako Snow Hojicha / Matcha Latte
    description: Toasted soybean flour "snow" over a classic latte base.
    price:
      - label: Hojicha
        price: 8.50
      - label: Matcha
        price: 7.00

  - section: special
    name: Jasmine Matcha Cloud
    description: Jasmine tea with sea salt and matcha cream.
    price:
      - label: ""
        price: 7.50
```

- [ ] **Step 3: Write `src/lib/data.ts`**

```ts
import fs from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';

export interface ScheduleStop {
  day: string;
  date: string;
  location: string;
  time: string;
}

export interface MenuItem {
  section: 'staple' | 'special';
  name: string;
  description: string;
  price: { label: string; price: number }[];
}

const dataDir = path.resolve(process.cwd(), 'data');

export function getSchedule(): ScheduleStop[] {
  const raw = fs.readFileSync(path.join(dataDir, 'schedule.yaml'), 'utf-8');
  const parsed = load(raw) as { stops: ScheduleStop[] };
  return parsed.stops;
}

export function getMenu(): MenuItem[] {
  const raw = fs.readFileSync(path.join(dataDir, 'menu.yaml'), 'utf-8');
  const parsed = load(raw) as { items: MenuItem[] };
  return parsed.items;
}
```

- [ ] **Step 4: Sanity-check the parser with a quick Node script**

Run:
```bash
node -e "
const { load } = require('js-yaml');
const fs = require('fs');
const s = load(fs.readFileSync('data/schedule.yaml', 'utf-8'));
const m = load(fs.readFileSync('data/menu.yaml', 'utf-8'));
console.log('stops:', s.stops.length, 'items:', m.items.length);
"
```
Expected: `stops: 3 items: 6`

- [ ] **Step 5: Commit**

```bash
git add src/lib/data.ts data/schedule.yaml data/menu.yaml
git commit -m "feat: add YAML data loading and initial schedule/menu content"
```

---

### Task 5: Logo placeholder asset & base layout

**Files:**
- Create: `public/images/logo-wordmark.svg`
- Create: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Consumes: `src/styles/global.css` (Task 2), `@fontsource/*` packages (Task 1).
- Produces: `public/images/logo-wordmark.svg` referenced by `Nav.astro` (Task 6) and `Footer.astro` (Task 12) as `/images/logo-wordmark.svg`; `BaseLayout.astro` with `Props { title: string; description: string }`, named slots `nav` and `footer`, and a default slot wrapped in `<main id="main">`, used by `src/pages/index.astro` (Task 13).

**Note on the logo:** you shared a pasted PNG of the real wordmark ("YONSEI MATCHA / KŪPUNA KUAHĀ" in black serif text). That image's raw bytes aren't accessible to file-system tools in this session, so this task creates a text-based SVG recreation as a placeholder. Once you have the actual PNG file, save it to `public/images/logo-wordmark.png` and change the two `<img src="/images/logo-wordmark.svg">` references (in `Nav.astro` and `Footer.astro`) to `.png` — a one-line change in each file.

- [ ] **Step 1: Write `public/images/logo-wordmark.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="440" height="120" viewBox="0 0 440 120" role="img" aria-label="Yonsei Matcha — Kūpuna Kuahā">
  <text x="220" y="52" text-anchor="middle" font-family="Georgia, 'Playfair Display', serif" font-weight="700" font-size="34" fill="#181818" letter-spacing="1">YONSEI MATCHA</text>
  <text x="220" y="86" text-anchor="middle" font-family="Georgia, 'Playfair Display', serif" font-weight="600" font-size="22" fill="#181818" letter-spacing="2">KŪPUNA KUAHĀ</text>
</svg>
```

- [ ] **Step 2: Write `src/layouts/BaseLayout.astro`**

```astro
---
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/500-italic.css';
import '@fontsource/quicksand/500.css';
import '@fontsource/quicksand/600.css';
import '@fontsource/quicksand/700.css';
import '@fontsource/nunito-sans/400.css';
import '@fontsource/nunito-sans/600.css';
import '@fontsource/nunito-sans/700.css';
import '@fontsource/nunito-sans/800.css';
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title}</title>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <slot name="nav" />
    <main id="main">
      <slot />
    </main>
    <slot name="footer" />
  </body>
</html>
```

- [ ] **Step 3: Verify the dev server boots with the layout in isolation**

Create a temporary `src/pages/index.astro` for this check only:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Yonsei Matcha" description="Temporary check page">
  <p>Layout smoke test</p>
</BaseLayout>
```

Run: `npm run dev &` then `sleep 2 && curl -s http://localhost:4321 | grep -o "Layout smoke test"`
Expected: `Layout smoke test`

Stop the dev server: `kill %1`

- [ ] **Step 4: Commit**

```bash
git add public/images/logo-wordmark.svg src/layouts/BaseLayout.astro src/pages/index.astro
git commit -m "feat: add base layout, fonts, and placeholder logo"
```

---

### Task 6: Nav component

**Files:**
- Create: `src/components/Nav.astro`

**Interfaces:**
- Consumes: `public/images/logo-wordmark.svg` (Task 5), `.ig-pill` from global.css (Task 2).
- Produces: `Nav.astro` (no props), used by `src/pages/index.astro` (Task 13) via `<Nav slot="nav" />`.

- [ ] **Step 1: Write `src/components/Nav.astro`**

```astro
---
---
<nav>
  <div class="wrap">
    <a class="logo-link" href="/" aria-label="Yonsei Matcha home">
      <img
        class="logo-img"
        src="/images/logo-wordmark.svg"
        alt="Yonsei Matcha — Kūpuna Kuahā"
        width="220"
        height="60"
      />
    </a>
    <div class="navlinks">
      <a href="#menu">Menu</a>
      <a href="#find-us">Find Us</a>
      <a href="#story">Our Story</a>
    </div>
    <a class="ig-pill" href="#find-us">📍 This week's stops</a>
  </div>
</nav>

<style>
  nav {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(247, 242, 231, 0.92);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid rgba(24, 24, 24, 0.1);
  }

  nav .wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .logo-link {
    flex: none;
  }

  .logo-img {
    height: 36px;
    width: auto;
  }

  .navlinks {
    display: none;
    gap: 28px;
    font-size: 14px;
    font-weight: 700;
  }

  .navlinks a {
    text-decoration: none;
    opacity: 0.75;
    transition: opacity 0.2s;
  }

  .navlinks a:hover {
    opacity: 1;
  }

  @media (min-width: 720px) {
    .navlinks {
      display: flex;
    }
  }
</style>
```

- [ ] **Step 2: Wire it into the temporary check page and verify**

Edit `src/pages/index.astro` (from Task 5) to:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.astro';
---
<BaseLayout title="Yonsei Matcha" description="Temporary check page">
  <Nav slot="nav" />
  <p>Layout smoke test</p>
</BaseLayout>
```

Run: `npm run dev &` then `sleep 2 && curl -s http://localhost:4321 | grep -o "This week's stops"`
Expected: `This week's stops`

Stop the dev server: `kill %1`

- [ ] **Step 3: Commit**

```bash
git add src/components/Nav.astro src/pages/index.astro
git commit -m "feat: add sticky nav component"
```

---

### Task 7: Hero component

**Files:**
- Create: `src/components/Hero.astro`

**Interfaces:**
- Consumes: `.btn`, `.btn-primary`, `.btn-ghost`, `.wrap` from global.css (Task 2).
- Produces: `Hero.astro` (no props), used by `src/pages/index.astro` (Task 13).

- [ ] **Step 1: Write `src/components/Hero.astro`**

```astro
---
---
<section class="hero">
  <div class="blob blob-1" aria-hidden="true"></div>
  <div class="blob blob-2" aria-hidden="true"></div>
  <div class="wrap">
    <div class="eyebrow">O'ahu Summer Popup · 2026</div>
    <h1>Matcha, whisked with <em>ohana</em> in mind.</h1>
    <!-- REPLACE: swap in final hero copy once approved -->
    <p class="sub">
      A fourth-generation matcha popup moving between O'ahu's markets all
      summer — ceremonial-grade tea, homemade toppings, and a menu built on
      family staples.
    </p>
    <div class="hero-cta">
      <a class="btn btn-primary" href="#find-us">Find this week's stops</a>
      <a class="btn btn-ghost" href="#menu">See the menu</a>
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    overflow: hidden;
    padding: 64px 0 96px;
  }

  .blob {
    position: absolute;
    border-radius: 44% 56% 60% 40% / 50% 45% 55% 50%;
    z-index: 0;
  }

  .blob-1 {
    width: 520px;
    height: 520px;
    background: var(--mint);
    opacity: 0.5;
    top: -170px;
    right: -150px;
  }

  .blob-2 {
    width: 250px;
    height: 250px;
    background: var(--teal-deep);
    opacity: 0.35;
    bottom: -90px;
    left: -80px;
    border-radius: 60% 40% 45% 55% / 55% 60% 40% 45%;
  }

  .hero .wrap {
    position: relative;
    z-index: 1;
  }

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'Quicksand', sans-serif;
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--teal-deep);
    background: rgba(79, 132, 130, 0.14);
    padding: 6px 14px;
    border-radius: 999px;
    margin-bottom: 20px;
  }

  .eyebrow::before {
    content: '●';
    color: var(--teal-deep);
    font-size: 10px;
  }

  .hero h1 {
    font-size: clamp(38px, 7.5vw, 70px);
    line-height: 1.04;
    max-width: 12ch;
    letter-spacing: -0.01em;
  }

  .hero h1 em {
    font-style: italic;
    color: var(--teal-deep);
  }

  .hero p.sub {
    margin-top: 20px;
    font-size: 17px;
    max-width: 44ch;
    line-height: 1.6;
    color: rgba(24, 24, 24, 0.78);
  }

  .hero-cta {
    margin-top: 32px;
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }
</style>
```

- [ ] **Step 2: Wire into the check page and verify**

Replace `src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
---
<BaseLayout title="Yonsei Matcha" description="Temporary check page">
  <Nav slot="nav" />
  <Hero />
</BaseLayout>
```

Run: `npm run dev &` then `sleep 2 && curl -s http://localhost:4321 | grep -o "Find this week's stops"`
Expected: `Find this week's stops`

Stop the dev server: `kill %1`

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.astro src/pages/index.astro
git commit -m "feat: add hero section"
```

---

### Task 8: Schedule section (StampCard + ThisWeeksStops)

**Files:**
- Create: `src/components/StampCard.astro`
- Create: `src/components/ThisWeeksStops.astro`

**Interfaces:**
- Consumes: `getSchedule(): ScheduleStop[]` from `src/lib/data.ts` (Task 4); `.section`, `.section-head`, `.kicker`, `.wrap`, `.ig-pill` from global.css (Task 2).
- Produces: `StampCard.astro` with `Props { day: string; date: string; location: string; time: string }`; `ThisWeeksStops.astro` (no props, renders `<section id="find-us">`), used by `src/pages/index.astro` (Task 13).

- [ ] **Step 1: Write `src/components/StampCard.astro`**

```astro
---
interface Props {
  day: string;
  date: string;
  location: string;
  time: string;
}

const { day, date, location, time } = Astro.props;
---
<div class="stamp-card">
  <div class="stamp-day">{day}</div>
  <div class="stamp-date">{date}</div>
  <div class="stamp-place">{location}</div>
  <div class="stamp-time">{time}</div>
</div>

<style>
  .stamp-card {
    flex: 1 1 220px;
    max-width: 260px;
    background: var(--paper);
    color: var(--ink);
    border-radius: 20px;
    border: 2.5px dashed rgba(24, 24, 24, 0.28);
    padding: 22px 20px;
    position: relative;
  }

  .stamp-day {
    font-family: 'Quicksand', sans-serif;
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--teal-deep);
  }

  .stamp-date {
    font-size: 11px;
    color: rgba(24, 24, 24, 0.55);
    margin-top: 2px;
  }

  .stamp-place {
    font-family: 'Playfair Display', serif;
    font-weight: 600;
    font-size: 20px;
    margin-top: 10px;
    line-height: 1.25;
  }

  .stamp-time {
    margin-top: 12px;
    font-family: 'Quicksand', sans-serif;
    font-weight: 700;
    font-size: 13px;
    color: var(--teal-deep);
  }
</style>
```

- [ ] **Step 2: Write `src/components/ThisWeeksStops.astro`**

```astro
---
import StampCard from './StampCard.astro';
import { getSchedule } from '../lib/data';

const stops = getSchedule();
---
<section class="section" id="find-us">
  <div class="wrap">
    <div class="stops-section">
      <div class="stops-intro">
        <div class="kicker">Where to find us</div>
        <h3>This week's stops.</h3>
        <p>
          Stops change from week to week — the schedule below is always
          current. Follow along on Instagram in case of last-minute changes.
        </p>
      </div>
      <div class="stamp-row">
        {stops.map((stop) => (
          <StampCard day={stop.day} date={stop.date} location={stop.location} time={stop.time} />
        ))}
      </div>
      <div class="stops-cta">
        <a class="ig-pill" href="https://instagram.com/yonseimatcha" target="_blank" rel="noopener">
          Follow for schedule updates →
        </a>
      </div>
    </div>
  </div>
</section>

<style>
  .stops-section {
    background: var(--teal-deep);
    color: var(--cream);
    border-radius: var(--radius-soft);
    padding: 56px 24px 60px;
    position: relative;
    overflow: hidden;
  }

  .stops-intro {
    max-width: 640px;
    margin-bottom: 40px;
  }

  .stops-intro .kicker {
    color: var(--cream);
    opacity: 0.85;
  }

  .stops-intro h3 {
    font-size: clamp(24px, 3.2vw, 32px);
    margin-top: 6px;
    color: var(--cream);
  }

  .stops-intro p {
    margin-top: 12px;
    opacity: 0.85;
    line-height: 1.6;
    font-size: 15.5px;
  }

  .stamp-row {
    display: flex;
    gap: 22px;
    flex-wrap: wrap;
  }

  .stamp-row :global(.stamp-card:nth-child(3n + 1)) {
    transform: rotate(-3deg);
  }

  .stamp-row :global(.stamp-card:nth-child(3n + 2)) {
    transform: rotate(1.5deg);
  }

  .stamp-row :global(.stamp-card:nth-child(3n + 3)) {
    transform: rotate(-1.5deg);
  }

  .stops-cta {
    margin-top: 36px;
  }

  .stops-cta :global(.ig-pill) {
    background: var(--paper);
    color: var(--teal-deep);
  }
</style>
```

Note: `https://instagram.com/yonseimatcha` is a placeholder handle — update it once you confirm the real one (also used in Tasks 11 and 12).

- [ ] **Step 3: Wire into the check page and verify data-driven rendering**

Replace `src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
import ThisWeeksStops from '../components/ThisWeeksStops.astro';
---
<BaseLayout title="Yonsei Matcha" description="Temporary check page">
  <Nav slot="nav" />
  <Hero />
  <ThisWeeksStops />
</BaseLayout>
```

Run: `npm run dev &` then `sleep 2 && curl -s http://localhost:4321 | grep -o "Ko'olau Night Market"`
Expected: `Ko'olau Night Market` — confirms the section is actually reading from `data/schedule.yaml`, not hardcoded.

Stop the dev server: `kill %1`

- [ ] **Step 4: Commit**

```bash
git add src/components/StampCard.astro src/components/ThisWeeksStops.astro src/pages/index.astro
git commit -m "feat: add data-driven weekly stops section"
```

---

### Task 9: Menu section (SpecialCard + Menu)

**Files:**
- Create: `src/components/SpecialCard.astro`
- Create: `src/components/Menu.astro`

**Interfaces:**
- Consumes: `formatPrice`, `PriceVariant` from `src/lib/pricing.ts` (Task 3); `getMenu(): MenuItem[]` from `src/lib/data.ts` (Task 4); `.section`, `.section-head`, `.kicker`, `.wrap` from global.css (Task 2).
- Produces: `SpecialCard.astro` with `Props { name: string; description: string; price: PriceVariant[] }`; `Menu.astro` (no props, renders `<section id="menu">`), used by `src/pages/index.astro` (Task 13).

- [ ] **Step 1: Write `src/components/SpecialCard.astro`**

```astro
---
import { formatPrice, type PriceVariant } from '../lib/pricing';

interface Props {
  name: string;
  description: string;
  price: PriceVariant[];
}

const { name, description, price } = Astro.props;
---
<div class="special-card">
  <div class="top-row">
    <h4>{name}</h4>
    <div class="prices">{formatPrice(price)}</div>
  </div>
  {description && <p>{description}</p>}
</div>

<style>
  .special-card {
    background: var(--paper);
    border: 1px solid rgba(24, 24, 24, 0.1);
    border-radius: 18px;
    padding: 20px 22px;
    margin-bottom: 16px;
  }

  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    flex-wrap: wrap;
  }

  .special-card h4 {
    font-family: 'Playfair Display', serif;
    font-weight: 600;
    font-size: 18px;
  }

  .special-card .prices {
    font-family: 'Quicksand', sans-serif;
    font-size: 13.5px;
    font-weight: 700;
    color: var(--teal-deep);
    text-align: right;
    white-space: nowrap;
  }

  .special-card p {
    margin-top: 8px;
    font-size: 14px;
    line-height: 1.5;
    color: rgba(24, 24, 24, 0.72);
  }
</style>
```

- [ ] **Step 2: Write `src/components/Menu.astro`**

```astro
---
import SpecialCard from './SpecialCard.astro';
import { formatPrice } from '../lib/pricing';
import { getMenu } from '../lib/data';

const items = getMenu();
const staples = items.filter((item) => item.section === 'staple');
const specials = items.filter((item) => item.section === 'special');
---
<section class="section" id="menu">
  <div class="wrap">
    <div class="section-head">
      <div class="kicker">The Menu</div>
      <h2>Staple Collection &amp; weekly specials</h2>
    </div>
    <div class="menu-cols">
      <div>
        <div class="menu-group-label">
          Staple Collection <span class="tag">Always on the menu</span>
        </div>
        <ul class="staple-list">
          {staples.map((item) => (
            <li>
              <span class="name">{item.name}</span>
              <span class="price">{formatPrice(item.price)}</span>
            </li>
          ))}
        </ul>
        <div class="milk-note">
          🥛 <span><strong>Milk options:</strong> 2%, oat, coconut, almond, soy — while supplies last.</span>
        </div>
      </div>
      <div>
        <div class="menu-group-label">
          Specials <span class="tag">Changes weekly</span>
        </div>
        {specials.map((item) => (
          <SpecialCard name={item.name} description={item.description} price={item.price} />
        ))}
      </div>
    </div>
  </div>
</section>

<style>
  .menu-cols {
    display: grid;
    grid-template-columns: 1fr;
    gap: 56px;
  }

  @media (min-width: 800px) {
    .menu-cols {
      grid-template-columns: 0.85fr 1.15fr;
    }
  }

  .menu-group-label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Playfair Display', serif;
    font-weight: 600;
    font-size: 22px;
    margin-bottom: 18px;
  }

  .menu-group-label .tag {
    font-family: 'Quicksand', sans-serif;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    background: rgba(79, 132, 130, 0.15);
    color: var(--teal-deep);
    padding: 4px 10px;
    border-radius: 999px;
  }

  .staple-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .staple-list li {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 16px 0;
    border-bottom: 1px solid rgba(24, 24, 24, 0.12);
  }

  .staple-list li:first-child {
    border-top: 1px solid rgba(24, 24, 24, 0.12);
  }

  .staple-list .name {
    font-size: 17px;
    font-weight: 700;
  }

  .staple-list .price {
    font-family: 'Playfair Display', serif;
    font-weight: 600;
    font-size: 17px;
    color: var(--teal-deep);
  }

  .milk-note {
    margin-top: 28px;
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(168, 214, 214, 0.25);
    border: 1px solid rgba(79, 132, 130, 0.35);
    border-radius: 16px;
    padding: 16px 20px;
    font-size: 14px;
  }

  .milk-note strong {
    font-family: 'Playfair Display', serif;
    font-weight: 600;
  }
</style>
```

- [ ] **Step 3: Wire into the check page and verify data-driven rendering**

Replace `src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
import ThisWeeksStops from '../components/ThisWeeksStops.astro';
import Menu from '../components/Menu.astro';
---
<BaseLayout title="Yonsei Matcha" description="Temporary check page">
  <Nav slot="nav" />
  <Hero />
  <ThisWeeksStops />
  <Menu />
</BaseLayout>
```

Run: `npm run dev &` then `sleep 2 && curl -s http://localhost:4321 | grep -o "Matcha \$8.00 / Hojicha \$7.50"`
Expected: `Matcha $8.00 / Hojicha $7.50` — confirms the two-variant price formatting renders correctly end-to-end from YAML through `formatPrice`.

Stop the dev server: `kill %1`

- [ ] **Step 4: Commit**

```bash
git add src/components/SpecialCard.astro src/components/Menu.astro src/pages/index.astro
git commit -m "feat: add data-driven menu section"
```

---

### Task 10: Story component

**Files:**
- Create: `src/components/Story.astro`

**Interfaces:**
- Consumes: `.section`, `.wrap` from global.css (Task 2).
- Produces: `Story.astro` (no props, renders `<section id="story">`), used by `src/pages/index.astro` (Task 13).

- [ ] **Step 1: Write `src/components/Story.astro`**

```astro
---
---
<section class="section" id="story">
  <div class="wrap">
    <div class="story">
      <div class="story-photo" aria-hidden="true">
        <span class="kanji">世</span>
        <span class="placeholder-label">Photo: family / matcha prep</span>
      </div>
      <div>
        <div class="eyebrow-inline">Our Story</div>
        <h2>Fourth generation, one whisk at a time.</h2>
        <div class="tagline">"Kūpuna Kuahā" — honoring the elders' altar.</div>
        <!--
          REPLACE: her story in her own words — what "Yonsei" means to her
          family, how the recipes came from her grandparents, and what she
          wants people to feel when they visit the stand.
        -->
        <p>
          [Placeholder — this is the spot for her real story: what "Yonsei"
          means to her family, how the recipes came from her grandparents,
          and what she wants people to feel when they visit the stand.]
        </p>
      </div>
    </div>
  </div>
</section>

<style>
  .story {
    display: grid;
    grid-template-columns: 1fr;
    gap: 44px;
    align-items: center;
  }

  @media (min-width: 720px) {
    .story {
      grid-template-columns: 0.9fr 1.1fr;
    }
  }

  .story-photo {
    aspect-ratio: 4 / 5;
    border-radius: var(--radius-soft);
    background: linear-gradient(160deg, var(--mint) 0%, var(--teal-deep) 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.65);
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    position: relative;
    overflow: hidden;
  }

  .story-photo .kanji {
    position: absolute;
    font-family: 'Playfair Display', serif;
    font-size: 220px;
    color: rgba(255, 255, 255, 0.08);
    font-weight: 700;
  }

  .story-photo .placeholder-label {
    position: relative;
    padding: 0 24px;
    text-align: center;
  }

  .story .eyebrow-inline {
    font-family: 'Quicksand', sans-serif;
    font-weight: 700;
    font-size: 12.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--teal-deep);
  }

  .story h2 {
    margin-top: 6px;
    font-size: clamp(26px, 3.5vw, 36px);
  }

  .story .tagline {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: 18px;
    color: var(--teal-deep);
    margin-top: 14px;
  }

  .story p {
    line-height: 1.7;
    font-size: 15.5px;
    color: rgba(24, 24, 24, 0.8);
    margin-top: 14px;
  }
</style>
```

`aria-hidden="true"` is on the photo block because it's a decorative gradient placeholder with no real content yet. When you swap in a real photo, replace the whole block with an `<Image>` from `astro:assets`, remove `aria-hidden`, and add a real `alt` description.

- [ ] **Step 2: Wire into the check page and verify**

Replace `src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
import ThisWeeksStops from '../components/ThisWeeksStops.astro';
import Menu from '../components/Menu.astro';
import Story from '../components/Story.astro';
---
<BaseLayout title="Yonsei Matcha" description="Temporary check page">
  <Nav slot="nav" />
  <Hero />
  <ThisWeeksStops />
  <Menu />
  <Story />
</BaseLayout>
```

Run: `npm run dev &` then `sleep 2 && curl -s http://localhost:4321 | grep -o "Fourth generation, one whisk at a time."`
Expected: `Fourth generation, one whisk at a time.`

Stop the dev server: `kill %1`

- [ ] **Step 3: Commit**

```bash
git add src/components/Story.astro src/pages/index.astro
git commit -m "feat: add story section"
```

---

### Task 11: Instagram follow component

**Files:**
- Create: `src/components/InstagramFollow.astro`

**Interfaces:**
- Consumes: `.section`, `.wrap`, `.kicker`, `.btn`, `.btn-primary` from global.css (Task 2).
- Produces: `InstagramFollow.astro` (no props), used by `src/pages/index.astro` (Task 13).

- [ ] **Step 1: Write `src/components/InstagramFollow.astro`**

```astro
---
const igHandle = 'yonseimatcha'; // TODO: confirm the real Instagram handle
---
<section class="section">
  <div class="wrap">
    <div class="follow">
      <div class="kicker">Stay in the loop</div>
      <h2>Follow along on Instagram</h2>
      <p>Weekly market schedules, new specials, and pop-up announcements go up there first.</p>
      <div class="ig-grid" aria-hidden="true">
        {Array.from({ length: 8 }).map(() => <div></div>)}
      </div>
      <a class="btn btn-primary" href={`https://instagram.com/${igHandle}`} target="_blank" rel="noopener">
        @{igHandle} →
      </a>
    </div>
  </div>
</section>

<style>
  .follow {
    background: var(--ink);
    color: var(--cream);
    border-radius: var(--radius-soft);
    padding: 68px 24px;
    text-align: center;
  }

  .follow .kicker {
    color: var(--mint);
  }

  .follow h2 {
    color: var(--cream);
    font-size: clamp(28px, 4vw, 40px);
    margin-top: 8px;
  }

  .follow p {
    opacity: 0.75;
    max-width: 40ch;
    margin: 14px auto 0;
    line-height: 1.6;
  }

  .ig-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    max-width: 520px;
    margin: 34px auto 0;
  }

  .ig-grid div {
    aspect-ratio: 1;
    border-radius: 14px;
    background: linear-gradient(135deg, var(--mint) 0%, var(--teal-deep) 100%);
    opacity: 0.5;
  }

  .ig-grid div:nth-child(2n) {
    opacity: 0.75;
  }

  .follow :global(.btn-primary) {
    margin-top: 30px;
    background: var(--mint);
    color: var(--ink);
  }
</style>
```

The 8 grid tiles are `aria-hidden="true"` decorative gradient placeholders (matching the mockup) — swap them for real `<Image>` thumbnails later, in which case remove `aria-hidden` from the grid and add real `alt` text per tile.

- [ ] **Step 2: Wire into the check page and verify**

Replace `src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
import ThisWeeksStops from '../components/ThisWeeksStops.astro';
import Menu from '../components/Menu.astro';
import Story from '../components/Story.astro';
import InstagramFollow from '../components/InstagramFollow.astro';
---
<BaseLayout title="Yonsei Matcha" description="Temporary check page">
  <Nav slot="nav" />
  <Hero />
  <ThisWeeksStops />
  <Menu />
  <Story />
  <InstagramFollow />
</BaseLayout>
```

Run: `npm run dev &` then `sleep 2 && curl -s http://localhost:4321 | grep -o "Follow along on Instagram"`
Expected: `Follow along on Instagram`

Stop the dev server: `kill %1`

- [ ] **Step 3: Commit**

```bash
git add src/components/InstagramFollow.astro src/pages/index.astro
git commit -m "feat: add Instagram follow section"
```

---

### Task 12: Footer component

**Files:**
- Create: `src/components/Footer.astro`

**Interfaces:**
- Consumes: `public/images/logo-wordmark.svg` (Task 5), `.wrap` from global.css (Task 2).
- Produces: `Footer.astro` (no props), used by `src/pages/index.astro` (Task 13) via `<Footer slot="footer" />`.

- [ ] **Step 1: Write `src/components/Footer.astro`**

```astro
---
const igHandle = 'yonseimatcha'; // TODO: confirm the real Instagram handle
const contactEmail = 'hello@yonseimatcha.com'; // TODO: confirm the real contact email
---
<footer>
  <div class="wrap">
    <a class="logo-link" href="/" aria-label="Yonsei Matcha home">
      <img
        class="logo-img"
        src="/images/logo-wordmark.svg"
        alt="Yonsei Matcha — Kūpuna Kuahā"
        width="220"
        height="60"
        loading="lazy"
      />
    </a>
    <p>A fourth-generation matcha popup on O'ahu. Locations vary — see Instagram for this week's stops.</p>
    <div class="foot-links">
      <a href={`https://instagram.com/${igHandle}`} target="_blank" rel="noopener">Instagram</a>
      <a href={`mailto:${contactEmail}`}>Email</a>
    </div>
  </div>
</footer>

<style>
  footer {
    padding: 56px 0 40px;
    text-align: center;
  }

  footer .logo-link {
    display: inline-flex;
    justify-content: center;
    margin-bottom: 12px;
  }

  footer .logo-img {
    height: 32px;
    width: auto;
    margin: 0 auto;
  }

  footer p {
    font-size: 13px;
    opacity: 0.6;
    margin-top: 6px;
  }

  footer .foot-links {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-top: 16px;
    font-size: 13px;
    font-weight: 700;
  }

  footer .foot-links a {
    text-decoration: none;
    opacity: 0.7;
  }
</style>
```

- [ ] **Step 2: Wire into the check page and verify**

Replace `src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
import ThisWeeksStops from '../components/ThisWeeksStops.astro';
import Menu from '../components/Menu.astro';
import Story from '../components/Story.astro';
import InstagramFollow from '../components/InstagramFollow.astro';
import Footer from '../components/Footer.astro';
---
<BaseLayout title="Yonsei Matcha" description="Temporary check page">
  <Nav slot="nav" />
  <Hero />
  <ThisWeeksStops />
  <Menu />
  <Story />
  <InstagramFollow />
  <Footer slot="footer" />
</BaseLayout>
```

Run: `npm run dev &` then `sleep 2 && curl -s http://localhost:4321 | grep -o "hello@yonseimatcha.com"`
Expected: `hello@yonseimatcha.com`

Stop the dev server: `kill %1`

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.astro src/pages/index.astro
git commit -m "feat: add footer"
```

---

### Task 13: Final page assembly and accessibility pass

**Files:**
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: every component from Tasks 5–12.
- Produces: the final `src/pages/index.astro`, the complete page.

- [ ] **Step 1: Rewrite `src/pages/index.astro` as the final assembled page**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
import ThisWeeksStops from '../components/ThisWeeksStops.astro';
import Menu from '../components/Menu.astro';
import Story from '../components/Story.astro';
import InstagramFollow from '../components/InstagramFollow.astro';
import Footer from '../components/Footer.astro';
---
<BaseLayout
  title="Yonsei Matcha — Kūpuna Kuahā"
  description="A fourth-generation matcha popup moving between O'ahu's farmers markets. See this week's stops and menu."
>
  <Nav slot="nav" />
  <Hero />
  <ThisWeeksStops />
  <Menu />
  <Story />
  <InstagramFollow />
  <Footer slot="footer" />
</BaseLayout>
```

- [ ] **Step 2: Verify heading order is sequential (accessibility check)**

Run: `npm run dev &` then:
```bash
sleep 2
curl -s http://localhost:4321 | grep -oE '<h[1-4][^>]*>' 
kill %1
```
Expected: exactly one `<h1` (in Hero), followed only by `<h2`/`<h3`/`<h4` tags in document order — no heading level is skipped from `<h1` straight to `<h4` without an intervening `<h2`/`<h3` (the `<h4>` special-card titles inside Menu follow an `<h2>` from the Menu section head, which is correct nesting).

- [ ] **Step 3: Verify the skip link and focus outline are present**

Run: `npm run dev &` then:
```bash
sleep 2
curl -s http://localhost:4321 | grep -o 'Skip to content'
curl -s http://localhost:4321/_astro/*.css 2>/dev/null | grep -o 'focus-visible' || grep -o 'focus-visible' src/styles/global.css
kill %1
```
Expected: both greps return a match (`Skip to content` in the HTML, `focus-visible` in the CSS).

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: assemble final page"
```

---

### Task 14: Build verification, README, and deployment readiness

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: the entire project from Tasks 1–13.
- Produces: nothing new for other tasks — this is the final verification and handoff task.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: `Test Files 1 passed`, `Tests 5 passed` (the `pricing.test.ts` suite from Task 3).

- [ ] **Step 2: Run a full production build**

Run: `npm run build`
Expected: exits 0, prints a summary ending in something like `1 page(s) built` and creates a `dist/` directory with `dist/index.html` and `dist/_astro/` assets.

- [ ] **Step 3: Serve the production build and verify key content end-to-end**

```bash
npm run preview &
sleep 2
curl -s http://localhost:4321 | grep -o "Yonsei Matcha"
curl -s http://localhost:4321 | grep -o "Ko'olau Night Market"
curl -s http://localhost:4321 | grep -o "Matcha \$8.00 / Hojicha \$7.50"
curl -s http://localhost:4321 | grep -o "Jasmine Matcha Cloud"
kill %1
```
Expected: all four greps return a match, confirming the built (not just dev-mode) site correctly renders nav branding, schedule data, and menu data.

- [ ] **Step 4: Manually verify in a real browser**

Run `npm run dev`, open `http://localhost:4321` in a browser, and check:
- Layout looks correct at a phone-width viewport (this is the primary use case — most visitors check the site on their phone at a market).
- Tab through the page with the keyboard; confirm the skip link appears on the first Tab press and every interactive element shows a visible teal focus ring.
- In your OS accessibility settings, enable "reduce motion," reload, and confirm smooth-scroll and button hover-lift are disabled.

This step can't be automated by this plan — it requires human eyes or a browser-automation tool. Do not skip it before considering the site done.

- [ ] **Step 5: Write `README.md`**

```markdown
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
```

- [ ] **Step 6: Commit**

```bash
git add README.md
git commit -m "docs: add README with weekly editing and deploy instructions"
```

---

## Post-plan follow-ups (not part of this plan)

- Connect the GitHub repo to Vercel (requires the user's own accounts — not something an agent should do unattended).
- Replace the placeholder logo, story photo, and Instagram grid tiles with real assets.
- Replace placeholder hero/story copy once the user supplies final wording.
- Confirm the real Instagram handle and contact email (currently `yonseimatcha` and `hello@yonseimatcha.com` placeholders in `ThisWeeksStops.astro`, `InstagramFollow.astro`, and `Footer.astro`).
