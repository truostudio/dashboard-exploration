import type { ReactNode } from 'react';
import { Icon } from '../Icons';

type ViewToolbarProps = {
  /** Left slot. A string renders as the standard title + count pair. */
  title?: ReactNode;
  count?: ReactNode;
  /** Replaces the title block entirely (e.g. a Segmented control). */
  lead?: ReactNode;
  children?: ReactNode;
  className?: string;
};

/** The bar that sits above a view's content: identity on the left, controls on the right. */
export function ViewToolbar({ title, count, lead, children, className = '' }: ViewToolbarProps) {
  return (
    <div className={`view-toolbar ${className}`.trim()}>
      {lead ?? (
        <div className="ep-head-left">
          {title && <h2 className="panel-title">{title}</h2>}
          {count != null && <span className="ep-count dim">{count}</span>}
        </div>
      )}
      {children && <div className="ep-controls">{children}</div>}
    </div>
  );
}

type SectionHeaderProps = {
  title: ReactNode;
  meta?: ReactNode;
  /** Tightens the top margin when the header opens a section. */
  lead?: boolean;
};

export function SectionHeader({ title, meta, lead }: SectionHeaderProps) {
  return (
    <div className={`section-row ${lead ? 'section-row-lead' : ''}`.trim()}>
      <h3 className="section-h">{title}</h3>
      {meta != null && <span className="dim mono section-meta">{meta}</span>}
    </div>
  );
}

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  /** Constrained width for view toolbars; omit to fill its container. */
  compact?: boolean;
  /** Trailing slot, used for the ⌘K hint in the topbar. */
  hint?: ReactNode;
  grow?: boolean;
};

export function SearchInput({
  value,
  onChange,
  placeholder,
  label,
  compact,
  hint,
  grow,
}: SearchInputProps) {
  return (
    <div className={`tb-search ${compact ? 'small' : ''} ${grow ? 'grow' : ''}`.trim()}>
      <Icon.Search size={14} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
      />
      {hint}
    </div>
  );
}
