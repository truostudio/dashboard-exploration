import { useState } from 'react';
import { Icon } from '../../components/Icons';
import { Segmented } from '../../components/Segmented';
import { Badge } from '../../components/ui';
import { Band, BandHead } from './Band';
import { pricing } from '../content/home';
import type { Billing } from '../content/home';

export function Pricing() {
  const [billing, setBilling] = useState<Billing>('annually');

  return (
    <Band className="lp-pricing">
      <BandHead
        eyebrow={pricing.eyebrow}
        wide
        title={pricing.title}
        lede={pricing.body}
        actions={
          <div className="lp-billing">
            <Segmented
              label="Billing period"
              value={billing}
              onChange={setBilling}
              options={[
                { value: 'annually', label: pricing.toggle.annually },
                { value: 'monthly', label: pricing.toggle.monthly },
              ]}
            />
            {billing === 'annually' && <Badge tone="new">{pricing.toggle.discount}</Badge>}
          </div>
        }
      />

      <div className="lp-head-actions lp-pricing-calc">
        <button className="btn">
          {pricing.cta} <Icon.Chevron size={13} />
        </button>
      </div>

      <div className="lp-pricing-grid">
        {pricing.plans.map((plan) => (
          <article key={plan.id} className="lp-plan" data-reveal>
            <span className="lp-plan-name">{plan.name}</span>
            <div className="lp-plan-price">
              <span className="lp-plan-price-num">
                {billing === 'annually' ? plan.annual : plan.monthly}
              </span>
              <span className="lp-plan-period">{plan.period}</span>
            </div>
            <p className="lp-plan-body">{plan.body}</p>
            <button className="btn primary lp-plan-cta">{plan.cta}</button>
            <span className="lp-plan-includes">{pricing.includes}</span>
            <ul className="lp-plan-features">
              {plan.features.map((feature) => (
                <li key={feature}>
                  <Icon.Check size={13} /> {feature}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="lp-enterprise marks-4" data-reveal>
        <div className="lp-enterprise-copy">
          <span className="lp-plan-name">{pricing.enterprise.name}</span>
          <span className="lp-plan-price-num">{pricing.enterprise.price}</span>
          <p className="lp-lede">{pricing.enterprise.body}</p>
        </div>
        <button className="btn dark">{pricing.enterprise.cta}</button>
      </div>
    </Band>
  );
}
