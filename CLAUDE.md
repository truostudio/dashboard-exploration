# Uniblock dashboard: working rules

Read this before writing any code. It is short on purpose; the detail lives in the
documents named below.

## Read first, every time

1. **`public/component-library-handoff.md`**, the design system: tokens, every
   primitive with its props, the CSS file map, and how to wire real data. Its colour
   and icon tables are generated from the source, so they are true.
2. **`public/what-is-real.md`**, which interactions ship as written, which are
   simulated, and which controls render without a handler. Check it before claiming
   anything in this app works end to end.
3. **`/components`** in the running app, the same library, live and interactive.
   If the doc and the page disagree, the page is right.

Skipping these is how this codebase grows a second button.

## What this is

A React + Vite + plain-CSS dashboard. No Tailwind, no CSS-in-JS, no component library.
The design system is hand-built and lives in `src/index.css` (tokens and foundations)
and `src/components/ui/` (primitives).

- `npm run dev` · `npm run build` (typechecks first) · `npm run lint`
- `src/views/` is one file per screen
- `src/components/ui/` holds the primitives, behind one barrel export
- `src/data/`, all content, and the seam where a real API goes
- `src/landing/`, the marketing site at `/landing-page-<slug>`, shares tokens only

## Non-negotiable

| Rule | Detail |
|------|--------|
| **Compose, don't invent** | If a primitive exists for the job, use it. Adding a parallel row/dialog/popover is the main way this codebase degrades. See "Adding something new without creating a one-off" in the handoff. |
| **Tokens, never literals** | Colour, space, type, radius, shadow, and motion all come from CSS variables. No hex, no magic px. |
| **Square** | Everything. Radius tokens exist and all resolve to `0` so the system can be re-rounded from one place. |
| **Type** | Sizes are multiples of 4, line-heights 150%. All chrome, labels, meta, table headers, badges, buttons, is 12px. Sans for controls and prose, Mono for data and meta, Pixel for hero numerals only. |
| **Icons** | Phosphor only, via `src/components/Icons.tsx`, which is an alias table (`Icon.Tx`, `Icon.Route`). Never hand-draw an `<svg>`. |
| **Blue means one thing** | The Uniblock path: the provider that won, the single invoice, the live figure. Nothing goes blue for emphasis or for its turn. |
| **Surfaces are graphite** | Achromatic, never blue-derived. A blue-black near-black reads as a dim version of the brand rather than a ground for it. |
| **Charts** | Through `ChartFrame` and the theme constants in `components/ui/Chart.tsx`. Never pass Recharts an inline style object; it escapes the token system. |
| **No inline `style`** | Except for a computed value that genuinely cannot be a class (a bar's `--w`, a measured height). |

## Motion

Interaction should feel physical, not decorative. The house moves are already built:

- The corner registration ticks light on hover and focus. One recipe, declared once in
  `index.css`. Add a new class to those selector lists; do not redeclare the gradients.
- Controls settle (`--ease-io`, ~0.16s); markers travel (`--ease-out`, ~0.34s).
- Nothing snaps to a new size under the pointer. A panel that changes height animates to
  it (see `.wir-stage`); a list that reorders does not jump.
- Everything above is behind `@media (prefers-reduced-motion: reduce)`.

## Content

Write like the product is being explained by someone who built it. Specific figures over
adjectives; say what a number cost as well as what it saved. No marketing voice in the
app, no "seamless", no exclamation marks. Empty states say what will fill them.

## Before you finish

1. `npm run build`. It typechecks.
2. Look at the change in the browser, in both themes.
3. Check the work against `~/.claude/skills/truo-design` (the anti-slop law) if you
   touched anything visual.
4. If you added a primitive: export it from `components/ui/index.ts`, add an entry to
   the Components page, and add its section to the handoff doc. All three, or it will be
   re-invented in a month.
