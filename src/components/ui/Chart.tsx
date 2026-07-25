import type { ReactElement, ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';

/**
 * Shared Recharts theme. Views must not pass their own axis/tooltip/grid
 * styling. Recharts takes inline style objects, and those silently escape the
 * CSS system (they kept their own border-radius after the app went square).
 */

export const chartAxis = {
  stroke: 'var(--ub-text-3)',
  fontSize: 12,
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
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

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
      </ul>
    </div>
  );
}

/** Plot area with corner ticks, so a chart reads as an instrument panel. */
export function ChartFrame({ height, children }: { height: number; children: ReactElement }) {
  return (
    <div className="chart-body chart-frame">
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
