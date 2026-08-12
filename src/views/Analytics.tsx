import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import {
  Area, AreaChart, Bar, BarChart, Line, LineChart, CartesianGrid, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Icon } from '../components/Icons';
import { SquareMeter } from '../components/SquareMeter';
import { Segmented } from '../components/Segmented';
import {
  TitledPanel, Panel, Badge, MethodBadge, BarList, StatTiles, Legend, Meter, Delta, Avatar,
  Table, Select, Spec, Num, Sparkline, SearchInput, FilterPopover, Empty, TraceBar,
} from '../components/ui';
import type { Sort } from '../components/ui';
import {
  ChartFrame, ChartTooltip, chartAxis, chartAxisLine, chartGrid, chartCursor, chartBarCursor,
  chartRefLine, timeAxis, valueAxis,
} from '../components/ui/Chart';
import type { SeriesDef } from '../components/ui/Chart';
import {
  analytics, ranges, rangeMeta, trafficChains, SURFACES,
  fmtCompact, fmtCount, fmtMoney, fmtPct, fmtMs,
} from '../data/analytics';
import type {
  RangeId, ChainFilter, Snapshot, EndpointStat, EndpointSort, SurfaceId,
} from '../data/analytics';

/**
 * Named after the question, not the subsystem. The old set had seven tabs
 * organised around Uniblock's architecture. Latency, Errors, Compute, so
 * "which endpoint is costing me money" lived under a noun the user does not
 * think in. Latency and Errors are both "is it healthy", and JSON-RPC and
 * WebSockets are both "how is this protocol behaving", so each pair is one tab.
 *
 * Not folded down to four: collapsing the protocol tabs into a surface filter
 * would have dropped the batch-request and socket-lifecycle panels, which have
 * no home anywhere else. Five tabs that keep every panel beats four that lose
 * two.
 */
const tabs = ['Endpoints', 'Providers', 'Reliability', 'Usage & cost', 'Protocols'] as const;
type Tab = (typeof tabs)[number];

const tabIcons: Record<Tab, keyof typeof Icon> = {
  Endpoints: 'Chart',
  Providers: 'Route',
  Reliability: 'Alert',
  'Usage & cost': 'Coin',
  Protocols: 'Code',
};

/* Categorical palette, anchored on the Uniblock blue. Blue is reserved for the
   Uniblock path: the served request, the won provider, the single invoice. */
const C = {
  blue: 'var(--ub-blue)',
  violet: 'var(--ub-violet)',
  success: 'var(--ub-success)',
  border: 'var(--ub-border)',
  warning: 'var(--ub-warning)',
  danger: 'var(--ub-danger)',
} as const;

/* ============================================================
   Shared bits
   ============================================================ */

/**
 * Figure + delta + caption, the unit every tab's header row is built from.
 * A `StatTile` factory rather than a component: `StatTiles` takes data, not
 * children, and a lowercase name keeps it out of React's component namespace.
 */
function kpi({
  label,
  value,
  delta,
  since,
  foot,
}: {
  label: ReactNode;
  value: ReactNode;
  delta?: { pct: number; good: boolean };
  since?: string;
  foot?: ReactNode;
}) {
  const hasFoot = Boolean(delta || foot);
  return {
    id: String(label),
    label,
    value,
    foot: hasFoot ? (
      <>
        {delta && <Delta pct={delta.pct} good={delta.good} since={since} />}
        {foot}
      </>
    ) : undefined,
  };
}

function ProviderCell({ name, icon }: { name: string; icon: string }) {
  return (
    <span className="prov-name">
      <Avatar src={icon} name={name} size="sm" />
      {name}
    </span>
  );
}

function ChainCell({ name, icon }: { name: string; icon?: string }) {
  return (
    <span className="prov-name">
      <Avatar src={icon} name={name} size="sm" />
      {name}
    </span>
  );
}

/* ============================================================
   Endpoint table + drill-down
   ============================================================ */

/**
 * Volume chart for an expanded row. Sized to sit level with the spec list.
 * It lives in a half-width column, so it needs a wider tick gap than a
 * full-width chart at the same bucket count or the labels run together.
 */
function Spark({ data }: { data: { label: string; calls: number }[] }) {
  return (
    <div className="ep-spark">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="epSpark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.blue} stopOpacity={0.26} />
              <stop offset="100%" stopColor={C.blue} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid {...chartGrid} />
          {/* Crowded at every bucket count, hence the 0 threshold. */}
          <XAxis {...timeAxis(data.length, 40, 0)} />
          <YAxis {...valueAxis(44, fmtCompact)} />
          <Tooltip
            content={<ChartTooltip valueFormatter={(v) => `${fmtCount(Number(v))} calls`} />}
            cursor={chartCursor}
          />
          <Area
            type="monotone"
            dataKey="calls"
            stroke={C.blue}
            strokeWidth={2}
            fill="url(#epSpark)"
            name="Calls"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** A labelled split inside the drill-down. Three of these sit side by side. */
function SplitBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="ep-split">
      <h4 className="ep-split-title">{title}</h4>
      {children}
    </div>
  );
}

function EndpointDetail({ e }: { e: EndpointStat }) {
  return (
    <div className="ep-detail">
      {e.pinned && (
        <div className="claim-inline is-top">
          <Icon.Alert size={16} className="claim-icon is-warn" />
          <span>
            Direct endpoint. You named <strong>{e.pinned}</strong> in the path, so there is nothing
            to score and nothing to fail over to. If {e.pinned} is down, these calls fail.
          </span>
        </div>
      )}

      <div className="ep-detail-head">
        <Spec
          rows={[
            { label: 'Surface', value: SURFACES.find((s) => s.id === e.surface)?.label },
            { label: 'Calls', value: fmtCount(e.calls) },
            { label: 'Share of window', value: fmtPct(e.share, 1) },
            { label: 'CU per call', value: e.cuPerCall },
            { label: 'CU total', value: fmtCompact(e.cu) },
            { label: 'Cost', value: fmtMoney(e.cost) },
            { label: 'Errors', value: `${fmtCount(e.errors)} (${fmtPct(e.errorRate, 2)})` },
            { label: 'p50 / p95 / p99', value: `${e.p50} / ${e.p95} / ${e.p99} ms` },
          ]}
        />
        <div className="ep-spark-wrap">
          <span className="ep-split-title">Volume over the window</span>
          <Spark data={e.spark} />
        </div>
      </div>

      <div className="ep-splits">
        <SplitBlock title="By chain">
          <BarList
            items={e.byChain.map((c) => ({
              id: c.id,
              label: <ChainCell name={c.name} icon={c.icon} />,
              share: (c.calls / e.byChain[0].calls) * 100,
              value: fmtCompact(c.calls),
            }))}
          />
        </SplitBlock>
        <SplitBlock title={e.pinned ? 'Provider' : 'By provider'}>
          <BarList
            items={e.byProvider.map((p) => ({
              id: p.id,
              label: <ProviderCell name={p.name} icon={p.icon} />,
              share: (p.calls / e.byProvider[0].calls) * 100,
              value: fmtCompact(p.calls),
            }))}
          />
        </SplitBlock>
        <SplitBlock title="By status">
          <Legend
            items={e.byStatus.map((s) => ({
              id: s.code,
              tone: s.tone,
              label: <>{s.code} <span className="dim">{s.label}</span></>,
              value: fmtCount(s.count),
            }))}
          />
        </SplitBlock>
      </div>
    </div>
  );
}

type EpKey = EndpointSort | 'endpoint' | 'trend' | 'chev';

/**
 * `optional: false` columns are the ones the catalogue is unreadable without,
 * so they are not offered to the chooser at all, a column picker that lets you
 * hide the endpoint name is a picker that can break its own table.
 */
const epColumns: {
  key: EpKey;
  header: string;
  align?: 'right';
  sortable?: boolean;
  optional?: boolean;
}[] = [
  { key: 'endpoint', header: 'Endpoint' },
  { key: 'calls', header: 'Calls', align: 'right', sortable: true },
  { key: 'trend', header: 'Trend', optional: true },
  { key: 'share', header: 'Share', align: 'right', sortable: true, optional: true },
  { key: 'cu', header: 'CU', align: 'right', sortable: true },
  { key: 'errorRate', header: 'Error %', align: 'right', sortable: true, optional: true },
  { key: 'p95', header: 'p95', align: 'right', sortable: true, optional: true },
  { key: 'chev', header: '' },
];

const OPTIONAL_COLUMNS = epColumns.filter((c) => c.optional).map((c) => c.key);

/**
 * Single-open accordion with real enter *and* exit transitions.
 *
 * The row being replaced stays mounted until its collapse finishes, which is
 * the whole point: unmounting it the instant another row opens is what makes
 * the table chop. `expanded` trails `open` by a frame because a row mounted
 * straight into its open state gives the browser no start value to animate
 * from, and it would snap to full height.
 */
function useAccordion() {
  const [open, setOpen] = useState<string | null>(null);
  const [closing, setClosing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (open === null) return;
    const id = requestAnimationFrame(() => setExpanded(open));
    return () => cancelAnimationFrame(id);
  }, [open]);

  const toggle = (id: string) => {
    setExpanded(null);
    setOpen((current) => {
      setClosing(current);
      return current === id ? null : id;
    });
  };

  /** Drops the collapsed row once it has finished animating out. */
  const settle = (id: string) => setClosing((c) => (c === id ? null : c));

  /**
   * Backstop for the collapse. `transitionend` is the normal path, but a row
   * that is filtered out mid-collapse unmounts before it fires and comes back
   * already at 0fr, no transition, no event, and the row stays mounted at
   * zero height forever. A timer just past the transition length closes that
   * hole without slowing the common case, which still settles on the event.
   */
  useEffect(() => {
    if (closing === null) return;
    const id = window.setTimeout(() => setClosing(null), 400);
    return () => window.clearTimeout(id);
  }, [closing]);

  return { open, closing, expanded, toggle, settle };
}

function EndpointTable({
  a,
  onHoverSurface,
  focusEndpoint,
  onFocusHandled,
}: {
  a: Snapshot;
  /** Lets the chart above dim every band except the hovered row's surface. */
  onHoverSurface?: (s: SurfaceId | null) => void;
  /** Endpoint the command palette asked for. Opened and scrolled into view. */
  focusEndpoint?: string | null;
  onFocusHandled?: () => void;
}) {
  const [sort, setSort] = useState<Sort>({ key: 'calls', dir: 'desc' });
  const { open, closing, expanded, toggle, settle } = useAccordion();
  const [unit, setUnit] = useState<'cu' | 'cost'>('cu');
  const [surface, setSurface] = useState<SurfaceId | 'all'>('all');
  const [query, setQuery] = useState('');
  const [dense, setDense] = useState(false);
  const [hidden, setHidden] = useState<EpKey[]>([]);
  const bodyRef = useRef<HTMLTableSectionElement>(null);

  // Opening a row and flipping the cost unit both re-render the table without
  // changing what is in it, so the filter, the sort, and the footer totals hang
  // off the three things that actually decide them.
  const { rows, shown, shownCu } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = a.endpoints
      .filter((e) => surface === 'all' || e.surface === surface)
      .filter((e) => q === '' || e.name.toLowerCase().includes(q) || e.method.toLowerCase() === q)
      .sort((x, y) => {
        const k = sort.key as EndpointSort;
        const d = (y[k] as number) - (x[k] as number);
        return sort.dir === 'desc' ? d : -d;
      });
    return {
      rows: list,
      shown: list.reduce((s, e) => s + e.calls, 0),
      shownCu: list.reduce((s, e) => s + e.cu, 0),
    };
  }, [a, surface, sort, query]);

  // Clicking the active column flips it; a new column starts descending, which
  // is what you want every time for "which is biggest".
  const onSort = (key: string) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' }));

  const columns = epColumns
    .filter((c) => !hidden.includes(c.key))
    .map((c) => (c.key === 'cu' ? { ...c, header: unit === 'cu' ? 'CU' : 'Cost' } : c));
  const show = (key: EpKey) => !hidden.includes(key);

  /**
   * A palette hit has to survive the filters that were left set. Clearing them
   * is the honest move: silently landing on an empty table because the row is
   * filtered out looks like the search failed.
   */
  /**
   * A palette hit has to survive the filters that were left set. Clearing them
   * is the honest move: silently landing on an empty table because the row is
   * filtered out looks like the search failed.
   *
   * The state half runs during render, not in an effect, so the row is already
   * open on the first paint after the jump. Only the scroll waits for an
   * effect, since it needs the row in the DOM to scroll to.
   */
  // Seeded null, not with the prop: the palette navigates here, so this
  // component mounts with the request already in hand. Seeding from the prop
  // makes the first comparison equal and swallows the very jump that
  // mounted it.
  const [lastFocus, setLastFocus] = useState<string | null | undefined>(null);
  if (lastFocus !== focusEndpoint) {
    setLastFocus(focusEndpoint);
    if (focusEndpoint) {
      setQuery('');
      setSurface('all');
      if (open !== focusEndpoint) toggle(focusEndpoint);
    }
  }

  useEffect(() => {
    if (!focusEndpoint) return;
    const id = window.setTimeout(() => {
      bodyRef.current
        ?.querySelector(`[data-endpoint="${CSS.escape(focusEndpoint)}"]`)
        ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      onFocusHandled?.();
    }, 60);
    return () => window.clearTimeout(id);
  }, [focusEndpoint, onFocusHandled]);

  /**
   * Roving focus over the rows. The table is the densest thing on the page and
   * the one people scan hardest, so it gets the keyboard model a list deserves:
   * j/k and the arrows to move, enter/space to open, escape to close.
   *
   * Focus moves by walking the rendered rows rather than by index into `rows`,
   * because an open drill-down sits between two of them in the DOM and index
   * arithmetic would land on it.
   */
  const onRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, name: string) => {
    const { key } = event;
    const step = key === 'ArrowDown' || key === 'j' ? 1 : key === 'ArrowUp' || key === 'k' ? -1 : 0;
    if (step !== 0) {
      event.preventDefault();
      const all = [...(bodyRef.current?.querySelectorAll<HTMLTableRowElement>('tr.row-click') ?? [])];
      const next = all[all.indexOf(event.currentTarget) + step];
      next?.focus();
      return;
    }
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      toggle(name);
      return;
    }
    if (key === 'Escape' && open === name) {
      event.preventDefault();
      toggle(name);
    }
  };

  return (
    <TitledPanel
      title="Endpoint calls"
      sub="Sort by any column. Open a row for its chain, provider, and status breakdown."
      flush
      actions={
        <Segmented
          label="Cost unit"
          value={unit}
          onChange={setUnit}
          options={[
            { value: 'cu' as const, label: 'CU' },
            { value: 'cost' as const, label: '$' },
          ]}
        />
      }
    >
      <div className="ep-filter">
        {/* Search sits first and widest. At nineteen rows the segmented control
            is enough; at the few hundred a real project carries, typing the
            path is the only way anyone finds anything. */}
        <SearchInput
          compact
          value={query}
          onChange={setQuery}
          placeholder="Filter endpoints…"
        />
        <Segmented
          label="Request surface"
          value={surface}
          onChange={setSurface}
          options={[
            { value: 'all' as const, label: 'All surfaces' },
            ...SURFACES.map((s) => ({ value: s.id, label: s.label })),
          ]}
        />
        <div className="ep-filter-end">
          <FilterPopover
            label="Columns"
            align="right"
            activeCount={hidden.length}
            onClear={hidden.length ? () => setHidden([]) : undefined}
          >
            <div className="filter-pop-group">
              <span className="filter-pop-label">Show</span>
              {OPTIONAL_COLUMNS.map((key) => {
                const col = epColumns.find((c) => c.key === key);
                return (
                  <label key={key} className="check-row">
                    <input
                      type="checkbox"
                      checked={show(key)}
                      onChange={() =>
                        setHidden((h) => (h.includes(key) ? h.filter((k) => k !== key) : [...h, key]))
                      }
                    />
                    <span>{col?.key === 'cu' ? (unit === 'cu' ? 'CU' : 'Cost') : col?.header}</span>
                  </label>
                );
              })}
            </div>
          </FilterPopover>
          <Segmented
            label="Row density"
            value={dense ? 'dense' : 'roomy'}
            onChange={(v) => setDense(v === 'dense')}
            options={[
              { value: 'roomy' as const, label: 'Roomy' },
              { value: 'dense' as const, label: 'Dense' },
            ]}
          />
        </div>
      </div>

      {/* The filter can empty this table, and a bare header row over nothing
          reads as a broken page rather than a search with no hits. */}
      {rows.length === 0 ? (
        <Empty bare icon={<Icon.Search size={20} />} title="No endpoint matches">
          {query.trim() ? (
            <>
              Nothing matches <span className="mono">{query.trim()}</span>
              {surface !== 'all' && ' on this surface'}.
            </>
          ) : (
            <>No endpoint on this surface carried traffic in this window.</>
          )}
        </Empty>
      ) : (
      <Table
        ruled
        columns={columns}
        sort={sort}
        onSort={onSort}
        bodyRef={bodyRef}
        className={dense ? 'is-dense' : undefined}
      >
        {rows.map((e) => {
          const isOpen = open === e.name;
          const mounted = isOpen || closing === e.name;
          return [
            <tr
              key={e.name}
              data-endpoint={e.name}
              className={`row-click ${isOpen ? 'is-open' : ''}`.trim()}
              tabIndex={0}
              aria-expanded={isOpen}
              onClick={() => toggle(e.name)}
              onKeyDown={(ev) => onRowKeyDown(ev, e.name)}
              onMouseEnter={() => onHoverSurface?.(e.surface)}
              onMouseLeave={() => onHoverSurface?.(null)}
              onFocus={() => onHoverSurface?.(e.surface)}
              onBlur={() => onHoverSurface?.(null)}
            >
              <td className="cell-strong">
                <span className="ep-name">
                  <MethodBadge method={e.method} />
                  <span className="mono ep-path">{e.name}</span>
                </span>
              </td>
              <td className="num">
                <div className="cell-bar is-right">
                  <span className="mono">{fmtCount(e.calls)}</span>
                  <div className="bar inline" style={{ '--w': `${(e.calls / a.topCalls) * 100}%` } as CSSProperties}>
                    <div className="bar-fill" />
                  </div>
                </div>
              </td>
              {show('trend') && (
                <td className="cell-trend">
                  <Sparkline points={e.spark.map((p) => p.calls)} />
                </td>
              )}
              {show('share') && <td className="num mono">{fmtPct(e.share, 1)}</td>}
              <td className="num mono">{unit === 'cu' ? fmtCompact(e.cu) : fmtMoney(e.cost)}</td>
              {show('errorRate') && (
                <td className={`num mono ${e.errorRate > 2 ? 'is-bad' : ''}`.trim()}>
                  {fmtPct(e.errorRate, 2)}
                </td>
              )}
              {show('p95') && <td className="num mono">{e.p95} ms</td>}
              <td className="num">
                <button
                  type="button"
                  className="btn ghost icon-only"
                  aria-expanded={isOpen}
                  aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${e.name}`}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    toggle(e.name);
                  }}
                >
                  <Icon.Chevron size={14} className={`ep-chev ${isOpen ? 'is-open' : ''}`.trim()} />
                </button>
              </td>
            </tr>,
            mounted && (
              <tr key={`${e.name}-detail`} className="row-detail">
                <td colSpan={columns.length}>
                  <div
                    className={`ep-detail-wrap ${expanded === e.name ? 'is-open' : ''}`.trim()}
                    // Only the wrapper's own row transition ends the collapse.
                    // Bars and fills inside also finish here, and acting on
                    // those would unmount the row mid-animation.
                    onTransitionEnd={(ev) => {
                      if (ev.target !== ev.currentTarget) return;
                      if (ev.propertyName !== 'grid-template-rows') return;
                      if (expanded !== e.name) settle(e.name);
                    }}
                  >
                    <div className="ep-detail-clip">
                      <EndpointDetail e={e} />
                    </div>
                  </div>
                </td>
              </tr>
            ),
          ];
        })}
      </Table>
      )}
      <div className="table-foot">
        <span className="dim">
          {rows.length} of {a.endpoints.length} endpoints · {fmtCount(shown)} calls ·{' '}
          {fmtCompact(shownCu)} CU
          {surface !== 'all' && ` · ${fmtPct((shown / a.totals.requests) * 100, 1)} of the window`}
        </span>
      </div>
    </TitledPanel>
  );
}

/* ============================================================
   Tabs
   ============================================================ */

function EndpointsTab({
  a,
  since,
  focusEndpoint,
  onFocusHandled,
}: {
  a: Snapshot;
  since: string;
  focusEndpoint?: string | null;
  onFocusHandled?: () => void;
}) {
  const c = a.cost;
  const cuPct = Math.round((c.cuMonth / c.cuLimit) * 100);
  const quotaTone = c.daysToLimit > 60 ? 'success' : c.daysToLimit > 14 ? 'warning' : 'danger';
  // Hovering an endpoint row lights up the band that endpoint rides in. The
  // table and the chart are the same story told twice; this is what makes them
  // read as one instrument instead of two widgets stacked on a page.
  const [hot, setHot] = useState<SurfaceId | null>(null);
  const traffic: SeriesDef[] = [
    { key: 'unified', name: 'Unified', color: C.blue },
    { key: 'rpc', name: 'JSON-RPC', color: C.violet },
    // Direct is not routed, so it does not get the Uniblock blue.
    { key: 'direct', name: 'Direct', color: C.border },
  ];
  const health: SeriesDef[] = [
    { key: 'successful', name: 'Successful', color: C.success, line: true },
    { key: 'failed', name: 'Failed', color: C.danger, line: true },
  ];

  return (
    <>
      <Panel className="widget-panel">
        <StatTiles
          tiles={[
            kpi({ label: 'Requests', value: <Num value={a.totals.requests} format={fmtCount} />, delta: a.deltas.requests, since }),
            kpi({ label: 'Success rate', value: <Num value={100 - a.totals.errorRate} format={(v) => fmtPct(v, 2)} /> }),
            kpi({ label: 'Failed', value: <Num value={a.totals.failed} format={fmtCount} />, delta: a.deltas.errorRate, since }),
            kpi({ label: 'Avg latency', value: <Num value={a.totals.p50} format={fmtMs} />, delta: a.deltas.p50, since }),
          ]}
        />
      </Panel>

      <EndpointTable
        a={a}
        onHoverSurface={setHot}
        focusEndpoint={focusEndpoint}
        onFocusHandled={onFocusHandled}
      />

      {/* Half the job this page exists for is "how much have I used, and how
          much do I need", it was a 12px line in the sidebar footer and a
          different tab. Every figure here was already computed; none of it
          was on the page a user actually lands on. */}
      <TitledPanel
        title="Compute allowance"
        sub={`${fmtCompact(c.burnPerDay)} CU/day · projected ${fmtMoney(c.projectedMonth)} this cycle`}
        actions={<Badge tone={quotaTone}>{c.daysToLimit > 60 ? 'On track' : `${c.daysToLimit} days left`}</Badge>}
      >
        <div className="cu-summary">
          <div className="cu-summary-head">
            <span className="kpi-tile-num"><Num value={c.cuMonth} format={fmtCount} /></span>
            <span className="dim">of {fmtCount(c.cuLimit)} CUs · {cuPct}%</span>
          </div>
          <Meter value={cuPct} />
        </div>
      </TitledPanel>

      <TitledPanel
        title="Requests by surface"
        sub="Unified, JSON-RPC, and Direct. Hover a point for the split and the bucket total."
      >
        <ChartFrame height={240} series={traffic}>
          <AreaChart data={a.traffic} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid {...chartGrid} />
            <XAxis {...timeAxis(a.labels.length)} />
            <YAxis {...valueAxis(48, fmtCompact)} />
            <Tooltip
              content={<ChartTooltip total valueFormatter={(v) => fmtCount(Number(v))} />}
              cursor={chartCursor}
            />
            {traffic.map((s) => {
              const dimmed = hot !== null && hot !== s.key;
              return (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stackId="1"
                  stroke={s.color}
                  fill={s.color}
                  fillOpacity={dimmed ? 0.08 : hot === s.key ? 0.62 : 0.42}
                  strokeOpacity={dimmed ? 0.25 : 1}
                  // Recharts replays the grow-in on any prop change, so the
                  // whole stack would re-animate on every row hover.
                  isAnimationActive={false}
                  name={s.name}
                />
              );
            })}
          </AreaChart>
        </ChartFrame>
      </TitledPanel>

      <TitledPanel title="Request health over time" sub="Successful vs failed requests">
        <ChartFrame height={220} series={health}>
          <AreaChart data={a.health} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid {...chartGrid} />
            <XAxis {...timeAxis(a.labels.length)} />
            <YAxis {...valueAxis(48, fmtCompact)} />
            <Tooltip content={<ChartTooltip valueFormatter={(v) => fmtCount(Number(v))} />} cursor={chartCursor} />
            <Area type="monotone" dataKey="successful" stroke={C.success} strokeWidth={2} fill={C.success} fillOpacity={0.12} name="Successful" />
            <Area type="monotone" dataKey="failed" stroke={C.danger} strokeWidth={1.5} fill={C.danger} fillOpacity={0.12} name="Failed" />
          </AreaChart>
        </ChartFrame>
      </TitledPanel>



      <TitledPanel title="Chains" sub="Call count per chain, across every surface">
        <BarList
          items={a.chainMix.map((c) => ({
            id: c.id,
            label: <ChainCell name={c.name} icon={c.icon} />,
            meta: fmtPct(c.share, 1),
            share: (c.calls / a.chainMix[0].calls) * 100,
            value: fmtCompact(c.calls),
          }))}
        />
      </TitledPanel>

      <TitledPanel title="Status codes" sub="Response status distribution across all endpoints">
        <div className="donut-row">
          <SquareMeter
            value={fmtPct(a.statusCodes[0].pct)}
            caption="2xx"
            segments={a.statusCodes.map((s) => ({
              value: s.pct,
              color:
                s.tone === 'success' ? C.blue : s.tone === 'warning' ? C.warning : C.danger,
            }))}
          />
          <Legend
            items={a.statusCodes.map((s) => ({
              id: s.code,
              tone: s.tone,
              label: <>{s.code} <span className="dim">{s.label}</span></>,
              value: fmtCount(s.count),
            }))}
          />
        </div>
      </TitledPanel>
    </>
  );
}

function ProvidersTab({ a, since }: { a: Snapshot; since: string }) {
  const r = a.routingSummary;
  // Plotted without the first-choice series on purpose. Stacked against ~97%
  // of traffic these two are a one-pixel smear at the axis, and they are the
  // entire subject of the panel.
  const routing: SeriesDef[] = [
    { key: 'hedged', name: 'Hedged into a second lane', color: C.violet },
    { key: 'failover', name: 'Failed over', color: C.danger },
  ];

  return (
    <>
      <Panel className="widget-panel">
        <StatTiles
          tiles={[
            kpi({ label: 'Providers used', value: r.providerCount, foot: r.degraded > 0 ? <Badge tone="warning">{r.degraded} degraded</Badge> : <Badge tone="success">all healthy</Badge> }),
            kpi({ label: 'Failed over', value: fmtCount(r.failedOver), delta: a.deltas.failedOver, since }),
            kpi({ label: 'Hedged', value: fmtCount(r.hedged), foot: <span className="dim">{fmtPct((r.hedged / r.routed) * 100)} of traffic</span> }),
            kpi({ label: 'Latency saved', value: fmtMs(r.savedMs), foot: <span className="dim">vs slowest eligible</span> }),
          ]}
        />
      </Panel>

      {/* The claim and its cost, together. A panel that only counts the saves
          is telling half the story: these calls came back slow, and they came
          back. The trace is the half a sentence cannot carry. */}
      <Panel className="claim-panel">
        <div className="claim-lead">
          <Icon.Shield size={18} className="claim-icon" />
          <p className="claim-text">
            <strong>{fmtCount(r.failedOver)}</strong> requests hit a provider that was failing and were
            re-routed before your caller saw an error. That is{' '}
            <strong>{fmtPct((r.failedOver / r.routed) * 100, 2)}</strong> of this window's traffic, spread
            across <strong>{r.providerCount}</strong> upstreams you never had to sign a contract with.
            Every one of them returned <strong>200</strong>. Late, but answered.
          </p>
        </div>

        <div className="claim-trace">
          <header className="claim-trace-head">
            <span className="eyebrow">A rescued request</span>
            <Badge tone="success">200 OK</Badge>
          </header>
          <TraceBar
            segments={[
              { id: 'lost', label: 'First choice, given up on', ms: r.retry.firstMs, tone: 'danger' },
              { id: 'served', label: 'Next healthy provider, served', ms: r.retry.secondMs },
            ]}
            baseline={{ ms: r.retry.baselineMs, label: 'A clean first-choice call' }}
            totalLabel="What the caller waited"
          />
        </div>
      </Panel>

      <TitledPanel
        title="Re-routes over time"
        sub={`Requests that needed a second lane. The other ${fmtPct(100 - ((r.failedOver + r.hedged) / r.routed) * 100, 1)} went to the first choice and stayed there.`}
      >
        <ChartFrame height={240} series={routing}>
          <AreaChart data={a.routing} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid {...chartGrid} />
            <XAxis {...timeAxis(a.labels.length)} />
            <YAxis {...valueAxis(48, fmtCompact)} />
            <Tooltip content={<ChartTooltip valueFormatter={(v) => fmtCount(Number(v))} />} cursor={chartCursor} />
            <Area type="monotone" dataKey="hedged" stroke={C.violet} strokeWidth={2} fill={C.violet} fillOpacity={0.12} name="Hedged into a second lane" />
            <Area type="monotone" dataKey="failover" stroke={C.danger} strokeWidth={2} fill={C.danger} fillOpacity={0.16} name="Failed over" />
          </AreaChart>
        </ChartFrame>
      </TitledPanel>

      <TitledPanel title="Provider mix" sub="Who actually served your traffic, and how they performed" flush>
        <Table
          ruled
          columns={[
            { key: 'provider', header: 'Provider' },
            { key: 'share', header: 'Share' },
            { key: 'requests', header: 'Requests', align: 'right' },
            { key: 'p50', header: 'p50', align: 'right' },
            { key: 'p95', header: 'p95', align: 'right' },
            { key: 'err', header: 'Error rate', align: 'right' },
            { key: 'status', header: 'Status', align: 'right' },
          ]}
        >
          {a.providers.map((p) => (
            <tr key={p.id}>
              <td className="cell-strong"><ProviderCell name={p.name} icon={p.icon} /></td>
              <td>
                <div className="cell-bar">
                  <div className="bar inline" style={{ '--w': `${p.share}%` } as CSSProperties}>
                    <div className="bar-fill" />
                  </div>
                  <span className="mono dim">{fmtPct(p.share)}</span>
                </div>
              </td>
              <td className="num mono">{fmtCount(p.requests)}</td>
              <td className="num mono">{p.p50}</td>
              <td className="num mono">{p.p95}</td>
              <td className="num mono">{fmtPct(p.errorRate, 2)}</td>
              <td className="num">
                <Badge tone={p.status === 'operational' ? 'success' : 'warning'}>
                  {p.status === 'operational' ? `${p.uptime}%` : 'degraded'}
                </Badge>
              </td>
            </tr>
          ))}
        </Table>
      </TitledPanel>

      <section className="bento">
        <TitledPanel
          title="Head-to-head win rate"
          sub="How often each provider won when it was scored against another. Note this does not match the traffic order above."
        >
          <BarList
            items={[...a.providers].sort((x, y) => y.winRate - x.winRate).map((p) => ({
              id: p.id,
              label: <ProviderCell name={p.name} icon={p.icon} />,
              share: p.winRate,
              value: fmtPct(p.winRate, 0),
            }))}
          />
        </TitledPanel>

        <TitledPanel title="Failover events" sub="Every time a provider was pulled out of rotation" flush>
          <Table
            ruled
            columns={[
              { key: 'at', header: 'Time' },
              { key: 'move', header: 'Re-routed' },
              { key: 'reason', header: 'Reason' },
              { key: 'req', header: 'Requests', align: 'right' },
            ]}
          >
            {a.failovers.map((f) => (
              <tr key={f.id}>
                <td className="mono dim">{f.at}</td>
                <td>
                  <span className="fo-move">
                    <span className="dim">{f.from}</span>
                    <Icon.Chevron size={11} className="fo-arrow" />
                    <span className="cell-strong">{f.to}</span>
                  </span>
                </td>
                <td className="dim">{f.reason}</td>
                <td className="num mono">{fmtCount(f.requests)}</td>
              </tr>
            ))}
          </Table>
        </TitledPanel>
      </section>
    </>
  );
}

function JsonRpcTab({ a, bare }: { a: Snapshot; bare?: boolean }) {
  // The bar only encodes call count. Everything else you would need to judge a
  // method (what it costs, how often it fails, how slow its tail is) rides in
  // the tooltip, so the chart does not have to become a second table.
  const methodStats = (name: string | number) => {
    const m = a.rpcMethods.find((x) => x.name === name);
    if (!m) return [];
    return [
      { name: 'Share', value: fmtPct(m.share, 1) },
      { name: 'CU', value: `${fmtCompact(m.cu)} (${m.cuPerCall}/call)` },
      { name: 'Cost', value: fmtMoney(m.cost) },
      { name: 'Error %', value: fmtPct(m.errorRate, 2) },
      { name: 'p95', value: `${m.p95} ms` },
    ];
  };

  return (
    <>
      {!bare && (
        <Panel className="widget-panel">
          <StatTiles
            tiles={[
              kpi({ label: 'JSON-RPC calls', value: <Num value={a.rpcTotal} format={fmtCount} /> }),
              kpi({ label: 'Success rate', value: fmtPct((a.rpcOk / a.rpcTotal) * 100, 2) }),
              kpi({ label: 'Failed', value: fmtCount(a.rpcFailed) }),
              kpi({ label: 'Batched', value: '38%', foot: <span className="dim">of requests</span> }),
            ]}
          />
        </Panel>
      )}

      <TitledPanel title="Methods" sub="Hover a bar for the same figures the endpoint table carries">
        <ChartFrame height={300}>
          <BarChart data={a.rpcMethods} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
            <CartesianGrid stroke="var(--ub-line)" horizontal={false} vertical />
            <XAxis type="number" {...chartAxis} axisLine={false} tickFormatter={fmtCompact} />
            <YAxis type="category" dataKey="name" {...chartAxis} axisLine={false} width={196} />
            <Tooltip
              content={<ChartTooltip breakdown={methodStats} valueFormatter={(v) => fmtCount(Number(v))} />}
              cursor={chartBarCursor}
            />
            <Bar dataKey="calls" fill={C.blue} radius={[0, 4, 4, 0]} barSize={16} name="Calls" />
          </BarChart>
        </ChartFrame>
      </TitledPanel>

      <section className="bento">
        <TitledPanel title="Chains" sub="Call count per blockchain">
          <BarList
            items={a.rpcChains.map((c) => ({
              id: c.id,
              label: <ChainCell name={c.name} icon={c.icon} />,
              share: (c.calls / a.rpcChains[0].calls) * 100,
              value: fmtCompact(c.calls),
            }))}
          />
        </TitledPanel>

        <TitledPanel title="Success rate" sub="Success vs failure for JSON-RPC requests">
          <div className="donut-row">
            <SquareMeter
              value={fmtPct((a.rpcOk / a.rpcTotal) * 100)}
              caption="ok"
              segments={[
                { value: (a.rpcOk / a.rpcTotal) * 100, color: C.blue },
                { value: (a.rpcFailed / a.rpcTotal) * 100, color: C.danger },
              ]}
            />
            <Legend
              items={[
                { id: 'ok', tone: 'success', label: 'Success', value: fmtCount(a.rpcOk) },
                { id: 'fail', tone: 'danger', label: 'Failure', value: fmtCount(a.rpcFailed) },
              ]}
            />
          </div>
        </TitledPanel>
      </section>

      <TitledPanel title="Batch requests" sub="Batched vs single JSON-RPC requests">
        <div className="batch-row">
          {a.rpcBatch.map((b) => (
            <div key={b.label} className="batch-item">
              <div className="batch-head"><span>{b.label}</span><span className="mono">{b.value}%</span></div>
              <Meter value={b.value} size="sm" color={b.color} />
            </div>
          ))}
        </div>
      </TitledPanel>
    </>
  );
}

function WebSocketsTab({ a, bare }: { a: Snapshot; bare?: boolean }) {
  const w = a.ws;
  const l = w.lifecycle;
  const conn: SeriesDef[] = [
    { key: 'connections', name: 'Concurrent connections', color: C.blue, line: true },
  ];
  const headroom = Math.round((w.peak / w.limit) * 100);

  return (
    <>
      {!bare && (
        <Panel className="widget-panel">
          <StatTiles
            tiles={[
              kpi({ label: 'Open now', value: fmtCount(w.current) }),
              kpi({ label: 'Peak concurrent', value: fmtCount(w.peak), foot: <span className="dim">of {fmtCount(w.limit)} allowed</span> }),
              kpi({ label: 'Subscriptions', value: fmtCount(w.subscriptions) }),
              kpi({ label: 'Messages pushed', value: fmtCompact(w.messages) }),
            ]}
          />
        </Panel>
      )}

      <TitledPanel
        title="Connection headroom"
        sub="Peak concurrent sockets against your plan ceiling, the number that decides your tier"
      >
        <div className="cu-summary">
          <div className="cu-summary-head">
            <span className="kpi-tile-num">{fmtCount(w.peak)}</span>
            <span className="dim">of {fmtCount(w.limit)} concurrent · {headroom}%</span>
          </div>
          <Meter value={headroom} />
        </div>
      </TitledPanel>

      <TitledPanel title="Concurrent connections over time" sub="Sockets held open, sampled per bucket">
        <ChartFrame height={230} series={conn}>
          <AreaChart data={a.wsSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="wsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.blue} stopOpacity={0.26} />
                <stop offset="100%" stopColor={C.blue} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid {...chartGrid} />
            <XAxis {...timeAxis(a.labels.length)} />
            <YAxis {...valueAxis(48, fmtCompact)} />
            <Tooltip content={<ChartTooltip valueFormatter={(v) => fmtCount(Number(v))} />} cursor={chartCursor} />
            <Area type="monotone" dataKey="connections" stroke={C.blue} strokeWidth={2} fill="url(#wsFill)" name="Connections" />
          </AreaChart>
        </ChartFrame>
      </TitledPanel>

      <TitledPanel title="Messages pushed" sub="Server-to-client frames, which is what a socket actually bills on">
        <ChartFrame height={200}>
          <AreaChart data={a.wsSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid {...chartGrid} />
            <XAxis {...timeAxis(a.labels.length)} />
            <YAxis {...valueAxis(48, fmtCompact)} />
            <Tooltip content={<ChartTooltip valueFormatter={(v) => fmtCount(Number(v))} />} cursor={chartCursor} />
            <Area type="monotone" dataKey="messages" stroke={C.violet} strokeWidth={2} fill={C.violet} fillOpacity={0.1} name="Messages" />
          </AreaChart>
        </ChartFrame>
      </TitledPanel>

      <TitledPanel
        title="Connection lifecycle"
        sub="A dropped socket returns no status code, so this is the only place it shows up"
      >
        <StatTiles
          columns={3}
          tiles={[
            { id: 'opened', label: 'Opened', value: fmtCount(l.opened) },
            { id: 'closed', label: 'Closed cleanly', value: fmtCount(l.closed) },
            { id: 'dropped', label: 'Dropped', value: fmtCount(l.dropped), foot: <Badge tone="danger">{fmtPct((l.dropped / l.opened) * 100, 1)}</Badge> },
            { id: 'reconnects', label: 'Client reconnects', value: fmtCount(l.reconnects) },
            { id: 'avg', label: 'Avg session', value: `${l.avgSession} min` },
            { id: 'p95', label: 'p95 session', value: `${l.p95Session} min` },
          ]}
        />
        <div className="claim-inline">
          <Icon.Shield size={16} className="claim-icon" />
          <span>
            <strong>{fmtCount(l.rescued)}</strong> of those drops were re-established on a different
            provider without the client reconnecting.
          </span>
        </div>
      </TitledPanel>

      <section className="bento">
        <TitledPanel title="Subscriptions by type" sub="What your sockets are actually listening for">
          <BarList
            items={w.byType.map((s) => ({
              id: s.name,
              label: <span className="mono">{s.name}</span>,
              meta: `${fmtCount(s.count)} active`,
              share: (s.count / w.byType[0].count) * 100,
              value: fmtPct(s.share, 0),
            }))}
          />
        </TitledPanel>

        <TitledPanel title="Sockets by provider" sub="Who is holding each connection open" flush>
          <Table
            ruled
            columns={[
              { key: 'provider', header: 'Provider' },
              { key: 'sockets', header: 'Sockets', align: 'right' },
              { key: 'share', header: 'Share', align: 'right' },
              { key: 'drop', header: 'Drop rate', align: 'right' },
            ]}
          >
            {w.byProvider.map((p) => (
              <tr key={p.id}>
                <td className="cell-strong"><ProviderCell name={p.name} icon={p.icon} /></td>
                <td className="num mono">{fmtCount(p.sockets)}</td>
                <td className="num mono">{p.share}%</td>
                <td className="num mono">{fmtPct(p.dropRate, 1)}</td>
              </tr>
            ))}
          </Table>
        </TitledPanel>
      </section>
    </>
  );
}

function ComputeTab({ a, since }: { a: Snapshot; since: string }) {
  const c = a.cost;
  const t = a.throughput;
  const cuPct = Math.round((c.cuMonth / c.cuLimit) * 100);
  const compute: SeriesDef[] = [
    { key: 'http', name: 'HTTP', color: C.blue },
    { key: 'wss', name: 'WebSocket', color: C.violet },
  ];
  // Both series named, so the dashed rule on the plot is not a riddle.
  const throughput: SeriesDef[] = [
    { key: 'rps', name: 'Attempted requests per second', color: C.blue },
    { key: 'ceiling', name: `${t.planName} plan ceiling · ${t.planRps} rps`, color: C.danger, line: true },
  ];
  const saving = c.multiVendorCost - c.spend;
  const savingPct = (saving / c.multiVendorCost) * 100;

  return (
    <>
      <Panel className="widget-panel">
        <StatTiles
          tiles={[
            kpi({ label: 'Spend', value: <Num value={c.spend} format={fmtMoney} />, delta: a.deltas.spend, since }),
            kpi({ label: 'Compute units', value: <Num value={a.totals.cu} format={fmtCompact} />, delta: a.deltas.cu, since }),
            kpi({ label: 'Burn rate', value: `${fmtCompact(c.burnPerDay)}/day` }),
            kpi({ label: 'Allowance runs out', value: c.daysToLimit > 60 ? 'Not this cycle' : `${c.daysToLimit} days` }),
          ]}
        />
      </Panel>

      <TitledPanel
        title="Monthly allowance"
        sub={`${fmtMoney(c.perMillion)} per million CUs · projected ${fmtMoney(c.projectedMonth)} this cycle`}
      >
        <div className="cu-summary">
          <div className="cu-summary-head">
            <span className="kpi-tile-num">{fmtCount(c.cuMonth)}</span>
            <span className="dim">of {fmtCount(c.cuLimit)} CUs · {cuPct}%</span>
          </div>
          <Meter value={cuPct} />
        </div>
      </TitledPanel>

      <TitledPanel
        title="What this would cost bought direct"
        sub={`The same ${fmtCompact(a.totals.cu)} CUs at each vendor's list price, plus their minimums`}
      >
        <div className="compare-row">
          <div className="compare-side">
            <span className="compare-label">Uniblock</span>
            <span className="compare-fig is-blue">{fmtMoney(c.spend)}</span>
            <span className="compare-note dim">One contract, one invoice</span>
          </div>
          <div className="compare-side">
            <span className="compare-label">{c.vendorCount} vendors direct</span>
            <span className="compare-fig">{fmtMoney(c.multiVendorCost)}</span>
            <span className="compare-note dim">
              Includes {fmtMoney(c.vendorFloors)} of minimums you pay either way
            </span>
          </div>
          <div className="compare-side is-result">
            <span className="compare-label">Difference</span>
            <span className="compare-fig is-blue">{fmtMoney(saving)}</span>
            <span className="compare-note dim">{fmtPct(savingPct, 0)} less</span>
          </div>
        </div>
        <p className="panel-note dim">
          Each row is the whole window bought from that one vendor at its list price,
          not what you spent with them. Nobody sells you all {c.vendorCount} for one number.
        </p>
        <BarList
          items={c.directCost.map((p) => ({
            id: p.id,
            label: <ProviderCell name={p.name} icon={p.icon} />,
            meta: `if you routed all ${fmtCompact(a.totals.cu)} CUs here`,
            share: (p.cost / c.directCost[0].cost) * 100,
            value: fmtMoney(p.cost),
            // Not the Uniblock path, so not Uniblock blue.
            color: 'var(--ub-border)',
          }))}
        />
      </TitledPanel>

      {/* Throughput is the other half of a plan: the allowance above says how
          much you may use in a month, this says how fast you are allowed to use
          it. Hitting the ceiling costs you 429s while the monthly figure still
          looks healthy, which is exactly the failure a CU meter cannot show. */}
      <TitledPanel
        title="Peak throughput against your plan"
        sub={`The highest rate attempted in each ${t.bucketMinutes}-minute bucket, past ${t.windowHours} hours. Anything above the ceiling was rejected as 429, so the area over the line is not traffic you served. A rate limit is a burst problem, which is why this window is fixed regardless of the range above.`}
        actions={
          <Badge tone={t.atCeiling > 0 ? 'danger' : t.headroomPct < 25 ? 'warning' : 'success'}>
            {t.atCeiling > 0
              ? `${t.atCeiling} bucket${t.atCeiling === 1 ? '' : 's'} over the ceiling`
              : `${fmtPct(t.headroomPct, 0)} headroom`}
          </Badge>
        }
      >
        <ChartFrame height={220} series={throughput}>
          <AreaChart data={t.series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="rpsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.blue} stopOpacity={0.26} />
                <stop offset="100%" stopColor={C.blue} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid {...chartGrid} />
            <XAxis dataKey="label" {...chartAxis} axisLine={chartAxisLine} tickMargin={8} minTickGap={48} />
            {/* Headroom above the ceiling, so the line is read against the limit
                rather than against the tallest spike. */}
            <YAxis
              {...valueAxis(40, (v) => String(v))}
              domain={[0, (max: number) => Math.max(Math.ceil(t.planRps * 1.15), Math.ceil(max * 1.05))]}
            />
            <Tooltip
              content={<ChartTooltip valueFormatter={(v) => `${v} rps`} />}
              cursor={chartCursor}
            />
            <ReferenceLine y={t.planRps} {...chartRefLine} />
            <Area
              type="monotone"
              dataKey="rps"
              stroke={C.blue}
              strokeWidth={2}
              fill="url(#rpsFill)"
              name="Peak rps"
            />
          </AreaChart>
        </ChartFrame>
        <Spec
          rows={[
            {
              label: 'Busiest bucket',
              value: <span className="mono">{t.peakRps} rps · {t.peakAt}</span>,
            },
            { label: `${t.planName} plan ceiling`, value: <span className="mono">{t.planRps} rps</span> },
            t.overByRps > 0
              ? { label: 'Peak over the ceiling', value: <span className="mono">+{t.overByRps} rps</span> }
              : { label: 'Headroom at peak', value: <span className="mono">{fmtPct(t.headroomPct, 0)}</span> },
            {
              label: 'Requests rejected as 429',
              value: <span className="mono">{fmtCount(t.throttled)}</span>,
            },
            {
              label: `${t.nextPlan.name} plan ceiling`,
              value: <span className="mono">{t.nextPlan.rps} rps</span>,
            },
          ]}
        />
      </TitledPanel>

      <TitledPanel title="Compute units over time" sub="HTTP and WebSocket consumption, stacked">
        <ChartFrame height={230} series={compute}>
          <AreaChart data={a.compute} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="cuFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.blue} stopOpacity={0.26} />
                <stop offset="100%" stopColor={C.blue} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid {...chartGrid} />
            <XAxis {...timeAxis(a.labels.length)} />
            <YAxis {...valueAxis(52, fmtCompact)} />
            <Tooltip content={<ChartTooltip valueFormatter={(v) => fmtCompact(Number(v))} />} cursor={chartCursor} />
            <Area type="monotone" dataKey="http" stackId="1" stroke={C.blue} strokeWidth={2} fill="url(#cuFill)" name="HTTP" />
            <Area type="monotone" dataKey="wss" stackId="1" stroke={C.violet} strokeWidth={2} fill={C.violet} fillOpacity={0.12} name="WebSocket" />
          </AreaChart>
        </ChartFrame>
      </TitledPanel>

      <section className="bento">
        <TitledPanel title="By API surface" sub="Which surface consumed the allowance">
          <BarList
            items={c.cuBreakdown.map((b) => ({
              id: b.name,
              label: b.name,
              meta: fmtMoney((b.cu / 1_000_000) * c.perMillion),
              share: (b.cu / c.cuBreakdown[0].cu) * 100,
              value: fmtCompact(b.cu),
            }))}
          />
        </TitledPanel>

        <TitledPanel title="Most expensive endpoints" sub="Total CUs burned, not call count. These are different rankings.">
          <BarList
            items={c.cuByEndpoint.slice(0, 7).map((e) => ({
              id: e.name,
              label: <span className="mono">{e.name}</span>,
              meta: `${e.perCall} CU per call`,
              share: (e.cu / c.cuByEndpoint[0].cu) * 100,
              value: fmtCompact(e.cu),
            }))}
          />
        </TitledPanel>
      </section>
    </>
  );
}

function LatencyTab({ a, since, bare }: { a: Snapshot; since: string; bare?: boolean }) {
  const lat: SeriesDef[] = [
    { key: 'p50', name: 'p50', color: C.blue, line: true },
    { key: 'p95', name: 'p95', color: C.violet, line: true },
    { key: 'p99', name: 'p99', color: C.warning, line: true },
  ];
  const byP50 = [...a.providers].sort((x, y) => x.p50 - y.p50);
  const fastest = byP50[0];
  // Scale the bars to the slowest upstream, so the column is a comparison
  // between providers rather than against an arbitrary ceiling.
  const slowestP50 = byP50[byP50.length - 1].p50;

  return (
    <>
      {!bare && (
        <Panel className="widget-panel">
          <StatTiles
            tiles={[
              kpi({ label: 'p50', value: <Num value={a.totals.p50} format={fmtMs} />, delta: a.deltas.p50, since }),
              kpi({ label: 'p95', value: <Num value={a.totals.p95} format={fmtMs} /> }),
              kpi({ label: 'p99', value: <Num value={a.totals.p99} format={fmtMs} /> }),
              kpi({ label: 'Fastest upstream', value: fmtMs(fastest.p50), foot: <span className="dim">{fastest.name}</span> }),
            ]}
          />
        </Panel>
      )}

      <TitledPanel title="Latency over time" sub="Percentiles across every provider in rotation">
        <ChartFrame height={250} series={lat}>
          <LineChart data={a.latency} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid {...chartGrid} />
            <XAxis {...timeAxis(a.labels.length)} />
            <YAxis {...valueAxis(56, fmtMs)} />
            <Tooltip content={<ChartTooltip valueFormatter={(v) => fmtMs(Number(v))} />} cursor={chartCursor} />
            <Line type="monotone" dataKey="p50" stroke={C.blue} strokeWidth={2} dot={false} name="p50" />
            <Line type="monotone" dataKey="p95" stroke={C.violet} strokeWidth={1.5} dot={false} name="p95" />
            <Line type="monotone" dataKey="p99" stroke={C.warning} strokeWidth={1.5} dot={false} name="p99" />
          </LineChart>
        </ChartFrame>
      </TitledPanel>

      <TitledPanel title="Latency by provider" sub="p50 and p95 for each upstream, over the same window" flush>
        <Table
          ruled
          columns={[
            { key: 'provider', header: 'Provider' },
            { key: 'p50', header: 'p50' },
            { key: 'p95', header: 'p95', align: 'right' },
            { key: 'share', header: 'Traffic', align: 'right' },
          ]}
        >
          {byP50.map((p) => (
            <tr key={p.id}>
              <td className="cell-strong"><ProviderCell name={p.name} icon={p.icon} /></td>
              <td>
                <div className="cell-bar">
                  <div className="bar inline" style={{ '--w': `${(p.p50 / slowestP50) * 100}%` } as CSSProperties}>
                    {/* Only the winner is blue: it is the one the router picks. */}
                    <div className="bar-fill" style={p.id === fastest.id ? undefined : { background: 'var(--ub-border)' }} />
                  </div>
                  <span className="mono">{p.p50} ms</span>
                </div>
              </td>
              <td className="num mono">{p.p95} ms</td>
              <td className="num mono">{fmtPct(p.share, 0)}</td>
            </tr>
          ))}
        </Table>
      </TitledPanel>

      <TitledPanel title="Slowest endpoints" sub="Ranked by p95, where a timeout budget actually gets spent" flush>
        <Table
          ruled
          columns={[
            { key: 'endpoint', header: 'Endpoint' },
            { key: 'p50', header: 'p50', align: 'right' },
            { key: 'p95', header: 'p95', align: 'right' },
            { key: 'p99', header: 'p99', align: 'right' },
            { key: 'calls', header: 'Calls', align: 'right' },
          ]}
        >
          {a.slowest.map((s) => (
            <tr key={s.name}>
              <td className="cell-strong mono">{s.name}</td>
              <td className="num mono">{s.p50} ms</td>
              <td className="num mono">{s.p95} ms</td>
              <td className="num mono">{s.p99} ms</td>
              <td className="num mono">{fmtCompact(s.calls)}</td>
            </tr>
          ))}
        </Table>
      </TitledPanel>
    </>
  );
}

function ErrorsTab({ a, since, bare }: { a: Snapshot; since: string; bare?: boolean }) {
  const health: SeriesDef[] = [{ key: 'failed', name: 'Failed requests', color: C.danger, line: true }];
  // Off the snapshot rather than re-summed here: the routing panel prints the
  // same figure, and two independent sums of the same rows is how they drift.
  const { absorbed } = a.routingSummary;
  const surfaced = a.totals.failed - absorbed;

  return (
    <>
      {!bare && (
        <Panel className="widget-panel">
          <StatTiles
            tiles={[
              kpi({ label: 'Failed', value: <Num value={a.totals.failed} format={fmtCount} />, delta: a.deltas.errorRate, since }),
              kpi({ label: 'Error rate', value: fmtPct(a.totals.errorRate, 2) }),
              kpi({ label: 'Absorbed by routing', value: fmtCount(absorbed), foot: <Badge tone="success">never reached you</Badge> }),
              kpi({ label: 'Surfaced to caller', value: fmtCount(surfaced), foot: <Badge tone="danger">your code saw these</Badge> }),
            ]}
          />
        </Panel>
      )}

      <TitledPanel title="Failures over time" sub="Failed requests per bucket, including absorbed retries">
        <ChartFrame height={220} series={health}>
          <AreaChart data={a.health} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid {...chartGrid} />
            <XAxis {...timeAxis(a.labels.length)} />
            <YAxis {...valueAxis(48, fmtCompact)} />
            <Tooltip content={<ChartTooltip valueFormatter={(v) => fmtCount(Number(v))} />} cursor={chartCursor} />
            <Area type="monotone" dataKey="failed" stroke={C.danger} strokeWidth={2} fill={C.danger} fillOpacity={0.14} name="Failed" />
          </AreaChart>
        </ChartFrame>
      </TitledPanel>

      <TitledPanel title="Top errors" sub="Grouped by status and cause, the answer to 'what is actually breaking'" flush>
        <Table
          ruled
          columns={[
            { key: 'code', header: 'Status' },
            { key: 'cause', header: 'Cause' },
            { key: 'endpoint', header: 'Endpoint' },
            { key: 'provider', header: 'Provider' },
            { key: 'count', header: 'Count', align: 'right' },
            { key: 'seen', header: 'Last seen', align: 'right' },
          ]}
        >
          {a.errors.map((e) => (
            <tr key={e.id}>
              <td>
                <Badge tone={e.code >= 500 ? 'danger' : 'warning'}>{e.code}</Badge>
              </td>
              <td>
                <div className="err-cause">
                  <span className="cell-strong">{e.name}</span>
                  <span className="dim">{e.message}</span>
                </div>
              </td>
              <td className="mono dim">{e.endpoint}</td>
              <td className="dim">{e.provider}</td>
              <td className="num mono">{fmtCount(e.count)}</td>
              <td className="num mono dim">{e.lastSeen}</td>
            </tr>
          ))}
        </Table>
      </TitledPanel>

      <TitledPanel
        title="Recent failed requests"
        sub="The last failures in this window, with the retry count Uniblock spent on each"
        flush
      >
        <Table
          ruled
          columns={[
            { key: 'ts', header: 'Time' },
            { key: 'method', header: 'Method' },
            { key: 'endpoint', header: 'Endpoint' },
            { key: 'chain', header: 'Chain' },
            { key: 'provider', header: 'Provider' },
            { key: 'status', header: 'Status', align: 'right' },
            { key: 'attempts', header: 'Attempts', align: 'right' },
            { key: 'ms', header: 'Latency', align: 'right' },
          ]}
        >
          {a.recentFailures.map((r) => (
            <tr key={r.id}>
              <td className="mono dim">{r.ts}</td>
              <td><MethodBadge method={r.method} /></td>
              <td className="mono cell-strong">{r.endpoint}</td>
              <td className="dim">{r.chain}</td>
              <td className="dim">{r.provider}</td>
              <td className="num"><Badge tone={r.status >= 500 ? 'danger' : 'warning'}>{r.status}</Badge></td>
              <td className="num mono">{r.attempts}</td>
              <td className="num mono">{r.latencyMs} ms</td>
            </tr>
          ))}
        </Table>
      </TitledPanel>
    </>
  );
}

/* ============================================================
   View
   ============================================================ */

/** Reliability = "is it healthy": the latency percentiles and the failures. */
function ReliabilityTab({ a, since }: { a: Snapshot; since: string }) {
  const absorbed = a.routingSummary.absorbed;
  return (
    <>
      <Panel className="widget-panel">
        <StatTiles
          tiles={[
            kpi({ label: 'p50', value: <Num value={a.totals.p50} format={fmtMs} />, delta: a.deltas.p50, since }),
            kpi({ label: 'p95', value: <Num value={a.totals.p95} format={fmtMs} /> }),
            kpi({ label: 'Error rate', value: <Num value={a.totals.errorRate} format={(v) => fmtPct(v, 2)} />, delta: a.deltas.errorRate, since }),
            kpi({ label: 'Absorbed by routing', value: <Num value={absorbed} format={fmtCount} />, foot: <Badge tone="success">never reached you</Badge> }),
          ]}
        />
      </Panel>
      <LatencyTab a={a} since={since} bare />
      <ErrorsTab a={a} since={since} bare />
    </>
  );
}

/** Protocols = "how is this wire format behaving": JSON-RPC and WebSockets. */
function ProtocolsTab({ a }: { a: Snapshot }) {
  const w = a.ws;
  return (
    <>
      <Panel className="widget-panel">
        <StatTiles
          tiles={[
            kpi({ label: 'JSON-RPC calls', value: <Num value={a.rpcTotal} format={fmtCount} /> }),
            kpi({ label: 'RPC success rate', value: <Num value={(a.rpcOk / a.rpcTotal) * 100} format={(v) => fmtPct(v, 2)} /> }),
            kpi({ label: 'Open sockets', value: <Num value={w.current} format={fmtCount} />, foot: <span className="dim">peak {fmtCount(w.peak)}</span> }),
            kpi({ label: 'Messages pushed', value: <Num value={w.messages} format={fmtCompact} /> }),
          ]}
        />
      </Panel>
      <JsonRpcTab a={a} bare />
      <WebSocketsTab a={a} bare />
    </>
  );
}

export function Analytics({
  focusEndpoint,
  onFocusHandled,
}: {
  /** Endpoint the command palette wants revealed, if any. */
  focusEndpoint?: string | null;
  onFocusHandled?: () => void;
} = {}) {
  const [tab, setTab] = useState<Tab>('Endpoints');
  const [range, setRange] = useState<RangeId>('1d');
  const [chain, setChain] = useState<ChainFilter>('all');

  const a = analytics(range, chain);
  const since = rangeMeta[range].prior;

  // The catalogue lives on one tab, so a palette hit has to land there first.
  // Render-phase again: switching tabs from an effect shows the wrong tab for
  // a frame before snapping over.
  // Seeded null, not with the prop: the palette navigates here, so this
  // component mounts with the request already in hand. Seeding from the prop
  // makes the first comparison equal and swallows the very jump that
  // mounted it.
  const [lastFocus, setLastFocus] = useState<string | null | undefined>(null);
  if (lastFocus !== focusEndpoint) {
    setLastFocus(focusEndpoint);
    if (focusEndpoint) setTab('Endpoints');
  }

  return (
    <div className="view">
      <div className="rise rise-1 analytics-bar">
        <Segmented
          variant="tab"
          label="Analytics view"
          value={tab}
          onChange={setTab}
          options={tabs.map((t) => {
            const I = Icon[tabIcons[t]];
            return { value: t, label: <><I size={15} /> {t}</> };
          })}
        />
        <div className="analytics-filters">
          <Select
            label="Chain"
            value={chain}
            onChange={setChain}
            options={[
              { value: 'all' as ChainFilter, label: 'All chains' },
              ...trafficChains.map((c) => ({ value: c.id as ChainFilter, label: c.name })),
            ]}
          />
          <Segmented
            label="Time range"
            value={range}
            onChange={setRange}
            options={ranges.map((r) => ({ value: r.id, label: r.label }))}
          />
        </div>
      </div>

      <p className="analytics-window dim rise rise-1">
        {rangeMeta[range].window} · {chain === 'all' ? 'all chains' : trafficChains.find((c) => c.id === chain)?.name}
        {' · '}
        <span className="mono">{fmtCount(a.totals.requests)}</span> requests
      </p>

      <div className="view-swap view-stack" key={`${tab}-${range}-${chain}`}>
        {tab === 'Endpoints' && (
          <EndpointsTab
            a={a}
            since={since}
            focusEndpoint={focusEndpoint}
            onFocusHandled={onFocusHandled}
          />
        )}
        {tab === 'Providers' && <ProvidersTab a={a} since={since} />}
        {tab === 'Reliability' && <ReliabilityTab a={a} since={since} />}
        {tab === 'Usage & cost' && <ComputeTab a={a} since={since} />}
        {tab === 'Protocols' && <ProtocolsTab a={a} />}
      </div>
    </div>
  );
}
