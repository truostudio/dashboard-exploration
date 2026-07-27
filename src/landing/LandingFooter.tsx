import { footer } from './content/home';

export function LandingFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-inner">
        <div className="lp-footer-top">
          <div className="lp-footer-brand">
            <img src="/uniblock-logo.png" alt="Uniblock" width={112} />
            <p className="lp-footer-tagline">
              {footer.tagline.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
          </div>

          {footer.columns.map((column) => (
            <div key={column.id} className="lp-footer-col">
              <span className="lp-footer-label">{column.label}</span>
              {column.links.map((link) => (
                <a key={link.label} className="lp-footer-link" href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          ))}

          <div className="lp-footer-col">
            <span className="lp-footer-label">SOCIAL</span>
            {footer.social.map((link) => (
              <a key={link.label} className="lp-footer-link" href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="lp-footer-bottom">
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
