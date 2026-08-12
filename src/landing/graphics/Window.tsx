import type { CSSProperties, ReactNode } from 'react';

/**
 * A block on the page, in one of two weights.
 *
 * This was a mock application window, title bar, index badge, blinking
 * caret, traffic-light dots. Imitating OS chrome is a costume, not a design:
 * the dots did nothing, so they were decoration pretending to be interface.
 *
 * What replaced it is the part that was actually doing work, a figure
 * caption. A graphic without a line saying what it shows is naked, but the
 * line should be an explanation, not a fake window frame. `panel` draws a box
 * and captions its contents; `flat` is prose, which needs neither.
 */
export type WinVariant = 'panel' | 'flat';

export function Win({
  title,
  caption,
  label,
  meta,
  w,
  variant = 'panel',
  className = '',
  bare = false,
  children,
}: {
  /** What the graphic is, in a few words. Sentence case, not mono. */
  title?: ReactNode;
  /** One line saying what it shows and why it is here. */
  caption?: ReactNode;
  /** Mono footnote, set left, units, source, state. */
  label?: ReactNode;
  /** Mono footnote, set right. */
  meta?: ReactNode;
  /** Width in square modules. Height is the content's. */
  w: number;
  variant?: WinVariant;
  className?: string;
  /** Drops the body's own padding, for blocks whose content is a lattice. */
  bare?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`win win-${variant} ${className}`.trim()}
      style={{ '--w': w } as CSSProperties}
    >
      {(title || caption) && (
        <header className="win-cap">
          {title && <h3 className="win-cap-title">{title}</h3>}
          {caption && <p className="win-cap-text">{caption}</p>}
        </header>
      )}

      <div className={`win-body ${bare ? 'bare' : ''}`.trim()}>{children}</div>

      {variant === 'panel' && (label || meta) && (
        <footer className="win-status">
          <span>{label}</span>
          <span>{meta}</span>
        </footer>
      )}
    </section>
  );
}
