import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../Icons';

type FilterPopoverProps = {
  /** Number of active filter selections. Shown as a badge and drives the Clear button. */
  activeCount?: number;
  /** Resets every filter group in one action. Omit if the caller has nothing to clear. */
  onClear?: () => void;
  label?: string;
  align?: 'left' | 'right';
  children: ReactNode;
};

/**
 * Self-contained filter trigger + dropdown. Follows the same anchored-menu
 * recipe as the project switcher and WebSocket provider select: a relative
 * wrapper, an absolutely positioned panel, and a full-screen transparent
 * backdrop that closes it on outside click. Escape closes it too.
 */
export function FilterPopover({ activeCount = 0, onClear, label = 'Filters', align = 'left', children }: FilterPopoverProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="filter-pop">
      <button
        type="button"
        className={`btn filter-pop-trigger ${activeCount > 0 ? 'active' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <Icon.Filter size={14} />
        {label}
        {activeCount > 0 && <span className="filter-pop-count mono">{activeCount}</span>}
      </button>

      {open && (
        <div className={`filter-pop-menu ${align === 'right' ? 'right' : ''}`.trim()} role="dialog" aria-label={label}>
          <div className="filter-pop-body">{children}</div>
          <div className="filter-pop-foot">
            <button
              type="button"
              className="filter-pop-clear"
              disabled={activeCount === 0}
              onClick={() => onClear?.()}
            >
              Clear filters
            </button>
            <button type="button" className="btn primary small" onClick={() => setOpen(false)}>
              Done
            </button>
          </div>
        </div>
      )}
      {open && <div className="filter-pop-backdrop" onClick={() => setOpen(false)} />}
    </div>
  );
}

type FilterGroupProps = {
  label: string;
  children: ReactNode;
};

/** One labelled row of chip toggles inside a FilterPopover. */
export function FilterGroup({ label, children }: FilterGroupProps) {
  return (
    <div className="filter-pop-group">
      <span className="filter-pop-label mono dim">{label}</span>
      <div className="filter-pop-chips">{children}</div>
    </div>
  );
}
