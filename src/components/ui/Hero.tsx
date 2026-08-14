import type { ReactNode } from 'react';
import { Dither } from '../Dither';

type HeroProps = {
  /** Small mono line above the title. Usually a position marker: "Quickstart / 00-05". */
  eyebrow?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  /** Row of `.btn-blk` actions under the copy. */
  actions?: ReactNode;
  /** Drops the dither field, for a hero that already carries artwork. */
  plain?: boolean;
  className?: string;
};

/**
 * The screen-opening hero: eyebrow, display-size title, one paragraph, a row of
 * boxed mono actions, and the dither field drifting behind all of it.
 *
 * It exists because two screens need the same first impression for opposite
 * reasons. Quickstart opens on it because the project is new; Nodes opens on it
 * because the feature is switched off, and an empty state that is the *resting*
 * state of a screen deserves the same treatment as a first run, not a centred
 * icon and an apology. Anything that wants "this is the top of the screen"
 * composes this rather than growing a third hero.
 *
 * The dither is full-bleed and thins out in the shader's own coverage ramp, so
 * the copy sits in clear space without a CSS mask greying the ink.
 */
export function Hero({ eyebrow, title, sub, actions, plain, className = '' }: HeroProps) {
  return (
    <section className={`hero marks-4 ${className}`.trim()}>
      <div className="hero-inner">
        {eyebrow && <span className="eyebrow hero-eyebrow">{eyebrow}</span>}
        <h2 className="hero-title">{title}</h2>
        {sub && <p className="hero-sub">{sub}</p>}
        {actions && <div className="hero-actions">{actions}</div>}
      </div>
      {!plain && <Dither className="hero-dither" />}
    </section>
  );
}
