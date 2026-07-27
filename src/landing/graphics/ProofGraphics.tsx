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

const MESH = directProviders.filter((p) => p.icon).slice(0, 24);

export function ProviderMesh() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setActive((i) => (i + 1) % MESH.length), 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pg pg-mesh">
      <div className="pg-mesh-grid">
        {MESH.map((provider, i) => (
          <span
            key={provider.id}
            className={`pg-mesh-cell ${i === active ? 'on' : ''}`.trim()}
            title={provider.name}
          >
            <Avatar src={provider.icon} name={provider.name} size="md" />
          </span>
        ))}
      </div>
      <div className="pg-foot">
        <span className="pg-foot-live">
          <i /> HEALTH SCAN
        </span>
        <span>{MESH.length} of 55+ shown · all operational</span>
      </div>
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

export function RouteRace() {
  return (
    <div className="pg pg-race">
      <div className="pg-race-head">
        <span>Provider</span>
        <span>Latency</span>
        <span>Cost</span>
        <span>Reliability</span>
        <span />
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
              <span key={j} className="pg-score" aria-hidden>
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
      <div className="pg-foot">
        <span className="pg-foot-live">
          <i /> SCORED PER REQUEST
        </span>
        <span>hedged if the winner slows</span>
      </div>
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
    <div className="pg pg-bill">
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
            <img src="/assets/icons/providers/Uniblock.webp" alt="" className="avatar-art avatar-sm" />
            <span>Uniblock</span>
            <span className="pg-bill-amt">$4,225.00</span>
          </li>
        </ul>
        <span className="pg-bill-note on">1 invoice · 1 relationship</span>
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
      <div className="pg-foot">
        <span>p99 latency under sustained load</span>
      </div>
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
