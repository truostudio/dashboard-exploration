import { Icon } from '../../components/Icons';
import { pricingPage } from '../content/pricing';

/**
 * Pricing page hero, invert plate, display type, one CTA. No WebGL artifact
 * here; the plans table below is the instrument.
 */
export function PricingHero() {
  return (
    <section className="lp-hero lp-pricing-hero lp-invert">
      <div className="lp-hero-inner">
        <p className="lp-eyebrow" data-reveal>
          {pricingPage.eyebrow}
        </p>
        <h1 className="lp-hero-title" data-reveal>
          {pricingPage.title.map((line) => (
            <span className="lp-line" key={line}>
              <span>{line}</span>
            </span>
          ))}
        </h1>

        <div className="lp-hero-foot" data-reveal>
          <p className="lp-hero-body">{pricingPage.body}</p>
          <div className="lp-hero-act">
            <a className="btn primary" href={pricingPage.ctaHref}>
              <Icon.Chart size={14} />
              {pricingPage.cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
