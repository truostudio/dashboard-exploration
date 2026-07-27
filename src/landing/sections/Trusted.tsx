import { Marquee } from '../graphics/Marquee';
import { trusted } from '../content/home';

/**
 * The site runs a static row of customer logo SVGs. Rebuilt as a slow marquee
 * of wordmarks in the system's own pixel face — the names are the content, and
 * six foreign logo treatments would be the one thing on the page not drawn by
 * this design system. Hovering pauses the travel.
 */
export function Trusted() {
  return (
    <section className="lp-band lp-trusted">
      <h2 className="lp-trusted-title" data-reveal>
        {trusted.title}
      </h2>
      <Marquee duration={44}>
        {trusted.customers.map((name) => (
          <span key={name} className="lp-logo">
            {name}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
