# Uniblock Dashboard — Component Library Handoff

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
| **No inline Recharts styles** | Never pass style objects to Recharts primitives — they escape the CSS/token system. Use the chart theme constants below. |
| **Tokens over literals** | Spacing, colour, type, and elevation come from CSS variables. Do not hardcode hex/px for those. |

---

## Design tokens

Token **names** are stable across themes. Only values flip under `:root[data-theme='dark']`.

### Colour

#### Brand (locked — blue does not flip; only ink/soft variants do)

| Token | Light | Dark |
|-------|-------|------|
| `--ub-blue` | `#1FB6FF` | *(unchanged)* |
| `--ub-blue-ink` | `#0089cc` | `#5CC8FF` |
| `--ub-blue-hover` | `#0FA9F5` | `#45C1FF` |
| `--ub-blue-soft` | `rgba(31, 182, 255, 0.10)` | `rgba(31, 182, 255, 0.14)` |
| `--ub-blue-wash` | `rgba(31, 182, 255, 0.05)` | `rgba(31, 182, 255, 0.07)` |
| `--ub-blue-border` | `rgba(31, 182, 255, 0.38)` | `rgba(31, 182, 255, 0.32)` |
| `--ub-blue-glow` | `rgba(31, 182, 255, 0.22)` | `rgba(31, 182, 255, 0.26)` |
| `--ub-accent-on-blue` | `var(--ub-black)` | `#FFFFFF` |

`--ub-accent-on-blue` exists because the corner-tick accent (see Buttons, below) uses `--ub-blue` on every surface except `.primary` itself — a blue tick is invisible on a blue fill, so `.primary` swaps to this token instead.

#### Ink

`--ub-black` is “text”. `--ub-white` is “the surface text sits on when inverted” (solid chips, dark buttons). Both flip in dark mode.

| Token | Light | Dark |
|-------|-------|------|
| `--ub-black` | `#0B0C0E` | `#F2F4F7` |
| `--ub-black-hover` | `#23262B` | `#DDE1E7` |
| `--ub-text-2` | `#4B525B` | `#A3ACB7` |
| `--ub-text-3` | `#838B95` | `#737C87` |
| `--ub-white` | `#FFFFFF` | `#0B0C0E` |

#### Surface

| Token | Light | Dark |
|-------|-------|------|
| `--ub-canvas` | `#F5F6F8` | `#0B0C0E` |
| `--ub-elevated` | `#FFFFFF` | `#141619` |
| `--ub-sunken` | `#FAFBFC` | `#101215` |
| `--ub-grid` | `#F1F3F5` | `#1C1F24` |
| `--ub-hover` | `rgba(11, 12, 14, 0.04)` | `rgba(255, 255, 255, 0.05)` |
| `--ub-hover-2` | `rgba(11, 12, 14, 0.07)` | `rgba(255, 255, 255, 0.09)` |

#### Line

| Token | Light | Dark |
|-------|-------|------|
| `--ub-line` | `rgba(11, 12, 14, 0.08)` | `rgba(255, 255, 255, 0.09)` |
| `--ub-line-strong` | `rgba(11, 12, 14, 0.16)` | `rgba(255, 255, 255, 0.16)` |
| `--ub-border` | `#C7CCD2` | `#3C434C` |
| `--ub-border-soft` | `#DEE2E7` | `#272C33` |
| `--ub-plate` | `transparent` | `rgba(255, 255, 255, 0.14)` |

#### Semantic

| Token | Light | Dark |
|-------|-------|------|
| `--ub-success` | `#12885A` | `#35C77E` |
| `--ub-success-soft` | `rgba(18, 136, 90, 0.10)` | `rgba(53, 199, 126, 0.14)` |
| `--ub-warning` | `#B45309` | `#E8A33C` |
| `--ub-warning-soft` | `rgba(180, 83, 9, 0.10)` | `rgba(232, 163, 60, 0.14)` |
| `--ub-danger` | `#D92D20` | `#FF6B60` |
| `--ub-danger-soft` | `rgba(217, 45, 32, 0.10)` | `rgba(255, 107, 96, 0.14)` |
| `--ub-violet` | `#7C5CFF` | `#9E86FF` |

#### Overlay

| Token | Light | Dark |
|-------|-------|------|
| `--ub-scrim` | `rgba(11, 12, 14, 0.45)` | `rgba(0, 0, 0, 0.66)` |
| `--ub-canvas-blur` | `rgba(245, 246, 248, 0.82)` | `rgba(11, 12, 14, 0.82)` |
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
| `--shadow-hard` | Popovers — hard offset, no blur, crisp edges |

### Motion

| Token | Value | Use |
|-------|-------|-----|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Marker travel (~0.34s) |
| `--ease-io` | `cubic-bezier(0.4, 0, 0.2, 1)` | State changes (~0.16s) |

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

Usage: `<Icon.Name size={16} />` (default size varies by icon; most chrome icons are 16).

**Catalogue:** `Logo`, `Grid`, `Chart`, `Image`, `Coin`, `Tx`, `Defi`, `Social`, `Send`, `Prediction`, `Stablecoin`, `Code`, `Webhook`, `Beaker`, `Folder`, `Users`, `Card`, `Menu`, `Search`, `Plus`, `Chevron`, `ChevronDown`, `Sun`, `Moon`, `Bell`, `Copy`, `Eye`, `Check`, `X`, `Key`, `Play`, `Trash`, `Refresh`, `External`, `Mail`, `Download`, `Settings`, `Filter`

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

#### `Empty`

Dashed placeholder for no-data states. `bare` drops the border/background for use inside a table cell. Add `icon` + `title` for the richer shape analytics charts and stat panels want when a project has no traffic yet — icon and title stack above the description instead of one centred line.

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

#### `FilterPopover` / `FilterGroup`

**From:** `../components/ui/FilterPopover`

Self-contained filter trigger + dropdown. Same anchored-menu recipe as the project switcher and WebSocket provider select: a `position: relative` wrapper, an absolutely positioned panel, and a full-screen transparent backdrop that closes it on outside click. Escape also closes it. The trigger shows an active-count badge and tints blue when anything is selected. `FilterGroup` is a labelled row of chip toggles inside the popover body — compose the actual filter state (which chips are active) in the parent view; the popover only owns its own open/closed state.

| Prop (`FilterPopover`) | Type |
|------|------|
| `activeCount` | `number = 0` — drives the badge and enables "Clear filters" |
| `onClear` | `() => void` |
| `label` | `string = "Filters"` |
| `align` | `'left' \| 'right' = 'left'` |

| Prop (`FilterGroup`) | Type |
|------|------|
| `label` | `string` |
| `children` | `ReactNode` — chip buttons |

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

**Stacking note:** the entrance-animation classes (`.rise`) apply a `transform`, and `animation-fill-mode: forwards` keeps that transform applied forever — which means any `.rise` element permanently owns its own stacking context, no matter how high a z-index something nested inside it has. `.view-toolbar` (where the trigger usually lives) is given `position: relative; z-index: 5` for exactly this reason, so its whole subtree — popover included — paints above sibling `Panel`s in the same `.view` flex column. If you anchor a popover trigger somewhere else, give that ancestor an explicit `z-index` too rather than raising the popover's own.

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

Hover/focus draws the same corner-tick accent every other interactive surface uses (see `.marks` / corner accents in Utility classes), nothing more — no glow ring. `.primary` is the one exception that needs a colour override: on a `--ub-blue` fill, a `--ub-blue` tick disappears, so `.btn.primary::after` swaps the tick colour to `--ub-accent-on-blue` (near-black ink in light mode, pure white in dark mode) so it always reads against the fill.

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

#### `Sidebar` — `../components/Sidebar`

Left rail. Owns the travelling active marker, project switcher, quickstart card, and plan footer.

| Prop | Type |
|------|------|
| `view` | `ViewId` |
| `onNavigate` | `(id) => void` |
| `onNewProject` | `() => void` |
| `quickstartProgress` | `{ done, total }` |
| `open` | `boolean` |

#### `Topbar` — `../components/Topbar`

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

#### `SiteBanner` — `../components/SiteBanner`

Terminal-style sitewide notice rendered above the `Topbar`, inside `.main-col` so it persists across every view. Mono readout with the same registration-mark treatment as `.chart-tip`; dismiss persists in `localStorage` under `ub-banner:<id>` until the id changes (bump the id when the copy changes so a prior dismiss doesn't hide the new announcement).

| Prop | Type |
|------|------|
| `onNavigate` | `(id: ViewId) => void` |

```tsx
<SiteBanner onNavigate={navigate} />
```

#### `EndpointDrawer` — `../components/EndpointDrawer`

Right slide-over catalogue. Direct sources show copy affordances; unified sources show chain coverage.

| Prop | Type |
|------|------|
| `source` | `DrawerSource \| null` |
| `onClose` | `() => void` |

#### `GetStarted` — `../components/GetStarted`

Onboarding checklist on Overview.

| Prop | Type |
|------|------|
| `steps` | `Step[]` |
| `onNavigate` | `(id) => void` |
| `onDismiss` | `() => void` |

#### `NewProject` — `../views/NewProject`

Four-step creation modal: project, chains, providers, capabilities.

| Prop | Type |
|------|------|
| `open` | `boolean` |
| `onClose` | `() => void` |

#### `useTheme` — `../theme`

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

**Grid overflow rule:** any `repeat(auto-fit/auto-fill, minmax(Npx, 1fr))` card grid must use `minmax(min(Npx, 100%), 1fr)` instead of a bare `Npx` lower bound. A bare pixel floor forces that track width even when the viewport is narrower than it, which overflows the page horizontally on small phones. Wrapping it in `min(Npx, 100%)` caps the floor at whatever width is actually available, so the grid always degrades to a single column instead of overflowing. Every card grid in this app (`bento`, `explore-grid`, `qs-grid`, `unified-grid`, `prov-direct-grid`, `settings-grid`, `plans-grid`, `chain-grid`, `prov-grid`, and the Components library's own swatch/icon grids) follows this rule — copy it for any new grid.

Other responsive conventions already in place and worth reusing:

- Tables never wrap their own columns; they scroll horizontally via `.table-wrap { overflow-x: auto }`. Don't try to make table columns stack on mobile.
- Toolbar rows (`ViewToolbar`'s `.ep-controls`, `.composer-row`, `.picker-head`) are `flex-wrap: wrap` by default, with fixed-width children given a `min-width` so they wrap onto their own line instead of squeezing.
- Modals/drawers size with `width: min(Npx, 100%)`, not a bare pixel width, so they never exceed the viewport.
- Text that must not push a layout wide (crumbs, table cell URLs, chip labels) gets `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` — but only when truncation doesn't hide an interactive element. If a truncated string would hide a link or button (as the site banner's message could), wrap instead of truncating.

---

## Implementation checklist for agents

1. Use CSS variables for colour, space, type, radius, shadow, and motion — never hardcode.
2. Keep corners square (`border-radius: 0` / radius tokens).
3. Put data (paths, IDs, numbers, table headers) in `.mono` at micro size.
4. Reserve `.pixel` for hero numerals / plan names only.
5. Compose views from `Panel`, `ViewToolbar`, `Table`, `Field`, `Badge`, `Segmented`, etc. — do not invent parallel primitives.
6. Buttons are `<button className="btn …">`, chips are `<button className="chip …">`.
7. Charts go through `ChartFrame` + theme constants; no inline Recharts styles.
8. Theme via `data-theme="light|dark"` on `<html>`; toggle with `useTheme`.
9. Any new card/tile grid uses `minmax(min(Npx, 100%), 1fr)`, never a bare pixel floor — see Responsive section.
