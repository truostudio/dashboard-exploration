import type { ReactNode } from 'react';

/**
 * A full-bleed section with a capped inner column. Bands are separated by a
 * hairline rather than whitespace alone, matching how the dashboard divides
 * its own regions.
 */
export function Band({
  id,
  className = '',
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`lp-band ${className}`.trim()}>
      <div className="lp-inner">{children}</div>
    </section>
  );
}

/** Eyebrow + title + lede, with an optional right-hand action on wide screens. */
export function BandHead({
  eyebrow,
  title,
  lede,
  actions,
  wide,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  /** Lets the title run to 28ch instead of 20ch. */
  wide?: boolean;
}) {
  const head = (
    <>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className={`lp-title ${wide ? 'lp-title-wide' : ''}`.trim()}>{title}</h2>
      {lede && <p className="lp-lede">{lede}</p>}
    </>
  );

  if (!actions) {
    return (
      <header className="lp-head" data-reveal>
        {head}
      </header>
    );
  }

  return (
    <header className="lp-head lp-head-split" data-reveal>
      <div>{head}</div>
      <div className="lp-head-actions">{actions}</div>
    </header>
  );
}
