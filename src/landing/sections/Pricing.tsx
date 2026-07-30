import { useState } from 'react';
import { Segmented } from '../../components/Segmented';
import { Badge } from '../../components/ui';
import { Band, BandHead, SectionRule } from './Band';
import { Win } from '../graphics/Window';
import { pricing } from '../content/home';
import type { Billing } from '../content/home';

/**
 * Pricing as one table. Plans across, capabilities down.
 *
 * On the home band the section head carries the pitch. On the pricing page
 * the hero already did that — so this band is only the instrument: billing
 * chrome, then the table, then enterprise. No second and third H2 fighting
 * the hero.
 */

const ROWS = [
  { key: 'cu', label: 'Compute units' },
  { key: 'rate', label: 'Rate limit' },
  { key: 'projects', label: 'Projects' },
  { key: 'routing', label: 'Routing' },
  { key: 'support', label: 'Support' },
];

const CELLS: Record<string, string[]> = {
  startup: ['40 million', '1,000 CU/s', '2', 'Basic', 'Community'],
  growth: ['500 million', '2,000 CU/s', '5', 'Optimized', 'Standard'],
  pro: ['2 billion', '8,000 CU/s', '20', 'Advanced control', 'Premium'],
  business: ['5.5 billion', '20,000 CU/s', 'Unlimited', 'Dynamic distribution', 'Dedicated'],
};

type Props = {
  /** Page mode: hero owns the title; this band is table + enterprise only. */
  page?: boolean;
};

export function Pricing({ page = false }: Props) {
  const [billing, setBilling] = useState<Billing>('annually');

  const billingToggle = (
    <div className="lp-bill-toggle">
      <div className="lp-bill-row">
        <Segmented
          label="Billing period"
          value={billing}
          onChange={setBilling}
          options={[
            { value: 'annually', label: pricing.toggle.annually },
            { value: 'monthly', label: pricing.toggle.monthly },
          ]}
        />
        <Badge tone="new" className="lp-bill-discount">
          {pricing.toggle.discount}
        </Badge>
      </div>
    </div>
  );

  return (
    <Band className={`lp-pricing ${page ? 'lp-pricing-page' : ''}`.trim()}>
      {!page && <SectionRule index="08" />}

      {page ? (
        <div className="lp-pricing-toolbar" data-reveal>
          {billingToggle}
        </div>
      ) : (
        <BandHead wide title={pricing.title} lede={pricing.body} actions={billingToggle} />
      )}

      <div className="lp-blocks" data-reveal>
        <Win
          w={12}
          bare
          label="one unified invoice"
          meta={billing === 'annually' ? 'billed annually' : 'billed monthly'}
        >
          <table className="plan-table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="plan-th-label">Plan</span>
                </th>
                {pricing.plans.map((plan) => (
                  <th key={plan.id} scope="col">
                    <span className="plan-name">{plan.name}</span>
                    <span className="plan-price">
                      {billing === 'annually' ? plan.annual : plan.monthly}
                      <em>{plan.period}</em>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, r) => (
                <tr key={row.key}>
                  <th scope="row">{row.label}</th>
                  {pricing.plans.map((plan) => (
                    <td key={plan.id}>{CELLS[plan.id]?.[r] ?? '—'}</td>
                  ))}
                </tr>
              ))}
              <tr className="plan-act">
                <th scope="row" />
                {pricing.plans.map((plan) => (
                  <td key={plan.id}>
                    <button className="btn plan-cta">{plan.cta}</button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Win>
      </div>

      <div className="lp-blocks" data-reveal>
        <Win
          w={12}
          title={pricing.enterprise.name}
          caption={pricing.enterprise.body}
          label="custom throughput ceilings"
          meta={pricing.enterprise.price}
        >
          <button className="btn primary">{pricing.enterprise.cta}</button>
        </Win>
      </div>
    </Band>
  );
}
