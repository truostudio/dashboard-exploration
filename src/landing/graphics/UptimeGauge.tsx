import { AnimatedNumber } from '../../components/AnimatedNumber';
import { SquareMeter } from '../../components/SquareMeter';
import { infra } from '../content/home';

/**
 * Replaces the site's animated percentage counter. The dashboard already owns
 * this gauge, so the marketing page states uptime with the same instrument the
 * product uses — the ring is square for the same reason everything else is.
 *
 * The three labels are the section's own claim ("routing, hedging, and
 * failover logic"), set as chrome rather than restated as prose.
 */
export function UptimeGauge() {
  return (
    <div className="lp-infra-gauge marks-4">
      <SquareMeter
        size={176}
        thickness={6}
        value={<AnimatedNumber value={infra.uptime} />}
        caption={infra.uptimeCaption}
        segments={[
          { value: 99.99, color: 'var(--ub-blue)' },
          { value: 0.01, color: 'var(--ub-danger)' },
        ]}
      />
      <div className="lp-infra-legend">
        <span>ROUTING</span>
        <span>HEDGING</span>
        <span>FAILOVER</span>
      </div>
    </div>
  );
}
