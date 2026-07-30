import { Band, SectionRule } from './Band';
import { Win } from '../graphics/Window';
import { UptimeStrip } from '../graphics/UptimeStrip';
import { infra } from '../content/home';

export function Infra() {
  return (
    <Band className="lp-infra">
      <SectionRule index="02" />

      <div className="lp-blocks" data-reveal>
        <div className="lp-pair">
          <Win w={5} variant="flat" className="win-note">
            <h2 className="win-note-title lp-title lp-title-wide">{infra.title}</h2>
            <p className="lp-lede">{infra.body}</p>
          </Win>

          <Win
            w={7}
            bare
            title="Measured uptime"
            caption="Across every provider Uniblock routes to, not any single one of them. Two degradations in ninety days."
            label="99.99% target"
            meta="90d rolling"
          >
            <UptimeStrip />
          </Win>
        </div>
      </div>
    </Band>
  );
}
