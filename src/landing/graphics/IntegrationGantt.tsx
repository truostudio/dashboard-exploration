import type { CSSProperties } from 'react';
import { integration } from '../content/home';

/**
 * The Framer version of this was a bar chart. Rebuilt as a two-row gantt on a
 * shared 0H–2H axis, so the comparison is read off one scale rather than two
 * separately-scaled bars.
 */
export function IntegrationGantt() {
  const { chartTitle, bars, ticks } = integration;

  return (
    <figure className="lp-gantt">
      <figcaption className="lp-gantt-title">{chartTitle}</figcaption>

      {bars.map((bar, i) => (
        <div key={bar.id} className={`lp-gantt-row ${bar.id === 'uniblock' ? 'on' : ''}`.trim()}>
          <div className="lp-gantt-label">
            <span>{bar.label}</span>
            <span className="lp-gantt-val">{bar.value}</span>
          </div>
          <div className="lp-gantt-track">
            <div
              className="lp-gantt-fill"
              style={{ width: `${bar.share}%`, '--d': `${i * 0.14}s` } as CSSProperties}
            />
          </div>
        </div>
      ))}

      <div className="lp-gantt-axis" aria-hidden>
        {ticks.map((tick, i) => (
          <span
            key={tick}
            className="lp-gantt-tick"
            style={{ left: `${(i / (ticks.length - 1)) * 100}%` }}
          >
            {tick}
          </span>
        ))}
      </div>
    </figure>
  );
}
