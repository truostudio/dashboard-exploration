import { Avatar, Badge, Dot } from '../../components/ui';
import { directProviders } from '../../data/catalog';

/**
 * Hero graphic. The Framer site used rendered artwork here; this states the
 * same claim with the product's own instrumentation — one request, every
 * candidate provider scored, the winner routed. Latencies are illustrative.
 */

type Candidate = { id: string; latency: number; routed?: boolean };

const candidates: Candidate[] = [
  { id: 'helius', latency: 64, routed: true },
  { id: 'quicknode', latency: 71 },
  { id: 'alchemy', latency: 78 },
  { id: 'infura', latency: 92 },
  { id: 'ankr', latency: 121 },
];

const slowest = Math.max(...candidates.map((c) => c.latency));

export function RouteReadout() {
  return (
    <figure className="lp-route marks-4">
      <div className="lp-route-head">
        <Badge tone="new">GET</Badge>
        <span className="lp-route-path">/uni/v1/token/price</span>
        <span className="lp-route-meta">
          <Dot tone="ok" /> chain=ethereum
        </span>
      </div>

      <div className="lp-route-rows">
        {candidates.map((candidate) => {
          const provider = directProviders.find((p) => p.id === candidate.id);
          const name = provider?.name ?? candidate.id;
          return (
            <div key={candidate.id} className={`lp-route-row ${candidate.routed ? 'on' : ''}`.trim()}>
              <Avatar src={provider?.icon} name={name} size="sm" />
              <span className="lp-route-name">{name}</span>
              <span className="lp-route-track" aria-hidden>
                <span
                  className="lp-route-fill"
                  style={{ width: `${(candidate.latency / slowest) * 100}%` }}
                />
              </span>
              <span className="lp-route-ms">{candidate.latency} ms</span>
              <span className="lp-route-flag">
                {candidate.routed ? <Badge tone="new">ROUTED</Badge> : <Badge>standby</Badge>}
              </span>
            </div>
          );
        })}
      </div>

      <figcaption className="lp-route-foot">
        resolved in 64 ms · 1 of 55+ providers · failover armed
      </figcaption>
    </figure>
  );
}
