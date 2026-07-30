import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Icon } from '../../components/Icons';
import { Avatar } from '../../components/ui';
import { directProviders } from '../../data/catalog';

/**
 * One demonstration per claim. These replace the identical feature cards the
 * page used to run: each argument now has a visual that shows the thing rather
 * than a paragraph that asserts it.
 */

/* ============================================================
   "Infrastructure, orchestrated for you"
   A mesh of every provider, with the health scan running across it.
   ============================================================ */

/* Eight bricks per course, so the count has to be a multiple of eight or the
   wall ends ragged — which is the whole point of building it out of blocks. */
const MESH = directProviders.filter((p) => p.icon);

/**
 * The scan does not walk the mesh in reading order — a left-to-right sweep
 * looks like a loading bar. It hops, the way a health check polls.
 */
export function ProviderMesh({ cols = 7, rows = 2 }: { cols?: number; rows?: number }) {
  const count = cols * rows;
  const bricks = MESH.slice(0, count);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(
      () => setActive((i) => (i + 5) % count),
      760,
    );
    return () => clearInterval(id);
  }, [count]);

  return (
    <div className="lp-lattice" style={{ '--cols': cols } as CSSProperties}>
      {bricks.map((provider, i) => (
        <span
          key={provider.id}
          className={`lp-brick pg-mesh-cell ${i === active ? 'on' : ''}`.trim()}
          style={{ '--i': (i % cols) + Math.floor(i / cols) } as CSSProperties}
          title={provider.name}
        >
          <Avatar src={provider.icon} name={provider.name} size="md" />
        </span>
      ))}
    </div>
  );
}

/* ============================================================
   "Route every request with intent"
   The scoring that picks a provider, shown as it happens.
   ============================================================ */

const RACE = [
  { id: 'helius', latency: 92, cost: 78, reliability: 96, won: true },
  { id: 'quicknode', latency: 84, cost: 61, reliability: 93 },
  { id: 'alchemy', latency: 77, cost: 55, reliability: 95 },
  { id: 'ankr', latency: 48, cost: 88, reliability: 81 },
];

/* Once the row stacks there are no column headers left to tell the three bars
   apart, so each metric carries a hue and the head becomes its key. */
const METRICS = ['latency', 'cost', 'reliability'] as const;

/**
 * With the window focused the scores re-run, so you watch the decision being
 * made rather than reading its result. Keying the wrapper on `on` remounts the
 * bars, which restarts their fill animation from zero — no state needed, and
 * no effect that writes state during render.
 */
export function RouteRace({ on = false }: { on?: boolean }) {
  return (
    <div className="pg-race" key={on ? 'scoring' : 'idle'}>
      <div className="pg-race-head">
        <span className="pg-race-head-name">Provider</span>
        {METRICS.map((metric) => (
          <span key={metric} className={`pg-race-key pg-metric-${metric}`}>
            {metric}
          </span>
        ))}
        <span className="pg-race-head-pad" />
      </div>
      {RACE.map((row, i) => {
        const provider = directProviders.find((p) => p.id === row.id);
        return (
          <div key={row.id} className={`pg-race-row ${row.won ? 'on' : ''}`.trim()}>
            <span className="pg-race-name">
              <Avatar src={provider?.icon} name={provider?.name ?? row.id} size="sm" />
              {provider?.name ?? row.id}
            </span>
            {[row.latency, row.cost, row.reliability].map((score, j) => (
              <span key={j} className={`pg-score pg-metric-${METRICS[j]}`} aria-hidden>
                <span
                  className="pg-score-fill"
                  style={{ width: `${score}%`, '--d': `${(i * 3 + j) * 0.05}s` } as CSSProperties}
                />
              </span>
            ))}
            <span className="pg-race-flag">{row.won ? 'SELECTED' : ''}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   "Unified billing across every provider"
   Five invoices become one.
   ============================================================ */

const BILLS = [
  { id: 'alchemy', amount: '$1,240.00' },
  { id: 'infura', amount: '$860.00' },
  { id: 'quicknode', amount: '$1,015.00' },
  { id: 'ankr', amount: '$420.00' },
  { id: 'helius', amount: '$690.00' },
];

export function BillingSplit() {
  return (
    <div className="pg-bill-wrap">
      <div className="pg-bill">
        <div className="pg-bill-side">
          <span className="pg-bill-label">Before</span>
          <ul className="pg-bill-list">
            {BILLS.map((bill) => {
              const provider = directProviders.find((p) => p.id === bill.id);
              return (
                <li key={bill.id} className="pg-bill-row struck">
                  <Avatar src={provider?.icon} name={provider?.name ?? bill.id} size="sm" />
                  <span>{provider?.name ?? bill.id}</span>
                  <span className="pg-bill-amt">{bill.amount}</span>
                </li>
              );
            })}
          </ul>
          <span className="pg-bill-note">5 invoices · 5 contracts</span>
        </div>

        <span className="pg-bill-arrow" aria-hidden>
          <Icon.Chevron size={18} />
        </span>

        <div className="pg-bill-side">
          <span className="pg-bill-label on">After</span>
          <ul className="pg-bill-list">
            <li className="pg-bill-row total">
              <Avatar src="/assets/icons/providers/Uniblock.webp" name="Uniblock" size="sm" />
              <span>Uniblock</span>
              <span className="pg-bill-amt">$4,225.00</span>
            </li>
          </ul>
          <span className="pg-bill-note on">1 invoice · 1 relationship</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Full-stack row diagrams
   ============================================================ */

/** Dedicated nodes: shared traffic jitters, dedicated capacity holds steady. */
export function CapacityBars() {
  return (
    <div className="pg pg-cap">
      <div className="pg-cap-row">
        <span className="pg-cap-label">Shared</span>
        <span className="pg-cap-track">
          {[62, 88, 41, 95, 55, 78, 34, 90, 47, 83].map((h, i) => (
            <i key={i} style={{ height: `${h}%`, '--d': `${i * 0.08}s` } as CSSProperties} />
          ))}
        </span>
      </div>
      <div className="pg-cap-row on">
        <span className="pg-cap-label">Dedicated</span>
        <span className="pg-cap-track">
          {[72, 74, 71, 73, 72, 74, 72, 73, 71, 73].map((h, i) => (
            <i key={i} style={{ height: `${h}%`, '--d': `${i * 0.08}s` } as CSSProperties} />
          ))}
        </span>
      </div>
      {/* No footer here: the block it sits in already carries the label, and
          printing it twice was the graphic and its container disagreeing about
          whose job that is. */}
    </div>
  );
}

/** MCP: an agent reaching onchain state through one governed interface. */
export function AgentFlow() {
  return (
    <div className="pg pg-flow">
      {[
        { label: 'Agent', sub: 'tool call', icon: 'Beaker' as const },
        { label: 'Uniblock MCP', sub: 'one interface', icon: 'Code' as const, on: true },
        { label: 'Onchain state', sub: '300+ chains', icon: 'Tx' as const },
      ].map((stage, i) => {
        const I = Icon[stage.icon];
        return (
          <span key={stage.label} className={`pg-flow-stage ${stage.on ? 'on' : ''}`.trim()}>
            <I size={16} />
            <b>{stage.label}</b>
            <em>{stage.sub}</em>
            {i < 2 && <span className="pg-flow-link" aria-hidden />}
          </span>
        );
      })}
    </div>
  );
}

/** Webhooks: four provider event shapes collapsing into one payload. */
export function EventNormalize() {
  return (
    <div className="pg pg-norm">
      <div className="pg-norm-in">
        {['alchemy.tx', 'moralis.transfer', 'helius.swap', 'ankr.log'].map((event) => (
          <span key={event} className="pg-norm-chip">
            {event}
          </span>
        ))}
      </div>
      <span className="pg-norm-rail" aria-hidden />
      <div className="pg-norm-out">
        <span className="pg-norm-chip on">uniblock.event</span>
        <span className="pg-norm-sig">signed · retried · versioned</span>
      </div>
    </div>
  );
}
