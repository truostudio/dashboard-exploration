import { Icon } from '../../components/Icons';
import { Band } from './Band';
import { nodesPage } from '../content/nodes';

/** Closing beat — workload → metal, with booking CTA. */
export function NodesClose() {
  const { close, cta, ctaHref } = nodesPage;

  return (
    <Band className="lp-nodes-close lp-invert">
      <div className="lp-pricing-close-inner" data-reveal>
        <h2 className="lp-hero-title">
          {close.title.map((line) => (
            <span className="lp-line" key={line}>
              <span>{line}</span>
            </span>
          ))}
        </h2>
        <p className="lp-lede">{close.body}</p>
        <div className="lp-hero-act">
          <a className="btn primary" href={ctaHref}>
            <Icon.Users size={14} />
            {cta}
          </a>
        </div>
      </div>
    </Band>
  );
}
