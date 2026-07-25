import type { ReactNode } from 'react';

type PanelProps = {
  children: ReactNode;
  /**
   * Registration brackets. Every panel carries all four by default so the
   * containers read as instrument housings rather than plain boxes; pass
   * `false` for a nested panel that would otherwise double up.
   */
  marks?: boolean | 4;
  /** Removes padding so a table or list can meet the panel edge. */
  flush?: boolean;
  className?: string;
  /** Anchor target, for in-page links. */
  id?: string;
};

export function Panel({ children, marks = 4, flush, className = '', id }: PanelProps) {
  const tick = marks === 4 ? 'marks-4' : marks ? 'marks' : '';
  return (
    <article id={id} className={`panel ${tick} ${flush ? 'panel-flush' : ''} ${className}`.trim()}>
      {children}
    </article>
  );
}

type PanelHeadProps = {
  title: ReactNode;
  eyebrow?: ReactNode;
  sub?: ReactNode;
  /** Right-hand slot: buttons, badges, a Segmented control. */
  actions?: ReactNode;
  /** Adds padding back when the panel itself is flush. */
  inset?: boolean;
};

export function PanelHead({ title, eyebrow, sub, actions, inset }: PanelHeadProps) {
  return (
    <header className={`panel-head ${inset ? 'panel-head-inset' : ''}`.trim()}>
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="panel-title">{title}</h2>
        {sub && <p className="panel-sub dim">{sub}</p>}
      </div>
      {actions}
    </header>
  );
}

/** Panel + PanelHead in one, for the common case. */
export function TitledPanel({
  title,
  eyebrow,
  sub,
  actions,
  marks = 4,
  flush,
  className,
  id,
  children,
}: PanelProps & PanelHeadProps) {
  return (
    <Panel marks={marks} flush={flush} className={className} id={id}>
      <PanelHead title={title} eyebrow={eyebrow} sub={sub} actions={actions} inset={flush} />
      {children}
    </Panel>
  );
}
