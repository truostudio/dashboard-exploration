import { useTypedCycle } from '../graphics/terminal';
import { hero, coverage } from '../content/home';
import { Icon } from '../../components/Icons';

/**
 * The hero.
 *
 * What it was: a left column holding an eyebrow, a three-line headline, a
 * paragraph of subtext and a filled button beside an outlined one, with an SVG
 * diagram floating on the right. That is the most-shipped hero composition on
 * the internet, and the diagram was a second signature artifact fighting the
 * WebGL network behind it — two focal objects means neither reads.
 *
 * What it is: the network owns the frame. Type is anchored to the floor of the
 * viewport instead of stacked down the middle, so the artifact keeps the open
 * space above it. Actions use the same `.btn` system as the dashboard — primary
 * + default, with icons — so the landing speaks the product's control language.
 */
export function Hero() {
  const cmd = useTypedCycle(hero.cmdPrefix, hero.cmdPaths);

  return (
    <section className="lp-hero lp-invert">
      <div className="lp-hero-inner">
        <h1 className="lp-hero-title" data-reveal>
          {hero.title.map((line) => (
            <span className="lp-line" key={line}>
              <span>{line}</span>
            </span>
          ))}
        </h1>

        <div className="lp-hero-foot" data-reveal>
          <p className="lp-hero-body">{hero.body}</p>

          <p className="lp-hero-cmd" aria-live="polite">
            <span>{cmd}</span>
            <span className="lp-caret" aria-hidden />
          </p>

          <div className="lp-hero-act">
            <button className="btn primary">
              <Icon.Key size={14} />
              {hero.primary}
            </button>
            <a className="btn dark" href="#docs">
              <Icon.External size={14} />
              {hero.secondary}
            </a>
          </div>
        </div>
      </div>

      {/* Real figures, read out along the floor of the frame. */}
      <div className="lp-hero-status" data-reveal>
        <span className="lp-status-live">
          <i /> live
        </span>
        {coverage.stats.map((stat) => (
          <span key={stat.id} className="lp-status-item">
            <b>{stat.value}</b> {stat.label}
          </span>
        ))}
        <span className="lp-status-item push-right">
          <b>99.99%</b> uptime
        </span>
      </div>
    </section>
  );
}
