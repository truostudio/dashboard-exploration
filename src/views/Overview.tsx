import type { CSSProperties } from 'react';
import { KPICard, Sparkline } from '../components/KPICard';
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
        <GetStarted steps={steps} onNavigate={onNavigate} onDismiss={onDismissGetStarted} />
      )}

      <section className="kpi-grid">
        <KPICard
          label="Total requests"
          value="2.41M"
          delta={{ value: '+12.4%', trend: 'up' }}
          hint="vs previous 24h"
          spark={<Sparkline data={[10, 14, 9, 17, 22, 19, 26, 31, 28, 36]} trend="up" />}
        />
        <KPICard
          label="Success rate"
          value="99.94%"
          delta={{ value: '+0.05%', trend: 'up' }}
          hint="200-class responses"
          spark={<Sparkline data={[99.7, 99.8, 99.85, 99.9, 99.92, 99.93, 99.94]} trend="up" />}
        />
        <KPICard
          label="Avg latency"
          value="78ms"
          delta={{ value: '-6ms', trend: 'up' }}
          hint="p50 across providers"
          spark={<Sparkline data={[110, 102, 96, 90, 88, 84, 80, 78]} trend="up" />}
        />
        <KPICard
          label="Active chains"
          value="14"
          delta={{ value: '+2', trend: 'up' }}
          hint="of 280 supported"
          spark={<Sparkline data={[8, 9, 10, 10, 12, 12, 13, 14]} trend="neutral" />}
        />
      </section>

      <RequestsChart />

      <section className="two-col">
        <article className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Top endpoints</h2>
              <p className="panel-sub dim">Most-called routes in the last 24h</p>
            </div>
          </header>
          <ul className="list">
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

        <article className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Provider health</h2>
              <p className="panel-sub dim">Routing pool status</p>
            </div>
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

      <RecentRequests />
    </div>
  );
}
