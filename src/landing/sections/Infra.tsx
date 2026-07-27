import { Band } from './Band';
import { UptimeGauge } from '../graphics/UptimeGauge';
import { infra } from '../content/home';

export function Infra() {
  return (
    <Band className="lp-infra">
      <div className="lp-infra-grid">
        <div className="lp-head lp-head-flush" data-reveal>
          <span className="eyebrow">{infra.eyebrow}</span>
          <h2 className="lp-title lp-title-wide">{infra.title}</h2>
          <p className="lp-lede">{infra.body}</p>
        </div>
        <div data-reveal>
          <UptimeGauge />
        </div>
      </div>
    </Band>
  );
}
