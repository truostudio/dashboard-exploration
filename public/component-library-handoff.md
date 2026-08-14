# Uniblock Dashboard. Component Library Handoff

> **Audience:** frontend engineers and coding agents rebuilding or extending this UI.
> **How to use:** paste this entire file into your LLM / agent context before implementing screens.
> **Source of truth:** the live Components page in this repo mirrors these names and APIs.

---

## System rules (non-negotiable)

| Rule | Detail |
|------|--------|
| **Type** | Font sizes are multiples of 4. Line-heights are 150%. All chrome (labels, meta, table headers, badges) is **12px**. |
| **Shape** | Everything is **square**. Radius tokens exist but all resolve to `0`. |
| **Family** | **Sans** (Geist) for controls and prose · **Mono** (Geist Mono) for data and meta · **Pixel** (Geist Pixel) for hero numerals only |
| **Imports** | Primitives: `from '../components/ui'` unless a component entry notes otherwise |
| **No inline Recharts styles** | Never pass style objects to Recharts primitives; they escape the CSS/token system. Use the chart theme constants below. |
| **Tokens over literals** | Spacing, colour, type, and elevation come from CSS variables. Do not hardcode hex/px for those. |

---

## Design tokens

Token **names** are stable across themes. Only values flip under `:root[data-theme='dark']`.

### Colour

> Generated from `src/index.css`. If you change a token there, regenerate this table. A spec that disagrees with the stylesheet is worse than no spec.

#### Brand (locked: blue does not flip, only ink/soft variants do)

| Token | Light | Dark |
|-------|-------|------|
| `--ub-blue` | `#1FB6FF` | *(unchanged)* |
| `--ub-blue-ink` | `var(--ub-blue)` | *(unchanged)* |
| `--ub-blue-hover` | `#0FA9F5` | `#45C1FF` |
| `--ub-blue-soft` | `rgba(31, 182, 255, 0.10)` | `rgba(31, 182, 255, 0.14)` |
| `--ub-blue-wash` | `rgba(31, 182, 255, 0.05)` | `rgba(31, 182, 255, 0.07)` |
| `--ub-blue-border` | `rgba(31, 182, 255, 0.38)` | `rgba(31, 182, 255, 0.32)` |
| `--ub-blue-glow` | `rgba(31, 182, 255, 0.22)` | `rgba(31, 182, 255, 0.26)` |
| `--ub-accent-on-blue` | `var(--ub-black)` | `#FFFFFF` |

`--ub-accent-on-blue` exists because the corner-tick accent (see Buttons, below) uses `--ub-blue` on every surface except `.primary` itself, a blue tick is invisible on a blue fill, so `.primary` swaps to this token instead.

#### Ink

| Token | Light | Dark |
|-------|-------|------|
| `--ub-black` | `#0D0E0D` | `#F1F3F1` |
| `--ub-black-hover` | `#232523` | `#DDDFDD` |
| `--ub-text-2` | `#4E514E` | `#A7AAA7` |
| `--ub-text-3` | `#848784` | `#7F827F` |
| `--ub-white` | `#FFFFFF` | `#0D0E0D` |

`--ub-black` is "text". `--ub-white` is "the surface text sits on when inverted" (solid chips, dark buttons). Both flip in dark mode. The ramp is achromatic graphite, never blue-derived: a blue-black near-black reads as a dim version of the brand rather than a ground for it.

#### Surface

| Token | Light | Dark |
|-------|-------|------|
| `--ub-canvas` | `#F3F4F3` | `#0D0E0D` |
| `--ub-elevated` | `#FFFFFF` | `#171817` |
| `--ub-sunken` | `#F9FAF9` | `#121312` |
| `--ub-grid` | `#EDEFED` | `#222422` |
| `--ub-hover` | `rgba(13, 14, 13, 0.04)` | `rgba(250, 255, 250, 0.05)` |
| `--ub-hover-2` | `rgba(13, 14, 13, 0.07)` | `rgba(250, 255, 250, 0.09)` |

#### Line

| Token | Light | Dark |
|-------|-------|------|
| `--ub-line` | `rgba(13, 14, 13, 0.08)` | `rgba(250, 255, 250, 0.09)` |
| `--ub-line-strong` | `rgba(13, 14, 13, 0.16)` | `rgba(250, 255, 250, 0.16)` |
| `--ub-border` | `#C5C8C5` | `#474947` |
| `--ub-border-soft` | `#DFE1DF` | `#2B2D2B` |
| `--ub-plate` | `transparent` | `rgba(255, 255, 255, 0.14)` |

#### Semantic

| Token | Light | Dark |
|-------|-------|------|
| `--ub-success` | `#12C98B` | `#03AD79` |
| `--ub-success-ink` | `#0A7A52` | `#2EE0A0` |
| `--ub-success-soft` | `rgba(18, 201, 139, 0.12)` | `rgba(3, 173, 121, 0.16)` |
| `--ub-warning` | `#FF9500` | `#DE8500` |
| `--ub-warning-ink` | `#9A5800` | `#FFB020` |
| `--ub-warning-soft` | `rgba(255, 149, 0, 0.12)` | `rgba(222, 133, 0, 0.16)` |
| `--ub-danger` | `#FF2D6F` | `#FF2D6F` |
| `--ub-danger-ink` | `#C81E5B` | `#FF6C97` |
| `--ub-danger-soft` | `rgba(255, 45, 111, 0.12)` | `rgba(255, 45, 111, 0.16)` |
| `--ub-violet` | `#8B5CFF` | `#8B5CFF` |
| `--ub-violet-ink` | `#6D3BF5` | `#A78BFF` |
| `--ub-violet-soft` | `rgba(139, 92, 255, 0.12)` | `rgba(139, 92, 255, 0.16)` |

Two values per slot. The base is the **mark** (chart fills, dots, meter bars); the `-ink` is the **text**, dropped to AA contrast on the surface. Painting 12px type in the mark colour is how a palette ends up simultaneously washed out and illegible. The marks are validated as a categorical set under deuteranopia, the previous `#D92D20` / `#B45309` pair was ΔE 2.6 apart, i.e. the same colour to a red-green viewer.

#### Overlay

| Token | Light | Dark |
|-------|-------|------|
| `--ub-scrim` | `rgba(13, 14, 13, 0.45)` | `rgba(4, 5, 4, 0.66)` |
| `--ub-canvas-blur` | `rgba(243, 244, 243, 0.82)` | `rgba(13, 14, 13, 0.82)` |
| `--ub-blueprint` | `rgba(31, 182, 255, 0.06)` | `rgba(31, 182, 255, 0.08)` |

---

### Typography

**Fonts**

| Token | Stack |
|-------|-------|
| `--font-sans` | `'Geist', 'Inter', system-ui, -apple-system, sans-serif` |
| `--font-mono` | `'Geist Mono', ui-monospace, 'SF Mono', Consolas, monospace` |
| `--font-pixel` | `'Geist Pixel', 'Geist Mono', monospace` |

**Scale** (size × 150% line-height)

| Name | Tokens | Usage |
|------|--------|-------|
| Display | `--fs-3xl` 48 / `--lh-3xl` 72 | Reserved. Not currently used. |
| Hero | `--fs-2xl` 32 / `--lh-2xl` 48 | Hero titles, plan prices, big stats |
| Page title | `--fs-xl` 24 / `--lh-xl` 36 | Topbar h1, drawer title, modal title |
| Panel title | `--fs-lg` 20 / `--lh-lg` 30 | Panel and section headings |
| Body | `--fs-body` 16 / `--lh-body` 24 | Prose, panel subtitles, table cells |
| Micro | `--fs-micro` 12 / `--lh-micro` 18 | **All** chrome, data, and meta |
| Mono (usage) | `--font-mono` at micro | Data, paths, badges, table headers |
| Pixel (usage) | `--font-pixel` | Hero numerals, plan names, step markers |

Aliases: `--t-display` → 2xl, `--t-h1` → xl, `--t-h2` → lg, `--t-eyebrow` → micro.

---

### Spacing (4pt scale)

| Token | Value |
|-------|-------|
| `--s-1` | 4px |
| `--s-2` | 8px |
| `--s-3` | 12px |
| `--s-4` | 16px |
| `--s-5` | 20px |
| `--s-6` | 24px |
| `--s-7` | 32px |
| `--s-8` | 40px |
| `--s-9` | 48px |
| `--s-10` | 64px |

### Radius

All `0px`: `--radius-xs`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-pill`.

Kept so the system can be re-rounded from one place.

### Elevation

| Token | Role |
|-------|------|
| `--shadow-sm` | Subtle lift |
| `--shadow-md` | Floating surfaces |
| `--shadow-pop` | Large overlays |
| `--shadow-hard` | Popovers, hard offset, no blur, crisp edges |

### Motion

| Token | Value | Use |
|-------|-------|-----|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Marker travel (~0.34s) |
| `--ease-io` | `cubic-bezier(0.4, 0, 0.2, 1)` | State changes (~0.16s) |

**No hard cuts.** Nothing in this system changes state by cutting to the new one. Content
replaced in place transitions, a region that changes height animates to it, an element
that leaves animates out before it unmounts, and a colour that changes crosses rather
than switches. An instant swap reads as a page reload, not as a change the product made.

Three classes carry this, all declared once in `index.css` beside `.rise`:

| Class | Use |
|-------|-----|
| `.swap-in` | Content replaced in place. Put it on an element keyed by whatever identifies the content (`key={page}`) so React remounts it and the animation replays. `is-back` enters from the other side for a backwards move; `is-subtle` is a shorter vertical throw for a swap inside a panel. |
| `.swap-stage` | Wraps a region whose height changes as its contents swap. Pair with a measured height (see `WeekInReviewModal`) and it animates to the new one instead of snapping. |
| `.rise` / `.rise-1`…`.rise-6` | First-paint entrance for a view's blocks, staggered. |

Do not write a component-local `@keyframes` that fades or slides content. That is how a
system ends up with six near-identical versions of one move.

### Shell constants

| Token | Value |
|-------|-------|
| `--sidebar-w` | 240px |
| `--ctl-h` | 32px |
| `--ctl-h-sm` | 28px |
| `--content-max` | 1240px |

---

## Utility classes

| Class | Purpose |
|-------|---------|
| `.mono` | Geist Mono with tabular figures. All data, paths, URLs. |
| `.pixel` | Geist Pixel. Hero numerals and plan names only. |
| `.tnum` | Tabular lining figures without changing the family. |
| `.dim` | Tertiary ink (`--ub-text-3`). |
| `.muted` | Secondary ink (`--ub-text-2`). |
| `.eyebrow` | Mono uppercase overline with a blue tick. |
| `.marks` | Two diagonal registration brackets. |
| `.marks-4` | Four registration brackets. Default on `Panel`. |
| `.blueprint-bg` | Faint 32px engineering grid. |
| `.prose` | Caps a text block at 88ch. |
| `.push-right` | `margin-left: auto` inside a flex row. |
| `.axis-mono` | Mono face for Recharts axis labels. |

---

## Icons

Import: `import { Icon } from '../components/Icons'`

55 icons, generated from `src/components/Icons.tsx`. Usage: `<Icon.Name size={16} />` (default size varies by icon; most chrome icons are 16).

**Catalogue:** `Grid`, `Chart`, `Image`, `Coin`, `Tx`, `Defi`, `Social`, `Send`, `Prediction`, `Stablecoin`, `Code`, `Webhook`, `Beaker`, `Folder`, `Users`, `Card`, `Menu`, `Search`, `Plus`, `Chevron`, `ChevronLeft`, `ChevronDown`, `Sun`, `Moon`, `Bell`, `Copy`, `Eye`, `Check`, `X`, `Key`, `Play`, `Trash`, `Refresh`, `External`, `Mail`, `Download`, `Settings`, `Filter`, `Link`, `Cube`, `Nodes`, `Lightning`, `Rocket`, `Book`, `Calculator`, `Up`, `Down`, `Route`, `Socket`, `Unplugged`, `Shield`, `Alert`, `Pulse`, `Timer`, `Receipt`

---

## Components

Default import path: `from '../components/ui'`

---

### Surfaces

#### `Panel`

Base container. Carries four registration brackets by default.

| Prop | Type |
|------|------|
| `marks` | `boolean \| 4 = 4` |
| `flush` | `boolean` |
| `className` | `string` |
| `id` | `string` |

```tsx
<Panel marks={4} flush={false}>
  {children}
</Panel>
```

#### `PanelHead`

Header row: eyebrow, title, subtitle, and a right-hand actions slot.

| Prop | Type |
|------|------|
| `title` | `ReactNode` |
| `eyebrow` | `ReactNode` |
| `sub` | `ReactNode` |
| `actions` | `ReactNode` |
| `inset` | `boolean` |

```tsx
<PanelHead
  eyebrow="Last 30 days"
  title="Total requests"
  sub="Live snapshot."
  actions={<button className="btn">Manage</button>}
/>
```

#### `TitledPanel`

`Panel` + `PanelHead` together. The common case.

```tsx
<TitledPanel eyebrow="Live" title="Test an Endpoint" sub="Send a request.">
  {children}
</TitledPanel>
```

#### `Hero`

The screen-opening block: eyebrow, display-size title, one paragraph, a row of `.btn-blk` actions, and the dither field drifting behind all of it. It sits on `--ub-elevated` rather than an inverted surface, a screen that opens loudly does not also need to change register.

Use it when a screen is the first thing someone sees. That includes when it is *empty*: an empty state that is the resting state of a screen (Nodes, where dedicated nodes are switched on after a sales conversation) gets the same treatment as a first run, not a centred icon apologising for having no rows. Quickstart and Nodes are both this component; a third hero should be too.

`plain` drops the dither, for a hero that already carries artwork. The field is full-bleed and thins out in the shader's own coverage ramp rather than behind a CSS mask, fading opacity would grey the ink out, while fading coverage thins the dots, which is what a screen actually does.

| Prop | Type |
|------|------|
| `eyebrow` | `ReactNode` |
| `title` | `ReactNode` |
| `sub` | `ReactNode` |
| `actions` | `ReactNode`, a row of `.btn-blk on-light` |
| `plain` | `boolean` |
| `className` | `string` |

```tsx
<Hero
  eyebrow="Dedicated nodes / none provisioned"
  title={<>A node of your own,<br />sized to your traffic.</>}
  sub="We size nodes per chain against what you actually send."
  actions={
    <>
      <button className="btn-blk on-light is-solid">Book a call</button>
      <button className="btn-blk on-light is-bare">What it costs</button>
    </>
  }
/>
```

CSS: `.hero*` in `App.css`, one block, not under a view heading. It is shared, and splitting it back out per view is how a second hero gets written.

#### `Empty`

Dashed placeholder for no-data states. `bare` drops the border/background for use inside a table cell. Add `icon` + `title` for the richer shape analytics charts and stat panels want when a project has no traffic yet, icon and title stack above the description instead of one centred line.

| Prop | Type |
|------|------|
| `bare` | `boolean` |
| `icon` | `ReactNode` |
| `title` | `ReactNode` |

```tsx
<Empty>No results match your filters.</Empty>

<Empty icon={<Icon.Chart size={20} />} title="No data yet">
  Once traffic starts flowing, this chart fills in automatically.
</Empty>
```

#### `Modal` / `ModalFoot` / `Stepper`

The app's one dialog. Backdrop, Escape, and the header row belong to `Modal`, nothing re-declares them. `nav` sits between the head and the body and normally takes a `Stepper`. Renders nothing when closed, so mount it unconditionally.

`Stepper` **without** `onSelect` is a wizard's progress readout: later steps are not reachable yet, and `checkDone` ticks the ones behind you. **With** `onSelect`, every marker is a button and the row becomes page tabs, for a deck whose pages are all already true.

| Prop (`Modal`) | Type |
|------|------|
| `open` / `onClose` | `boolean` / `() => void` |
| `title` / `sub` | `ReactNode` |
| `nav` | `ReactNode`, usually a `Stepper` |
| `foot` | `ReactNode`, use `ModalFoot` |
| `label` | `string`, aria-label when the title is not a string |
| `className` | `string`, width and per-use trim |

| Prop (`Stepper`) | Type |
|------|------|
| `steps` | `{ id, label }[]` |
| `current` | `number` |
| `onSelect` | `(index: number) => void`, makes the markers page tabs |
| `checkDone` | `boolean`, ticks completed markers. Wizards only. |

```tsx
<Modal
  open={open}
  onClose={close}
  title="New project"
  sub="Spin up a project with the chains and APIs you need."
  nav={<Stepper steps={steps} current={step} checkDone />}
  foot={
    <ModalFoot summary={`${selected.size} chains selected`}>
      <button className="btn ghost" onClick={close}>Cancel</button>
      <button className="btn primary" onClick={next}>Continue</button>
    </ModalFoot>
  }
>
  {stepBody}
</Modal>
```

Live examples: `NewProject` (wizard), `WeekInReviewModal` (deck, `onSelect`, plus an animated body height so a page change is a movement rather than a snap).

---

### Toolbars and navigation

#### `ViewToolbar`

Bar above a view: identity left, controls right. Pass `lead` to replace the title block.

| Prop | Type |
|------|------|
| `title` | `ReactNode` |
| `count` | `ReactNode` |
| `lead` | `ReactNode` |
| `className` | `string` |

```tsx
<ViewToolbar title="All providers" count="24 providers">
  <SearchInput compact value={q} onChange={setQ} />
</ViewToolbar>
```

#### `SectionHeader`

Heading between sections of a view.

| Prop | Type |
|------|------|
| `title` | `ReactNode` |
| `meta` | `ReactNode` |
| `lead` | `boolean` |

```tsx
<SectionHeader lead title="Spotlight" meta="Featured integrations" />
```

#### `SearchInput`

`compact` caps at 240px; `grow` fills its container; `hint` takes the ⌘K chip.

| Prop | Type |
|------|------|
| `value` | `string` |
| `onChange` | `(v: string) => void` |
| `placeholder` | `string` |
| `compact` | `boolean` |
| `grow` | `boolean` |
| `hint` | `ReactNode` |

```tsx
<SearchInput compact value={q} onChange={setQ} placeholder="Search…" />
```

#### `Segmented`

**From:** `../components/Segmented`

Every toggle and tab in the app. The marker travels between options; arrow keys move selection.

| Prop | Type |
|------|------|
| `options` | `{ value, label }[]` |
| `value` | `T` |
| `onChange` | `(v: T) => void` |
| `variant` | `'seg' \| 'tab'` |
| `label` | `string` |

`tab` differs from `seg` in ARIA (`tablist`/`tab`) and nothing else: same bordered row of cells, same travelling marker, same control height. Picking one of several has exactly one appearance in this system.

```tsx
<Segmented
  value={sort}
  onChange={setSort}
  options={[
    { value: 'trending', label: 'Trending' },
    { value: 'alpha', label: 'Alphabetical' },
  ]}
/>
```

#### `NavList` / `NavRow`

A stack of rows that go somewhere: leading mark, title, optional second line, optional right-hand figure, chevron. Settings' project actions, the overview's API ledger, and the onboarding checklist in the rail are all this row. Do not cut a new one.

| Prop (`NavList`) | Type |
|------|------|
| `boxed` | `boolean`, draws a border around the stack. Omit inside a `flush` panel, where the panel head already draws the rule above the first row. |

| Prop (`NavRow`) | Type |
|------|------|
| `icon` | `ReactNode`, leading square: an icon, a step marker, an avatar |
| `title` / `sub` / `meta` | `ReactNode`, `meta` is the right-hand figure, mono |
| `tone` | `'neutral' \| 'brand' \| 'danger'`, tints the mark |
| `dense` | `boolean`, rail build: micro title, no tile chrome, no hover fill |
| `onClick` | `() => void` |

```tsx
<NavList boxed>
  <NavRow
    tone="brand"
    icon={<Icon.Coin size={16} />}
    title="Token API"
    sub="Balances, metadata, transfers."
    meta="12 endpoints"
    onClick={() => go('apis-unified')}
  />
  <NavRow tone="danger" icon={<Icon.Trash size={16} />} title="Archive project" sub="Remove it from the dashboard." />
</NavList>
```

#### `Popover`

**From:** `../components/ui/Popover`

Trigger plus a panel positioned against the **window**, not its parent. It measures the panel, prefers the requested edge, and clamps it back inside the viewport on both axes, a trigger near an edge cannot push the panel off-screen. Portalled to `document.body` so no clipping or transformed ancestor can capture it. Escape or the backdrop dismisses it. Anything that drops a panel composes this: the filter trigger and the notifications bell both do.

| Prop | Type |
|------|------|
| `trigger` | `(open: boolean) => ReactNode`, contents only; the button is the popover's |
| `triggerClassName` | `string = 'btn'` |
| `triggerLabel` | `string`, aria-label for an icon-only trigger |
| `label` | `string`, names the panel |
| `align` | `'left' \| 'right' = 'left'`, a preference; the clamp overrules it |
| `foot` | `(close: () => void) => ReactNode`, pinned below the scrolling body |
| `children` | `ReactNode \| ((close: () => void) => ReactNode)` |

```tsx
<Popover
  label="Notifications"
  align="right"
  triggerClassName="btn ghost icon-only"
  triggerLabel="Notifications"
  trigger={() => <Icon.Bell size={15} />}
  foot={(close) => <button className="btn small" onClick={close}>Close</button>}
>
  {(close) => <ul className="notif-list">…</ul>}
</Popover>
```

#### `FilterPopover` / `FilterGroup`

**From:** `../components/ui/FilterPopover`

The filter trigger and its chip groups, on top of `Popover`, placement, portalling, and dismissal are not re-implemented here. The trigger shows an active-count badge and tints blue when anything is selected. `FilterGroup` is a labelled row of chip toggles inside the popover body, compose the actual filter state (which chips are active) in the parent view; the popover only owns its own open/closed state.

| Prop (`FilterPopover`) | Type |
|------|------|
| `activeCount` | `number = 0`, drives the badge and enables "Clear filters" |
| `onClear` | `() => void` |
| `label` | `string = "Filters"` |
| `align` | `'left' \| 'right' = 'left'` |

| Prop (`FilterGroup`) | Type |
|------|------|
| `label` | `string` |
| `children` | `ReactNode`, chip buttons |

```tsx
const [category, setCategory] = useState<string[]>([]);
const toggle = (c: string) =>
  setCategory((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

<FilterPopover activeCount={category.length} onClear={() => setCategory([])}>
  <FilterGroup label="Category">
    {['Token', 'NFT', 'DeFi'].map((c) => (
      <button key={c} className={`chip ${category.includes(c) ? 'on' : ''}`} onClick={() => toggle(c)}>
        {c}
      </button>
    ))}
  </FilterGroup>
</FilterPopover>
```

Live examples: All APIs filters by category + method; JSON-RPC filters by network kind (mainnet/testnet) + WebSocket provider.

**Stacking note:** the entrance-animation classes (`.rise`) apply a `transform`, and `animation-fill-mode: forwards` keeps that transform applied forever, which means any `.rise` element permanently owns its own stacking context, no matter how high a z-index something nested inside it has. `.view-toolbar` (where the trigger usually lives) is given `position: relative; z-index: 5` for exactly this reason, so its whole subtree, popover included, paints above sibling `Panel`s in the same `.view` flex column. If you anchor a popover trigger somewhere else, give that ancestor an explicit `z-index` too rather than raising the popover's own.

---

### Indicators

#### `Badge`

Tones: `neutral`, `success`, `warning`, `danger`, `new`, `solid`.

| Prop | Type |
|------|------|
| `tone` | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'new' \| 'solid'` |
| `className` | `string` |

```tsx
<Badge tone="success">200 OK</Badge>
```

#### `MethodBadge`

HTTP method, coloured consistently wherever an endpoint is listed.

| Prop | Type |
|------|------|
| `method` | `'GET' \| 'POST' \| 'WS'` |

```tsx
<MethodBadge method="GET" />
```

#### `Dot`

Square status marker.

| Prop | Type |
|------|------|
| `tone` | `'ok' \| 'warn'` |

```tsx
<Dot tone="ok" />
```

#### `Meter`

Horizontal progress bar.

| Prop | Type |
|------|------|
| `value` | `number (0-100)` |
| `size` | `'sm' \| 'md'` |
| `color` | `string` |

```tsx
<Meter value={62} />
```

#### `SquareMeter`

**From:** `../components/SquareMeter`

Square ring gauge. Stroke is measured along the perimeter, so a segment's share is linear.

| Prop | Type |
|------|------|
| `segments` | `{ value, color }[]` |
| `value` | `string` |
| `caption` | `string` |
| `size` | `number = 132` |
| `thickness` | `number = 10` |

```tsx
<SquareMeter
  value="98.2%"
  caption="2xx"
  segments={[
    { value: 98.2, color: 'var(--ub-blue)' },
    { value: 1.8, color: 'var(--ub-danger)' },
  ]}
/>
```

#### `AnimatedNumber`

**From:** `../components/AnimatedNumber`

Counts a formatted value up on mount. Respects `prefers-reduced-motion`.

| Prop | Type |
|------|------|
| `value` | `string` |
| `duration` | `number = 1100` |
| `className` | `string` |

```tsx
<AnimatedNumber value="1,474,250" />
```

#### `Avatar` / `AvatarStack`

Provider and chain artwork. Falls back to a pixel monogram when no icon ships.

| Prop | Type |
|------|------|
| `src` | `string \| undefined` |
| `name` | `string` |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` |

```tsx
<Avatar src={provider.icon} name={provider.name} size="lg" />
<AvatarStack items={chains} more="300+" />
```

---

### Data display

#### `Figure`

A headline numeral and the unit that makes it mean something. `StatTiles` is the bordered row of these; `Figure` is the one that stands alone, a deck page, a summary card. Pass a `Num` as the value to have it count up on mount.

| Prop | Type |
|------|------|
| `value` | `ReactNode` |
| `unit` | `ReactNode`, the caption. A figure without one is a riddle. |
| `size` | `'md' \| 'lg' = 'lg'` |

```tsx
<Figure value={<Num value={423500} format={int} />} unit="requests routed" />
```

#### `TraceBar`

One request's time, in the order it was spent. Built for the failover story, where the honest version of "we saved this call" has to show what the save cost: a wasted attempt, then a good one. The baseline tick is what the same call takes when nothing goes wrong, so the overhead is a distance you can see rather than a number to be trusted.

| Prop | Type |
|------|------|
| `segments` | `{ id, label, ms, tone? }[]`, `tone`: `'brand' \| 'danger' \| 'warning' \| 'neutral'` |
| `baseline` | `{ ms, label }`, draws the tick and the "+N ms" row |
| `totalLabel` | `ReactNode = 'total'` |

```tsx
<TraceBar
  segments={[
    { id: 'lost', label: 'First choice, given up on', ms: 181, tone: 'danger' },
    { id: 'served', label: 'Next healthy provider, served', ms: 51 },
  ]}
  baseline={{ ms: 64, label: 'A clean first-choice call' }}
  totalLabel="What the caller waited"
/>
```

#### `Spec`

Label/value rows in tabular mono. Keeps figures comparable across cards.

| Prop | Type |
|------|------|
| `rows` | `{ label, value }[]` |

```tsx
<Spec rows={[
  { label: 'Endpoints', value: 55 },
  { label: 'Categories', value: 7 },
]} />
```

#### `BarList`

Ranked rows with a proportional bar.

| Prop | Type |
|------|------|
| `items` | `{ id, label, meta?, share, value, color? }[]` |

```tsx
<BarList items={[
  { id: 'a', label: '/token/balance', meta: '184,230 calls', share: 100, value: '100%' },
]} />
```

#### `StatTiles`

Bordered row of figures. Pass `columns` for a fixed grid; omit it to flex.

| Prop | Type |
|------|------|
| `tiles` | `{ id, label, value, foot? }[]` |
| `columns` | `number` |

```tsx
<StatTiles columns={3} tiles={[
  { id: 'total', label: 'Total requests', value: '1,474,250' },
]} />
```

#### `Legend`

Keyed list beside a meter or chart.

| Prop | Type |
|------|------|
| `items` | `{ id, label, value, tone? }[]` |

```tsx
<Legend items={[{ id: '2xx', tone: 'success', label: '2xx', value: '2,367,840' }]} />
```

#### `Table` / `TableFoot` / `RowChevron`

Columns are declared; rows are children. `RowChevron` marks a row that opens something.

| Prop | Type |
|------|------|
| `columns` | `{ key, header?, align? }[]` |
| `ruled` | `boolean` |
| `page` / `pages` / `onChange` / `summary` | `TableFoot` |

```tsx
<Table columns={[{ key: 'name', header: 'Name' }, { key: 'go' }]}>
  <tr className="row-click" onClick={open}>
    <td className="cell-strong">Kraken</td>
    <RowChevron />
  </tr>
</Table>
<TableFoot page={p} pages={4} onChange={setP} summary="24 providers" />
```

---

### Forms and actions

#### `Field` / `TextInput` / `Select` / `Form` / `FormActions`

`Field` wraps a labelled control. Use `as="label"` when it wraps a single input.

| Piece | Props |
|-------|-------|
| `Field` | `label`, `as?: 'label' \| 'div'` |
| `TextInput` | `value`, `onChange`, `placeholder?`, `type?` |
| `Select` | `value`, `onChange`, `options`, `width?` |

```tsx
<Form>
  <Field label="Endpoint URL" as="label">
    <TextInput value={url} onChange={setUrl} placeholder="https://…" />
  </Field>
  <FormActions>
    <button className="btn primary">Create</button>
  </FormActions>
</Form>
```

#### Buttons

Plain elements, not a component. One class, five variants.

| Class | Role |
|-------|------|
| `.btn` | base |
| `.primary` | brand fill |
| `.dark` | inverted |
| `.ghost` | transparent |
| `.danger` | destructive |
| `.icon-only` | square 32px |
| `.small` | 28px |

```tsx
<button className="btn primary">Send</button>
<button className="btn ghost icon-only" aria-label="Copy"><Icon.Copy size={14} /></button>
```

Hover/focus draws the same corner-tick accent every other interactive surface uses (see `.marks` / corner accents in Utility classes), nothing more, no glow ring. `.primary` is the one exception that needs a colour override: on a `--ub-blue` fill, a `--ub-blue` tick disappears, so `.btn.primary::after` swaps the tick colour to `--ub-accent-on-blue` (near-black ink in light mode, pure white in dark mode) so it always reads against the fill.

#### `CopyButton` / `useCopy`

Clipboard with a transient confirmation. The hook keys by row so one instance serves a list.

| Prop | Type |
|------|------|
| `value` | `string` |
| `copyKey` | `string` |
| `label` | `string` |
| `variant` | `'ghost' \| 'default'` |
| `size` | `number` |

```tsx
<CopyButton value={endpoint.path} />

const { copy, isCopied } = useCopy();
copy(url, rowKey);
```

#### Chips

Filter chips. Plain elements; `.on` marks the active one.

```tsx
<button className={`chip ${active ? 'on' : ''}`}>Token</button>
```

---

### Charts

**Import from:** `../components/ui/Chart`

Never pass Recharts inline style objects; they escape the CSS system.

#### `ChartFrame`

Plot wrapper. Replaces a raw `ResponsiveContainer`.

| Prop | Type |
|------|------|
| `height` | `number` |
| `children` | `ReactElement` |

```tsx
<ChartFrame height={240}>
  <AreaChart data={rows}>…</AreaChart>
</ChartFrame>
```

#### `ChartTooltip`

Terminal readout. Real DOM, so it inherits square edges and both themes.

| Prop | Type |
|------|------|
| `labelFormatter` | `(l) => ReactNode` |
| `valueFormatter` | `(v) => ReactNode` |

```tsx
<Tooltip
  cursor={chartCursor}
  content={<ChartTooltip valueFormatter={(v) => `${v} ms`} />}
/>
```

#### Theme constants

Spread these onto Recharts primitives:

| Export | Use on |
|--------|--------|
| `chartAxis` | `XAxis` / `YAxis` props |
| `chartAxisLine` | `axisLine` prop |
| `chartGrid` | `CartesianGrid` props |
| `chartCursor` | crosshair for line/area |
| `chartBarCursor` | band for bar charts |

```tsx
<XAxis dataKey="label" {...chartAxis} axisLine={chartAxisLine} />
<CartesianGrid {...chartGrid} />
```

---

### Shell and composites

Rendered by `App`, not typically composed inside a view.

#### `Sidebar`

Left rail. Owns the travelling active marker, project switcher, quickstart card, and plan footer.

| Prop | Type |
|------|------|
| `view` | `ViewId` |
| `onNavigate` | `(id) => void` |
| `onNewProject` | `() => void` |
| `quickstartProgress` | `{ done, total }` |
| `open` | `boolean` |

#### `Topbar`

Sticky header: breadcrumb, title, search, theme toggle, actions.

| Prop | Type |
|------|------|
| `section` | `string` |
| `title` | `string` |
| `subtitle` | `string` |
| `theme` | `'light' \| 'dark'` |
| `onToggleTheme` | `() => void` |
| `onMenu` | `() => void` |
| `primaryAction` | `{ label, onClick } \| undefined` |

The "New project" button's label is wrapped in `<span className="tb-new-label">` so it can collapse to icon-only under 560px without touching markup at the call site.

#### `SiteBanner`, `../components/SiteBanner`

Terminal-style sitewide notice rendered above the `Topbar`, inside `.main-col` so it persists across every view. Mono readout with the same registration-mark treatment as `.chart-tip`; dismiss persists in `localStorage` under `ub-banner:<id>` until the id changes (bump the id when the copy changes so a prior dismiss doesn't hide the new announcement).

| Prop | Type |
|------|------|
| `onNavigate` | `(id: ViewId) => void` |

```tsx
<SiteBanner onNavigate={navigate} />
```

#### `EndpointDrawer`, `../components/EndpointDrawer`

Right slide-over catalogue. Direct sources show copy affordances; unified sources show chain coverage.

| Prop | Type |
|------|------|
| `source` | `DrawerSource \| null` |
| `onClose` | `() => void` |

#### `GetStarted`, `../components/GetStarted`

Onboarding checklist on Overview.

| Prop | Type |
|------|------|
| `steps` | `Step[]` |
| `onNavigate` | `(id) => void` |
| `onDismiss` | `() => void` |

#### `NewProject`, `../views/NewProject`

Four-step creation modal: project, chains, providers, capabilities.

| Prop | Type |
|------|------|
| `open` | `boolean` |
| `onClose` | `() => void` |

#### `useTheme`, `../theme`

Resolves and persists the theme. Follows the OS until an explicit choice is made. Storage key: `ub-theme`.

```tsx
const { theme, toggleTheme } = useTheme();
```

Returns: `{ theme, toggleTheme }`.

---

## Responsive

Breakpoints (max-width, mobile-first overrides layered on a desktop base):

| Breakpoint | Behaviour |
|-----------|-----------|
| `1180px` | Topbar search shrinks (`.tb-search` → 220px). |
| `1000px` | Shell goes single-column. Sidebar becomes a fixed off-canvas drawer (`transform: translateX(-100%)`, `.sidebar.open` slides in) behind a scrim (`.nav-backdrop`). Hamburger (`.tb-menu`) appears. Topbar search hides. |
| `760px` | Fixed-column tiles (`.kpi-tiles`, `.list-row`) collapse to one/two columns. Topbar breadcrumb + subtitle hide, leaving just the title. Panels and content padding tighten. Modal goes full-screen (`width: 100%; height: 100%; border-radius: 0`). |
| `560px` | Site banner message wraps instead of truncating. Topbar's "New project" button collapses to icon-only (`.tb-new-label { display: none }`). Modal/drawer/stepper edge padding tightens from 24px to 20px. |

**Grid overflow rule:** any `repeat(auto-fit/auto-fill, minmax(Npx, 1fr))` card grid must use `minmax(min(Npx, 100%), 1fr)` instead of a bare `Npx` lower bound. A bare pixel floor forces that track width even when the viewport is narrower than it, which overflows the page horizontally on small phones. Wrapping it in `min(Npx, 100%)` caps the floor at whatever width is actually available, so the grid always degrades to a single column instead of overflowing. Every card grid in this app (`bento`, `explore-grid`, `qs-grid`, `unified-grid`, `prov-direct-grid`, `settings-grid`, `plans-grid`, `chain-grid`, `prov-grid`, and the Components library's own swatch/icon grids) follows this rule, copy it for any new grid.

Other responsive conventions already in place and worth reusing:

- Tables never wrap their own columns; they scroll horizontally via `.table-wrap { overflow-x: auto }`. Don't try to make table columns stack on mobile.
- Toolbar rows (`ViewToolbar`'s `.ep-controls`, `.composer-row`, `.picker-head`) are `flex-wrap: wrap` by default, with fixed-width children given a `min-width` so they wrap onto their own line instead of squeezing.
- Modals/drawers size with `width: min(Npx, 100%)`, not a bare pixel width, so they never exceed the viewport.
- Text that must not push a layout wide (crumbs, table cell URLs, chip labels) gets `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`, but only when truncation doesn't hide an interactive element. If a truncated string would hide a link or button (as the site banner's message could), wrap instead of truncating.

---

---

## For the engineer implementing this

### Repo map

| Path | What is in it |
|------|---------------|
| `src/index.css` | **Tokens and foundations.** Every colour, size, space, shadow, and motion variable, both themes. Also the shared recipes: control heights, the corner-tick accent, `.rise` entrance choreography, `Segmented` chrome. |
| `src/components/ui/` | **The primitives.** One barrel: `import { Panel, Table, NavRow } from '../components/ui'`. Nothing here reaches into a view. |
| `src/components/` | App-level composites, `Sidebar`, `Topbar`, `Notifications`, `GetStarted`, `WeekInReview`, `EndpointDrawer`, `CommandPalette`, `Icons`. |
| `src/views/` | One file per screen. Views compose primitives; they do not declare panel/row/dialog markup. |
| `src/App.css` | Component and view styles. |
| `src/data/` | All content. See *Wiring real data*. |
| `src/landing/` | The marketing site, served at `/landing-page-<slug>`. Shares tokens, nothing else. |

Commands: `npm run dev` · `npm run build` (typechecks first) · `npm run lint`.

### Wiring real data

Every screen is already separated from its content: views import plain arrays and objects from `src/data/`, and never fetch. That is the seam.

| Module | Feeds |
|--------|-------|
| `data/mock.ts` | Projects, endpoints, providers, keys, team, invoices, webhooks, notifications, the week-in-review deck |
| `data/analytics.ts` | The whole Analytics view. `snapshot(range, chain)` returns one `Snapshot`; every tab reads from it |
| `data/catalog.ts`, `data/chains.ts`, `data/chainCoverage.ts`, `data/jsonRpcMethods.ts` | The API catalogue and chain coverage |

To go live, replace the module, not the views:

```ts
// data/mock.ts today
export const webhooks: Webhook[] = [ /* … */ ];

// what it becomes
export function useWebhooks() {
  const { data } = useSWR<Webhook[]>('/api/webhooks', fetcher);
  return data ?? [];
}
```

The exported **types are the API contract**, `Webhook`, `Provider`, `Snapshot`, `Notification`, and the rest are already the shapes the UI needs. Hand those to whoever writes the endpoints. Keep the names and the views need no edits beyond swapping a constant for a hook.

Loading and error states are the one thing the mock cannot show you: every list already has an `Empty` to render when a fetch comes back with nothing.

**Before you wire anything, read [`what-is-real.md`](what-is-real.md).** It lists every interaction that is simulated (a `setTimeout` standing in for a request) and every control that renders without a handler, so you don't spend a day connecting an endpoint to a button that was never an interaction.

### Finding a component's CSS

Styles are not colocated with components, there is one big `src/App.css` plus foundations in `src/index.css`. To find a component's rules, search for its root class:

| Component | Root class | File |
|-----------|-----------|------|
| `Panel` / `PanelHead` | `.panel`, `.panel-head` | `App.css` |
| `NavList` / `NavRow` | `.nav-list`, `.nav-row` | `App.css` |
| `Modal` / `Stepper` | `.modal`, `.stepper`, `.step` | `App.css` |
| `Popover` | `.popover`, `.popover-body`, `.popover-foot` | `App.css` |
| `Table` | `.table`, `.table-wrap` | `App.css` |
| `Figure` / `StatTiles` / `TraceBar` | `.figure`, `.kpi-tile`, `.trace` | `App.css` |
| `Segmented` | `.sgm`, `.sgm-item`, `.sgm-marker` | `index.css` |
| Buttons, chips, inputs | `.btn`, `.chip`, `.input` | `index.css` |
| Corner-tick accent | the shared `::after` selector lists | `index.css` |

Two rules that are easy to miss:

1. **The corner ticks are one recipe, declared once.** If you add an interactive element that should carry them, add its class to the selector lists in `index.css`. Do not re-declare the eight background gradients.
2. **Cascade order matters.** `index.css` loads first and holds the base; `App.css` layers on top. A component-specific override belongs in `App.css`, not in a new file.

### Adding something new without creating a one-off

Before writing markup, check whether one of these already covers it:

- A row that goes somewhere → `NavRow`, not a new `<button>` layout.
- A panel that drops open → `Popover`.
- A dialog → `Modal`, with `Stepper` if it has parts.
- Pick one of several → `Segmented`. There is exactly one appearance for this.
- Label/value pairs → `Spec`. Ranked rows → `BarList`. A headline number → `Figure`.
- Multi-select filters → `FilterPopover` + `FilterGroup` with `.chip` buttons.

If nothing fits, add the primitive to `src/components/ui/`, export it from the barrel, and give it an entry on the Components page (`/components`), that page is the live source of truth and this document mirrors it.

## Implementation checklist for agents

1. Use CSS variables for colour, space, type, radius, shadow, and motion. Never hardcode.
2. Keep corners square (`border-radius: 0` / radius tokens).
3. Put data (paths, IDs, numbers, table headers) in `.mono` at micro size.
4. Reserve `.pixel` for hero numerals / plan names only.
5. Compose views from `Panel`, `ViewToolbar`, `Table`, `Field`, `Badge`, `Segmented`, etc. Do not invent parallel primitives.
6. Buttons are `<button className="btn …">`, chips are `<button className="chip …">`.
7. Charts go through `ChartFrame` + theme constants; no inline Recharts styles.
8. Theme via `data-theme="light|dark"` on `<html>`; toggle with `useTheme`.
9. Any new card/tile grid uses `minmax(min(Npx, 100%), 1fr)`, never a bare pixel floor. See the Responsive section.
