import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { requestSeries } from '../data/mock';

const ranges = ['24h', '7d', '30d', '90d'] as const;

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}

export function RequestsChart() {
  const [range, setRange] = useState<(typeof ranges)[number]>('24h');

  const data = useMemo(() => {
    if (range === '24h') return requestSeries;
    const factor = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    return requestSeries.map((p) => ({
      ...p,
      requests: Math.round(p.requests * factor * (0.85 + Math.random() * 0.3)),
      errors: Math.round(p.errors * factor * (0.85 + Math.random() * 0.3)),
    }));
  }, [range]);

  const total = data.reduce((s, p) => s + p.requests, 0);

  return (
    <section className="panel chart marks">
      <header className="panel-head">
        <div>
          <span className="eyebrow">Throughput</span>
          <h2 className="panel-title">Total requests</h2>
          <div className="chart-hero">
            <span className="chart-hero-num">{total.toLocaleString()}</span>
            <span className="dim">requests · last {range}</span>
          </div>
        </div>
        <div className="seg">
          {ranges.map((r) => (
            <button
              key={r}
              className={`seg-item ${range === r ? 'active' : ''}`}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </header>

      <div className="chart-body">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="reqFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--ub-blue)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--ub-blue)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="rgba(34, 34, 34, 0.06)"
              strokeDasharray="0"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              stroke="var(--ub-text-3)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(34, 34, 34, 0.08)', strokeWidth: 1 }}
              tickMargin={8}
              style={{ fontFamily: 'var(--font-mono)' }}
            />
            <YAxis
              stroke="var(--ub-text-3)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatNumber}
              width={40}
              style={{ fontFamily: 'var(--font-mono)' }}
            />
            <Tooltip
              cursor={{ stroke: 'rgba(31, 182, 255, 0.35)', strokeWidth: 1 }}
              contentStyle={{
                background: 'var(--ub-elevated)',
                border: '1px solid rgba(34, 34, 34, 0.08)',
                borderRadius: '10px',
                fontSize: 12,
                color: 'var(--ub-black)',
                fontFamily: 'var(--font-mono)',
                boxShadow: 'var(--shadow-md)',
              }}
              labelStyle={{ color: 'var(--ub-text-2)' }}
              formatter={(v) => formatNumber(Number(v))}
            />
            <Area
              type="monotone"
              dataKey="requests"
              stroke="var(--ub-blue)"
              strokeWidth={2}
              fill="url(#reqFill)"
              activeDot={{
                r: 4,
                stroke: 'var(--ub-blue)',
                strokeWidth: 1.5,
                fill: 'var(--ub-white)',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
