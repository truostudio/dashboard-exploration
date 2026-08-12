# Uniblock landing page: handoff

Context for whoever picks this up next. Written 2026-07-30.

---

## 0. Read these before touching anything

1. **`~/.claude/skills/truo-design/references/anti-slop-law.md`** (1,599 lines). The
   design law. It requires you to (a) say plainly that you've read all of it before
   starting, (b) decide the *signature* before writing code, (c) re-check every point
   before shipping. **Rob's explicit direction always overrides it.**
2. **`public/component-library-handoff.md`**, the token/component spec for the
   dashboard. Its colour tables and icon catalogue are **stale** (see §2).

Most of the pain in this project came from working without these.

---

## 1. What this is

A ground-up redesign of the Uniblock marketing site, built **locally in this repo**,
served at `/landing-page-home`. Not Framer. Vite + React + CSS (no Tailwind).

- Dev: `npm run dev` → http://localhost:5173/landing-page-home
- Route logic: `src/Root.tsx` (`/landing-page-<slug>`, `home` is default)
- Everything landing-specific lives in `src/landing/`
- The dashboard (`src/views/`, `src/components/`) shares the token system via
  `src/index.css`

---

## 2. Design system: locked decisions

These were each arrived at through rejected attempts. Don't relitigate.

| Decision | Detail |
|---|---|
| **Surfaces** | Achromatic graphite, **never blue-derived**. One point of green over red/blue per step (phosphor cast). Canvas `#0D0E0D` dark / `#F3F4F3` light. Rob rejected both the original blue-black *and* a warm-graphite alternative; he wants a terminal register. |
| **Type** | Geist / Geist Mono / Geist Pixel. **Settled, do not change.** This deliberately overrides the law's "signature face can't be a shelf font". |
| **Icons** | Phosphor only (`@phosphor-icons/react`). `src/components/Icons.tsx` is an alias table mapping this app's vocabulary (`Icon.Tx`, `Icon.Defi`) onto Phosphor. Never draw a new `<svg>`, budget constraint, not taste. |
| **Blue** | Means exactly one thing: **the Uniblock path**. The provider that won, the single invoice, the live tail, the 10-minute figure. Nothing goes blue for its turn. A previous focus-cycle that lit blocks on a timer was rejected as "things randomly turn blue for no reason". |
| **Corner ticks** | The 4-corner blue registration marks stay. I removed them once on a hunch; Rob said they weren't the problem. |
| **No mock OS chrome** | No title bars, traffic-light dots, index badges, blinking window carets. Rejected outright: "I know I said terminal-esque but not like a literal OS-native window." |

### The grid

- **The unit is a 1:1 square**, not a column. `--lp-row` = inner width ÷ 12, so rows
  are as tall as columns are wide. Shapes come from *arranging* units.
- `.lp-blocks` is the block field. Children set `--w` (and historically `--h`).
- **Heights are content-driven now.** Fixed unit heights produced huge empty boxes;
  rows take the height of their tallest block.
- **Never put `column-gap` on a subgrid**, it resizes the tracks and walks every
  block off the page's column lines. This was the single biggest "nothing is aligned"
  bug. Correct recipe in `.lp-blocks`: `column-gap: 0`, `row-gap: var(--lp-seam)`,
  container bleeds `margin-inline: calc(var(--lp-seam) / -2)`, each child insets
  `margin-inline: calc(var(--lp-seam) / 2)`.
- **One inset everywhere:** `--lp-inset` (= `--lp-pad`, 24px). Because they're equal,
  text inside a bordered block starts on the same vertical as prose in a flat block.
  The "everything seems like one-offs" complaint was graphics using `s-3`…`s-9` at
  random.
- Grid rules are scoped to `@media (min-width: 1001px)`; below that everything stacks.

### The component: the instrument panel

`src/landing/graphics/Window.tsx` → `<Win>`. Two weights only:

- `panel`, border + **figure caption** (sentence-case `title` + one-line `caption`)
  + a mono `label`/`meta` footnote row.
- `flat`, prose. No border, no chrome.

Rob's benchmark: *"keep the terminal component feel from these graphics"*, the
provider mesh and the live log tail. Those two are the reference for everything else.
A graphic with no caption reads as "naked"; a caption is required.

### Dither

Part of the visual identity. Two implementations:

1. **CSS**, `.dither` utility. Three dot fields at 4×/2×/1× the cell, **each on its
   own layer** with its own mask reach. Mask layers on one element composite into a
   single mask, so stacking them as background layers gives one flat texture, the
   density steps only exist if the fields are separate boxes. `--dither-to` sets
   direction. Used on the section divider and the footer seam.
2. **WebGL**, the 3D scene renders off-screen and resolves through an 8×8 Bayer
   threshold (`RequestStream.tsx`). Every dot is lit or absent, never grey.

Rejected: tiny pixel-art glyphs, and a strip of scattered blue blocks. Rob wants
dither as a *field*, at scale.

---

## 3. The signature artifact

`src/landing/scene/RequestStream.tsx`, a fixed WebGL layer, scroll-driven.

**It depicts the product literally.** One entry point on the left = the unified
endpoint. Lanes on the right = providers. Requests leave the endpoint, curve into
whichever lane won the score, and run out. ~14/sec (the tail's rate); ~45% to the
currently-favoured lane; ~1 in 9 forks into a second lane and the loser fades =
hedging. Blue is only ever the call that won.

An earlier version, a radial fan from a core to a sphere shell, was rejected:
*"makes no sense, no correlation to what Uniblock does."* It was an abstract particle
cloud that could sit behind any product.

**Presence is a curve, not a fade:** full on the first screen → a trace through the
body (content must stay readable) → back up for the closing band, where the camera
closes on the entry point so many routes converge back into one.

Gotchas:
- Packets are **line segments**, not `THREE.Points`. `gl_PointSize` at this camera
  distance rendered them ~2 CSS px, invisible. Trails also give direction.
- Lanes are 2 barely-splayed strands. Five strands + dither = fuzz.
- The shader holds the left of the frame clear (`smoothstep(0.30, 0.62, vUv.x)`)
  because all page type is set against that edge.

---

## 4. Section inventory

| # | Section | State |
|---|---|---|
|, | Hero | **Rebuilt.** Artifact owns the frame, type on the floor, one action + a differentiated link, one sentence. Typed curl line cycles real endpoints. |
|, | Nav | **Rebuilt.** Contained in the measure, bordered like a panel. Mono two-state theme toggle (not sun/moon, a named slop tell). |
| 01 | Integration | Instrument: time-to-integrate bars. |
| 02 | Infra | Instrument: 90-day uptime strip (replaced a ring gauge, an ornament stating one number). |
|, | Trusted | Customer wall, 6 × 2×2 blocks = 12 exact. |
| 03 | Overview | **The strongest section. Rob's benchmark.** 4 claim/demo pairs + full-width live tail last. |
| 04 | Full stack | 3 rows, 3 different unit arrangements (5+7, 7+5 flipped, 4+8). |
| 05 | Coverage | Chain lattice (replaced marquees, decoration that can't be read). |
| 06 | Customer story | ⚠️ Still a testimonial quote card, a named slop tell. |
| 07 | Pricing | **Rebuilt** as one comparison table. Four cards with checkmark lists was the named three-tier block, and its columns went ragged. |
| 08 | Blog | ⚠️ **Empty placeholder.** "Article image" empty states. Weakest thing on the page; probably shouldn't exist. |
| 09 | FAQ | ⚠️ Still an accordion. Rows are full-bleed (hover touches L/R, only text inset). |
|, | Footer | **Rebuilt.** Dither seam, closing CTA, sidebar-density link columns. Links share the dashboard's `.nav-item` selector groups in `index.css`, so they get identical type + corner-tick hover. |

---

## 5. Outstanding

**Meta-skeleton remnants.** The page still runs the Stripe/Linear/Vercel shape in
places, the law's single most-warned-about layout. Customer story (quote card), Blog
(empty), FAQ (accordion) are the remaining three.

**Mono as house voice.** Still on captions and footnotes throughout. The law: mono is
legitimate only where the content is genuinely data. Inside the tail and tables it is;
on colophons it's costume.

**Hairline border on every box.** The premium form is a self-coloured edge + tonal
elevation, not a drawn 1px line on everything.

**Not done from Rob's reference:** the stepped/notched box silhouettes (offset squares
cutting into panel corners). That's the "one bespoke silhouette" move and would
replace the plain rectangle on every instrument.

**Removed deliberately:** a "live" request ticker in the footer and a `req/s` readout
in the nav. Both were invented traffic on a timer dressed as real readouts. If real
telemetry ever exists, they can come back, sourced, not simulated.

---

## 6. Verifying

No system Chrome. Use the dev-dep Playwright chromium. Script must resolve `playwright`
from the project:

```js
import { createRequire } from 'node:module';
const require = createRequire('/Users/rob/Documents/GitHub/dashboard-exploration/package.json');
const { chromium } = require('playwright');
```

- WebGL in headless needs:
  `args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']`
- Theme: `page.addInitScript(t => localStorage.setItem('ub-theme', t), 'dark')`
- `readPixels` on the canvas returns empty. WebGL clears the drawing buffer after
  compositing. Screenshot and crop instead.
- Count-up animations settle in ~1.5s.

`npx tsc -b --noEmit` is clean. `npx eslint src` reports **11 errors, all
pre-existing on `main`**, none from this work. Verify that number before and after
your changes.

---

## 7. Hard-won gotchas

- **Never gate content on an entrance animation.** `[data-reveal]{opacity:0}` +
  IntersectionObserver shipped blank sections. Entrances animate *position only* now.
  Same trap killed the hero H1 via `translateY(105%)` inside `overflow: hidden`.
- **Grain goes behind content**, never over it (it was at `z-index: 50`).
- In a subgrid row where DOM order and column order disagree (a flipped row), pin both
  cells with `grid-row: 1`, auto-placement won't step backwards and silently drops the
  second cell onto a new row.
- Lattice/wall brick counts must be a whole multiple of the course width or the wall
  ends ragged.
- A graphic inside a `.win-body` must not draw its own border/fill/ticks, the window
  owns the frame. Several predate the window system and had to be suppressed.
