import type { CSSProperties } from 'react';
import { Icon } from '../components/Icons';
import { invoices, plans } from '../data/mock';

const usage = {
  cuUsed:    7_840_000,
  cuLimit:   40_000_000,
  requests:  3_120_244,
  bandwidth: '184 GB',
  errors:    742,
  byEndpoint: [
    { path: '/token/balance',     pct: 32 },
    { path: 'eth_call',           pct: 24 },
    { path: '/market/price',      pct: 16 },
    { path: '/nft/metadata',      pct: 12 },
    { path: 'eth_getBalance',     pct:  9 },
    { path: 'other',              pct:  7 },
  ],
};

function pct(used: number, total: number) {
  return Math.min(100, (used / total) * 100);
}

export function SettingsBilling() {
  const cuPct = pct(usage.cuUsed, usage.cuLimit);

  return (
    <div className="view">
      <section className="panel plan-panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Current plan</h2>
            <p className="panel-sub dim">You're on the Free plan, billed monthly. Renews May 31.</p>
          </div>
          <div className="plan-tag">
            <span className="badge new">FREE</span>
            <span className="pixel plan-tag-name">Startup</span>
          </div>
        </header>

        <div className="usage-grid">
          <div className="usage-card">
            <span className="kpi-label">Compute units</span>
            <div className="usage-row">
              <span className="pixel usage-num">{(usage.cuUsed / 1e6).toFixed(2)}M</span>
              <span className="dim mono">/ {(usage.cuLimit / 1e6).toFixed(0)}M</span>
            </div>
            <div className="usage-bar"><div className="usage-bar-fill" style={{ width: `${cuPct}%` }} /></div>
            <span className="dim mono">{cuPct.toFixed(1)}% used · resets May 31</span>
          </div>

          <div className="usage-card">
            <span className="kpi-label">Requests</span>
            <div className="usage-row">
              <span className="pixel usage-num">{(usage.requests / 1e6).toFixed(2)}M</span>
              <span className="dim mono">this period</span>
            </div>
            <div className="usage-bar"><div className="usage-bar-fill" style={{ width: '24%' }} /></div>
            <span className="dim mono">+12.4% vs last month</span>
          </div>

          <div className="usage-card">
            <span className="kpi-label">Bandwidth</span>
            <div className="usage-row">
              <span className="pixel usage-num">{usage.bandwidth}</span>
              <span className="dim mono">egress</span>
            </div>
            <div className="usage-bar"><div className="usage-bar-fill" style={{ width: '38%' }} /></div>
            <span className="dim mono">All regions combined</span>
          </div>

          <div className="usage-card">
            <span className="kpi-label">Errors</span>
            <div className="usage-row">
              <span className="pixel usage-num">{usage.errors}</span>
              <span className="dim mono">0.024%</span>
            </div>
            <div className="usage-bar"><div className="usage-bar-fill warn" style={{ width: '4%' }} /></div>
            <span className="dim mono">Within healthy threshold</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Plans</h2>
            <p className="panel-sub dim">Pick a plan that matches the volume you're shipping.</p>
          </div>
          <button className="btn ghost"><Icon.External size={13} /> Compare in detail</button>
        </header>

        <div className="plans-grid">
          {plans.map((p) => (
            <article key={p.id} className={`plan-card ${p.current ? 'current' : ''}`}>
              <div className="plan-card-head">
                <span className="plan-name pixel">{p.name}</span>
                {p.current && <span className="badge new">Current</span>}
              </div>
              <div className="plan-price">
                <span className="pixel plan-price-num">{p.price}</span>
                <span className="dim mono">/ mo</span>
              </div>
              <span className="dim mono plan-cu">{p.cu}</span>
              <ul className="plan-features">
                {p.highlights.map((h) => (
                  <li key={h}><Icon.Check size={12} /> <span>{h}</span></li>
                ))}
              </ul>
              <button className={`btn ${p.current ? 'ghost' : 'primary'} plan-cta`} disabled={p.current}>
                {p.cta}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="two-col">
        <article className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Payment method</h2>
              <p className="panel-sub dim">No card on file — add one to lift the free-plan cap.</p>
            </div>
          </header>
          <div className="card-stub">
            <div className="card-stub-row">
              <Icon.Card size={16} />
              <span className="dim">No payment method</span>
            </div>
            <div className="card-stub-row">
              <button className="btn primary"><Icon.Plus size={13} /> Add card</button>
              <button className="btn">Use ACH</button>
            </div>
          </div>
        </article>

        <article className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Top spend by endpoint</h2>
              <p className="panel-sub dim">Where your CUs went this period</p>
            </div>
          </header>
          <ul className="list">
            {usage.byEndpoint.map((e) => (
              <li key={e.path} className="list-row">
                <div className="list-main">
                  <span className="mono">{e.path}</span>
                </div>
                <div className="bar" style={{ '--w': `${e.pct * 2.8}%` } as CSSProperties}>
                  <div className="bar-fill" />
                </div>
                <span className="mono dim list-pct">{e.pct}%</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Invoices</h2>
            <p className="panel-sub dim">Past billing periods</p>
          </div>
          <button className="btn ghost"><Icon.Download size={13} /> Download all</button>
        </header>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Period</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="num"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="mono">{inv.id}</td>
                  <td>{inv.period}</td>
                  <td className="muted">{inv.date}</td>
                  <td className="mono">{inv.amount}</td>
                  <td><span className="badge success">{inv.status}</span></td>
                  <td className="num">
                    <button className="btn ghost icon-only" aria-label="Download"><Icon.Download size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
