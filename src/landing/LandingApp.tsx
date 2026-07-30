import type { ReactElement } from 'react';
import { Icon } from '../components/Icons';
import { Empty } from '../components/ui';
import { useTheme } from '../theme';
import { useReveal, useScrollProgress } from './useReveal';
import { LandingNav } from './LandingNav';
import { LandingFooter } from './LandingFooter';
import { Home } from './pages/Home';
import { PricingPage } from './pages/Pricing';
import { NodesPage } from './pages/Nodes';
import '../App.css';
import './Landing.css';

/**
 * Landing pages live at /landing-page-<slug>, with `home` as the default.
 * Add a page here to take it off the stub.
 */
const pages: Record<string, () => ReactElement> = {
  home: Home,
  pricing: PricingPage,
  nodes: NodesPage,
};

function Stub({ slug }: { slug: string }) {
  return (
    <main className="lp-stub">
      <Empty icon={<Icon.Grid size={20} />} title={`/landing-page-${slug}`}>
        This page hasn’t been built yet. Add it to the page map in LandingApp.
      </Empty>
    </main>
  );
}

export function LandingApp({ slug }: { slug: string }) {
  const { theme, toggleTheme } = useTheme();
  const Page = pages[slug];
  const overlay = slug === 'home' || slug === 'pricing' || slug === 'nodes';

  useReveal();
  useScrollProgress('.lp-stack-seq');

  return (
    <div className="landing">
      <LandingNav theme={theme} onToggleTheme={toggleTheme} overlay={overlay} />
      {Page ? <Page /> : <Stub slug={slug} />}
      <LandingFooter />
    </div>
  );
}
