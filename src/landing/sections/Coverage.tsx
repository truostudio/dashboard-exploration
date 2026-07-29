import type { CSSProperties } from 'react';
import { Band, SectionRule } from './Band';
import { Win } from '../graphics/Window';
import { chains } from '../../data/mock';
import { coverage } from '../content/home';

/**
 * Coverage.
 *
 * This was two counter-travelling marquees of chain chips. A marquee is
 * decoration: it moves without saying anything, and nothing in it can be read
 * because it will not hold still. The chains are now a lattice — the same
 * construction as the provider mesh, which is the component that works — so
 * the claim ("300+ networks") is shown as a population you can actually scan.
 */
export function Coverage() {
  const COLS = 5;
  const shown = chains.slice(0, COLS * 3);

  return (
    <Band className="lp-coverage">
      <SectionRule index="05" />

      <div className="lp-blocks" data-reveal>
        <Win w={5} variant="flat" className="win-note">
          <h2 className="win-note-title lp-title lp-title-wide">{coverage.title}</h2>
          <p className="lp-lede">{coverage.body}</p>
          <button className="btn lp-proof-cta">{coverage.cta}</button>
        </Win>

        <Win
          w={7}
          bare
          title="The chain population"
          caption="Every network reachable through the same endpoint, on the same contract."
          label={`${shown.length} of 300+ shown`}
          meta="one interface"
        >
          <div className="lp-lattice" style={{ '--cols': COLS } as CSSProperties}>
            {shown.map((chain, i) => (
              <span
                key={chain.id}
                className="lp-brick lp-chain-brick"
                style={{ '--i': (i % COLS) + Math.floor(i / COLS) } as CSSProperties}
                title={`${chain.name} · ${chain.symbol}`}
              >
                <img src={chain.icon} alt="" />
              </span>
            ))}
          </div>
        </Win>
      </div>

      {/* The figures, as a readout rather than three floating stat cards. */}
      <div className="lp-blocks lp-stats" data-reveal>
        {coverage.stats.map((stat) => (
          <div key={stat.id} className="lp-stat" style={{ '--w': 4 } as CSSProperties}>
            <span className="lp-stat-num">{stat.value}</span>
            <span className="lp-stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </Band>
  );
}
