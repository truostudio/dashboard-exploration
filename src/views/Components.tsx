import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../components/Icons';
import { Barcode } from '../components/Barcode';
import { Segmented } from '../components/Segmented';
import { SquareMeter } from '../components/SquareMeter';
import { AnimatedNumber } from '../components/AnimatedNumber';
import {
  Panel, PanelHead, TitledPanel,
  ViewToolbar, SectionHeader, SearchInput,
  Badge, MethodBadge, Dot,
  Avatar, AvatarStack,
  Spec, BarList, StatTiles, Legend, Meter, Empty,
  Table, TableFoot, RowChevron,
  CopyButton,
  Field, TextInput, Select, Form, FormActions,
  FilterPopover, FilterGroup,
} from '../components/ui';
import { chains } from '../data/mock';
import './Components.css';

/* ============================================================
   Library scaffolding
   ============================================================ */

/** Reads live token values so the page stays true in both themes. */
function useTokens(names: string[]) {
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement);
      setValues(Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(n).trim()])));
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [names.join()]);
  return values;
}

function LibSection({ id, title, note, children }: { id: string; title: string; note?: string; children: ReactNode }) {
  return (
    <section className="lib-section" id={id}>
      <div className="lib-section-head">
        <h2 className="lib-section-title">{title}</h2>
        {note && <p className="lib-section-note dim">{note}</p>}
      </div>
      {children}
    </section>
  );
}

/** One catalogued entry: name, import, live render, copyable snippet. */
function Entry({
  name,
  from,
  desc,
  props,
  code,
  children,
}: {
  name: string;
  from?: string;
  desc?: string;
  props?: [string, string][];
  code?: string;
  children?: ReactNode;
}) {
  return (
    <Panel className="lib-entry" marks={false}>
      <header className="lib-entry-head">
        <div className="lib-entry-id">
          <code className="lib-name">{name}</code>
          {from && <code className="lib-from dim">{from}</code>}
        </div>
        {code && <CopyButton value={code} copyKey={name} label="Copy" size={12} />}
      </header>
      {desc && <p className="lib-desc dim">{desc}</p>}
      {children && <div className="lib-demo">{children}</div>}
      {code && <pre className="lib-code mono">{code}</pre>}
      {props && (
        <table className="lib-props">
          <thead>
            <tr><th>Prop</th><th>Type</th></tr>
          </thead>
          <tbody>
            {props.map(([p, t]) => (
              <tr key={p}>
                <td className="mono lib-prop-name">{p}</td>
                <td className="mono dim">{t}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}

/* ============================================================
   Token data
   ============================================================ */

const COLOR_GROUPS: { label: string; tokens: string[] }[] = [
  { label: 'Brand', tokens: ['--ub-blue', '--ub-blue-ink', '--ub-blue-hover', '--ub-blue-soft', '--ub-blue-wash', '--ub-blue-border', '--ub-blue-glow', '--ub-accent-on-blue'] },
  { label: 'Ink', tokens: ['--ub-black', '--ub-black-hover', '--ub-text-2', '--ub-text-3', '--ub-white'] },
  { label: 'Surface', tokens: ['--ub-canvas', '--ub-elevated', '--ub-sunken', '--ub-grid', '--ub-hover', '--ub-hover-2'] },
  { label: 'Line', tokens: ['--ub-line', '--ub-line-strong', '--ub-border', '--ub-border-soft', '--ub-plate'] },
  { label: 'Semantic', tokens: ['--ub-success', '--ub-success-soft', '--ub-warning', '--ub-warning-soft', '--ub-danger', '--ub-danger-soft', '--ub-violet'] },
  { label: 'Overlay', tokens: ['--ub-scrim', '--ub-canvas-blur', '--ub-blueprint'] },
];

const TYPE_STYLES: { name: string; token: string; usage: string; className: string }[] = [
  { name: 'Display', token: '--fs-3xl · 48/72', usage: 'Reserved. Not currently used.', className: 'lib-t-3xl' },
  { name: 'Hero', token: '--fs-2xl · 32/48', usage: 'Hero titles, plan prices, big stats', className: 'lib-t-2xl' },
  { name: 'Page title', token: '--fs-xl · 24/36', usage: 'Topbar h1, drawer title, modal title', className: 'lib-t-xl' },
  { name: 'Panel title', token: '--fs-lg · 20/30', usage: 'Panel and section headings', className: 'lib-t-lg' },
  { name: 'Body', token: '--fs-body · 16/24', usage: 'Prose, panel subtitles, table cells', className: 'lib-t-body' },
  { name: 'Micro', token: '--fs-micro · 12/18', usage: 'ALL chrome, data, and meta', className: 'lib-t-micro' },
];

const SPACING = ['--s-1', '--s-2', '--s-3', '--s-4', '--s-5', '--s-6', '--s-7', '--s-8', '--s-9', '--s-10'];

const UTILITIES: [string, string][] = [
  ['.mono', 'Geist Mono with tabular figures. All data, paths, URLs.'],
  ['.pixel', 'Geist Pixel. Hero numerals and plan names only.'],
  ['.tnum', 'Tabular lining figures without changing the family.'],
  ['.dim', 'Tertiary ink (--ub-text-3).'],
  ['.muted', 'Secondary ink (--ub-text-2).'],
  ['.eyebrow', 'Mono uppercase overline with a blue tick.'],
  ['.marks', 'Two diagonal registration brackets.'],
  ['.marks-4', 'Four registration brackets. Default on Panel.'],
  ['.blueprint-bg', 'Faint 32px engineering grid.'],
  ['.prose', 'Caps a text block at 88ch.'],
  ['.push-right', 'margin-left: auto inside a flex row.'],
  ['.axis-mono', 'Mono face for Recharts axis labels.'],
];

const ICON_NAMES = Object.keys(Icon) as (keyof typeof Icon)[];

const BREAKPOINTS: [string, string][] = [
  ['1180px', 'Topbar search shrinks to 220px.'],
  ['1000px', 'Shell goes single-column. Sidebar becomes an off-canvas drawer behind a scrim; hamburger appears; topbar search hides.'],
  ['760px', 'Fixed-column tiles (kpi-tiles, list-row) collapse. Topbar breadcrumb/subtitle hide. Modal goes full-screen.'],
  ['560px', 'Site banner message wraps instead of truncating. Topbar "New project" label hides (icon-only). Modal/drawer/stepper edge padding tightens 24px → 20px.'],
];

/* ============================================================
   Page
   ============================================================ */

export function Components() {
  const colorTokens = useTokens(COLOR_GROUPS.flatMap((g) => g.tokens));
  const spaceTokens = useTokens(SPACING);

  const [seg, setSeg] = useState<'a' | 'b' | 'c'>('a');
  const [tab, setTab] = useState<'one' | 'two'>('one');
  const [demoCategory, setDemoCategory] = useState<string[]>(['NFT']);
  const [demoMethod, setDemoMethod] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [text, setText] = useState('0xab5801a7d398351b8be11c439e05c5b3259aec9b');
  const [sel, setSel] = useState('ethereum');
  const [page, setPage] = useState(1);

  return (
    <div className="view lib">
      <Panel className="lib-intro" marks={4}>
        <div className="lib-intro-top">
          <span className="eyebrow">Internal reference</span>
          <a
            className="btn"
            href="/component-library-handoff.md"
            download="component-library-handoff.md"
          >
            <Icon.Download size={14} />
            Download LLM handoff
          </a>
        </div>
        <h1 className="lib-title">Component library</h1>
        <p className="lib-lede muted">
          Every token, utility, icon, and component in the dashboard. Names here are the
          exact identifiers to import. Values are read live from the DOM, so this page is
          accurate in whichever theme you are viewing.
        </p>
        <div className="lib-rules">
          <div className="lib-rule">
            <span className="lib-rule-k mono">Type</span>
            <span>Sizes are multiples of 4, line-heights are 150%. All chrome is 12px.</span>
          </div>
          <div className="lib-rule">
            <span className="lib-rule-k mono">Shape</span>
            <span>Everything is square. Radius tokens exist but resolve to 0.</span>
          </div>
          <div className="lib-rule">
            <span className="lib-rule-k mono">Family</span>
            <span>Sans for controls and prose, Mono for data and meta, Pixel for hero numerals.</span>
          </div>
          <div className="lib-rule">
            <span className="lib-rule-k mono">Imports</span>
            <span><code>from '../components/ui'</code> unless noted otherwise.</span>
          </div>
        </div>
      </Panel>

      {/* ---------------- Colour ---------------- */}
      <LibSection id="colour" title="Colour" note="Token names are stable across themes; only the values flip.">
        {COLOR_GROUPS.map((group) => (
          <div key={group.label} className="lib-swatch-group">
            <h3 className="lib-sub">{group.label}</h3>
            <div className="lib-swatches">
              {group.tokens.map((token) => (
                <div key={token} className="lib-swatch">
                  <span className="lib-swatch-chip" style={{ background: `var(${token})` }} />
                  <span className="lib-swatch-text">
                    <code className="lib-swatch-name">{token}</code>
                    <code className="lib-swatch-val dim">{colorTokens[token] || '…'}</code>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </LibSection>

      {/* ---------------- Type ---------------- */}
      <LibSection id="type" title="Typography" note="Three families. Two sizes carry the entire interface.">
        <div className="lib-type-list">
          {TYPE_STYLES.map((t) => (
            <div key={t.name} className="lib-type-row">
              <div className="lib-type-meta">
                <span className="lib-type-name">{t.name}</span>
                <code className="dim">{t.token}</code>
                <span className="dim lib-type-usage">{t.usage}</span>
              </div>
              <span className={t.className}>Uniblock 0123456789</span>
            </div>
          ))}
          <div className="lib-type-row">
            <div className="lib-type-meta">
              <span className="lib-type-name">Mono</span>
              <code className="dim">--font-mono · 12/18</code>
              <span className="dim lib-type-usage">Data, paths, badges, table headers</span>
            </div>
            <span className="mono lib-t-micro">/token/balance?chain=ethereum</span>
          </div>
          <div className="lib-type-row">
            <div className="lib-type-meta">
              <span className="lib-type-name">Pixel</span>
              <code className="dim">--font-pixel</code>
              <span className="dim lib-type-usage">Hero numerals, plan names, step markers</span>
            </div>
            <span className="pixel lib-t-2xl">1,474,250</span>
          </div>
        </div>
      </LibSection>

      {/* ---------------- Space, shape, motion ---------------- */}
      <LibSection id="scale" title="Space, shape, elevation, motion">
        <div className="lib-grid-2">
          <Entry name="Spacing" desc="4pt scale. Use tokens, not literals.">
            <div className="lib-space-list">
              {SPACING.map((t) => (
                <div key={t} className="lib-space-row">
                  <code className="lib-space-name">{t}</code>
                  <code className="dim lib-space-val">{spaceTokens[t]}</code>
                  <span className="lib-space-bar" style={{ width: `var(${t})` }} />
                </div>
              ))}
            </div>
          </Entry>

          <div className="lib-stack">
            <Entry name="Radius" desc="The system is square. Tokens are kept so it can be re-rounded from one place.">
              <code className="lib-inline mono">
                --radius-xs / sm / md / lg / xl = 0px
              </code>
            </Entry>
            <Entry name="Elevation" desc="Blur for floating surfaces, hard offset for popovers.">
              <div className="lib-shadow-row">
                <span className="lib-shadow" style={{ boxShadow: 'var(--shadow-sm)' }}>sm</span>
                <span className="lib-shadow" style={{ boxShadow: 'var(--shadow-md)' }}>md</span>
                <span className="lib-shadow" style={{ boxShadow: 'var(--shadow-pop)' }}>pop</span>
                <span className="lib-shadow" style={{ boxShadow: 'var(--shadow-hard)' }}>hard</span>
              </div>
            </Entry>
            <Entry name="Motion" desc="Two curves. Marker travel is 0.34s, state changes 0.16s.">
              <code className="lib-inline mono">
                --ease-out cubic-bezier(0.16, 1, 0.3, 1)
                <br />
                --ease-io&nbsp; cubic-bezier(0.4, 0, 0.2, 1)
              </code>
            </Entry>
            <Entry name="Shell" desc="Layout constants.">
              <code className="lib-inline mono">
                --sidebar-w 240px · --ctl-h 32px · --content-max 1240px
              </code>
            </Entry>
          </div>
        </div>
      </LibSection>

      {/* ---------------- Utilities ---------------- */}
      <LibSection id="utilities" title="Utility classes">
        <table className="lib-props lib-props-wide">
          <thead><tr><th>Class</th><th>Purpose</th></tr></thead>
          <tbody>
            {UTILITIES.map(([cls, use]) => (
              <tr key={cls}>
                <td className="mono lib-prop-name">{cls}</td>
                <td className="dim">{use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </LibSection>

      {/* ---------------- Icons ---------------- */}
      <LibSection id="icons" title="Icons" note={`${ICON_NAMES.length} icons. Import { Icon } from '../components/Icons'.`}>
        <div className="lib-icons">
          {ICON_NAMES.map((name) => {
            const I = Icon[name];
            return (
              <div key={name} className="lib-icon">
                <I size={18} />
                <code className="lib-icon-name">Icon.{name}</code>
              </div>
            );
          })}
        </div>
      </LibSection>

      {/* ---------------- Surfaces ---------------- */}
      <LibSection id="surfaces" title="Surfaces">
        <Entry
          name="Panel"
          desc="Base container. Carries four registration brackets by default."
          props={[['marks', 'boolean | 4 = 4'], ['flush', 'boolean'], ['className', 'string'], ['id', 'string']]}
          code={`<Panel marks={4} flush={false}>\n  {children}\n</Panel>`}
        >
          <Panel>Panel content</Panel>
        </Entry>

        <Entry
          name="PanelHead"
          desc="Header row: eyebrow, title, subtitle, and a right-hand actions slot."
          props={[['title', 'ReactNode'], ['eyebrow', 'ReactNode'], ['sub', 'ReactNode'], ['actions', 'ReactNode'], ['inset', 'boolean']]}
          code={`<PanelHead\n  eyebrow="Last 30 days"\n  title="Total requests"\n  sub="Live snapshot."\n  actions={<button className="btn">Manage</button>}\n/>`}
        >
          <Panel marks={false}>
            <PanelHead
              eyebrow="Last 30 days"
              title="Total requests"
              sub="Live snapshot."
              actions={<button className="btn">Manage</button>}
            />
          </Panel>
        </Entry>

        <Entry
          name="TitledPanel"
          desc="Panel + PanelHead together. The common case."
          code={`<TitledPanel eyebrow="Live" title="Test an Endpoint" sub="Send a request.">\n  {children}\n</TitledPanel>`}
        >
          <TitledPanel eyebrow="Live" title="Test an Endpoint" sub="Send a request." marks={false}>
            <span className="dim">Body</span>
          </TitledPanel>
        </Entry>

        <Entry name="Empty" desc="Dashed placeholder for no-data states. bare drops the border/background for use inside a table cell. Add icon + title for the richer shape analytics charts and stat panels want when a project has no traffic yet."
          props={[['bare', 'boolean'], ['icon', 'ReactNode'], ['title', 'ReactNode']]}
          code={`<Empty>No results match your filters.</Empty>\n\n<Empty icon={<Icon.Chart size={20} />} title="No data yet">\n  Once traffic starts flowing, this chart fills in automatically.\n</Empty>`}>
          <div className="lib-stack">
            <div className="lib-row lib-row-stretch">
              <Empty>No results match your filters.</Empty>
              <Empty bare>Bare — no border or fill, for a table cell.</Empty>
            </div>
            <Empty icon={<Icon.Chart size={20} />} title="No data yet">
              Once traffic starts flowing, this chart fills in automatically.
            </Empty>
          </div>
        </Entry>
      </LibSection>

      {/* ---------------- Navigation & toolbars ---------------- */}
      <LibSection id="toolbars" title="Toolbars and navigation">
        <Entry
          name="ViewToolbar"
          desc="Bar above a view: identity left, controls right. Pass lead to replace the title block."
          props={[['title', 'ReactNode'], ['count', 'ReactNode'], ['lead', 'ReactNode'], ['className', 'string']]}
          code={`<ViewToolbar title="All providers" count="24 providers">\n  <SearchInput compact value={q} onChange={setQ} />\n</ViewToolbar>`}
        >
          <ViewToolbar title="All providers" count="24 providers">
            <SearchInput compact value={search} onChange={setSearch} placeholder="Search…" />
          </ViewToolbar>
        </Entry>

        <Entry
          name="SectionHeader"
          desc="Heading between sections of a view."
          props={[['title', 'ReactNode'], ['meta', 'ReactNode'], ['lead', 'boolean']]}
          code={`<SectionHeader lead title="Spotlight" meta="Featured integrations" />`}
        >
          <SectionHeader lead title="Spotlight" meta="Featured integrations" />
        </Entry>

        <Entry
          name="SearchInput"
          desc="compact caps at 240px; grow fills its container; hint takes the ⌘K chip."
          props={[['value', 'string'], ['onChange', '(v: string) => void'], ['placeholder', 'string'], ['compact', 'boolean'], ['grow', 'boolean'], ['hint', 'ReactNode']]}
          code={`<SearchInput compact value={q} onChange={setQ} placeholder="Search…" />`}
        >
          <SearchInput compact value={search} onChange={setSearch} placeholder="Search…" />
        </Entry>

        <Entry
          name="Segmented"
          from="../components/Segmented"
          desc="Every toggle and tab in the app. The marker travels between options; arrow keys move selection."
          props={[['options', '{ value, label }[]'], ['value', 'T'], ['onChange', '(v: T) => void'], ["variant", "'seg' | 'tab'"], ['label', 'string']]}
          code={`<Segmented\n  value={sort}\n  onChange={setSort}\n  options={[\n    { value: 'trending', label: 'Trending' },\n    { value: 'alpha', label: 'Alphabetical' },\n  ]}\n/>`}
        >
          <div className="lib-row">
            <Segmented
              value={seg}
              onChange={setSeg}
              label="Demo"
              options={[
                { value: 'a', label: 'Trending' },
                { value: 'b', label: 'Alphabetical' },
                { value: 'c', label: 'Recent' },
              ]}
            />
          </div>
          <div className="lib-row">
            <Segmented
              variant="tab"
              value={tab}
              onChange={setTab}
              label="Demo tabs"
              options={[
                { value: 'one', label: <><Icon.Chart size={15} /> Endpoints</> },
                { value: 'two', label: <><Icon.Code size={15} /> JSON-RPC</> },
              ]}
            />
          </div>
        </Entry>

        <Entry
          name="FilterPopover / FilterGroup"
          from="../components/ui/FilterPopover"
          desc="Self-contained filter trigger + dropdown. Same anchored-menu recipe as the project switcher and WebSocket provider select: relative wrapper, absolute panel, full-screen backdrop to close on outside click, Escape to close. The trigger shows an active-count badge and tints blue when anything is selected."
          props={[['activeCount', 'number = 0'], ['onClear', '() => void'], ['label', 'string = "Filters"'], ['align', "'left' | 'right' = 'left'"]]}
          code={`<FilterPopover activeCount={cat.length + method.length} onClear={clear}>\n  <FilterGroup label="Category">\n    <button className={\`chip \${on ? 'on' : ''}\`} onClick={toggle}>NFT</button>\n  </FilterGroup>\n</FilterPopover>`}
        >
          <div className="lib-row">
            <FilterPopover
              activeCount={demoCategory.length + demoMethod.length}
              onClear={() => { setDemoCategory([]); setDemoMethod([]); }}
            >
              <FilterGroup label="Category">
                {['Token', 'NFT', 'DeFi', 'Social'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`chip ${demoCategory.includes(c) ? 'on' : ''}`}
                    onClick={() => setDemoCategory((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))}
                  >
                    {c}
                  </button>
                ))}
              </FilterGroup>
              <FilterGroup label="Method">
                {['GET', 'POST', 'WS'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`chip ${demoMethod.includes(m) ? 'on' : ''}`}
                    onClick={() => setDemoMethod((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))}
                  >
                    {m}
                  </button>
                ))}
              </FilterGroup>
            </FilterPopover>
            <span className="dim">Used live on All APIs (category/method) and JSON-RPC (network kind/provider).</span>
          </div>
        </Entry>
      </LibSection>

      {/* ---------------- Indicators ---------------- */}
      <LibSection id="indicators" title="Indicators">
        <Entry
          name="Badge"
          desc="Tones: neutral, success, warning, danger, new, solid."
          props={[['tone', "'neutral' | 'success' | 'warning' | 'danger' | 'new' | 'solid'"], ['className', 'string']]}
          code={`<Badge tone="success">200 OK</Badge>`}
        >
          <div className="lib-row">
            <Badge>neutral</Badge>
            <Badge tone="success">success</Badge>
            <Badge tone="warning">warning</Badge>
            <Badge tone="danger">danger</Badge>
            <Badge tone="new">new</Badge>
            <Badge tone="solid">solid</Badge>
          </div>
        </Entry>

        <Entry name="MethodBadge" desc="HTTP method, coloured consistently wherever an endpoint is listed."
          props={[['method', "'GET' | 'POST' | 'WS'"]]}
          code={`<MethodBadge method="GET" />`}>
          <div className="lib-row">
            <MethodBadge method="GET" />
            <MethodBadge method="POST" />
            <MethodBadge method="WS" />
          </div>
        </Entry>

        <Entry name="Dot" desc="Square status marker." props={[['tone', "'ok' | 'warn'"]]} code={`<Dot tone="ok" />`}>
          <div className="lib-row">
            <Dot /> <Dot tone="ok" /> <Dot tone="warn" />
          </div>
        </Entry>

        <Entry name="Meter" desc="Horizontal progress bar." props={[['value', 'number (0-100)'], ['size', "'sm' | 'md'"], ['color', 'string']]}
          code={`<Meter value={62} />`}>
          <div className="lib-stack-sm">
            <Meter value={62} />
            <Meter value={38} size="sm" />
          </div>
        </Entry>

        <Entry name="SquareMeter" from="../components/SquareMeter"
          desc="Square ring gauge. Stroke is measured along the perimeter, so a segment's share is linear."
          props={[['segments', '{ value, color }[]'], ['value', 'string'], ['caption', 'string'], ['size', 'number = 132'], ['thickness', 'number = 10']]}
          code={`<SquareMeter\n  value="98.2%"\n  caption="2xx"\n  segments={[\n    { value: 98.2, color: 'var(--ub-blue)' },\n    { value: 1.8, color: 'var(--ub-danger)' },\n  ]}\n/>`}>
          <SquareMeter
            value="98.2%"
            caption="2xx"
            segments={[
              { value: 98.2, color: 'var(--ub-blue)' },
              { value: 1.8, color: 'var(--ub-danger)' },
            ]}
          />
        </Entry>

        <Entry name="AnimatedNumber" from="../components/AnimatedNumber"
          desc="Counts a formatted value up on mount. Respects prefers-reduced-motion."
          props={[['value', 'string'], ['duration', 'number = 1100'], ['className', 'string']]}
          code={`<AnimatedNumber value="1,474,250" />`}>
          <span className="lib-t-2xl pixel"><AnimatedNumber value="1,474,250" /></span>
        </Entry>

        <Entry name="Avatar / AvatarStack" desc="Provider and chain artwork. Falls back to a pixel monogram when no icon ships."
          props={[['src', 'string | undefined'], ['name', 'string'], ['size', "'sm' | 'md' | 'lg' | 'xl'"]]}
          code={`<Avatar src={provider.icon} name={provider.name} size="lg" />\n<AvatarStack items={chains} more="300+" />`}>
          <div className="lib-row">
            <Avatar name="Dwellir" size="sm" />
            <Avatar name="Dwellir" size="md" />
            <Avatar src={chains[1].icon} name="Ethereum" size="lg" />
            <Avatar name="Codex" size="xl" />
            <AvatarStack items={chains.slice(0, 5)} more="300+" />
          </div>
        </Entry>
      </LibSection>

      {/* ---------------- Data ---------------- */}
      <LibSection id="data" title="Data display">
        <Entry name="Spec" desc="Label/value rows in tabular mono. Keeps figures comparable across cards."
          props={[['rows', '{ label, value }[]']]}
          code={`<Spec rows={[\n  { label: 'Endpoints', value: 55 },\n  { label: 'Categories', value: 7 },\n]} />`}>
          <Spec rows={[{ label: 'Endpoints', value: 55 }, { label: 'Categories', value: 7 }]} />
        </Entry>

        <Entry name="BarList" desc="Ranked rows with a proportional bar."
          props={[['items', '{ id, label, meta?, share, value, color? }[]']]}
          code={`<BarList items={[\n  { id: 'a', label: '/token/balance', meta: '184,230 calls', share: 100, value: '100%' },\n]} />`}>
          <BarList
            items={[
              { id: 'a', label: <span className="mono">/token/balance</span>, meta: '184,230 calls', share: 100, value: '100%' },
              { id: 'b', label: <span className="mono">eth_call</span>, meta: '121,084 calls', share: 66, value: '66%' },
            ]}
          />
        </Entry>

        <Entry name="StatTiles" desc="Bordered row of figures. Pass columns for a fixed grid, omit it to flex."
          props={[['tiles', '{ id, label, value, foot? }[]'], ['columns', 'number']]}
          code={`<StatTiles columns={3} tiles={[\n  { id: 'total', label: 'Total requests', value: '1,474,250' },\n]} />`}>
          <StatTiles
            columns={3}
            tiles={[
              { id: 't', label: 'Total requests', value: '1,474,250' },
              { id: 's', label: 'Success rate', value: '99.4%' },
              { id: 'l', label: 'Avg latency', value: '38 ms' },
            ]}
          />
        </Entry>

        <Entry name="Legend" desc="Keyed list beside a meter or chart."
          props={[['items', '{ id, label, value, tone? }[]']]}
          code={`<Legend items={[{ id: '2xx', tone: 'success', label: '2xx', value: '2,367,840' }]} />`}>
          <Legend
            items={[
              { id: '2xx', tone: 'success', label: '2xx Success', value: '2,367,840' },
              { id: '4xx', tone: 'warning', label: '4xx Client error', value: '33,746' },
              { id: '5xx', tone: 'danger', label: '5xx Server error', value: '9,641' },
            ]}
          />
        </Entry>

        <Entry name="Table / TableFoot / RowChevron"
          desc="Columns are declared; rows are children. RowChevron marks a row that opens something."
          props={[['columns', '{ key, header?, align? }[]'], ['ruled', 'boolean'], ['page / pages / onChange / summary', 'TableFoot']]}
          code={`<Table columns={[{ key: 'name', header: 'Name' }, { key: 'go' }]}>\n  <tr className="row-click" onClick={open}>\n    <td className="cell-strong">Kraken</td>\n    <RowChevron />\n  </tr>\n</Table>\n<TableFoot page={p} pages={4} onChange={setP} summary="24 providers" />`}>
          <Panel flush marks={false}>
            <Table columns={[{ key: 'n', header: 'Name' }, { key: 'c', header: 'Endpoints', align: 'right' }, { key: 'go' }]}>
              <tr className="row-click">
                <td className="cell-strong">Kraken</td>
                <td className="num mono">55</td>
                <RowChevron />
              </tr>
              <tr className="row-click">
                <td className="cell-strong">Polymarket</td>
                <td className="num mono">59</td>
                <RowChevron />
              </tr>
            </Table>
            <TableFoot page={page} pages={4} onChange={setPage} summary="24 providers · 1,392 endpoints" />
          </Panel>
        </Entry>
      </LibSection>

      {/* ---------------- Forms ---------------- */}
      <LibSection id="forms" title="Forms and actions">
        <Entry name="Field / TextInput / Select / Form / FormActions"
          desc="Field wraps a labelled control. Use as='label' when it wraps a single input."
          props={[['Field', 'label, as?: label | div'], ['TextInput', 'value, onChange, placeholder?, type?'], ['Select', 'value, onChange, options, width?']]}
          code={`<Form>\n  <Field label="Endpoint URL" as="label">\n    <TextInput value={url} onChange={setUrl} placeholder="https://…" />\n  </Field>\n  <FormActions>\n    <button className="btn primary">Create</button>\n  </FormActions>\n</Form>`}>
          <Form>
            <Field label="Address" as="label">
              <TextInput value={text} onChange={setText} />
            </Field>
            <Field label="Chain" as="label">
              <Select
                value={sel}
                onChange={setSel}
                options={['ethereum', 'base', 'polygon', 'solana'].map((c) => ({ value: c, label: c }))}
              />
            </Field>
            <FormActions>
              <button className="btn primary"><Icon.Play size={13} /> Send request</button>
              <button className="btn">Cancel</button>
            </FormActions>
          </Form>
        </Entry>

        <Entry name="Buttons" desc="Plain elements, not a component. One class, five variants. Hover/focus draws the standard corner-tick accent and nothing else — no glow ring. .primary swaps the tick colour to --ub-accent-on-blue (ink in light, white in dark) since a blue tick is invisible on the blue fill."
          props={[['.btn', 'base'], ['.primary', 'brand fill'], ['.dark', 'inverted'], ['.ghost', 'transparent'], ['.danger', 'destructive'], ['.icon-only', 'square 32px'], ['.small', '28px']]}
          code={`<button className="btn primary">Send</button>\n<button className="btn ghost icon-only" aria-label="Copy"><Icon.Copy size={14} /></button>`}>
          <div className="lib-row">
            <button className="btn">Default</button>
            <button className="btn primary">Primary</button>
            <button className="btn dark">Dark</button>
            <button className="btn ghost">Ghost</button>
            <button className="btn danger">Danger</button>
            <button className="btn" disabled>Disabled</button>
            <button className="btn ghost icon-only" aria-label="Copy"><Icon.Copy size={14} /></button>
          </div>
          <p className="dim lib-hint">Hover Primary to see the corner accent switch to the on-blue token instead of brand blue.</p>
        </Entry>

        <Entry name="CopyButton / useCopy"
          desc="Clipboard with a transient confirmation. The hook keys by row so one instance serves a list."
          props={[['value', 'string'], ['copyKey', 'string'], ['label', 'string'], ['variant', "'ghost' | 'default'"], ['size', 'number']]}
          code={`<CopyButton value={endpoint.path} />\n\nconst { copy, isCopied } = useCopy();\ncopy(url, rowKey);`}>
          <div className="lib-row">
            <CopyButton value="ub_live_8f4c2a91" />
            <CopyButton value="ub_live_8f4c2a91" copyKey="labelled" label="Copy key" variant="default" size={13} />
          </div>
        </Entry>

        <Entry name="Chips" desc="Filter chips. Plain elements; .on marks the active one."
          code={`<button className={\`chip \${active ? 'on' : ''}\`}>Token</button>`}>
          <div className="lib-row">
            <button className="chip on">All</button>
            <button className="chip">Token</button>
            <button className="chip">NFT</button>
          </div>
        </Entry>
      </LibSection>

      {/* ---------------- Brand devices ---------------- */}
      <LibSection id="devices" title="Brand devices" note="Ornament with a source. These carry the product's personality; use them instead of a gradient.">
        <Entry name="Barcode" desc="A real series drawn as a tape print — dense rules with a hairline range and a heavier body. Deterministic, so the same data always draws the same band."
          props={[['values', 'number[]'], ['columns', 'number (default 88)'], ['height', 'number'], ['accentEvery', 'number'], ['className', "'on-light' on pale surfaces"]]}
          code={`<Barcode values={series} height={104} />
<Barcode values={series} className="on-light" />`}>
          <div className="lib-row" style={{ display: 'block' }}>
            <Barcode values={Array.from({ length: 30 }, (_, i) => Math.sin(i / 3) * 40 + 60)} height={72} className="on-light" />
          </div>
        </Entry>
        <Entry name="btn-blk" desc="Boxed mono action. Square, hairline, mono label — a stamped tag rather than a rounded UI button. Pairs with the inverted hero."
          props={[['.is-solid', 'filled primary'], ['.is-bare', 'underlined tertiary'], ['.on-light', 'for pale surfaces']]}
          code={`<button className="btn-blk on-light is-solid">Run</button>
<button className="btn-blk on-light">Open docs</button>`}>
          <div className="lib-row">
            <button className="btn-blk on-light is-solid">Run sample request</button>
            <button className="btn-blk on-light">Open docs</button>
            <button className="btn-blk on-light is-bare">Migrating?</button>
          </div>
        </Entry>
      </LibSection>

      {/* ---------------- Charts ---------------- */}
      <LibSection id="charts" title="Charts" note="Import from '../components/ui/Chart'. Never pass Recharts inline style objects; they escape the CSS system.">
        <Entry name="ChartFrame" desc="Plot wrapper. Replaces a raw ResponsiveContainer."
          props={[['height', 'number'], ['children', 'ReactElement']]}
          code={`<ChartFrame height={240}>\n  <AreaChart data={rows}>…</AreaChart>\n</ChartFrame>`} />
        <Entry name="ChartTooltip" desc="Terminal readout. Real DOM, so it inherits square edges and both themes."
          props={[['labelFormatter', '(l) => ReactNode'], ['valueFormatter', '(v) => ReactNode']]}
          code={`<Tooltip\n  cursor={chartCursor}\n  content={<ChartTooltip valueFormatter={(v) => \`\${v} ms\`} />}\n/>`} />
        <Entry name="Theme constants" desc="Spread these onto Recharts primitives."
          props={[['chartAxis', 'XAxis / YAxis props'], ['chartAxisLine', 'axisLine prop'], ['chartGrid', 'CartesianGrid props'], ['chartCursor', 'crosshair for line/area'], ['chartBarCursor', 'band for bar charts']]}
          code={`<XAxis dataKey="label" {...chartAxis} axisLine={chartAxisLine} />\n<CartesianGrid {...chartGrid} />`} />
        <Entry name="timeAxis / valueAxis" desc="The whole axis for a time-bucketed chart, prefilled. Prop bundles rather than components, because Recharts finds its axes by scanning children and a wrapper hides them."
          props={[['timeAxis(buckets, gap?)', 'XAxis props, keyed on label'], ['valueAxis(width, format)', 'YAxis props']]}
          code={`<XAxis {...timeAxis(labels.length)} />\n<YAxis {...valueAxis(48, fmtCompact)} />`} />
      </LibSection>

      {/* ---------------- Responsive ---------------- */}
      <LibSection id="responsive" title="Responsive" note="Mobile-first overrides layered on a desktop base. Max-width media queries only.">
        <table className="lib-props lib-props-wide">
          <thead><tr><th>Breakpoint</th><th>Behaviour</th></tr></thead>
          <tbody>
            {BREAKPOINTS.map(([bp, behaviour]) => (
              <tr key={bp}>
                <td className="mono lib-prop-name">{bp}</td>
                <td className="dim">{behaviour}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Entry name="Overflow-safe grid" desc="Every auto-fit/auto-fill card grid wraps its pixel floor in min(…, 100%). A bare pixel floor forces that column width even when the viewport is narrower, overflowing the page. Applies to bento, explore-grid, qs-grid, unified-grid, prov-direct-grid, settings-grid, plans-grid, chain-grid, prov-grid, and the library's own swatch/icon grids."
          code={`/* Wrong: overflows below 340px */\ngrid-template-columns: repeat(auto-fit, minmax(340px, 1fr));\n\n/* Right: caps the floor at the available width */\ngrid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr));`} />

        <Entry name="Other conventions" desc="Reuse these instead of inventing new mobile behaviour.">
          <ul className="lib-resp-list">
            <li>Tables scroll horizontally via <code className="mono">.table-wrap {'{'} overflow-x: auto {'}'}</code> — columns never stack.</li>
            <li>Toolbar rows (<code className="mono">.ep-controls</code>, <code className="mono">.composer-row</code>, <code className="mono">.picker-head</code>) are <code className="mono">flex-wrap: wrap</code> with a <code className="mono">min-width</code> on fixed children.</li>
            <li>Modals and drawers size with <code className="mono">width: min(Npx, 100%)</code>, never a bare pixel width.</li>
            <li>Don't truncate (<code className="mono">text-overflow: ellipsis</code>) a string that hides an interactive element — wrap it instead, as the site banner message does under 560px.</li>
          </ul>
        </Entry>
      </LibSection>

      {/* ---------------- App-level ---------------- */}
      <LibSection id="shell" title="Shell and composites" note="Rendered by App, not composed inside a view.">
        <div className="lib-grid-2">
          <Entry name="Sidebar" from="../components/Sidebar"
            desc="Left rail. Owns the travelling active marker, project switcher, quickstart card, and plan footer."
            props={[['view', 'ViewId'], ['onNavigate', '(id) => void'], ['onNewProject', '() => void'], ['quickstartProgress', '{ done, total }'], ['open', 'boolean']]} />
          <Entry name="Topbar" from="../components/Topbar"
            desc="Sticky header: breadcrumb, title, search, theme toggle, actions. The New project label collapses to icon-only under 560px."
            props={[['section', 'string'], ['title', 'string'], ['subtitle', 'string'], ['theme', "'light' | 'dark'"], ['onToggleTheme', '() => void'], ['onMenu', '() => void'], ['primaryAction', '{ label, onClick } | undefined']]} />
          <Entry name="SiteBanner" from="../components/SiteBanner"
            desc="Terminal-style sitewide notice above the topbar. Mono readout with registration marks; dismiss persists in localStorage until the banner id changes."
            props={[['onNavigate', '(id: ViewId) => void']]} />
          <Entry name="EndpointDrawer" from="../components/EndpointDrawer"
            desc="Right slide-over catalogue. Direct sources show copy affordances; unified sources show chain coverage."
            props={[['source', 'DrawerSource | null'], ['onClose', '() => void']]} />
          <Entry name="GetStarted" from="../components/GetStarted"
            desc="Onboarding checklist on Overview."
            props={[['steps', 'Step[]'], ['onNavigate', '(id) => void'], ['onDismiss', '() => void']]} />
          <Entry name="NewProject" from="../views/NewProject"
            desc="Four-step creation modal: project, chains, providers, capabilities."
            props={[['open', 'boolean'], ['onClose', '() => void']]} />
          <Entry name="useTheme" from="../theme"
            desc="Resolves and persists the theme. Follows the OS until an explicit choice is made."
            props={[['returns', '{ theme, toggleTheme }']]}
            code={`const { theme, toggleTheme } = useTheme();`} />
        </div>
      </LibSection>
    </div>
  );
}
