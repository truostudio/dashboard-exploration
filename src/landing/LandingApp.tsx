import type { ReactElement } from 'react';
import { Icon } from '../components/Icons';
import { Empty } from '../components/ui';
import { useTheme } from '../theme';
import { useReveal, useScrollProgress } from './useReveal';
import { LandingNav } from './LandingNav';
import { LandingFooter } from './LandingFooter';
import { Home } from './pages/Home';
import './Landing.css';

/**
 * Landing pages live at /landing-page-<slug>, with `home` as the default.
 * `pricing` and `products` are planned; adding one is a single entry here.
 */
const pages: Record<string, () => ReactElement> = {
  home: Home,
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

  useReveal();
  useScrollProgress('.lp-stack-seq');

  return (
    <div className="landing">
      <LandingNav theme={theme} onToggleTheme={toggleTheme} overlay={Boolean(Page)} />
      {Page ? <Page /> : <Stub slug={slug} />}
      <LandingFooter />
    </div>
  );
}
