import { closing, footer } from './content/home';
import { Icon } from '../components/Icons';

/**
 * End of page as a mini-hero — not a utility strip.
 *
 * Pattern borrowed from authored endings (Locomotive, Motto, Dolsten): the
 * last viewport still has a headline, an action, and navigation as part of
 * the composition. The routing volume reconstitutes behind it the way it
 * owns the opening hero.
 */
export function LandingFooter() {
  const nav = [...footer.primary, ...footer.company, ...footer.social];

  return (
    <footer className="lp-footer lp-invert">
      <div className="lp-footer-inner">
        <div className="lp-footer-hero">
          <a className="lp-footer-logo" href="/landing-page-home" aria-label="Uniblock home">
            <img src="/uniblock-logo.png" alt="" width={120} />
          </a>

          <h2 className="lp-footer-title">
            {footer.tagline.map((line) => (
              <span className="lp-line" key={line}>
                <span>{line}</span>
              </span>
            ))}
          </h2>

          <p className="lp-footer-body">{closing.body}</p>

          <div className="lp-footer-act">
            <button className="btn primary">
              <Icon.Key size={14} />
              {closing.cta}
            </button>
            <a className="btn dark" href="https://docs.uniblock.dev/">
              <Icon.External size={14} />
              Read the docs
            </a>
          </div>
        </div>

        <nav className="lp-footer-nav" aria-label="Footer">
          {nav.map((link) => (
            <a key={link.label} className="lp-footer-link" href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="lp-footer-meta">
          <span>{footer.copyright}</span>
          <span className="lp-footer-legal">
            {footer.legal.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
