import type { CSSProperties } from 'react';
import { Band, SectionRule } from './Band';
import { trusted } from '../content/home';

/**
 * Six customers, each a 2×2 block: twelve across, two down, no remainder.
 * The names stay set in the system's own pixel face rather than as six
 * foreign logo treatments.
 */
export function Trusted() {
  return (
    <Band className="lp-trusted">
      <SectionRule index="—" />

      <div className="lp-blocks lp-wall" data-reveal>
        {trusted.customers.map((name, i) => (
          <span
            key={name}
            className="lp-wall-brick"
            style={{ '--w': 2, '--h': 2, '--i': i } as CSSProperties}
          >
            {name}
          </span>
        ))}
      </div>
    </Band>
  );
}
