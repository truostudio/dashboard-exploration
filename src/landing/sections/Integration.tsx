import { Band } from './Band';
import { IntegrationGantt } from '../graphics/IntegrationGantt';
import { integration } from '../content/home';

export function Integration() {
  return (
    <Band className="lp-integration">
      <div className="lp-integration-grid">
        <div className="lp-head lp-head-flush" data-reveal>
          <span className="eyebrow">{integration.eyebrow}</span>
          <h2 className="lp-title">
            <span className="lp-figure">{integration.figure}</span>
            {integration.title}
          </h2>
        </div>
        <div data-reveal>
          <IntegrationGantt />
        </div>
      </div>
    </Band>
  );
}
