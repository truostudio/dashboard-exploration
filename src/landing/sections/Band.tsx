import type { ReactNode } from 'react';

/**
 * A full-bleed section with a capped inner column. Bands are separated by a
 * hairline drawn on the container box rather than a border on the section, so
 * the rule obeys the same measure as everything else on the page.
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

/**
 * The section divider: a dither field.
 *
 * This replaces a strip of mono chrome — `04 · THE FULL STACK · 3 LAYERS` —
 * that announced three things nobody asked for and coloured one of them.
 *
 * What replaced it was a ticked scale bar, which was still just an unrounded
 * hairline used as ornament. This is a dither field instead: the section
 * number set oversized in the pixel face, and a band of ordered dither
 * thinning out across the measure beside it. Dither is the identity, so the
 * seam between two sections is made of it rather than of a drawn line.
 */
export function SectionRule({ index }: { index: string }) {
  return (
    <div className="lp-divider" aria-hidden>
      <span className="lp-divider-num">{index}</span>
      <span className="lp-divider-field dither" />
    </div>
  );
}

/** Title + lede, with an optional right-hand action on wide screens. */
export function BandHead({
  title,
  lede,
  actions,
  wide,
}: {
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  /** Lets the title run to 28ch instead of 20ch. */
  wide?: boolean;
}) {
  const head = (
    <>
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
