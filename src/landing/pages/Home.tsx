import { Hero } from '../sections/Hero';
import { Integration } from '../sections/Integration';
import { Infra } from '../sections/Infra';
import { Trusted } from '../sections/Trusted';
import { Overview } from '../sections/Overview';
import { FullStack } from '../sections/FullStack';
import { Coverage } from '../sections/Coverage';
import { CustomerStory } from '../sections/CustomerStory';
import { Pricing } from '../sections/Pricing';
import { Blog } from '../sections/Blog';
import { Faq } from '../sections/Faq';
import { Closing } from '../sections/Closing';

/** Sections in the same order the live marketing site presents them. */
export function Home() {
  return (
    <main>
      <Hero />
      <Integration />
      <Infra />
      <Trusted />
      <Overview />
      <FullStack />
      <Coverage />
      <CustomerStory />
      <Pricing />
      <Blog />
      <Faq />
      <Closing />
    </main>
  );
}
