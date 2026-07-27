import { Icon } from '../../components/Icons';
import { Band, BandHead } from './Band';
import { Marquee } from '../graphics/Marquee';
import { chains } from '../../data/mock';
import { coverage } from '../content/home';

/**
 * The site shows a static logo cloud. Rebuilt as two counter-travelling
 * marquees of the real chain marks this repo ships, closed by the figures set
 * at display size — the numbers are the claim, so they get to be the graphic.
 */
export function Coverage() {
  // Each row carries the whole list: a group narrower than the viewport would
  // leave a gap at the loop seam, since the track travels exactly one group.
  // The second row starts part-way through so the two don't read as a mirror.
  const offset = 7;
  const rowB = [...chains.slice(offset), ...chains.slice(0, offset)];

  const tile = (chain: (typeof chains)[number]) => (
    <span key={chain.id} className="lp-chain">
      <img src={chain.icon} alt="" />
      <span className="lp-chain-name">{chain.name}</span>
      <span className="lp-chain-id">{chain.symbol}</span>
    </span>
  );

  return (
    <Band className="lp-coverage">
      <BandHead
        eyebrow={coverage.eyebrow}
        wide
        title={coverage.title}
        lede={coverage.body}
        actions={
          <button className="btn btn-lg">
            {coverage.cta} <Icon.Chevron size={13} />
          </button>
        }
      />

      <div className="lp-coverage-marquees" data-reveal>
        <Marquee duration={64}>{chains.map(tile)}</Marquee>
        <Marquee duration={72} reverse>
          {rowB.map(tile)}
        </Marquee>
      </div>

      <div className="lp-stats" data-reveal>
        {coverage.stats.map((stat) => (
          <div key={stat.id} className="lp-stat">
            <span className="lp-stat-num">{stat.value}</span>
            <span className="lp-stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </Band>
  );
}
