import type { CSSProperties } from 'react';
import { Icon } from '../components/Icons';
import { invoices, plans, cuUsed, cuLimit, cuBreakdown } from '../data/mock';

export function SettingsBilling() {
  const current = plans.find((p) => p.current)!;
  const cuPct = Math.round((cuUsed / cuLimit) * 100);

  return (
    <div className="view">
      {/* Plan summary */}
      <article className="panel rise rise-1">
        <header className="panel-head">
          <div>
            <span className="eyebrow">Current subscription</span>
            <h2 className="panel-title">{current.name} Plan</h2>
            <p className="panel-sub dim">Renews monthly · next invoice Jul 1, 2026</p>
          </div>
          <button className="btn primary">Upgrade plan</button>
        </header>
        <div className="cu-summary">
          <div className="cu-summary-head">
            <span className="kpi-tile-num">{cuUsed.toLocaleString()}</span>
            <span className="dim">of {cuLimit.toLocaleString()} compute units · {cuPct}%</span>
          </div>
          <div className="usage-bar"><div className="usage-bar-fill" style={{ width: `${cuPct}%` }} /></div>
        </div>
      </article>

      {/* Compute units breakdown */}
      <article className="panel rise rise-2">
        <header className="panel-head"><div><span className="eyebrow">This cycle</span><h2 className="panel-title">Compute Units</h2></div></header>
        <ul className="list">
          {cuBreakdown.map((c) => (
            <li key={c.name} className="list-row">
              <div className="list-main"><span>{c.name}</span></div>
              <div className="bar" style={{ '--w': `${c.share}%` } as CSSProperties}><div className="bar-fill" /></div>
              <span className="mono dim list-pct">{(c.cu / 1_000_000).toFixed(2)}M</span>
            </li>
          ))}
        </ul>
      </article>

      {/* Plans */}
      <article className="panel rise rise-3">
        <header className="panel-head"><div><span className="eyebrow">Uniblock plans</span><h2 className="panel-title">Plans</h2></div></header>
        <div className="plans-grid">
          {plans.map((p) => (
            <div key={p.id} className={`plan-card ${p.current ? 'current' : ''}`}>
              <div className="plan-card-head">
                <span className="plan-name pixel">{p.name}</span>
                {p.current && <span className="badge new">CURRENT</span>}
              </div>
              <div className="plan-price">
                <span className="plan-price-num">{p.price}</span>
                <span className="plan-cu dim">{p.cu}</span>
              </div>
              <ul className="plan-features">
                {p.highlights.map((h) => <li key={h}><Icon.Check size={13} /> {h}</li>)}
              </ul>
              <button className={`btn plan-cta ${p.current ? '' : 'primary'}`} disabled={p.current}>{p.cta}</button>
            </div>
          ))}
        </div>
      </article>

      {/* Payment method */}
      <article className="panel rise rise-4">
        <header className="panel-head">
          <div><span className="eyebrow">Billing</span><h2 className="panel-title">Payment Method</h2></div>
          <button className="btn"><Icon.Plus size={14} /> Add method</button>
        </header>
        <div className="card-stub">
          <div className="card-stub-row">
            <Icon.Card size={20} className="dim" />
            <div className="list-main">
              <span style={{ fontWeight: 600 }}>Visa ending 4242</span>
              <span className="dim mono" style={{ fontSize: 12 }}>Expires 08 / 2027 · default</span>
            </div>
            <span className="badge success" style={{ marginLeft: 'auto' }}>Default</span>
          </div>
        </div>
      </article>

      {/* Payment intents / invoices */}
      <article className="panel marks rise rise-5" style={{ padding: 0 }}>
        <header className="panel-head" style={{ padding: '18px 20px 0' }}>
          <div><h2 className="panel-title">Payment History</h2></div>
        </header>
        <div className="table-wrap" style={{ margin: '14px 0 0' }}>
          <table className="table">
            <thead>
              <tr><th>Invoice</th><th>Date</th><th>Period</th><th className="num">Amount</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="mono">{inv.id}</td>
                  <td className="dim">{inv.date}</td>
                  <td className="dim">{inv.period}</td>
                  <td className="num mono">{inv.amount.replace(/\s+/g, '')}</td>
                  <td><span className={`badge ${inv.status === 'paid' ? 'success' : inv.status === 'failed' ? 'danger' : 'warning'}`}>{inv.status}</span></td>
                  <td className="num"><button className="btn ghost icon-only" aria-label="Download"><Icon.Download size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
