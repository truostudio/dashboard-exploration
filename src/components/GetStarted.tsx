import { Icon } from './Icons';
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
};

export function GetStarted({ steps, onNavigate, onDismiss }: Props) {
  const done = steps.filter((s) => s.done).length;
  const pct = Math.round((done / steps.length) * 100);

  return (
    <section className="getstarted" aria-label="Get started">
      <header className="getstarted-head">
        <div>
          <h2 className="panel-title">Get started with Uniblock</h2>
          <p className="panel-sub dim">
            <span className="mono">{done} of {steps.length}</span> steps complete · most teams finish in under five minutes
          </p>
        </div>
        <div className="getstarted-head-right">
          <span className="mono dim" style={{ fontSize: 12 }}>{pct}%</span>
          <div className="qs-bar wide" aria-hidden>
            <div className="qs-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <button className="btn ghost icon-only" aria-label="Dismiss" onClick={onDismiss}>
            <Icon.X size={14} />
          </button>
        </div>
      </header>

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
    </section>
  );
}
