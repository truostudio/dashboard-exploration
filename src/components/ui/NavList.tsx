import type { ReactNode } from 'react';
import { Icon } from '../Icons';

/**
 * A stack of rows that go somewhere: leading mark, title, optional second
 * line, optional right-hand figure, chevron. Settings' project actions, the
 * overview's API ledger, and the onboarding checklist are all this row, so it
 * is declared once and varied by prop rather than re-cut per view.
 */
export function NavList({
  /** Draws a border around the stack, for a list that is not inside a panel edge. */
  boxed,
  className = '',
  children,
}: {
  boxed?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <ul className={`nav-list ${boxed ? 'is-boxed' : ''} ${className}`.trim()}>{children}</ul>
  );
}

export function NavRow({
  /** Leading square: an icon, a step marker, an avatar. */
  icon,
  title,
  sub,
  /** Right-hand figure, before the chevron. Mono by default. */
  meta,
  onClick,
  /** Tints the icon tile. `danger` is for destructive rows. */
  tone = 'neutral',
  /**
   * Rail build: micro title, no tile chrome on the mark, tighter rhythm and no
   * hover fill, for a list inside a card rather than across a panel.
   */
  dense,
  className = '',
}: {
  icon?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  meta?: ReactNode;
  onClick?: () => void;
  tone?: 'neutral' | 'brand' | 'danger';
  dense?: boolean;
  className?: string;
}) {
  return (
    <li className="nav-list-item">
      <button
        type="button"
        className={`nav-row ${dense ? 'is-dense' : ''} ${className}`.trim()}
        onClick={onClick}
      >
        {icon && <span className={`nav-row-mark is-${tone}`} aria-hidden>{icon}</span>}
        <span className="nav-row-text">
          <span className="nav-row-title">{title}</span>
          {sub && <span className="nav-row-sub dim">{sub}</span>}
        </span>
        {meta && <span className="mono dim nav-row-meta">{meta}</span>}
        <Icon.Chevron size={dense ? 13 : 15} className="nav-row-go" />
      </button>
    </li>
  );
}
