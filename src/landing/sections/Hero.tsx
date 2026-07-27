import { Icon } from '../../components/Icons';
import { RoutingField } from '../graphics/RoutingField';
import { hero, coverage } from '../content/home';

export function Hero() {
  return (
    <section className="lp-hero lp-invert">
      <div className="lp-hero-field" aria-hidden />
      <div className="lp-hero-glow" aria-hidden />

      <div className="lp-hero-inner">
        <div className="lp-hero-copy">
          <h1 data-reveal>
            {hero.title.map((line) => (
              <span className="lp-line" key={line}>
                <span>{line}</span>
              </span>
            ))}
          </h1>
          <p className="lp-hero-body" data-reveal>
            {hero.body}
          </p>
          <div className="lp-hero-cta" data-reveal>
            <button className="btn primary btn-lg">{hero.primary}</button>
            <button className="btn btn-lg">
              <Icon.Code size={14} /> {hero.secondary}
            </button>
          </div>
        </div>

        <div className="lp-hero-graphic" data-reveal>
          <RoutingField />
        </div>
      </div>

      {/* Instrument strip: the page's own figures, read out like a status bar. */}
      <div className="lp-hero-status" data-reveal>
        <span className="lp-status-live">
          <i /> LIVE
        </span>
        {coverage.stats.map((stat) => (
          <span key={stat.id} className="lp-status-item">
            <b>{stat.value}</b> {stat.label}
          </span>
        ))}
        <span className="lp-status-item push-right">
          <b>99.99%</b> Uptime
        </span>
      </div>
    </section>
  );
}
