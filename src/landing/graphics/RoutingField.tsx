import { useEffect, useState } from 'react';
import { directProviders } from '../../data/catalog';

/**
 * The hero's centrepiece: one request fanning out to every candidate provider,
 * with packets running the wires continuously and the winning path lit. The
 * geometry is generated rather than drawn so the fan stays even, and the
 * latencies drift so the panel reads as live instrumentation rather than art.
 */

const NODES = [
  { id: 'helius', base: 64, routed: true },
  { id: 'quicknode', base: 71 },
  { id: 'alchemy', base: 78 },
  { id: 'infura', base: 92 },
  { id: 'ankr', base: 121 },
];

const W = 940;
const H = 460;
const OUT_X = 700;
const IN = { x: 96, y: H / 2 };

/** Even vertical fan on the right-hand side. */
const lanes = NODES.map((node, i) => {
  const y = 56 + i * ((H - 112) / (NODES.length - 1));
  return {
    ...node,
    y,
    // A flat-then-curve wire: it leaves the request horizontally, so the fan
    // reads as one signal splitting rather than five unrelated arcs.
    d: `M${IN.x},${IN.y} C${IN.x + 210},${IN.y} ${OUT_X - 230},${y} ${OUT_X},${y}`,
  };
});

export function RoutingField() {
  const [latency, setLatency] = useState(() => NODES.map((n) => n.base));

  // Small drift, so the readout is alive without ever changing which provider
  // wins. Frozen entirely when the visitor asks for reduced motion.
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      setLatency(NODES.map((n) => n.base + Math.round((Math.random() - 0.5) * 6)));
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="lp-field" aria-hidden>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="lp-field-svg">
        <defs>
          {lanes.map((lane) => (
            <path key={lane.id} id={`wire-${lane.id}`} d={lane.d} fill="none" />
          ))}
        </defs>

        {/* Wires */}
        {lanes.map((lane) => (
          <use
            key={lane.id}
            href={`#wire-${lane.id}`}
            className={`lp-wire ${lane.routed ? 'on' : ''}`.trim()}
          />
        ))}

        {/* Packets. The winning wire runs a tight train; the rest tick over. */}
        {lanes.map((lane, i) =>
          (lane.routed ? [0, 0.5, 1] : [i * 0.7]).map((delay, j) => (
            <circle key={`${lane.id}-${j}`} r={lane.routed ? 3.5 : 2.5} className={`lp-packet ${lane.routed ? 'on' : ''}`.trim()}>
              <animateMotion
                dur={lane.routed ? '1.5s' : '3.4s'}
                begin={`${delay}s`}
                repeatCount="indefinite"
                keyPoints="0;1"
                keyTimes="0;1"
                calcMode="spline"
                keySplines="0.4 0 0.2 1"
              >
                <mpath href={`#wire-${lane.id}`} />
              </animateMotion>
            </circle>
          )),
        )}

        {/* Request origin */}
        <g className="lp-node-in">
          <rect x={IN.x - 76} y={IN.y - 22} width={152} height={44} className="lp-node-box" />
          <text x={IN.x} y={IN.y + 4} textAnchor="middle" className="lp-node-label">
            /token/price
          </text>
        </g>

        {/* Provider terminals */}
        {lanes.map((lane, i) => {
          const provider = directProviders.find((p) => p.id === lane.id);
          return (
            <g key={lane.id} className={`lp-node-out ${lane.routed ? 'on' : ''}`.trim()}>
              <rect x={OUT_X} y={lane.y - 18} width={200} height={36} className="lp-node-box" />
              <text x={OUT_X + 14} y={lane.y + 4} className="lp-node-name">
                {provider?.name ?? lane.id}
              </text>
              <text x={OUT_X + 186} y={lane.y + 4} textAnchor="end" className="lp-node-ms">
                {latency[i]}ms
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
