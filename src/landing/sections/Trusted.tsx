import { Band, SectionRule } from './Band';
import { trusted } from '../content/home';

/**
 * Customers field — numbered chapter in the page sequence. Static board:
 * six logos left, six right, title in the centre. Page rails own the L/R
 * edges so the board never doubles them.
 */
export function Trusted() {
  const left = trusted.customers.slice(0, 6);
  const right = trusted.customers.slice(6);

  return (
    <Band className="lp-trusted">
      <SectionRule index="03" />

      <div className="lp-trusted-board" data-reveal aria-label="Customers">
        <div className="lp-trusted-logos">
          {left.map((c) => (
            <div key={c.id} className="lp-trusted-cell">
              <img className="lp-trusted-logo" src={c.src} alt={c.name} />
            </div>
          ))}
        </div>

        <div className="lp-trusted-center">
          <img
            className="lp-trusted-badge"
            src="/customers/verified.webp"
            alt=""
            aria-hidden
          />
          <h2 className="lp-title">{trusted.title}</h2>
        </div>

        <div className="lp-trusted-logos">
          {right.map((c) => (
            <div key={c.id} className="lp-trusted-cell">
              <img className="lp-trusted-logo" src={c.src} alt={c.name} />
            </div>
          ))}
        </div>
      </div>
    </Band>
  );
}
