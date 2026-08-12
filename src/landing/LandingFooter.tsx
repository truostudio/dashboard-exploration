import { closing, footer } from './content/home';
import { Icon } from '../components/Icons';
import { EndpointField } from './scene/EndpointField';

type LinkIcon = keyof typeof Icon;

const groups: { label: string; links: { label: string; href: string; icon: LinkIcon }[] }[] = [
  { label: 'Product', links: footer.primary },
  { label: 'Company', links: footer.company },
  { label: 'Social', links: footer.social },
];

/**
 * Page ending as a closing band.
 *
 * Chrome first, close CTA, links, legal, then the nucleus owns the floor.
 * The artifact is the last thing on the page rather than a texture behind the
 * copy, so the document dissolves into the network it has been describing.
 */
export function LandingFooter() {
  return (
    <footer className="lp-footer lp-invert">
      <div className="lp-footer-inner">
        <div className="lp-footer-close">
          <div className="lp-footer-close-copy">
            <h2 className="lp-footer-close-title">{closing.title}</h2>
            <p className="lp-footer-close-body">{closing.body}</p>
          </div>
          <div className="lp-footer-close-act">
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

        <div className="lp-footer-rail">
          <a className="lp-footer-brand" href="/landing-page-home" aria-label="Uniblock home">
            <img src="/uniblock-logo.png" alt="" width={104} />
          </a>

          <nav className="lp-footer-nav" aria-label="Footer">
            {groups.map((group) => (
              <div key={group.label} className="lp-footer-group">
                <span className="lp-footer-group-label">{group.label}</span>
                {group.links.map((link) => {
                  const I = Icon[link.icon];
                  return (
                    <a key={link.label} className="lp-footer-link" href={link.href}>
                      <I size={14} />
                      <span className="lp-footer-link-label">{link.label}</span>
                    </a>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        <div className="lp-footer-floor">
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
      </div>

      {/* The floor. Full measure, no copy over it; the field gets the frame. */}
      <div className="lp-footer-stage">
        <EndpointField />
      </div>
    </footer>
  );
}
