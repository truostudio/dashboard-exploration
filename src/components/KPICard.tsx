import type { ReactNode } from 'react';

type Props = {
  label: string;
  value: string;
  delta?: { value: string; trend: 'up' | 'down' | 'neutral' };
  hint?: string;
  spark?: ReactNode;
};

export function KPICard({ label, value, delta, hint, spark }: Props) {
  return (
    <article className="kpi">
      <div className="kpi-row">
        <span className="kpi-label">{label}</span>
        {delta && (
          <span className={`kpi-delta ${delta.trend}`}>{delta.value}</span>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-row bottom">
        {hint && <span className="kpi-hint">{hint}</span>}
        {spark && <div className="kpi-spark">{spark}</div>}
      </div>
    </article>
  );
}

type SparkProps = {
  data: number[];
  trend?: 'up' | 'down' | 'neutral';
};

export function Sparkline({ data, trend = 'up' }: SparkProps) {
  const w = 96;
  const h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(' ');

  const color =
    trend === 'down'
      ? 'var(--ub-danger)'
      : trend === 'neutral'
      ? 'var(--ub-text-3)'
      : 'var(--ub-blue)';

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  );
}
