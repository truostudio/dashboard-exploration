import { Icon } from '../../components/Icons';
import { nodesPage } from '../content/nodes';

/** Dedicated Nodes hero, invert plate, display type, dual CTAs. */
export function NodesHero() {
  const { eyebrow, title, body, cta, ctaHref, lookingGlass } = nodesPage;

  return (
    <section className="lp-hero lp-nodes-hero lp-invert">
      <div className="lp-hero-inner">
        <p className="lp-eyebrow" data-reveal>
          {eyebrow}
        </p>
        <h1 className="lp-hero-title" data-reveal>
          {title.map((line) => (
            <span className="lp-line" key={line}>
              <span>{line}</span>
            </span>
          ))}
        </h1>

        <div className="lp-hero-foot" data-reveal>
          <p className="lp-hero-body">{body}</p>
          <div className="lp-hero-act">
            <a className="btn primary" href={ctaHref}>
              <Icon.Users size={14} />
              {cta}
            </a>
            <a className="btn dark" href={lookingGlass.href} target="_blank" rel="noreferrer">
              <Icon.External size={14} />
              {lookingGlass.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
