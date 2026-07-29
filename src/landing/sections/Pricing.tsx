import { useState } from 'react';
import { Segmented } from '../../components/Segmented';
import { Band, SectionRule } from './Band';
import { Win } from '../graphics/Window';
import { pricing } from '../content/home';
import type { Billing } from '../content/home';

/**
 * Pricing.
 *
 * This was the three-tier pricing block by the book: four cards in a row, each
 * with a name, a big price, a checkmark feature list and its own CTA at the
 * bottom. That composition is a named preset, and it has a structural problem
 * besides — four parallel columns whose rows only line up by luck, so the
 * lists and buttons go ragged the moment one plan's copy runs longer.
 *
 * It is now one table. Plans are columns, capabilities are rows, and every
 * value sits on a shared baseline by construction. It reads like the rest of
 * the page — an instrument showing real numbers — and comparing two plans is
 * a matter of reading across, which is the actual job.
 */

/** The rows worth comparing, pulled level across every plan. */
const ROWS = [
  { key: 'cu', label: 'Compute units' },
  { key: 'rate', label: 'Rate limit' },
  { key: 'projects', label: 'Projects' },
  { key: 'routing', label: 'Routing' },
  { key: 'support', label: 'Support' },
];

/** Each plan's value for each row, in the same order as ROWS. */
const CELLS: Record<string, string[]> = {
  startup: ['40 million', '1,000 CU/s', '2', 'Basic', 'Community'],
  growth: ['500 million', '2,000 CU/s', '5', 'Optimized', 'Standard'],
  pro: ['2 billion', '8,000 CU/s', '20', 'Advanced control', 'Premium'],
  business: ['5.5 billion', '20,000 CU/s', 'Unlimited', 'Dynamic distribution', 'Dedicated'],
};

export function Pricing() {
  const [billing, setBilling] = useState<Billing>('annually');

  return (
    <Band className="lp-pricing">
      <SectionRule index="07" />

      <div className="lp-blocks" data-reveal>
        <Win w={7} variant="flat" className="win-note">
          <h2 className="win-note-title lp-title lp-title-wide">{pricing.title}</h2>
          <p className="lp-lede">{pricing.body}</p>
        </Win>

        <Win w={5} variant="flat" className="win-note lp-bill-toggle">
          <Segmented
            label="Billing period"
            value={billing}
            onChange={setBilling}
            options={[
              { value: 'annually', label: pricing.toggle.annually },
              { value: 'monthly', label: pricing.toggle.monthly },
            ]}
          />
          <p className="win-note-body">{pricing.toggle.discount} billed annually.</p>
        </Win>
      </div>

      <div className="lp-blocks" data-reveal>
        <Win
          w={12}
          bare
          title="What each plan gives you"
          caption="Read across to compare. Every plan is the same API on the same contract — the difference is headroom."
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
