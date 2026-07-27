import type { CSSProperties, ReactNode } from 'react';

/**
 * Infinite horizontal scroll. The children are rendered twice and the track is
 * translated by exactly half its width, so the loop has no seam. The duplicate
 * is hidden from assistive tech.
 */
export function Marquee({
  children,
  reverse,
  duration = 48,
  className = '',
}: {
  children: ReactNode;
  reverse?: boolean;
  /** Seconds for one full pass. Longer is calmer. */
  duration?: number;
  className?: string;
}) {
  return (
    <div className={`lp-marquee ${className}`.trim()}>
      <div
        className={`lp-marquee-track ${reverse ? 'rev' : ''}`.trim()}
        style={{ '--dur': `${duration}s` } as CSSProperties}
      >
        <div className="lp-marquee-group">{children}</div>
        <div className="lp-marquee-group" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
