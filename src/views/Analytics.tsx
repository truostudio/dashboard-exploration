import { useState } from 'react';
import type { CSSProperties } from 'react';
import {
  Area, AreaChart, Bar, BarChart, Line, LineChart, CartesianGrid, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Icon } from '../components/Icons';
import { SquareMeter } from '../components/SquareMeter';
import { Segmented } from '../components/Segmented';
import { TitledPanel, Panel, Badge, BarList, StatTiles, Legend, Meter } from '../components/ui';
import {
  ChartFrame, ChartTooltip, chartAxis, chartAxisLine, chartGrid, chartCursor, chartBarCursor,
} from '../components/ui/Chart';
import {
  statusWindows, endpointOverTime, requestHealth, endpointCalls, statusCodes,
  rpcMethodCalls, rpcChainCalls, rpcBatch, computeSeries, latencySeries,
  cuUsed, cuLimit, cuBreakdown,
} from '../data/mock';

const tabs = ['Endpoints', 'JSON-RPC', 'Compute Units', 'Latency'] as const;
type Tab = (typeof tabs)[number];
const tabIcons: Record<Tab, keyof typeof Icon> = {
  Endpoints: 'Chart', 'JSON-RPC': 'Code', 'Compute Units': 'Coin', Latency: 'Refresh',
};

// Categorical series palette, anchored on the Uniblock blue
const series = {
  c1: 'var(--ub-blue)',
  c2: 'var(--ub-violet)',
  c3: 'var(--ub-success)',
  c4: 'var(--ub-border)',
} as const;
const fmtK = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`);

/** Windowed figures (past hour / 30 days / year) shown as a bordered tile row. */
function WidgetRow({
  title,
  value,
  foot,
}: {
  title: string;
  value: (w: (typeof statusWindows)[number]) => React.ReactNode;
  foot?: (w: (typeof statusWindows)[number]) => React.ReactNode;
}) {
  return (
    <Panel className="widget-panel">
      <h2 className="panel-title widget-title">{title}</h2>
      <StatTiles
        tiles={statusWindows.map((w) => ({
          id: w.label,
          label: w.label,
          value: value(w),
          foot: foot?.(w),
        }))}
      />
    </Panel>
  );
}

export function Analytics() {
  const [tab, setTab] = useState<Tab>('Endpoints');
  const cuPct = Math.round((cuUsed / cuLimit) * 100);

  return (
    <div className="view">
      <div className="rise rise-1">
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
      </div>

      <div className="view-swap view-stack" key={tab}>
        {tab === 'Endpoints' && (
          <>
            <WidgetRow
              title="Endpoint Status"
              value={(w) => w.total.toLocaleString()}
              foot={(w) => (
                <>
                  <Badge tone="success">{w.ok.toLocaleString()} ok</Badge>
                  <Badge tone="danger">{w.failed.toLocaleString()} failed</Badge>
                </>
              )}
            />

            <TitledPanel title="Requests by Endpoint Over Time" sub="Call volume per endpoint group">
              <ChartFrame height={240}>
                  <AreaChart data={endpointOverTime} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid {...chartGrid} />
                    <XAxis dataKey="label" {...chartAxis} axisLine={chartAxisLine} tickMargin={8} />
                    <YAxis {...chartAxis} axisLine={false} width={40} tickFormatter={fmtK} />
                    <Tooltip content={<ChartTooltip />} cursor={chartCursor} />
                    <Area type="monotone" dataKey="token" stackId="1" stroke={series.c1} fill={series.c1} fillOpacity={0.5} name="Token" />
                    <Area type="monotone" dataKey="rpc" stackId="1" stroke={series.c2} fill={series.c2} fillOpacity={0.4} name="JSON-RPC" />
                    <Area type="monotone" dataKey="market" stackId="1" stroke={series.c3} fill={series.c3} fillOpacity={0.35} name="Market" />
                    <Area type="monotone" dataKey="other" stackId="1" stroke={series.c4} fill={series.c4} fillOpacity={0.45} name="Other" />
                  </AreaChart>
              </ChartFrame>
            </TitledPanel>

            <TitledPanel title="Request Health Over Time" sub="Successful vs failed requests">
              <ChartFrame height={220}>
                  <AreaChart data={requestHealth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid {...chartGrid} />
                    <XAxis dataKey="label" {...chartAxis} axisLine={chartAxisLine} tickMargin={8} />
                    <YAxis {...chartAxis} axisLine={false} width={40} tickFormatter={fmtK} />
                    <Tooltip content={<ChartTooltip />} cursor={chartCursor} />
                    <Area type="monotone" dataKey="successful" stroke={series.c3} strokeWidth={2} fill={series.c3} fillOpacity={0.12} name="Successful" />
                    <Area type="monotone" dataKey="failed" stroke="var(--ub-danger)" strokeWidth={1.5} fill="var(--ub-danger)" fillOpacity={0.12} name="Failed" />
                  </AreaChart>
              </ChartFrame>
            </TitledPanel>

            <TitledPanel title="Endpoint Calls" sub="Call count per endpoint path">
              <BarList
                items={endpointCalls.map((e) => ({
                  id: e.name,
                  label: <span className="mono">{e.name}</span>,
                  meta: `${e.calls.toLocaleString()} calls`,
                  share: e.share,
                  value: `${e.share}%`,
                }))}
              />
            </TitledPanel>

            <TitledPanel title="Status Codes" sub="Status code distribution per endpoint">
              <div className="donut-row">
                <SquareMeter
                  value={`${statusCodes[0].pct}%`}
                  caption="2xx"
                  segments={statusCodes.map((s) => ({
                    value: s.pct,
                    color:
                      s.tone === 'success' ? 'var(--ub-blue)'
                      : s.tone === 'warning' ? 'var(--ub-warning)'
                      : 'var(--ub-danger)',
                  }))}
                />
                <Legend
                  items={statusCodes.map((s) => ({
                    id: s.code,
                    tone: s.tone,
                    label: <>{s.code} <span className="dim">{s.label}</span></>,
                    value: s.count.toLocaleString(),
                  }))}
                />
              </div>
            </TitledPanel>
          </>
        )}

        {tab === 'JSON-RPC' && (
          <>
            <TitledPanel title="JSON-RPC Methods" sub="Call count per JSON-RPC method">
              <ChartFrame height={260}>
                  <BarChart data={rpcMethodCalls} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
                    <CartesianGrid stroke="var(--ub-line)" horizontal={false} vertical />
                    <XAxis type="number" {...chartAxis} axisLine={false} tickFormatter={fmtK} />
                    <YAxis type="category" dataKey="name" {...chartAxis} axisLine={false} width={180} />
                    <Tooltip content={<ChartTooltip />} cursor={chartBarCursor} />
                    <Bar dataKey="calls" fill="var(--ub-blue)" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
              </ChartFrame>
            </TitledPanel>

            <section className="bento">
              <TitledPanel title="JSON-RPC Chains" sub="Call count per blockchain chain">
                <BarList
                  items={rpcChainCalls.map((c) => ({
                    id: c.name,
                    label: (
                      <span className="prov-name">
                        <span className="chain-mark sm" style={{ background: c.color } as CSSProperties} />
                        {c.name}
                      </span>
                    ),
                    share: (c.calls / rpcChainCalls[0].calls) * 100,
                    value: `${(c.calls / 1000).toFixed(0)}k`,
                  }))}
                />
              </TitledPanel>
              <TitledPanel title="JSON-RPC Success Rate" sub="Success vs failure rate for JSON-RPC requests">
                <div className="donut-row">
                  <SquareMeter
                    value="99.7%"
                    caption="ok"
                    segments={[
                      { value: 99.7, color: 'var(--ub-blue)' },
                      { value: 0.3, color: 'var(--ub-danger)' },
                    ]}
                  />
                  <Legend
                    items={[
                      { id: 'ok', tone: 'success', label: 'Success', value: '289,238' },
                      { id: 'fail', tone: 'danger', label: 'Failure', value: '870' },
                    ]}
                  />
                </div>
              </TitledPanel>
            </section>

            <TitledPanel title="JSON-RPC Batch Requests" sub="Batch vs non-batch JSON-RPC requests">
              <div className="batch-row">
                {rpcBatch.map((b) => (
                  <div key={b.label} className="batch-item">
                    <div className="batch-head"><span>{b.label}</span><span className="mono">{b.value}%</span></div>
                    <Meter value={b.value} size="sm" color={b.color} />
                  </div>
                ))}
              </div>
            </TitledPanel>
          </>
        )}

        {tab === 'Compute Units' && (
          <>
            <TitledPanel title="Compute Units" sub="Usage against your monthly allowance">
              <div className="cu-summary">
                <div className="cu-summary-head">
                  <span className="kpi-tile-num">{cuUsed.toLocaleString()}</span>
                  <span className="dim">of {cuLimit.toLocaleString()} CUs · {cuPct}%</span>
                </div>
                <Meter value={cuPct} />
              </div>
            </TitledPanel>
            <TitledPanel title="Compute Units Over Time" sub="HTTP compute units consumed">
              <ChartFrame height={230}>
                  <AreaChart data={computeSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs><linearGradient id="cuA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--ub-blue)" stopOpacity={0.26} /><stop offset="100%" stopColor="var(--ub-blue)" stopOpacity={0.02} /></linearGradient></defs>
                    <CartesianGrid {...chartGrid} />
                    <XAxis dataKey="label" {...chartAxis} axisLine={chartAxisLine} tickMargin={8} />
                    <YAxis {...chartAxis} axisLine={false} width={44} tickFormatter={fmtK} />
                    <Tooltip content={<ChartTooltip />} cursor={chartCursor} />
                    <Area type="monotone" dataKey="http" stroke="var(--ub-blue)" strokeWidth={2} fill="url(#cuA)" />
                  </AreaChart>
              </ChartFrame>
            </TitledPanel>
            <TitledPanel title="WebSocket Compute Units Over Time" sub="WSS compute units consumed">
              <ChartFrame height={210}>
                  <AreaChart data={computeSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid {...chartGrid} />
                    <XAxis dataKey="label" {...chartAxis} axisLine={chartAxisLine} tickMargin={8} />
                    <YAxis {...chartAxis} axisLine={false} width={44} tickFormatter={fmtK} />
                    <Tooltip content={<ChartTooltip />} cursor={chartCursor} />
                    <Area type="monotone" dataKey="wss" stroke={series.c2} strokeWidth={2} fill={series.c2} fillOpacity={0.1} />
                  </AreaChart>
              </ChartFrame>
            </TitledPanel>
            <TitledPanel title="Compute Unit Breakdown" sub="CUs by API surface">
              <BarList
                items={cuBreakdown.map((c) => ({
                  id: c.name,
                  label: c.name,
                  share: c.share,
                  value: `${(c.cu / 1_000_000).toFixed(2)}M`,
                }))}
              />
            </TitledPanel>
          </>
        )}

        {tab === 'Latency' && (
          <>
            <WidgetRow title="Latency" value={(w) => `${w.latency} ms`} />
            <TitledPanel title="Average Latency Over Time" sub="p50 / p95 / p99 across providers">
              <ChartFrame height={240}>
                  <LineChart data={latencySeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid {...chartGrid} />
                    <XAxis dataKey="label" {...chartAxis} axisLine={chartAxisLine} tickMargin={8} />
                    <YAxis {...chartAxis} axisLine={false} width={44} tickFormatter={(v) => `${v}ms`} />
                    <Tooltip content={<ChartTooltip valueFormatter={(v) => `${v} ms`} />} cursor={chartCursor} />
                    <Line type="monotone" dataKey="p50" stroke="var(--ub-blue)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="p95" stroke={series.c2} strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="p99" stroke="var(--ub-warning)" strokeWidth={1.5} dot={false} />
                  </LineChart>
              </ChartFrame>
            </TitledPanel>
          </>
        )}
      </div>
    </div>
  );
}
