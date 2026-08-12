import type { ReactNode } from 'react';
import { Icon } from '../Icons';
import { Popover } from './Popover';

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
 * The filter trigger and its groups. Placement, portalling, and dismissal are
 * `Popover`'s job; this only says what a filter panel contains.
 */
export function FilterPopover({
  activeCount = 0,
  onClear,
  label = 'Filters',
  align = 'left',
  children,
}: FilterPopoverProps) {
  return (
    <Popover
      label={label}
      align={align}
      className="filter-pop-menu"
      triggerClassName={`btn filter-pop-trigger ${activeCount > 0 ? 'active' : ''}`.trim()}
      trigger={() => (
        <>
          <Icon.Filter size={14} />
          {label}
          {activeCount > 0 && <span className="filter-pop-count mono">{activeCount}</span>}
        </>
      )}
      foot={(close) => (
        <>
          <button
            type="button"
            className="filter-pop-clear"
            disabled={activeCount === 0}
            onClick={() => onClear?.()}
          >
            Clear filters
          </button>
          <button type="button" className="btn primary small" onClick={close}>
            Done
          </button>
        </>
      )}
    >
      {children}
    </Popover>
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
