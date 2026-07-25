import type { CSSProperties, ReactNode } from 'react';

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
  /** Adds an icon + title above the description — the "no data yet" shape charts and stat panels want. */
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
