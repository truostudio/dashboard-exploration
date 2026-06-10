import type { CSSProperties } from 'react';
import { KPICard } from '../components/KPICard';
import { RequestsChart } from '../components/RequestsChart';
import { RecentRequests } from '../components/RecentRequests';
import { GetStarted } from '../components/GetStarted';
import type { Step } from '../components/GetStarted';
import { providers, topEndpoints } from '../data/mock';
import type { ViewId } from '../App';

type Props = {
  steps: Step[];
  showGetStarted: boolean;
  onNavigate: (id: ViewId) => void;
  onDismissGetStarted: () => void;
};

export function Overview({ steps, showGetStarted, onNavigate, onDismissGetStarted }: Props) {
  return (
    <div className="view">
      {showGetStarted && (
        <div className="rise rise-1">
          <GetStarted steps={steps} onNavigate={onNavigate} onDismiss={onDismissGetStarted} />
        </div>
      )}

      <section className="kpi-grid rise rise-2">
        <KPICard
          label="Total requests"
          value="2,410,442"
          delta={{ value: '12.4%', trend: 'up' }}
          hint="vs prev 24h"
        />
        <KPICard
          label="Success rate"
          value="99.94%"
          delta={{ value: '0.05%', trend: 'up' }}
          hint="200-class"
        />
        <KPICard
          label="Avg latency"
          value="78 ms"
          delta={{ value: '6 ms', trend: 'up' }}
          hint="p50"
        />
        <KPICard
          label="Active chains"
          value="14"
          delta={{ value: '2', trend: 'up' }}
          hint="of 280"
        />
      </section>

      <section className="bento rise rise-3">
        <RequestsChart />

        <article className="panel marks">
          <header className="panel-head">
            <div>
              <span className="eyebrow">Routing pool</span>
              <h2 className="panel-title">Provider health</h2>
            </div>
            <span className="badge success">{providers.length} online</span>
          </header>
          <ul className="list">
            {providers.slice(0, 6).map((p) => (
              <li key={p.id} className="list-row provider">
                <div className="list-main">
                  <div className="prov-name">
                    <span className={`dot ${p.status === 'operational' ? 'ok' : 'warn'}`} aria-hidden />
                    <span>{p.name}</span>
                  </div>
                  <span className="dim">{p.description}</span>
                </div>
                <span className="mono dim">{p.latencyMs}ms</span>
                <span className="mono">{p.uptime}%</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <article className="panel marks rise rise-4">
        <header className="panel-head">
          <div>
            <span className="eyebrow">Last 24 hours</span>
            <h2 className="panel-title">Top endpoints</h2>
          </div>
        </header>
        <ul className="list cols-2">
          {topEndpoints.map((e) => (
            <li key={e.path} className="list-row">
              <div className="list-main">
                <span className="mono">{e.path}</span>
                <span className="dim">{e.calls.toLocaleString()} calls</span>
              </div>
              <div className="bar" style={{ '--w': `${e.share * 3.4}%` } as CSSProperties}>
                <div className="bar-fill" />
              </div>
              <span className="mono dim list-pct">{e.share}%</span>
            </li>
          ))}
        </ul>
      </article>

      <div className="rise rise-5">
        <RecentRequests />
      </div>
    </div>
  );
}
