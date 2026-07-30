import { Band, SectionRule } from './Band';
import { Win } from '../graphics/Window';
import { IntegrationGantt } from '../graphics/IntegrationGantt';
import { integration } from '../content/home';

export function Integration() {
  return (
    <Band className="lp-integration">
      <SectionRule index="01" />

      <div className="lp-blocks" data-reveal>
        <div className="lp-pair">
          <Win w={5} variant="flat" className="win-note">
            <span className="lp-figure">{integration.figure}</span>
            <h2 className="win-note-title lp-title">{integration.title}</h2>
          </Win>

          <Win
            w={7}
            bare
            title="Time to a working integration"
            caption="Wiring ten providers yourself against wiring Uniblock once, measured to the first successful call."
            label="measured end to end"
            meta="lower is better"
          >
            <IntegrationGantt />
          </Win>
        </div>
      </div>
    </Band>
  );
}
