import type { CSSProperties } from 'react';
import { infra } from '../content/home';

/**
 * Ninety days of uptime, one column per day.
 *
 * This replaces a square ring gauge showing a single number. A ring is a
 * dashboard ornament: it states 99.99% without showing anything. A status
 * strip is the terminal form of the same claim, you can see where the
 * degradations were, how rare they are, and that the record is continuous.
 * Same component grammar as the provider mesh: a real data surface inside a
 * panel, not a graphic standing in for one.
 */

/** Deterministic, so the strip is the same story on every render. */
const DAYS = Array.from({ length: 90 }, (_, i) => {
  const wobble = Math.sin(i * 2.7) * Math.cos(i * 1.31);
  if (i === 23 || i === 61) return 99.2 + wobble * 0.1; // two real dips
  if (i === 24) return 99.87;
  return 99.97 + Math.abs(wobble) * 0.03;
});

export function UptimeStrip() {
  const worst = Math.min(...DAYS);

  return (
    <div className="up">
      <div className="up-read">
        <span className="up-num">{infra.uptime}</span>
        <span className="up-unit">{infra.uptimeCaption}</span>
      </div>

      <div className="up-strip">
        {DAYS.map((v, i) => (
          <i
            key={i}
            className={v < 99.9 ? 'down' : ''}
            style={{ '--h': `${((v - 99) / 1) * 100}%` } as CSSProperties}
            title={`Day ${90 - i}: ${v.toFixed(2)}%`}
          />
        ))}
      </div>

      <div className="up-axis">
        <span>90 days ago</span>
        <span>worst day {worst.toFixed(2)}%</span>
        <span>today</span>
      </div>
    </div>
  );
}
