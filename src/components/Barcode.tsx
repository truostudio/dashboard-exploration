import { useMemo } from 'react';

/**
 * Data drawn as ornament.
 *
 * A dense band of vertical rules whose extent and weight come from a real
 * series — request volume, latency, whatever the surface is about. It reads as
 * a barcode or a tape print rather than a chart, which is the point: it gives a
 * panel texture and identity without pretending to be a figure you should read
 * off. The alternatives available to us are a gradient or a grid, and both are
 * the house style of every dashboard shipped this year.
 *
 * Each column is drawn as a thin full range with a heavier body inside it, so
 * the band has grain instead of being a smooth envelope. That is a candlestick,
 * borrowed on purpose: it is the one chart form that already looks like type.
 *
 * Deterministic — generated from the series, never random — so the same data
 * always draws the same band and a screenshot is reproducible.
 */

/** Linear resample, so a 30-bucket series can still draw a 90-column band. */
function resample(values: number[], count: number) {
  if (values.length === 0) return [];
  if (values.length === count) return values;
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const t = (i / (count - 1)) * (values.length - 1);
    const lo = Math.floor(t);
    const hi = Math.min(values.length - 1, lo + 1);
    out.push(values[lo] + (values[hi] - values[lo]) * (t - lo));
  }
  return out;
}

export function Barcode({
  values,
  height = 104,
  columns = 88,
  className = '',
  accentEvery = 11,
}: {
  /** The series to draw. Resampled to `columns`, so any length works. */
  values: number[];
  height?: number;
  /** How many rules to draw. Density is what separates this from a bar chart. */
  columns?: number;
  className?: string;
  /** Every nth column takes the accent colour. 0 disables it. */
  accentEvery?: number;
}) {
  const bars = useMemo(() => {
    const series = resample(values, columns);
    if (series.length === 0) return [];
    const max = Math.max(...series);
    const min = Math.min(...series);
    const span = max - min || 1;

    return series.map((v, i) => {
      const t = (v - min) / span;
      // Second, offset reading of the same series gives each column a body that
      // sits somewhere inside its range rather than filling it.
      const nudge = (Math.sin(i * 1.7) + 1) / 2;
      const range = 0.24 + t * 0.76;
      const body = range * (0.34 + nudge * 0.46);
      return {
        i,
        range,
        body,
        // Body weight steps with the value, so peaks read heavier.
        w: t > 0.66 ? 3 : t > 0.33 ? 2.2 : 1.4,
        accent: accentEvery > 0 && i % accentEvery === 0,
      };
    });
  }, [values, columns, accentEvery]);

  if (bars.length === 0) return null;

  const unit = 4;
  const width = bars.length * unit;

  return (
    <svg
      className={`barcode ${className}`.trim()}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      height={height}
      aria-hidden
      focusable="false"
    >
      {bars.map((b) => {
        const x = b.i * unit + unit / 2;
        const cls = b.accent ? 'barcode-bar is-accent' : 'barcode-bar';
        return (
          <g key={b.i}>
            {/* The range: a hairline, always present so the band never gaps. */}
            <rect
              x={x - 0.35}
              y={height - b.range * height}
              width={0.7}
              height={b.range * height}
              className={`${cls} is-range`}
            />
            {/* The body: the heavier mark that gives the band its texture. */}
            <rect
              x={x - b.w / 2}
              y={height - b.body * height}
              width={b.w}
              height={b.body * height}
              className={cls}
            />
          </g>
        );
      })}
    </svg>
  );
}
