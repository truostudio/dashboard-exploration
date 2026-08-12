import { Icon } from './Icons';
import { Meter, NavList, NavRow } from './ui';
import type { ViewId } from '../App';

export type Step = {
  id: string;
  label: string;
  description: string;
  done: boolean;
  cta: { label: string; target: ViewId };
};

type Props = {
  steps: Step[];
  onNavigate: (id: ViewId) => void;
  onDismiss: () => void;
  /**
   * `rail` is the narrow-column build: the progress bar moves under the
   * heading, step descriptions drop, and the CTA collapses to the row itself.
   * Same checklist, ~320px of room instead of the full content width.
   */
  variant?: 'panel' | 'rail';
};

export function GetStarted({ steps, onNavigate, onDismiss, variant = 'panel' }: Props) {
  const done = steps.filter((s) => s.done).length;
  const pct = Math.round((done / steps.length) * 100);
  const rail = variant === 'rail';

  return (
    <section className={`getstarted ${rail ? 'is-rail' : ''}`.trim()} aria-label="Get started">
      <header className="getstarted-head">
        <div>
          <h2 className="panel-title">Get started with Uniblock</h2>
          <p className="panel-sub dim">
            {rail ? (
              <><span className="mono">{done} of {steps.length}</span> steps complete</>
            ) : (
              <><span className="mono">{done} of {steps.length}</span> steps complete · most teams finish in under five minutes</>
            )}
          </p>
        </div>
        <div className="getstarted-head-right">
          {!rail && <span className="mono dim">{pct}%</span>}
          <div className="qs-bar-wide">
            <Meter value={pct} size="sm" />
          </div>
          {!rail && (
            <button className="btn ghost icon-only" aria-label="Dismiss" onClick={onDismiss}>
              <Icon.X size={14} />
            </button>
          )}
        </div>
        {rail && (
          <button className="btn ghost icon-only getstarted-dismiss" aria-label="Dismiss" onClick={onDismiss}>
            <Icon.X size={14} />
          </button>
        )}
      </header>

      {rail ? (
        /* The whole row is the target here: a 300px column has no space for a
           label and a button that both mean "go do this". */
        <NavList className="getstarted-rows">
          {steps.map((s, i) => (
            <NavRow
              key={s.id}
              dense
              className={s.done ? 'is-done' : ''}
              icon={
                <span className={`gs-marker ${s.done ? 'done' : ''}`.trim()}>
                  {s.done ? <Icon.Check size={12} /> : <span className="mono">{i + 1}</span>}
                </span>
              }
              title={s.label}
              onClick={() => onNavigate(s.cta.target)}
            />
          ))}
        </NavList>
      ) : (
        <ol className="getstarted-list">
          {steps.map((s, i) => (
            <li key={s.id} className={`gs-step ${s.done ? 'done' : ''}`}>
              <span className="gs-marker" aria-hidden>
                {s.done ? <Icon.Check size={12} /> : <span className="mono">{i + 1}</span>}
              </span>
              <div className="gs-text">
                <span className="gs-label">{s.label}</span>
                <span className="gs-desc dim">{s.description}</span>
              </div>
              <button
                className={`btn ${s.done ? 'ghost' : ''}`}
                onClick={() => onNavigate(s.cta.target)}
              >
                {s.done ? 'Review' : s.cta.label}
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
