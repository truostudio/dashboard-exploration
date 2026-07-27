import { useEffect, useState } from 'react';
import { Icon } from '../components/Icons';
import { nav } from './content/home';
import type { Theme } from '../theme';

type Props = {
  theme: Theme;
  onToggleTheme: () => void;
  /** True when the page opens on a dark hero the bar should sit over. */
  overlay?: boolean;
};

export function LandingNav({ theme, onToggleTheme, overlay }: Props) {
  const [open, setOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);

  // Over the hero the bar is transparent and carries the hero's palette; once
  // you leave it, it becomes the usual blurred canvas bar.
  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onHero = Boolean(overlay) && atTop;

  return (
    <>
      {/* A thin dark accent strip at the very top of every landing page. */}
      <div className="lp-backed lp-invert">
        <span className="lp-backed-label">{nav.backed.label}</span>
        <a className="lp-backed-msg" href="https://www.uniblock.dev/contact">
          {nav.backed.message}
        </a>
      </div>

      <div className={`lp-nav-wrap ${onHero ? 'on-hero lp-invert' : ''}`.trim()}>
        <nav className="lp-nav" aria-label="Main">
          <a className="lp-brand" href="/landing-page-home">
            <img src="/uniblock-logo.png" alt="Uniblock" width={112} />
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
              className="btn ghost icon-only"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Icon.Sun size={15} /> : <Icon.Moon size={15} />}
            </button>
            <button className="btn primary">{nav.cta}</button>
            <button
              className="btn ghost icon-only lp-nav-toggle"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={open}
            >
              {open ? <Icon.X size={15} /> : <Icon.Menu size={15} />}
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
