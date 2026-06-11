import { useState } from 'react';
import type { CSSProperties } from 'react';
import {
  Area, AreaChart, Bar, BarChart, Line, LineChart, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Icon } from '../components/Icons';
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

const tip = {
  background: 'var(--ub-elevated)', border: '1px solid rgba(34,34,34,0.08)',
  borderRadius: '10px', fontSize: 12, fontFamily: 'var(--font-mono)', boxShadow: 'var(--shadow-md)',
} as const;
const ax = { stroke: 'var(--ub-text-3)', fontSize: 11, tickLine: false, style: { fontFamily: 'var(--font-mono)' } } as const;
const fmtK = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`);

function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <article className="panel">
      <header className="panel-head">
        <div>
          <h2 className="panel-title">{title}</h2>
          {sub && <p className="panel-sub dim">{sub}</p>}
        </div>
      </header>
      {children}
    </article>
  );
}

function WidgetRow({ title, render }: { title: string; render: (w: typeof statusWindows[number]) => React.ReactNode }) {
  return (
    <article className="panel widget-panel">
      <h2 className="panel-title widget-title">{title}</h2>
      <div className="widget-tiles">
        {statusWindows.map((w) => (
          <div key={w.label} className="widget-tile">
            <span className="widget-tile-label">{w.label}</span>
            {render(w)}
          </div>
        ))}
      </div>
    </article>
  );
}

export function Analytics() {
  const [tab, setTab] = useState<Tab>('Endpoints');
  const cuPct = Math.round((cuUsed / cuLimit) * 100);

  return (
    <div className="view">
      <div className="tabbar rise rise-1">
        {tabs.map((t) => {
          const I = Icon[tabIcons[t]];
          return (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              <I size={15} /> {t}
            </button>
          );
        })}
      </div>

      <div className="view-swap" key={tab} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {tab === 'Endpoints' && (
          <>
            <WidgetRow title="Endpoint Status" render={(w) => (
              <>
                <span className="widget-tile-num">{w.total.toLocaleString()}</span>
                <div className="widget-tile-tags">
                  <span className="badge success">{w.ok.toLocaleString()} ok</span>
                  <span className="badge danger">{w.failed.toLocaleString()} failed</span>
                </div>
              </>
            )} />

            <Panel title="Requests by Endpoint Over Time" sub="Call volume per endpoint group">
              <div className="chart-body">
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={endpointOverTime} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(34,34,34,0.06)" vertical={false} />
                    <XAxis dataKey="label" {...ax} axisLine={{ stroke: 'rgba(34,34,34,0.08)' }} tickMargin={8} />
                    <YAxis {...ax} axisLine={false} width={40} tickFormatter={fmtK} />
                    <Tooltip contentStyle={tip} />
                    <Area type="monotone" dataKey="token" stackId="1" stroke="var(--ub-blue)" fill="var(--ub-blue)" fillOpacity={0.5} name="Token" />
                    <Area type="monotone" dataKey="rpc" stackId="1" stroke="#9945ff" fill="#9945ff" fillOpacity={0.45} name="JSON-RPC" />
                    <Area type="monotone" dataKey="market" stackId="1" stroke="#16a34a" fill="#16a34a" fillOpacity={0.4} name="Market" />
                    <Area type="monotone" dataKey="other" stackId="1" stroke="var(--ub-border)" fill="var(--ub-border)" fillOpacity={0.4} name="Other" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Request Health Over Time" sub="Successful vs failed requests">
              <div className="chart-body">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={requestHealth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(34,34,34,0.06)" vertical={false} />
                    <XAxis dataKey="label" {...ax} axisLine={{ stroke: 'rgba(34,34,34,0.08)' }} tickMargin={8} />
                    <YAxis {...ax} axisLine={false} width={40} tickFormatter={fmtK} />
                    <Tooltip contentStyle={tip} />
                    <Area type="monotone" dataKey="successful" stroke="#16a34a" strokeWidth={2} fill="#16a34a" fillOpacity={0.12} name="Successful" />
                    <Area type="monotone" dataKey="failed" stroke="var(--ub-danger)" strokeWidth={1.5} fill="var(--ub-danger)" fillOpacity={0.12} name="Failed" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Endpoint Calls" sub="Call count per endpoint path">
              <ul className="list">
                {endpointCalls.map((e) => (
                  <li key={e.name} className="list-row">
                    <div className="list-main"><span className="mono">{e.name}</span><span className="dim">{e.calls.toLocaleString()} calls</span></div>
                    <div className="bar" style={{ '--w': `${e.share}%` } as CSSProperties}><div className="bar-fill" /></div>
                    <span className="mono dim list-pct">{e.share}%</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Status Codes" sub="Status code distribution per endpoint">
              <div className="donut-row">
                <div className="donut"><div className="donut-center"><span className="donut-num">{statusCodes[0].pct}%</span><span className="dim" style={{ fontSize: 11 }}>2xx</span></div></div>
                <ul className="legend">
                  {statusCodes.map((s) => (
                    <li key={s.code}><span className={`legend-dot ${s.tone}`} /><span className="legend-label">{s.code} <span className="dim">{s.label}</span></span><span className="mono legend-val">{s.count.toLocaleString()}</span></li>
                  ))}
                </ul>
              </div>
            </Panel>
          </>
        )}

        {tab === 'JSON-RPC' && (
          <>
            <Panel title="JSON-RPC Methods" sub="Call count per JSON-RPC method">
              <div className="chart-body">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={rpcMethodCalls} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
                    <CartesianGrid stroke="rgba(34,34,34,0.06)" horizontal={false} />
                    <XAxis type="number" {...ax} axisLine={false} tickFormatter={fmtK} />
                    <YAxis type="category" dataKey="name" {...ax} axisLine={false} width={180} />
                    <Tooltip contentStyle={tip} cursor={{ fill: 'rgba(31,182,255,0.06)' }} />
                    <Bar dataKey="calls" fill="var(--ub-blue)" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <section className="bento">
              <Panel title="JSON-RPC Chains" sub="Call count per blockchain chain">
                <ul className="list">
                  {rpcChainCalls.map((c) => {
                    const max = rpcChainCalls[0].calls;
                    return (
                      <li key={c.name} className="list-row">
                        <div className="list-main"><span className="prov-name"><span className="chain-mark" style={{ background: c.color, width: 10, height: 10 }} />{c.name}</span></div>
                        <div className="bar" style={{ '--w': `${(c.calls / max) * 100}%` } as CSSProperties}><div className="bar-fill" /></div>
                        <span className="mono dim list-pct">{(c.calls / 1000).toFixed(0)}k</span>
                      </li>
                    );
                  })}
                </ul>
              </Panel>
              <Panel title="JSON-RPC Success Rate" sub="Success vs failure rate for JSON-RPC requests">
                <div className="donut-row">
                  <div className="donut"><div className="donut-center"><span className="donut-num">99.7%</span><span className="dim" style={{ fontSize: 11 }}>ok</span></div></div>
                  <ul className="legend">
                    <li><span className="legend-dot success" /><span className="legend-label">Success</span><span className="mono legend-val">289,238</span></li>
                    <li><span className="legend-dot danger" /><span className="legend-label">Failure</span><span className="mono legend-val">870</span></li>
                  </ul>
                </div>
              </Panel>
            </section>

            <Panel title="JSON-RPC Batch Requests" sub="Batch vs non-batch JSON-RPC requests">
              <div className="batch-row">
                {rpcBatch.map((b) => (
                  <div key={b.label} className="batch-item">
                    <div className="batch-head"><span>{b.label}</span><span className="mono">{b.value}%</span></div>
                    <div className="bar"><div className="bar-fill" style={{ width: `${b.value}%`, background: b.color }} /></div>
                  </div>
                ))}
              </div>
            </Panel>
          </>
        )}

        {tab === 'Compute Units' && (
          <>
            <Panel title="Compute Units" sub="Usage against your monthly allowance">
              <div className="cu-summary">
                <div className="cu-summary-head">
                  <span className="kpi-tile-num">{cuUsed.toLocaleString()}</span>
                  <span className="dim">of {cuLimit.toLocaleString()} CUs · {cuPct}%</span>
                </div>
                <div className="usage-bar"><div className="usage-bar-fill" style={{ width: `${cuPct}%` }} /></div>
              </div>
            </Panel>
            <Panel title="Compute Units Over Time" sub="HTTP compute units consumed">
              <div className="chart-body">
                <ResponsiveContainer width="100%" height={230}>
                  <AreaChart data={computeSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs><linearGradient id="cuA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--ub-blue)" stopOpacity={0.26} /><stop offset="100%" stopColor="var(--ub-blue)" stopOpacity={0.02} /></linearGradient></defs>
                    <CartesianGrid stroke="rgba(34,34,34,0.06)" vertical={false} />
                    <XAxis dataKey="label" {...ax} axisLine={{ stroke: 'rgba(34,34,34,0.08)' }} tickMargin={8} />
                    <YAxis {...ax} axisLine={false} width={44} tickFormatter={fmtK} />
                    <Tooltip contentStyle={tip} />
                    <Area type="monotone" dataKey="http" stroke="var(--ub-blue)" strokeWidth={2} fill="url(#cuA)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title="WebSocket Compute Units Over Time" sub="WSS compute units consumed">
              <div className="chart-body">
                <ResponsiveContainer width="100%" height={210}>
                  <AreaChart data={computeSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(34,34,34,0.06)" vertical={false} />
                    <XAxis dataKey="label" {...ax} axisLine={{ stroke: 'rgba(34,34,34,0.08)' }} tickMargin={8} />
                    <YAxis {...ax} axisLine={false} width={44} tickFormatter={fmtK} />
                    <Tooltip contentStyle={tip} />
                    <Area type="monotone" dataKey="wss" stroke="#9945ff" strokeWidth={2} fill="#9945ff" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title="Compute Unit Breakdown" sub="CUs by API surface">
              <ul className="list">
                {cuBreakdown.map((c) => (
                  <li key={c.name} className="list-row">
                    <div className="list-main"><span>{c.name}</span></div>
                    <div className="bar" style={{ '--w': `${c.share}%` } as CSSProperties}><div className="bar-fill" /></div>
                    <span className="mono dim list-pct">{(c.cu / 1_000_000).toFixed(2)}M</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </>
        )}

        {tab === 'Latency' && (
          <>
            <WidgetRow title="Latency" render={(w) => <span className="widget-tile-num">{w.latency} ms</span>} />
            <Panel title="Average Latency Over Time" sub="p50 / p95 / p99 across providers">
              <div className="chart-body">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={latencySeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(34,34,34,0.06)" vertical={false} />
                    <XAxis dataKey="label" {...ax} axisLine={{ stroke: 'rgba(34,34,34,0.08)' }} tickMargin={8} />
                    <YAxis {...ax} axisLine={false} width={44} tickFormatter={(v) => `${v}ms`} />
                    <Tooltip contentStyle={tip} formatter={(v) => `${v} ms`} />
                    <Line type="monotone" dataKey="p50" stroke="var(--ub-blue)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="p95" stroke="#9945ff" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="p99" stroke="var(--ub-warning)" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </>
        )}
      </div>
    </div>
  );
}
