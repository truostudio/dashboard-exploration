import { Icon } from '../components/Icons';
import {
  Panel, PanelHead, TitledPanel, Table, Spec, BarList, Badge, Meter,
} from '../components/ui';
import { invoices, plans, cuUsed, cuLimit, cuBreakdown } from '../data/mock';

const invoiceColumns = [
  { key: 'invoice', header: 'Invoice' },
  { key: 'date', header: 'Date' },
  { key: 'period', header: 'Period' },
  { key: 'amount', header: 'Amount', align: 'right' as const },
  { key: 'status', header: 'Status' },
  { key: 'download' },
];

export function SettingsBilling() {
  const current = plans.find((p) => p.current)!;
  const cuPct = Math.round((cuUsed / cuLimit) * 100);

  return (
    <div className="view">
      <TitledPanel
        className="rise rise-1"
        eyebrow="Current subscription"
        title={`${current.name} Plan`}
        sub="Renews monthly · next invoice Jul 1, 2026"
        actions={<button className="btn primary">Upgrade plan</button>}
      >
        <div className="cu-summary">
          <div className="cu-summary-head">
            <span className="kpi-tile-num">{cuUsed.toLocaleString()}</span>
            <span className="dim">
              of {cuLimit.toLocaleString()} compute units · {cuPct}%
            </span>
          </div>
          <Meter value={cuPct} />
        </div>
      </TitledPanel>

      <TitledPanel className="rise rise-2" eyebrow="This cycle" title="Compute Units">
        <BarList
          items={cuBreakdown.map((c) => ({
            id: c.name,
            label: c.name,
            share: c.share,
            value: `${(c.cu / 1_000_000).toFixed(2)}M`,
          }))}
        />
      </TitledPanel>

      <TitledPanel className="rise rise-3" eyebrow="Uniblock plans" title="Plans">
        <div className="plans-grid">
          {plans.map((p) => (
            <div key={p.id} className={`plan-card ${p.current ? 'current' : ''}`.trim()}>
              <div className="plan-card-head">
                <span className="plan-name">{p.name}</span>
                {p.current && <Badge tone="new">CURRENT</Badge>}
              </div>
              <div className="plan-price">
                <span className="plan-price-num pixel">{p.price}</span>
              </div>
              <Spec
                rows={[
                  { label: 'Allowance', value: p.cu },
                  { label: 'Includes', value: p.highlights.length },
                ]}
              />
              <ul className="plan-features">
                {p.highlights.map((h) => (
                  <li key={h}>
                    <Icon.Check size={13} /> {h}
                  </li>
                ))}
              </ul>
              <button className={`btn plan-cta ${p.current ? '' : 'primary'}`.trim()} disabled={p.current}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </TitledPanel>

      <TitledPanel
        className="rise rise-4"
        eyebrow="Billing"
        title="Payment Method"
        actions={<button className="btn"><Icon.Plus size={14} /> Add method</button>}
      >
        <div className="card-stub">
          <div className="card-stub-row">
            <Icon.Card size={20} className="dim" />
            <div className="list-main">
              <span className="cell-strong">Visa ending 4242</span>
              <span className="dim mono">Expires 08 / 2027 · default</span>
            </div>
            <Badge tone="success" className="push-right">Default</Badge>
          </div>
        </div>
      </TitledPanel>

      <Panel marks flush className="rise rise-5">
        <PanelHead inset title="Payment History" />
        <Table columns={invoiceColumns} ruled>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td className="mono">{inv.id}</td>
              <td className="dim">{inv.date}</td>
              <td className="dim">{inv.period}</td>
              <td className="num mono">{inv.amount.replace(/\s+/g, '')}</td>
              <td>
                <Badge tone={inv.status === 'paid' ? 'success' : inv.status === 'failed' ? 'danger' : 'warning'}>
                  {inv.status}
                </Badge>
              </td>
              <td className="num">
                <button className="btn ghost icon-only" aria-label="Download">
                  <Icon.Download size={15} />
                </button>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
