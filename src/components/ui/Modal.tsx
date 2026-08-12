import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../Icons';

/**
 * The app's one dialog. Everything that needs a centred overlay (the project
 * wizard, the weekly deck) composes this rather than re-declaring a backdrop,
 * an Escape handler, and a header row.
 *
 * Renders nothing when closed, so callers can mount it unconditionally.
 */
export function Modal({
  open,
  onClose,
  title,
  sub,
  /** Sits between the head and the body: a `Stepper`, a toolbar, tabs. */
  nav,
  /** Rendered as the footer bar. Use `ModalFoot`. */
  foot,
  /** Names the dialog for screen readers when the title is not enough. */
  label,
  className = '',
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  sub?: ReactNode;
  nav?: ReactNode;
  foot?: ReactNode;
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={label ?? (typeof title === 'string' ? title : undefined)}
      onClick={onClose}
    >
      {/* The click that opened a menu inside the dialog must not close it. */}
      <div className={`modal ${className}`.trim()} onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <div>
            <h2 className="modal-title">{title}</h2>
            {sub && <p className="modal-sub dim">{sub}</p>}
          </div>
          <button className="btn ghost icon-only" aria-label="Close" onClick={onClose}>
            <Icon.X size={16} />
          </button>
        </header>

        {nav}

        <div className="modal-body">{children}</div>

        {foot}
      </div>
    </div>
  );
}

/** Footer bar: a summary line on the left, actions on the right. */
export function ModalFoot({ summary, children }: { summary?: ReactNode; children: ReactNode }) {
  return (
    <footer className="modal-foot">
      {summary && <span className="dim modal-foot-sum">{summary}</span>}
      <div className="modal-foot-actions">{children}</div>
    </footer>
  );
}

export type StepItem = { id: string; label: ReactNode };

/**
 * Numbered markers for a multi-part dialog.
 *
 * Without `onSelect` it is a progress readout for a wizard whose later steps are
 * not reachable yet. With it, every marker is a button and the row becomes page
 * tabs, for a deck where all the pages are already true.
 */
export function Stepper({
  steps,
  current,
  onSelect,
  /** Ticks completed markers instead of numbering them. Wizards only. */
  checkDone,
  label = 'Steps',
}: {
  steps: StepItem[];
  current: number;
  onSelect?: (index: number) => void;
  checkDone?: boolean;
  label?: string;
}) {
  return (
    <nav className="stepper" aria-label={label}>
      {steps.map((step, i) => {
        const state = `step ${i === current ? 'active' : ''} ${i < current ? 'done' : ''}`.trim();
        const marker = (
          <>
            <span className="step-dot">
              {checkDone && i < current ? <Icon.Check size={11} /> : i + 1}
            </span>
            <span className="step-label">{step.label}</span>
          </>
        );
        return onSelect ? (
          <button
            key={step.id}
            className={`${state} is-tab`}
            aria-current={i === current ? 'step' : undefined}
            onClick={() => onSelect(i)}
          >
            {marker}
          </button>
        ) : (
          <div key={step.id} className={state} aria-current={i === current ? 'step' : undefined}>
            {marker}
          </div>
        );
      })}
    </nav>
  );
}
