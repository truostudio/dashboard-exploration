import { nav } from './content/home';
import { Icon } from '../components/Icons';
import type { Theme } from '../theme';
import { useEffect, useState } from 'react';

type Props = {
  theme: Theme;
  onToggleTheme: () => void;
  /** True when the page opens on a dark hero the bar should sit over. */
  overlay?: boolean;
};

/**
 * Sticky strip on the page rails — not a nested card. Transparent over the
 * hero, opaque canvas once you leave it. Controls are real `.btn`s from the
 * component library — filled, never outline-only.
 */
export function LandingNav({ theme, onToggleTheme, overlay }: Props) {
  const [open, setOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onHero = Boolean(overlay) && atTop;
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <div className={`lp-nav-wrap ${onHero ? 'on-hero lp-invert' : ''}`.trim()}>
      <nav className="lp-nav" aria-label="Main">
        <a className="lp-brand" href="/landing-page-home" aria-label="Uniblock home">
          <img src="/uniblock-logo.png" alt="" width={104} />
        </a>

        <div className={`lp-nav-links ${open ? 'open' : ''}`.trim()}>
          {nav.links.map((link) => (
            <a
              key={link.label}
              className="lp-nav-link"
              href={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
        {open && <div className="lp-nav-scrim" onClick={() => setOpen(false)} />}

        <div className="lp-nav-actions">
          <button
            className="btn dark"
            onClick={onToggleTheme}
            aria-label={`Switch to ${nextTheme} theme`}
            title={`Switch to ${nextTheme} theme`}
          >
            {theme === 'dark' ? <Icon.Moon size={14} /> : <Icon.Sun size={14} />}
            {theme === 'dark' ? 'Dark' : 'Light'}
          </button>

          <button className="btn primary lp-nav-cta">{nav.cta}</button>

          <button
            className="btn dark lp-nav-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </nav>
    </div>
  );
}
