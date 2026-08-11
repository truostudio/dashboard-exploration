import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Icon } from '../Icons';

/* ---------------- Num ---------------- */

const still = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Decimal places in the target, so intermediate frames can be snapped to the
 * same precision. Without this a count toward 80,348 renders "53,561.673" on
 * the way: `toLocaleString` has no reason to hide decimals the caller never
 * expected to exist, and the formatter cannot know the value is mid-flight.
 */
function places(n: number) {
  const dot = String(n).indexOf('.');
  return dot < 0 ? 0 : Math.min(6, String(n).length - dot - 1);
}

/**
 * A figure that counts up to its value instead of appearing at it.
 *
 * Takes the number and the formatter rather than formatted text, because the
 * whole point is to format each intermediate frame — handed a string there is
 * nothing to interpolate.
 *
 * Runs on mount by design. The Analytics view remounts its tab on every range
 * and chain change, so mount *is* the moment the figure becomes true, and
 * animating from the previous value would need state that no longer exists.
 */
export function Num({
  value,
  format,
  duration = 560,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
}) {
  const [shown, setShown] = useState(() => (still() ? value : 0));
  const from = useRef(shown);

  useEffect(() => {
    if (still() || from.current === value) {
      setShown(value);
      from.current = value;
      return;
    }
    const a = from.current;
    const t0 = performance.now();
    const q = 10 ** places(value);
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      // Cubic ease-out: fast enough to read as a response, settles rather than
      // stopping dead on the final digit.
      const v = a + (value - a) * (1 - Math.pow(1 - p, 3));
      setShown(p < 1 ? Math.round(v * q) / q : value);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  // Tabular figures, so the width does not jitter while the digits run.
  return <span className="num-roll">{format(shown)}</span>;
}

/* ---------------- Sparkline ---------------- */

/**
 * Inline trend line for a table cell. Hand-built SVG rather than a Recharts
 * chart: one of these renders per row, and nineteen ResponsiveContainers in a
 * table body costs more than the whole rest of the view.
 */
export function Sparkline({
  points,
  width = 72,
  height = 20,
  className = '',
}: {
  points: number[];
  width?: number;
  height?: number;
  className?: string;
}) {
  if (points.length < 2) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  // A flat series has no range to divide by; park it on the midline.
  const span = max - min || 1;
  const step = width / (points.length - 1);
  const y = (v: number) => height - 1 - ((v - min) / span) * (height - 2);
  const d = points.map((v, i) => `${i ? 'L' : 'M'}${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const last = points[points.length - 1];
  return (
    <svg
      className={`sparkline ${className}`.trim()}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      focusable="false"
    >
      <path d={`${d} L${width},${height} L0,${height} Z`} className="sparkline-fill" />
      <path d={d} className="sparkline-line" />
      <circle cx={width} cy={y(last)} r="1.8" className="sparkline-dot" />
    </svg>
  );
}

/* ---------------- Delta ---------------- */

/**
 * Period-over-period change. The arrow follows the sign and the colour follows
 * `good`, because the two come apart constantly here: requests up is good,
 * latency up is not, and a figure with no baseline says nothing at all.
 */
export function Delta({
  pct,
  good,
  since,
}: {
  pct: number;
  good: boolean;
  /** Names the baseline, e.g. "prior week". Without it the number is a riddle. */
  since?: ReactNode;
}) {
  const flat = Math.abs(pct) < 0.05;
  const Arrow = pct > 0 ? Icon.Up : Icon.Down;
  return (
    <span className={`delta ${flat ? 'flat' : good ? 'good' : 'bad'}`}>
      {!flat && <Arrow size={11} weight="bold" />}
      <span className="mono">
        {flat ? '±0%' : `${pct > 0 ? '+' : '−'}${Math.abs(pct).toFixed(1)}%`}
      </span>
      {since && <span className="delta-since">vs {since}</span>}
    </span>
  );
}

/* ---------------- Spec ---------------- */

export type SpecRow = { label: ReactNode; value: ReactNode };

/** Label/value rows in tabular mono, so figures stay comparable across cards. */
export function Spec({ rows }: { rows: SpecRow[] }) {
  return (
    <dl className="spec">
      {rows.map((row, i) => (
        <div className="spec-row" key={i}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------------- Bar list ---------------- */

export type BarItem = {
  id: string;
  label: ReactNode;
  /** Secondary line under the label. */
  meta?: ReactNode;
  /** Fill width, 0–100. */
  share: number;
  /** Right-hand figure. */
  value: ReactNode;
  /** Overrides the fill colour. */
  color?: string;
};

/** Ranked rows with a proportional bar, used for call counts and CU breakdowns. */
export function BarList({ items }: { items: BarItem[] }) {
  return (
    <ul className="list">
      {items.map((item) => (
        <li key={item.id} className="list-row">
          <div className="list-main">
            <span>{item.label}</span>
            {item.meta && <span className="dim">{item.meta}</span>}
          </div>
          <div className="bar" style={{ '--w': `${item.share}%` } as CSSProperties}>
            <div className="bar-fill" style={item.color ? { background: item.color } : undefined} />
          </div>
          <span className="mono dim list-pct">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}

/* ---------------- Stat tiles ---------------- */

export type StatTile = {
  id: string;
  label: ReactNode;
  value: ReactNode;
  /** Extra row under the figure, e.g. ok/failed badges. */
  foot?: ReactNode;
};

/** A bordered row of figures. `columns` fixes the grid; otherwise tiles flex. */
export function StatTiles({ tiles, columns }: { tiles: StatTile[]; columns?: number }) {
  return (
    <div
      className={columns ? 'kpi-tiles' : 'widget-tiles'}
      style={columns ? ({ gridTemplateColumns: `repeat(${columns}, 1fr)` } as CSSProperties) : undefined}
    >
      {tiles.map((tile) => (
        <div key={tile.id} className={columns ? 'kpi-tile' : 'widget-tile'}>
          {columns ? (
            <>
              <span className="kpi-tile-num">{tile.value}</span>
              <span className="kpi-tile-label">{tile.label}</span>
              {tile.foot && <div className="kpi-tile-foot">{tile.foot}</div>}
            </>
          ) : (
            <>
              <span className="widget-tile-label">{tile.label}</span>
              <span className="widget-tile-num">{tile.value}</span>
              {tile.foot && <div className="widget-tile-tags">{tile.foot}</div>}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------------- Meter ---------------- */

/** Single horizontal progress bar. `size` picks the track weight. */
export function Meter({
  value,
  size = 'md',
  color,
}: {
  /** 0–100. */
  value: number;
  size?: 'sm' | 'md';
  color?: string;
}) {
  const track = size === 'sm' ? 'qs-bar' : 'usage-bar';
  const fill = size === 'sm' ? 'qs-bar-fill' : 'usage-bar-fill';
  return (
    <div className={track} aria-hidden>
      <div
        className={fill}
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, ...(color ? { background: color } : null) }}
      />
    </div>
  );
}

/* ---------------- Legend ---------------- */

export type LegendItem = {
  id: string;
  label: ReactNode;
  value: ReactNode;
  tone?: 'success' | 'warning' | 'danger';
};

export function Legend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="legend">
      {items.map((item) => (
        <li key={item.id}>
          <span className={`legend-dot ${item.tone ?? ''}`.trim()} />
          <span className="legend-label">{item.label}</span>
          <span className="mono legend-val">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}

/* ---------------- Empty ---------------- */

export function Empty({
  children,
  bare,
  icon,
  title,
}: {
  children?: ReactNode;
  bare?: boolean;
  /** Adds an icon + title above the description, the "no data yet" shape charts and stat panels want. */
  icon?: ReactNode;
  title?: ReactNode;
}) {
  if (!icon && !title) {
    return <div className={`empty ${bare ? 'empty-bare' : ''}`.trim()}>{children}</div>;
  }
  return (
    <div className={`empty empty-rich ${bare ? 'empty-bare' : ''}`.trim()}>
      {icon && <span className="empty-icon">{icon}</span>}
      {title && <p className="empty-title">{title}</p>}
      {children && <p className="empty-desc">{children}</p>}
    </div>
  );
}
