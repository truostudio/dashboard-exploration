import { Pricing } from '../sections/Pricing';
import { PricingHero } from '../sections/PricingHero';
import { PricingClose } from '../sections/PricingClose';

/** Standalone pricing page — hero, plan table, close. */
export function PricingPage() {
  return (
    <main>
      <PricingHero />
      <Pricing page />
      <PricingClose />
    </main>
  );
}
