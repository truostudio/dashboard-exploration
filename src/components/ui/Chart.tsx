/* This module hands out both components and the prop bundles that configure
   them, which costs it fast refresh. Splitting the two apart would mean views
   importing the theme for a chart from somewhere other than the chart module,
   and a rule about HMR is not worth that. */
/* eslint-disable react-refresh/only-export-components */
import type { ReactElement, ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';

/**
 * Shared Recharts theme. Views must not pass their own axis/tooltip/grid
 * styling. Recharts takes inline style objects, and those silently escape the
 * CSS system (they kept their own border-radius after the app went square).
 */

/* No `fontSize` here on purpose: it would land as an SVG attribute that the
   large-display type scale cannot override. `.axis-mono` carries the size. */
export const chartAxis = {
  stroke: 'var(--ub-text-3)',
  tickLine: false,
  className: 'axis-mono',
} as const;

export const chartAxisLine = { stroke: 'var(--ub-line)' } as const;

export const chartGrid = { stroke: 'var(--ub-line)', vertical: false } as const;

/** Crosshair for line/area charts. */
export const chartCursor = {
  stroke: 'var(--ub-blue)',
  strokeWidth: 1,
  strokeDasharray: '2 3',
} as const;

/** Band highlight for bar charts. */
export const chartBarCursor = { fill: 'var(--ub-blue-soft)' } as const;

/**
 * X axis for a time-bucketed series, keyed on `label`. Ticks collide once a
 * window is more than a dozen buckets wide, so hand Recharts a minimum gap and
 * let it drop the overlap rather than rotating the labels.
 *
 * Both thresholds are about width, not bucket count: a chart in a half-width
 * column wants a bigger `gap`, and is already crowded at a count the full-width
 * charts render comfortably, so it lowers `crowdedAt` to match.
 */
export const timeAxis = (buckets: number, gap = 32, crowdedAt = 12) => ({
  dataKey: 'label',
  ...chartAxis,
  axisLine: chartAxisLine,
  tickMargin: 8,
  minTickGap: buckets > crowdedAt ? gap : 0,
});

/**
 * Y axis for a figure column. `width` is explicit because Recharts measures
 * nothing: too little and the widest tick is clipped, too much and the plot
 * starts somewhere different on every panel.
 */
export const valueAxis = (width: number, tickFormatter: (value: number) => string) => ({
  ...chartAxis,
  axisLine: false as const,
  width,
  tickFormatter,
});

type TooltipPayload = {
  value?: number | string;
  name?: string;
  dataKey?: string | number;
  color?: string;
  stroke?: string;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string | number;
  /** Formats the heading (usually the x value). */
  labelFormatter?: (label: string | number) => ReactNode;
  /** Formats each row's figure. */
  valueFormatter?: (value: number | string) => ReactNode;
  /** Adds a summed row beneath the series. Only meaningful when they stack. */
  total?: boolean;
  /**
   * Extra rows under a divider, keyed off the hovered x value. Used to answer
   * "which endpoints made that spike", or to carry the stats a single-series
   * bar cannot encode, without leaving the chart.
   */
  breakdown?: (label: string | number) => { name: string; value: ReactNode }[];
  /** Optional caption over the breakdown rows. Omit when they need no heading. */
  breakdownTitle?: ReactNode;
};

/**
 * Terminal-style readout. Rendered as real DOM rather than an inline-styled
 * Recharts box, so it inherits the square edges, both themes, and the
 * registration crosses like everything else.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
  total,
  breakdown,
  breakdownTitle,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const sum = total
    ? payload.reduce((a, r) => a + (typeof r.value === 'number' ? r.value : 0), 0)
    : null;
  const rows = breakdown && label !== undefined ? breakdown(label) : null;

  return (
    <div className="chart-tip">
      {label !== undefined && (
        <div className="chart-tip-head">{labelFormatter ? labelFormatter(label) : label}</div>
      )}
      <ul className="chart-tip-list">
        {payload.map((row, i) => (
          <li key={i}>
            <span className="chart-tip-key" style={{ background: row.color ?? row.stroke }} />
            <span className="chart-tip-name">{row.name ?? row.dataKey}</span>
            <span className="chart-tip-val">
              {valueFormatter && row.value !== undefined ? valueFormatter(row.value) : row.value}
            </span>
          </li>
        ))}
        {sum !== null && (
          <li className="chart-tip-total">
            <span className="chart-tip-name">Total</span>
            <span className="chart-tip-val">{valueFormatter ? valueFormatter(sum) : sum}</span>
          </li>
        )}
      </ul>
      {rows && rows.length > 0 && (
        <>
          {breakdownTitle && <div className="chart-tip-sub">{breakdownTitle}</div>}
          <ul className={`chart-tip-list ${breakdownTitle ? '' : 'is-ruled'}`.trim()}>
            {rows.map((r) => (
              <li key={r.name}>
                <span className="chart-tip-name">{r.name}</span>
                <span className="chart-tip-val">{r.value}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/**
 * One series definition, used twice: to declare the legend and to colour the
 * mark. Passing the same array to both is what keeps a chart from shipping
 * unlabelled bands, the failure mode this system had on every multi-series
 * chart before.
 */
export type SeriesDef = {
  key: string;
  name: string;
  color: string;
  /** Renders a hairline swatch instead of a filled block, for line series. */
  line?: boolean;
};

/** Key for a multi-series chart. Square swatches, mono labels, above the plot. */
export function ChartLegend({ series }: { series: SeriesDef[] }) {
  return (
    <ul className="chart-legend">
      {series.map((s) => (
        <li key={s.key}>
          <span
            className={`chart-legend-key ${s.line ? 'is-line' : ''}`.trim()}
            style={{ background: s.color }}
          />
          {s.name}
        </li>
      ))}
    </ul>
  );
}

/**
 * Plot area with corner ticks, so a chart reads as an instrument panel.
 * Any chart with more than one series must pass `series` so it gets a key.
 */
export function ChartFrame({
  height,
  series,
  children,
}: {
  height: number;
  series?: SeriesDef[];
  children: ReactElement;
}) {
  return (
    <div className="chart-body chart-frame">
      {series && series.length > 1 && <ChartLegend series={series} />}
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
