import { useEffect, useState } from 'react';
import { useVisible } from './terminal';
import { directProviders } from '../../data/catalog';

/**
 * `tail -f` on the routing layer.
 *
 * The page claims Uniblock scores every request and routes it to the best
 * provider. Every other graphic here asserts that with a diagram; this one
 * just shows the traffic. Lines append at a plausible request rate, the
 * winner is named, and roughly one in nine hedges — so the motion is the
 * argument rather than decoration on top of it.
 */

/** The same endpoint names the explorer above lists, so the tail reads as
 *  traffic against that surface rather than a separate invented vocabulary. */
const ROUTES = [
  'market-data/token-price',
  'market-data/token-market-cap',
  'market-data/token-24-hour-volume',
  'market-data/trending-tokens',
  'nft/nft-metadata',
  'nft/collection-floor-prices',
  'scan/address-transactions',
  'scan/gas-price-tiers',
  'token/address-token-balances',
  'token/token-usd-price',
];

const NAMES = directProviders
  .filter((p) => p.icon)
  .slice(0, 8)
  .map((p) => p.name.toLowerCase().replace(/\s+/g, ''));

const CHAINS = ['ethereum', 'solana', 'base', 'arbitrum', 'hyperliquid', 'polygon'];

const ROWS = 9;
/** Anything at or above this is drawn as a full-width latency bar. */
const MS_CEIL = 140;

type Line = {
  key: number;
  at: string;
  route: string;
  chain: string;
  provider: string;
  ms: number;
  hedged: boolean;
};

let seq = 0;

function makeLine(): Line {
  const now = new Date();
  const at =
    `${String(now.getHours()).padStart(2, '0')}:` +
    `${String(now.getMinutes()).padStart(2, '0')}:` +
    `${String(now.getSeconds()).padStart(2, '0')}.` +
    `${String(now.getMilliseconds()).padStart(3, '0')}`;

  return {
    key: seq++,
    at,
    route: ROUTES[Math.floor(Math.random() * ROUTES.length)],
    chain: CHAINS[Math.floor(Math.random() * CHAINS.length)],
    provider: NAMES[Math.floor(Math.random() * NAMES.length)],
    ms: 41 + Math.floor(Math.random() * 96),
    hedged: Math.random() < 0.11,
  };
}

export function LogStream({ on = false }: { on?: boolean }) {
  const [ref, seen] = useVisible<HTMLDivElement>();
  const [lines, setLines] = useState<Line[]>(() =>
    Array.from({ length: ROWS }, makeLine),
  );

  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    // Slightly irregular, because a perfectly metronomic log reads as fake.
    let id: number;
    const tick = () => {
      setLines((prev) => [...prev.slice(1), makeLine()]);
      id = window.setTimeout(tick, 380 + Math.random() * 520);
    };
    id = window.setTimeout(tick, 400);
    return () => window.clearTimeout(id);
  }, [seen]);

  return (
    <div className={`log ${on ? 'on' : ''}`.trim()} ref={ref}>
      {lines.map((line, i) => (
        <div
          key={line.key}
          className="log-line"
          // Older lines fade toward the top of the buffer.
          style={{ opacity: 0.25 + (i / (ROWS - 1)) * 0.75 }}
        >
          <span className="log-at">{line.at}</span>
          <span className="log-verb">GET</span>
          <span className="log-route">{line.route}</span>
          <span className="log-chain">{line.chain}</span>
          <span className="log-prov">{line.provider}</span>
          {/* The latency, drawn as well as printed — the strip is wide, so it
              may as well carry the shape of the distribution. */}
          <span className="log-bar" aria-hidden>
            <i style={{ width: `${Math.min(100, (line.ms / MS_CEIL) * 100)}%` }} />
          </span>
          <span className="log-ms">{line.ms}ms</span>
          <span className={`log-flag ${line.hedged ? 'hedge' : ''}`.trim()}>
            {line.hedged ? 'HEDGED' : 'OK'}
          </span>
        </div>
      ))}
    </div>
  );
}
