import { Band } from './Band';
import { pricingPage } from '../content/pricing';

/** Closing beat under the plans — one line, no card chrome. */
export function PricingClose() {
  return (
    <Band className="lp-pricing-close lp-invert">
      <div className="lp-pricing-close-inner" data-reveal>
        <h2 className="lp-hero-title">
          {pricingPage.close.title.map((line) => (
            <span className="lp-line" key={line}>
              <span>{line}</span>
            </span>
          ))}
        </h2>
        <p className="lp-lede">{pricingPage.close.body}</p>
      </div>
    </Band>
  );
}
